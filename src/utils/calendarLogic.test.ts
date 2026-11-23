import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getMonthDays,
  getMonthMeta,
  getMonthGrid,
  getDayByDate,
  getYearlySpecialDays,
  searchYear2026,
  formatMarathiDate,
  getTodayDateInfo,
} from './calendarLogic';
import { buildTodayNotificationMessage } from './notificationService';

test('getMonthDays returns correct number of days for all 12 months', () => {
  const expectedDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (let m = 1; m <= 12; m++) {
    const days = getMonthDays(m);
    assert.equal(days.length, expectedDays[m - 1], `Month ${m} should have ${expectedDays[m - 1]} days`);
  }
});

test('Swami Samarth Prakat Din is on March 20, 2026', () => {
  const prakatDay = getDayByDate('2026-03-20');
  assert.ok(prakatDay, 'Day should exist');
  assert.equal(prakatDay.isSwamiSpecial, true);
  const festival = prakatDay.festivals.find(f => f.id === 'swami-prakat-din');
  assert.ok(festival, 'Festival swami-prakat-din should be present');
  assert.equal(festival.title, 'श्री स्वामी समर्थ महाराज प्रगट दिन महामहोत्सव');
});

test('Swami Samarth Mahasamadhi Day is on April 15, 2026', () => {
  const samadhiDay = getDayByDate('2026-04-15');
  assert.ok(samadhiDay, 'Day should exist');
  assert.equal(samadhiDay.isSwamiSpecial, true);
  const festival = samadhiDay.festivals.find(f => f.id === 'swami-punyatithi');
  assert.ok(festival, 'Festival swami-punyatithi should be present');
});

test('getMonthGrid aligns start day of week properly', () => {
  // January 2026 starts on Thursday (index 4)
  const janGrid = getMonthGrid(1);
  assert.equal(janGrid[0], null);
  assert.equal(janGrid[1], null);
  assert.equal(janGrid[2], null);
  assert.equal(janGrid[3], null);
  assert.ok(janGrid[4] !== null);
  assert.equal(janGrid[4]?.dayOfMonth, 1);
  assert.equal(janGrid.length % 7, 0, 'Grid length must be multiple of 7');
});

test('getYearlySpecialDays returns all Sankashti and Ekadashi dates', () => {
  const sankashtiDays = getYearlySpecialDays('sankashti');
  assert.ok(sankashtiDays.length >= 12, 'Must have at least 12 Sankashti Chaturthis in 2026');
  
  const ekadashiDays = getYearlySpecialDays('ekadashi');
  assert.ok(ekadashiDays.length >= 18, 'Must have Ekadashi dates across the year');

  const swamiDays = getYearlySpecialDays('swami');
  assert.ok(swamiDays.length >= 3, 'Must include Prakat Din, Punyatithi, Datta Jayanti, Guru Pournima');
});

test('searchYear2026 correctly finds events', () => {
  const searchResults = searchYear2026('गुढीपाडवा');
  assert.ok(searchResults.length > 0, 'Should find Gudi Padwa');
  assert.equal(searchResults[0].date, '2026-03-19');

  const diwaliResults = searchYear2026('लक्ष्मीपूजन');
  assert.ok(diwaliResults.length > 0, 'Should find Lakshmi Pujan');
});

test('formatMarathiDate formats numbers into Devanagari', () => {
  const formatted = formatMarathiDate('2026-03-20');
  assert.equal(formatted, '२० मार्च २०२६');
});

test('translations dictionary contains all required keys for both mr and en', async () => {
  const { TRANSLATIONS } = await import('./translations');
  const mrKeys = Object.keys(TRANSLATIONS.mr);
  const enKeys = Object.keys(TRANSLATIONS.en);
  assert.equal(mrKeys.length, enKeys.length, 'English must have same number of keys as Marathi');
  assert.ok(TRANSLATIONS.en.appTitle.includes('Swami Samarth'));
  assert.ok(TRANSLATIONS.mr.appTitle.includes('स्वामी समर्थ'));
  assert.ok(TRANSLATIONS.mr.appSubtitle.includes('जयसिंगपूर'));
});

test('getTodayDateInfo correctly identifies date and returns valid 2026 DayData', () => {
  // Test with specific known date in 2026: October 29, 2026
  const testDate = new Date(2026, 9, 29); // month index 9 is October
  const todayInfo = getTodayDateInfo(testDate);
  assert.equal(todayInfo.dateStr, '2026-10-29');
  assert.equal(todayInfo.monthNumber, 10);
  assert.equal(todayInfo.dayOfMonth, 29);
  assert.ok(todayInfo.dayData);
  assert.equal(todayInfo.dayData.month, 10);
  assert.equal(todayInfo.dayData.dayOfMonth, 29);
  assert.ok(todayInfo.dayData.isSankashti, 'October 29, 2026 should be Sankashti Chaturthi');
});

test('buildTodayNotificationMessage correctly builds Sankashti notification with moonrise', () => {
  const oct29Day = getDayByDate('2026-10-29');
  assert.ok(oct29Day);
  const mrNotif = buildTodayNotificationMessage(oct29Day, 'mr');
  assert.ok(mrNotif.title.includes('संकष्टी चतुर्थी'), 'Should announce Sankashti Chaturthi in title');
  assert.ok(mrNotif.body.includes('०८:५०') || mrNotif.body.includes('चंद्रोदय'), 'Should include moonrise time');

  const enNotif = buildTodayNotificationMessage(oct29Day, 'en');
  assert.ok(enNotif.title.includes('Sankashti Chaturthi'), 'Should announce Sankashti Chaturthi in English');
  assert.equal(oct29Day.isEstimated, false, '2026 curated day should not be marked estimated');
  assert.ok(!enNotif.title.includes('Estimated'), '2026 curated notification should not carry Estimated suffix');
});

test('Non-2026 years are explicitly flagged as estimated and 2027 samvatsar spelling is clean', async () => {
  const { YEAR_METADATA } = await import('./calendarMultiYear');
  assert.equal(YEAR_METADATA[2027].samvatsarMr, 'पराभव - प्लवंग नाम संवत्सर');

  const meta2026 = getMonthMeta(3, 2026);
  assert.equal(meta2026.isEstimated, false, '2026 month metadata should be curated');

  const meta2027 = getMonthMeta(3, 2027);
  assert.equal(meta2027.isEstimated, true, '2027 month metadata should be flagged as estimated');

  const jan2027 = getDayByDate('2027-01-15');
  assert.ok(jan2027, '2027 date should exist');
  assert.equal(jan2027.isEstimated, true, '2027 day should be flagged as estimated');

  const mrEstNotif = buildTodayNotificationMessage(jan2027, 'mr');
  assert.ok(mrEstNotif.title.includes('अंदाजित'), 'Marathi notification for estimated year must label estimate');
  const enEstNotif = buildTodayNotificationMessage(jan2027, 'en');
  assert.ok(enEstNotif.title.includes('Estimated'), 'English notification for estimated year must label estimate');
});

