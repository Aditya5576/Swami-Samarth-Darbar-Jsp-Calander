import { DayData, MonthMeta } from '../types/calendar';
import {
  getMultiYearMonthDays,
  getMultiYearMonthMeta,
  SUPPORTED_YEARS,
  SupportedYear,
} from './calendarMultiYear';

export { SUPPORTED_YEARS, type SupportedYear };

const MARATHI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const MARATHI_MONTH_NAMES = [
  'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
  'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
];

export function toMarathiDigits(num: number | string): string {
  return String(num).replace(/[0-9]/g, digit => MARATHI_DIGITS[parseInt(digit, 10)]);
}

export function formatMarathiDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const mName = MARATHI_MONTH_NAMES[month - 1] || '';
  return `${toMarathiDigits(day)} ${mName} ${toMarathiDigits(year)}`;
}

export function getMonthDays(monthNumber: number, year: number = 2026): DayData[] {
  if (monthNumber < 1 || monthNumber > 12) {
    throw new Error(`Invalid month number: ${monthNumber}. Must be between 1 and 12.`);
  }
  return getMultiYearMonthDays(year, monthNumber);
}

export function getMonthMeta(monthNumber: number, year: number = 2026): MonthMeta {
  return getMultiYearMonthMeta(year, monthNumber);
}

/**
 * Automatically calculates today's date info relative to the real current system date.
 * If the current system year is between 2025 and 2030, it opens that exact year, month, and day!
 * Otherwise, it safely maps to the nearest valid year.
 */
export function getTodayDateInfo(overrideDate?: Date): {
  dateStr: string;
  year: number;
  monthNumber: number;
  dayOfMonth: number;
  dayData: DayData;
} {
  const now = overrideDate || new Date();
  const sysYear = now.getFullYear();
  const year = Math.min(Math.max(sysYear, 2025), 2030);
  const rawMonth = now.getMonth() + 1; // 1-12
  const monthNumber = Math.min(Math.max(rawMonth, 1), 12);
  const meta = getMonthMeta(monthNumber, year);
  const rawDay = now.getDate();
  const dayOfMonth = Math.min(Math.max(rawDay, 1), meta.totalDays);
  const dateStr = `${year}-${String(monthNumber).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`;

  const dayData = getDayByDate(dateStr) || getMonthDays(monthNumber, year)[0];
  return {
    dateStr,
    year,
    monthNumber,
    dayOfMonth,
    dayData,
  };
}

/**
 * Builds the 6x7 or 5x7 calendar grid cells including leading empty slots
 */
export function getMonthGrid(monthNumber: number, year: number = 2026): (DayData | null)[] {
  const days = getMonthDays(monthNumber, year);
  const meta = getMonthMeta(monthNumber, year);

  const grid: (DayData | null)[] = [];

  // Fill leading days of week
  for (let i = 0; i < meta.startDayOfWeek; i++) {
    grid.push(null);
  }

  // Fill days
  for (const day of days) {
    grid.push(day);
  }

  // Pad to multiple of 7
  while (grid.length % 7 !== 0) {
    grid.push(null);
  }

  return grid;
}

/**
 * Returns a specific day by YYYY-MM-DD
 */
export function getDayByDate(dateStr: string): DayData | null {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12) return null;

  const validYear = Math.min(Math.max(year, 2025), 2030);
  const days = getMonthDays(month, validYear);
  return days.find(d => d.dayOfMonth === day) || null;
}

/**
 * Finds all events matching a category across the entire year
 */
export function getYearlySpecialDays(
  category: 'ekadashi' | 'sankashti' | 'pournima' | 'amavasya' | 'gurupushya' | 'swami' | 'holiday',
  year: number = 2026
): DayData[] {
  const results: DayData[] = [];
  for (let m = 1; m <= 12; m++) {
    const days = getMonthDays(m, year);
    for (const day of days) {
      if (category === 'ekadashi' && day.isEkadashi) results.push(day);
      else if (category === 'sankashti' && day.isSankashti) results.push(day);
      else if (category === 'pournima' && day.isPournima) results.push(day);
      else if (category === 'amavasya' && day.isAmavasya) results.push(day);
      else if (category === 'gurupushya' && day.isGuruPushya) results.push(day);
      else if (category === 'swami' && day.isSwamiSpecial) results.push(day);
      else if (category === 'holiday' && day.isHoliday) results.push(day);
    }
  }
  return results;
}

/**
 * Search events and notes across a year
 */
export function searchYear(query: string, year: number = 2026): DayData[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matches: DayData[] = [];
  for (let m = 1; m <= 12; m++) {
    const days = getMonthDays(m, year);
    for (const day of days) {
      const matchFestival = day.festivals.some(
        f =>
          f.title.toLowerCase().includes(q) ||
          f.titleEn.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
      );
      const matchTithi = day.tithi.toLowerCase().includes(q);
      const matchNakshatra = day.nakshatra.toLowerCase().includes(q);
      const matchDay = day.marathiDayName.toLowerCase().includes(q);

      if (matchFestival || matchTithi || matchNakshatra || matchDay) {
        matches.push(day);
      }
    }
  }
  return matches;
}

// Backward compatibility helper
export const searchYear2026 = (q: string) => searchYear(q, 2026);

/**
 * Astronomical Calculation of Rahu Kaal (राहुकाळ)
 * In Vedic astrology, the daylight duration (Sunrise to Sunset) is divided into 8 equal octants.
 * Each weekday has a specific octant allocated to Rahu:
 * Sunday: 8th octant (late afternoon before sunset)
 * Monday: 2nd octant (early morning)
 * Tuesday: 7th octant (late afternoon)
 * Wednesday: 5th octant (midday)
 * Thursday: 6th octant (early afternoon)
 * Friday: 4th octant (late morning)
 * Saturday: 3rd octant (mid morning)
 */
export function parseTimeToMinutes(timeStr?: string, isSunset: boolean = false): number {
  if (!timeStr) return isSunset ? 18 * 60 + 25 : 6 * 60 + 28;
  const isNightOrPm = /सायं|रात्री|pm/i.test(timeStr) || isSunset;
  const cleaned = timeStr.replace(/(सकाळी|सायं|दुपारी|रात्री|am|pm|\s)/gi, '').trim();
  const enDigits = cleaned.replace(/[०-९]/g, d => '०१२३४५६७८९'.indexOf(d).toString());
  const parts = enDigits.split(':');
  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) || 0;
  if (isNaN(h)) h = isSunset ? 18 : 6;
  if (isNightOrPm && h < 12) {
    h += 12;
  }
  return h * 60 + m;
}

export function formatMinutesToTime(min: number, lang: 'mr' | 'en' = 'mr'): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = Math.floor(min % 60);
  let period = lang === 'mr' ? 'सकाळी' : 'AM';
  let h12 = h24;
  if (h24 >= 12 && h24 < 16) {
    period = lang === 'mr' ? 'दुपारी' : 'PM';
    if (h24 > 12) h12 = h24 - 12;
  } else if (h24 >= 16 && h24 < 20) {
    period = lang === 'mr' ? 'सायं' : 'PM';
    h12 = h24 - 12;
  } else if (h24 >= 20) {
    period = lang === 'mr' ? 'रात्री' : 'PM';
    h12 = h24 - 12;
  } else if (h24 === 0) {
    h12 = 12;
  } else if (h24 > 12) {
    period = lang === 'mr' ? 'सायं' : 'PM';
    h12 = h24 - 12;
  }

  const mm = String(m).padStart(2, '0');
  const hh = String(h12).padStart(2, '0');

  if (lang === 'mr') {
    const toMr = (s: string) => s.replace(/[0-9]/g, d => '०१२३४५६७८९'[parseInt(d, 10)]);
    return `${period} ${toMr(hh)}:${toMr(mm)}`;
  }
  return `${hh}:${mm} ${period}`;
}

/**
 * Cleanly localizes and formats sunrise/sunset strings for UI display in English or Marathi.
 */
export function formatSunriseSunset(
  timeStr?: string,
  isSunset: boolean = false,
  lang: 'mr' | 'en' = 'mr'
): string {
  if (!timeStr) return '';
  const min = parseTimeToMinutes(timeStr, isSunset);
  return formatMinutesToTime(min, lang);
}

export interface RahuKaalDetail {
  start: string;
  end: string;
  formattedRange: string;
  octantNumber: number;
  periodName: string;
  guidanceMr: string;
  guidanceEn: string;
}

export function calculateRahuKaal(
  dayOfWeek: number,
  sunriseStr?: string,
  sunsetStr?: string,
  lang: 'mr' | 'en' = 'mr'
): RahuKaalDetail {
  const sunriseMin = parseTimeToMinutes(sunriseStr, false);
  const sunsetMin = parseTimeToMinutes(sunsetStr, true);
  const dayDuration = Math.max(sunsetMin - sunriseMin, 11 * 60);
  const octantDuration = dayDuration / 8;

  // Day of week: 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  const octantMap: Record<number, { oct: number; nameMr: string; nameEn: string }> = {
    0: { oct: 8, nameMr: '८ वा प्रहर (सायंकाळ)', nameEn: '8th Octant · Evening' },
    1: { oct: 2, nameMr: '२ रा प्रहर (सकाळ)', nameEn: '2nd Octant · Morning' },
    2: { oct: 7, nameMr: '७ वा प्रहर (दुपार/सायंकाळ)', nameEn: '7th Octant · Late Afternoon' },
    3: { oct: 5, nameMr: '५ वा प्रहर (मध्यान्ह)', nameEn: '5th Octant · Midday' },
    4: { oct: 6, nameMr: '६ वा प्रहर (दुपार)', nameEn: '6th Octant · Early Afternoon' },
    5: { oct: 4, nameMr: '४ था प्रहर (सकाळ)', nameEn: '4th Octant · Late Morning' },
    6: { oct: 3, nameMr: '३ रा प्रहर (सकाळ)', nameEn: '3rd Octant · Mid Morning' },
  };

  const info = octantMap[dayOfWeek] || octantMap[0];
  const startMin = sunriseMin + (info.oct - 1) * octantDuration;
  const endMin = sunriseMin + info.oct * octantDuration;

  const startFormatted = formatMinutesToTime(startMin, lang);
  const endFormatted = formatMinutesToTime(endMin, lang);
  const formattedRange = lang === 'mr'
    ? `${startFormatted} ते ${endFormatted}`
    : `${startFormatted} – ${endFormatted}`;

  return {
    start: startFormatted,
    end: endFormatted,
    formattedRange,
    octantNumber: info.oct,
    periodName: lang === 'mr' ? info.nameMr : info.nameEn,
    guidanceMr: 'राहुकाळात नवीन संकल्प, प्रवास, मोठी खरेदी व शुभ कार्ये वर्ज्य मानली जातात. या काळात केवळ श्री स्वामी समर्थ नामस्मरण करावे.',
    guidanceEn: 'Auspicious deeds, travel, and major purchases are avoided during Rahu Kaal. Devotees chant Shree Swami Samarth naam.',
  };
}

