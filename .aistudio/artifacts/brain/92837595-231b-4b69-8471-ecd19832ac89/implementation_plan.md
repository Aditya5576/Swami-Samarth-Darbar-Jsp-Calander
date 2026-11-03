# Implementation Plan: Jaysingpur Seva Darbar Integration & Accurate Calendar Panchang

Update the entire application to reflect the official community records of **Shree Swami Samarth Seva Darbar / Seva Kendra, Jaysingpur**, remove all remnants of "dindoripranit", revert the devotional dark mode back to the warm, high-legibility light theme, and resolve calendar date/tithi mismatches using accurate astronomical lunisolar calculations.

---

## 1. Revert Theme Changes & Clean CSS
- **Action**: 
  - In `src/App.tsx`, remove `isDevotionalMode`, `handleToggleDevotionalMode`, and the conditional `.devotional-mode` CSS class.
  - In `src/components/Header.tsx`, remove the Moon/Sun theme toggle button and the `isDevotionalMode` / `onToggleDevotionalMode` props.
  - Ensure `src/index.css` remains clean with standard warm background colors and styles without dark theme overrides.
  - Remove unused devotional mode translation keys in `src/utils/translations.ts`.

---

## 2. Update Center Branding, Location & Active Community Details
- **Branding & Identity**:
  - Update top header title to: **श्री स्वामी समर्थ सेवा दरबार / सेवा केंद्र, जयसिंगपूर** (*Shree Swami Samarth Seva Darbar / Seva Kendra, Jaysingpur*).
  - Update address across all components:
    - **मराठी**: दादासाहेब बाबगोंडा पाटील नगर, जयसिंगपूर, ता. शिरोळ, जि. कोल्हापूर, महाराष्ट्र - ४१६१०१
    - **English**: Dadasaheb Babgonda Patil Nagar, Jaysingpur, Taluka: Shirol, District: Kolhapur, Maharashtra – 416101
  - Contacts & Telephones:
    - **श्री गोवर्धन डबाडे (अण्णा)**: `+91 99604 01550` (with click-to-call `tel:+919960401550`)
    - **केंद्र संपर्क २**: `+91 91725 38720` (with click-to-call `tel:+919172538720`)
  - Official Email:
    - `swamisamarthjaysingpur@gmail.com` (with click-to-email `mailto:swamisamarthjaysingpur@gmail.com`)
  - Verified Map & Location:
    - Google Maps share URL: `https://share.google/f18TuAysrg8IiGt7x`
  - Daily Online Seva & Pournima Palki:
    - Add a dedicated action card and button in Tab 4 linking directly to `https://meet.google.com/meet/oqb-hkoi-jgy?pli=1`.
  - Key Activities & Seva:
    - Daily Seva: Collective Aarti, regular chanting, and spiritual guidance.
    - Special Events & Utsavs: Annual celebrations, Mahaprasad, and grand Vedic ceremonies (Mata Annapurna Pranpratishtha and Laksha Chandi Yaga).
    - Social & Community Service: Various philanthropic and Seva-oriented initiatives aligned with Swami Samarth teachings.

---

## 3. Complete Removal of "Dindoripranit" Mentions
- Purge any remaining instances of "दिंडोरी प्रणीत" / "dindoripranit":
  - `src/data/calendar2026Data.ts` (lines 461 & 586).
  - `metadata.json` (already updated, will ensure pristine cleanliness).
  - Any stotra subtitles or muhurat descriptions mentioning dindori.

---

## 4. Fix Calendar Date & Tithi Mismatches
- **Root Cause of Mismatch**:
  - In `src/data/calendar2026Data.ts`, `generate2026DaysForMonth` used a naive formula `day <= 15 ? 'शुक्ल' : 'कृष्ण'` for days not explicitly listed in the curated festivals array. Because lunar months (Pakshas) shift and do not start on day 1 of Gregorian months, intermediate days between festivals showed mismatched Pakshas and incorrect tithis.
- **Solution**:
  - Integrate astronomical lunisolar synodic cycle calculations (based on reference new moon epochs and true lunar phase fractions) as the baseline for **every day** of the month.
  - Overlay curated festival events, specific moonrise times for Sankashti, Ekadashi names, and Swami special days seamlessly onto the astronomically verified tithi and paksha.
  - Ensure correct mapping between Gregorian dates and Marathi Panchang tithis throughout all months of 2026.

---

## 5. Verification & Testing
- Run `lint_applet` to check for syntax and type correctness.
- Run `compile_applet` to verify build passes with 0 errors.
- Confirm layout responsiveness on both mobile and desktop viewports.
