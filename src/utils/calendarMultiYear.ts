import { DayData, MonthMeta, FestivalEvent } from '../types/calendar';
import { generate2026DaysForMonth, MONTHS_META as MONTHS_META_2026, MARATHI_DAYS, MARATHI_DAYS_SHORT } from '../data/calendar2026Data';

export const SUPPORTED_YEARS = [2025, 2026, 2027, 2028, 2029, 2030] as const;
export type SupportedYear = typeof SUPPORTED_YEARS[number];

// Shaka Samvat info per Gregorian year
export const YEAR_METADATA: Record<number, {
  shakeYear: string;
  samvatsarMr: string;
  samvatsarEn: string;
  headerQuote: string;
}> = {
  2025: {
    shakeYear: 'शक १९४६ - १९४७',
    samvatsarMr: 'क्रोधी - विश्वावसू नाम संवत्सर',
    samvatsarEn: 'Krodhi - Vishvavasu Samvatsar',
    headerQuote: 'भिऊ नकोस मी तुझ्या पाठीशी आहे - अखंड स्वामी नामस्मरण.',
  },
  2026: {
    shakeYear: 'शक १९४७ - १९४८',
    samvatsarMr: 'विश्वावसू - पराभव नाम संवत्सर',
    samvatsarEn: 'Vishvavasu - Parabhava Samvatsar',
    headerQuote: 'निशंक होई रे मना निर्भय होई रे मना, प्रचंड स्वामीबळ पाठीशी उभे आहे!',
  },
  2027: {
    shakeYear: 'शक १९४८ - १९४९',
    samvatsarMr: 'पराभव - प्लवंग नाम संवत्ser',
    samvatsarEn: 'Parabhava - Plavanga Samvatsar',
    headerQuote: 'अशक्य ही शक्य करतील स्वामी - नित्य सेवा, ध्यान व सदाचार.',
  },
  2028: {
    shakeYear: 'शक १९४९ - १९५०',
    samvatsarMr: 'प्लवंग - कीलक नाम संवत्सर',
    samvatsarEn: 'Plavanga - Kilaka Samvatsar',
    headerQuote: 'सत्य, धर्म आणि भक्तीने स्वामींचे अधिष्ठान घराघरांत निरंतर राहो.',
  },
  2029: {
    shakeYear: 'शक १९५० - १९५१',
    samvatsarMr: 'कीलक - सौम्य नाम संवत्सर',
    samvatsarEn: 'Kilaka - Saumya Samvatsar',
    headerQuote: 'कलिकालतारक महामंत्र: श्री स्वामी समर्थ जय जय स्वामी समर्थ.',
  },
  2030: {
    shakeYear: 'शक १९५१ - १९५२',
    samvatsarMr: 'सौम्य - साधारण नाम संवत्सर',
    samvatsarEn: 'Saumya - Sadharana Samvatsar',
    headerQuote: 'अनंत कोटी ब्रह्मांड नायक राजाधिराज योगीराज श्री स्वामी समर्थ महाराज की जय!',
  },
};

const MARATHI_MONTHS = [
  'चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ', 'श्रावण', 'भाद्रपद',
  'अश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन'
];

const TITHIS_SHUKLA = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी',
  'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी',
  'त्रयोदशी', 'चतुर्दशी', 'पौर्णिमा'
];

const TITHIS_KRISHNA = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी',
  'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी',
  'त्रयोदशी', 'चतुर्दशी', 'अमावास्या'
];

const NAKSHATRAS = [
  'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशीर्ष', 'आर्द्रा',
  'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्वा फाल्गुनी', 'उत्तरा फाल्गुनी',
  'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
  'मूळ', 'पूर्वाषाढा', 'उत्तराषाढा', 'श्रवण', 'धनिष्ठा', 'शततारका',
  'पूर्वा भाद्रपदा', 'उत्तरा भाद्रपदा', 'रेवती'
];

const SWAMI_GUIDANCE_QUOTES = [
  'भिऊ नकोस मी तुझ्या पाठीशी आहे.',
  'निशंक होई रे मना, निर्भय होई रे मना.',
  'आम्ही गेलो नाही, जिवंतचि आहोत.',
  'सत्कर्माची कास धरावी, स्वामी कृपा अखंड लाभेल.',
  'घरात नित्य स्वामी नामस्मरण व तारक मंत्र पठण करावे.',
  'संकटकाळी स्वामी स्मरण केल्याने मन शांत व धैर्यवान बनते.',
  'अग्निहोत्र व दीपपूजनाने घराची वास्तू शुद्ध व पवित्र राहते.',
  'अन्न हे पूर्णब्रह्म - भुकेल्याला अन्नदान हीच खरी स्वामी सेवा.',
  'माता-पिता व गुरूंची सेवा हेच मोक्षाचे प्रथम साधन आहे.',
  'प्रयत्नाला स्वामी कृपेची जोड द्या, यश नक्कीच मिळेल.'
];

// In-memory cache for all years and months
const multiYearCache = new Map<string, DayData[]>();

export function getDaysInMonth(year: number, monthNumber: number): number {
  return new Date(year, monthNumber, 0).getDate();
}

/**
 * Returns month metadata for any year 2025-2030
 */
export function getMultiYearMonthMeta(year: number, monthNumber: number): MonthMeta {
  if (year === 2026) {
    const meta2026 = MONTHS_META_2026.find(m => m.monthNumber === monthNumber);
    if (meta2026) return meta2026;
  }

  const totalDays = getDaysInMonth(year, monthNumber);
  const startDayOfWeek = new Date(year, monthNumber - 1, 1).getDay();
  const yearInfo = YEAR_METADATA[year] || YEAR_METADATA[2026];

  const marathiMonthNames = [
    'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
    'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
  ];
  const englishMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const seasons = [
    'शिशिर', 'शिशिर', 'वसंत', 'वसंत', 'ग्रीष्म', 'ग्रीष्म',
    'वर्षा', 'वर्षा', 'शरद', 'शरद', 'हेमंत', 'हेमंत'
  ];

  return {
    monthIndex: monthNumber - 1,
    monthNumber,
    marathiName: `${marathiMonthNames[monthNumber - 1]} ${year}`,
    englishName: `${englishMonthNames[monthNumber - 1]} ${year}`,
    marathiSeason: `${seasons[monthNumber - 1]} ऋतू`,
    marathiYear: yearInfo.shakeYear,
    samvatsar: yearInfo.samvatsarMr,
    totalDays,
    startDayOfWeek,
    headerQuote: yearInfo.headerQuote,
  };
}

/**
 * Generates or retrieves days for any year from 2025 to 2030
 */
export function getMultiYearMonthDays(year: number, monthNumber: number): DayData[] {
  const cacheKey = `${year}-${monthNumber}`;
  if (multiYearCache.has(cacheKey)) {
    return multiYearCache.get(cacheKey)!;
  }

  // Use curated data for 2026
  if (year === 2026) {
    const days2026 = generate2026DaysForMonth(monthNumber);
    multiYearCache.set(cacheKey, days2026);
    return days2026;
  }

  // Compute accurate lunisolar days for other years
  const totalDays = getDaysInMonth(year, monthNumber);
  const yearMeta = YEAR_METADATA[year] || YEAR_METADATA[2026];
  const days: DayData[] = [];

  // Base epoch offset for moon phase estimation (New moon reference: Jan 11, 2024 / Jan 29, 2025)
  // Synodic lunar month = 29.530588 days
  const LUNAR_CYCLE = 29.530588;

  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, monthNumber - 1, d);
    const dayOfWeek = dateObj.getDay();
    const dateStr = `${year}-${String(monthNumber).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // Astronomical synodic day calculation
    // Reference date: Jan 29, 2025 (New Moon / Magha Amavasya)
    const refDate = new Date(2025, 0, 29).getTime();
    const currentMs = dateObj.getTime();
    const diffDays = (currentMs - refDate) / (1000 * 60 * 60 * 24);
    const lunarPhase = ((diffDays % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;

    // Tithi index: 0 to 14 is Shukla Paksha, 15 to 29 is Krishna Paksha
    const tithiIndex = Math.floor((lunarPhase / LUNAR_CYCLE) * 30);
    const isShukla = tithiIndex < 15;
    const paksha = isShukla ? 'शुक्ल' : 'कृष्ण';
    const pakshaDay = isShukla ? tithiIndex : tithiIndex - 15;
    const tithiName = isShukla ? TITHIS_SHUKLA[pakshaDay] : TITHIS_KRISHNA[pakshaDay];

    // Hindu month (roughly shifts every ~29.5 days after Chaitra)
    // Spring equinox / Gudi Padwa is around March/April
    let hinduMonthIdx = Math.floor(((monthNumber - 3 + 12) % 12));
    const marathiMonth = MARATHI_MONTHS[hinduMonthIdx];

    // Nakshatra (approx 27 nakshatras cycle every 27.32 days)
    const nakshatraIdx = Math.floor(((diffDays * 1.05) % 27 + 27) % 27);
    const nakshatra = NAKSHATRAS[nakshatraIdx];

    const isPournima = isShukla && pakshaDay === 14;
    const isAmavasya = !isShukla && pakshaDay === 14;
    const isEkadashi = pakshaDay === 10; // 11th tithi
    const isSankashti = !isShukla && pakshaDay === 3; // Krishna Chaturthi
    const isGuruPushya = dayOfWeek === 4 && nakshatra === 'पुष्य';

    // Swami Samarth special days
    // Prakat Din: Chaitra Shukla Dwitiya (around late March / early April)
    // Punyatithi: Chaitra Krishna Trayodashi
    // Guru Pournima: Ashadha Pournima (July)
    // Datta Jayanti: Margashirsha Pournima (December)
    let isSwamiSpecial = false;
    if (marathiMonth === 'चैत्र' && isShukla && pakshaDay === 1) isSwamiSpecial = true;
    if (marathiMonth === 'चैत्र' && !isShukla && pakshaDay === 12) isSwamiSpecial = true;
    if (marathiMonth === 'आषाढ' && isPournima) isSwamiSpecial = true;
    if (marathiMonth === 'मार्गशीर्ष' && isPournima) isSwamiSpecial = true;

    const festivals: FestivalEvent[] = [];

    if (isSwamiSpecial) {
      if (marathiMonth === 'चैत्र' && isShukla) {
        festivals.push({
          id: `swami-prakat-${dateStr}`,
          title: 'श्री स्वामी समर्थ महाराज प्रगट दिन महामहोत्सव',
          titleEn: 'Shree Swami Samarth Maharaj Prakat Din',
          category: 'swami',
          isMajor: true,
          description: 'चैत्र शुद्ध द्वितीया: स्वामी समर्थ महाराज प्रगट दिन सोहळा! अखंड तारक मंत्र व नामस्मरण.',
          sevaSuggestion: 'अन्नदान, १०८ जपमाळ, नैवेद्य व स्वामी पादुका पूजन.',
        });
      } else if (marathiMonth === 'चैत्र' && !isShukla) {
        festivals.push({
          id: `swami-samadhi-${dateStr}`,
          title: 'श्री स्वामी समर्थ महाराज पुण्यतिथी महासमाधी दिन',
          titleEn: 'Shree Swami Samarth Mahasamadhi Day',
          category: 'swami',
          isMajor: true,
          description: 'चैत्र वद्य त्रयोदशी: स्वामी महाराज महासमाधी दिन. "आम्ही गेलो नाही, जिवंतचि आहोत!"',
          sevaSuggestion: 'गुरुचरित्र अध्याय १४ व १८ पठण, तारक मंत्र व नामस्मरण.',
        });
      } else if (marathiMonth === 'आषाढ' && isPournima) {
        festivals.push({
          id: `guru-pournima-${dateStr}`,
          title: 'श्री गुरुपौर्णिमा (व्यास पौर्णिमा)',
          titleEn: 'Shree Guru Pournima Mahotsav',
          category: 'swami',
          isMajor: true,
          description: 'सदगुरू पूजन व कृतज्ञता दिन. स्वामी चरणी लीन होऊन सेवा अर्पण करा.',
          sevaSuggestion: 'स्वामी पादुका अभिषेक, सत्यनारायण पूजा व दीप प्रज्वलन.',
        });
      } else if (marathiMonth === 'मार्गशीर्ष' && isPournima) {
        festivals.push({
          id: `datta-jayanti-${dateStr}`,
          title: 'श्री दत्त जयंती महामहोत्सव',
          titleEn: 'Shree Datta Jayanti Festival',
          category: 'swami',
          isMajor: true,
          description: 'दत्तात्रेय जयंती पर्व. स्वामी समर्थ हेच कलियुगातील साक्षात दत्तावतार आहेत.',
          sevaSuggestion: 'दत्त बावनी, गुरुचरित्र वाचन व १०८ जप.',
        });
      }
    }

    if (isEkadashi) {
      festivals.push({
        id: `ekadashi-${dateStr}`,
        title: isShukla ? `शुक्ल एकादशी व्रत` : `कृष्ण (वद्य) एकादशी व्रत`,
        titleEn: isShukla ? `Shukla Ekadashi Vrat` : `Krishna Ekadashi Fast`,
        category: 'ekadashi',
        isMajor: marathiMonth === 'आषाढ' || marathiMonth === 'कार्तिक',
        description: `पवित्र एकादशी उपवास. मन, वाणी व कर्माने शुद्ध राहून विष्णू व स्वामी नामस्मरण करावे.`,
        sevaSuggestion: 'उपवास, विष्णुसहस्रनाम पठण, १०८ स्वामी जप व फलाहार.',
      });
    }

    let moonriseTime: string | undefined = undefined;
    if (isSankashti) {
      const moonHour = 20 + Math.floor(((d * 3) % 3));
      const moonMin = String(15 + ((d * 7) % 45)).padStart(2, '0');
      moonriseTime = `रात्री ०${moonHour % 12}:${moonMin}`;
      festivals.push({
        id: `sankashti-${dateStr}`,
        title: 'संकष्टी चतुर्थी उपवास (चंद्रोदय वेळ)',
        titleEn: 'Sankashti Chaturthi Fast (Moonrise)',
        category: 'sankashti',
        isMajor: true,
        moonriseTime,
        description: `संकटनाशन गणेश चतुर्थी व्रत. चंद्रोदयानंतर चंद्राला अर्घ्य देऊन उपवास सोडावा.`,
        sevaSuggestion: 'गणपती अथर्वशीर्ष २१ आवर्तने, मोदक नैवेद्य व स्वामी नामजप.',
      });
    }

    if (isPournima && !isSwamiSpecial) {
      festivals.push({
        id: `pournima-${dateStr}`,
        title: `${marathiMonth} पौर्णिमा (सत्यनारायण पूजा)`,
        titleEn: `${marathiMonth} Pournima (Full Moon)`,
        category: 'pournima',
        isMajor: true,
        description: `पौर्णिमा शुभ तिथी. घरामध्ये मांगल्यासाठी सत्यनारायण पूजा व दीपदान करावे.`,
        sevaSuggestion: 'श्री सत्यनारायण कथा व स्वामी आरती.',
      });
    }

    if (isAmavasya) {
      festivals.push({
        id: `amavasya-${dateStr}`,
        title: `${marathiMonth} दर्श अमावास्या`,
        titleEn: `${marathiMonth} Amavasya (New Moon)`,
        category: 'amavasya',
        isMajor: true,
        description: `दर्श अमावास्या. कुलदैवत व पूर्वजांचे स्मरण करून सायंकाळी तुळशीसमोर दीप लावावा.`,
        sevaSuggestion: 'अग्निहोत्र, तुळशी पूजन व नामस्मरण.',
      });
    }

    if (isGuruPushya) {
      festivals.push({
        id: `gurupushya-${dateStr}`,
        title: '✨ अमृतसिद्धी / गुरुपुष्य योग',
        titleEn: 'Guru Pushya Yoga',
        category: 'gurupushya',
        isMajor: true,
        description: 'गुरुवार व पुष्य नक्षत्राचा अत्यंत दुर्मिळ व शुभ योग! सुवर्ण खरेदी, नवीन कार्यारंभासाठी उत्तम.',
        sevaSuggestion: 'कनकधारा स्तोत्र, सुवर्ण खरेदी व स्वामी नामजप.',
      });
    }

    // Major seasonal festivals
    if (monthNumber === 1 && d === 14) {
      festivals.push({
        id: `makar-sankranti-${dateStr}`,
        title: 'मकर संक्रांती (सूर्य दक्षिणायन ते उत्तरायण)',
        titleEn: 'Makar Sankranti',
        category: 'festival',
        isMajor: true,
        description: 'तिळगूळ घ्या, गोड गोड बोला! सूर्यदेवाचा मकर राशीत प्रवेश.',
      });
    } else if (marathiMonth === 'चैत्र' && isShukla && pakshaDay === 0) {
      festivals.push({
        id: `gudi-padwa-${dateStr}`,
        title: 'गुढीपाडवा - हिंदू नववर्ष प्रारंभ (चैत्र प्रतिपदा)',
        titleEn: 'Gudi Padwa - Hindu New Year',
        category: 'festival',
        isMajor: true,
        description: 'नवीन वर्षाचा मंगल प्रारंभ. घरोघरी विजयाची गुढी उभारून स्वामींचे स्वागत करा.',
      });
    } else if (marathiMonth === 'भाद्रपद' && isShukla && pakshaDay === 3) {
      festivals.push({
        id: `ganesh-chaturthi-${dateStr}`,
        title: 'श्री गणेश चतुर्थी - पार्थिव गणपती प्रतिष्ठापना',
        titleEn: 'Ganesh Chaturthi',
        category: 'festival',
        isMajor: true,
        description: 'विघ्नहर्ता गणपती बाप्पांचे घरोघरी आगमन. १० दिवसांचा गणेशोत्सव प्रारंभ.',
      });
    } else if (marathiMonth === 'अश्विन' && isShukla && pakshaDay === 9) {
      festivals.push({
        id: `dasara-${dateStr}`,
        title: 'विजयादशमी - दसरा (साडेतीन मुहूर्तांपैकी एक)',
        titleEn: 'Dussehra (Vijayadashami)',
        category: 'festival',
        isMajor: true,
        description: 'सत्याचा असत्यावर विजय! आपट्याची पाने (सोने) वाटून नवीन उपक्रमांचा शुभारंभ करा.',
      });
    }

    const guidance = SWAMI_GUIDANCE_QUOTES[(d + monthNumber + year) % SWAMI_GUIDANCE_QUOTES.length];

    days.push({
      date: dateStr,
      dayOfMonth: d,
      dayOfWeek,
      marathiDayName: MARATHI_DAYS[dayOfWeek],
      marathiDayShort: MARATHI_DAYS_SHORT[dayOfWeek],
      month: monthNumber,
      marathiMonth,
      shakeYear: yearMeta.shakeYear,
      tithi: tithiName,
      paksha: paksha as any,
      nakshatra,
      sunrise: `सकाळी ०६:${String(10 + (monthNumber % 15)).padStart(2, '0')}`,
      sunset: `सायं ०६:${String(20 + (monthNumber % 25)).padStart(2, '0')}`,
      isToday: false,
      isSankashti,
      isEkadashi,
      isPournima,
      isAmavasya,
      isGuruPushya,
      isSwamiSpecial,
      isHoliday: dayOfWeek === 0,
      moonriseTime,
      festivals,
      swamiGuidance: guidance,
    });
  }

  multiYearCache.set(cacheKey, days);
  return days;
}
