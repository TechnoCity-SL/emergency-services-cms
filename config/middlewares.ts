import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', 'apollo-server-landing-page.cdn.apollographql.com'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'res.cloudinary.com',
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
          'script-src': [
            "'self'",
            "'unsafe-inline'",
            'apollo-server-landing-page.cdn.apollographql.com',
            'embeddable-sandbox.cdn.apollographql.com',
            'embeddable-explorer.cdn.apollographql.com',
          ],
          'style-src': ["'self'", "'unsafe-inline'", 'apollo-server-landing-page.cdn.apollographql.com'],
          'frame-src': ["'self'", 'sandbox.embed.apollographql.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
