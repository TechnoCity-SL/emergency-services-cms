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

// Partner societies registered with Farzan Janaza
// (Soceities/Emergency Services Content Management.xlsx, 16 October 2026).
// Coordinates are not known yet — the website places these pins in the middle of the district.
// Bump this when the list below is replaced, so the next seed run applies it once.
const PARTNERS_VERSION = '2026-10-16';

const provinceByDistrict = {
  Colombo: 'Western Province', Gampaha: 'Western Province', Kalutara: 'Western Province',
  Kandy: 'Central Province', Matale: 'Central Province', 'Nuwara Eliya': 'Central Province',
  Galle: 'Southern Province', Matara: 'Southern Province', Hambantota: 'Southern Province',
  Jaffna: 'Northern Province', Kilinochchi: 'Northern Province', Mannar: 'Northern Province',
  Vavuniya: 'Northern Province', Mullaitivu: 'Northern Province',
  Batticaloa: 'Eastern Province', Ampara: 'Eastern Province', Trincomalee: 'Eastern Province',
  Kurunegala: 'North Western Province', Puttalam: 'North Western Province',
  Anuradhapura: 'North Central Province', Polonnaruwa: 'North Central Province',
  Badulla: 'Uva Province', Monaragala: 'Uva Province',
  Ratnapura: 'Sabaragamuwa Province', Kegalle: 'Sabaragamuwa Province',
};

const MAIN_HOTLINE = hotlines[0].number;

// society(name, district, hotline, [president, phone], [secretary, phone], [[vehicleNumber, type]], extra)
const society = (name, district, hotline, [presidentName, presidentPhone] = [], [secretaryName, secretaryPhone] = [], vehicles = [], extra = {}) => ({
  name,
  province: provinceByDistrict[district],
  district,
  hotline,
  ...(presidentName && { presidentName }),
  ...(presidentPhone && { presidentPhone }),
  ...(secretaryName && { secretaryName }),
  ...(secretaryPhone && { secretaryPhone }),
  vehicles: vehicles.map(([vehicleNumber, vehicleType]) => ({ vehicleNumber, ...(vehicleType && { vehicleType }) })),
  ...extra,
});

// Kept off the website until an editor fills in what is missing.
const hidden = { showOnWebsite: false };

const partners = [
  society('Galagedara Janaza Welfare Society', 'Kandy', '075 520 9956', ['Rismi', '075 520 9956']),
  society('Jamaliya Janaza Welfare Society', 'Trincomalee', '075 426 6903', ['Mahzoom', '077 631 0646'], ['A.K. Siyaul Haq', '075 426 6903']),
  society('Poruthota Janaza Welfare Association - PJWA', 'Gampaha', '076 747 4074', ['Munawaar', '077 160 7799'], ['M.R.M. Rismy', '076 747 4074'], [['DAG-4335', 'Double Cab']]),
  society('Vavuniya Pattanichoor Janaza Welfare Co-Op Society', 'Vavuniya', '077 606 2767', ['Nasar Hajiyar', '076 925 5042'], ['Munawwar', '077 606 2767'], [['GS-9075', 'Van']]),
  society('Al Wadha Janaza Welfare Services', 'Puttalam', '072 523 1777', ['Riswan', '072 523 1777'], ['Rislan', '076 036 0333'], [['DAI-7471', 'Bolero']]),
  society('Janaza Foundation Kalpitiya', 'Puttalam', '077 192 0656', ['Thariq Hajiyar', '077 063 9800'], ['Aslam', '077 192 0656'], [['PF-3445', 'Van']]),
  society('Silmiyapura Janaza Society', 'Puttalam', '077 718 6486', ['Iftikhar', '077 718 6486'], ['Faizar Hajiyar', '077 295 3462'], [['20-3600', 'Van']]),
  society('Gurutawala Janaza Services', 'Ratnapura', '077 698 1440', ['Kaleel Majeed', '076 725 5387'], ['Fowsul Aman (Coordinator)', '077 698 1440'], [['GK-7787', 'Van']]),
  society('Badulla Janaza Welfare Association', 'Badulla', '076 880 0688', ['Jawfer', '076 880 0688'], ['Fahis', '072 494 4754'], [['JS-7228', 'Van']]),
  // No phone number on the sheet: the main hotline stands in until the society's own is known.
  society('Janaza Services Jannath Jumma Masjid', 'Ratnapura', MAIN_HOTLINE, [], [], [['DAE-4515', 'Batta']], hidden),
  society('Beruwela Janaza Service', 'Kalutara', '077 394 0936', ['Raslan', '077 394 0936'], ['Ramsan', '077 712 8912'], [['PD-3862', 'Van']]),
  society('Nuwara Eliya Hawaeliya Janaza Society', 'Nuwara Eliya', '071 567 1117', ['Niyasdeen', '071 567 1117'], ['Irshad'], [['EF-8658', 'Van']]),
  society('Kalkudah Janaza Welfare Services', 'Batticaloa', '077 232 4252', ['Nawfar Phi', '076 765 8828'], ['Raheem'], [['DAH-8012', 'Batta']]),
  // The sheet notes the listed president (Riyas Moulavi) stepped down on 3 September 2026.
  society('Kinniya Janaza Welfare Association', 'Trincomalee', '075 310 1137', [], ['Ashraq Moulavi', '075 310 1137'], [['GI-4084', 'Van']]),
  society('Thoppur Janaza Welfare Society', 'Trincomalee', '077 235 4774', ['Rafaideen', '077 949 3702'], ['Haris', '077 235 4774'], [['PE-2527', 'Van']]),
  society('Irakkamam Grand Masjidh Janaza Foundation', 'Ampara', '075 291 8130', ['Rauf', '075 728 0449 / 077 675 8138'], ['Haroon', '077 356 5501 / 075 291 8130'], [['PG-6706', 'Van']]),
  society('Thaiba Welfare Association', 'Gampaha', '077 732 2666', ['Aslam Hajiyar', '077 732 2666'], ['M.A.M. Nusrath Hajiyar', '077 138 2627'], [['LH-3919', 'Batta']]),
  society('Minan Janaza Welfare Society Aandankanni', 'Puttalam', '072 548 4665', ['Azeem Moulavi', '077 114 1616'], ['Irshad', '072 548 4665']),
  society("Matale Nadhwathu Is'aafil Janaza", 'Matale', '077 589 0002', ['Riyas', '077 212 1113'], ['Neemathullah', '077 589 0002'], [['PC-8144', 'Van']]),
  society('Khair Welfare Association, Grandpass', 'Colombo', '070 120 0012', ['Aneef', '070 120 0012'], ['Usman', '075 424 3271']),
  society('Janaza Service - New Elpitiya, Gelioya', 'Kandy', '077 715 1815', ['Rizan', '077 715 1815'], ['Thariqshad', '077 231 9232'], [['251-8018', 'Van']]),
  society('Dehiwela Jumma Masjid', 'Colombo', '077 758 7357', ['Ismail Haji', '077 758 7357'], ['Thahir Haji', '077 441 1861']),
  society('Al Masjidus Subhani Grand Masjid, Kal-Eliya', 'Gampaha', '072 680 0068', ['Faham', '072 680 0068'], ['Imthiyas', '077 392 6295']),
  society('Karapitiya Janaza Service, Galle', 'Galle', '077 608 5449', ['Buhari', '077 608 5449'], ['Yesir', '077 972 7206']),
  society('Barakath Welfare Society, Kattankudy', 'Batticaloa', '077 179 1335', ['Sanoon', '077 379 4858'], ['Asmi', '077 179 1335'], [['LF-7990', 'Batta']]),
  society('Y2K Janaza Welfare Service (Addalaichenai)', 'Ampara', '077 747 4094', ['Nihar', '077 747 4094'], ['Rifas', '075 609 5839']),
  society('Social Services & Janaza Society, Colombo-15', 'Colombo', '071 426 1026', ['A.M. Abdul Jabbar', '077 367 9684'], ['Abdul Salam (Treasurer)', '071 426 1026'], [['PX-4803', 'Bolero']]),
  society('Sonehavaadi Janaza Society - Trincomalee Town', 'Trincomalee', '077 059 3535', ['Kuraisi'], ['Ibrahim (Unani Doctor)', '077 059 3535']),
  // The sheet lists this society as "Trincomalee unknown name".
  society('Trincomalee Janaza Society (name to be confirmed)', 'Trincomalee', '077 237 8878', ['Hafeel', '077 237 8878'], ['Manaf'], [], hidden),
  society('Katugoda Janaza Service', 'Galle', '077 711 9447', ['Fasmi', '077 711 9447'], ['Fasly'], [['PY-5665', 'Bolero']]),
  society('Maruthamunai Janaza Welfare Society', 'Ampara', '076 858 5983', ['S.M. Riyas', '076 858 5983'], ['Arshad', '075 430 0082'], [['DAG-8405', 'Double Cab']]),
  society('Hemmathagama Masjid Welfare Association', 'Kandy', '077 710 9909', ['Mansoor Hajiyar', '077 710 9909'], [undefined, '075 918 7173'], [['PJ-0650', 'Van']]),
  society('Buhary Janaza Welfare Foundation', 'Matara', '075 518 2680', ['Shaheebullah', '072 440 9574'], ['Shiyam', '075 518 2680']),
  society('Kanthale Janaza Welfare Society', 'Trincomalee', '077 825 4150', ['Riyal Hajiyar', '077 353 8336 / 077 825 4150'], ['Rimsath', '076 013 1454']),
  society('Puttalam Janaza Welfare Society', 'Puttalam', '077 840 1400', [], ['Aathif', '077 840 1400'], [['PI-4850', 'Van']]),
  society('Janaza Welfare Organization Maligaikadu', 'Ampara', '077 777 4414', ['Inthiyas', '077 777 4414'], ['Fahim', '078 383 9557'], [['EP PQ-5527', 'Batta']]),
  society('சாய்ந்தமருது ஜனாஸா நலன்புரி மக்கள் பேரவை', 'Ampara', '077 900 0771', ['Naseer', '077 900 0771'], ['Mursith (Treasurer)', '077 263 3281'], [['DAI-0371', 'Batta']]),
  society('Young Birds Janaza Welfare Organization Kalmunai', 'Ampara', '077 858 2721', ['Marsook', '077 858 2721'], ['Fais', '077 582 3642']),
  society('Al Fathah Janaza Welfare Organization Sainthamaruthu', 'Ampara', '075 404 1482', ['Rifas', '076 305 4861'], ['Faleel (Vice Chairman)', '075 404 1482'], [['DAI-0371', 'Double Cab']]),
  society('Janaza Welfare Services - Addalaichenai', 'Ampara', '077 453 0333', ['Janoon', '077 263 6887'], ['Hafeel', '077 453 0333']),
  // The sheet also lists 076 188 2626 as a second hotline.
  society('Janaza Welfare Association - Sammanthurai', 'Ampara', '077 909 0406', ['Ramees Haafiz', '077 820 4145'], ['Imam']),
  society('NJWA - Nintavur Janaza Welfare Association - Sri Lanka', 'Ampara', '077 867 8989', ['Riyas', '077 867 2929'], ['Sulaiman', '077 471 6517'], [['NE-3642', 'Van']]),
  // No phone number on the sheet: the main hotline stands in until the society's own is known.
  society('ஜனாஸா நலன்புரி மக்கள் அமைப்பு - Mavadippalli', 'Ampara', MAIN_HOTLINE, ['Nafar'], ['Niyas'], [], hidden),
  society('ISWAA Janaza and Emergency Service', 'Ampara', '070 699 9909', ['Ajmal Moulavi', '070 699 9909'], ['Maajid Moulavi', '076 840 0775'], [['PF-2441', 'Van']]),
  society('Pottuvil Janaza Welfare Society', 'Ampara', '070 603 5435', ['Abdul Nayeem', '077 303 5721'], ['Abdul Jabbar', '070 603 5435'], [['PI-4850', 'Van']]),
  society('United Janaza Service - Kegalle Grand Jumma Mosque', 'Kegalle', '077 357 9021', ['Rizan', '077 357 9021'], ['Rizvi', '077 714 8841'], [['PC-1455', 'Van']]),
  // Runs a van; its number is not on the sheet yet.
  society('Hussain Rashard Janaza Foundation & Education', 'Colombo', '078 815 9002', ['Hussain Rashard', '078 815 9002']),
  society('Illukuwatta Janaza Welfare Society', 'Kandy', '077 724 7991', ['Akram', '077 724 7991'], ['Sadhir', '077 734 3695']),
  society('ETC Janaza Welfare Society - Katpitiya', 'Puttalam', '077 616 1685', ['Jesmin Hajiyar', '077 616 1685'], ['Ihsan', '071 484 1055']),
  society('Ambarapola Reunion Welfare Society', 'Kandy', '077 758 9804', ['Faizar Hajiyar'], ['Riyas', '077 758 9804']),
  society('Madulbowa Bathibiya Janaza Welfare Association', 'Kegalle', '077 918 7173', ['Fowsul Ameen', '077 919 4500'], ['Rizvi', '077 918 7173'], [['251-1711', 'Van']]),
  society('Gintota Muhaitheen Jumma Masjid Janaza Service', 'Galle', '077 902 1808', ['Fairoos Hajiyar', '077 639 3915'], [], [['PW-4646', 'Bolero']]),
  society('Diyatalawa Janaza Welfare Society', 'Badulla', '076 387 8387', ['Nawas', '072 478 3380'], ['Hashimdeen', '076 387 8387']),
  society('Muthur Janaza Society', 'Trincomalee', '076 269 9906', ['Laafir Hajiyar', '075 517 6889 / 076 269 9906'], ['M.A. Yaasir', '077 363 8573']),
  society('Elabodagama Janaza Society', 'Kurunegala', '071 633 2644', ['Ramzeen Hajiyar', '071 633 2644'], ['Riyasdeen Mufthi']),
  society('Kattankudy Janaza Welfare Society', 'Batticaloa', '076 825 6425', ['M.H.S. Hameed Hajiyar', '077 737 8753'], ['S.M. Firthous', '077 420 3109'], [['PE-6367', 'Van']]),
  society('Chilaw Janaza Welfare Association', 'Puttalam', '077 784 1284', ['Ramsan Hajiyar', '077 784 1284'], [], [['DAH-8145', 'Batta']]),
]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((entry, index) => ({ ...entry, sortOrder: index + 1 }));

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

const partnerKey = (name) => name.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

// Applies the partner list once per PARTNERS_VERSION, so later edits in the admin are not undone
// by re-running the seed. Societies are matched by name: new ones are created, existing ones get
// the sheet's details while keeping their photos, coordinates, visibility and vehicle payment notes.
const seedPartners = async (strapi) => {
  const uid = 'api::partner.partner';
  const store = strapi.store({ type: 'core', name: 'seed' });
  if ((await store.get({ key: 'partnersVersion' })) === PARTNERS_VERSION) {
    console.log(`skip    ${uid} (list ${PARTNERS_VERSION} already applied)`);
    return;
  }

  const existing = await strapi.documents(uid).findMany({ populate: ['vehicles'], limit: 1000 });
  const byKey = new Map(existing.map((entry) => [partnerKey(entry.name), entry]));
  let created = 0;
  let updated = 0;
  for (const data of partners) {
    const match = byKey.get(partnerKey(data.name));
    if (!match) {
      await strapi.documents(uid).create({ data });
      created += 1;
      continue;
    }
    byKey.delete(partnerKey(data.name));
    const vehicles = data.vehicles.map((vehicle) => {
      const previous = match.vehicles?.find((v) => v.vehicleNumber === vehicle.vehicleNumber);
      return { ...vehicle, ...(previous?.payment && { payment: previous.payment }), ...(previous?.paymentNote && { paymentNote: previous.paymentNote }) };
    });
    const { showOnWebsite, ...details } = data;
    await strapi.documents(uid).update({ documentId: match.documentId, data: { ...details, vehicles } });
    updated += 1;
  }
  await store.set({ key: 'partnersVersion', value: PARTNERS_VERSION });
  console.log(`synced  ${uid} (${created} created, ${updated} updated from list ${PARTNERS_VERSION})`);
  for (const entry of byKey.values()) console.log(`        not on the list, left as is: ${entry.name}`);
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
