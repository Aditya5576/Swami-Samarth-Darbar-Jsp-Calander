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
