import type { Core } from '@strapi/strapi';

// Labels, helper text and placeholders editors see in the Content Manager.
// Strapi keeps these in the database ("Configure the view"), not in schema.json, so they are
// written on every boot from here. Edit this file rather than the admin UI — UI changes to
// these fields are overwritten on the next restart. Default values live in schema.json.

type FieldHelp = { label?: string; description?: string; placeholder?: string };
type ModelHelp = Record<string, FieldHelp>;

const ICON_HINT =
  'Material Symbols icon name, lowercase with underscores (e.g. call, chat, location_on). Browse names at fonts.google.com/icons.';
const PHONE_HINT =
  'Write it the way it should be displayed (e.g. 077 302 4111). Call links are built from it automatically.';
const LINK_HINT =
  'Internal page path starting with / (e.g. /contact), full URL (https://…), tel:0773024111 or https://wa.me/94773024111.';

const CONTENT_TYPES: Record<string, ModelHelp> = {
  'api::global.global': {
    header: {
      label: 'Header',
      description: 'Top navigation bar shown on every page.',
    },
    footer: {
      label: 'Footer',
      description: 'Bottom section shown on every page.',
    },
    hotlines: {
      label: 'Hotlines',
      description:
        'At least one is required. Used everywhere a call button or hotline card appears (hero, CTA banners, contact page, service cards). Mark the main number as "primary".',
    },
    whatsappUrl: {
      label: 'WhatsApp link',
      description: 'Full wa.me link with country code and no leading 0 or spaces (94 = Sri Lanka).',
      placeholder: 'https://wa.me/94773024111',
    },
  },

  'api::home-page.home-page': {
    Hero: {
      label: 'Hero',
      description: 'First section at the top of the home page.',
    },
    servicesSection: {
      label: 'Services section',
      description: 'Service cards, emergency cards and fleet gallery.',
    },
    regionalCoverageSection: {
      label: 'Regional coverage section',
      description: 'Interactive map. Pins and cards come from the Regions collection.',
    },
    StatItem: {
      label: 'Stats strip',
      description: 'Row of headline numbers (e.g. "48+ Fleet Units").',
    },
  },

  'api::services-page.services-page': {
    hero: { label: 'Hero', description: 'Banner at the top of the Services page.' },
    readinessCard: {
      label: 'Readiness card',
      description: 'Small card beside the hero listing quick facts. Leave empty to hide it.',
    },
    servicesSection: { label: 'Services list', description: 'Main list of services with call buttons.' },
    stepsSection: {
      label: '"How it works" steps',
      description: 'Numbered steps explaining how to request help. Leave empty to hide it.',
    },
    ctaBanner: { label: 'Call-to-action banner', description: 'Banner near the bottom. Leave empty to hide it.' },
  },

  'api::coverage-page.coverage-page': {
    statusBar: { label: 'Status bar', description: 'Thin strip above the hero. Leave empty to hide it.' },
    hero: { label: 'Hero', description: 'Banner at the top of the Coverage page.' },
    hubsSection: {
      label: 'Hubs section',
      description: 'Hub cards come from Regions with "Show on Coverage page" switched on.',
    },
    coordinatorsSection: {
      label: 'Coordinators section',
      description: 'Cards come from Coordinators with "Show in directory" switched on.',
    },
    ctaBanner: { label: 'Call-to-action banner', description: 'Banner near the bottom. Leave empty to hide it.' },
    features: {
      label: 'Feature highlights',
      description: 'Icon + title + short text blocks. Three items fit best on one row.',
    },
  },

  'api::contact-page.contact-page': {
    alertBar: { label: 'Alert bar', description: 'Urgent message strip at the very top. Leave empty to hide it.' },
    hero: { label: 'Hero', description: 'Banner at the top of the Contact page.' },
    fleetReadiness: {
      label: 'Fleet readiness card',
      description: 'Live-style figures beside the hero. Leave empty to hide it.',
    },
    contactChannels: {
      label: 'Contact channels',
      description: 'Hotline cards (from Global > Hotlines) plus the WhatsApp and policy blocks.',
    },
    stationsSection: {
      label: 'Stations section',
      description: 'Station cards come from Regions with "Show on Contact page" switched on.',
    },
  },

  'api::region.region': {
    name: {
      label: 'Hub name',
      description: 'Shown as the card title and map pin name.',
      placeholder: 'Colombo & Gampaha Hub',
    },
    province: {
      label: 'Province',
      description: 'Shown under the hub name.',
      placeholder: 'Western Province',
    },
    areas: {
      label: 'Areas covered',
      description: 'Comma-separated list of towns and hospitals served.',
      placeholder: 'Maradana, Dehiwala, Colombo National Hospital, Panadura',
    },
    description: {
      label: 'Description',
      description: 'One or two sentences about what this hub handles. Optional.',
    },
    activeUnits: {
      label: 'Active units',
      description: 'Number of vehicles based here. Whole number only.',
      placeholder: '8',
    },
    stationCode: {
      label: 'Station code',
      description: 'Short tag shown on Contact page station cards. Optional.',
      placeholder: 'Base 02',
    },
    coordinator: {
      label: 'Coordinator',
      description: 'Person contacted for this hub. Their phone number is used for the "Call hub" button.',
    },
    latitude: {
      label: 'Latitude',
      description:
        'Map pin position. Right-click the spot in Google Maps and copy the first number. Sri Lanka is between 5.9 and 9.9.',
      placeholder: '6.9271',
    },
    longitude: {
      label: 'Longitude',
      description: 'The second number from Google Maps. Sri Lanka is between 79.5 and 81.9.',
      placeholder: '79.8612',
    },
    showOnCoveragePage: {
      label: 'Show on Coverage page',
      description: 'Adds this hub to the Coverage page hub list. On by default.',
    },
    showOnContactPage: {
      label: 'Show on Contact page',
      description: 'Adds this hub to the Contact page stations list. Off by default.',
    },
    sortOrder: {
      label: 'Sort order',
      description: 'Lower numbers appear first. Defaults to 0.',
      placeholder: '1',
    },
  },

  'api::coordinator.coordinator': {
    name: {
      label: 'Full name',
      description: 'Shown on coordinator cards and hub cards.',
      placeholder: 'Br. Rizwan Hajiyar',
    },
    district: {
      label: 'District',
      description: 'Shown as the card heading.',
      placeholder: 'Western District',
    },
    area: {
      label: 'Area of responsibility',
      placeholder: 'Colombo Central & Dehiwala Liaison',
    },
    phone: {
      label: 'Phone number',
      description: PHONE_HINT,
      placeholder: '077 302 4111',
    },
    whatsapp: {
      label: 'WhatsApp number',
      description: 'Optional. Same format as the phone number.',
      placeholder: '077 302 4111',
    },
    photo: {
      label: 'Photo',
      description: 'Square image works best. Optional.',
    },
    showInDirectory: {
      label: 'Show in directory',
      description:
        'Shows this person on the Coverage page coordinators list. Turn off for desks that only back a hub. On by default.',
    },
    sortOrder: {
      label: 'Sort order',
      description: 'Lower numbers appear first. Defaults to 0.',
      placeholder: '1',
    },
    regions: {
      label: 'Hubs',
      description: 'Hubs this person coordinates. You can also set this from each Region.',
    },
  },
};

const COMPONENTS: Record<string, ModelHelp> = {
  'atoms.button': {
    IconLeft: { label: 'Icon (left)', description: `Optional. ${ICON_HINT}`, placeholder: 'call' },
    Text: { label: 'Button text', placeholder: 'Call Now' },
    IconRight: { label: 'Icon (right)', description: `Optional. ${ICON_HINT}`, placeholder: 'arrow_forward' },
    Url: { label: 'Link', description: LINK_HINT, placeholder: 'tel:0773024111' },
  },

  'molecules.feature': {
    icon: { label: 'Icon', description: ICON_HINT, placeholder: 'verified' },
    title: { label: 'Title', placeholder: 'Completely Free of Charge' },
    description: { label: 'Description', description: 'One or two short sentences.' },
  },

  'molecules.hotline': {
    label: { label: 'Name', description: 'Title on the hotline card.', placeholder: 'Primary 24/7 Hotline' },
    number: { label: 'Phone number', description: PHONE_HINT, placeholder: '077 302 4111' },
    description: { label: 'Description', description: 'What this line is for. Shown on the Contact page card.' },
    variant: {
      label: 'Type',
      description:
        'Primary = main number, secondary = backup line. Defaults to primary.',
    },
  },

  'molecules.image': {
    DesktopImage: { label: 'Desktop image', description: 'Landscape, at least 1600px wide.' },
    MobileImage: { label: 'Mobile image', description: 'Portrait or square, at least 800px wide.' },
    Alt: {
      label: 'Alt text',
      description: 'Describes the image for screen readers and search engines.',
      placeholder: 'Ambulance parked outside a hospital',
    },
    Url: { label: 'Link (optional)', description: `Makes the image clickable. ${LINK_HINT}` },
  },

  'molecules.label': {
    text: { label: 'Text', placeholder: '100% Free Service' },
  },

  'molecules.metric': {
    label: { label: 'Label', placeholder: 'Active Missions' },
    value: { label: 'Value', description: 'The big number. Text is allowed (e.g. 48+).', placeholder: '14' },
    caption: { label: 'Caption', description: 'Small text under the value. Optional.', placeholder: 'Islandwide in transit' },
  },

  'molecules.section-heading': {
    tagLine: { label: 'Tagline', description: 'Small text above the heading. Optional.', placeholder: 'Direct Regional Command' },
    heading: { label: 'Heading', placeholder: 'District Coordinators & Quick-Call Hubs' },
    description: { label: 'Description', description: 'Short intro under the heading. Optional.' },
  },

  'molecules.social-link': {
    icon: { label: 'Icon', description: ICON_HINT, placeholder: 'chat' },
    label: { label: 'Label', description: 'Tooltip / screen-reader text.', placeholder: 'Chat with us' },
    url: { label: 'Link', description: LINK_HINT, placeholder: 'https://wa.me/94773024111' },
  },

  'molecules.stats-and-numbers': {
    Stat: { label: 'Number', description: 'Max 10 characters. Text is allowed (e.g. 24/7, 48+).', placeholder: '48+' },
    StatDescription: { label: 'Description', placeholder: 'Fleet Units Islandwide' },
  },

  'molecules.step': {
    title: { label: 'Step title', placeholder: 'Call Hotline' },
    description: { label: 'Description', description: 'One or two short sentences.' },
  },

  'page-components.alert-bar': {
    tag: { label: 'Tag', description: 'Bold label before the message. Optional.', placeholder: 'Immediate Priority Alert' },
    message: { label: 'Message', placeholder: 'For immediate emergencies or urgent Janaza dispatch: call directly now' },
  },

  'page-components.contact-channels': {
    callButtonLabel: {
      label: 'Call button text',
      description: 'Text on each hotline card button. {number} is replaced with that hotline\'s number. Defaults to "Call {number} Now".',
      placeholder: 'Call {number} Now',
    },
    whatsappTitle: { label: 'WhatsApp card title', placeholder: 'Live Location & WhatsApp Coordination' },
    whatsappDescription: { label: 'WhatsApp card description' },
    whatsappButton: {
      label: 'WhatsApp button',
      description: 'Usually the same link as Global > WhatsApp link.',
    },
    policyTag: { label: 'Policy tag', placeholder: 'Strict Humanitarian Policy' },
    policyText: { label: 'Policy text', description: 'Shown in a highlighted box below the contact cards.' },
  },

  'page-components.coordinators-section': {
    heading: { label: 'Section heading' },
    statusLabel: { label: 'Status label', description: 'Small live-status text beside the heading. Optional.', placeholder: 'All Personnel Active Now' },
    dutyBadge: { label: 'Duty badge', description: 'Badge on every coordinator card. Defaults to "24/7 On Duty".' },
    whatsappLabel: { label: 'WhatsApp button text', description: 'Defaults to "Direct WhatsApp".' },
  },

  'page-components.cta-banner': {
    badge: { label: 'Badge', description: 'Small pill above the heading. Optional.', placeholder: 'Zero Fees · Zero Bureaucracy' },
    heading: { label: 'Heading', placeholder: 'Need an Ambulance or Janaza Unit Immediately?' },
    description: { label: 'Description', description: 'Call buttons are added automatically from Global > Hotlines.' },
  },

  'page-components.emergency-card': {
    icon: { label: 'Icon image', description: 'Small square image or SVG, around 64×64px.' },
    heading: { label: 'Heading', placeholder: 'Emergency Ambulance' },
    description: { label: 'Description', description: 'Max 100 characters.' },
    Button: { label: 'Button', description: 'Optional.' },
  },

  'page-components.fleet-readiness-card': {
    title: { label: 'Title', placeholder: 'Fleet Readiness' },
    badge: { label: 'Badge', description: 'Optional.', placeholder: 'Live Feed' },
    metrics: { label: 'Metrics', description: 'Two items fit best.' },
    note: { label: 'Footnote', description: 'Small text at the bottom of the card. Optional.' },
  },

  'page-components.footer-section': {
    brandName: { label: 'Brand name', placeholder: 'Farzan Janaza and Emergency Services G Ltd.' },
    description: { label: 'About text', description: 'Short paragraph under the brand name.' },
    socialLinks: { label: 'Social / contact icons' },
    copyrightText: {
      label: 'Copyright text',
      description: 'Remember to update the year.',
      placeholder: '© 2024 Farzan Janaza and Emergency Services G Ltd. All Rights Reserved.',
    },
    quickLinksLabel: { label: 'Links column heading', description: 'Defaults to "Navigation".' },
    quickLinks: { label: 'Links' },
    helpLabel: { label: 'Hotlines column heading', description: 'Numbers come from Global > Hotlines. Defaults to "24/7 Hotlines".' },
    availabilityLabel: { label: 'Availability text', description: 'Shown under the hotlines. Defaults to "Available Islandwide".' },
  },

  'page-components.header-section': {
    brandName: { label: 'Brand name', description: 'Shown beside the logo.', placeholder: 'Farzan Janaza & Emergency' },
    navLinks: { label: 'Menu links', description: 'Shown left to right in this order.' },
    callButton: { label: 'Call button', description: 'Main call-to-action button. Use a tel: link.' },
    iconLinks: { label: 'Icon links', description: 'Small icon buttons beside the call button. Optional.' },
  },

  'page-components.hero-area': {
    TagLine: { label: 'Tagline', description: 'Small text above the heading. Max 50 characters.' },
    Header: { label: 'Heading', description: 'Main headline.' },
    HighlightedCharactors: {
      label: 'Highlighted words',
      description: 'Part of the heading to show in the accent colour. Must match the heading text exactly, including punctuation.',
    },
    Description: {
      label: 'Intro text',
      description: 'Short paragraph under the heading. Optional.',
      placeholder: 'Farzan Janaza & Emergency Services G Ltd provides immediate medical transport…',
    },
    PrimaryButton: { label: 'Primary button', description: 'Main button. Usually a tel: link to the main hotline.' },
    SecondaryButton: { label: 'Secondary button', description: 'Optional.' },
    HeroStats: { label: 'Stats', description: 'Numbers under the buttons. Three fit best.' },
    HeroImage: { label: 'Hero image' },
  },

  'page-components.hubs-section': {
    heading: { label: 'Section heading' },
    badge: { label: 'Badge', description: 'Optional.', placeholder: '48+ Fleet Vehicles Islandwide' },
    unitsLabel: { label: '"Units" label', description: 'Shown after the unit count on each card. Defaults to "Units".' },
    coordinatorLabel: { label: '"Coordinator" label', description: 'Defaults to "Coordinator:".' },
    callButtonLabel: { label: 'Call button text', description: 'Dials the hub coordinator. Defaults to "Call Hub".' },
  },

  'page-components.page-hero': {
    badge: { label: 'Badge', description: 'Small pill above the heading. Optional.', placeholder: '100% Free Non-Profit Aid — Islandwide' },
    secondaryBadge: { label: 'Second badge', description: 'Optional.', placeholder: 'Islandwide Fleet Ready' },
    heading: { label: 'Heading' },
    highlightedText: {
      label: 'Highlighted words',
      description: 'Part of the heading to show in the accent colour. Must match the heading text exactly. Optional.',
    },
    description: { label: 'Description' },
    showHotlines: {
      label: 'Show hotline buttons',
      description: 'Adds call buttons from Global > Hotlines under the text. On by default.',
    },
  },

  'page-components.quick-links': {
    label: { label: 'Text', placeholder: 'Contact' },
    url: { label: 'Link', description: LINK_HINT, placeholder: '/contact' },
  },

  'page-components.readiness-card': {
    title: { label: 'Title', placeholder: 'Service Readiness' },
    badge: { label: 'Badge', description: 'Optional.', placeholder: 'Live' },
    items: { label: 'Items', description: 'Three fit best.' },
  },

  'page-components.regional-coverage-section': {
    tagLine: { label: 'Tagline', placeholder: 'Islandwide Network' },
    heading: { label: 'Heading' },
    description: { label: 'Description', description: 'Max 100 characters.' },
    selectTitle: { label: 'Panel title (nothing selected)', description: 'Defaults to "Select Area".' },
    selectHint: { label: 'Panel hint (nothing selected)', description: 'Defaults to "Hover or click a region on the map".' },
    districtsLabel: { label: '"Districts" label', description: 'Defaults to "Districts".' },
    hotlineLabel: { label: '"Hotline" label', description: 'Defaults to "Hotline".' },
  },

  'page-components.service-card': {
    Image: { label: 'Image', description: 'Landscape, at least 800px wide.' },
    tag: { label: 'Tag', description: 'Small label on the image. Optional.' },
    title: { label: 'Title', placeholder: 'Free Janaza Transport' },
    description: { label: 'Description' },
    features: { label: 'Features', description: 'Short points separated by commas.', placeholder: 'Ventilated interior, Escorts, 24/7' },
    Button: { label: 'Buttons' },
  },

  'page-components.service-item': {
    icon: { label: 'Icon', description: ICON_HINT, placeholder: 'airport_shuttle' },
    title: { label: 'Title', placeholder: 'Free Janaza Transport' },
    description: { label: 'Description' },
    hotline: { label: 'Hotline to call', description: 'Which Global hotline the call button dials. Defaults to primary.' },
    buttonStyle: {
      label: 'Button colour',
      description: 'Visual style of the call button. Defaults to primary.',
    },
  },

  'page-components.services-list-section': {
    heading: { label: 'Section heading' },
    services: { label: 'Services' },
  },

  'page-components.services-section': {
    Heading: { label: 'Heading' },
    Subheading: { label: 'Subheading' },
    ServiceCard: { label: 'Service cards' },
    EmergencyCard: { label: 'Emergency card' },
    OxygenServiceCard: { label: 'Oxygen service card' },
    SpecializedFleetCard: { label: 'Specialized fleet card', description: 'Photo gallery card. Images are required before you can publish.' },
  },

  'page-components.specialized-fleet-card': {
    title: { label: 'Title', description: 'Defaults to "Specialized Fleet".' },
    badge: { label: 'Badge', description: 'Small pill on the card. Optional.', placeholder: '9+ Active Units' },
    image: { label: 'Images', description: 'One or more vehicle photos. Landscape, at least 1200px wide.' },
  },

  'page-components.stat-item': {
    stats: { label: 'Stats', description: 'Four fit best on one row.' },
  },

  'page-components.stations-section': {
    heading: { label: 'Section heading' },
    statusLabel: { label: 'Status label', description: 'Optional.', placeholder: 'National Grid Status: Operational' },
    unitsLabel: { label: '"Units" label', description: 'Defaults to "Active Units".' },
  },

  'page-components.status-bar': {
    liveStatus: { label: 'Live status', placeholder: 'Active Status: 48+ Fleet Units On Call' },
    tagline: { label: 'Tagline', description: 'Optional.', placeholder: 'Island-Wide 24/7 Coverage' },
    highlights: { label: 'Highlights', description: 'Short phrases shown as pills.' },
  },
};

type CmService = {
  findConfiguration: (model: { uid: string }) => Promise<{ metadatas: Record<string, any> }>;
  updateConfiguration: (model: { uid: string }, config: { metadatas: Record<string, any> }) => Promise<unknown>;
};

const applyHelp = async (strapi: Core.Strapi, service: CmService, uid: string, help: ModelHelp) => {
  const { metadatas } = await service.findConfiguration({ uid });
  let changed = false;

  for (const [field, { label, description, placeholder }] of Object.entries(help)) {
    const meta = metadatas[field];
    if (!meta) {
      strapi.log.warn(`[field-help] ${uid} has no field "${field}"`);
      continue;
    }
    const edit = { ...meta.edit, label: label ?? meta.edit.label, description: description ?? '', placeholder: placeholder ?? '' };
    const list = { ...meta.list, label: label ?? meta.list.label };
    if (JSON.stringify(edit) !== JSON.stringify(meta.edit) || JSON.stringify(list) !== JSON.stringify(meta.list)) {
      metadatas[field] = { ...meta, edit, list };
      changed = true;
    }
  }

  if (changed) await service.updateConfiguration({ uid }, { metadatas });
};

export const applyFieldHelp = async (strapi: Core.Strapi) => {
  const contentManager = strapi.plugin('content-manager');
  const contentTypes = contentManager.service('content-types') as CmService;
  const components = contentManager.service('components') as CmService;

  for (const [uid, help] of Object.entries(CONTENT_TYPES)) await applyHelp(strapi, contentTypes, uid, help);
  for (const [uid, help] of Object.entries(COMPONENTS)) await applyHelp(strapi, components, uid, help);
};
