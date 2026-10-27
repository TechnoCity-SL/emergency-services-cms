// Fills empty content with the copy from the page designs, so editors only change what differs.
// Safe to re-run: anything that already has content is left alone.
//
//   npm run seed                      -> local SQLite
//   NODE_ENV=production npm run seed  -> Supabase (uses the production DATABASE_* settings)
//   npm run seed -- --replace-legal   -> only overwrite the Privacy Policy / Terms of Service pages
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
  'சாய்ந்தமருது ஜனாஸா நலன்புரி மக்கள் பேரவை': [7.39245, 81.834497],
  'Young Birds Janaza Welfare Organization Kalmunai': [7.415329, 81.825417],
  'Al Fathah Janaza Welfare Organization Sainthamaruthu': [7.39245, 81.834497],
  'Janaza Welfare Services - Addalaichenai': [7.248845, 81.8572],
  'Janaza Welfare Association - Sammanthurai': [7.363113, 81.798656],
  'NJWA - Nintavur Janaza Welfare Association - Sri Lanka': [7.348802, 81.845097],
  'ஜனாஸா நலன்புரி மக்கள் அமைப்பு - Mavadippalli': [7.372043, 81.821559],
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
const h3 = (text) => ({ type: 'heading', level: 3, children: [{ type: 'text', text }] });
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

// Contact block shared by the translated pages: [organisation, hotline, WhatsApp, online, contact page].
const legalContacts = ([org, hotline, whatsapp, online, contactPage]) =>
  ul(
    [b(org), LEGAL_NAME],
    [b(hotline), hotlineLink],
    [b(whatsapp), whatsappLink],
    [b(online), a('/contact', contactPage)],
  );

const legalPagesEn = [
  {
    page: 'privacy',
    title: 'Privacy Policy',
    body: [
      p(b('Last updated: '), LEGAL_UPDATED),
      p(
        `${LEGAL_NAME} (“we”, “us” or “our”) provides free Janaza (funeral) transport, emergency medical transport and oxygen supply across Sri Lanka, together with a network of partner Janaza societies. We understand that people usually contact us at one of the hardest moments of their lives. This Privacy Policy explains what personal information we collect, why we collect it, who we share it with and the choices you have.`,
      ),
      p(
        'We handle personal information in line with the Personal Data Protection Act, No. 9 of 2022 of Sri Lanka and other applicable law.',
      ),

      h2('1. Scope'),
      p(
        'This policy applies to information we collect through this website (including the transport request form), our hotlines, WhatsApp and any other channel through which you ask for our services. It does not cover third-party websites or apps that we link to, which have their own privacy policies.',
      ),

      h2('2. Information we collect'),
      h3('Information you give us'),
      p('When you request transport or oxygen support, by phone, WhatsApp or the website form, we may collect:'),
      ul(
        [b('Your details'), ' — your name and phone number, so our dispatch team can reach you.'],
        [b('Details of the person who needs help'), ' — the name of the patient or the deceased person.'],
        [b('Journey details'), ' — your city or area, the pickup location and the destination.'],
        [
          b('Information about the situation'),
          ' — anything you choose to tell us that helps us respond, such as the patient’s condition, oxygen needs, the hospital involved or the funeral arrangements.',
        ],
      ),
      p(
        'Please share only what is needed to arrange the service. If you give us information about another person, such as a relative, please make sure you are entitled to do so.',
      ),
      h3('Information collected automatically'),
      ul(
        [
          b('Technical data'),
          ' — when you use the website, your IP address and basic request data (such as browser type and the page requested) are processed by our hosting provider to deliver the site and keep it secure. We use your IP address briefly to limit repeated form submissions; we do not store it with your request.',
        ],
        [
          b('No tracking cookies'),
          ' — we do not use advertising or analytics cookies, and we do not track you across other websites. Your language choice is kept in the page address, not in a cookie.',
        ],
      ),

      h2('3. How we use your information'),
      p('We use your information only to:'),
      ul(
        'receive and respond to your request and send the nearest available vehicle;',
        'contact you about your request, including to confirm details or give you updates;',
        'coordinate with the partner society, driver, hospital or authority involved in the journey;',
        'keep records of the services we provide and plan our coverage;',
        'protect our service, staff and volunteers from misuse, fraud and false requests; and',
        'meet our legal obligations.',
      ),
      p(b('We never sell your personal information'), ', and we do not use it for advertising.'),

      h2('4. Our legal basis'),
      p('Depending on the situation, we process personal information because:'),
      ul(
        'it is necessary to protect someone’s life, health or safety (their vital interests);',
        'you have asked us to provide a service, or have given your consent;',
        'it is necessary to comply with the law; or',
        'it is in our legitimate interests to run, secure and improve a charitable service, where those interests are not outweighed by your rights.',
      ),

      h2('5. Health and other sensitive information'),
      p(
        'Requests for medical transport or oxygen may involve information about someone’s health, and Janaza requests involve information about a death. We treat this information as sensitive. We collect only what is needed to provide the service safely, limit access to the people involved in the response, and never use it for any unrelated purpose.',
      ),

      h2('6. Who we share information with'),
      p('We share personal information only where needed, with:'),
      ul(
        [
          b('Partner societies and drivers'),
          ' — the registered partner Janaza society or driver who carries out your journey.',
        ],
        [
          b('Hospitals and public authorities'),
          ' — where needed to complete a transfer or a release, or where the law requires it (for example, the police or the registrar of deaths).',
        ],
        [
          b('Service providers'),
          ' — companies that help us run the website and handle requests on our behalf, including website hosting (Vercel), email delivery of form requests to our dispatch team (Resend), content and image hosting, and WhatsApp (Meta) if you choose to contact us there. They may use the information only to provide their service to us.',
        ],
        [
          b('Maps'),
          ' — our coverage maps load map images from OpenStreetMap, so your browser shares your IP address with OpenStreetMap when you view them.',
        ],
      ),
      p(
        'We may also disclose information where required by law or a court order, or where necessary to protect the rights, safety or property of anyone.',
      ),

      h2('7. International transfers'),
      p(
        'Some of our service providers store or process data outside Sri Lanka. When this happens, we rely on providers that apply appropriate safeguards to protect your information, as required by Sri Lankan law.',
      ),

      h2('8. How long we keep information'),
      p(
        'We keep personal information only for as long as we need it for the purposes in this policy, including keeping service records and meeting legal or reporting obligations. After that, we delete it or anonymise it so that it no longer identifies anyone.',
      ),

      h2('9. How we protect information'),
      p(
        'We use reasonable technical and organisational measures to protect personal information, including encrypted (HTTPS) connections, access limited to the people who need it, and providers with recognised security practices. No method of transmission or storage is completely secure, but we work to protect your information and will act promptly if a problem arises.',
      ),

      h2('10. Your rights'),
      p('Subject to the law, you have the right to:'),
      ul(
        'ask what personal information we hold about you and receive a copy;',
        'ask us to correct information that is inaccurate or incomplete;',
        'ask us to delete your information, where we no longer need to keep it;',
        'withdraw your consent, where we rely on consent; and',
        'object to, or ask us to restrict, certain processing.',
      ),
      p(
        'To use any of these rights, contact us using the details below. We may need to confirm your identity before acting on a request. If you are not satisfied with our response, you may complain to the Data Protection Authority of Sri Lanka.',
      ),

      h2('11. Children'),
      p(
        'Our services are sometimes needed for children. In those cases we expect a parent, guardian or responsible adult to make the request and provide the information. We do not knowingly collect information directly from children for any other purpose.',
      ),

      h2('12. Changes to this policy'),
      p(
        'We may update this policy from time to time. The latest version will always be on this page, with the date it was last updated shown at the top.',
      ),

      h2('13. Contact us'),
      p('If you have questions about this policy or how we handle your information, contact us:'),
      ul(
        [b('Organisation: '), LEGAL_NAME],
        [b('24/7 hotline: '), hotlineLink],
        [b('WhatsApp: '), whatsappLink],
        [b('Online: '), a('/contact', 'Contact page')],
      ),
    ],
  },
  {
    page: 'terms',
    title: 'Terms of Service',
    body: [
      p(b('Last updated: '), LEGAL_UPDATED),
      p(
        `These Terms of Service (“Terms”) apply to your use of this website and to the services provided by ${LEGAL_NAME} (“we”, “us” or “our”) and our partner societies. By using the website or requesting a service, you agree to these Terms. If you do not agree, please do not use the website.`,
      ),

      h2('1. Our services'),
      p('We are a charitable service operating across Sri Lanka. Through our own vehicles and our network of registered partner Janaza societies, we provide:'),
      ul(
        [b('Janaza transport'), ' — dignified transport of the deceased, for example from a hospital or home to the place of burial.'],
        [b('Emergency medical transport'), ' — transfer of patients to and between hospitals and homes.'],
        [b('Oxygen supply'), ' — oxygen cylinders for use at home or during a patient transfer.'],
      ),
      p(
        'Where a journey is carried out by a partner society, that society is responsible for its vehicle, driver and crew. We coordinate the request and work with our partners to maintain the standards described on this website.',
      ),

      h2('2. Not a substitute for emergency medical care'),
      p(
        'Our medical transport and oxygen services support patients and families, but they are not a replacement for treatment by a doctor or for the national ambulance service. ',
        b('If someone’s life is in immediate danger, call 1990 (Suwa Seriya) or go to the nearest hospital.'),
        ' Oxygen should be used only as advised by a qualified medical professional.',
      ),

      h2('3. Requesting a service'),
      ul(
        'You can request a service by calling our hotline, by WhatsApp or through the website request form. For urgent requests, always call — form requests are reviewed by our dispatch team and may take longer to reach.',
        'A reference number from the website form confirms that we have received your request. It does not confirm that a vehicle has been assigned until our team contacts you.',
        'All services depend on vehicle and crew availability, distance, road and weather conditions and safety. We do our best to respond quickly, but we cannot guarantee a vehicle or a response or arrival time.',
        'We may prioritise requests by urgency, and we may decline or cancel a request where it is unsafe, falls outside our services, or where these Terms are not followed.',
      ),

      h2('4. Charges'),
      p(
        'All our services, including journeys carried out by our partner societies, are provided completely free of charge. Donations to support our work are always voluntary and are never a condition of receiving help. If anyone asks you for payment on our behalf, please report it to our hotline.',
      ),

      h2('5. Your responsibilities'),
      p('When you use our services, you agree to:'),
      ul(
        'give accurate and complete information, including the correct pickup location, destination and phone number;',
        'make requests only for genuine needs — false, prank or abusive requests take vehicles away from people in need and may be reported to the police;',
        'arrange any documents needed for the journey, such as a hospital discharge or transfer letter, or a death certificate or police clearance for Janaza transport;',
        'provide a family member or responsible adult to accompany the patient or the deceased where required;',
        'follow the reasonable safety instructions of the driver and crew; and',
        'treat our staff, volunteers and partners with respect. We may refuse or end a service where crew are threatened or abused.',
      ),

      h2('6. Use of this website'),
      p(
        'You may use this website only for lawful purposes. You must not misuse the request form, try to interfere with the website or its security, or use automated tools to submit requests or copy content.',
      ),
      p(
        'Information on the website, including coverage areas, partner societies, vehicles and contact numbers, is provided in good faith and updated regularly, but it may change without notice. Always call the hotline to confirm availability.',
      ),

      h2('7. Intellectual property'),
      p(
        `The content of this website, including text, graphics, logos and images, belongs to ${LEGAL_NAME} or is used with permission. You may share it for personal, non-commercial purposes, such as passing on our hotline number, but you may not otherwise copy, change or use it commercially without our written permission.`,
      ),

      h2('8. Third-party links and services'),
      p(
        'The website may link to, or use, services run by others, such as WhatsApp and OpenStreetMap. We are not responsible for their content, availability or privacy practices.',
      ),

      h2('9. Limitation of liability'),
      p(
        'We provide our services free of charge and in good faith. To the fullest extent permitted by law, we, our partner societies, staff and volunteers are not liable for any indirect or consequential loss, or for any delay or failure caused by circumstances beyond our reasonable control, such as traffic, weather, road closures, vehicle breakdown, public emergencies or incorrect information provided to us.',
      ),
      p(
        'Nothing in these Terms limits any liability that cannot be limited under the law of Sri Lanka, including liability for death or personal injury caused by negligence.',
      ),

      h2('10. Privacy'),
      p(
        'We handle personal information as described in our ',
        a('/privacy', 'Privacy Policy'),
        ', which forms part of these Terms.',
      ),

      h2('11. Changes to these Terms'),
      p(
        'We may update these Terms from time to time. The latest version will always be on this page, with the date it was last updated shown at the top. By continuing to use the website or our services after a change, you accept the updated Terms.',
      ),

      h2('12. Governing law'),
      p(
        'These Terms are governed by the laws of the Democratic Socialist Republic of Sri Lanka, and the courts of Sri Lanka have jurisdiction over any dispute arising from them.',
      ),

      h2('13. Contact us'),
      ul(
        [b('Organisation: '), LEGAL_NAME],
        [b('24/7 hotline: '), hotlineLink],
        [b('WhatsApp: '), whatsappLink],
        [b('Online: '), a('/contact', 'Contact page')],
      ),
    ],
  },
];

const legalPagesSi = [
  {
    page: 'privacy',
    title: 'රහස්‍යතා ප්‍රතිපත්තිය',
    body: [
      p(b('අවසන් වරට යාවත්කාලීන කළේ: '), '2026 ඔක්තෝබර් 27'),
      p(
        `${LEGAL_NAME} (“අපි” හෝ “අපගේ”) හවුල්කාර ජනාසා සමිති ජාලයක් සමඟ එක්ව, ශ්‍රී ලංකාව පුරා නොමිලේ ජනාසා (අවමංගල්‍ය) ප්‍රවාහනය, හදිසි වෛද්‍ය ප්‍රවාහනය සහ ඔක්සිජන් සැපයුම ලබා දෙයි. බොහෝ විට ජීවිතයේ දුෂ්කරම මොහොතක ජනතාව අප හා සම්බන්ධ වන බව අපි තේරුම් ගනිමු. අප එකතු කරන පුද්ගලික තොරතුරු මොනවාද, ඒවා එකතු කරන්නේ ඇයි, ඒවා බෙදා ගන්නේ කා සමඟද සහ ඔබට ඇති තේරීම් මොනවාද යන්න මෙම රහස්‍යතා ප්‍රතිපත්තිය පැහැදිලි කරයි.`,
      ),
      p(
        'අපි 2022 අංක 9 දරන ශ්‍රී ලංකා පුද්ගලික දත්ත ආරක්ෂණ පනතට සහ අදාළ අනෙකුත් නීතිවලට අනුකූලව පුද්ගලික තොරතුරු හසුරුවන්නෙමු.',
      ),

      h2('1. විෂය පථය'),
      p(
        'මෙම ප්‍රතිපත්තිය මෙම වෙබ් අඩවිය (ප්‍රවාහන ඉල්ලීම් පෝරමය ඇතුළුව), අපගේ ඇමතුම් අංක, WhatsApp සහ ඔබ අපගේ සේවා ඉල්ලා සිටින වෙනත් ඕනෑම මාර්ගයක් හරහා අප එකතු කරන තොරතුරුවලට අදාළ වේ. අප සබැඳි ලබා දෙන තෙවන පාර්ශ්ව වෙබ් අඩවි හෝ යෙදුම් මෙයට ඇතුළත් නොවන අතර, ඒවාට තමන්ගේම රහස්‍යතා ප්‍රතිපත්ති ඇත.',
      ),

      h2('2. අප එකතු කරන තොරතුරු'),
      h3('ඔබ අපට ලබා දෙන තොරතුරු'),
      p('ඔබ දුරකථනය, WhatsApp හෝ වෙබ් අඩවි පෝරමය හරහා ප්‍රවාහනය හෝ ඔක්සිජන් සහාය ඉල්ලා සිටින විට, අපි පහත තොරතුරු එකතු කර ගත හැකිය:'),
      ul(
        [b('ඔබගේ විස්තර'), ' — අපගේ යැවීමේ කණ්ඩායමට ඔබ හා සම්බන්ධ විය හැකි වන පරිදි ඔබගේ නම සහ දුරකථන අංකය.'],
        [b('සහාය අවශ්‍ය පුද්ගලයාගේ විස්තර'), ' — රෝගියාගේ හෝ මියගිය පුද්ගලයාගේ නම.'],
        [b('ගමනේ විස්තර'), ' — ඔබගේ නගරය හෝ ප්‍රදේශය, රැගෙන යන ස්ථානය සහ ගමනාන්තය.'],
        [
          b('තත්ත්වය පිළිබඳ තොරතුරු'),
          ' — රෝගියාගේ තත්ත්වය, ඔක්සිජන් අවශ්‍යතා, සම්බන්ධ රෝහල හෝ අවමංගල්‍ය කටයුතු වැනි, අපට ප්‍රතිචාර දැක්වීමට උපකාරී වන ඔබ ලබා දීමට තීරණය කරන ඕනෑම තොරතුරක්.',
        ],
      ),
      p(
        'කරුණාකර සේවාව සංවිධානය කිරීමට අවශ්‍ය තොරතුරු පමණක් ලබා දෙන්න. ඔබ ඥාතියෙකු වැනි වෙනත් පුද්ගලයෙකු පිළිබඳ තොරතුරු ලබා දෙන්නේ නම්, එසේ කිරීමට ඔබට අයිතියක් ඇති බව තහවුරු කර ගන්න.',
      ),
      h3('ස්වයංක්‍රීයව එකතු වන තොරතුරු'),
      ul(
        [
          b('තාක්ෂණික දත්ත'),
          ' — ඔබ වෙබ් අඩවිය භාවිත කරන විට, වෙබ් අඩවිය ලබා දීමට සහ එය ආරක්ෂිතව තබා ගැනීමට අපගේ සත්කාරක සේවා සපයන්නා ඔබගේ IP ලිපිනය සහ මූලික ඉල්ලීම් දත්ත (බ්‍රවුසර වර්ගය සහ ඉල්ලූ පිටුව වැනි) සකසයි. නැවත නැවත පෝරම ඉදිරිපත් කිරීම් සීමා කිරීම සඳහා අපි ඔබගේ IP ලිපිනය කෙටි කාලයක් භාවිත කරන නමුත්, එය ඔබගේ ඉල්ලීම සමඟ ගබඩා නොකරමු.',
        ],
        [
          b('ලුහුබැඳීමේ කුකීස් නැත'),
          ' — අපි වෙළඳ දැන්වීම් හෝ විශ්ලේෂණ කුකීස් භාවිත නොකරන අතර, අනෙකුත් වෙබ් අඩවි හරහා ඔබව ලුහුබඳින්නේ නැත. ඔබ තෝරාගත් භාෂාව කුකියක නොව පිටු ලිපිනයේ තබා ගනී.',
        ],
      ),

      h2('3. අප ඔබගේ තොරතුරු භාවිත කරන ආකාරය'),
      p('අපි ඔබගේ තොරතුරු භාවිත කරන්නේ පහත කටයුතු සඳහා පමණි:'),
      ul(
        'ඔබගේ ඉල්ලීම ලබාගෙන ප්‍රතිචාර දැක්වීමට සහ ළඟම ඇති වාහනය යැවීමට;',
        'විස්තර තහවුරු කිරීම හෝ යාවත්කාලීන තොරතුරු ලබා දීම ඇතුළුව, ඔබගේ ඉල්ලීම සම්බන්ධයෙන් ඔබ හා සම්බන්ධ වීමට;',
        'ගමනට සම්බන්ධ හවුල්කාර සමිතිය, රියදුරා, රෝහල හෝ බලධාරීන් සමඟ සම්බන්ධීකරණය කිරීමට;',
        'අප සපයන සේවා පිළිබඳ වාර්තා තබා ගැනීමට සහ අපගේ සේවා ආවරණය සැලසුම් කිරීමට;',
        'අපගේ සේවාව, කාර්ය මණ්ඩලය සහ ස්වේච්ඡා සේවකයන් අනිසි භාවිතයෙන්, වංචාවෙන් සහ ව්‍යාජ ඉල්ලීම්වලින් ආරක්ෂා කිරීමට; සහ',
        'අපගේ නෛතික බැඳීම් ඉටු කිරීමට.',
      ),
      p(b('අපි කිසි විටෙකත් ඔබගේ පුද්ගලික තොරතුරු විකුණන්නේ නැත'), ', එසේම ඒවා වෙළඳ දැන්වීම් සඳහා භාවිත කරන්නේද නැත.'),

      h2('4. අපගේ නෛතික පදනම'),
      p('තත්ත්වය අනුව, අපි පුද්ගලික තොරතුරු සකසන්නේ:'),
      ul(
        'යමෙකුගේ ජීවිතය, සෞඛ්‍යය හෝ ආරක්ෂාව ආරක්ෂා කිරීමට (ඔවුන්ගේ අත්‍යවශ්‍ය අවශ්‍යතා) එය අවශ්‍ය වන නිසා;',
        'ඔබ සේවාවක් ඉල්ලා ඇති නිසා හෝ ඔබගේ කැමැත්ත ලබා දී ඇති නිසා;',
        'නීතියට අනුකූල වීමට එය අවශ්‍ය වන නිසා; හෝ',
        'ඔබගේ අයිතිවාසිකම් ඉක්මවා නොයන අවස්ථාවලදී, පුණ්‍යායතන සේවාවක් පවත්වාගෙන යාම, ආරක්ෂා කිරීම සහ වැඩිදියුණු කිරීම අපගේ නීත්‍යානුකූල අවශ්‍යතාවයක් වන නිසා.',
      ),

      h2('5. සෞඛ්‍ය සහ අනෙකුත් සංවේදී තොරතුරු'),
      p(
        'වෛද්‍ය ප්‍රවාහනය හෝ ඔක්සිජන් සඳහා වන ඉල්ලීම්වලට යමෙකුගේ සෞඛ්‍යය පිළිබඳ තොරතුරු ඇතුළත් විය හැකි අතර, ජනාසා ඉල්ලීම්වලට මරණයක් පිළිබඳ තොරතුරු ඇතුළත් වේ. අපි මෙම තොරතුරු සංවේදී තොරතුරු ලෙස සලකමු. සේවාව ආරක්ෂිතව සැපයීමට අවශ්‍ය දේ පමණක් අපි එකතු කරන අතර, ඒවාට ප්‍රවේශය ප්‍රතිචාරයට සම්බන්ධ පුද්ගලයන්ට පමණක් සීමා කරන්නෙමු. එසේම ඒවා කිසිදු අසම්බන්ධ අරමුණක් සඳහා භාවිත නොකරන්නෙමු.',
      ),

      h2('6. අප තොරතුරු බෙදා ගන්නේ කා සමඟද'),
      p('අපි පුද්ගලික තොරතුරු බෙදා ගන්නේ අවශ්‍ය අවස්ථාවලදී පමණක්, පහත අය සමඟ ය:'),
      ul(
        [b('හවුල්කාර සමිති සහ රියදුරන්'), ' — ඔබගේ ගමන සිදු කරන ලියාපදිංචි හවුල්කාර ජනාසා සමිතිය හෝ රියදුරා.'],
        [
          b('රෝහල් සහ රාජ්‍ය බලධාරීන්'),
          ' — මාරු කිරීමක් හෝ නිදහස් කිරීමක් සම්පූර්ණ කිරීමට අවශ්‍ය වූ විට, හෝ නීතියෙන් අවශ්‍ය වූ විට (උදාහරණයක් ලෙස, පොලිසිය හෝ මරණ ලියාපදිංචි කිරීමේ රෙජිස්ට්‍රාර්).',
        ],
        [
          b('සේවා සපයන්නන්'),
          ' — වෙබ් අඩවි සත්කාරක සේවාව (Vercel), පෝරම ඉල්ලීම් අපගේ යැවීමේ කණ්ඩායමට ඊමේල් මගින් යැවීම (Resend), අන්තර්ගත සහ රූප සත්කාරක සේවා, සහ ඔබ WhatsApp හරහා අප හා සම්බන්ධ වීමට තීරණය කරන්නේ නම් WhatsApp (Meta) ඇතුළුව, අප වෙනුවෙන් වෙබ් අඩවිය පවත්වාගෙන යාමට සහ ඉල්ලීම් හැසිරවීමට උපකාර කරන ආයතන. ඔවුන්ට එම තොරතුරු භාවිත කළ හැක්කේ අපට ඔවුන්ගේ සේවාව සැපයීමට පමණි.',
        ],
        [
          b('සිතියම්'),
          ' — අපගේ ආවරණ සිතියම් OpenStreetMap වෙතින් සිතියම් රූප පූරණය කරන බැවින්, ඔබ ඒවා නරඹන විට ඔබගේ බ්‍රවුසරය ඔබගේ IP ලිපිනය OpenStreetMap සමඟ බෙදා ගනී.',
        ],
      ),
      p(
        'නීතියෙන් හෝ අධිකරණ නියෝගයකින් අවශ්‍ය වූ විට, හෝ ඕනෑම අයෙකුගේ අයිතිවාසිකම්, ආරක්ෂාව හෝ දේපළ ආරක්ෂා කිරීමට අවශ්‍ය වූ විට ද අපි තොරතුරු හෙළි කළ හැකිය.',
      ),

      h2('7. ජාත්‍යන්තර මාරු කිරීම්'),
      p(
        'අපගේ සමහර සේවා සපයන්නන් ශ්‍රී ලංකාවෙන් පිටත දත්ත ගබඩා කිරීම හෝ සැකසීම සිදු කරයි. එවැනි අවස්ථාවලදී, ශ්‍රී ලංකා නීතියට අනුව අවශ්‍ය පරිදි, ඔබගේ තොරතුරු ආරක්ෂා කිරීමට සුදුසු ආරක්ෂණ ක්‍රම යොදන සපයන්නන් මත අපි රඳා පවතිමු.',
      ),

      h2('8. අප තොරතුරු තබා ගන්නා කාලය'),
      p(
        'සේවා වාර්තා තබා ගැනීම සහ නෛතික හෝ වාර්තාකරණ බැඳීම් ඉටු කිරීම ඇතුළුව, මෙම ප්‍රතිපත්තියේ සඳහන් අරමුණු සඳහා අවශ්‍ය කාලය පමණක් අපි පුද්ගලික තොරතුරු තබා ගනිමු. ඉන්පසු, අපි ඒවා මකා දමන්නෙමු, නැතහොත් කිසිවෙකු හඳුනා ගත නොහැකි වන පරිදි නිර්නාමික කරන්නෙමු.',
      ),

      h2('9. අප තොරතුරු ආරක්ෂා කරන ආකාරය'),
      p(
        'සංකේතනය කළ (HTTPS) සම්බන්ධතා, අවශ්‍ය පුද්ගලයන්ට පමණක් සීමා කළ ප්‍රවේශය සහ පිළිගත් ආරක්ෂක ක්‍රම අනුගමනය කරන සපයන්නන් ඇතුළුව, පුද්ගලික තොරතුරු ආරක්ෂා කිරීමට අපි සාධාරණ තාක්ෂණික සහ සංවිධානාත්මක පියවර භාවිත කරමු. කිසිදු සම්ප්‍රේෂණ හෝ ගබඩා ක්‍රමයක් සම්පූර්ණයෙන්ම ආරක්ෂිත නොවුවද, අපි ඔබගේ තොරතුරු ආරක්ෂා කිරීමට කටයුතු කරන අතර, ගැටලුවක් ඇති වුවහොත් වහාම ක්‍රියා කරන්නෙමු.',
      ),

      h2('10. ඔබගේ අයිතිවාසිකම්'),
      p('නීතියට යටත්ව, ඔබට පහත අයිතිවාසිකම් ඇත:'),
      ul(
        'අප ඔබ පිළිබඳව තබා ඇති පුද්ගලික තොරතුරු මොනවාදැයි විමසීමට සහ ඒවායේ පිටපතක් ලබා ගැනීමට;',
        'සාවද්‍ය හෝ අසම්පූර්ණ තොරතුරු නිවැරදි කරන ලෙස ඉල්ලීමට;',
        'අපට තවදුරටත් තබා ගැනීමට අවශ්‍ය නොවන විට, ඔබගේ තොරතුරු මකා දමන ලෙස ඉල්ලීමට;',
        'අප කැමැත්ත මත රඳා පවතින අවස්ථාවලදී, ඔබගේ කැමැත්ත ඉල්ලා අස්කර ගැනීමට; සහ',
        'ඇතැම් තොරතුරු සැකසීම්වලට විරුද්ධ වීමට හෝ ඒවා සීමා කරන ලෙස ඉල්ලීමට.',
      ),
      p(
        'මෙම අයිතිවාසිකම් කිසිවක් භාවිත කිරීමට, පහත විස්තර භාවිතයෙන් අප හා සම්බන්ධ වන්න. ඉල්ලීමක් මත ක්‍රියා කිරීමට පෙර ඔබගේ අනන්‍යතාවය තහවුරු කිරීමට අපට අවශ්‍ය විය හැකිය. අපගේ ප්‍රතිචාරය ගැන ඔබ සෑහීමකට පත් නොවන්නේ නම්, ඔබට ශ්‍රී ලංකා දත්ත ආරක්ෂණ අධිකාරියට පැමිණිලි කළ හැකිය.',
      ),

      h2('11. ළමයින්'),
      p(
        'සමහර විට අපගේ සේවා ළමයින් සඳහා අවශ්‍ය වේ. එවැනි අවස්ථාවලදී, දෙමාපියෙකු, භාරකරුවෙකු හෝ වගකිව යුතු වැඩිහිටියෙකු ඉල්ලීම කර තොරතුරු ලබා දෙනු ඇතැයි අපි අපේක්ෂා කරමු. වෙනත් කිසිදු අරමුණක් සඳහා අපි දැනුවත්ව ළමයින්ගෙන් සෘජුවම තොරතුරු එකතු නොකරමු.',
      ),

      h2('12. මෙම ප්‍රතිපත්තියේ වෙනස්කම්'),
      p(
        'අපි කලින් කලට මෙම ප්‍රතිපත්තිය යාවත්කාලීන කළ හැකිය. නවතම අනුවාදය සෑම විටම මෙම පිටුවේ ඇති අතර, එය අවසන් වරට යාවත්කාලීන කළ දිනය ඉහළින්ම දක්වා ඇත.',
      ),

      h2('13. අප හා සම්බන්ධ වන්න'),
      p('මෙම ප්‍රතිපත්තිය හෝ අප ඔබගේ තොරතුරු හසුරුවන ආකාරය ගැන ඔබට ප්‍රශ්න ඇත්නම්, අප හා සම්බන්ධ වන්න:'),
      legalContacts(['ආයතනය: ', 'පැය 24 ඇමතුම් අංකය: ', 'WhatsApp: ', 'අන්තර්ජාලය හරහා: ', 'සම්බන්ධ කර ගැනීමේ පිටුව']),
    ],
  },
  {
    page: 'terms',
    title: 'සේවා කොන්දේසි',
    body: [
      p(b('අවසන් වරට යාවත්කාලීන කළේ: '), '2026 ඔක්තෝබර් 27'),
      p(
        `මෙම සේවා කොන්දේසි (“කොන්දේසි”) මෙම වෙබ් අඩවිය භාවිත කිරීමට සහ ${LEGAL_NAME} (“අපි” හෝ “අපගේ”) සහ අපගේ හවුල්කාර සමිති විසින් සපයනු ලබන සේවාවලට අදාළ වේ. වෙබ් අඩවිය භාවිත කිරීමෙන් හෝ සේවාවක් ඉල්ලීමෙන්, ඔබ මෙම කොන්දේසිවලට එකඟ වේ. ඔබ එකඟ නොවන්නේ නම්, කරුණාකර වෙබ් අඩවිය භාවිත නොකරන්න.`,
      ),

      h2('1. අපගේ සේවා'),
      p('අපි ශ්‍රී ලංකාව පුරා ක්‍රියාත්මක වන පුණ්‍යායතන සේවාවකි. අපගේම වාහන සහ ලියාපදිංචි හවුල්කාර ජනාසා සමිති ජාලය හරහා, අපි පහත සේවා සපයන්නෙමු:'),
      ul(
        [b('ජනාසා ප්‍රවාහනය'), ' — උදාහරණයක් ලෙස රෝහලක සිට හෝ නිවසක සිට භූමදාන ස්ථානය දක්වා, මියගිය අය ගෞරවාන්විතව ප්‍රවාහනය කිරීම.'],
        [b('හදිසි වෛද්‍ය ප්‍රවාහනය'), ' — රෝහල් වෙත සහ රෝහල් හා නිවාස අතර රෝගීන් මාරු කිරීම.'],
        [b('ඔක්සිජන් සැපයුම'), ' — නිවසේදී හෝ රෝගියෙකු මාරු කිරීමේදී භාවිතය සඳහා ඔක්සිජන් සිලින්ඩර.'],
      ),
      p(
        'ගමනක් හවුල්කාර සමිතියක් විසින් සිදු කරන විට, එහි වාහනය, රියදුරා සහ කාර්ය මණ්ඩලය පිළිබඳ වගකීම එම සමිතිය සතු වේ. අපි ඉල්ලීම සම්බන්ධීකරණය කරන අතර, මෙම වෙබ් අඩවියේ විස්තර කර ඇති ප්‍රමිතීන් පවත්වා ගැනීමට අපගේ හවුල්කරුවන් සමඟ කටයුතු කරන්නෙමු.',
      ),

      h2('2. හදිසි වෛද්‍ය ප්‍රතිකාර සඳහා ආදේශකයක් නොවේ'),
      p(
        'අපගේ වෛද්‍ය ප්‍රවාහන සහ ඔක්සිජන් සේවා රෝගීන්ට සහ පවුල්වලට සහාය වුවද, ඒවා වෛද්‍යවරයෙකුගේ ප්‍රතිකාර හෝ ජාතික ගිලන් රථ සේවාව වෙනුවට ආදේශ කළ නොහැක. ',
        b('යමෙකුගේ ජීවිතය ක්ෂණික අනතුරක ඇත්නම්, 1990 (සුව සැරිය) අමතන්න හෝ ළඟම ඇති රෝහලට යන්න.'),
        ' ඔක්සිජන් භාවිත කළ යුත්තේ සුදුසුකම් ලත් වෛද්‍ය වෘත්තිකයෙකුගේ උපදෙස් පරිදි පමණි.',
      ),

      h2('3. සේවාවක් ඉල්ලීම'),
      ul(
        'ඔබට අපගේ ඇමතුම් අංකය ඇමතීමෙන්, WhatsApp හරහා හෝ වෙබ් අඩවි ඉල්ලීම් පෝරමය හරහා සේවාවක් ඉල්ලිය හැකිය. හදිසි ඉල්ලීම් සඳහා සෑම විටම අමතන්න — පෝරම ඉල්ලීම් අපගේ යැවීමේ කණ්ඩායම විසින් සමාලෝචනය කරන බැවින් ඒවාට ළඟා වීමට වැඩි කාලයක් ගත විය හැකිය.',
        'වෙබ් අඩවි පෝරමයෙන් ලැබෙන යොමු අංකයෙන් තහවුරු වන්නේ අපට ඔබගේ ඉල්ලීම ලැබී ඇති බව පමණි. අපගේ කණ්ඩායම ඔබ හා සම්බන්ධ වන තුරු වාහනයක් පවරා ඇති බව එයින් තහවුරු නොවේ.',
        'සියලු සේවා වාහන සහ කාර්ය මණ්ඩල ලබා ගත හැකි වීම, දුර, මාර්ග සහ කාලගුණ තත්ත්වයන් සහ ආරක්ෂාව මත රඳා පවතී. අපි ඉක්මනින් ප්‍රතිචාර දැක්වීමට උපරිම උත්සාහ කරන නමුත්, වාහනයක්, ප්‍රතිචාරයක් හෝ පැමිණීමේ වේලාවක් සහතික කළ නොහැක.',
        'අපි හදිසි බව අනුව ඉල්ලීම්වලට ප්‍රමුඛතාව දිය හැකි අතර, ඉල්ලීමක් අනාරක්ෂිත වන විට, අපගේ සේවා පරාසයෙන් පිටත වන විට හෝ මෙම කොන්දේසි අනුගමනය නොකරන විට එය ප්‍රතික්ෂේප කිරීමට හෝ අවලංගු කිරීමට අපට හැකිය.',
      ),

      h2('4. ගාස්තු'),
      p(
        'අපගේ හවුල්කාර සමිති මගින් සිදු කරන ගමන් ඇතුළුව, අපගේ සියලු සේවා සම්පූර්ණයෙන්ම නොමිලේ සපයනු ලැබේ. අපගේ කටයුතුවලට සහාය වීම සඳහා වන පරිත්‍යාග සෑම විටම ස්වේච්ඡාවෙන් සිදු කෙරෙන අතර, ඒවා කිසි විටෙකත් සහාය ලබා ගැනීම සඳහා කොන්දේසියක් නොවේ. කිසිවෙකු අප වෙනුවෙන් ඔබෙන් මුදල් ඉල්ලා සිටින්නේ නම්, කරුණාකර එය අපගේ ඇමතුම් අංකයට දන්වන්න.',
      ),

      h2('5. ඔබගේ වගකීම්'),
      p('ඔබ අපගේ සේවා භාවිත කරන විට, ඔබ පහත දේට එකඟ වේ:'),
      ul(
        'නිවැරදි රැගෙන යන ස්ථානය, ගමනාන්තය සහ දුරකථන අංකය ඇතුළුව, නිවැරදි සහ සම්පූර්ණ තොරතුරු ලබා දීමට;',
        'සැබෑ අවශ්‍යතා සඳහා පමණක් ඉල්ලීම් කිරීමට — ව්‍යාජ, විහිළු හෝ අපයෝජනාත්මක ඉල්ලීම් අවශ්‍යතා ඇති අයගෙන් වාහන ඈත් කරන අතර, ඒවා පොලිසියට වාර්තා කළ හැකිය;',
        'රෝහලෙන් පිටවීමේ හෝ මාරු කිරීමේ ලිපියක්, හෝ ජනාසා ප්‍රවාහනය සඳහා මරණ සහතිකයක් හෝ පොලිස් නිෂ්කාශනයක් වැනි, ගමනට අවශ්‍ය ලේඛන සූදානම් කිරීමට;',
        'අවශ්‍ය අවස්ථාවලදී රෝගියා හෝ මියගිය පුද්ගලයා සමඟ යාමට පවුලේ සාමාජිකයෙකු හෝ වගකිව යුතු වැඩිහිටියෙකු සපයා දීමට;',
        'රියදුරාගේ සහ කාර්ය මණ්ඩලයේ සාධාරණ ආරක්ෂක උපදෙස් අනුගමනය කිරීමට; සහ',
        'අපගේ කාර්ය මණ්ඩලයට, ස්වේච්ඡා සේවකයන්ට සහ හවුල්කරුවන්ට ගෞරවයෙන් සැලකීමට. කාර්ය මණ්ඩලයට තර්ජනය කරන හෝ අපයෝජනය කරන අවස්ථාවලදී අපට සේවාවක් ප්‍රතික්ෂේප කිරීමට හෝ නතර කිරීමට හැකිය.',
      ),

      h2('6. මෙම වෙබ් අඩවිය භාවිතය'),
      p(
        'ඔබට මෙම වෙබ් අඩවිය භාවිත කළ හැක්කේ නීත්‍යානුකූල අරමුණු සඳහා පමණි. ඔබ ඉල්ලීම් පෝරමය අනිසි ලෙස භාවිත කිරීම, වෙබ් අඩවියට හෝ එහි ආරක්ෂාවට බාධා කිරීමට උත්සාහ කිරීම, හෝ ඉල්ලීම් ඉදිරිපත් කිරීමට හෝ අන්තර්ගතය පිටපත් කිරීමට ස්වයංක්‍රීය මෙවලම් භාවිත කිරීම නොකළ යුතුය.',
      ),
      p(
        'ආවරණ ප්‍රදේශ, හවුල්කාර සමිති, වාහන සහ සම්බන්ධතා අංක ඇතුළුව වෙබ් අඩවියේ ඇති තොරතුරු යහපත් අදහසින් සපයා නිතිපතා යාවත්කාලීන කරනු ලැබුවද, ඒවා දැනුම්දීමකින් තොරව වෙනස් විය හැකිය. සේවාව ලබා ගත හැකිදැයි තහවුරු කර ගැනීමට සෑම විටම ඇමතුම් අංකය අමතන්න.',
      ),

      h2('7. බුද්ධිමය දේපළ'),
      p(
        `මෙම වෙබ් අඩවියේ පෙළ, ග්‍රැෆික්ස්, ලාංඡන සහ රූප ඇතුළු අන්තර්ගතය ${LEGAL_NAME} සතු වේ, නැතහොත් අවසරය ඇතිව භාවිත කෙරේ. අපගේ ඇමතුම් අංකය අන් අය සමඟ බෙදා ගැනීම වැනි පුද්ගලික, වාණිජ නොවන අරමුණු සඳහා ඔබට එය බෙදා ගත හැකි නමුත්, අපගේ ලිඛිත අවසරයකින් තොරව වෙනත් ආකාරයකින් එය පිටපත් කිරීම, වෙනස් කිරීම හෝ වාණිජමය වශයෙන් භාවිත කිරීම නොකළ යුතුය.`,
      ),

      h2('8. තෙවන පාර්ශ්ව සබැඳි සහ සේවා'),
      p(
        'මෙම වෙබ් අඩවියට WhatsApp සහ OpenStreetMap වැනි අන් අය විසින් පවත්වාගෙන යන සේවාවලට සබැඳි තිබිය හැකිය, නැතහොත් ඒවා භාවිත කළ හැකිය. ඒවායේ අන්තර්ගතය, ලබා ගත හැකි බව හෝ රහස්‍යතා ක්‍රියාපිළිවෙත් සඳහා අපි වගකියනු නොලැබේ.',
      ),

      h2('9. වගකීම් සීමා කිරීම'),
      p(
        'අපි අපගේ සේවා නොමිලේ සහ යහපත් අදහසින් සපයන්නෙමු. නීතියෙන් අවසර දී ඇති උපරිම මට්ටමට, කිසිදු වක්‍ර හෝ ප්‍රතිවිපාකාත්මක පාඩුවක් සඳහා, හෝ රථවාහන තදබදය, කාලගුණය, මාර්ග වැසීම්, වාහන කැඩී යාම, මහජන හදිසි අවස්ථා හෝ අපට ලබා දුන් වැරදි තොරතුරු වැනි අපගේ සාධාරණ පාලනයෙන් ඔබ්බට වූ තත්ත්වයන් නිසා ඇති වන කිසිදු ප්‍රමාදයක් හෝ අසාර්ථක වීමක් සඳහා, අපි, අපගේ හවුල්කාර සමිති, කාර්ය මණ්ඩලය සහ ස්වේච්ඡා සේවකයන් වගකියනු නොලැබේ.',
      ),
      p(
        'නොසැලකිල්ල හේතුවෙන් සිදුවන මරණය හෝ පුද්ගලික තුවාල සඳහා වන වගකීම ඇතුළුව, ශ්‍රී ලංකා නීතිය යටතේ සීමා කළ නොහැකි කිසිදු වගකීමක් මෙම කොන්දේසිවලින් සීමා නොවේ.',
      ),

      h2('10. රහස්‍යතාව'),
      p('අපි පුද්ගලික තොරතුරු හසුරුවන්නේ මෙම කොන්දේසිවල කොටසක් වන අපගේ ', a('/privacy', 'රහස්‍යතා ප්‍රතිපත්තියේ'), ' විස්තර කර ඇති පරිදි ය.'),

      h2('11. මෙම කොන්දේසිවල වෙනස්කම්'),
      p(
        'අපි කලින් කලට මෙම කොන්දේසි යාවත්කාලීන කළ හැකිය. නවතම අනුවාදය සෑම විටම මෙම පිටුවේ ඇති අතර, එය අවසන් වරට යාවත්කාලීන කළ දිනය ඉහළින්ම දක්වා ඇත. වෙනස් කිරීමකින් පසුවත් වෙබ් අඩවිය හෝ අපගේ සේවා දිගටම භාවිත කිරීමෙන්, ඔබ යාවත්කාලීන කළ කොන්දේසි පිළිගනී.',
      ),

      h2('12. පාලන නීතිය'),
      p(
        'මෙම කොන්දේසි ශ්‍රී ලංකා ප්‍රජාතාන්ත්‍රික සමාජවාදී ජනරජයේ නීතිවලට යටත් වන අතර, ඒවායින් පැන නගින ඕනෑම ආරවුලක් සම්බන්ධයෙන් ශ්‍රී ලංකාවේ අධිකරණවලට අධිකරණ බලය ඇත.',
      ),

      h2('13. අප හා සම්බන්ධ වන්න'),
      legalContacts(['ආයතනය: ', 'පැය 24 ඇමතුම් අංකය: ', 'WhatsApp: ', 'අන්තර්ජාලය හරහා: ', 'සම්බන්ධ කර ගැනීමේ පිටුව']),
    ],
  },
];

const legalPagesTa = [
  {
    page: 'privacy',
    title: 'தனியுரிமைக் கொள்கை',
    body: [
      p(b('இறுதியாகப் புதுப்பிக்கப்பட்டது: '), '27 அக்டோபர் 2026'),
      p(
        `${LEGAL_NAME} (“நாங்கள்” அல்லது “எமது”) பங்காளர் ஜனாஸா சங்கங்களின் வலையமைப்புடன் இணைந்து, இலங்கை முழுவதும் இலவச ஜனாஸா (மரணச்சடங்கு) போக்குவரத்து, அவசர மருத்துவப் போக்குவரத்து மற்றும் ஒட்சிசன் விநியோகத்தை வழங்குகிறது. மக்கள் பெரும்பாலும் தமது வாழ்வின் மிகக் கடினமான தருணங்களில் எம்மைத் தொடர்புகொள்கிறார்கள் என்பதை நாம் அறிவோம். நாம் எந்தத் தனிப்பட்ட தகவல்களைச் சேகரிக்கிறோம், ஏன் சேகரிக்கிறோம், யாருடன் பகிர்கிறோம் மற்றும் உங்களுக்குள்ள தெரிவுகள் என்ன என்பதை இந்தத் தனியுரிமைக் கொள்கை விளக்குகிறது.`,
      ),
      p(
        '2022 ஆம் ஆண்டின் 9 ஆம் இலக்க இலங்கை தனிப்பட்ட தரவுப் பாதுகாப்புச் சட்டம் மற்றும் ஏனைய பொருந்தும் சட்டங்களுக்கு அமைய நாம் தனிப்பட்ட தகவல்களைக் கையாளுகிறோம்.',
      ),

      h2('1. நோக்கெல்லை'),
      p(
        'இந்தக் கொள்கை இந்த இணையதளம் (போக்குவரத்துக் கோரிக்கைப் படிவம் உட்பட), எமது அவசர அழைப்பு இலக்கங்கள், WhatsApp மற்றும் நீங்கள் எமது சேவைகளைக் கோரும் வேறு எந்த வழியூடாகவும் நாம் சேகரிக்கும் தகவல்களுக்குப் பொருந்தும். நாம் இணைப்புகளை வழங்கும் மூன்றாம் தரப்பு இணையதளங்கள் அல்லது செயலிகளை இது உள்ளடக்காது; அவற்றுக்கு அவற்றின் சொந்தத் தனியுரிமைக் கொள்கைகள் உள்ளன.',
      ),

      h2('2. நாம் சேகரிக்கும் தகவல்கள்'),
      h3('நீங்கள் எமக்கு வழங்கும் தகவல்கள்'),
      p('தொலைபேசி, WhatsApp அல்லது இணையதளப் படிவம் மூலம் நீங்கள் போக்குவரத்து அல்லது ஒட்சிசன் உதவியைக் கோரும்போது, நாம் பின்வருவனவற்றைச் சேகரிக்கலாம்:'),
      ul(
        [b('உங்கள் விவரங்கள்'), ' — எமது அனுப்புகைக் குழு உங்களைத் தொடர்புகொள்வதற்காக உங்கள் பெயர் மற்றும் தொலைபேசி இலக்கம்.'],
        [b('உதவி தேவைப்படுபவரின் விவரங்கள்'), ' — நோயாளி அல்லது மரணித்தவரின் பெயர்.'],
        [b('பயண விவரங்கள்'), ' — உங்கள் நகரம் அல்லது பிரதேசம், ஏற்றிச்செல்லும் இடம் மற்றும் சேருமிடம்.'],
        [
          b('நிலைமை பற்றிய தகவல்கள்'),
          ' — நோயாளியின் நிலை, ஒட்சிசன் தேவைகள், சம்பந்தப்பட்ட வைத்தியசாலை அல்லது ஜனாஸா ஏற்பாடுகள் போன்ற, நாம் பதிலளிக்க உதவும் வகையில் நீங்கள் தெரிவிக்க விரும்பும் எந்தத் தகவலும்.',
        ],
      ),
      p(
        'சேவையை ஏற்பாடு செய்வதற்குத் தேவையான தகவல்களை மட்டும் பகிருங்கள். உறவினர் போன்ற வேறொருவர் பற்றிய தகவல்களை நீங்கள் வழங்கினால், அவ்வாறு செய்வதற்கு உங்களுக்கு உரிமை உள்ளதை உறுதிசெய்யுங்கள்.',
      ),
      h3('தானாகச் சேகரிக்கப்படும் தகவல்கள்'),
      ul(
        [
          b('தொழில்நுட்பத் தரவு'),
          ' — நீங்கள் இணையதளத்தைப் பயன்படுத்தும்போது, தளத்தை வழங்குவதற்கும் பாதுகாப்பாக வைத்திருப்பதற்கும் எமது ஹோஸ்டிங் சேவை வழங்குநர் உங்கள் IP முகவரி மற்றும் அடிப்படைக் கோரிக்கைத் தரவுகளை (உலாவியின் வகை, கோரப்பட்ட பக்கம் போன்றவை) செயலாக்குகிறார். மீண்டும் மீண்டும் படிவம் சமர்ப்பிக்கப்படுவதைக் கட்டுப்படுத்த உங்கள் IP முகவரியைக் குறுகிய காலத்துக்குப் பயன்படுத்துகிறோம்; அதை உங்கள் கோரிக்கையுடன் சேமிப்பதில்லை.',
        ],
        [
          b('கண்காணிப்புக் குக்கீகள் இல்லை'),
          ' — நாம் விளம்பர அல்லது பகுப்பாய்வுக் குக்கீகளைப் பயன்படுத்துவதில்லை; ஏனைய இணையதளங்களில் உங்களைக் கண்காணிப்பதும் இல்லை. நீங்கள் தெரிவுசெய்த மொழி குக்கீயில் அல்லாமல் பக்க முகவரியிலேயே வைக்கப்படுகிறது.',
        ],
      ),

      h2('3. உங்கள் தகவல்களை நாம் பயன்படுத்தும் விதம்'),
      p('உங்கள் தகவல்களை நாம் பின்வரும் நோக்கங்களுக்காக மட்டுமே பயன்படுத்துகிறோம்:'),
      ul(
        'உங்கள் கோரிக்கையைப் பெற்று அதற்குப் பதிலளிக்கவும், அருகிலுள்ள வாகனத்தை அனுப்பவும்;',
        'விவரங்களை உறுதிப்படுத்துதல் அல்லது புதிய தகவல்களை வழங்குதல் உட்பட, உங்கள் கோரிக்கை தொடர்பாக உங்களைத் தொடர்புகொள்ள;',
        'பயணத்துடன் தொடர்புடைய பங்காளர் சங்கம், சாரதி, வைத்தியசாலை அல்லது அதிகாரிகளுடன் ஒருங்கிணைக்க;',
        'நாம் வழங்கும் சேவைகளின் பதிவுகளைப் பேணவும், எமது சேவைப் பரப்பைத் திட்டமிடவும்;',
        'எமது சேவை, பணியாளர்கள் மற்றும் தன்னார்வலர்களைத் தவறான பயன்பாடு, மோசடி மற்றும் போலிக் கோரிக்கைகளிலிருந்து பாதுகாக்க; மற்றும்',
        'எமது சட்டப்பூர்வக் கடப்பாடுகளை நிறைவேற்ற.',
      ),
      p(b('உங்கள் தனிப்பட்ட தகவல்களை நாம் ஒருபோதும் விற்பதில்லை'), '; விளம்பர நோக்கங்களுக்காகவும் பயன்படுத்துவதில்லை.'),

      h2('4. எமது சட்ட அடிப்படை'),
      p('நிலைமையைப் பொறுத்து, நாம் தனிப்பட்ட தகவல்களைச் செயலாக்குவதற்கான காரணங்கள்:'),
      ul(
        'ஒருவரின் உயிர், உடல்நலம் அல்லது பாதுகாப்பைப் பாதுகாக்க (அவர்களின் இன்றியமையாத நலன்கள்) அது அவசியமாக இருத்தல்;',
        'நீங்கள் ஒரு சேவையைக் கோரியிருத்தல் அல்லது உங்கள் சம்மதத்தை வழங்கியிருத்தல்;',
        'சட்டத்துக்கு இணங்க அது அவசியமாக இருத்தல்; அல்லது',
        'உங்கள் உரிமைகளை மீறாத வகையில், ஒரு தொண்டுச் சேவையை நடத்துவதும் பாதுகாப்பதும் மேம்படுத்துவதும் எமது நியாயமான நலனாக இருத்தல்.',
      ),

      h2('5. சுகாதார மற்றும் ஏனைய உணர்திறன் மிக்க தகவல்கள்'),
      p(
        'மருத்துவப் போக்குவரத்து அல்லது ஒட்சிசன் கோரிக்கைகளில் ஒருவரின் உடல்நலம் பற்றிய தகவல்கள் இருக்கலாம்; ஜனாஸா கோரிக்கைகளில் ஒரு மரணம் பற்றிய தகவல்கள் இருக்கும். இத்தகவல்களை நாம் உணர்திறன் மிக்கவையாகக் கருதுகிறோம். சேவையைப் பாதுகாப்பாக வழங்கத் தேவையானவற்றை மட்டுமே சேகரிக்கிறோம்; பதிலளிப்பில் ஈடுபடுவோருக்கு மட்டுமே அணுகலை வரையறுக்கிறோம்; தொடர்பில்லாத எந்த நோக்கத்துக்கும் அவற்றைப் பயன்படுத்துவதில்லை.',
      ),

      h2('6. நாம் தகவல்களைப் பகிர்ந்துகொள்பவர்கள்'),
      p('தேவையான சந்தர்ப்பங்களில் மட்டுமே, பின்வருவோருடன் தனிப்பட்ட தகவல்களைப் பகிர்கிறோம்:'),
      ul(
        [b('பங்காளர் சங்கங்கள் மற்றும் சாரதிகள்'), ' — உங்கள் பயணத்தை மேற்கொள்ளும் பதிவுசெய்யப்பட்ட பங்காளர் ஜனாஸா சங்கம் அல்லது சாரதி.'],
        [
          b('வைத்தியசாலைகள் மற்றும் அரச அதிகாரிகள்'),
          ' — இடமாற்றம் அல்லது விடுவிப்பை நிறைவுசெய்யத் தேவைப்படும்போது, அல்லது சட்டப்படி தேவைப்படும்போது (உதாரணமாக, பொலிஸ் அல்லது மரணப் பதிவாளர்).',
        ],
        [
          b('சேவை வழங்குநர்கள்'),
          ' — இணையதள ஹோஸ்டிங் (Vercel), படிவக் கோரிக்கைகளை எமது அனுப்புகைக் குழுவுக்கு மின்னஞ்சல் மூலம் அனுப்புதல் (Resend), உள்ளடக்க மற்றும் படங்களுக்கான ஹோஸ்டிங், மற்றும் நீங்கள் WhatsApp மூலம் எம்மைத் தொடர்புகொண்டால் WhatsApp (Meta) உட்பட, எமது சார்பில் இணையதளத்தை இயக்கவும் கோரிக்கைகளைக் கையாளவும் உதவும் நிறுவனங்கள். அவர்கள் எமக்குத் தமது சேவையை வழங்குவதற்கு மட்டுமே அத்தகவல்களைப் பயன்படுத்தலாம்.',
        ],
        [
          b('வரைபடங்கள்'),
          ' — எமது சேவைப் பரப்பு வரைபடங்கள் OpenStreetMap இலிருந்து வரைபடப் படங்களை ஏற்றுவதால், அவற்றைப் பார்க்கும்போது உங்கள் உலாவி உங்கள் IP முகவரியை OpenStreetMap உடன் பகிர்கிறது.',
        ],
      ),
      p(
        'சட்டம் அல்லது நீதிமன்ற உத்தரவின்படி தேவைப்படும்போது, அல்லது எவரொருவரின் உரிமைகள், பாதுகாப்பு அல்லது சொத்துகளைப் பாதுகாக்க அவசியமாகும்போதும் நாம் தகவல்களை வெளிப்படுத்தலாம்.',
      ),

      h2('7. சர்வதேசப் பரிமாற்றங்கள்'),
      p(
        'எமது சேவை வழங்குநர்களில் சிலர் இலங்கைக்கு வெளியே தரவுகளைச் சேமிக்கின்றனர் அல்லது செயலாக்குகின்றனர். அவ்வாறான சந்தர்ப்பங்களில், இலங்கைச் சட்டத்தின்படி தேவையானவாறு, உங்கள் தகவல்களைப் பாதுகாக்கப் பொருத்தமான பாதுகாப்பு ஏற்பாடுகளைக் கொண்ட வழங்குநர்களையே நாம் நம்பியுள்ளோம்.',
      ),

      h2('8. தகவல்களை வைத்திருக்கும் காலம்'),
      p(
        'சேவைப் பதிவுகளைப் பேணுதல் மற்றும் சட்ட அல்லது அறிக்கையிடல் கடப்பாடுகளை நிறைவேற்றுதல் உட்பட, இந்தக் கொள்கையில் குறிப்பிடப்பட்ட நோக்கங்களுக்குத் தேவையான காலம் வரை மட்டுமே தனிப்பட்ட தகவல்களை வைத்திருக்கிறோம். அதன் பின்னர், அவற்றை நீக்குகிறோம் அல்லது எவரையும் அடையாளம் காண முடியாதவாறு அநாமதேயமாக்குகிறோம்.',
      ),

      h2('9. தகவல்களை நாம் பாதுகாக்கும் விதம்'),
      p(
        'மறைகுறியாக்கப்பட்ட (HTTPS) இணைப்புகள், தேவையானவர்களுக்கு மட்டுமே வரையறுக்கப்பட்ட அணுகல், அங்கீகரிக்கப்பட்ட பாதுகாப்பு நடைமுறைகளைக் கொண்ட வழங்குநர்கள் உட்பட, தனிப்பட்ட தகவல்களைப் பாதுகாக்க நியாயமான தொழில்நுட்ப மற்றும் நிறுவன ரீதியான நடவடிக்கைகளை நாம் மேற்கொள்கிறோம். எந்தவொரு பரிமாற்ற அல்லது சேமிப்பு முறையும் முழுமையாகப் பாதுகாப்பானது அல்ல; எனினும் உங்கள் தகவல்களைப் பாதுகாக்க நாம் உழைக்கிறோம், ஏதேனும் பிரச்சினை ஏற்பட்டால் உடனடியாகச் செயற்படுவோம்.',
      ),

      h2('10. உங்கள் உரிமைகள்'),
      p('சட்டத்துக்கு உட்பட்டு, உங்களுக்குப் பின்வரும் உரிமைகள் உள்ளன:'),
      ul(
        'உங்களைப் பற்றி நாம் வைத்திருக்கும் தனிப்பட்ட தகவல்கள் எவை என்று கேட்டு, அவற்றின் பிரதியொன்றைப் பெறுதல்;',
        'தவறான அல்லது முழுமையற்ற தகவல்களைத் திருத்துமாறு கோருதல்;',
        'நாம் இனியும் வைத்திருக்கத் தேவையில்லாதபோது, உங்கள் தகவல்களை நீக்குமாறு கோருதல்;',
        'நாம் சம்மதத்தை அடிப்படையாகக் கொள்ளும் சந்தர்ப்பங்களில், உங்கள் சம்மதத்தை மீளப்பெறுதல்; மற்றும்',
        'குறிப்பிட்ட செயலாக்கங்களை ஆட்சேபித்தல் அல்லது கட்டுப்படுத்துமாறு கோருதல்.',
      ),
      p(
        'இந்த உரிமைகளில் எதனையும் பயன்படுத்த, கீழுள்ள விவரங்கள் மூலம் எம்மைத் தொடர்புகொள்ளுங்கள். கோரிக்கையொன்றின் மீது நடவடிக்கை எடுப்பதற்கு முன் உங்கள் அடையாளத்தை உறுதிப்படுத்த வேண்டியிருக்கலாம். எமது பதிலில் நீங்கள் திருப்தியடையாவிட்டால், இலங்கை தரவுப் பாதுகாப்பு அதிகாரசபையிடம் முறைப்பாடு செய்யலாம்.',
      ),

      h2('11. சிறுவர்கள்'),
      p(
        'சில சந்தர்ப்பங்களில் சிறுவர்களுக்கு எமது சேவைகள் தேவைப்படுகின்றன. அவ்வாறான சந்தர்ப்பங்களில், பெற்றோர், பாதுகாவலர் அல்லது பொறுப்புள்ள வயதுவந்த ஒருவர் கோரிக்கையை முன்வைத்துத் தகவல்களை வழங்குவார் என எதிர்பார்க்கிறோம். வேறு எந்த நோக்கத்துக்காகவும் சிறுவர்களிடமிருந்து நேரடியாகத் தெரிந்தே தகவல்களைச் சேகரிப்பதில்லை.',
      ),

      h2('12. இந்தக் கொள்கையில் மாற்றங்கள்'),
      p(
        'இந்தக் கொள்கையை நாம் அவ்வப்போது புதுப்பிக்கலாம். சமீபத்திய பதிப்பு எப்போதும் இந்தப் பக்கத்தில் இருக்கும்; அது இறுதியாகப் புதுப்பிக்கப்பட்ட திகதி மேலே காட்டப்பட்டிருக்கும்.',
      ),

      h2('13. எம்மைத் தொடர்புகொள்ள'),
      p('இந்தக் கொள்கை அல்லது உங்கள் தகவல்களை நாம் கையாளும் விதம் பற்றிக் கேள்விகள் இருப்பின், எம்மைத் தொடர்புகொள்ளுங்கள்:'),
      legalContacts(['நிறுவனம்: ', '24/7 அவசர அழைப்பு: ', 'WhatsApp: ', 'இணையவழி: ', 'தொடர்புகொள்ளும் பக்கம்']),
    ],
  },
  {
    page: 'terms',
    title: 'சேவை நிபந்தனைகள்',
    body: [
      p(b('இறுதியாகப் புதுப்பிக்கப்பட்டது: '), '27 அக்டோபர் 2026'),
      p(
        `இந்தச் சேவை நிபந்தனைகள் (“நிபந்தனைகள்”) இந்த இணையதளத்தின் பயன்பாட்டுக்கும், ${LEGAL_NAME} (“நாங்கள்” அல்லது “எமது”) மற்றும் எமது பங்காளர் சங்கங்கள் வழங்கும் சேவைகளுக்கும் பொருந்தும். இணையதளத்தைப் பயன்படுத்துவதன் மூலம் அல்லது சேவையொன்றைக் கோருவதன் மூலம், நீங்கள் இந்த நிபந்தனைகளுக்கு உடன்படுகிறீர்கள். நீங்கள் உடன்படாவிட்டால், இணையதளத்தைப் பயன்படுத்த வேண்டாம்.`,
      ),

      h2('1. எமது சேவைகள்'),
      p('நாம் இலங்கை முழுவதும் இயங்கும் ஒரு தொண்டுச் சேவையாகும். எமது சொந்த வாகனங்கள் மற்றும் பதிவுசெய்யப்பட்ட பங்காளர் ஜனாஸா சங்கங்களின் வலையமைப்பு மூலம், நாம் பின்வருவனவற்றை வழங்குகிறோம்:'),
      ul(
        [b('ஜனாஸா போக்குவரத்து'), ' — உதாரணமாக வைத்தியசாலை அல்லது வீட்டிலிருந்து அடக்கஸ்தலம் வரை, மரணித்தவரைக் கண்ணியமாகக் கொண்டுசெல்லுதல்.'],
        [b('அவசர மருத்துவப் போக்குவரத்து'), ' — வைத்தியசாலைகளுக்கும், வைத்தியசாலைகள் மற்றும் வீடுகளுக்கு இடையிலும் நோயாளிகளை இடமாற்றுதல்.'],
        [b('ஒட்சிசன் விநியோகம்'), ' — வீட்டிலோ நோயாளி இடமாற்றத்தின்போதோ பயன்படுத்துவதற்கான ஒட்சிசன் சிலிண்டர்கள்.'],
      ),
      p(
        'பயணமொன்று பங்காளர் சங்கத்தால் மேற்கொள்ளப்படும்போது, அதன் வாகனம், சாரதி மற்றும் பணியாளர்களுக்கான பொறுப்பு அந்தச் சங்கத்தையே சாரும். நாம் கோரிக்கையை ஒருங்கிணைப்பதுடன், இந்த இணையதளத்தில் விவரிக்கப்பட்டுள்ள தரங்களைப் பேண எமது பங்காளர்களுடன் இணைந்து செயற்படுகிறோம்.',
      ),

      h2('2. அவசர மருத்துவ சிகிச்சைக்கு மாற்றீடு அல்ல'),
      p(
        'எமது மருத்துவப் போக்குவரத்து மற்றும் ஒட்சிசன் சேவைகள் நோயாளிகளுக்கும் குடும்பங்களுக்கும் உதவுகின்றன; எனினும் அவை வைத்தியரின் சிகிச்சைக்கோ தேசிய அம்பியூலன்ஸ் சேவைக்கோ மாற்றீடு அல்ல. ',
        b('ஒருவரின் உயிருக்கு உடனடி ஆபத்து இருந்தால், 1990 (சுவ செரிய) ஐ அழையுங்கள் அல்லது அருகிலுள்ள வைத்தியசாலைக்குச் செல்லுங்கள்.'),
        ' ஒட்சிசனைத் தகுதிவாய்ந்த மருத்துவ நிபுணரின் ஆலோசனைப்படி மட்டுமே பயன்படுத்த வேண்டும்.',
      ),

      h2('3. சேவையொன்றைக் கோருதல்'),
      ul(
        'எமது அவசர அழைப்பு இலக்கத்தை அழைப்பதன் மூலம், WhatsApp மூலம் அல்லது இணையதளக் கோரிக்கைப் படிவம் மூலம் நீங்கள் சேவையொன்றைக் கோரலாம். அவசரக் கோரிக்கைகளுக்கு எப்போதும் அழையுங்கள் — படிவக் கோரிக்கைகள் எமது அனுப்புகைக் குழுவால் பரிசீலிக்கப்படுவதால், அவை எம்மை அடைய அதிக நேரம் ஆகலாம்.',
        'இணையதளப் படிவத்திலிருந்து கிடைக்கும் குறிப்பு இலக்கம், உங்கள் கோரிக்கை எமக்குக் கிடைத்துள்ளது என்பதை மட்டுமே உறுதிப்படுத்துகிறது. எமது குழு உங்களைத் தொடர்புகொள்ளும் வரை, வாகனம் ஒதுக்கப்பட்டுள்ளது என்பதை அது உறுதிப்படுத்தாது.',
        'அனைத்துச் சேவைகளும் வாகனங்கள் மற்றும் பணியாளர்களின் கிடைப்பனவு, தூரம், வீதி மற்றும் வானிலை நிலைமைகள் மற்றும் பாதுகாப்பைப் பொறுத்தவை. விரைவாகப் பதிலளிக்க நாம் இயன்றவரை முயற்சிக்கிறோம்; எனினும் வாகனம், பதில் அல்லது வருகை நேரத்தை உத்தரவாதப்படுத்த முடியாது.',
        'அவசரத்தின் அடிப்படையில் கோரிக்கைகளுக்கு முன்னுரிமை அளிக்கலாம்; கோரிக்கை பாதுகாப்பற்றதாக இருந்தால், எமது சேவைகளுக்கு அப்பாற்பட்டதாக இருந்தால், அல்லது இந்த நிபந்தனைகள் பின்பற்றப்படாவிட்டால், அதனை நிராகரிக்கவோ இரத்துச் செய்யவோ எமக்கு உரிமை உண்டு.',
      ),

      h2('4. கட்டணங்கள்'),
      p(
        'எமது பங்காளர் சங்கங்களால் மேற்கொள்ளப்படும் பயணங்கள் உட்பட, எமது அனைத்துச் சேவைகளும் முற்றிலும் இலவசமாக வழங்கப்படுகின்றன. எமது பணிகளுக்கு ஆதரவளிக்கும் நன்கொடைகள் எப்போதும் தன்னார்வமானவை; உதவி பெறுவதற்கான நிபந்தனையாக அவை ஒருபோதும் இருக்காது. எவரேனும் எமது சார்பில் உங்களிடம் பணம் கோரினால், தயவுசெய்து எமது அவசர அழைப்பு இலக்கத்துக்கு அறிவியுங்கள்.',
      ),

      h2('5. உங்கள் பொறுப்புகள்'),
      p('எமது சேவைகளைப் பயன்படுத்தும்போது, நீங்கள் பின்வருவனவற்றுக்கு உடன்படுகிறீர்கள்:'),
      ul(
        'சரியான ஏற்றிச்செல்லும் இடம், சேருமிடம் மற்றும் தொலைபேசி இலக்கம் உட்பட, துல்லியமான மற்றும் முழுமையான தகவல்களை வழங்குதல்;',
        'உண்மையான தேவைகளுக்காக மட்டுமே கோரிக்கைகளை முன்வைத்தல் — போலியான, விளையாட்டான அல்லது துஷ்பிரயோகமான கோரிக்கைகள் தேவையுள்ளவர்களிடமிருந்து வாகனங்களைத் திசைதிருப்புகின்றன; அவை பொலிஸுக்கு அறிவிக்கப்படலாம்;',
        'வைத்தியசாலை விடுவிப்பு அல்லது இடமாற்றக் கடிதம், அல்லது ஜனாஸா போக்குவரத்துக்கான மரணச் சான்றிதழ் அல்லது பொலிஸ் அனுமதி போன்ற, பயணத்துக்குத் தேவையான ஆவணங்களை ஏற்பாடு செய்தல்;',
        'தேவைப்படும்போது நோயாளி அல்லது மரணித்தவருடன் செல்வதற்குக் குடும்ப உறுப்பினர் அல்லது பொறுப்புள்ள வயதுவந்த ஒருவரை ஏற்பாடு செய்தல்;',
        'சாரதி மற்றும் பணியாளர்களின் நியாயமான பாதுகாப்பு அறிவுறுத்தல்களைப் பின்பற்றுதல்; மற்றும்',
        'எமது பணியாளர்கள், தன்னார்வலர்கள் மற்றும் பங்காளர்களை மரியாதையுடன் நடத்துதல். பணியாளர்கள் அச்சுறுத்தப்படும் அல்லது துஷ்பிரயோகம் செய்யப்படும் சந்தர்ப்பங்களில் சேவையை மறுக்கவோ நிறுத்தவோ எமக்கு உரிமை உண்டு.',
      ),

      h2('6. இந்த இணையதளத்தின் பயன்பாடு'),
      p(
        'இந்த இணையதளத்தைச் சட்டபூர்வமான நோக்கங்களுக்காக மட்டுமே பயன்படுத்தலாம். கோரிக்கைப் படிவத்தைத் தவறாகப் பயன்படுத்துதல், இணையதளத்தில் அல்லது அதன் பாதுகாப்பில் குறுக்கிட முயலுதல், அல்லது கோரிக்கைகளைச் சமர்ப்பிக்க அல்லது உள்ளடக்கத்தைப் பிரதியெடுக்கத் தானியங்கிக் கருவிகளைப் பயன்படுத்துதல் கூடாது.',
      ),
      p(
        'சேவைப் பரப்புகள், பங்காளர் சங்கங்கள், வாகனங்கள் மற்றும் தொடர்பு இலக்கங்கள் உட்பட இணையதளத்திலுள்ள தகவல்கள் நல்லெண்ணத்துடன் வழங்கப்பட்டு, தொடர்ந்து புதுப்பிக்கப்படுகின்றன; எனினும் அவை முன்னறிவிப்பின்றி மாறலாம். சேவை கிடைக்குமா என்பதை உறுதிப்படுத்த எப்போதும் அவசர அழைப்பு இலக்கத்தை அழையுங்கள்.',
      ),

      h2('7. அறிவுசார் சொத்து'),
      p(
        `இந்த இணையதளத்தின் உரை, வரைகலைகள், இலச்சினைகள் மற்றும் படங்கள் உட்பட உள்ளடக்கம் ${LEGAL_NAME} க்குச் சொந்தமானது அல்லது அனுமதியுடன் பயன்படுத்தப்படுகிறது. எமது அவசர அழைப்பு இலக்கத்தைப் பிறருக்குத் தெரிவிப்பது போன்ற தனிப்பட்ட, வர்த்தகமற்ற நோக்கங்களுக்காக அதனைப் பகிரலாம்; எனினும் எமது எழுத்துமூல அனுமதியின்றி வேறு வகையில் அதனைப் பிரதியெடுக்கவோ மாற்றவோ வர்த்தக ரீதியாகப் பயன்படுத்தவோ கூடாது.`,
      ),

      h2('8. மூன்றாம் தரப்பு இணைப்புகள் மற்றும் சேவைகள்'),
      p(
        'இந்த இணையதளம் WhatsApp மற்றும் OpenStreetMap போன்ற பிறரால் இயக்கப்படும் சேவைகளுக்கான இணைப்புகளைக் கொண்டிருக்கலாம் அல்லது அவற்றைப் பயன்படுத்தலாம். அவற்றின் உள்ளடக்கம், கிடைப்பனவு அல்லது தனியுரிமை நடைமுறைகளுக்கு நாம் பொறுப்பல்ல.',
      ),

      h2('9. பொறுப்பு வரையறை'),
      p(
        'நாம் எமது சேவைகளை இலவசமாகவும் நல்லெண்ணத்துடனும் வழங்குகிறோம். சட்டம் அனுமதிக்கும் உச்ச அளவில், எந்தவொரு மறைமுக அல்லது விளைவு இழப்புக்கும், அல்லது போக்குவரத்து நெரிசல், வானிலை, வீதி மூடல்கள், வாகனப் பழுது, பொது அவசர நிலைகள் அல்லது எமக்கு வழங்கப்பட்ட தவறான தகவல்கள் போன்ற எமது நியாயமான கட்டுப்பாட்டுக்கு அப்பாற்பட்ட சூழ்நிலைகளால் ஏற்படும் தாமதம் அல்லது தோல்விக்கும், நாமோ எமது பங்காளர் சங்கங்களோ பணியாளர்களோ தன்னார்வலர்களோ பொறுப்பாக மாட்டோம்.',
      ),
      p(
        'அலட்சியத்தால் ஏற்படும் மரணம் அல்லது தனிப்பட்ட காயத்துக்கான பொறுப்பு உட்பட, இலங்கைச் சட்டத்தின் கீழ் வரையறுக்க முடியாத எந்தப் பொறுப்பையும் இந்த நிபந்தனைகள் வரையறுக்கவில்லை.',
      ),

      h2('10. தனியுரிமை'),
      p('இந்த நிபந்தனைகளின் ஒரு பகுதியான எமது ', a('/privacy', 'தனியுரிமைக் கொள்கையில்'), ' விவரிக்கப்பட்டுள்ளவாறு நாம் தனிப்பட்ட தகவல்களைக் கையாளுகிறோம்.'),

      h2('11. இந்த நிபந்தனைகளில் மாற்றங்கள்'),
      p(
        'இந்த நிபந்தனைகளை நாம் அவ்வப்போது புதுப்பிக்கலாம். சமீபத்திய பதிப்பு எப்போதும் இந்தப் பக்கத்தில் இருக்கும்; அது இறுதியாகப் புதுப்பிக்கப்பட்ட திகதி மேலே காட்டப்பட்டிருக்கும். மாற்றத்தின் பின்னரும் இணையதளத்தை அல்லது எமது சேவைகளைத் தொடர்ந்து பயன்படுத்துவதன் மூலம், புதுப்பிக்கப்பட்ட நிபந்தனைகளை ஏற்றுக்கொள்கிறீர்கள்.',
      ),

      h2('12. ஆளும் சட்டம்'),
      p(
        'இந்த நிபந்தனைகள் இலங்கை ஜனநாயக சோசலிசக் குடியரசின் சட்டங்களால் ஆளப்படுகின்றன; இவற்றிலிருந்து எழும் எந்தவொரு பிணக்கு தொடர்பிலும் இலங்கை நீதிமன்றங்களுக்கு நியாயாதிக்கம் உண்டு.',
      ),

      h2('13. எம்மைத் தொடர்புகொள்ள'),
      legalContacts(['நிறுவனம்: ', '24/7 அவசர அழைப்பு: ', 'WhatsApp: ', 'இணையவழி: ', 'தொடர்புகொள்ளும் பக்கம்']),
    ],
  },
];

// English first, so the Sinhala and Tamil versions can be added to the same entries.
const legalPages = { en: legalPagesEn, si: legalPagesSi, ta: legalPagesTa };

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

const main = async () => {
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'error';
  try {
    // Overwrites the legal pages with the text above, whatever they contain now. Nothing else runs.
    if (process.argv.includes('--replace-legal')) {
      await seedLegalPages(app, { replace: true });
      // Publishing tells the website to regenerate after a short debounce (src/revalidate.ts);
      // stay up long enough for that call to finish.
      console.log('waiting for the website to regenerate...');
      app.log.level = 'info';
      await new Promise((resolve) => setTimeout(resolve, 45_000));
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
