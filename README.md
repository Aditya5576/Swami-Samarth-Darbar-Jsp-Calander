# श्री स्वामी समर्थ सेवा दरबार, जयसिंगपूर — Offline Devotional PWA

> **Offline-first Marathi & English spiritual companion for Shree Swami Samarth Seva Darbar / Seva Kendra, Jaysingpur (Kolhapur)** — built to run smoothly 100% offline and on slow 2G/3G mobile networks during daily Seva, Parayan, and Japa.

## Key Features

- **Marathi & English Panchang Calendar**: Full monthly & yearly Vedic calendar with Tithi, Paksha, Nakshatra, localized Sunrise/Sunset timings, accurate Vedic **Rahu Kaal**, Sankashti moonrise timings, Ekadashi, Pournima, Amavasya, Guru Pushya Yoga, festivals, and personal devotional notes.
- **Complete Shree Swami Charitra Saramrut (21 Adhyays)**: All 21 Adhyays bundled natively offline with adjustable text size, Parchment/Light/Night reading modes, auto-resume, bookmarks, full-text search, quick jump, and 3-day / 7-day / 21-day Parayan Sankalp tracker.
- **Daily Seva & 108 Japa Mala**: Interactive 108-bead counter with zero-latency sweet Marathi chant voice, temple bell mode, completion chime, Aarti Sangrah, Agnihotra Vidhi, and Ganpati Atharvashirsha.
- **Tarak Mantra & Swaamirajmaaulii (`@kumudinidabade`) Bhajans**: Embedded devotional players with Play/Pause controls, live channel upload auto-sync, manual refresh, and YouTube subscribe link.
- **100% Offline Seva & On-Device Offline Audio Vault**:
  - Full Workbox PWA precaching for zero-internet startup and navigation.
  - Persistent IndexedDB **Offline Audio & Video Vault** to save local MP3/M4A/WAV/MP4 copies of Tarak Mantra and Swaamirajmaaulii bhajans for distraction-free offline playback with Loop mode.
  - **Automatic 2G/3G Data-Saver Mode** with tap-to-load YouTube facades and non-blocking font loading.
  - **One-Tap Prepare Offline Seva** readiness manager with storage meter and checklist.
- **Jaysingpur Seva Darbar & Muhurat Guide**: Auspicious Muhurats, 18 Seva Marg departments, temple location, Aarti timings, contact details, and daily 6:00 AM Panchang notification reminders.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite PWA (`vite-plugin-pwa` / Workbox)
- **Backend**: Express + TypeScript (`server.ts`) with allowlisted YouTube RSS feed proxy and caching
- **Offline Storage**: Service Worker Cache Storage + IndexedDB persistent media vault + `localStorage`

## Getting Started

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Type-check
npm run lint

# Build for production
npm run build

# Start production server
npm start
```
