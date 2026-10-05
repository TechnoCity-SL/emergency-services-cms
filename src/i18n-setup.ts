import type { Core } from '@strapi/strapi';

/**
 * Languages and starter content for the multilingual website.
 *
 * - English is the default locale; Sinhala and Tamil are created here so every environment
 *   (local SQLite, production Postgres) has the same languages without clicking through
 *   Settings → Internationalization.
 * - UI Labels and the two Legal Pages are new content types. Their English entries are created
 *   once, with the text the website showed before these types existed, so nothing disappears
 *   from the live site when this is deployed. Editors add the Sinhala/Tamil versions in the
 *   Content Manager; the website falls back to English for anything not yet translated.
 *
 * Both steps only create what's missing — existing locales and content are never modified.
 */

const LOCALES = [
  { code: 'en', name: 'English (en)' },
  { code: 'si', name: 'Sinhala (si)' },
  { code: 'ta', name: 'Tamil (ta)' },
];

const DEFAULT_LOCALE = 'en';

const UI_LABELS_EN = {
  languageLabel: 'Language',
  callNumberLabel: 'Call {number}',
  notFoundTitle: 'Page not found',
  notFoundMessage: "This page doesn't exist, but help is still one tap away.",
  backToHomeLabel: 'Back to homepage',
  errorTitle: 'Something went wrong',
  errorMessage: 'This page hit a problem. Please try again — our hotlines remain available 24/7.',
  tryAgainLabel: 'Try again',
  openMenuLabel: 'Open menu',
  closeMenuLabel: 'Close menu',
  mainNavLabel: 'Main navigation',
  callPersonLabel: 'Call {name}',
  whatsappPersonLabel: 'WhatsApp {name}',
  mapLabel: 'Coverage map',
  mapResetLabel: 'Show all of Sri Lanka',
  freeServiceLabel: 'Free service',
  partialPaymentLabel: 'Partially paid',
};

// Strapi "blocks" rich-text helpers.
const text = (value: string) => ({ type: 'text', text: value });
const heading = (value: string) => ({ type: 'heading', level: 2, children: [text(value)] });
const paragraph = (...children: object[]) => ({ type: 'paragraph', children });
const link = (url: string, label: string) => ({ type: 'link', url, children: [text(label)] });

const DRAFT_NOTICE =
  'Draft — pending legal review. This placeholder text has not been reviewed by legal counsel and must not be treated as final.';
const COMPANY = 'Farzan Janaza and Emergency Services (G) Ltd';

const LEGAL_PAGES_EN = [
  {
    page: 'privacy' as const,
    title: 'Privacy Policy',
    notice: DRAFT_NOTICE,
    body: [
      heading('Introduction'),
      paragraph(
        text(
          `${COMPANY} (“we”, “us”) respects your privacy. This page is a placeholder explaining, at a high level, how we intend to handle information in connection with this website.`,
        ),
      ),
      heading('Information we collect'),
      paragraph(
        text(
          'This website is a static, content-only site in its current phase: it has no sign-up forms, no accounts, and no database. Standard web server and hosting logs (such as IP address and browser type) may be collected automatically by our hosting provider for security and reliability purposes.',
        ),
      ),
      heading('Phone calls'),
      paragraph(
        text(
          'Calling one of our hotlines connects you directly to our dispatch team by telephone; this website does not record, transcribe, or store the content of those calls.',
        ),
      ),
      heading('Changes to this policy'),
      paragraph(
        text(
          'We may update this page as the service evolves. Material changes will be reflected here with an updated effective date once this policy is finalized.',
        ),
      ),
      heading('Contact us'),
      paragraph(
        text('Questions about this draft policy can be directed to us via the hotlines listed on our '),
        link('/contact', 'Contact page'),
        text('.'),
      ),
    ],
  },
  {
    page: 'terms' as const,
    title: 'Terms of Service',
    notice: DRAFT_NOTICE,
    body: [
      heading('Our services'),
      paragraph(
        text(
          `${COMPANY} provides free island-wide Janaza (funeral) transport, emergency medical transport, and oxygen supply across Sri Lanka, as described on our `,
        ),
        link('/services', 'Services page'),
        text('.'),
      ),
      heading('Service availability'),
      paragraph(
        text(
          'We aim to respond to every call as quickly as possible, but dispatch times can vary with traffic, weather, distance, and vehicle availability. This page does not constitute a guaranteed response time.',
        ),
      ),
      heading('Using this website'),
      paragraph(
        text(
          'This website is provided for information only. In this phase it has no accounts, forms, or payments. Calling a listed hotline is the correct way to request our services.',
        ),
      ),
      heading('Changes to these terms'),
      paragraph(
        text(
          'We may update this page as the service evolves. Material changes will be reflected here with an updated effective date once these terms are finalized.',
        ),
      ),
      heading('Contact us'),
      paragraph(
        text('Questions about these draft terms can be directed to us via the hotlines listed on our '),
        link('/contact', 'Contact page'),
        text('.'),
      ),
    ],
  },
];

const ensureLocales = async (strapi: Core.Strapi) => {
  const locales = strapi.plugin('i18n').service('locales');
  for (const locale of LOCALES) {
    if (await locales.findByCode(locale.code)) continue;
    await locales.create(locale);
    strapi.log.info(`[i18n] created locale ${locale.name}`);
  }
  const defaultLocale = await locales.getDefaultLocale();
  if (defaultLocale !== DEFAULT_LOCALE) {
    strapi.log.warn(
      `[i18n] default locale is "${defaultLocale}", but the website expects "${DEFAULT_LOCALE}". Change it in Settings → Internationalization.`,
    );
  }
};

const ensureDefaultContent = async (strapi: Core.Strapi) => {
  const uiLabels = strapi.documents('api::ui-label.ui-label');
  if (!(await uiLabels.findFirst({ locale: DEFAULT_LOCALE }))) {
    await uiLabels.create({ locale: DEFAULT_LOCALE, data: UI_LABELS_EN });
    strapi.log.info('[i18n] created English UI Labels');
  }

  const legalPages = strapi.documents('api::legal-page.legal-page');
  for (const page of LEGAL_PAGES_EN) {
    const existing = await legalPages.findFirst({
      locale: DEFAULT_LOCALE,
      filters: { page: page.page },
    });
    if (existing) continue;
    await legalPages.create({
      locale: DEFAULT_LOCALE,
      status: 'published',
      data: page as never,
    });
    strapi.log.info(`[i18n] created English legal page "${page.title}"`);
  }
};

export const setupI18n = async (strapi: Core.Strapi) => {
  await ensureLocales(strapi);
  await ensureDefaultContent(strapi);
};
