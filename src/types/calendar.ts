export type PakshaType = 'शुक्ल' | 'कृष्ण';

export type FestivalCategory = 
  | 'swami'        // Swami Samarth special (Prakat din, Punyatithi, etc.)
  | 'ekadashi'     // Ekadashi fasts
  | 'sankashti'    // Sankashti Chaturthi
  | 'pournima'     // Pournima & Satyanarayan
  | 'amavasya'     // Amavasya & Darsha
  | 'festival'     // Major Hindu festivals (Diwali, Gudi Padwa, etc.)
  | 'gurupushya'   // Guru Pushyamrut yoga
  | 'muhurat'      // Shubh Muhurat
  | 'national';    // National days

export interface FestivalEvent {
  id: string;
  title: string;
  titleEn: string;
  category: FestivalCategory;
  description: string;
  sevaSuggestion?: string;
  moonriseTime?: string;
  isMajor?: boolean;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  dayOfWeek: number; // 0 = Sun, 1 = Mon ... 6 = Sat
  marathiDayName: string;
  marathiDayShort: string;
  month: number; // 1-12
  marathiMonth: string;
  shakeYear: string;
  tithi: string;
  paksha: PakshaType;
  nakshatra: string;
  sunrise: string;
  sunset: string;
  rahuKaal?: string;
  isToday?: boolean;
  isSankashti?: boolean;
  isEkadashi?: boolean;
  isPournima?: boolean;
  isAmavasya?: boolean;
  isGuruPushya?: boolean;
  isSwamiSpecial?: boolean;
  isHoliday?: boolean;
  moonriseTime?: string;
  festivals: FestivalEvent[];
  shubhMuhuratNotes?: string[];
  swamiGuidance?: string;
}

export interface MonthMeta {
  monthIndex: number; // 0-11
  monthNumber: number; // 1-12
  marathiName: string;
  englishName: string;
  marathiSeason: string; // वसंत, ग्रीष्म, वर्षा...
  marathiYear: string; // शक १९४७ - १९४८
  samvatsar: string; // क्रोधी नाम संवत्सर
  totalDays: number;
  startDayOfWeek: number;
  headerQuote: string;
}

export interface NityaSevaItem {
  id: string;
  title: string;
  titleEn: string;
  category: 'tarak_mantra' | 'japa' | 'aarti' | 'stotra' | 'agnihotra';
  subtitle: string;
  duration: string;
  textMr: string;
  textEn?: string;
  meaningMr?: string;
  benefitsMr?: string;
}

export interface SevaDepartment {
  id: string;
  titleMr: string;
  titleEn: string;
  iconName: string;
  badge: string;
  descriptionMr: string;
  keyInitiatives: string[];
}

export interface ShubhMuhuratItem {
  id: string;
  category: 'vivah' | 'vastu' | 'vahan' | 'suvarna' | 'naamkaran';
  titleMr: string;
  titleEn: string;
  iconName: string;
  descriptionMr: string;
  dates2026: {
    date: string;
    dayMr: string;
    muhuratTime: string;
    nakshatra: string;
    note?: string;
  }[];
}
