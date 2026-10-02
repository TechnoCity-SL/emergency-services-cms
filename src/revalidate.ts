import type { Core } from '@strapi/strapi';

/**
 * Tells the website to regenerate its static pages whenever published content changes.
 *
 * The website (emergency-services) serves prerendered pages and only reads from this CMS when
 * POST {WEBSITE_URL}/api/revalidate is called. This module makes that call automatically:
 *   - on publish / unpublish / delete of any site content type,
 *   - on update of content types without Draft & Publish (their edits are live immediately),
 *   - on media library updates (replacing an image file keeps its entry but changes the URL).
 * Draft saves are ignored — the public site only ever shows published content.
 *
 * Events are debounced so a bulk publish triggers a single regeneration. After the website
 * confirms, each returned page is requested once so the next visitor gets the fresh version.
 *
 * Configure with env vars (Fly secrets):
 *   WEBSITE_URL        e.g. https://farzancare.com
 *   REVALIDATE_SECRET  same value as the website's REVALIDATE_SECRET
 */

const DEBOUNCE_MS = 3_000;
const MAX_ATTEMPTS = 3;

const ALWAYS = new Set(['entry.publish', 'entry.unpublish', 'entry.delete', 'media.update', 'media.delete']);

interface EventPayload {
  uid?: string;
  model?: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function registerWebsiteRevalidation(strapi: Core.Strapi) {
  const websiteUrl = process.env.WEBSITE_URL?.replace(/\/$/, '');
  const secret = process.env.REVALIDATE_SECRET;
  if (!websiteUrl || !secret) {
    strapi.log.warn('[revalidate] WEBSITE_URL or REVALIDATE_SECRET not set — website will not auto-update.');
    return;
  }

  let timer: NodeJS.Timeout | null = null;
  const pending = new Map<string, string>(); // model → last event

  const shouldTrigger = (event: string, payload: EventPayload) => {
    if (event.startsWith('media.')) return ALWAYS.has(event);
    if (!payload.uid?.startsWith('api::')) return false; // ignore admin/users/plugins
    if (ALWAYS.has(event)) return true;
    if (event === 'entry.update' || event === 'entry.create') {
      const model = strapi.getModel(payload.uid as Parameters<typeof strapi.getModel>[0]);
      return model?.options?.draftAndPublish === false;
    }
    return false;
  };

  const warm = async (paths: string[]) => {
    await Promise.allSettled(
      paths.map((path) => fetch(`${websiteUrl}${path}`, { signal: AbortSignal.timeout(30_000) })),
    );
  };

  const flush = async () => {
    timer = null;
    const changes = Object.fromEntries(pending);
    pending.clear();
    const models = Object.keys(changes);

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(`${websiteUrl}/api/revalidate`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: models.join(','), event: Object.values(changes).join(',') }),
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) throw new Error(`website responded ${response.status}`);
        const result = (await response.json()) as { paths?: string[] };
        strapi.log.info(`[revalidate] website regenerating after changes to: ${models.join(', ')}`);
        // Two passes: the first visit serves the old page and triggers regeneration in the
        // background; the second (a few seconds later) confirms the fresh page is cached.
        const paths = result.paths ?? [];
        await warm(paths);
        await sleep(5_000);
        await warm(paths);
        return;
      } catch (error) {
        strapi.log.warn(`[revalidate] attempt ${attempt}/${MAX_ATTEMPTS} failed: ${(error as Error).message}`);
        if (attempt < MAX_ATTEMPTS) await sleep(2_000 * attempt);
      }
    }
    strapi.log.error('[revalidate] giving up — publish again or redeploy the website to pick up changes.');
  };

  strapi.eventHub.subscribe(async (event: string, payload: EventPayload = {}) => {
    if (!shouldTrigger(event, payload)) return;
    pending.set(payload.model ?? payload.uid ?? 'media', event);
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void flush(), DEBOUNCE_MS);
  });

  strapi.log.info(`[revalidate] website auto-regeneration enabled → ${websiteUrl}`);
}
