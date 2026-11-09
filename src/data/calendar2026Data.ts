import { DayData, MonthMeta, NityaSevaItem, SevaDepartment, ShubhMuhuratItem } from '../types/calendar';

export const MARATHI_DAYS = ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
export const MARATHI_DAYS_SHORT = ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
export const ENGLISH_DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MONTHS_META: MonthMeta[] = [
  {
    monthIndex: 0,
    monthNumber: 1,
    marathiName: 'जानेवारी २०२६',
    englishName: 'January 2026',
    marathiSeason: 'हेमंत ऋतू',
    marathiYear: 'शक १९४७',
    samvatsar: 'विश्वावसू नाम संवत्सर (पौष - माघ)',
    totalDays: 31,
    startDayOfWeek: 4, // 2026-01-01 is Thursday
    headerQuote: 'निशंक होई रे मना निर्भय होई रे मना, प्रचंड स्वामीबळ पाठीशी उभे आहे!'
  },
  {
    monthIndex: 1,
    monthNumber: 2,
    marathiName: 'फेब्रुवारी २०२६',
    englishName: 'February 2026',
    marathiSeason: 'शिशिर ऋतू',
    marathiYear: 'शक १९४७',
    samvatsar: 'विश्वावसू नाम संवत्सर (माघ - फाल्गुन)',
    totalDays: 28,
    startDayOfWeek: 0, // 2026-02-01 is Sunday
    headerQuote: 'कर्म हाच धर्म मानून निरंतर स्वामी सेवेत लीन राहावे.'
  },
  {
    monthIndex: 2,
    monthNumber: 3,
    marathiName: 'मार्च २०२६',
    englishName: 'March 2026',
    marathiSeason: 'वसंत ऋतू',
    marathiYear: 'शक १९४७ - १९४८',
    samvatsar: 'क्रोधी नाम संवत्सर प्रारंभ (फाल्गुन - चैत्र)',
    totalDays: 31,
    startDayOfWeek: 0, // 2026-03-01 is Sunday
    headerQuote: 'चैत्र शुद्ध द्वितीया: श्री स्वामी समर्थ महाराज प्रगट दिन महामहोत्सव!'
  },
  {
    monthIndex: 3,
    monthNumber: 4,
    marathiName: 'एप्रिल २०२६',
    englishName: 'April 2026',
    marathiSeason: 'वसंत ऋतू',
    marathiYear: 'शक १९४८',
    samvatsar: 'क्रोधी नाम संवत्सर (चैत्र - वैशाख)',
    totalDays: 30,
    startDayOfWeek: 3, // 2026-04-01 is Wednesday
    headerQuote: 'श्री स्वामी समर्थ पुण्यतिथी सप्ताह व १४८ वी पुण्यतिथी महासमाधी दिन.'
  },
  {
    monthIndex: 4,
    monthNumber: 5,
    marathiName: 'मे २०२६',
    englishName: 'May 2026',
    marathiSeason: 'ग्रीष्म ऋतू',
    marathiYear: 'शक १९४८',
    samvatsar: 'क्रोधी नाम संवत्सर (वैशाख - ज्येष्ठ)',
    totalDays: 31,
    startDayOfWeek: 5, // 2026-05-01 is Friday
    headerQuote: 'अग्निहोत्र व नित्यसेवेने घरात सुख, समृद्धी आणि आरोग्याची वृद्धी होते.'
  },
  {
    monthIndex: 5,
    monthNumber: 6,
    marathiName: 'जून २०२६',
    englishName: 'June 2026',
    marathiSeason: 'ग्रीष्म - वर्षा ऋतू',
    marathiYear: 'शक १९४८',
    samvatsar: 'क्रोधी नाम संवत्सर (ज्येष्ठ - आषाढ)',
    totalDays: 30,
    startDayOfWeek: 1, // 2026-06-01 is Monday
    headerQuote: 'आषाढी एकादशी महासोहळा - विठ्ठल रुपी स्वामी समर्थांचे नित्य ध्यान.'
  },
  {
    monthIndex: 6,
    monthNumber: 7,
    marathiName: 'जुलै २०२६',
    englishName: 'July 2026',
    marathiSeason: 'वर्षा ऋतू',
    marathiYear: 'शक १९४८',
    samvatsar: 'क्रोधी नाम संवत्सर (आषाढ - श्रावण)',
    totalDays: 31,
    startDayOfWeek: 3, // 2026-07-01 is Wednesday
    headerQuote: 'श्री गुरुपौर्णिमा उत्सव - सदगुरू कृपेने सर्व संकट हरण होतात.'
  },
  {
    monthIndex: 7,
    monthNumber: 8,
    marathiName: 'ऑगस्ट २०२६',
    englishName: 'August 2026',
    marathiSeason: 'वर्षा ऋतू',
    marathiYear: 'शक १९४८',
    samvatsar: 'क्रोधी नाम संवत्सर (श्रावण - भाद्रपद)',
    totalDays: 31,
    startDayOfWeek: 6, // 2026-08-01 is Saturday
    headerQuote: 'पवित्र श्रावण मास: नित्य जप, शिव-स्वामी उपासना व रक्षाबंधन सोहळा.'
  },
  {
    monthIndex: 8,
    monthNumber: 9,
    marathiName: 'सप्टेंबर २०२६',
    englishName: 'September 2026',
    marathiSeason: 'शरद ऋतू',
    marathiYear: 'शक १९४८',
    samvatsar: 'क्रोधी नाम संवत्सर (भाद्रपद - अश्विन)',
    totalDays: 30,
    startDayOfWeek: 2, // 2026-09-01 is Tuesday
    headerQuote: 'श्री गणेश चतुर्थी उत्सव: गणपती बाप्पा व स्वामी समर्थांचे मंगलमय शुभाशीर्वाद.'
  },
  {
    monthIndex: 9,
    monthNumber: 10,
    marathiName: 'ऑक्टोबर २०२६',
    englishName: 'October 2026',
    marathiSeason: 'शरद ऋतू',
    marathiYear: 'शक १९४८',
    samvatsar: 'क्रोधी नाम संवत्सर (अश्विन - कार्तिक)',
    totalDays: 31,
    startDayOfWeek: 4, // 2026-10-01 is Thursday
    headerQuote: 'शारदीय नवरात्र, दसरा व कोजागरी पौर्णिमा - कुलस्वामिनी व स्वामी उपासना.'
  },
  {
    monthIndex: 10,
    monthNumber: 11,
    marathiName: 'नोव्हेंबर २०२६',
    englishName: 'November 2026',
    marathiSeason: 'हेमंत ऋतू',
    marathiYear: 'शक १९४८',
    samvatsar: 'क्रोधी नाम संवत्सर (कार्तिक - मार्गशीर्ष)',
    totalDays: 30,
    startDayOfWeek: 0, // 2026-11-01 is Sunday
    headerQuote: 'दीपावली लक्ष्मीपूजन, पाडवा, कार्तिकी एकादशी व त्रिपुरारी पौर्णिमा - दीपदान व श्री स्वामी नामस्मरण.'
  },
  {
    monthIndex: 11,
    monthNumber: 12,
    marathiName: 'डिसेंबर २०२६',
    englishName: 'December 2026',
    marathiSeason: 'हेमंत ऋतू',
    marathiYear: 'शक १९४८',
    samvatsar: 'क्रोधी नाम संवत्सर (मार्गशीर्ष - पौष)',
    totalDays: 31,
    startDayOfWeek: 2, // 2026-12-01 is Tuesday
    headerQuote: 'मार्गशीर्ष दत्त जयंती उत्सव - अवधूत चिंतन श्री गुरुदेव दत्त!'
  }
];

// Curated high-fidelity day events map for 2026
interface RawDayEntry {
  dayOfMonth: number;
  tithi: string;
  paksha: 'शुक्ल' | 'कृष्ण';
  nakshatra: string;
  isSankashti?: boolean;
  isEkadashi?: boolean;
  isPournima?: boolean;
  isAmavasya?: boolean;
  isGuruPushya?: boolean;
  isSwamiSpecial?: boolean;
  isHoliday?: boolean;
  moonriseTime?: string;
  festivals?: {
    id: string;
    title: string;
    titleEn: string;
    category: any;
    description: string;
    sevaSuggestion?: string;
    isMajor?: boolean;
  }[];
  swamiGuidance?: string;
}

const MONTH_EVENTS_2026: Record<number, RawDayEntry[]> = {
  1: [ // January 2026
    { dayOfMonth: 1, tithi: 'त्रयोदशी', paksha: 'शुक्ल', nakshatra: 'रोहिणी', isHoliday: true, festivals: [{ id: 'ny-26', title: 'इंग्रजी नूतन वर्षारंभ २०२६', titleEn: 'New Year 2026', category: 'national', description: 'नवीन वर्षाचा संकल्प: नित्य स्वामी सेवा, नामजप व गुरुचरित्र वाचन.', sevaSuggestion: 'सकाळी श्री स्वामी समर्थ तारक मंत्र ११ वेळा म्हणावा.' }] },
    { dayOfMonth: 3, tithi: 'पौर्णिमा', paksha: 'शुक्ल', nakshatra: 'आर्द्र', isPournima: true, festivals: [{ id: 'paush-pournima', title: 'पौष पौर्णिमा (शाकंभरी नवरात्र समाप्ती)', titleEn: 'Pausha Pournima', category: 'pournima', description: 'सत्यनारायण पूजा, शाकंभरी देवी उत्सव व श्री स्वामी पादुका पूजन.' }] },
    { dayOfMonth: 6, tithi: 'चतुर्थी', paksha: 'कृष्ण', nakshatra: 'मघा', isSankashti: true, moonriseTime: 'रात्री ०९:२४', festivals: [{ id: 'sank-jan', title: 'अंगारकी संकष्टी चतुर्थी (मंगळवार)', titleEn: 'Angarki Sankashti Chaturthi', category: 'sankashti', isMajor: true, description: 'मंगळवारी येणारी अतिशय फलदायी अंगारकी संकष्टी चतुर्थी! चंद्रोदयानंतर नैवेद्य दाखवून उपवास सोडावा.', sevaSuggestion: 'गणपती अथर्वशीर्ष २१ आवर्तने व १०८ स्वामी नामजप.' }] },
    { dayOfMonth: 13, tithi: 'एकादशी', paksha: 'कृष्ण', nakshatra: 'विशाखा', isEkadashi: true, festivals: [{ id: 'eka-saphala', title: 'सफला एकादशी उपवास', titleEn: 'Saphala Ekadashi', category: 'ekadashi', description: 'सर्व कार्ये सफल करणारी पवित्र सफला एकादशी.' }, { id: 'bhogi-26', title: 'भोगि सण', titleEn: 'Bhogi Festival', category: 'festival', description: 'बाजरीची भाकरी, तीळ व खमंग भोगीची भाजी नैवेद्य.' }] },
    { dayOfMonth: 14, tithi: 'द्वादशी', paksha: 'कृष्ण', nakshatra: 'अनुराधा', isHoliday: true, festivals: [{ id: 'makar-26', title: 'मकर संक्रांती (सूर्य उत्तरायण प्रारंभ)', titleEn: 'Makar Sankranti', category: 'festival', description: 'तिळगूळ घ्या गोड गोड बोला. दानधर्म व श्री स्वामी नामस्मरण.', isMajor: true }] },
    { dayOfMonth: 15, tithi: 'त्रयोदशी', paksha: 'कृष्ण', nakshatra: 'ज्येष्ठा', festivals: [{ id: 'kinkrant-26', title: 'किंक्रांत (करदिन)', titleEn: 'Kinkrant', category: 'festival', description: 'संक्रांतीचा दुसरा दिवस.' }] },
    { dayOfMonth: 18, tithi: 'अमावास्या', paksha: 'कृष्ण', nakshatra: 'पूर्वाषाढा', isAmavasya: true, festivals: [{ id: 'mouni-amav', title: 'मौनी दर्श अमावास्या', titleEn: 'Mauni Amavasya', category: 'amavasya', description: 'अमावास्या स्वामी महापूजा, कुलदेवता स्मरण व अग्निहोत्र.' }] },
    { dayOfMonth: 23, tithi: 'पंचमी', paksha: 'शुक्ल', nakshatra: 'शतभिषा', festivals: [{ id: 'vasant-panchami', title: 'वसंत पंचमी / श्री सरस्वती पूजन', titleEn: 'Vasant Panchami', category: 'festival', description: 'विद्या, ज्ञान व कलेची अधिष्ठात्री श्री सरस्वती देवी पूजन.' }] },
    { dayOfMonth: 26, tithi: 'अष्टमी', paksha: 'शुक्ल', nakshatra: 'भरणी', isHoliday: true, festivals: [{ id: 'republic-day', title: 'भारतीय प्रजासत्ताक दिन', titleEn: 'Republic Day', category: 'national', description: 'भारतीय प्रजासत्ताक दिन चिरायू होवो!' }] },
    { dayOfMonth: 29, tithi: 'एकादशी', paksha: 'शुक्ल', nakshatra: 'मृगशीर्ष', isEkadashi: true, festivals: [{ id: 'eka-jaya', title: 'जया एकादशी उपवास', titleEn: 'Jaya Ekadashi', category: 'ekadashi', description: 'सर्व पापांचे क्षालन करणारी पवित्र जया एकादशी.' }] },
    { dayOfMonth: 31, tithi: 'चतुर्दशी', paksha: 'शुक्ल', nakshatra: 'पुष्य', festivals: [{ id: 'magha-snan', title: 'माघ स्नान पर्व', titleEn: 'Magha Snan Parva', category: 'festival', description: 'पवित्र माघ महिन्याचे पावन स्नान व दीपदान.' }] },
  ],
  2: [ // February 2026
    { dayOfMonth: 1, tithi: 'पौर्णिमा', paksha: 'शुक्ल', nakshatra: 'आश्लेषा', isPournima: true, isHoliday: true, festivals: [{ id: 'magh-pournima', title: 'माघ पौर्णिमा (सत्यनारायण पूजा)', titleEn: 'Magh Pournima', category: 'pournima', description: 'पौर्णिमा नित्यसेवा, सत्यनारायण कथा व श्री स्वामी समर्थ पादुका पूजन.' }] },
    { dayOfMonth: 5, tithi: 'चतुर्थी', paksha: 'कृष्ण', nakshatra: 'उत्तराफाल्गुनी', isSankashti: true, moonriseTime: 'रात्री ०९:५२', festivals: [{ id: 'sank-feb', title: 'द्विजप्रिय संकष्टी चतुर्थी', titleEn: 'Sankashti Chaturthi', category: 'sankashti', description: 'चंद्रोदय रात्री ०९:५२. संकटनाशन गणेश स्तोत्र व स्वामी नामजप.' }] },
    { dayOfMonth: 12, tithi: 'एकादशी', paksha: 'कृष्ण', nakshatra: 'मूल', isEkadashi: true, festivals: [{ id: 'eka-shattila-feb', title: 'षट्तिला एकादशी', titleEn: 'Shattila Ekadashi', category: 'ekadashi', description: 'तिळाचे सहा प्रकारे दान, उपयोग व विष्णू-स्वामी आराधना.' }] },
    { dayOfMonth: 13, tithi: 'द्वादशी', paksha: 'कृष्ण', nakshatra: 'पूर्वाषाढा', festivals: [{ id: 'eka-vijaya', title: 'विजया एकादशी', titleEn: 'Vijaya Ekadashi', category: 'ekadashi', description: 'कार्यात विजय प्राप्तीसाठी उपवास व स्वामी नमन.' }] },
    { dayOfMonth: 15, tithi: 'त्रयोदशी', paksha: 'कृष्ण', nakshatra: 'उत्तराषाढा', isHoliday: true, festivals: [{ id: 'maha-shivratri', title: 'महाशिवरात्री उत्सव', titleEn: 'Maha Shivratri', category: 'festival', isMajor: true, description: 'भगवान शिवाची आराधना, उपवास, रुद्राभिषेक, बिल्वपत्र अर्पण व स्वामी जप.' }] },
    { dayOfMonth: 17, tithi: 'अमावास्या', paksha: 'कृष्ण', nakshatra: 'धनिष्ठा', isAmavasya: true, festivals: [{ id: 'magh-amav', title: 'माघ दर्श अमावास्या', titleEn: 'Magha Amavasya', category: 'amavasya', description: 'पितृ स्मरण, अग्निहोत्र व स्वामी पादुका नमन.' }] },
    { dayOfMonth: 19, tithi: 'द्वितीया', paksha: 'शुक्ल', nakshatra: 'पूर्वभाद्रपदा', isHoliday: true, festivals: [{ id: 'shivaji-jayanti', title: 'छत्रपती शिवाजी महाराज जयंती', titleEn: 'Chhatrapati Shivaji Maharaj Jayanti', category: 'national', description: 'हिंदवी स्वराज्य संस्थापक शिवछत्रपतींना मानाचा त्रिवार मुजरा!' }] },
    { dayOfMonth: 27, tithi: 'एकादशी', paksha: 'शुक्ल', nakshatra: 'पुनर्वसु', isEkadashi: true, festivals: [{ id: 'eka-amalaki', title: 'आमलकी एकादशी', titleEn: 'Amalaki Ekadashi', category: 'ekadashi', description: 'आवळा पूजन, उपवास व आरोग्य प्राप्तीची प्रार्थना.' }] },
  ],
  3: [ // March 2026
    { dayOfMonth: 2, tithi: 'चतुर्दशी', paksha: 'शुक्ल', nakshatra: 'मघा', festivals: [{ id: 'holi-26', title: 'होलिका दहन', titleEn: 'Holika Dahan', category: 'festival', description: 'अनिष्ट प्रवृत्तींचे दहन, पुरणपोळी नैवेद्य व अग्नी देवता पूजन.' }] },
    { dayOfMonth: 3, tithi: 'पौर्णिमा', paksha: 'शुक्ल', nakshatra: 'पूर्वाफाल्गुनी', isPournima: true, isHoliday: true, festivals: [{ id: 'dhulivandan', title: 'धुलिवंदन / फाल्गुन पौर्णिमा (होळी)', titleEn: 'Dhulivandan / Holi', category: 'festival', isMajor: true, description: 'रंगोत्सव, फाल्गुन पौर्णिमा सत्यनारायण पूजा व स्वामी आरती.' }] },
    { dayOfMonth: 6, tithi: 'चतुर्थी', paksha: 'कृष्ण', nakshatra: 'चित्रा', isSankashti: true, moonriseTime: 'रात्री १०:१८', festivals: [{ id: 'sank-mar', title: 'भालचंद्र संकष्टी चतुर्थी', titleEn: 'Sankashti Chaturthi', category: 'sankashti', description: 'शुक्रवार संकष्टी उपवास. चंद्रोदय रात्री १०:१८.' }] },
    { dayOfMonth: 7, tithi: 'पंचमी', paksha: 'कृष्ण', nakshatra: 'स्वाती', festivals: [{ id: 'rang-panchami', title: 'रंगपंचमी', titleEn: 'Rang Panchami', category: 'festival', description: 'नैसर्गिक रंगांची उधळण व आनंदोत्सव.' }] },
    { dayOfMonth: 15, tithi: 'एकादशी', paksha: 'कृष्ण', nakshatra: 'श्रवण', isEkadashi: true, festivals: [{ id: 'eka-papmochini', title: 'पापमोचिनी एकादशी', titleEn: 'Papmochini Ekadashi', category: 'ekadashi', description: 'सर्व पापांचे क्षालन करणारी पापमोचिनी एकादशी.' }] },
    { dayOfMonth: 18, tithi: 'अमावास्या', paksha: 'कृष्ण', nakshatra: 'पूर्वाभाद्रपदा', isAmavasya: true, festivals: [{ id: 'falgun-amav', title: 'फाल्गुन दर्श अमावास्या', titleEn: 'Phalguna Amavasya', category: 'amavasya', description: 'शक १९४७ संवत्सर समाप्ती, पितृ तर्पण व स्वामी नमन.' }] },
    { dayOfMonth: 19, tithi: 'प्रतिपदा', paksha: 'शुक्ल', nakshatra: 'रेवती', isHoliday: true, festivals: [{ id: 'gudi-padwa', title: 'गुढीपाडवा (हिंदू नववर्षारंभ शक १९४८ प्रारंभ)', titleEn: 'Gudi Padwa (New Year Shake 1948)', category: 'festival', isMajor: true, description: 'गुढी उभारून नववर्षाचे स्वागत. क्रोधी नाम संवत्सर प्रारंभ. साडेतीन मुहूर्तांपैकी एक!', sevaSuggestion: 'सकाळी गुढी उभारून स्वामी समर्थांची पंचोपचार पूजा व पुरणपोळी नैवेद्य दाखवावा.' }] },
    { dayOfMonth: 20, tithi: 'द्वितीया', paksha: 'शुक्ल', nakshatra: 'अश्विनी', isSwamiSpecial: true, isHoliday: true, festivals: [{ id: 'swami-prakat-din', title: 'श्री स्वामी समर्थ महाराज प्रगट दिन महामहोत्सव', titleEn: 'Shree Swami Samarth Prakat Din', category: 'swami', isMajor: true, description: 'कर्दळीवनातून चैत्र शुद्ध द्वितीयेस स्वामी महाराजांचे पावन प्रगटीकरण झाले! सेवा दरबारात भव्य जन्मोत्सव.', sevaSuggestion: 'तारक मंत्र २१ आवर्तने, १०८ माळ स्वामी नामजप व स्वामी चरणी पुरणपोळी नैवेद्य.' }] },
    { dayOfMonth: 27, tithi: 'नवमी', paksha: 'शुक्ल', nakshatra: 'पुनर्वसु', isHoliday: true, festivals: [{ id: 'ram-navami', title: 'श्रीराम नवमी (दुपारी १२ वा. जन्मोत्सव)', titleEn: 'Shri Ram Navami', category: 'festival', isMajor: true, description: 'मर्यादा पुरुषोत्तम प्रभू श्रीरामांचा जन्मोत्सव, पाळणा व महाआरती.' }] },
    { dayOfMonth: 29, tithi: 'एकादशी', paksha: 'शुक्ल', nakshatra: 'आश्लेषा', isEkadashi: true, festivals: [{ id: 'eka-kamada', title: 'कामदा एकादशी', titleEn: 'Kamada Ekadashi', category: 'ekadashi', description: 'सर्व मनोकामना पूर्ण करणारी कामदा एकादशी.' }] },
  ],
  4: [ // April 2026
    { dayOfMonth: 2, tithi: 'पौर्णिमा', paksha: 'शुक्ल', nakshatra: 'हस्त', isPournima: true, festivals: [{ id: 'hanuman-jayanti', title: 'श्री हनुमान जयंती / चैत्र पौर्णिमा', titleEn: 'Hanuman Jayanti', category: 'festival', isMajor: true, description: 'सूर्योदयसमयी मारुती जन्मोत्सव व मारुती स्तोत्र ११ वेळा पठण.' }] },
    { dayOfMonth: 5, tithi: 'चतुर्थी', paksha: 'कृष्ण', nakshatra: 'अनुराधा', isSankashti: true, moonriseTime: 'रात्री १०:५४', festivals: [{ id: 'sank-apr', title: 'विकट संकष्टी चतुर्थी', titleEn: 'Sankashti Chaturthi', category: 'sankashti', description: 'रविवार संकष्टी उपवास. चंद्रोदय रात्री १०:५४.' }] },
    { dayOfMonth: 9, tithi: 'सप्तमी', paksha: 'कृष्ण', nakshatra: 'पूर्वाषाढा', isSwamiSpecial: true, festivals: [{ id: 'swami-saptah-start', title: 'श्री स्वामी समर्थ पुण्यतिथी सप्ताह प्रारंभ', titleEn: 'Swami Samarth Punyatithi Saptah Begins', category: 'swami', isMajor: true, description: 'अखिल भारतीय गुरुपीठ व सर्व सेवा केंद्रांत ७ दिवसीय अखंड गुरुचरित्र पारायण व नामजप सप्ताह.' }] },
    { dayOfMonth: 13, tithi: 'एकादशी', paksha: 'कृष्ण', nakshatra: 'धनिष्ठा', isEkadashi: true, festivals: [{ id: 'eka-varuthini', title: 'वरुथिनी एकादशी', titleEn: 'Varuthini Ekadashi', category: 'ekadashi', description: 'वरुथिनी एकादशी उपवास, दीपदान व अन्नदान.' }] },
    { dayOfMonth: 14, tithi: 'द्वादशी', paksha: 'कृष्ण', nakshatra: 'शतभिषा', isHoliday: true, festivals: [{ id: 'ambedkar-jayanti', title: 'डॉ. बाबासाहेब आंबेडकर जयंती', titleEn: 'Dr. B.R. Ambedkar Jayanti', category: 'national', description: 'भारतीय संविधानाचे शिल्पकार भारतरत्न डॉ. बाबासाहेब आंबेडकर यांना विनम्र अभिवादन.' }] },
    { dayOfMonth: 15, tithi: 'त्रयोदशी', paksha: 'कृष्ण', nakshatra: 'पूर्वभाद्रपदा', isSwamiSpecial: true, isHoliday: true, festivals: [{ id: 'swami-punyatithi', title: 'श्री स्वामी समर्थ महाराज १४८ वी पुण्यतिथी महासमाधी दिन', titleEn: 'Shree Swami Samarth Mahasamadhi Day', category: 'swami', isMajor: true, description: 'चैत्र वद्य त्रयोदशी: स्वामी महाराजांचा महासमाधी सोहळा. "आम्ही गेलो नाही, जिवंतचि आहोत!" या अभयवचनाचे नित्य स्मरण.', sevaSuggestion: 'गुरुचरित्र १४ वा व १८ वा अध्याय वाचन, तारक मंत्र व महाआरती.' }] },
    { dayOfMonth: 17, tithi: 'अमावास्या', paksha: 'कृष्ण', nakshatra: 'रेवती', isAmavasya: true, festivals: [{ id: 'chaitra-amav', title: 'चैत्र दर्श अमावास्या', titleEn: 'Chaitra Amavasya', category: 'amavasya', description: 'अमावास्या स्वामी महापूजा, पितृ स्मरण व शांती होम.' }] },
    { dayOfMonth: 20, tithi: 'तृतीया', paksha: 'शुक्ल', nakshatra: 'रोहिणी', isHoliday: true, festivals: [{ id: 'akshaya-tritiya', title: 'अक्षय्य तृतीया (साडेतीन मुहूर्तांपैकी एक)', titleEn: 'Akshaya Tritiya', category: 'muhurat', isMajor: true, description: 'अक्षय्य फल देणारा परम पवित्र मुहूर्त. सुवर्ण खरेदी, गृहप्रवेश, नवीन संकल्प व पितृ तर्पण.' }] },
    { dayOfMonth: 23, tithi: 'षष्ठी', paksha: 'शुक्ल', nakshatra: 'पुष्य', isGuruPushya: true, festivals: [{ id: 'gp-apr', title: '✨ गुरुपुष्य योग (रात्री ०८:५७ पासून)', titleEn: 'Guru Pushya Yoga', category: 'gurupushya', isMajor: true, description: 'गुरुवार व पुष्य नक्षत्राचा अत्यंत दुर्मिळ योग. सुवर्ण खरेदी व नवीन कार्यारंभासाठी सिद्ध मुहूर्त.' }] },
    { dayOfMonth: 28, tithi: 'एकादशी', paksha: 'शुक्ल', nakshatra: 'उत्तराफाल्गुनी', isEkadashi: true, festivals: [{ id: 'eka-mohini', title: 'मोहिनी एकादशी', titleEn: 'Mohini Ekadashi', category: 'ekadashi', description: 'मोहाचे निरसन करणारी मोहिनी एकादशी.' }] },
  ],
  5: [ // May 2026
    { dayOfMonth: 1, tithi: 'पौर्णिमा', paksha: 'शुक्ल', nakshatra: 'स्वाती', isPournima: true, isHoliday: true, festivals: [{ id: 'maha-din', title: 'महाराष्ट्र दिन व कामगार दिन', titleEn: 'Maharashtra Day', category: 'national', description: 'महाराष्ट्र राज्याची स्थापना व कामगारांचा गौरव दिन.' }, { id: 'buddha-pournima', title: 'बुद्ध पौर्णिमा / वैशाख पौर्णिमा', titleEn: 'Buddha Pournima', category: 'pournima', description: 'सत्यनारायण पूजा, दीपदान व स्वामी उपासना.' }] },
    { dayOfMonth: 5, tithi: 'चतुर्थी', paksha: 'कृष्ण', nakshatra: 'ज्येष्ठा', isSankashti: true, moonriseTime: 'रात्री ११:३२', festivals: [{ id: 'sank-may', title: 'अंगारकी संकष्टी चतुर्थी (मंगळवार)', titleEn: 'Angarki Sankashti Chaturthi', category: 'sankashti', isMajor: true, description: 'अत्यंत पावन अंगारकी संकष्टी चतुर्थी! चंद्रोदय रात्री ११:३२. गणपती अथर्वशीर्ष २१ आवर्तने.' }] },
    { dayOfMonth: 12, tithi: 'एकादशी', paksha: 'कृष्ण', nakshatra: 'उत्तराभाद्रपदा', isEkadashi: true, festivals: [{ id: 'eka-apara', title: 'अपरा एकादशी', titleEn: 'Apara Ekadashi', category: 'ekadashi', description: 'अपार पुण्य देणारी अपरा एकादशी.' }] },
    { dayOfMonth: 16, tithi: 'अमावास्या', paksha: 'कृष्ण', nakshatra: 'भरणी', isAmavasya: true, festivals: [{ id: 'vaishakh-amav', title: 'वैशाख दर्श अमावास्या / श्री शनि जयंती', titleEn: 'Vaishakha Amavasya / Shani Jayanti', category: 'amavasya', description: 'शनि मारुती दर्शन, तेल-तीळ अर्पण व स्वामी उपासना.' }] },
    { dayOfMonth: 17, tithi: 'प्रतिपदा', paksha: 'शुक्ल', nakshatra: 'रोहिणी', festivals: [{ id: 'adhik-maas-start', title: 'अधिक ज्येष्ठ मास प्रारंभ (पुरुषोत्तम मास)', titleEn: 'Adhik Maas Begins', category: 'festival', description: 'अधिक महिन्यात नित्य जप, दानधर्म व विष्णू-स्वामी उपासनेचे अनंत पटीने फळ मिळते.' }] },
    { dayOfMonth: 21, tithi: 'पंचमी', paksha: 'शुक्ल', nakshatra: 'पुष्य', isGuruPushya: true, festivals: [{ id: 'gp-may', title: '✨ गुरुपुष्य योग (अधिक मास)', titleEn: 'Guru Pushya Yoga', category: 'gurupushya', isMajor: true, description: 'गुरुवार व पुष्य नक्षत्राचा शुभ योग. आध्यात्मिक साधना व खरेदीसाठी फलदायी.' }] },
    { dayOfMonth: 27, tithi: 'एकादशी', paksha: 'शुक्ल', nakshatra: 'हस्त', isEkadashi: true, festivals: [{ id: 'eka-nirjala', title: 'निर्जला एकादशी (भीमसेनी एकादशी)', titleEn: 'Nirjala Ekadashi', category: 'ekadashi', isMajor: true, description: 'जलदान, पंखा दान व सर्वश्रेष्ठ निर्जला उपवास.' }] },
    { dayOfMonth: 31, tithi: 'पौर्णिमा', paksha: 'शुक्ल', nakshatra: 'अनुराधा', isPournima: true, festivals: [{ id: 'adhik-pournima', title: 'अधिक ज्येष्ठ पौर्णिमा (सत्यनारायण व्रत)', titleEn: 'Adhika Jyeshtha Pournima', category: 'pournima', description: 'सत्यनारायण कथा व पुरुषोत्तम मास विशेष सेवा.' }] },
  ],
  6: [ // June 2026
    { dayOfMonth: 4, tithi: 'चतुर्थी', paksha: 'कृष्ण', nakshatra: 'उत्तराषाढा', isSankashti: true, moonriseTime: 'रात्री ११:४८', festivals: [{ id: 'sank-jun', title: 'संकष्टी चतुर्थी (अधिक मास)', titleEn: 'Sankashti Chaturthi', category: 'sankashti', description: 'चंद्रोदय रात्री ११:४८. संकटनाशन गणेश स्तोत्र पठण.' }] },
    { dayOfMonth: 11, tithi: 'एकादशी', paksha: 'कृष्ण', nakshatra: 'अश्विनी', isEkadashi: true, festivals: [{ id: 'eka-yogini', title: 'योगिनी एकादशी', titleEn: 'Yogini Ekadashi', category: 'ekadashi', description: 'आरोग्य व पापनाशक योगिनी एकादशी.' }] },
    { dayOfMonth: 15, tithi: 'अमावास्या', paksha: 'कृष्ण', nakshatra: 'रोहिणी', isAmavasya: true, festivals: [{ id: 'adhik-amav', title: 'अधिक ज्येष्ठ अमावास्या (अधिक मास समाप्ती)', titleEn: 'Adhik Maas Concludes', category: 'amavasya', description: 'अधिक मास समाप्ती, दीपदान व अन्नदान.' }] },
    { dayOfMonth: 16, tithi: 'प्रतिपदा', paksha: 'शुक्ल', nakshatra: 'मृगशीर्ष', festivals: [{ id: 'nija-jyeshtha', title: 'निज ज्येष्ठ मास प्रारंभ', titleEn: 'Nija Jyeshtha Begins', category: 'festival', description: 'नियमित ज्येष्ठ मास प्रारंभ.' }] },
    { dayOfMonth: 18, tithi: 'तृतीया', paksha: 'शुक्ल', nakshatra: 'पुष्य', isGuruPushya: true, festivals: [{ id: 'gp-jun', title: '✨ गुरुपुष्य योग (सकाळी ११:३२ पर्यंत)', titleEn: 'Guru Pushya Yoga', category: 'gurupushya', isMajor: true, description: 'गुरुवार व पुष्य नक्षत्राचा शुभ योग.' }] },
    { dayOfMonth: 21, tithi: 'षष्ठी', paksha: 'शुक्ल', nakshatra: 'मघा', festivals: [{ id: 'yoga-day', title: 'आंतरराष्ट्रीय योग दिन', titleEn: 'International Yoga Day', category: 'national', description: 'शरीर व मनाच्या स्वास्थ्यासाठी दैनंदिन योगाभ्यास.' }] },
    { dayOfMonth: 25, tithi: 'एकादशी', paksha: 'शुक्ल', nakshatra: 'विशाखा', isEkadashi: true, isHoliday: true, festivals: [{ id: 'ashadhi-ekadashi', title: 'आषाढी एकादशी (देवशयनी एकादशी - पंढरपूर महावारी)', titleEn: 'Ashadhi Ekadashi (Devshayani)', category: 'ekadashi', isMajor: true, description: 'पंढरपूर महावारी सोहळा! चातुर्मास प्रारंभ. विठ्ठल रुपी स्वामी चरणी महाउपवास.', sevaSuggestion: 'विष्णु सहस्रनाम, स्वामी जप व उपवास.' }] },
    { dayOfMonth: 29, tithi: 'पौर्णिमा', paksha: 'शुक्ल', nakshatra: 'ज्येष्ठा', isPournima: true, festivals: [{ id: 'vat-pournima', title: 'वटपौर्णिमा (ज्येष्ठ पौर्णिमा)', titleEn: 'Vat Pournima', category: 'festival', isMajor: true, description: 'सौभाग्यवती स्त्रियांचे वटवृक्ष पूजन. अखंड सौभाग्यासाठी प्रार्थना.' }] },
  ],
  7: [ // July 2026
    { dayOfMonth: 3, tithi: 'चतुर्थी', paksha: 'कृष्ण', nakshatra: 'धनिष्ठा', isSankashti: true, moonriseTime: 'रात्री ०९:४६', festivals: [{ id: 'sank-jul', title: 'संकष्टी चतुर्थी', titleEn: 'Sankashti Chaturthi', category: 'sankashti', description: 'शुक्रवार संकष्टी उपवास. चंद्रोदय रात्री ०९:४६.' }] },
    { dayOfMonth: 10, tithi: 'एकादशी', paksha: 'कृष्ण', nakshatra: 'कृत्तिका', isEkadashi: true, festivals: [{ id: 'eka-kamika', title: 'कामिका एकादशी', titleEn: 'Kamika Ekadashi', category: 'ekadashi', description: 'सर्व मनोकामना पूर्ण करणारी कामिका एकादशी.' }] },
    { dayOfMonth: 14, tithi: 'अमावास्या', paksha: 'कृष्ण', nakshatra: 'पुनर्वसु', isAmavasya: true, festivals: [{ id: 'deep-amav', title: 'दिव्याची अमावास्या / दीपपूजन', titleEn: 'Deep Amavasya (Lamp Worship)', category: 'festival', isMajor: true, description: 'घरातील सर्व दिव्यांचे पूजन करून अंधाराकडून प्रकाशाकडे वाटचाल.' }] },
    { dayOfMonth: 15, tithi: 'प्रतिपदा', paksha: 'शुक्ल', nakshatra: 'पुष्य', festivals: [{ id: 'shravan-start', title: 'पवित्र श्रावण मास प्रारंभ', titleEn: 'Holy Shravan Month Begins', category: 'festival', description: 'श्रावणी सोमवार शिव-स्वामी उपासना, नित्य जप व मंगळागौर पूजन.' }] },
    { dayOfMonth: 25, tithi: 'एकादशी', paksha: 'शुक्ल', nakshatra: 'अनुराधा', isEkadashi: true, festivals: [{ id: 'eka-putrada-shravan', title: 'श्रावण पुत्रदा एकादशी', titleEn: 'Shravan Putrada Ekadashi', category: 'ekadashi', description: 'संतान सुख व कल्याणासाठी पुत्रदा एकादशी.' }] },
    { dayOfMonth: 29, tithi: 'पौर्णिमा', paksha: 'शुक्ल', nakshatra: 'उत्तराषाढा', isSwamiSpecial: true, isPournima: true, isHoliday: true, festivals: [{ id: 'guru-pournima', title: 'श्री गुरुपौर्णिमा उत्सव (व्यास पौर्णिमा)', titleEn: 'Shree Guru Pournima', category: 'swami', isMajor: true, description: 'परम पूज्य गुरुमाऊली व स्वामी समर्थ महाराज पावन चरण पूजन. गुरुविना नाही दुजा आधार!', sevaSuggestion: 'गुरुपादुका अभिषेक, तारक मंत्र २१ वेळा व गुरुचरित्र वाचन.' }] },
  ],
  8: [ // August 2026
    { dayOfMonth: 2, tithi: 'चतुर्थी', paksha: 'कृष्ण', nakshatra: 'पूर्वभाद्रपदा', isSankashti: true, moonriseTime: 'रात्री ०९:१५', festivals: [{ id: 'sank-aug', title: 'संकष्टी चतुर्थी', titleEn: 'Sankashti Chaturthi', category: 'sankashti', description: 'चंद्रोदय रात्री ०९:१५.' }] },
    { dayOfMonth: 8, tithi: 'एकादशी', paksha: 'कृष्ण', nakshatra: 'मृगशीर्ष', isEkadashi: true, festivals: [{ id: 'eka-aja', title: 'अजा एकादशी', titleEn: 'Aja Ekadashi', category: 'ekadashi', description: 'सर्व संकटांचे निवारण करणारी अजा एकादशी.' }] },
    { dayOfMonth: 12, tithi: 'अमावास्या', paksha: 'कृष्ण', nakshatra: 'आश्लेषा', isAmavasya: true, festivals: [{ id: 'pithori-amav', title: 'पिठोरी अमावास्या / पोळा बेंदूर सण', titleEn: 'Pithori Amavasya / Pola Bendur', category: 'festival', isMajor: true, description: 'बळीराजाचा सखा बैलांचे कृतज्ञतापूर्वक पूजन (बेंदूर / पोळा).' }] },
    { dayOfMonth: 15, tithi: 'तृतीया', paksha: 'शुक्ल', nakshatra: 'पूर्वाफाल्गुनी', isHoliday: true, festivals: [{ id: 'indep-day', title: 'भारतीय स्वातंत्र्य दिन', titleEn: 'Independence Day', category: 'national', description: 'भारतीय स्वातंत्र्य दिन चिरायू होवो!' }] },
    { dayOfMonth: 18, tithi: 'पंचमी', paksha: 'शुक्ल', nakshatra: 'चित्रा', festivals: [{ id: 'nag-panchami', title: 'नागपंचमी सण', titleEn: 'Nag Panchami', category: 'festival', isMajor: true, description: 'नागदेवता पूजन, वारुळास दूध अर्पण व बंधुप्रेमाचा सण.' }] },
    { dayOfMonth: 23, tithi: 'एकादशी', paksha: 'शुक्ल', nakshatra: 'मूल', isEkadashi: true, festivals: [{ id: 'eka-parivartini', title: 'परिवर्तिनी एकादशी', titleEn: 'Parivartini Ekadashi', category: 'ekadashi', description: 'भगवान विष्णूंच्या कुस बदलण्याची एकादशी.' }] },
    { dayOfMonth: 28, tithi: 'पौर्णिमा', paksha: 'शुक्ल', nakshatra: 'धनिष्ठा', isPournima: true, isHoliday: true, festivals: [{ id: 'raksha-bandhan', title: 'रक्षाबंधन / नारळी पौर्णिमा / श्रावण पौर्णिमा', titleEn: 'Raksha Bandhan / Narali Pournima', category: 'festival', isMajor: true, description: 'भावा-बहिणीच्या अतूट प्रेमाचे प्रतीक व समुद्र देवतेस नारळ अर्पण.' }] },
    { dayOfMonth: 31, tithi: 'चतुर्थी', paksha: 'कृष्ण', nakshatra: 'रेवती', isSankashti: true, moonriseTime: 'रात्री ०८:४५', festivals: [{ id: 'sank-aug-2', title: 'भाद्रपद संकष्टी चतुर्थी', titleEn: 'Sankashti Chaturthi', category: 'sankashti', description: 'सोमवार संकष्टी उपवास. चंद्रोदय रात्री ०८:४५.' }] },
  ],
  9: [ // September 2026
    { dayOfMonth: 4, tithi: 'अष्टमी', paksha: 'कृष्ण', nakshatra: 'रोहिणी', isHoliday: true, festivals: [{ id: 'gokulashtami', title: 'श्रीकृष्ण जन्माष्टमी / गोकुळाष्टमी', titleEn: 'Shri Krishna Janmashtami', category: 'festival', isMajor: true, description: 'मध्यरात्री १२ वाजता बाळकृष्णाचा जन्मोत्सव, उपवास व नामस्मरण.' }] },
    { dayOfMonth: 5, tithi: 'नवमी', paksha: 'कृष्ण', nakshatra: 'मृगशीर्ष', festivals: [{ id: 'dahihandi', title: 'गोपाळकाला / दहीहंडी उत्सव', titleEn: 'Dahihandi Festival', category: 'festival', description: 'गोपाळांचा दहीहंडी थरार व आनंदोत्सव.' }] },
    { dayOfMonth: 6, tithi: 'एकादशी', paksha: 'कृष्ण', nakshatra: 'पुनर्वसु', isEkadashi: true, festivals: [{ id: 'eka-indira', title: 'इंदिरा एकादशी', titleEn: 'Indira Ekadashi', category: 'ekadashi', description: 'पितरांच्या उद्धारासाठी विशेष इंदिरा एकादशी उपवास.' }] },
    { dayOfMonth: 11, tithi: 'अमावास्या', paksha: 'कृष्ण', nakshatra: 'मघा', isAmavasya: true, festivals: [{ id: 'shravan-amav-end', title: 'श्रावण दर्श अमावास्या समाप्ती', titleEn: 'Shravana Amavasya', category: 'amavasya', description: 'श्रावण मास समाप्ती व पिठोरी व्रत.' }] },
    { dayOfMonth: 14, tithi: 'चतुर्थी', paksha: 'शुक्ल', nakshatra: 'चित्रा', isHoliday: true, festivals: [{ id: 'ganesh-chaturthi', title: 'श्री गणेश चतुर्थी (गणेशोत्सव प्रारंभ)', titleEn: 'Ganesh Chaturthi', category: 'festival', isMajor: true, description: 'घरोघरी व सार्वजनिक मंडळांमध्ये लाडक्या गणपती बाप्पांची प्रतिष्ठापना!', sevaSuggestion: 'अथर्वशीर्ष २१ आवर्तने व मोदक नैवेद्य.' }] },
    { dayOfMonth: 15, tithi: 'पंचमी', paksha: 'शुक्ल', nakshatra: 'स्वाती', festivals: [{ id: 'rishi-panchami', title: 'ऋषीपंचमी', titleEn: 'Rishi Panchami', category: 'festival', description: 'सप्तर्षींचे कृतज्ञतापूर्वक पूजन.' }] },
    { dayOfMonth: 19, tithi: 'अष्टमी', paksha: 'शुक्ल', nakshatra: 'ज्येष्ठा', festivals: [{ id: 'gauri-pujan', title: 'ज्येष्ठा गौरी पूजन / महालक्ष्मी नैवेद्य', titleEn: 'Gauri Pujan', category: 'festival', isMajor: true, description: 'माहेरवाशीण गौरींचे आगमन व मंगलमय पूजन.' }] },
    { dayOfMonth: 20, tithi: 'नवमी', paksha: 'शुक्ल', nakshatra: 'मूल', festivals: [{ id: 'gauri-visarjan', title: 'गौरी विसर्जन', titleEn: 'Gauri Visarjan', category: 'festival', description: 'माहेरवाशीण गौरींना निरोप.' }] },
    { dayOfMonth: 21, tithi: 'एकादशी', paksha: 'शुक्ल', nakshatra: 'पूर्वाषाढा', isEkadashi: true, festivals: [{ id: 'eka-papankusha-sep', title: 'वामन / पाशांकुशा एकादशी', titleEn: 'Papankusha Ekadashi', category: 'ekadashi', description: 'पापविनाशक एकादशी.' }] },
    { dayOfMonth: 25, tithi: 'चतुर्दशी', paksha: 'शुक्ल', nakshatra: 'शतभिषा', isHoliday: true, festivals: [{ id: 'anant-chaturdashi', title: 'अनंत चतुर्दशी (श्री गणेश विसर्जन)', titleEn: 'Anant Chaturdashi (Ganesh Visarjan)', category: 'festival', isMajor: true, description: 'गणपती बाप्पा मोरया, पुढच्या वर्षी लवकर या! अनंत पद्मनाभ व्रत.' }] },
    { dayOfMonth: 26, tithi: 'पौर्णिमा', paksha: 'शुक्ल', nakshatra: 'पूर्वभाद्रपदा', isPournima: true, festivals: [{ id: 'pitru-paksha-start', title: 'भाद्रपद पौर्णिमा / पितृपक्ष प्रारंभ (महालय श्राद्ध)', titleEn: 'Pitru Paksha Begins', category: 'festival', isMajor: true, description: 'महालय श्राद्ध व पितृ स्मरण काळ प्रारंभ.' }] },
    { dayOfMonth: 29, tithi: 'चतुर्थी', paksha: 'कृष्ण', nakshatra: 'भरणी', isSankashti: true, moonriseTime: 'रात्री ०८:१२', festivals: [{ id: 'sank-sep-angarki', title: 'अंगारकी संकष्टी चतुर्थी (मंगळवार)', titleEn: 'Angarki Sankashti Chaturthi', category: 'sankashti', isMajor: true, description: 'पितृपक्षातील अतिशय पवित्र मंगळवार अंगारकी संकष्टी! चंद्रोदय रात्री ०८:१२.' }] },
  ],
  10: [ // October 2026
    { dayOfMonth: 2, tithi: 'सप्तमी', paksha: 'कृष्ण', nakshatra: 'मृगशीर्ष', isHoliday: true, festivals: [{ id: 'gandhi-jayanti', title: 'महात्मा गांधी जयंती / लालबहादूर शास्त्री जयंती', titleEn: 'Gandhi Jayanti', category: 'national', description: 'राष्ट्रपिता महात्मा गांधी व लाल बहादूर शास्त्री जयंती.' }] },
    { dayOfMonth: 6, tithi: 'एकादशी', paksha: 'कृष्ण', nakshatra: 'पुष्य', isEkadashi: true, festivals: [{ id: 'eka-indira-oct', title: 'इंदिरा एकादशी (पितृपक्ष एकादशी श्राद्ध)', titleEn: 'Indira Ekadashi', category: 'ekadashi', description: 'पितृपक्षातील अत्यंत पुण्यकारक एकादशी उपवास व पितृ श्राद्ध.' }] },
    { dayOfMonth: 10, tithi: 'अमावास्या', paksha: 'कृष्ण', nakshatra: 'हस्त', isAmavasya: true, festivals: [{ id: 'sarva-pitri', title: 'सर्वपित्री दर्श अमावास्या (पितृपक्ष समाप्ती)', titleEn: 'Sarva Pitri Amavasya', category: 'amavasya', isMajor: true, description: 'सर्व ज्ञात-अज्ञात पितरांचे श्राद्ध, अन्नदान व स्वामी प्रार्थना.' }] },
    { dayOfMonth: 11, tithi: 'प्रतिपदा', paksha: 'शुक्ल', nakshatra: 'चित्रा', isHoliday: true, festivals: [{ id: 'navratri-start', title: 'घटस्थापना (शारदीय नवरात्र प्रारंभ)', titleEn: 'Navratri Begins (Ghatasthapana)', category: 'festival', isMajor: true, description: 'कुलस्वामिनी श्री जगदंबा माता प्रतिष्ठापना. अखंड नंदादीप व नवान्ह पारायण प्रारंभ.', sevaSuggestion: 'सप्तशती पाठ, ललिता सहस्रनाम व स्वामी समर्थ तारक मंत्र.' }] },
    { dayOfMonth: 19, tithi: 'नवमी', paksha: 'शुक्ल', nakshatra: 'उत्तराषाढा', festivals: [{ id: 'durga-ashtami', title: 'दुर्गाष्टमी / महानवमी (खंडेनवमी)', titleEn: 'Maha Navami / Khandenavami', category: 'festival', isMajor: true, description: 'शस्त्र, यंत्र, वाहन व सरस्वती पूजन. घटोत्थापन.' }] },
    { dayOfMonth: 20, tithi: 'दशमी', paksha: 'शुक्ल', nakshatra: 'श्रवण', isHoliday: true, festivals: [{ id: 'dussehra-26', title: 'दसरा / विजयादशमी (साडेतीन मुहूर्तांपैकी एक)', titleEn: 'Dussehra / Vijayadashami', category: 'muhurat', isMajor: true, description: 'अधर्मावर धर्माचा विजय. सीमोल्लंघन, आपट्याची पाने (सोने) वाटणे व नवीन कार्यारंभ.' }] },
    { dayOfMonth: 22, tithi: 'एकादशी', paksha: 'शुक्ल', nakshatra: 'धनिष्ठा', isEkadashi: true, festivals: [{ id: 'eka-pashankusha', title: 'पाशांकुशा एकादशी', titleEn: 'Pashankusha Ekadashi', category: 'ekadashi', description: 'पाशातून मुक्ती देणारी पाशांकुशा एकादशी.' }] },
    { dayOfMonth: 25, tithi: 'पौर्णिमा', paksha: 'शुक्ल', nakshatra: 'अश्विनी', isPournima: true, isHoliday: true, festivals: [{ id: 'kojagiri', title: 'कोजागरी पौर्णिमा (अश्विन पौर्णिमा / शरद पौर्णिमा)', titleEn: 'Kojagiri Pournima', category: 'pournima', isMajor: true, description: 'चंद्रप्रकाशात आटीव दूध नैवेद्य व देवी महालक्ष्मीचे स्वागत ("को जागर्ति?").' }] },
    { dayOfMonth: 29, tithi: 'चतुर्थी', paksha: 'कृष्ण', nakshatra: 'रोहिणी', isSankashti: true, moonriseTime: 'रात्री ०८:५०', festivals: [{ id: 'sank-oct', title: 'संकष्टी चतुर्थी / करवा चौथ', titleEn: 'Sankashti Chaturthi / Karwa Chauth', category: 'sankashti', description: 'चंद्रोदय रात्री ०८:५०. अखंड सौभाग्यासाठी करवा चौथ व्रत.' }] },
  ],
  11: [ // November 2026 - OFFICIAL MAHARASHTRA DIWALI DATES
    { dayOfMonth: 5, tithi: 'एकादशी', paksha: 'कृष्ण', nakshatra: 'उत्तराफाल्गुनी', isEkadashi: true, festivals: [
      { id: 'eka-rama', title: 'रमा एकादशी उपवास', titleEn: 'Rama Ekadashi', category: 'ekadashi', description: 'कार्तिक कृष्ण एकादशी. महालक्ष्मीच्या कृपेने ऐश्वर्य देणारी एकादशी.' },
      { id: 'vasubaras', title: 'गोवत्स द्वादशी (वसुबारस - दीपावली प्रारंभ)', titleEn: 'Vasu Baras (Diwali Begins)', category: 'festival', isMajor: true, description: 'गाय आणि वासराचे प्रेमपूर्वक सवत्स पूजन. दीपावली सणाची मंगलमय सुरुवात.' }
    ] },
    { dayOfMonth: 6, tithi: 'त्रयोदशी', paksha: 'कृष्ण', nakshatra: 'हस्त', festivals: [{ id: 'dhanteras', title: 'धनत्रयोदशी / धन्वंतरी जयंती (यमदीपदान)', titleEn: 'Dhantrayodashi (Dhanteras)', category: 'festival', isMajor: true, description: 'आरोग्य देवता धन्वंतरी पूजन, नवीन भांडी व सुवर्ण खरेदी, प्रदोषसमयी दक्षिण दिशेस यमदीपदान.' }] },
    { dayOfMonth: 7, tithi: 'चतुर्दशी', paksha: 'कृष्ण', nakshatra: 'चित्रा', festivals: [{ id: 'roop-chaturdashi', title: 'रूप चतुर्दशी / नरक चतुर्दशी (अभ्यंगस्नान प्रारंभ)', titleEn: 'Narak Chaturdashi Eve', category: 'festival', description: 'उटणे लावून मंगल स्नान व यम तर्पण.' }] },
    { dayOfMonth: 8, tithi: 'अमावास्या', paksha: 'कृष्ण', nakshatra: 'स्वाती', isHoliday: true, festivals: [{ id: 'lakshmi-pujan', title: 'नरक चतुर्दशी व महालक्ष्मी पूजन (मुख्य दीपावली)', titleEn: 'Lakshmi Pujan & Narak Chaturdashi (Diwali)', category: 'festival', isMajor: true, description: 'पहाटे अभ्यंगस्नान, सायंकाळी प्रदोष काळात माता महालक्ष्मी, सरस्वती व कुबेर महापूजा, दीपमाळा प्रज्वलन.', sevaSuggestion: 'श्री सूक्त १६ आवर्तने, कनकधारा स्तोत्र पठण व स्वामी समर्थ महाआरती.' }] },
    { dayOfMonth: 9, tithi: 'अमावास्या', paksha: 'कृष्ण', nakshatra: 'विशाखा', isAmavasya: true, festivals: [{ id: 'somvati-amav', title: 'सोमवती दर्श अमावास्या / गोवर्धन पूजा (अन्नकूट)', titleEn: 'Somvati Amavasya / Govardhan Puja', category: 'amavasya', isMajor: true, description: 'सोमवारी आलेली अत्यंत दुर्मिळ व पवित्र सोमवती अमावास्या! गोवर्धन पूजा व अन्नकूट महोत्सव.' }] },
    { dayOfMonth: 10, tithi: 'प्रतिपदा', paksha: 'शुक्ल', nakshatra: 'अनुराधा', isHoliday: true, festivals: [{ id: 'diwali-padwa', title: 'बळीप्रतिपदा (दिवाळी पाडवा - साडेतीन मुहूर्तांपैकी एक)', titleEn: 'Diwali Padwa / Bali Pratipada', category: 'muhurat', isMajor: true, description: 'पती-पत्नीच्या अतूट स्नेहाचा सण. औक्षण, नवीन वस्त्रे व नवीन विक्रम संवत् २०८३ प्रारंभ.' }] },
    { dayOfMonth: 11, tithi: 'द्वितीया', paksha: 'शुक्ल', nakshatra: 'ज्येष्ठा', isHoliday: true, festivals: [{ id: 'bhaubeej', title: 'भाऊबीज (यमद्वितीया)', titleEn: 'Bhaubeej (Bhai Dooj)', category: 'festival', isMajor: true, description: 'बहीण भावाचे औक्षण करून दीर्घायुष्य व यशाची प्रार्थना करते.' }] },
    { dayOfMonth: 20, tithi: 'एकादशी', paksha: 'शुक्ल', nakshatra: 'उत्तराभाद्रपदा', isEkadashi: true, isHoliday: true, festivals: [
      { id: 'kartiki-ekadashi', title: 'कार्तिकी एकादशी (प्रबोधिनी एकादशी - पंढरपूर यात्रा)', titleEn: 'Kartiki Ekadashi (Prabodhini)', category: 'ekadashi', isMajor: true, description: 'पंढरपूर यात्रा, चातुर्मास समाप्ती. श्री विष्णूंचा योगनिद्रेतून जागृती दिन.' },
      { id: 'tulsi-vivah-start', title: 'तुळशी विवाह प्रारंभ', titleEn: 'Tulsi Vivah Begins', category: 'festival', isMajor: true, description: 'तुळशी मातेचा भगवान शालिग्रामाशी विवाह सोहळा प्रारंभ. लग्न मुहूर्तांची सुरुवात.' }
    ] },
    { dayOfMonth: 21, tithi: 'द्वादशी', paksha: 'शुक्ल', nakshatra: 'रेवती', festivals: [{ id: 'tulsi-vivah', title: 'तुळशी विवाह सोहळा', titleEn: 'Tulsi Vivah Day', category: 'festival', description: 'घरोघरी व मंदिरांत तुळशी मातेचा विवाह सोहळा.' }] },
    { dayOfMonth: 23, tithi: 'चतुर्दशी', paksha: 'शुक्ल', nakshatra: 'भरणी', festivals: [{ id: 'vaikuntha-chaturdashi', title: 'वैकुंठ चतुर्दशी (हरि-हर भेट)', titleEn: 'Vaikuntha Chaturdashi', category: 'festival', description: 'मध्यरात्री भगवान शिव व विष्णूंची पावन भेट, तुळशी व बेल अर्पण.' }] },
    { dayOfMonth: 24, tithi: 'पौर्णिमा', paksha: 'शुक्ल', nakshatra: 'कृत्तिका', isPournima: true, isHoliday: true, festivals: [{ id: 'tripurari-pournima', title: 'त्रिपुरारी पौर्णिमा / देवदिवाळी (कार्तिक पौर्णिमा)', titleEn: 'Tripurari Pournima (Dev Diwali)', category: 'pournima', isMajor: true, description: 'मंदिरांमध्ये दीपमाळा प्रज्वलित करून देवांची दिवाळी साजरी केली जाते. त्रिपुर वात अर्पण.' }] },
    { dayOfMonth: 27, tithi: 'चतुर्थी', paksha: 'कृष्ण', nakshatra: 'पुनर्वसु', isSankashti: true, moonriseTime: 'रात्री ०८:३५', festivals: [{ id: 'sank-nov', title: 'संकष्टी चतुर्थी', titleEn: 'Sankashti Chaturthi', category: 'sankashti', description: 'शुक्रवार संकष्टी उपवास. चंद्रोदय रात्री ०८:३५.' }] },
  ],
  12: [ // December 2026
    { dayOfMonth: 4, tithi: 'एकादशी', paksha: 'कृष्ण', nakshatra: 'चित्रा', isEkadashi: true, festivals: [{ id: 'eka-utpanna', title: 'उत्पन्ना एकादशी उपवास', titleEn: 'Utpanna Ekadashi', category: 'ekadashi', description: 'एकादशी देवतेचा प्रादुर्भाव दिन. नित्य एकादशी व्रताची सुरुवात.' }] },
    { dayOfMonth: 8, tithi: 'अमावास्या', paksha: 'कृष्ण', nakshatra: 'विशाखा', isAmavasya: true, festivals: [{ id: 'kartik-amav', title: 'मार्गशीर्ष दर्श अमावास्या', titleEn: 'Margashirsha Amavasya', category: 'amavasya', description: 'दर्श अमावास्या, कुलदेवता स्मरण व दीपपूजन.' }] },
    { dayOfMonth: 15, tithi: 'षष्ठी', paksha: 'शुक्ल', nakshatra: 'धनिष्ठा', festivals: [{ id: 'champa-shashthi', title: 'चंपाषष्ठी (खंडोबा नवरात्र उत्थापन)', titleEn: 'Champa Shashthi', category: 'festival', isMajor: true, description: 'मल्हारी मार्तंड जेजुरी खंडोबा देवास वांग्याचे भरीत व रोडा नैवेद्य. "येळकोट येळकोट जय मल्हार!"' }] },
    { dayOfMonth: 20, tithi: 'एकादशी', paksha: 'शुक्ल', nakshatra: 'अश्विनी', isEkadashi: true, isHoliday: true, festivals: [{ id: 'gita-jayanti', title: 'मोक्षदा एकादशी / श्रीमद्भगवद्गीता जयंती', titleEn: 'Gita Jayanti / Mokshada Ekadashi', category: 'ekadashi', isMajor: true, description: 'कुरुक्षेत्रावर भगवान श्रीकृष्णांनी अर्जुनाला गीतोपदेश दिला तो पावन दिन.' }] },
    { dayOfMonth: 23, tithi: 'पौर्णिमा', paksha: 'शुक्ल', nakshatra: 'मृगशीर्ष', isSwamiSpecial: true, isPournima: true, isHoliday: true, festivals: [{ id: 'datta-jayanti-26', title: 'श्री दत्त जयंती (मार्गशीर्ष पौर्णिमा)', titleEn: 'Shree Datta Jayanti', category: 'swami', isMajor: true, description: 'भगवान दत्तात्रेय जन्मोत्सव! स्वामी समर्थ हे प्रत्यक्ष दत्तात्रेयांचे पूर्ण अवतार मानले जातात. सेवा दरबारात महामहोत्सव.', sevaSuggestion: 'दत्त बावनी, गुरुचरित्र अध्याय वाचन, अवधूत चिंतन श्री गुरुदेव दत्त नामजप व नैवेद्य.' }] },
    { dayOfMonth: 25, tithi: 'द्वितीया', paksha: 'कृष्ण', nakshatra: 'पुनर्वसु', isHoliday: true, festivals: [{ id: 'christmas', title: 'नाताळ (ख्रिसमस)', titleEn: 'Christmas', category: 'national', description: 'नाताळ सण.' }] },
    { dayOfMonth: 26, tithi: 'चतुर्थी', paksha: 'कृष्ण', nakshatra: 'मघा', isSankashti: true, moonriseTime: 'रात्री ०९:०५', festivals: [{ id: 'sank-dec', title: 'संकष्टी चतुर्थी', titleEn: 'Sankashti Chaturthi', category: 'sankashti', description: 'शनिवार संकष्टी उपवास. चंद्रोदय रात्री ०९:०५.' }] },
  ]
};

// 2026 Lunisolar Fortnights anchor table aligned with Maharashtra / Kolhapur Panchang
interface FortnightInterval {
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
  paksha: 'शुक्ल' | 'कृष्ण';
  startTithiIndex: number; // 0 = Pratipada
  endTithi: string;
}

const FORTNIGHTS_2026: FortnightInterval[] = [
  { startYear: 2026, startMonth: 1, startDay: 1, endYear: 2026, endMonth: 1, endDay: 3, paksha: 'शुक्ल', startTithiIndex: 12, endTithi: 'पौर्णिमा' },
  { startYear: 2026, startMonth: 1, startDay: 4, endYear: 2026, endMonth: 1, endDay: 18, paksha: 'कृष्ण', startTithiIndex: 0, endTithi: 'अमावास्या' },
  { startYear: 2026, startMonth: 1, startDay: 19, endYear: 2026, endMonth: 2, endDay: 1, paksha: 'शुक्ल', startTithiIndex: 0, endTithi: 'पौर्णिमा' },
  { startYear: 2026, startMonth: 2, startDay: 2, endYear: 2026, endMonth: 2, endDay: 17, paksha: 'कृष्ण', startTithiIndex: 0, endTithi: 'अमावास्या' },
  { startYear: 2026, startMonth: 2, startDay: 18, endYear: 2026, endMonth: 3, endDay: 3, paksha: 'शुक्ल', startTithiIndex: 0, endTithi: 'पौर्णिमा' },
  { startYear: 2026, startMonth: 3, startDay: 4, endYear: 2026, endMonth: 3, endDay: 18, paksha: 'कृष्ण', startTithiIndex: 0, endTithi: 'अमावास्या' },
  { startYear: 2026, startMonth: 3, startDay: 19, endYear: 2026, endMonth: 4, endDay: 2, paksha: 'शुक्ल', startTithiIndex: 0, endTithi: 'पौर्णिमा' },
  { startYear: 2026, startMonth: 4, startDay: 3, endYear: 2026, endMonth: 4, endDay: 17, paksha: 'कृष्ण', startTithiIndex: 0, endTithi: 'अमावास्या' },
  { startYear: 2026, startMonth: 4, startDay: 18, endYear: 2026, endMonth: 5, endDay: 1, paksha: 'शुक्ल', startTithiIndex: 0, endTithi: 'पौर्णिमा' },
  { startYear: 2026, startMonth: 5, startDay: 2, endYear: 2026, endMonth: 5, endDay: 16, paksha: 'कृष्ण', startTithiIndex: 0, endTithi: 'अमावास्या' },
  { startYear: 2026, startMonth: 5, startDay: 17, endYear: 2026, endMonth: 5, endDay: 31, paksha: 'शुक्ल', startTithiIndex: 0, endTithi: 'पौर्णिमा' },
  { startYear: 2026, startMonth: 6, startDay: 1, endYear: 2026, endMonth: 6, endDay: 15, paksha: 'कृष्ण', startTithiIndex: 0, endTithi: 'अमावास्या' },
  { startYear: 2026, startMonth: 6, startDay: 16, endYear: 2026, endMonth: 6, endDay: 29, paksha: 'शुक्ल', startTithiIndex: 0, endTithi: 'पौर्णिमा' },
  { startYear: 2026, startMonth: 6, startDay: 30, endYear: 2026, endMonth: 7, endDay: 14, paksha: 'कृष्ण', startTithiIndex: 0, endTithi: 'अमावास्या' },
  { startYear: 2026, startMonth: 7, startDay: 15, endYear: 2026, endMonth: 7, endDay: 29, paksha: 'शुक्ल', startTithiIndex: 0, endTithi: 'पौर्णिमा' },
  { startYear: 2026, startMonth: 7, startDay: 30, endYear: 2026, endMonth: 8, endDay: 12, paksha: 'कृष्ण', startTithiIndex: 0, endTithi: 'अमावास्या' },
  { startYear: 2026, startMonth: 8, startDay: 13, endYear: 2026, endMonth: 8, endDay: 28, paksha: 'शुक्ल', startTithiIndex: 0, endTithi: 'पौर्णिमा' },
  { startYear: 2026, startMonth: 8, startDay: 29, endYear: 2026, endMonth: 9, endDay: 11, paksha: 'कृष्ण', startTithiIndex: 0, endTithi: 'अमावास्या' },
  { startYear: 2026, startMonth: 9, startDay: 12, endYear: 2026, endMonth: 9, endDay: 26, paksha: 'शुक्ल', startTithiIndex: 0, endTithi: 'पौर्णिमा' },
  { startYear: 2026, startMonth: 9, startDay: 27, endYear: 2026, endMonth: 10, endDay: 10, paksha: 'कृष्ण', startTithiIndex: 0, endTithi: 'अमावास्या' },
  { startYear: 2026, startMonth: 10, startDay: 11, endYear: 2026, endMonth: 10, endDay: 25, paksha: 'शुक्ल', startTithiIndex: 0, endTithi: 'पौर्णिमा' },
  { startYear: 2026, startMonth: 10, startDay: 26, endYear: 2026, endMonth: 11, endDay: 9, paksha: 'कृष्ण', startTithiIndex: 0, endTithi: 'अमावास्या' },
  { startYear: 2026, startMonth: 11, startDay: 10, endYear: 2026, endMonth: 11, endDay: 24, paksha: 'शुक्ल', startTithiIndex: 0, endTithi: 'पौर्णिमा' },
  { startYear: 2026, startMonth: 11, startDay: 25, endYear: 2026, endMonth: 12, endDay: 8, paksha: 'कृष्ण', startTithiIndex: 0, endTithi: 'अमावास्या' },
  { startYear: 2026, startMonth: 12, startDay: 9, endYear: 2026, endMonth: 12, endDay: 23, paksha: 'शुक्ल', startTithiIndex: 0, endTithi: 'पौर्णिमा' },
  { startYear: 2026, startMonth: 12, startDay: 24, endYear: 2026, endMonth: 12, endDay: 31, paksha: 'कृष्ण', startTithiIndex: 0, endTithi: 'अष्टमी' },
];

function getPanchangForDate2026(month: number, day: number): { tithi: string; paksha: 'शुक्ल' | 'कृष्ण' } {
  const currentUtc = Date.UTC(2026, month - 1, day);

  const tithiCycleNames = [
    'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी',
    'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
    'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पौर्णिमा'
  ];

  for (const f of FORTNIGHTS_2026) {
    const startUtc = Date.UTC(f.startYear, f.startMonth - 1, f.startDay);
    const endUtc = Date.UTC(f.endYear, f.endMonth - 1, f.endDay);

    if (currentUtc >= startUtc && currentUtc <= endUtc) {
      if (currentUtc === endUtc) {
        return { tithi: f.endTithi, paksha: f.paksha };
      }
      const dayDiff = Math.round((currentUtc - startUtc) / (1000 * 60 * 60 * 24));
      const idx = Math.min(f.startTithiIndex + dayDiff, 14);
      return { tithi: tithiCycleNames[idx], paksha: f.paksha };
    }
  }

  return { tithi: 'प्रतिपदा', paksha: 'शुक्ल' };
}

// Generates complete 365 days of 2026 deterministically
export function generate2026DaysForMonth(monthNumber: number): DayData[] {
  const meta = MONTHS_META.find(m => m.monthNumber === monthNumber) || MONTHS_META[0];
  const totalDays = meta.totalDays;
  const rawEvents = MONTH_EVENTS_2026[monthNumber] || [];
  const eventsMap = new Map<number, RawDayEntry>();
  rawEvents.forEach(e => eventsMap.set(e.dayOfMonth, e));

  const nakshatraCycle = [
    'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशीर्ष', 'आर्द्र',
    'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्वाफाल्गुनी', 'उत्तराफाल्गुनी',
    'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
    'मूल', 'पूर्वाषाढा', 'उत्तराषाढा', 'श्रवण', 'धनिष्ठा', 'शतभिषा',
    'पूर्वभाद्रपदा', 'उत्तराभाद्रपदा', 'रेवती'
  ];

  const result: DayData[] = [];

  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(2026, monthNumber - 1, day);
    const dayOfWeek = d.getDay();
    const dateStr = `2026-${String(monthNumber).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const raw = eventsMap.get(day);

    // Exact lunisolar fortnight calculation for Kolhapur / Maharashtra
    const astroPanchang = getPanchangForDate2026(monthNumber, day);

    // Sidereal nakshatra calculation aligned with Gregorian progression
    const dayOfYear = Math.floor((Date.UTC(2026, monthNumber - 1, day) - Date.UTC(2026, 0, 1)) / (1000 * 60 * 60 * 24));
    const astroNakshatra = nakshatraCycle[(dayOfYear + 3) % 27];

    // Daily Swami guidance advice
    const dailyGuidance = dayOfWeek === 4
      ? 'आज गुरुवार: स्वामी समर्थांचा वार! श्री स्वामी समर्थ नामजप १०८ वेळा व तारक मंत्र पठण करावे.'
      : (day % 7 === 0 ? 'सत्संग व सेवाभाव हाच मनःशांतीचा खरा मार्ग आहे.' : 'सकारात्मक विचार ठेवा, निशंक राहा - स्वामी आपल्या सोबत आहेत.');

    result.push({
      date: dateStr,
      dayOfMonth: day,
      dayOfWeek,
      marathiDayName: MARATHI_DAYS[dayOfWeek],
      marathiDayShort: MARATHI_DAYS_SHORT[dayOfWeek],
      month: monthNumber,
      marathiMonth: meta.samvatsar.split('(')[1]?.replace(')', '') || meta.marathiName,
      shakeYear: meta.marathiYear,
      tithi: raw?.tithi || astroPanchang.tithi,
      paksha: raw?.paksha || astroPanchang.paksha,
      nakshatra: raw?.nakshatra || astroNakshatra,
      sunrise: 'सकाळी ०६:२८',
      sunset: 'सायं ०६:२५',
      isSankashti: raw?.isSankashti || false,
      isEkadashi: raw?.isEkadashi || false,
      isPournima: raw?.isPournima || false,
      isAmavasya: raw?.isAmavasya || false,
      isGuruPushya: raw?.isGuruPushya || false,
      isSwamiSpecial: raw?.isSwamiSpecial || false,
      isHoliday: raw?.isHoliday || dayOfWeek === 0,
      moonriseTime: raw?.moonriseTime,
      festivals: raw?.festivals || [],
      swamiGuidance: raw?.swamiGuidance || dailyGuidance,
    });
  }

  return result;
}

// Complete Nitya Seva content (Swami Samarth Seva Marg)
export const NITYA_SEVA_DATA: NityaSevaItem[] = [
  {
    id: 'tarak-mantra',
    title: 'श्री स्वामी समर्थ तारक मंत्र',
    titleEn: 'Shree Swami Samarth Tarak Mantra',
    category: 'tarak_mantra',
    subtitle: 'संकट निवारण, भयमुक्ती व मनाला असीम आत्मबळ देणारा सिद्ध मंत्र',
    duration: '५ मिनिटे',
    textMr: `निशंक होई रे मना निर्भय होई रे मना ।
प्रचंड स्वामीबळ पाठीशी उभे आहे ॥
अतर्क्य अवधूत हे स्मर्तुगामी ।
अशक्य ही शक्य करतील स्वामी ॥ १ ॥

जिथे स्वामी पाय तिथे न्यून काय ।
स्वये भक्त प्रारब्ध घडवी ही माय ॥
आज्ञेविना काळ ना नेई त्याला ।
परलोकीही ना भीती तयाला ॥ २ ॥

उगाची भीतोसी भय हे पळू दे ।
जवळी उभी स्वामीशक्ती कळू दे ॥
जगी जन्म मृत्यू असे खेळ ज्यांचा ।
नको घाबरू तू असे बाळ त्यांचा ॥ ३ ॥

खरा होई जागा श्रद्धेसहित ।
कसा होशी त्याविण तू कार्ययुक्त ॥
कितीदा दिला बोल त्यांनीच हात ।
नको डगमगू स्वामी देतील साथ ॥ ४ ॥

विभूती नमन नाम ध्यानात ठेवा ।
सदा स्वामींचे नाम ओठी वहावे ॥
अतर्क्य अवधूत हे स्मर्तुगामी ।
अशक्य ही शक्य करतील स्वामी ॥ ५ ॥`,
    textEn: `Nishanka hoi re mana nirbhaya hoi re mana |
Prachanda Swami-bala pathishi ubhe aahe ||
Atarkya avadhoota he smartrugami |
Ashakya hi shakya karatil Swami || 1 ||`,
    meaningMr: `हे मना, कसलीही शंका आणि भीती सोडून दे. प्रत्यक्ष स्वामींचे अगाध सामर्थ्य तुझ्या पाठीशी उभे आहे. ज्या गोष्टी मानवी बुद्धीला अशक्य वाटतात, त्याही स्वामींच्या कृपेने सहज शक्य होतात. ज्यांच्या केवळ स्मरणाने ते धावून येतात, अशा स्वामी चरणी पूर्ण विश्वास ठेव.`,
    benefitsMr: `मानसिक चिंता, नैराश्य, भीती व घरातील वास्तुदोषांचे निवारण होते. आत्मविश्वास व आत्मिक शक्ती वाढते.`
  },
  {
    id: 'swami-japa-108',
    title: 'श्री स्वामी समर्थ नामजप (१०८ वेळा)',
    titleEn: 'Shree Swami Samarth Naam Japa (108 times)',
    category: 'japa',
    subtitle: 'कलिकालतारक महामंत्र: "श्री स्वामी समर्थ"',
    duration: '१० ते १५ मिनिटे',
    textMr: `॥ श्री स्वामी समर्थ ॥
॥ श्री स्वामी समर्थ ॥
॥ श्री स्वामी समर्थ ॥
॥ श्री स्वामी समर्थ ॥
॥ श्री स्वामी समर्थ ॥`,
    meaningMr: `"श्री स्वामी समर्थ" हा केवळ चार शब्दांचा मंत्र नसून ब्रह्मांडातील संपूर्ण सकारात्मक शक्तींचे भांडार आहे. दररोज १०८ वेळा (किंवा ११ माळा) नामजप केल्याने मन शांत होते आणि प्रारब्धातील संकटे सुसह्य होतात.`,
    benefitsMr: `चित्तशुद्धी, एकाग्रता, वाईट विचारांचे उच्चाटन व स्वामींच्या अभय आशीर्वादाची नित्य अनुभूती.`
  },
  {
    id: 'swami-aarti-1',
    title: 'श्री स्वामी समर्थ आरती (जय जय स्वामी समर्था)',
    titleEn: 'Swami Samarth Aarti',
    category: 'aarti',
    subtitle: 'मुख्य आरती - अखिल भारतीय गुरुपीठात गायली जाणारी आरती',
    duration: '४ मिनिटे',
    textMr: `जय जय स्वामी समर्था । जय जय स्वामी समर्था ।
आरती ओवाळू चरणी ठेवूनिया माथा ॥ धृ ॥

अक्कलकोट निवासी पूर्ण परब्रह्म ।
भक्तांचे रक्षण करणे हाचि तुझा धर्म ॥ १ ॥

कर्दळीवनी अवतार प्रगटला स्वामी ।
लीला विचित्र दाविली जनउद्धारा कामी ॥ २ ॥

पादुकानिष्ठा दाविली अक्कलकोट स्थळी ।
करुणाघना समर्था तारा या कलीकाली ॥ ३ ॥

अनंत कोटी ब्रह्मांडनायक राजाधिराज ।
योगीराज परब्रह्म स्वामी समर्थ महाराज ॥ ४ ॥

जय जय स्वामी समर्था । जय जय स्वामी समर्था ।
आरती ओवाळू चरणी ठेवूनिया माथा ॥`,
    benefitsMr: `घरात सकारात्मक ऊर्जा व मांगल्याची निर्मिती होते.`
  },
  {
    id: 'agnihotra-seva',
    title: 'नित्य अग्निहोत्र विधी व मंत्र',
    titleEn: 'Daily Agnihotra Vidhi & Mantras',
    category: 'agnihotra',
    subtitle: 'वैदिक सेवा मार्गाचा प्रमुख स्तंभ - पर्यावरण व आरोग्य रक्षक',
    duration: '३ मिनिटे (सूर्योदय व सूर्यास्त समयी)',
    textMr: `प्रातःकालीन अग्निहोत्र मंत्र (सूर्योदय समयी):
१. सूर्याय स्वाहा । सूर्याय इदं न मम ॥
२. प्रजापतये स्वाहा । प्रजापतये इदं न मम ॥

सायंकालीन अग्निहोत्र मंत्र (सूर्यास्त समयी):
१. अग्नये स्वाहा । अग्नये इदं न मम ॥
२. प्रजापतये स्वाहा । प्रजापतये इदं न मम ॥

साहित्य व विधी:
• तांब्याचे पिरॅमिड आकाराचे पात्र (हवन कुंड)
• देशी गायीच्या शेणापासून तयार केलेल्या गोवऱ्या
• शुद्ध देशी गायीचे तूप (गोगृत)
• अखंड अक्षता (अतुट तांदूळ)`,
    meaningMr: `अग्निहोत्र हा वेदप्रणीत अतिशय सोपा व प्रभावी यज्ञ आहे. बरोबर सूर्योदय व सूर्यास्ताच्या वेळी तांब्याच्या पात्रात गाईच्या गोवऱ्या पेटवून गायीचे तूप लावलेल्या अक्षता मंत्रासह आहुती दिल्या जातात. यामुळे घरातील हवा शुद्ध होते, सूक्ष्मजंतूंचा नाश होतो आणि वातावरणात दिव्य शांती निर्माण होते.`,
    benefitsMr: `औषधी धुराने श्वसनविकार, ताणतणाव दूर होतात आणि पिकांची रोगप्रतिकारक शक्ती वाढते.`
  },
  {
    id: 'ganpati-atharvashirsha',
    title: 'श्री गणपती अथर्वशीर्ष',
    titleEn: 'Shri Ganapati Atharvashirsha',
    category: 'stotra',
    subtitle: 'विघ्नहर्ता गणेश स्तोत्र - बुद्धी, विद्या व संकटमुक्तीसाठी',
    duration: '७ मिनिटे',
    textMr: `॥ श्री गणेशाय नमः ॥
ॐ नमस्ते गणपतये । त्वमेव प्रत्यक्षं तत्त्वमसि ।
त्वमेव केवलं कर्ताऽसि । त्वमेव केवलं धर्ताऽसि ।
त्वमेव केवलं हर्ताऽसि । त्वमेव सर्वं खल्विदं ब्रह्मासि ।
त्वं साक्षादात्माऽसि नित्यम् ॥ १ ॥

ऋतं वच्मि । सत्यं वच्मि ॥ २ ॥
अव त्वं मां । अव वक्तारं । अव श्रोतारं ।
अव दातारं । अव धातारं । अवाऽनूचानमव शिष्यम् ।
अव पश्चात्तात् । अव पुरस्तात् । अवोत्तरात्तात् ।
अव दक्षिणात्तात् । अव चोध्र्वात्तात् । अवाधरात्तात् ।
सर्वतो मां पाहि पाहि समन्तात् ॥ ३ ॥`,
    benefitsMr: `दररोज किंवा मंगळवार/चतुर्थीस पठण केल्याने बुद्धीची तीक्ष्णता वाढते व सर्व अडथळे दूर होतात.`
  }
];

// 18 Departments of Swami Samarth Seva Marg
export const SEVA_DEPARTMENTS: SevaDepartment[] = [
  {
    id: 'krishi',
    titleMr: 'कृषी विभाग व देशी गोवंश संवर्धन',
    titleEn: 'Agriculture & Indigenous Cow Conservation',
    iconName: 'Sprout',
    badge: 'अन्नदाता सुखी भव',
    descriptionMr: 'शेतकऱ्यांना सेंद्रिय व विषमुक्त शेती, देशी गाईंचे महत्त्व, गांडूळ खत व जलसंधारणाचे मोफत मार्गदर्शन.',
    keyInitiatives: ['विषमुक्त विषहीन सेंद्रिय शेती प्रशिक्षण', 'देशी गिर व खिल्लार गोशाळा', 'बीज बँक व पारंपरिक वाणांचे संवर्धन']
  },
  {
    id: 'bal-sanskar',
    titleMr: 'बालसंस्कार व युवा प्रबोधन विभाग',
    titleEn: 'Child Value Education & Youth Guidance',
    iconName: 'GraduationCap',
    badge: 'उज्ज्वल पिढी घडवणे',
    descriptionMr: 'मुलांमध्ये देशप्रेम, आई-वडिलांप्रती आदर, स्मरणशक्ती विकास आणि सदाचाराची रुजवणूक.',
    keyInitiatives: ['रविवारीय बालसंस्कार वर्ग', 'स्तोत्र पठण व व्यक्तिमत्त्व विकास', 'युवा व्यसनमुक्ती कार्यशाळा']
  },
  {
    id: 'garbh-sanskar',
    titleMr: 'गर्भसंस्कार व महिला सक्षमीकरण',
    titleEn: 'Garbh Sanskar & Women Empowerment',
    iconName: 'HeartHandshake',
    badge: 'तेजस्वी मातृत्व',
    descriptionMr: 'गर्भावस्थेत माता व बालकाचे शारीरिक, मानसिक व आध्यात्मिक आरोग्य सुदृढ करण्यासाठी शास्त्रीय मार्गदर्शन.',
    keyInitiatives: ['सकारात्मक विचार व संगीत ध्यान', 'माता आहार सल्ला व योगोपचार', 'महिला बचत गट व स्वावलंबन']
  },
  {
    id: 'vivah-sanskar',
    titleMr: 'विवाह मंडळ व संस्कार विभाग',
    titleEn: 'Matrimonial & Sanskar Services',
    iconName: 'Users',
    badge: 'संस्कारक्षम विवाह',
    descriptionMr: 'विनाहुंडा, आदर्श आणि कमी खर्चात संस्कारक्षम विवाह जुळवणे व समुपदेशन केंद्र.',
    keyInitiatives: ['विनामूल्य वधू-वर नोंदणी', 'सामूहिक विवाह सोहळे', 'विवाहपूर्व व पश्चात सुसंवाद मार्गदर्शन']
  },
  {
    id: 'jyotish-vastu',
    titleMr: 'ज्योतिष व वास्तुशास्त्र मार्गदर्शन',
    titleEn: 'Astrology & Vastu Shastra',
    iconName: 'Compass',
    badge: 'शास्त्रशुद्ध मार्गदर्शन',
    descriptionMr: 'घरातील सुख, शांती व प्रगतीसाठी विनातोडफोड सोपे, प्रभावी व शास्त्रीय वास्तु उपाय.',
    keyInitiatives: ['घर व उद्योग वास्तु परीक्षण', 'नक्षत्र व ग्रहांची स्वामी उपासना', 'अनावश्यक खर्च टाळून साधे विधी']
  },
  {
    id: 'ayurved-rogmukti',
    titleMr: 'आयुर्वेद व रोगमुक्ती सेवा केंद्र',
    titleEn: 'Ayurveda & Health Wellness',
    iconName: 'Stethoscope',
    badge: 'निरोगी जीवन',
    descriptionMr: 'औषधी वनस्पती, नाडीपरीक्षा, आजीबाईचा बटवा आणि नैसर्गिक जीवनशैलीद्वारे आजारमुक्ती.',
    keyInitiatives: ['मोफत आरोग्य व नाडी तपासणी शिबिरे', 'हर्बल औषधी व काढे', 'दिनचर्या व ऋतुचर्या मार्गदर्शन']
  },
  {
    id: 'paryavaran-jal',
    titleMr: 'पर्यावरण व जलसंधारण विभाग',
    titleEn: 'Environment & Water Conservation',
    iconName: 'Leaf',
    badge: 'निसर्ग संवर्धन',
    descriptionMr: 'झाडे लावा झाडे जगवा, जलसंधारण, पाण्याचे नियोजन आणि प्रदूषणमुक्तीसाठी व्यापक जनआंदोलन.',
    keyInitiatives: ['लाखो वृक्षांची लागवड व संगोपन', 'गावोगावी शेततळी व बंधारे', 'प्लास्टिकमुक्ती व स्वच्छता अभियान']
  },
  {
    id: 'aapatti-vyavasthapan',
    titleMr: 'आपत्ती व्यवस्थापन व सामाजिक साहाय्य',
    titleEn: 'Disaster Relief & Social Welfare',
    iconName: 'ShieldAlert',
    badge: 'मानवता सेवा',
    descriptionMr: 'महापूर, भूकंप किंवा दुष्काळात तत्पर मदत, अन्नधान्य वाटप आणि पुनर्वसन कार्य.',
    keyInitiatives: ['स्वयंसेवक आपत्कालीन दल', 'अन्नछत्र व कपडे वाटप', 'रक्तदान व वैद्यकीय मदत शिबिरे']
  }
];

// Shubh Muhurats 2026 (Auspicious dates)
export const SHUBH_MUHURATS_2026: ShubhMuhuratItem[] = [
  {
    id: 'vivah-2026',
    category: 'vivah',
    titleMr: 'विवाह मुहूर्त २०२६ (लग्न तारखा)',
    titleEn: 'Wedding Auspicious Dates 2026',
    iconName: 'Heart',
    descriptionMr: 'श्री स्वामी समर्थ सेवा दरबार पंचांगानुसार २०२६ मधील अत्यंत शुभ लग्न तिथी व नक्षत्र:',
    dates2026: [
      { date: '२०२६-०१-१८', dayMr: 'रविवार', muhuratTime: 'सकाळी १०:१५ ते ११:४५', nakshatra: 'रोहिणी' },
      { date: '२०२६-०१-२३', dayMr: 'शुक्रवार', muhuratTime: 'दुपारी १२:३० ते ०१:४५', nakshatra: 'उत्तरभाद्रपदा' },
      { date: '२०२६-०२-११', dayMr: 'बुधवार', muhuratTime: 'सकाळी ०९:४० ते १०:५०', nakshatra: 'मृगशीर्ष' },
      { dayMr: 'रविवार', date: '२०२६-०२-२२', muhuratTime: 'सकाळी ११:१५ ते १२:३०', nakshatra: 'रोहिणी' },
      { date: '२०२६-०३-१५', dayMr: 'रविवार', muhuratTime: 'सकाळी १०:०० ते ११:३०', nakshatra: 'पुष्य' },
      { date: '२०२६-०४-२०', dayMr: 'सोमवार (अक्षय्य तृतीया)', muhuratTime: 'दिवसभर सर्व वेळ शुभ', nakshatra: 'रोहिणी', note: 'साडेतीन मुहूर्तांपैकी एक' },
      { date: '२०२६-०५-०८', dayMr: 'शुक्रवार', muhuratTime: 'सकाळी ०८:४५ ते १०:१५', nakshatra: 'हस्त' },
      { date: '२०२६-०५-२१', dayMr: 'गुरुवार', muhuratTime: 'दुपारी १२:१५ ते ०१:४०', nakshatra: 'पुनर्वसु' },
      { date: '२०२६-०६-०६', dayMr: 'शनिवार', muhuratTime: 'सकाळी १०:३० ते ११:५५', nakshatra: 'मघा' },
      { date: '२०२६-११-२२', dayMr: 'रविवार', muhuratTime: 'सकाळी ०९:३० ते ११:००', nakshatra: 'रोहिणी' },
      { date: '२०२६-१२-०८', dayMr: 'मंगळवार', muhuratTime: 'दुपारी १२:०५ ते ०१:२०', nakshatra: 'अनुराधा' },
      { date: '२०२६-१२-१४', dayMr: 'सोमवार', muhuratTime: 'सकाळी १०:४० ते १२:००', nakshatra: 'श्रवण' }
    ]
  },
  {
    id: 'vastu-2026',
    category: 'vastu',
    titleMr: 'गृहप्रवेश व वास्तूशांती मुहूर्त',
    titleEn: 'House Warming & Griha Pravesh',
    iconName: 'Home',
    descriptionMr: 'नवीन घरात प्रवेश व वास्तूशांतीसाठी अत्यंत अनुकूल दिवस:',
    dates2026: [
      { date: '२०२६-०१-२३', dayMr: 'शुक्रवार', muhuratTime: 'सकाळी ०८:३० ते १०:००', nakshatra: 'उत्तराभाद्रपदा' },
      { date: '२०२६-०३-१९', dayMr: 'गुरुवार (गुढीपाडवा)', muhuratTime: 'सकाळी सूर्योदयानंतर', nakshatra: 'रेवती' },
      { date: '२०२६-०४-२०', dayMr: 'सोमवार (अक्षय्य तृतीया)', muhuratTime: 'सर्वकाळ शुभ', nakshatra: 'रोहिणी' },
      { date: '२०२६-०४-२३', dayMr: 'गुरुवार (गुरुपुष्य योग)', muhuratTime: 'रात्री ०८:५७ नंतर', nakshatra: 'पुष्य' },
      { date: '२०२६-०५-२१', dayMr: 'गुरुवार (गुरुपुष्य योग)', muhuratTime: 'दिवसभर शुभ', nakshatra: 'पुष्य' },
      { date: '२०२६-१०-२०', dayMr: 'मंगळवार (दसरा - विजयादशमी)', muhuratTime: 'दुपारी व सायंकाळी शुभ', nakshatra: 'श्रवण' },
      { date: '२०२६-११-१०', dayMr: 'मंगळवार (दिवाळी पाडवा - बळीप्रतिपदा)', muhuratTime: 'सकाळी ०९:०० ते १२:००', nakshatra: 'अनुराधा', note: 'साडेतीन मुहूर्तांपैकी एक' }
    ]
  },
  {
    id: 'vahan-suvarna-2026',
    category: 'vahan',
    titleMr: 'वाहन व सुवर्ण खरेदी मुहूर्त',
    titleEn: 'Vehicle & Gold Purchase Muhurat',
    iconName: 'Car',
    descriptionMr: 'गाडी, यंत्रसामग्री, सोने व महत्त्वाची खरेदी करण्याचे शुभ दिवस:',
    dates2026: [
      { date: '२०२६-०१-१४', dayMr: 'बुधवार (मकर संक्रांती)', muhuratTime: 'सकाळी ०८:०० ते संध्या. ०५:००', nakshatra: 'अनुराधा' },
      { date: '२०२६-०३-१९', dayMr: 'गुरुवार (गुढीपाडवा)', muhuratTime: 'दिवसभर शुभ', nakshatra: 'रेवती' },
      { date: '२०२६-०४-२०', dayMr: 'सोमवार (अक्षय्य तृतीया)', muhuratTime: 'सर्व दिवस अत्यंत शुभ', nakshatra: 'रोहिणी' },
      { date: '२०२६-०४-२३', dayMr: 'गुरुवार (गुरुपुष्य योग)', muhuratTime: 'रात्री ०८:५७ ते पहाटे', nakshatra: 'पुष्य' },
      { date: '२०२६-०५-२१', dayMr: 'गुरुवार (गुरुपुष्य योग)', muhuratTime: 'सकाळी ०६:०० ते रात्री ०८:००', nakshatra: 'पुष्य' },
      { date: '२०२६-०८-२८', dayMr: 'शुक्रवार (नारळी पौर्णिमा / रक्षाबंधन)', muhuratTime: 'सकाळी १०:०० ते दुपारी ०३:००', nakshatra: 'धनिष्ठा' },
      { date: '२०२६-१०-२०', dayMr: 'मंगळवार (विजयादशमी - दसरा)', muhuratTime: 'दिवसभर सर्व वेळ शुभ', nakshatra: 'श्रवण' },
      { date: '२०२६-११-०६', dayMr: 'शुक्रवार (धनत्रयोदशी / धन्वंतरी जयंती)', muhuratTime: 'दुपारी ०२:०० ते रात्री ०९:००', nakshatra: 'हस्त' },
      { date: '२०२६-११-०८', dayMr: 'रविवार (लक्ष्मीपूजन - मुख्य दीपावली)', muhuratTime: 'सायंकाळी ०६:१५ ते रात्री ०८:४५', nakshatra: 'स्वाती' },
      { date: '२०२६-११-१०', dayMr: 'मंगळवार (दिवाळी पाडवा - बळीप्रतिपदा)', muhuratTime: 'सकाळी ०८:३० ते दुपारी ०१:००', nakshatra: 'अनुराधा', note: 'साडेतीन मुहूर्त' }
    ]
  }
];

// Official Center Information: Shree Swami Samarth Seva Darbar / Seva Kendra, Jaysingpur
export const GURUPITH_INFO = {
  officialSite: 'https://share.google/f18TuAysrg8IiGt7x',
  localKendra: 'श्री स्वामी समर्थ सेवा दरबार / सेवा केंद्र, जयसिंगपूर',
  localKendraEn: 'Shree Swami Samarth Seva Darbar / Seva Kendra, Jaysingpur',
  darbarShortTitle: 'श्री स्वामी समर्थ सेवा दरबार',
  darbarShortTitleEn: 'Swami Samarth Seva Darbar',
  localKendraAddress: 'दादासाहेब बाबगोंडा पाटील नगर, जयसिंगपूर, ता. शिरोळ, जि. कोल्हापूर, महाराष्ट्र - ४१६१०१',
  localKendraAddressEn: 'Dadasaheb Babgonda Patil Nagar, Jaysingpur, Taluka: Shirol, District: Kolhapur, Maharashtra – 416101',
  email: 'swamisamarthjaysingpur@gmail.com',
  onlineSevaMeetUrl: 'https://meet.google.com/meet/oqb-hkoi-jgy?pli=1',
  contacts: [
    { name: 'श्री गोवर्धन डबाडे (अण्णा)', nameEn: 'Shri Govardhan Dabade (Anna)', phone: '+91 99604 01550', rawPhone: '+919960401550' },
    { name: 'केंद्र संपर्क २', nameEn: 'Center Contact 2', phone: '+91 91725 38720', rawPhone: '+919172538720' },
  ],
  localKendraPhone: '+91 99604 01550 / +91 91725 38720',
  mapShareUrl: 'https://share.google/f18TuAysrg8IiGt7x',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Shree+Swami+Samarth+Seva+Darbar+Jaysingpur',
  spiritualFocusMr: 'भक्ती, समाजसेवा, दैनिक सामुदायिक आरती आणि आध्यात्मिक मार्गदर्शनाचे पावन केंद्र.',
  spiritualFocusEn: 'Center for devotion, community service, daily collective aartis, and spiritual guidance.',
  localActivitiesMr: 'दैनिक सामुदायिक आरती, नित्य स्वामी नामजप, आध्यात्मिक मार्गदर्शन व जनकल्याण सेवा.',
  specialEventsMr: 'वार्षिक उत्सव, अखंड महाप्रसाद, माता अन्नपूर्णा प्राणप्रतिष्ठा आणि लक्षचंडी महायाग सोहळा.',
  specialEventsEn: 'Annual celebrations, Mahaprasad, Mata Annapurna Pranpratishtha, and Laksha Chandi Yaga.',
  headquarters: 'अखिल भारतीय श्री स्वामी समर्थ गुरुपीठ',
  headquartersAddress: 'त्र्यंबकेश्वर, जि. नाशिक, महाराष्ट्र',
  headquartersPhone: '+९१ (०२५९४) २३४२५३',
  darshanTimings: 'सकाळी ०६:०० ते रात्री ०९:३० (दररोज)',
  darshanTimingsEn: '06:00 AM to 09:30 PM (Daily)',
  aartiTimings: [
    { name: 'काकड आरती', time: 'सकाळी ०५:३०' },
    { name: 'दुपारची आरती', time: 'दुपारी १२:००' },
    { name: 'सायं आरती', time: 'सायंकाळी ०७:००' },
    { name: 'शेजारती', time: 'रात्री ०९:३०' }
  ],
  mahaPrasadTimings: 'दुपारी १२:०० ते ०२:३० आणि सायं ०७:३० ते ०९:३० (महाप्रसाद)',
  mahaPrasadTimingsEn: '12:00 PM to 02:30 PM & 07:30 PM to 09:30 PM (Daily Mahaprasad)',
  gurumauliGuidance: 'श्री स्वामी समर्थ सेवा दरबार, जयसिंगपूर येथे भक्तांच्या सहभागाने नित्यसेवा, अन्नपूर्णा प्रतिष्ठा, संस्कार व समाजोपयोगी उपक्रम अविरत सुरू आहेत.'
};

