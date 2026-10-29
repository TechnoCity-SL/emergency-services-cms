// Fills empty content with the copy from the page designs, so editors only change what differs.
// Safe to re-run: anything that already has content is left alone.
//
//   npm run seed                      -> local SQLite
//   NODE_ENV=production npm run seed  -> Supabase (uses the production DATABASE_* settings)
//   npm run seed -- --replace-legal   -> only overwrite the Privacy Policy / Terms of Service pages
//   npm run seed -- --translate-partners -> only add Sinhala/Tamil versions of the partner societies
//   npm run seed -- --translate-names    -> only write president/secretary names in Sinhala/Tamil
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
// Coordinates come from the sheet's Latitude/Longitude columns (see `locations` below).
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

// [latitude, longitude] from the sheet (degree-minute-second values converted to decimal).
// Left out, so the website keeps the district-centre pin until corrected:
//   Thoppur Janaza Welfare Society — the sheet's 11.939, 78.057 is in Tamil Nadu, India.
//   Silmiyapura Janaza Society — the sheet's 6.915, 80.842 is in the hill country, not Puttalam.
const locations = {
  'Galagedara Janaza Welfare Society': [7.360083, 80.538889],
  'Jamaliya Janaza Welfare Society': [8.593111, 81.219972],
  'Poruthota Janaza Welfare Association - PJWA': [7.258694, 79.846028],
  'Vavuniya Pattanichoor Janaza Welfare Co-Op Society': [8.763043, 80.482232],
  'Al Wadha Janaza Welfare Services': [8.029714, 79.830678],
  'Janaza Foundation Kalpitiya': [8.223979, 79.77044],
  'Gurutawala Janaza Services': [6.84666, 80.902462],
  'Badulla Janaza Welfare Association': [6.991986, 81.053374],
  'Janaza Services Jannath Jumma Masjid': [6.686462, 80.407544],
  'Beruwela Janaza Service': [6.475921, 79.984065],
  'Nuwara Eliya Hawaeliya Janaza Society': [6.97293, 80.779486],
  'Kalkudah Janaza Welfare Services': [7.924641, 81.544496],
  'Kinniya Janaza Welfare Association': [8.502629, 81.180167],
  'Irakkamam Grand Masjidh Janaza Foundation': [7.244202, 81.745624],
  'Thaiba Welfare Association': [7.204939, 79.851898],
  'Minan Janaza Welfare Society Aandankanni': [8.080069, 79.723842],
  "Matale Nadhwathu Is'aafil Janaza": [7.466972, 80.62199],
  'Khair Welfare Association, Grandpass': [6.951017, 79.873227],
  'Janaza Service - New Elpitiya, Gelioya': [7.215286, 80.597897],
  'Dehiwela Jumma Masjid': [6.864245, 79.865809],
  'Al Masjidus Subhani Grand Masjid, Kal-Eliya': [7.193353, 80.10663],
  'Karapitiya Janaza Service, Galle': [6.070555, 80.225044],
  'Barakath Welfare Society, Kattankudy': [7.68891121322138, 81.7352756234537],
  'Y2K Janaza Welfare Service (Addalaichenai)': [7.248845, 81.8572],
  'Social Services & Janaza Society, Colombo-15': [6.966964, 79.871896],
  'Sonehavaadi Janaza Society - Trincomalee Town': [8.586432, 81.213902],
  'Trincomalee Janaza Society (name to be confirmed)': [8.586432, 81.213902],
  'Katugoda Janaza Service': [6.03487, 80.239728],
  'Maruthamunai Janaza Welfare Society': [7.435635, 81.813812],
  'Hemmathagama Masjid Welfare Association': [7.173337, 80.500495],
  'Buhary Janaza Welfare Foundation': [5.949602, 80.547229],
  'Kanthale Janaza Welfare Society': [8.366431, 81.002781],
  'Puttalam Janaza Welfare Society': [8.030311, 79.830679],
  'Janaza Welfare Organization Maligaikadu': [7.387147, 81.840579],
  "Sainthamaruthu Janaza Welfare People's Council": [7.39245, 81.834497],
  'Young Birds Janaza Welfare Organization Kalmunai': [7.415329, 81.825417],
  'Al Fathah Janaza Welfare Organization Sainthamaruthu': [7.39245, 81.834497],
  'Janaza Welfare Services - Addalaichenai': [7.248845, 81.8572],
  'Janaza Welfare Association - Sammanthurai': [7.363113, 81.798656],
  'NJWA - Nintavur Janaza Welfare Association - Sri Lanka': [7.348802, 81.845097],
  "Janaza Welfare People's Organization - Mavadippalli": [7.372043, 81.821559],
  'ISWAA Janaza and Emergency Service': [7.348802, 81.845097],
  'Pottuvil Janaza Welfare Society': [6.875886, 81.829141],
  'United Janaza Service - Kegalle Grand Jumma Mosque': [7.252742, 80.343155],
  'Hussain Rashard Janaza Foundation & Education': [6.926779, 79.861869],
  'Illukuwatta Janaza Welfare Society': [7.258295, 80.545691],
  'ETC Janaza Welfare Society - Katpitiya': [8.22952, 79.759717],
  'Ambarapola Reunion Welfare Society': [7.217558, 80.572858],
  'Madulbowa Bathibiya Janaza Welfare Association': [7.173211, 80.514004],
  'Gintota Muhaitheen Jumma Masjid Janaza Service': [6.060671, 80.180175],
  'Diyatalawa Janaza Welfare Society': [6.806875, 80.956285],
  'Muthur Janaza Society': [8.457639, 81.268573],
  'Elabodagama Janaza Society': [7.355059, 80.027091],
  'Kattankudy Janaza Welfare Society': [7.68046905727807, 81.7289899752502],
  'Chilaw Janaza Welfare Association': [7.577327, 79.793036],
};

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
  society("Sainthamaruthu Janaza Welfare People's Council", 'Ampara', '077 900 0771', ['Naseer', '077 900 0771'], ['Mursith (Treasurer)', '077 263 3281'], [['DAI-0371', 'Batta']]),
  society('Young Birds Janaza Welfare Organization Kalmunai', 'Ampara', '077 858 2721', ['Marsook', '077 858 2721'], ['Fais', '077 582 3642']),
  society('Al Fathah Janaza Welfare Organization Sainthamaruthu', 'Ampara', '075 404 1482', ['Rifas', '076 305 4861'], ['Faleel (Vice Chairman)', '075 404 1482'], [['DAI-0371', 'Double Cab']]),
  society('Janaza Welfare Services - Addalaichenai', 'Ampara', '077 453 0333', ['Janoon', '077 263 6887'], ['Hafeel', '077 453 0333']),
  // The sheet also lists 076 188 2626 as a second hotline.
  society('Janaza Welfare Association - Sammanthurai', 'Ampara', '077 909 0406', ['Ramees Haafiz', '077 820 4145'], ['Imam']),
  society('NJWA - Nintavur Janaza Welfare Association - Sri Lanka', 'Ampara', '077 867 8989', ['Riyas', '077 867 2929'], ['Sulaiman', '077 471 6517'], [['NE-3642', 'Van']]),
  // No phone number on the sheet: the main hotline stands in until the society's own is known.
  society("Janaza Welfare People's Organization - Mavadippalli", 'Ampara', MAIN_HOTLINE, ['Nafar'], ['Niyas'], [], hidden),
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
  .map((entry) => {
    const [latitude, longitude] = locations[entry.name] ?? [];
    return latitude === undefined ? entry : { ...entry, latitude, longitude };
  })
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

// Rich-text (blocks) helpers for the legal pages. Strings become plain text; pass b('...') for
// bold and a('url', '...') for links.
const b = (text) => ({ type: 'text', text, bold: true });
const a = (url, text) => ({ type: 'link', url, children: [{ type: 'text', text }] });
const inline = (parts) => parts.map((part) => (typeof part === 'string' ? { type: 'text', text: part } : part));
const h2 = (text) => ({ type: 'heading', level: 2, children: [{ type: 'text', text }] });
const p = (...parts) => ({ type: 'paragraph', children: inline(parts) });
const ul = (...items) => ({
  type: 'list',
  format: 'unordered',
  children: items.map((item) => ({ type: 'list-item', children: inline([].concat(item)) })),
});

const LEGAL_NAME = 'Farzan Emergency Services (G) Ltd';
const LEGAL_UPDATED = '27 October 2026';
const hotlineLink = a('tel:+94773024111', MAIN_HOTLINE);
const whatsappLink = a('https://wa.me/94773024111', 'WhatsApp (+94 77 302 4111)');

// Contact block at the end of each page: [organisation, hotline, WhatsApp, online, contact page].
const legalContacts = ([org, hotline, whatsapp, online, contactPage]) =>
  ul(
    [b(org), LEGAL_NAME],
    [b(hotline), hotlineLink],
    [b(whatsapp), whatsappLink],
    [b(online), a('/contact', contactPage)],
  );

// Short, plain-language wording for each language. Each page is: last updated, an intro,
// numbered sections and a contact section.
const legalText = {
  en: {
    updated: ['Last updated: ', LEGAL_UPDATED],
    contacts: ['Organisation: ', '24/7 hotline: ', 'WhatsApp: ', 'Online: ', 'Contact page'],
    privacy: {
      title: 'Privacy Policy',
      intro: `${LEGAL_NAME} provides free Janaza transport, emergency medical transport and oxygen support across Sri Lanka. We respect your privacy and only use your information to help you.`,
      sections: [
        [
          '1. Information we collect',
          'When you contact us by phone, WhatsApp or the request form, we ask for your name, phone number, the name of the person who needs help, and the pickup and destination. We do not use tracking or advertising cookies.',
        ],
        [
          '2. How we use it',
          'Only to arrange the service you ask for — to contact you, send a vehicle and coordinate with our partner societies or the hospital. We never sell your information or use it for advertising.',
        ],
        [
          '3. Sharing information',
          'We share your details only with the people involved in providing your service, such as our partner Janaza societies and drivers, or when required by law.',
        ],
        [
          '4. Keeping your information safe',
          'We keep your information secure and only for as long as it is needed, in line with the Personal Data Protection Act No. 9 of 2022.',
        ],
        ['5. Your choices', 'You can contact us at any time to see, correct or delete your information.'],
      ],
      contact: ['6. Contact us', 'If you have any questions, please feel free to contact us:'],
    },
    terms: {
      title: 'Terms of Service',
      intro: 'By using this website or our services, you agree to these simple terms.',
      sections: [
        [
          '1. Our services',
          `${LEGAL_NAME}, together with our partner Janaza societies, provides Janaza transport, emergency medical transport and oxygen support across Sri Lanka. All our services are completely free of charge.`,
        ],
        [
          '2. Reaching you',
          'We always do our best to reach you quickly. Response times can depend on vehicle availability, distance and road conditions. For urgent help, please call our hotline.',
        ],
        [
          '3. Our kind request',
          'Please share accurate details, request help only when it is genuinely needed, and treat our team with respect.',
        ],
        [
          '4. Website content',
          `The information on this website is provided in good faith and may change from time to time. The content belongs to ${LEGAL_NAME}.`,
        ],
        [
          '5. Changes to these terms',
          'We may update these terms from time to time. The latest version will always be on this page.',
        ],
      ],
      contact: ['6. Contact us', 'If you have any questions, please feel free to contact us:'],
    },
  },
  si: {
    updated: ['අවසන් වරට යාවත්කාලීන කළේ: ', '2026 ඔක්තෝබර් 27'],
    contacts: ['ආයතනය: ', 'පැය 24 ඇමතුම් අංකය: ', 'WhatsApp: ', 'අන්තර්ජාලය හරහා: ', 'සම්බන්ධ කර ගැනීමේ පිටුව'],
    privacy: {
      title: 'රහස්‍යතා ප්‍රතිපත්තිය',
      intro: `${LEGAL_NAME} ශ්‍රී ලංකාව පුරා නොමිලේ ජනාසා ප්‍රවාහනය, හදිසි වෛද්‍ය ප්‍රවාහනය සහ ඔක්සිජන් සහාය ලබා දෙයි. අපි ඔබගේ රහස්‍යතාවයට ගරු කරන අතර, ඔබගේ තොරතුරු භාවිත කරන්නේ ඔබට උදව් කිරීමට පමණි.`,
      sections: [
        [
          '1. අප එකතු කරන තොරතුරු',
          'ඔබ දුරකථනයෙන්, WhatsApp හරහා හෝ ඉල්ලීම් පෝරමය හරහා අප හා සම්බන්ධ වන විට, ඔබගේ නම, දුරකථන අංකය, සහාය අවශ්‍ය පුද්ගලයාගේ නම සහ ගමන ආරම්භ වන හා අවසන් වන ස්ථාන අපි විමසමු. අපි ලුහුබැඳීමේ හෝ වෙළඳ දැන්වීම් කුකීස් භාවිත නොකරමු.',
        ],
        [
          '2. අප එය භාවිත කරන ආකාරය',
          'ඔබ ඉල්ලන සේවාව සංවිධානය කිරීමට පමණි — ඔබ හා සම්බන්ධ වීමට, වාහනයක් යැවීමට සහ අපගේ හවුල්කාර සමිති හෝ රෝහල සමඟ සම්බන්ධීකරණය කිරීමට. අපි කිසි විටෙකත් ඔබගේ තොරතුරු විකුණන්නේ හෝ වෙළඳ දැන්වීම් සඳහා භාවිත කරන්නේ නැත.',
        ],
        [
          '3. තොරතුරු බෙදා ගැනීම',
          'අපි ඔබගේ විස්තර බෙදා ගන්නේ අපගේ හවුල්කාර ජනාසා සමිති සහ රියදුරන් වැනි, ඔබගේ සේවාව සැපයීමට සම්බන්ධ අය සමඟ පමණක්, හෝ නීතියෙන් අවශ්‍ය වූ විට පමණි.',
        ],
        [
          '4. ඔබගේ තොරතුරු ආරක්ෂිතව තබා ගැනීම',
          'අපි ඔබගේ තොරතුරු ආරක්ෂිතව තබා ගන්නා අතර, 2022 අංක 9 දරන පුද්ගලික දත්ත ආරක්ෂණ පනතට අනුකූලව, අවශ්‍ය කාලය පමණක් ඒවා තබා ගනිමු.',
        ],
        ['5. ඔබගේ තේරීම්', 'ඔබගේ තොරතුරු බැලීමට, නිවැරදි කිරීමට හෝ මකා දැමීමට ඕනෑම වේලාවක අප හා සම්බන්ධ විය හැකිය.'],
      ],
      contact: ['6. අප හා සම්බන්ධ වන්න', 'ඔබට කිසියම් ප්‍රශ්නයක් ඇත්නම්, අප හා සම්බන්ධ වීමට නිදහස් වන්න:'],
    },
    terms: {
      title: 'සේවා කොන්දේසි',
      intro: 'මෙම වෙබ් අඩවිය හෝ අපගේ සේවා භාවිත කිරීමෙන්, ඔබ මෙම සරල කොන්දේසිවලට එකඟ වේ.',
      sections: [
        [
          '1. අපගේ සේවා',
          `${LEGAL_NAME}, අපගේ හවුල්කාර ජනාසා සමිති සමඟ එක්ව, ශ්‍රී ලංකාව පුරා ජනාසා ප්‍රවාහනය, හදිසි වෛද්‍ය ප්‍රවාහනය සහ ඔක්සිජන් සහාය ලබා දෙයි. අපගේ සියලු සේවා සම්පූර්ණයෙන්ම නොමිලේ සපයනු ලැබේ.`,
        ],
        [
          '2. අප ඔබ වෙත ළඟා වීම',
          'අපි සෑම විටම ඉක්මනින් ඔබ වෙත ළඟා වීමට උපරිම උත්සාහ කරමු. ප්‍රතිචාර කාලය වාහන ලබා ගත හැකි වීම, දුර සහ මාර්ග තත්ත්වයන් අනුව වෙනස් විය හැකිය. හදිසි සහාය සඳහා, කරුණාකර අපගේ ඇමතුම් අංකය අමතන්න.',
        ],
        [
          '3. අපගේ කාරුණික ඉල්ලීම',
          'කරුණාකර නිවැරදි විස්තර ලබා දෙන්න, සැබවින්ම අවශ්‍ය විට පමණක් සහාය ඉල්ලන්න, සහ අපගේ කණ්ඩායමට ගෞරවයෙන් සලකන්න.',
        ],
        [
          '4. වෙබ් අඩවි අන්තර්ගතය',
          `මෙම වෙබ් අඩවියේ තොරතුරු යහපත් අදහසින් ලබා දී ඇති අතර කලින් කලට වෙනස් විය හැකිය. මෙහි අන්තර්ගතය ${LEGAL_NAME} සතු වේ.`,
        ],
        [
          '5. මෙම කොන්දේසිවල වෙනස්කම්',
          'අපි කලින් කලට මෙම කොන්දේසි යාවත්කාලීන කළ හැකිය. නවතම අනුවාදය සෑම විටම මෙම පිටුවේ ඇත.',
        ],
      ],
      contact: ['6. අප හා සම්බන්ධ වන්න', 'ඔබට කිසියම් ප්‍රශ්නයක් ඇත්නම්, අප හා සම්බන්ධ වීමට නිදහස් වන්න:'],
    },
  },
  ta: {
    updated: ['இறுதியாகப் புதுப்பிக்கப்பட்டது: ', '27 அக்டோபர் 2026'],
    contacts: ['நிறுவனம்: ', '24/7 அவசர அழைப்பு: ', 'WhatsApp: ', 'இணையவழி: ', 'தொடர்புகொள்ளும் பக்கம்'],
    privacy: {
      title: 'தனியுரிமைக் கொள்கை',
      intro: `${LEGAL_NAME} இலங்கை முழுவதும் இலவச ஜனாஸா போக்குவரத்து, அவசர மருத்துவப் போக்குவரத்து மற்றும் ஒட்சிசன் உதவியை வழங்குகிறது. உங்கள் தனியுரிமையை நாம் மதிக்கிறோம்; உங்களுக்கு உதவுவதற்காக மட்டுமே உங்கள் தகவல்களைப் பயன்படுத்துகிறோம்.`,
      sections: [
        [
          '1. நாம் சேகரிக்கும் தகவல்கள்',
          'நீங்கள் தொலைபேசி, WhatsApp அல்லது கோரிக்கைப் படிவம் மூலம் எம்மைத் தொடர்புகொள்ளும்போது, உங்கள் பெயர், தொலைபேசி இலக்கம், உதவி தேவைப்படுபவரின் பெயர், புறப்படும் இடம் மற்றும் சேருமிடம் ஆகியவற்றைக் கேட்கிறோம். நாம் கண்காணிப்பு அல்லது விளம்பரக் குக்கீகளைப் பயன்படுத்துவதில்லை.',
        ],
        [
          '2. நாம் அவற்றைப் பயன்படுத்தும் விதம்',
          'நீங்கள் கோரும் சேவையை ஏற்பாடு செய்வதற்கு மட்டுமே — உங்களைத் தொடர்புகொள்ள, வாகனத்தை அனுப்ப, மற்றும் எமது பங்காளர் சங்கங்கள் அல்லது வைத்தியசாலையுடன் ஒருங்கிணைக்க. உங்கள் தகவல்களை நாம் ஒருபோதும் விற்பதில்லை; விளம்பரங்களுக்காகப் பயன்படுத்துவதுமில்லை.',
        ],
        [
          '3. தகவல்களைப் பகிர்தல்',
          'எமது பங்காளர் ஜனாஸா சங்கங்கள் மற்றும் சாரதிகள் போன்ற, உங்கள் சேவையை வழங்குவதில் ஈடுபடுவோருடன் மட்டுமே, அல்லது சட்டப்படி தேவைப்படும்போது மட்டுமே உங்கள் விவரங்களைப் பகிர்கிறோம்.',
        ],
        [
          '4. உங்கள் தகவல்களைப் பாதுகாத்தல்',
          '2022 ஆம் ஆண்டின் 9 ஆம் இலக்க தனிப்பட்ட தரவுப் பாதுகாப்புச் சட்டத்துக்கு அமைய, உங்கள் தகவல்களைப் பாதுகாப்பாகவும் தேவையான காலம் வரை மட்டுமே வைத்திருக்கிறோம்.',
        ],
        ['5. உங்கள் தெரிவுகள்', 'உங்கள் தகவல்களைப் பார்க்க, திருத்த அல்லது நீக்க எந்த நேரத்திலும் எம்மைத் தொடர்புகொள்ளலாம்.'],
      ],
      contact: ['6. எம்மைத் தொடர்புகொள்ள', 'ஏதேனும் கேள்விகள் இருப்பின், தயங்காமல் எம்மைத் தொடர்புகொள்ளுங்கள்:'],
    },
    terms: {
      title: 'சேவை நிபந்தனைகள்',
      intro: 'இந்த இணையதளத்தை அல்லது எமது சேவைகளைப் பயன்படுத்துவதன் மூலம், இந்த எளிய நிபந்தனைகளுக்கு நீங்கள் உடன்படுகிறீர்கள்.',
      sections: [
        [
          '1. எமது சேவைகள்',
          `${LEGAL_NAME}, எமது பங்காளர் ஜனாஸா சங்கங்களுடன் இணைந்து, இலங்கை முழுவதும் ஜனாஸா போக்குவரத்து, அவசர மருத்துவப் போக்குவரத்து மற்றும் ஒட்சிசன் உதவியை வழங்குகிறது. எமது அனைத்துச் சேவைகளும் முற்றிலும் இலவசமாக வழங்கப்படுகின்றன.`,
        ],
        [
          '2. உங்களை அடைதல்',
          'விரைவாக உங்களை அடைய நாம் எப்போதும் இயன்றவரை முயற்சிக்கிறோம். வாகனங்களின் கிடைப்பனவு, தூரம் மற்றும் வீதி நிலைமைகளைப் பொறுத்துப் பதிலளிக்கும் நேரம் மாறுபடலாம். அவசர உதவிக்கு, தயவுசெய்து எமது அவசர அழைப்பு இலக்கத்தை அழையுங்கள்.',
        ],
        [
          '3. எமது அன்பான வேண்டுகோள்',
          'தயவுசெய்து சரியான விவரங்களை வழங்குங்கள், உண்மையில் தேவைப்படும்போது மட்டுமே உதவி கோருங்கள், எமது குழுவினரை மரியாதையுடன் நடத்துங்கள்.',
        ],
        [
          '4. இணையதள உள்ளடக்கம்',
          `இந்த இணையதளத்திலுள்ள தகவல்கள் நல்லெண்ணத்துடன் வழங்கப்படுகின்றன; அவை அவ்வப்போது மாறலாம். இங்குள்ள உள்ளடக்கம் ${LEGAL_NAME} க்குச் சொந்தமானது.`,
        ],
        [
          '5. இந்த நிபந்தனைகளில் மாற்றங்கள்',
          'இந்த நிபந்தனைகளை நாம் அவ்வப்போது புதுப்பிக்கலாம். சமீபத்திய பதிப்பு எப்போதும் இந்தப் பக்கத்தில் இருக்கும்.',
        ],
      ],
      contact: ['6. எம்மைத் தொடர்புகொள்ள', 'ஏதேனும் கேள்விகள் இருப்பின், தயங்காமல் எம்மைத் தொடர்புகொள்ளுங்கள்:'],
    },
  },
};

const legalPage = (page, text) => {
  const { title, intro, sections, contact: [contactHeading, contactIntro] } = text[page];
  return {
    page,
    title,
    body: [
      p(b(text.updated[0]), text.updated[1]),
      p(intro),
      ...sections.flatMap(([heading, paragraph]) => [h2(heading), p(paragraph)]),
      h2(contactHeading),
      p(contactIntro),
      legalContacts(text.contacts),
    ],
  };
};

// English first, so the Sinhala and Tamil versions can be added to the same entries.
const legalPages = Object.fromEntries(
  Object.entries(legalText).map(([locale, text]) => [locale, [legalPage('privacy', text), legalPage('terms', text)]]),
);

// The CMS creates English placeholder legal pages on startup (src/i18n-setup.ts, notice "Draft —
// pending legal review"). Replace those with the full text and add the missing translations; pages
// an editor has changed are left alone unless `replace` is set (npm run seed -- --replace-legal).
const isLegalPlaceholder = (entry) => entry.notice?.startsWith('Draft — pending legal review');

const seedLegalPages = async (strapi, { replace = false } = {}) => {
  const uid = 'api::legal-page.legal-page';
  for (const [locale, pages] of Object.entries(legalPages)) {
    // No notice box on these pages; send it empty so an old placeholder notice is cleared too.
    for (const data of pages.map((page) => ({ notice: null, ...page }))) {
      const label = `${uid} ${data.page} (${locale})`;
      const english = locale === 'en' ? undefined : await strapi.documents(uid).findFirst({ locale: 'en', filters: { page: data.page } });
      let existing = await strapi.documents(uid).findFirst({ locale, filters: { page: data.page } });
      if (existing && !replace && !isLegalPlaceholder(existing)) {
        console.log(`skip    ${label} (already has content)`);
        continue;
      }
      // A translation saved as its own entry instead of on the English one: remove it, so the
      // page has one entry with every language.
      if (replace && english) {
        const strays = await strapi.documents(uid).findMany({ locale, filters: { page: data.page, documentId: { $ne: english.documentId } } });
        for (const stray of strays) {
          await strapi.documents(uid).delete({ documentId: stray.documentId, locale });
          console.log(`deleted ${label} (separate entry ${stray.documentId})`);
        }
        if (strays.some((stray) => stray.documentId === existing?.documentId)) existing = undefined;
      }
      // A translation is added to the English entry for the same page.
      const documentId = existing?.documentId ?? english?.documentId;
      if (documentId) {
        await strapi.documents(uid).update({ documentId, locale, data, status: 'published' });
      } else {
        await strapi.documents(uid).create({ locale, data, status: 'published' });
      }
      console.log(`${existing ? 'updated' : 'created'} ${label}`);
    }
  }
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
// the sheet's details (including coordinates, where the sheet has them) while keeping their photos,
// visibility and vehicle payment notes.
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

// Sinhala and Tamil names for the partner societies, keyed by the English name in the admin.
// [Sinhala, Tamil]. Place names use their usual local spelling; please have them checked.
const partnerNameTranslations = {
  'Al Fathah Janaza Welfare Organization Sainthamaruthu': ['අල් ෆතාහ් ජනාසා සුබසාධක සංවිධානය - සායින්දමරුදු', 'அல் ஃபத்தாஹ் ஜனாஸா நலன்புரி அமைப்பு - சாய்ந்தமருது'],
  'ISWAA Janaza and Emergency Service': ['ISWAA ජනාසා සහ හදිසි සේවය', 'ISWAA ஜனாஸா மற்றும் அவசர சேவை'],
  'Irakkamam Grand Masjidh Janaza Foundation': ['ඉරක්කාමම් මහ මස්ජිදයේ ජනාසා පදනම', 'இறக்காமம் பெரிய பள்ளிவாசல் ஜனாஸா அறக்கட்டளை'],
  'Janaza Welfare Association - Sammanthurai': ['ජනාසා සුබසාධක සංගමය - සම්මාන්තුරේ', 'ஜனாஸா நலன்புரிச் சங்கம் - சம்மாந்துறை'],
  'Janaza Welfare Organization Maligaikadu': ['ජනාසා සුබසාධක සංවිධානය - මාලිගෛකාඩු', 'ஜனாஸா நலன்புரி அமைப்பு - மாளிகைக்காடு'],
  'Janaza Welfare Services - Addalaichenai': ['ජනාසා සුබසාධක සේවා - අඩ්ඩාලච්චේන', 'ஜனாஸா நலன்புரிச் சேவைகள் - அட்டாளைச்சேனை'],
  'Maruthamunai Janaza Welfare Society': ['මරුදමුනේ ජනාසා සුබසාධක සමිතිය', 'மருதமுனை ஜனாஸா நலன்புரிச் சங்கம்'],
  'NJWA - Nintavur Janaza Welfare Association - Sri Lanka': ['NJWA - නින්දවූර් ජනාසා සුබසාධක සංගමය - ශ්‍රී ලංකාව', 'NJWA - நிந்தவூர் ஜனாஸா நலன்புரிச் சங்கம் - இலங்கை'],
  'Pottuvil Janaza Welfare Society': ['පොතුවිල් ජනාසා සුබසාධක සමිතිය', 'பொத்துவில் ஜனாஸா நலன்புரிச் சங்கம்'],
  'Y2K Janaza Welfare Service (Addalaichenai)': ['Y2K ජනාසා සුබසාධක සේවය (අඩ්ඩාලච්චේන)', 'Y2K ஜனாஸா நலன்புரிச் சேவை (அட்டாளைச்சேனை)'],
  'Young Birds Janaza Welfare Organization Kalmunai': ['යංග් බර්ඩ්ස් ජනාසා සුබසාධක සංවිධානය - කල්මුනේ', 'யங் பேர்ட்ஸ் ஜனாஸா நலன்புரி அமைப்பு - கல்முனை'],
  "Sainthamaruthu Janaza Welfare People's Council": ['සායින්දමරුදු ජනාසා සුබසාධක ජන සභාව', 'சாய்ந்தமருது ஜனாஸா நலன்புரி மக்கள் பேரவை'],
  "Janaza Welfare People's Organization - Mavadippalli": ['ජනාසා සුබසාධක ජන සංවිධානය - මාවඩිප්පල්ලි', 'ஜனாஸா நலன்புரி மக்கள் அமைப்பு - மாவடிப்பள்ளி'],
  'Badulla Janaza Welfare Association': ['බදුල්ල ජනාසා සුබසාධක සංගමය', 'பதுளை ஜனாஸா நலன்புரிச் சங்கம்'],
  'Diyatalawa Janaza Welfare Society': ['දියතලාව ජනාසා සුබසාධක සමිතිය', 'தியத்தலாவை ஜனாஸா நலன்புரிச் சங்கம்'],
  'Barakath Welfare Society, Kattankudy': ['බරකත් සුබසාධක සමිතිය, කාත්තන්කුඩි', 'பரகத் நலன்புரிச் சங்கம், காத்தான்குடி'],
  'Kalkudah Janaza Welfare Services': ['කල්කුඩා ජනාසා සුබසාධක සේවා', 'கல்குடா ஜனாஸா நலன்புரிச் சேவைகள்'],
  'Kattankudy Janaza Welfare Society': ['කාත්තන්කුඩි ජනාසා සුබසාධක සමිතිය', 'காத்தான்குடி ஜனாஸா நலன்புரிச் சங்கம்'],
  'Dehiwela Jumma Masjid': ['දෙහිවල ජුම්මා මස්ජිදය', 'தெஹிவளை ஜும்ஆ பள்ளிவாசல்'],
  'Hussain Rashard Janaza Foundation & Education': ['හුසේන් රෂාඩ් ජනාසා සහ අධ්‍යාපන පදනම', 'ஹுசைன் ரஷாட் ஜனாஸா மற்றும் கல்வி அறக்கட்டளை'],
  'Khair Welfare Association, Grandpass': ['කයිර් සුබසාධක සංගමය, ග්‍රෑන්ඩ්පාස්', 'கைர் நலன்புரிச் சங்கம், கிராண்ட்பாஸ்'],
  'Social Services & Janaza Society, Colombo-15': ['සමාජ සේවා සහ ජනාසා සමිතිය, කොළඹ 15', 'சமூக சேவைகள் மற்றும் ஜனாஸா சங்கம், கொழும்பு 15'],
  'Gintota Muhaitheen Jumma Masjid Janaza Service': ['ගින්තොට මුහියිද්දීන් ජුම්මා මස්ජිදයේ ජනාසා සේවය', 'கிந்தோட்டை முஹியித்தீன் ஜும்ஆ பள்ளிவாசல் ஜனாஸா சேவை'],
  'Karapitiya Janaza Service, Galle': ['කරාපිටිය ජනාසා සේවය, ගාල්ල', 'கராப்பிட்டிய ஜனாஸா சேவை, காலி'],
  'Katugoda Janaza Service': ['කටුගොඩ ජනාසා සේවය', 'கட்டுகொடை ஜனாஸா சேவை'],
  'Al Masjidus Subhani Grand Masjid, Kal-Eliya': ['අල් මස්ජිදුස් සුබ්හානි මහ මස්ජිදය, කල්-එළිය', 'அல் மஸ்ஜிதுஸ் ஸுப்ஹானி பெரிய பள்ளிவாசல், கல்எலிய'],
  'Poruthota Janaza Welfare Association - PJWA': ['පොරුතොට ජනාසා සුබසාධක සංගමය - PJWA', 'பொருதோட்டை ஜனாஸா நலன்புரிச் சங்கம் - PJWA'],
  'Thaiba Welfare Association': ['තයිබා සුබසාධක සංගමය', 'தைபா நலன்புரிச் சங்கம்'],
  'Beruwela Janaza Service': ['බේරුවල ජනාසා සේවය', 'பேருவளை ஜனாஸா சேவை'],
  'Ambarapola Reunion Welfare Society': ['අඹරපොළ රීයූනියන් සුබසාධක සමිතිය', 'அம்பரப்பொல ரீயூனியன் நலன்புரிச் சங்கம்'],
  'Galagedara Janaza Welfare Society': ['ගලගෙදර ජනාසා සුබසාධක සමිතිය', 'கலகெதர ஜனாஸா நலன்புரிச் சங்கம்'],
  'Hemmathagama Masjid Welfare Association': ['හෙම්මාතගම මස්ජිද් සුබසාධක සංගමය', 'ஹெம்மாத்தகம பள்ளிவாசல் நலன்புரிச் சங்கம்'],
  'Illukuwatta Janaza Welfare Society': ['ඉලුක්වත්ත ජනාසා සුබසාධක සමිතිය', 'இலுக்குவத்தை ஜனாஸா நலன்புரிச் சங்கம்'],
  'Janaza Service - New Elpitiya, Gelioya': ['ජනාසා සේවය - නව එල්පිටිය, ගෙලිඔය', 'ஜனாஸா சேவை - நியூ எல்பிட்டிய, கெலிஓயா'],
  'Madulbowa Bathibiya Janaza Welfare Association': ['මඩුල්බෝව බතිබිය ජනාසා සුබසාධක සංගමය', 'மடுல்போவ பதிபிய ஜனாஸா நலன்புரிச் சங்கம்'],
  'United Janaza Service - Kegalle Grand Jumma Mosque': ['එක්සත් ජනාසා සේවය - කෑගල්ල මහ ජුම්මා පල්ලිය', 'ஐக்கிய ஜனாஸா சேவை - கேகாலை பெரிய ஜும்ஆ பள்ளிவாசல்'],
  'Elabodagama Janaza Society': ['ඇලබොඩගම ජනාසා සමිතිය', 'எலபொடகம ஜனாஸா சங்கம்'],
  "Matale Nadhwathu Is'aafil Janaza": ['මාතලේ නද්වතු ඉස්ආෆිල් ජනාසා', 'மாத்தளை நத்வது இஸ்ஆஃபில் ஜனாஸா'],
  'Buhary Janaza Welfare Foundation': ['බුහාරි ජනාසා සුබසාධක පදනම', 'புஹாரி ஜனாஸா நலன்புரி அறக்கட்டளை'],
  'Nuwara Eliya Hawaeliya Janaza Society': ['නුවරඑළිය හාවාඑළිය ජනාසා සමිතිය', 'நுவரெலியா ஹாவாஎலிய ஜனாஸா சங்கம்'],
  'Al Wadha Janaza Welfare Services': ['අල් වධා ජනාසා සුබසාධක සේවා', 'அல் வதா ஜனாஸா நலன்புரிச் சேவைகள்'],
  'Chilaw Janaza Welfare Association': ['හලාවත ජනාසා සුබසාධක සංගමය', 'சிலாபம் ஜனாஸா நலன்புரிச் சங்கம்'],
  'ETC Janaza Welfare Society - Katpitiya': ['ETC ජනාසා සුබසාධක සමිතිය - කල්පිටිය', 'ETC ஜனாஸா நலன்புரிச் சங்கம் - கற்பிட்டி'],
  'Janaza Foundation Kalpitiya': ['ජනාසා පදනම - කල්පිටිය', 'ஜனாஸா அறக்கட்டளை - கற்பிட்டி'],
  'Minan Janaza Welfare Society Aandankanni': ['මිනාන් ජනාසා සුබසාධක සමිතිය - ආණ්ඩාන්කන්නි', 'மினான் ஜனாஸா நலன்புரிச் சங்கம் - ஆண்டான்கன்னி'],
  'Puttalam Janaza Welfare Society': ['පුත්තලම ජනාසා සුබසාධක සමිතිය', 'புத்தளம் ஜனாஸா நலன்புரிச் சங்கம்'],
  'Silmiyapura Janaza Society': ['සිල්මියාපුර ජනාසා සමිතිය', 'சில்மியாபுர ஜனாஸா சங்கம்'],
  'Gurutawala Janaza Services': ['ගුරුතලාව ජනාසා සේවා', 'குருத்தலாவ ஜனாஸா சேவைகள்'],
  'Janaza Services Jannath Jumma Masjid': ['ජනාසා සේවා - ජන්නත් ජුම්මා මස්ජිදය', 'ஜனாஸா சேவைகள் - ஜன்னத் ஜும்ஆ பள்ளிவாசல்'],
  'Jamaliya Janaza Welfare Society': ['ජමාලියා ජනාසා සුබසාධක සමිතිය', 'ஜமாலியா ஜனாஸா நலன்புரிச் சங்கம்'],
  'Kanthale Janaza Welfare Society': ['කන්තලේ ජනාසා සුබසාධක සමිතිය', 'கந்தளாய் ஜனாஸா நலன்புரிச் சங்கம்'],
  'Kinniya Janaza Welfare Association': ['කින්නියා ජනාසා සුබසාධක සංගමය', 'கிண்ணியா ஜனாஸா நலன்புரிச் சங்கம்'],
  'Muthur Janaza Society': ['මූදූර් ජනාසා සමිතිය', 'மூதூர் ஜனாஸா சங்கம்'],
  'Sonehavaadi Janaza Society - Trincomalee Town': ['සෝනගවාඩි ජනාසා සමිතිය - ත්‍රිකුණාමල නගරය', 'சோனகவாடி ஜனாஸா சங்கம் - திருகோணமலை நகரம்'],
  'Thoppur Janaza Welfare Society': ['තෝප්පූර් ජනාසා සුබසාධක සමිතිය', 'தோப்பூர் ஜனாஸா நலன்புரிச் சங்கம்'],
  'Trincomalee Janaza Society (name to be confirmed)': ['ත්‍රිකුණාමල ජනාසා සමිතිය (නම තහවුරු කළ යුතුය)', 'திருகோணமலை ஜனாஸா சங்கம் (பெயர் உறுதிப்படுத்தப்பட வேண்டும்)'],
  'Vavuniya Pattanichoor Janaza Welfare Co-Op Society': ['වව්නියාව පට්ටනිච්චූර් ජනාසා සුබසාධක සමුපකාර සමිතිය', 'வவுனியா பட்டாணிச்சூர் ஜனாஸா நலன்புரிக் கூட்டுறவுச் சங்கம்'],
};

// English entries that were saved with their Tamil name: [Tamil name, English name].
const partnerEnglishNames = [
  ['சாய்ந்தமருது ஜனாஸா நலன்புரி மக்கள் பேரவை', "Sainthamaruthu Janaza Welfare People's Council"],
  ['ஜனாஸா நலன்புரி மக்கள் அமைப்பு - Mavadippalli', "Janaza Welfare People's Organization - Mavadippalli"],
];

// Adds the Sinhala and Tamil versions of each partner society (npm run seed -- --translate-partners).
// The name is translated; president and secretary names stay as written in English. Phones,
// vehicles, map location and photos are shared by every language. Existing translations are kept.
const translatePartners = async (strapi) => {
  const uid = 'api::partner.partner';
  const byKey = new Map(Object.entries(partnerNameTranslations).map(([name, names]) => [partnerKey(name), names]));
  const partners = await strapi.documents(uid).findMany({ locale: 'en', limit: 1000 });
  console.log(`found   ${partners.length} English partner societies`);
  const counts = { added: 0, kept: 0 };
  const englishNames = new Map(partnerEnglishNames.map(([tamil, english]) => [partnerKey(tamil), english]));
  for (const partner of partners) {
    const englishName = englishNames.get(partnerKey(partner.name));
    if (englishName) {
      await strapi.documents(uid).update({ documentId: partner.documentId, locale: 'en', data: { name: englishName } });
      console.log(`renamed en ${partner.name} -> ${englishName}`);
      partner.name = englishName;
    }
    const names = byKey.get(partnerKey(partner.name));
    if (!names) {
      console.log(`        no translation for: ${partner.name}`);
      continue;
    }
    for (const [locale, name] of [['si', names[0]], ['ta', names[1]]]) {
      if (await strapi.documents(uid).findOne({ documentId: partner.documentId, locale })) {
        counts.kept += 1;
        continue;
      }
      const data = { name, presidentName: partner.presidentName, secretaryName: partner.secretaryName };
      await strapi.documents(uid).update({ documentId: partner.documentId, locale, data });
      counts.added += 1;
      console.log(`added   ${locale} ${partner.name}`);
    }
  }
  console.log(`translated ${uid} (${counts.added} added, ${counts.kept} already there)`);
};

// President / secretary names in Sinhala and Tamil script, built word by word so a name is spelled
// the same everywhere: [Sinhala, Tamil]. Please have the spellings checked by someone who knows them.
const nameWords = {
  Aathif: ['ආතිෆ්', 'ஆதிஃப்'], Abdul: ['අබ්දුල්', 'அப்துல்'], Ajmal: ['අජ්මල්', 'அஜ்மல்'], Akram: ['අක්‍රම්', 'அக்ரம்'],
  Aman: ['අමාන්', 'அமான்'], Ameen: ['අමීන්', 'அமீன்'], Aneef: ['අනීෆ්', 'அனீஃப்'], Arshad: ['අර්ෂාද්', 'அர்ஷாத்'],
  Ashraq: ['අෂ්රක්', 'அஷ்ரக்'], Aslam: ['අස්ලම්', 'அஸ்லம்'], Asmi: ['අස්මි', 'அஸ்மி'], Azeem: ['අසීම්', 'அஸீம்'],
  Buhari: ['බුහාරි', 'புஹாரி'], Faham: ['ෆහාම්', 'ஃபஹாம்'], Fahim: ['ෆහීම්', 'ஃபஹீம்'], Fahis: ['ෆහීස්', 'ஃபஹீஸ்'],
  Fairoos: ['ෆයිරූස්', 'ஃபைரூஸ்'], Fais: ['ෆයිස්', 'ஃபைஸ்'], Faizar: ['ෆයිසාර්', 'ஃபைஸார்'], Faleel: ['ෆලීල්', 'ஃபலீல்'],
  Fasly: ['ෆස්ලි', 'ஃபஸ்லி'], Fasmi: ['ෆස්මි', 'ஃபஸ்மி'], Firthous: ['ෆිර්දවුස්', 'ஃபிர்தௌஸ்'], Fowsul: ['ෆව්සුල්', 'ஃபௌசுல்'],
  Haafiz: ['හාෆිස්', 'ஹாஃபிழ்'], Hafeel: ['හාෆීල්', 'ஹாஃபீல்'], Haji: ['හාජි', 'ஹாஜி'], Hajiyar: ['හාජියාර්', 'ஹாஜியார்'],
  Hameed: ['හමීද්', 'ஹமீத்'], Haq: ['හක්', 'ஹக்'], Haris: ['හාරිස්', 'ஹாரிஸ்'], Haroon: ['හාරූන්', 'ஹாரூன்'],
  Hashimdeen: ['හාෂිම්දීන්', 'ஹாஷிம்தீன்'], Hussain: ['හුසේන්', 'ஹுசைன்'], Ibrahim: ['ඉබ්රාහිම්', 'இப்ராஹிம்'],
  Iftikhar: ['ඉෆ්තිකාර්', 'இஃப்திகார்'], Ihsan: ['ඉහ්සාන්', 'இஹ்ஸான்'], Imam: ['ඉමාම්', 'இமாம்'],
  Imthiyas: ['ඉම්තියාස්', 'இம்தியாஸ்'], Inthiyas: ['ඉන්තියාස්', 'இந்தியாஸ்'], Irshad: ['ඉර්ෂාද්', 'இர்ஷாத்'],
  Ismail: ['ඉස්මයිල්', 'இஸ்மாயில்'], Jabbar: ['ජබ්බාර්', 'ஜப்பார்'], Janoon: ['ජනූන්', 'ஜனூன்'], Jawfer: ['ජව්ෆර්', 'ஜௌஃபர்'],
  Jesmin: ['ජෙස්මින්', 'ஜெஸ்மின்'], Kaleel: ['කලීල්', 'கலீல்'], Kuraisi: ['කුරෙයිසි', 'குரைசி'], Laafir: ['ලාෆිර්', 'லாஃபிர்'],
  Maajid: ['මාජිද්', 'மாஜித்'], Mahzoom: ['මහ්සූම්', 'மஹ்ஸூம்'], Majeed: ['මජීද්', 'மஜீத்'], Manaf: ['මනාෆ්', 'மனாஃப்'],
  Mansoor: ['මන්සූර්', 'மன்சூர்'], Marsook: ['මර්සූක්', 'மர்சூக்'], Moulavi: ['මවුලවි', 'மௌலவி'], Mufthi: ['මුෆ්ති', 'முஃப்தி'],
  Munawaar: ['මුනව්වර්', 'முனவ்வர்'], Munawwar: ['මුනව්වර්', 'முனவ்வர்'], Mursith: ['මුර්සිත්', 'முர்சித்'],
  Nafar: ['නෆාර්', 'நஃபார்'], Nasar: ['නසාර්', 'நஸார்'], Naseer: ['නසීර්', 'நஸீர்'], Nawas: ['නවාස්', 'நவாஸ்'],
  Nawfar: ['නව්ෆර්', 'நௌஃபர்'], Nayeem: ['නයීම්', 'நயீம்'], Neemathullah: ['නීමතුල්ලා', 'நீமத்துல்லாஹ்'], Nihar: ['නිහාර්', 'நிஹார்'],
  Niyas: ['නියාස්', 'நியாஸ்'], Niyasdeen: ['නියාස්දීන්', 'நியாஸ்தீன்'], Nusrath: ['නුස්රත්', 'நுஸ்ரத்'], Phi: ['ෆයි', 'ஃபை'],
  Rafaideen: ['රෆායිදීන්', 'ரஃபாய்தீன்'], Raheem: ['රහීම්', 'ரஹீம்'], Ramees: ['රමීස්', 'ரமீஸ்'], Ramsan: ['රම්සාන්', 'ரம்ஸான்'],
  Ramzeen: ['රම්සීන්', 'ரம்ஸீன்'], Rashard: ['රෂාඩ්', 'ரஷாட்'], Raslan: ['රස්ලාන්', 'ரஸ்லான்'], Rauf: ['රවුෆ්', 'ரவூஃப்'],
  Rifas: ['රිෆාස්', 'ரிஃபாஸ்'], Rimsath: ['රිම්සාත්', 'ரிம்ஸாத்'], Rislan: ['රිස්ලාන්', 'ரிஸ்லான்'], Rismi: ['රිස්මි', 'ரிஸ்மி'],
  Rismy: ['රිස්මි', 'ரிஸ்மி'], Riswan: ['රිස්වාන්', 'ரிஸ்வான்'], Riyal: ['රියාල්', 'ரியால்'], Riyas: ['රියාස්', 'ரியாஸ்'],
  Riyasdeen: ['රියාස්දීන්', 'ரியாஸ்தீன்'], Rizan: ['රිසාන්', 'ரிஸான்'], Rizvi: ['රිස්වි', 'ரிஸ்வி'], Sadhir: ['සාදිර්', 'ஸாதிர்'],
  Salam: ['සලාම්', 'ஸலாம்'], Sanoon: ['සනූන්', 'ஸனூன்'], Shaheebullah: ['ෂහීබුල්ලා', 'ஷஹீபுல்லாஹ்'], Shiyam: ['ෂියාම්', 'ஷியாம்'],
  Siyaul: ['සියාවුල්', 'ஸியாவுல்'], Sulaiman: ['සුලෙයිමාන්', 'ஸுலைமான்'], Thahir: ['තාහිර්', 'தாஹிர்'], Thariq: ['තාරික්', 'தாரிக்'],
  Thariqshad: ['තාරික්ෂාද්', 'தாரிக்ஷாத்'], Usman: ['උස්මාන්', 'உஸ்மான்'], Yaasir: ['යාසිර්', 'யாஸிர்'], Yesir: ['යෙසිර්', 'யெஸிர்'],
};
const nameInitials = {
  A: ['ඒ', 'ஏ'], H: ['එච්', 'எச்'], K: ['කේ', 'கே'], M: ['එම්', 'எம்'], R: ['ආර්', 'ஆர்'], S: ['එස්', 'எஸ்'],
};
const nameRoles = {
  Treasurer: ['භාණ්ඩාගාරික', 'பொருளாளர்'],
  'Vice Chairman': ['උප සභාපති', 'உப தலைவர்'],
  Coordinator: ['සම්බන්ධීකාරක', 'ஒருங்கிணைப்பாளர்'],
  'Unani Doctor': ['යුනානි වෛද්‍ය', 'யூனானி வைத்தியர்'],
};

// "M.A.M. Nusrath Hajiyar (Treasurer)" in Sinhala (0) or Tamil (1); null if any part is unknown.
const transliterateName = (name, index) => {
  const [, base, role] = name.trim().match(/^(.*?)\s*(?:\((.+)\))?$/);
  const words = base.split(/\s+/).map((word) =>
    /^([A-Z]\.)+$/.test(word)
      ? word
          .slice(0, -1)
          .split('.')
          .map((letter) => nameInitials[letter]?.[index] && `${nameInitials[letter][index]}.`)
          .reduce((all, part) => (all === null || !part ? null : all + part), '')
      : nameWords[word]?.[index] ?? null,
  );
  const roleText = role === undefined ? '' : nameRoles[role]?.[index];
  if (words.includes(null) || roleText === undefined) return null;
  return words.join(' ') + (roleText ? ` (${roleText})` : '');
};

// Writes the president / secretary names in Sinhala and Tamil script (npm run seed -- --translate-names).
// A name an editor has already changed in that language is kept; an unknown name stays in English.
const translatePartnerNames = async (strapi) => {
  const uid = 'api::partner.partner';
  const partners = await strapi.documents(uid).findMany({ locale: 'en', limit: 1000 });
  console.log(`found   ${partners.length} English partner societies`);
  const unknown = new Set();
  let updated = 0;
  for (const partner of partners) {
    for (const [index, locale] of ['si', 'ta'].entries()) {
      const current = await strapi.documents(uid).findOne({ documentId: partner.documentId, locale });
      if (!current) continue;
      const data = {};
      for (const field of ['presidentName', 'secretaryName']) {
        const english = partner[field]?.trim();
        if (!english || current[field]?.trim() !== english) continue;
        const translated = transliterateName(english, index);
        if (translated) data[field] = translated;
        else unknown.add(english);
      }
      if (Object.keys(data).length === 0) continue;
      await strapi.documents(uid).update({ documentId: partner.documentId, locale, data });
      updated += 1;
      console.log(`updated ${locale} ${partner.name}`);
    }
  }
  console.log(`translated names (${updated} entries updated)`);
  for (const name of unknown) console.log(`        left in English: ${name}`);
};

// Saving content tells the website to regenerate after a short debounce (src/revalidate.ts);
// stay up long enough for that call to finish.
const waitForWebsite = async (strapi) => {
  console.log('waiting for the website to regenerate...');
  strapi.log.level = 'info';
  await new Promise((resolve) => setTimeout(resolve, 45_000));
};

const main = async () => {
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'error';
  try {
    // Overwrites the legal pages with the text above, whatever they contain now. Nothing else runs.
    if (process.argv.includes('--replace-legal')) {
      await seedLegalPages(app, { replace: true });
      await waitForWebsite(app);
      return;
    }
    if (process.argv.includes('--translate-partners')) {
      await translatePartners(app);
      await waitForWebsite(app);
      return;
    }
    if (process.argv.includes('--translate-names')) {
      await translatePartnerNames(app);
      await waitForWebsite(app);
      return;
    }
    await seedGlobal(app);
    await seedRegions(app);
    await seedPartners(app);
    await seedSingleType(app, 'api::home-page.home-page', homePage, { draftAndPublish: false });
    await seedSingleType(app, 'api::coverage-page.coverage-page', coveragePage, { draftAndPublish: true });
    await addPartnersSection(app);
    await seedSingleType(app, 'api::services-page.services-page', servicesPage, { draftAndPublish: true });
    await seedSingleType(app, 'api::contact-page.contact-page', contactPage, { draftAndPublish: true });
    await seedLegalPages(app);
  } finally {
    await app.destroy();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
