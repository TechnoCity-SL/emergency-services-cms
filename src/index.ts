import type { Core } from '@strapi/strapi';
import { applyFieldHelp } from './field-help';
import { setupI18n } from './i18n-setup';
import { registerWebsiteRevalidation } from './revalidate';

// Content the public website reads. Granted to the Public role on every boot so a fresh
// database (local SQLite or Supabase) never needs permissions ticked by hand.
const PUBLIC_READ_ACTIONS = [
  'api::global.global.find',
  'api::home-page.home-page.find',
  'api::coverage-page.coverage-page.find',
  'api::services-page.services-page.find',
  'api::contact-page.contact-page.find',
  'api::region.region.find',
  'api::region.region.findOne',
  'api::coordinator.coordinator.find',
  'api::coordinator.coordinator.findOne',
  'api::ui-label.ui-label.find',
  'api::legal-page.legal-page.find',
  'api::legal-page.legal-page.findOne',
];

const grantPublicReadAccess = async (strapi: Core.Strapi) => {
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) return;

  const existing = await strapi
    .query('plugin::users-permissions.permission')
    .findMany({ where: { role: publicRole.id, action: { $in: PUBLIC_READ_ACTIONS } } });
  const granted = new Set(existing.map((permission) => permission.action));

  for (const action of PUBLIC_READ_ACTIONS) {
    if (granted.has(action)) continue;
    await strapi
      .query('plugin::users-permissions.permission')
      .create({ data: { action, role: publicRole.id } });
  }
};

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await setupI18n(strapi);
    await grantPublicReadAccess(strapi);
    await applyFieldHelp(strapi);
    registerWebsiteRevalidation(strapi);
  },
};
