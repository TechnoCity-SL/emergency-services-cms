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
        'The FIRST hotline is the main number — every call button on the site dials it. Add more lines only for district numbers, and fill in "Districts covered" on each; district lines without districts are not shown. Phone numbers always come from the English version — in other languages only translate the name and description.',
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
      description: 'Interactive map. Pins come from Farzan Bases and Partner Societies.',
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
      label: 'Farzan bases section',
      description: 'Base cards come from Farzan Bases with "Show on Coverage page" switched on.',
    },
    partnersSection: {
      label: 'Partner societies section',
      description:
        'Searchable directory of partner societies. Cards come from Partner Societies with "Show on website" switched on. Leave empty to hide it.',
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
      description: 'Main hotline card and district lines (from Global > Hotlines) plus the WhatsApp and policy blocks.',
    },
    stationsSection: {
      label: 'Stations section',
      description: 'Station cards come from Farzan Bases with "Show on Contact page" switched on.',
    },
  },

  'api::region.region': {
    name: {
      label: 'Base name',
      description: 'Shown as the card title and map pin name.',
      placeholder: 'Colombo Base',
    },
    province: {
      label: 'Province',
      description: 'Shown under the base name.',
      placeholder: 'Western Province',
    },
    district: {
      label: 'District',
      description:
        'Where the base is. If a district hotline covers this district, the base\'s call button dials it instead of the main hotline. Optional.',
    },
    areas: {
      label: 'Areas covered',
      description: 'Comma-separated list of towns and hospitals served.',
      placeholder: 'Maradana, Dehiwala, Colombo National Hospital, Panadura',
    },
    description: {
      label: 'Description',
      description: 'One or two sentences about what this base handles. Shown on Contact page station cards. Optional.',
    },
    activeUnits: {
      label: 'Vehicles',
      description: 'Number of Farzan Janaza vehicles based here. Whole number only. Leave empty to hide the count.',
      placeholder: '8',
    },
    stationCode: {
      label: 'Station code',
      description: 'Short tag shown on Contact page station cards. Optional.',
      placeholder: 'Base 02',
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
      description: 'Adds this base to the Coverage page. On by default.',
    },
    showOnContactPage: {
      label: 'Show on Contact page',
      description: 'Adds this base to the Contact page stations list. Off by default.',
    },
    sortOrder: {
      label: 'Sort order',
      description: 'Lower numbers appear first. Defaults to 0.',
      placeholder: '1',
    },
  },

  'api::partner.partner': {
    name: {
      label: 'Society name',
      description: 'Shown as the card title and map pin name.',
      placeholder: 'Kattankudy Janaza Welfare Society',
    },
    province: { label: 'Province' },
    district: {
      label: 'District',
      description: 'Used for the district filter on the Coverage page and to place the map pin when no coordinates are given.',
    },
    hotline: {
      label: 'Hotline',
      description: `The society's own number. ${PHONE_HINT}`,
      placeholder: '077 123 4567',
    },
    presidentName: {
      label: 'President',
      description: 'Name of the society president. Optional.',
      placeholder: 'Br. Hameed Hajiyar',
    },
    vehicles: {
      label: 'Vehicles',
      description: 'Vehicles this society runs for the network. Add one row per vehicle.',
    },
    gallery: {
      label: 'Photo gallery',
      description:
        'Photos of the president, vehicles, society and staff. The first photo is used as the card cover. Optional.',
    },
    latitude: {
      label: 'Latitude',
      description:
        'Optional. Right-click the spot in Google Maps and copy the first number (Sri Lanka is between 5.9 and 9.9). If empty, the pin is placed in the middle of the district.',
      placeholder: '7.6833',
    },
    longitude: {
      label: 'Longitude',
      description: 'Optional. The second number from Google Maps (Sri Lanka is between 79.5 and 81.9).',
      placeholder: '81.7333',
    },
    showOnWebsite: {
      label: 'Show on website',
      description: 'Turn off to hide this society everywhere without deleting it. On by default.',
    },
    sortOrder: {
      label: 'Sort order',
      description: 'Lower numbers appear first; equal numbers are sorted by name. Defaults to 0.',
      placeholder: '1',
    },
  },

  'api::ui-label.ui-label': {
    languageLabel: { label: 'Language switcher label', description: 'Screen-reader name of the language switcher in the header.' },
    callNumberLabel: {
      label: 'Service call button',
      description: 'Button on each Services page card. {number} is replaced with the hotline number.',
      placeholder: 'Call {number}',
    },
    notFoundTitle: { label: '404 page title' },
    notFoundMessage: { label: '404 page message' },
    backToHomeLabel: { label: '"Back to homepage" link' },
    errorTitle: { label: 'Error page title' },
    errorMessage: { label: 'Error page message' },
    tryAgainLabel: { label: '"Try again" button' },
    openMenuLabel: { label: 'Open menu (screen reader)', description: 'Read aloud for the mobile menu button.' },
    closeMenuLabel: { label: 'Close menu (screen reader)' },
    mainNavLabel: { label: 'Main menu (screen reader)' },
    callPersonLabel: {
      label: 'Call someone (screen reader)',
      description: '{name} is replaced with the hotline or society name.',
      placeholder: 'Call {name}',
    },
    whatsappPersonLabel: {
      label: 'WhatsApp someone (screen reader)',
      description: '{name} is replaced with the base name.',
      placeholder: 'WhatsApp {name}',
    },
    mapLabel: { label: 'Coverage map (screen reader)' },
    freeServiceLabel: {
      label: '"Free service" tag',
      description: 'Shown on partner vehicles marked free, and in the map legend.',
      placeholder: 'Free service',
    },
    partialPaymentLabel: {
      label: '"Partially paid" tag',
      description: 'Shown on partner vehicles marked partially paid, and in the map legend.',
      placeholder: 'Partially paid',
    },
    mapResetLabel: {
      label: 'Map "show all" button',
      description: 'Shown on the home page map after a pin is clicked; zooms back out to the whole island.',
    },
  },

  'api::legal-page.legal-page': {
    page: { label: 'Page', description: 'Which footer link opens this entry. One entry per page.' },
    title: { label: 'Title', placeholder: 'Privacy Policy' },
    notice: {
      label: 'Notice',
      description: 'Highlighted box above the text (e.g. "Draft — pending legal review"). Leave empty to hide it.',
    },
    body: { label: 'Content', description: 'Use Heading 2 for section titles. Links to /contact etc. open in the visitor\'s language.' },
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
    districts: {
      label: 'Districts covered',
      description:
        'Leave empty on the main hotline. For a district line, list the districts it answers, separated by commas (e.g. Ampara, Batticaloa). Spell them as in the district list.',
      placeholder: 'Ampara, Batticaloa',
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

  'molecules.vehicle': {
    vehicleNumber: { label: 'Vehicle number', placeholder: 'PE-6367' },
    vehicleType: { label: 'Vehicle type', description: 'Optional.', placeholder: 'Janaza van' },
    payment: {
      label: 'Payment',
      description:
        'free = no charge at all. partially_paid = the family pays part of the cost (e.g. driver or fuel). Leave empty if not confirmed yet — nothing is shown then. Colours the map pin and the vehicle tag.',
    },
    paymentNote: {
      label: 'What is charged',
      description: 'Short note for partially paid vehicles, shown next to the tag. Optional.',
      placeholder: 'Driver and fuel charges only',
    },
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
    heading: { label: 'Heading', placeholder: 'Farzan Janaza Bases' },
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
    districtHotlinesTitle: {
      label: 'District hotlines title',
      description: 'Heading above the district lines. Only shown once a district line is added. Defaults to "District Hotlines".',
    },
    policyTag: { label: 'Policy tag', placeholder: 'Strict Humanitarian Policy' },
    policyText: { label: 'Policy text', description: 'Shown in a highlighted box below the contact cards.' },
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
    brandName: { label: 'Brand name', placeholder: 'Farzan Janaza & Emergency' },
    description: { label: 'About text', description: 'Short paragraph under the brand name.' },
    socialLinks: { label: 'Social / contact icons' },
    copyrightText: {
      label: 'Copyright text',
      description: 'Remember to update the year.',
      placeholder: '© 2026 Farzan Janaza & Emergency. All Rights Reserved.',
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
      placeholder: 'Farzan Janaza & Emergency provides free Janaza and emergency transport…',
    },
    PrimaryButton: { label: 'Primary button', description: 'Main button. Usually a tel: link to the main hotline.' },
    SecondaryButton: { label: 'Secondary button', description: 'Optional.' },
    HeroStats: { label: 'Stats', description: 'Numbers under the buttons. Three fit best.' },
    HeroImage: { label: 'Hero image' },
  },

  'page-components.hubs-section': {
    heading: { label: 'Section heading' },
    badge: { label: 'Badge', description: 'Optional.', placeholder: 'Farzan Janaza Fleet' },
    unitsLabel: { label: '"Vehicles" label', description: 'Shown after the vehicle count on each card. Defaults to "Vehicles".' },
    callButtonLabel: {
      label: 'Call button text',
      description: 'Dials the main hotline (or the district line covering the base). Defaults to "Call Hotline".',
    },
  },

  'page-components.partners-section': {
    heading: { label: 'Section heading' },
    badge: { label: 'Badge', description: 'Optional.', placeholder: 'Registered with Farzan Janaza' },
    searchLabel: { label: 'Search box label', description: 'Defaults to "Search by society, town or vehicle number".' },
    districtFilterLabel: { label: 'District filter label', description: 'Defaults to "District".' },
    allDistrictsLabel: { label: '"All districts" option', description: 'Defaults to "All districts".' },
    noResultsText: { label: 'No results message', description: 'Shown when nothing matches; the main hotline button is shown with it.' },
    presidentLabel: { label: '"President" label', description: 'Defaults to "President".' },
    vehiclesLabel: { label: '"Vehicles" label', description: 'Defaults to "Vehicles".' },
    callButtonLabel: { label: 'Call button text', description: 'Dials the society hotline. Defaults to "Call Society".' },
    photosLabel: { label: '"Photos" label', description: 'Shown on the photo count badge. Defaults to "Photos".' },
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
    baseLabel: { label: '"Farzan base" label', description: 'Tag on Farzan base pins. Defaults to "Farzan Janaza base".' },
    partnerLabel: { label: '"Partner society" label', description: 'Tag on partner pins. Defaults to "Partner society".' },
    vehiclesLabel: { label: '"Vehicles" label', description: 'Defaults to "Vehicles".' },
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
    unitsLabel: { label: '"Vehicles" label', description: 'Defaults to "Vehicles".' },
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
