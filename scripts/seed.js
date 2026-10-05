// Fills empty content with the copy from the page designs, so editors only change what differs.
// Safe to re-run: anything that already has content is left alone.
//
//   npm run seed                      -> local SQLite
//   NODE_ENV=production npm run seed  -> Supabase (uses the production DATABASE_* settings)
const { compileStrapi, createStrapi } = require('@strapi/strapi');

// One islandwide number. District lines can be added later (with "districts" filled in) and
// the website will show them on the Contact page and route district calls to them.
const hotlines = [
  {
    label: '24/7 Main Hotline',
    number: '077 302 4111',
    description:
      'One number for the whole island. Our dispatch team sends the nearest Farzan Janaza or partner society vehicle for Janaza transport, emergency transfers and oxygen support.',
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
    brandName: 'Farzan Janaza & Emergency',
    description:
      'Serving humanity with dignity, compassion, and care — always free, always available. Trusted across Sri Lanka for rapid emergency and funeral transfer response.',
    socialLinks: [
      { icon: 'support_agent', label: 'Support', url: '/contact' },
      { icon: 'chat', label: 'Chat with us', url: 'https://wa.me/94773024111' },
    ],
    copyrightText: '© 2026 Farzan Janaza & Emergency. All Rights Reserved.',
    quickLinksLabel: 'Navigation',
    quickLinks: [
      { label: 'Home', url: '/' },
      { label: 'Services', url: '/services' },
      { label: 'Coverage Area', url: '/coverage' },
      { label: 'Contact Us', url: '/contact' },
    ],
    helpLabel: '24/7 Hotlines',
    availabilityLabel: 'Available Islandwide',
  },
  hotlines,
  whatsappUrl: 'https://wa.me/94773024111',
};

// Farzan Janaza's own vehicle bases. Vehicle counts are left empty until confirmed.
const regions = [
  {
    name: 'Colombo Base',
    province: 'Western Province',
    district: 'Colombo',
    areas: 'Colombo, Dehiwala, Maradana, Colombo National Hospital',
    description: 'Farzan Janaza vehicles serving Colombo and the Western Province.',
    stationCode: 'HQ',
    latitude: 6.9271,
    longitude: 79.8612,
    showOnContactPage: true,
    sortOrder: 1,
  },
  {
    name: 'Akkaraipattu Base',
    province: 'Eastern Province',
    district: 'Ampara',
    areas: 'Akkaraipattu, Kalmunai, Addalaichenai, Pottuvil',
    description: 'Farzan Janaza vehicles serving Akkaraipattu and the Ampara District.',
    stationCode: 'Base 02',
    latitude: 7.2167,
    longitude: 81.85,
    showOnContactPage: true,
    sortOrder: 2,
  },
];

// Partner societies registered with Farzan Janaza (from the operations sheet, October 2026).
// Coordinates are not known yet — the website places these pins in the middle of the district.
const partner = (name, province, district, vehicleNumber, hotline, presidentName) => ({
  name,
  province,
  district,
  hotline,
  ...(presidentName && { presidentName }),
  vehicles: [{ vehicleNumber }],
});

const partners = [
  partner('Al Wadha Janaza Welfare Services', 'North Western Province', 'Puttalam', 'DAI-7471', '072 523 1777', 'Riswan Brother'),
  partner('Barakath Welfare Society, Kattankudy', 'Eastern Province', 'Batticaloa', 'LF-7990', '077 179 1335', 'Asmi Brother'),
  partner('Gintota Muhaitheen Jumma Masjid Janaza Service', 'Southern Province', 'Galle', 'PW-4646', '077 902 1808', 'Fairoos Brother'),
  partner('Hemmathagama Masjid Welfare Association', 'Central Province', 'Kandy', 'PJ-0650', '077 710 9909', 'Mansoor Hajiyar'),
  partner('ISWAA Janaza and Emergency Service', 'Eastern Province', 'Ampara', 'PF-2441', '070 699 9909', 'Ajmal Moulavi'),
  partner('Janaza Service - New Elpitiya, Gelioya', 'Central Province', 'Kandy', '251-8018', '077 715 1815', 'Rizan Brother'),
  partner('Kalkudah Janaza Welfare Services', 'Eastern Province', 'Batticaloa', 'DAH-8012', '077 232 4252', 'Nawfer Brother'),
  partner('Janaza Foundation Kalpitiya', 'North Western Province', 'Puttalam', 'PF-3445', '077 063 9800', 'Thariq Hajiyar'),
  partner('Kattankudy Janaza Welfare Society', 'Eastern Province', 'Batticaloa', 'PE-6367', '076 825 6424', 'Hameed Hajiyar'),
  partner('Katugoda Janaza Service', 'Southern Province', 'Galle', 'PY-5665', '077 943 4404'),
  partner('Madulbowa Bathibiya Janaza Welfare Association', 'Sabaragamuwa Province', 'Kegalle', '251-1711', '077 918 7173'),
  partner('Maruthamunai Janaza Welfare Society', 'Eastern Province', 'Ampara', 'DAG-8405', '077 218 5817'),
  partner('Poruthota Janaza Welfare Association - PJWA', 'Western Province', 'Gampaha', 'DAG-4335', '077 160 7799'),
  partner('Silmiyapura Janaza Society', 'North Western Province', 'Puttalam', '20-3600', '077 718 6486'),
  partner('Social Services & Janaza Society, Colombo-15', 'Western Province', 'Colombo', 'PX-4803', '077 367 9684'),
  partner('Thoppur Janaza Welfare Society', 'Eastern Province', 'Trincomalee', 'PE-2527', '077 235 4774'),
  partner('Vavuniya Pattanichoor Janaza Welfare Co-Op Society', 'Northern Province', 'Vavuniya', 'GS-9075', '076 925 5042'),
  partner('Chilaw Janaza Welfare Association', 'North Western Province', 'Puttalam', 'DAH-8145', '077 784 1284'),
].map((entry, index) => ({ ...entry, sortOrder: index + 1 }));

const ctaBanner = {
  badge: 'Zero Fees · Zero Bureaucracy',
  heading: 'Need an Ambulance or Janaza Unit Immediately?',
  description:
    'Call the main hotline with your current location and hospital ward details. We will send the nearest Farzan Janaza or partner society vehicle.',
};

const partnersSection = {
  heading: {
    tagLine: 'Partner Network',
    heading: 'Partner Janaza Societies',
    description:
      'Janaza societies across Sri Lanka registered with Farzan Janaza, each running dedicated vehicles for this network. Search by district or society, or call the main hotline and we will arrange the nearest vehicle.',
  },
  badge: 'Registered with Farzan Janaza',
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
      tagLine: 'Farzan Janaza Fleet',
      heading: 'Our Vehicle Bases',
      description:
        'Farzan Janaza vehicles are based in Colombo and Akkaraipattu. All requests go through the main hotline.',
    },
  },
  partnersSection,
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
        buttonStyle: 'primary',
      },
      {
        icon: 'emergency',
        title: 'Emergency Medical Ambulance',
        description:
          'Urgent critical patient transfers between hospitals and homes with onboard oxygen, vital signs monitoring, and trained drivers.',
        buttonStyle: 'secondary',
      },
      {
        icon: 'air',
        title: 'Oxygen Cylinder Support',
        description:
          'Immediate doorstep delivery and refills of medical oxygen cylinders and regulators for home emergencies or hospital shortages.',
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
          'Dial 077 302 4111 with the patient or deceased location and the destination.',
      },
      {
        title: 'Dispatch Nearest Unit',
        description:
          'Our dispatch team assigns the closest Farzan Janaza or partner society vehicle and shares the driver details.',
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
    districtHotlinesTitle: 'District Hotlines',
    policyTag: 'Strict Humanitarian Policy',
    policyText:
      '100% Free Humanitarian Emergency & Janaza Service across Sri Lanka — Zero charges, zero tips, no hidden fees for anyone.',
  },
  stationsSection: {
    heading: {
      tagLine: 'Farzan Janaza Fleet',
      heading: 'Our Vehicle Bases',
      description:
        'Farzan Janaza vehicles are based in Colombo and Akkaraipattu, with partner society vehicles across the island.',
    },
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
      'Farzan Janaza & Emergency and its partner societies provide free Janaza transport and emergency medical transport across Sri Lanka.',
    PrimaryButton: { IconLeft: 'call', Text: '077 302 4111', Url: 'tel:0773024111' },
    SecondaryButton: { IconLeft: 'location_on', Text: 'Find a Vehicle Near You', Url: '/coverage' },
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
      Button: { IconLeft: 'call', Text: 'Request Supply', Url: 'tel:0773024111' },
    },
    SpecializedFleetCard: { title: 'Specialized Fleet', badge: '9+ Active Units' },
  },
  regionalCoverageSection: {
    tagLine: 'Regional network',
    heading: 'Serving Every Corner of Sri Lanka',
    description: 'Farzan Janaza bases and partner society vehicles across the island.',
    selectTitle: 'Select Area',
    selectHint: 'Hover over or choose a hub on the map to see coverage details.',
    districtsLabel: 'Service districts',
    hotlineLabel: 'Hotline',
    baseLabel: 'Farzan Janaza base',
    partnerLabel: 'Partner society',
    vehiclesLabel: 'Vehicles',
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

const seedRegions = async (strapi) => {
  const uid = 'api::region.region';
  if ((await strapi.documents(uid).count()) > 0) {
    console.log(`skip    ${uid} (already has content)`);
    return;
  }
  for (const data of regions) await strapi.documents(uid).create({ data });
  console.log(`created ${regions.length} Farzan bases`);
};

const seedPartners = async (strapi) => {
  const uid = 'api::partner.partner';
  if ((await strapi.documents(uid).count()) > 0) {
    console.log(`skip    ${uid} (already has content)`);
    return;
  }
  for (const data of partners) await strapi.documents(uid).create({ data });
  console.log(`created ${partners.length} partner societies`);
};

// Databases seeded before the partner network existed: add the new Coverage section as a draft
// so an editor can review it and press Publish. Existing content is never changed.
const addPartnersSection = async (strapi) => {
  const uid = 'api::coverage-page.coverage-page';
  const existing = await strapi.documents(uid).findFirst({ populate: ['partnersSection'] });
  if (!existing || existing.partnersSection) return;
  await strapi.documents(uid).update({ documentId: existing.documentId, data: { partnersSection } });
  console.log(`updated ${uid} (added partnersSection as a draft — open Coverage Page and press Publish)`);
};

const main = async () => {
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'error';
  try {
    await seedGlobal(app);
    await seedRegions(app);
    await seedPartners(app);
    await seedSingleType(app, 'api::home-page.home-page', homePage, { draftAndPublish: false });
    await seedSingleType(app, 'api::coverage-page.coverage-page', coveragePage, { draftAndPublish: true });
    await addPartnersSection(app);
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
