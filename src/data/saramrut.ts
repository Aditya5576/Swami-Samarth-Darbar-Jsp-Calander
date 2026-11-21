import rawSaramrutData from './saramrutData.json';

export interface SaramrutAdhyay {
  id: number;
  titleMr: string;
  titleEn: string;
  subtitleMr: string;
  subtitleEn: string;
  invocation: string[];
  verses: string[];
  closing: string;
  verseCount: number;
}

export type ParayanMode = '3day' | '7day' | '21day';
export type ReaderTheme = 'parchment' | 'light' | 'night';
export type ReaderFontSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ParayanDayPlan {
  dayNumber: number;
  startAdhyay: number;
  endAdhyay: number;
  adhyayIds: number[];
}

export const SARAMRUT_ADHYAYS: SaramrutAdhyay[] = rawSaramrutData as SaramrutAdhyay[];

export const TOTAL_SARAMRUT_VERSES = SARAMRUT_ADHYAYS.reduce(
  (sum, item) => sum + item.verseCount,
  0
);

export function toMarathiDigits(num: number | string): string {
  return String(num).replace(/[0-9]/g, d => '०१२३४५६७८९'[parseInt(d, 10)]);
}

/**
 * Generates the traditional Parayan reading schedule:
 * - 3-Day Parayan: 7 Adhyays per day (1-7, 8-14, 15-21)
 * - 7-Day Parayan: 3 Adhyays per day (1-3, 4-6, ..., 19-21)
 * - 21-Day Parayan: 1 Adhyay per day (1..21)
 */
export function getParayanSchedule(mode: ParayanMode): ParayanDayPlan[] {
  const perDay = mode === '3day' ? 7 : mode === '7day' ? 3 : 1;
  const totalDays = 21 / perDay;
  const schedule: ParayanDayPlan[] = [];

  for (let d = 0; d < totalDays; d++) {
    const startAdhyay = d * perDay + 1;
    const endAdhyay = startAdhyay + perDay - 1;
    const adhyayIds: number[] = [];
    for (let id = startAdhyay; id <= endAdhyay; id++) {
      adhyayIds.push(id);
    }
    schedule.push({
      dayNumber: d + 1,
      startAdhyay,
      endAdhyay,
      adhyayIds,
    });
  }

  return schedule;
}

export function getParayanDayForAdhyay(adhyayId: number, mode: ParayanMode): number {
  const perDay = mode === '3day' ? 7 : mode === '7day' ? 3 : 1;
  return Math.ceil(adhyayId / perDay);
}
