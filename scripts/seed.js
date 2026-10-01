// Fills empty content with the copy from the page designs, so editors only change what differs.
// Safe to re-run: anything that already has content is left alone.
//
//   npm run seed                      -> local SQLite
//   NODE_ENV=production npm run seed  -> Supabase (uses the production DATABASE_* settings)
const { compileStrapi, createStrapi } = require('@strapi/strapi');

const hotlines = [
  {
    label: 'Primary 24/7 Hotline',
    number: '077 302 4111',
    description:
      'Immediate Janaza ambulance dispatch, critical hospital transfers, and emergency oxygen support.',
    variant: 'primary',
  },
  {
    label: 'Secondary Dispatch Line',
    number: '074 242 1818',
    description:
      'Direct backup line for inter-hospital transit coordination, standby queries, and long-distance transfers.',
    variant: 'secondary',
  },
];

const global = {
  header: {
    brandName: 'Farzan Janaza & Emergency',
    navLinks: [
      { label: 'Home', url: '/' },
      { label: 'Services', url: '/services' },
      { label: 'Coverage', url: '/coverage' },
      { label: 'Contact', url: '/contact' },
    ],
    callButton: { IconLeft: 'call', Text: 'Call Now', Url: 'tel:0773024111' },
    iconLinks: [
      { icon: 'emergency_share', label: 'Live tracking', url: '/coverage' },
      { icon: 'location_on', label: 'Find nearest hub', url: '/contact' },
    ],
  },
  footer: {
    brandName: 'Farzan Janaza and Emergency Services G Ltd.',
    description:
      'Serving humanity with dignity, compassion, and care — always free, always available. Trusted across Sri Lanka for rapid emergency and funeral transfer response.',
    socialLinks: [
      { icon: 'support_agent', label: 'Support', url: '/contact' },
      { icon: 'chat', label: 'Chat with us', url: 'https://wa.me/94773024111' },
    ],
    copyrightText: '© 2024 Farzan Janaza and Emergency Services G Ltd. All Rights Reserved.',
    quickLinksLabel: 'Navigation',
    quickLinks: [
      { label: 'Home', url: '/' },
      { label: 'Services', url: '/services' },
      { label: 'Coverage Area', url: '/coverage' },
      { label: 'Contact Us', url: '/contact' },
      { label: 'Admin Portal', url: '/admin' },
    ],
    helpLabel: '24/7 Hotlines',
    availabilityLabel: 'Available Islandwide',
  },
  hotlines,
  whatsappUrl: 'https://wa.me/94773024111',
};

// Coordinators are referenced by key from the regions below.
const coordinators = {
  rizwan: {
    name: 'Br. Rizwan Hajiyar',
    district: 'Western District',
    area: 'Colombo Central & Dehiwala Liaison',
    phone: '077 302 4111',
    sortOrder: 1,
  },
  farook: {
    name: 'Br. Farook & Team',
    district: 'Eastern District',
    area: 'Akkaraipattu, Kalmunai & Ampara Hub',
    phone: '074 242 1818',
    sortOrder: 2,
  },
  abdullah: {
    name: 'Br. Abdullah',
    district: 'Central District',
    area: 'Kandy, Galaha & Nuwara Eliya',
    phone: '077 648 2264',
    sortOrder: 3,
  },
  ajmal: {
    name: 'Br. Ajmal Ali',
    district: 'Southern District',
    area: 'Galle, Matara & Hambantota Area',
    phone: '077 766 6641',
    sortOrder: 4,
  },
  regionalDesk: {
    name: 'Regional Desk',
    phone: '077 302 4111',
    showInDirectory: false,
    sortOrder: 5,
  },
  unitedJanaza: {
    name: 'United Janaza Partner',
    phone: '077 302 4111',
    showInDirectory: false,
    sortOrder: 6,
  },
};

const regions = [
  {
    name: 'Colombo & Gampaha Hub',
    province: 'Western Province',
    areas: 'Maradana, Dehiwala, Colombo National Hospital, Panadura',
    description:
      'Coordinating major hospital discharges (National Hospital, CSTH Kalubowila, Castle Street) and western province transfers.',
    activeUnits: 14,
    stationCode: 'HQ',
    coordinator: 'rizwan',
    latitude: 6.9271,
    longitude: 79.8612,
    showOnContactPage: true,
    sortOrder: 1,
  },
  {
    name: 'Akkaraipattu & Kalmunai',
    province: 'Eastern Province',
    areas: 'Ampara, Kalmunai, Batticaloa Base & Pottuvil',
    description:
      'Primary eastern fleet serving Akkaraipattu, Kalmunai, Addalaichenai, Pottuvil, and long-haul runs back to Colombo.',
    activeUnits: 12,
    stationCode: 'Base 02',
    coordinator: 'farook',
    latitude: 7.2167,
    longitude: 81.85,
    showOnContactPage: true,
    sortOrder: 2,
  },
  {
    name: 'Kandy & Highlands',
    province: 'Central Province',
    areas: 'Peradeniya, Kandy Teaching Hospital, Gampola, Nuwara Eliya',
    description:
      'Covering Kandy General Hospital, Peradeniya, Gampola, Matale, and winding highland routes with oxygen assistance.',
    activeUnits: 8,
    stationCode: 'Base 03',
    coordinator: 'abdullah',
    latitude: 7.2906,
    longitude: 80.6337,
    showOnContactPage: true,
    sortOrder: 3,
  },
  {
    name: 'Galle & Matara Hub',
    province: 'Southern Province',
    areas: 'Karapitiya Hospital, Weligama, Hambantota Express Transfer',
    description:
      'Rapid response network for southern coastal towns, Karapitiya Teaching Hospital, and expressway patient relocations.',
    activeUnits: 6,
    stationCode: 'Base 04',
    coordinator: 'ajmal',
    latitude: 6.0535,
    longitude: 80.221,
    showOnContactPage: true,
    sortOrder: 4,
  },
  {
    name: 'Kurunegala & Northern Desk',
    province: 'North & NW Provinces',
    areas: 'Kurunegala, Puttalam, Anuradhapura, Mannar, Jaffna',
    activeUnits: 8,
    coordinator: 'regionalDesk',
    latitude: 7.4863,
    longitude: 80.3623,
    sortOrder: 5,
  },
  {
    name: 'Kegalle & Badulla Desk',
    province: 'Sabaragamuwa & Uva',
    areas: 'Kegalle Grand Mosque, Rathnapura, Kahawatta, Badulla',
    activeUnits: 4,
    coordinator: 'unitedJanaza',
    latitude: 7.2513,
    longitude: 80.3464,
    sortOrder: 6,
  },
];

const ctaBanner = {
  badge: 'Zero Fees · Zero Bureaucracy',
  heading: 'Need an Ambulance or Janaza Unit Immediately?',
  description:
    'Call now with your current location and hospital ward details. Our nearest regional unit will be mobilized within minutes.',
};

const coveragePage = {
  statusBar: {
    liveStatus: 'Active Status: 48+ Fleet Units On Call',
    tagline: 'Island-Wide 24/7 Coverage',
    highlights: [{ text: '100% Free Service' }, { text: 'All 25 Districts Supported' }],
  },
  hero: {
    badge: 'Active across 9 provinces · All 25 districts',
    heading: 'Island-Wide 24/7 Coverage & Immediate Response',
    description:
      'Rapid-dispatch ambulances and dedicated Janaza transit vehicles stationed across Sri Lanka. Always 100% free of charge for every family in need.',
  },
  hubsSection: {
    heading: {
      tagLine: 'Direct Regional Command',
      heading: 'District Coordinators & Quick-Call Hubs',
      description:
        'Direct point-of-contact for immediate emergency dispatch, inter-hospital liaison, and Janaza transit facilitation.',
    },
    badge: '48+ Fleet Vehicles Islandwide',
  },
  coordinatorsSection: {
    heading: {
      tagLine: 'Dedicated Humanitarian Network',
      heading: 'Verified District Coordinators',
      description:
        'Directly reach verified volunteer leaders who oversee fleet dispatches, hospital paperwork facilitation, and family support in your district.',
    },
    statusLabel: 'All Personnel Active Now',
  },
  ctaBanner,
  features: [
    {
      icon: 'verified',
      title: 'Completely Free of Charge',
      description:
        'Farzan Janaza and Emergency Services operates on a pure voluntary endowment basis. No patient or family is ever asked for payment.',
    },
    {
      icon: 'medical_services',
      title: 'Life-Support & Oxygen',
      description:
        'All transit vehicles carry operational high-capacity oxygen cylinders, stretchers, and sanitized medical transit equipment.',
    },
    {
      icon: 'groups',
      title: 'Mosque & Hospital Network',
      description:
        'Deeply integrated with regional Grand Jumma Mosques and hospital superintendents for seamless transfer approvals.',
    },
  ],
};

const servicesPage = {
  hero: {
    badge: '100% Free Non-Profit Aid — Islandwide',
    heading: '100% Free 24/7 Janaza & Emergency Services',
    description:
      'Providing compassionate, islandwide emergency ambulance and funeral transit across Sri Lanka. Zero cost, zero tips, unconditionally free 24 hours a day.',
  },
  readinessCard: {
    title: 'Service Readiness',
    badge: 'Live',
    items: [
      { icon: 'schedule', title: '24/7', description: 'Always on standby' },
      { icon: 'check_circle', title: 'All 25 Districts', description: 'Covered' },
      { icon: 'money_off', title: 'Strictly Free', description: 'No tips allowed' },
    ],
  },
  servicesSection: {
    heading: {
      tagLine: 'Essential Care Wings',
      heading: 'Core Emergency Services',
      description:
        'Rapid humanitarian response across Sri Lanka with respectful care and dedicated drivers.',
    },
    services: [
      {
        icon: 'airport_shuttle',
        title: 'Free Janaza Transport',
        description:
          '24/7 respectful and dignified transfer of deceased loved ones across Sri Lanka with escorts, ventilated interior, and complete care.',
        hotline: 'primary',
        buttonStyle: 'primary',
      },
      {
        icon: 'emergency',
        title: 'Emergency Medical Ambulance',
        description:
          'Urgent critical patient transfers between hospitals and homes with onboard oxygen, vital signs monitoring, and trained drivers.',
        hotline: 'secondary',
        buttonStyle: 'secondary',
      },
      {
        icon: 'air',
        title: 'Oxygen Cylinder Support',
        description:
          'Immediate doorstep delivery and refills of medical oxygen cylinders and regulators for home emergencies or hospital shortages.',
        hotline: 'primary',
        buttonStyle: 'neutral',
      },
    ],
  },
  stepsSection: {
    heading: {
      tagLine: 'Quick 3-Step Protocol',
      heading: 'How to Request Immediate Service',
      description:
        'Every minute matters. Follow these three simple steps to mobilize help immediately.',
    },
    steps: [
      {
        title: 'Call Hotline',
        description:
          'Dial 077 302 4111 or 074 242 1818 with patient/deceased location and destination.',
      },
      {
        title: 'Dispatch Nearest Unit',
        description:
          'Our coordinator assigns the closest available vehicle and shares driver details & ETA.',
      },
      {
        title: 'Safe Free Transfer',
        description:
          'Dignified, safe transfer delivered with absolute care and 100% zero payment or tip policy.',
      },
    ],
  },
  ctaBanner: {
    badge: 'Urgent Humanitarian Dispatch 24/7',
    heading: 'Need Urgent Transport Right Now?',
    description:
      "Our emergency operators are on active standby. Do not let financial stress delay your loved one's critical transfer or final journey.",
  },
};

const contactPage = {
  alertBar: {
    tag: 'Immediate Priority Alert',
    message: 'For immediate emergencies or urgent Janaza dispatch: call directly now',
  },
  hero: {
    badge: '24 Hours • 365 Days • 100% Free Humanitarian Service',
    secondaryBadge: 'Islandwide Fleet Ready',
    heading: 'Emergency Dispatch & Janaza Assistance Center',
    description:
      'Operating non-stop across Sri Lanka. Whether you require immediate free Janaza transport, emergency medical ambulance transfer, or oxygen support, our rapid coordination desk is standing by.',
    showHotlines: false,
  },
  fleetReadiness: {
    title: 'Fleet Readiness',
    badge: 'Live Feed',
    metrics: [
      { label: 'Active Missions', value: '14', caption: 'Islandwide in transit' },
      { label: 'Standby Units', value: '28', caption: 'Ready at stations' },
    ],
    note: 'Serving all communities regardless of ethnicity or religion.',
  },
  contactChannels: {
    whatsappTitle: 'Live Location & WhatsApp Coordination',
    whatsappDescription:
      'Share patient live location or hospital discharge paperwork directly with duty dispatchers.',
    whatsappButton: { IconLeft: 'chat', Text: 'Open WhatsApp Chat', Url: 'https://wa.me/94773024111' },
    policyTag: 'Strict Humanitarian Policy',
    policyText:
      '100% Free Humanitarian Emergency & Janaza Service across Sri Lanka — Zero charges, zero tips, no hidden fees for anyone.',
  },
  stationsSection: {
    heading: {
      tagLine: 'Strategic Fleet Distribution',
      heading: 'Key District Command Stations',
      description:
        'Ambulance bases strategically stationed across the island to minimize response times during bereavement and urgent transit.',
    },
    statusLabel: 'National Grid Status: Operational',
  },
};

// Home Page copy, matching the website's built-in fallback (emergency-services/src/data/home.data.ts).
// Seeded as a draft: the hero and fleet images are required, so an editor uploads them and
// presses Publish. Until then the website keeps showing its built-in copy.
const homePage = {
  Hero: {
    TagLine: '24/7 National Emergency Hotline',
    Header: 'Compassionate Care in Urgent Moments.',
    HighlightedCharactors: 'Urgent Moments.',
    Description:
      'Farzan Janaza & Emergency Services G Ltd provides immediate, high-visibility medical transport and religious burial assistance across Sri Lanka.',
    PrimaryButton: { Text: '077 302 4111', Url: 'tel:0773024111' },
    SecondaryButton: { Text: '074 242 1818', Url: 'tel:0742421818' },
    HeroStats: [
      { Stat: '12K+', StatDescription: 'Active Followers' },
      { Stat: '24/7', StatDescription: 'Availability' },
      { Stat: '100%', StatDescription: 'Commitment' },
    ],
    HeroImage: { Alt: 'Farzan emergency fleet parked in a professional row at a medical facility' },
  },
  servicesSection: {
    Heading: 'Our Dedicated Services',
    Subheading:
      'Providing swift and respectful support through specialized medical and community transportation units.',
    ServiceCard: [
      {
        tag: 'Community mission',
        title: 'Free Janaza Service',
        description:
          'Offering completely free, respectful transportation for the deceased and their grieving families, ensuring dignity in difficult times.',
        features: 'Island-wide coverage, 24-hour dispatch',
        Button: [{ Text: 'Learn more', Url: '/services#free-janaza-service' }],
      },
    ],
    EmergencyCard: {
      heading: 'Emergency Transport',
      description:
        'Critical patient transfers from hospitals to hometowns or specialist centers with life-support.',
      Button: { IconLeft: 'call', Text: 'Emergency Call', Url: 'tel:0773024111' },
    },
    OxygenServiceCard: {
      heading: 'Oxygen Services',
      description: 'Immediate oxygen supply and portable cylinders for home use or patient transfer.',
      Button: { IconLeft: 'call', Text: 'Request Supply', Url: 'tel:0742421818' },
    },
    SpecializedFleetCard: { title: 'Specialized Fleet', badge: '9+ Active Units' },
  },
  regionalCoverageSection: {
    tagLine: 'Regional network',
    heading: 'Serving Every Corner of Sri Lanka',
    description: 'Hover over or select a region on the map to view its coverage and contact details.',
    selectTitle: 'Select Area',
    selectHint: 'Hover over or choose a hub on the map to see coverage details.',
    districtsLabel: 'Service districts',
    hotlineLabel: 'National hotline',
  },
  StatItem: {
    stats: [
      { Stat: '5,000+', StatDescription: 'Free Janaza Missions' },
      { Stat: '24/7', StatDescription: 'Dispatched Teams' },
      { Stat: '15+', StatDescription: 'Service Locations' },
      { Stat: '100%', StatDescription: 'Free of Charge' },
    ],
  },
};

const seedSingleType = async (strapi, uid, data, { draftAndPublish }) => {
  const existing = await strapi.documents(uid).findFirst();
  if (existing) {
    console.log(`skip    ${uid} (already has content)`);
    return;
  }
  await strapi.documents(uid).create({ data, ...(draftAndPublish && { status: 'published' }) });
  console.log(`created ${uid}`);
};

const seedGlobal = async (strapi) => {
  const uid = 'api::global.global';
  const existing = await strapi.documents(uid).findFirst({ populate: ['hotlines'] });
  if (!existing) {
    await strapi.documents(uid).create({ data: global });
    console.log(`created ${uid}`);
    return;
  }
  // Header/footer may already be filled in by hand; only add the new shared fields.
  if (existing.hotlines?.length) {
    console.log(`skip    ${uid} (already has content)`);
    return;
  }
  await strapi.documents(uid).update({
    documentId: existing.documentId,
    data: { hotlines: global.hotlines, whatsappUrl: global.whatsappUrl },
  });
  console.log(`updated ${uid} (added hotlines)`);
};

const seedCoordinatorsAndRegions = async (strapi) => {
  if ((await strapi.documents('api::region.region').count()) > 0) {
    console.log('skip    api::region.region + api::coordinator.coordinator (already has content)');
    return;
  }
  const ids = {};
  for (const [key, data] of Object.entries(coordinators)) {
    const created = await strapi.documents('api::coordinator.coordinator').create({ data });
    ids[key] = created.documentId;
  }
  for (const { coordinator, ...data } of regions) {
    await strapi
      .documents('api::region.region')
      .create({ data: { ...data, coordinator: ids[coordinator] } });
  }
  console.log(`created ${Object.keys(coordinators).length} coordinators, ${regions.length} regions`);
};

const main = async () => {
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'error';
  try {
    await seedGlobal(app);
    await seedCoordinatorsAndRegions(app);
    await seedSingleType(app, 'api::home-page.home-page', homePage, { draftAndPublish: false });
    await seedSingleType(app, 'api::coverage-page.coverage-page', coveragePage, { draftAndPublish: true });
    await seedSingleType(app, 'api::services-page.services-page', servicesPage, { draftAndPublish: true });
    await seedSingleType(app, 'api::contact-page.contact-page', contactPage, { draftAndPublish: true });
  } finally {
    await app.destroy();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
