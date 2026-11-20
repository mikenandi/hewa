# Changes

## Expo SDK 58 upgrade and redesign — 20 November 2026

### Platform

- Upgraded to **Expo SDK 58**, React 19 and React Native 0.88.
- Replaced React Navigation with **expo-router**: file-based routes in `app/` and typed routes.
- Switched the package manager from yarn to **pnpm** (`pnpm-lock.yaml`; `yarn.lock` removed).
- Added `runtimeVersion` (appVersion policy) and EAS Update channels for over-the-air updates.
- Added the `@/` import alias for `src/`.

### Weather data

- Replaced the OpenWeatherMap API with free **Open-Meteo** APIs, so no API key is needed. They provide the forecast, air quality, sea conditions, past rainfall, river flow and place search.
- Place names come from the phone's own geocoder, with BigDataCloud as a fallback. Google Maps is not used.
- The latest weather for each place is saved on the phone, so the app works offline and shows an "offline" badge.

### Look and feel

- Kept the brand blue gradient, colours and fonts, and added translucent "glass" cards and a large temperature display.
- Removed the wavy bottom shape.
- Removed the Radar and Share tabs. The tab bar now has three tabs (Home, Search, Settings) and rounded top corners.
- Home lets you swipe between your current location and saved places, with page dots below the header.
- Search now suggests places as you type.
- Each city opens on its own screen with back and save (star) buttons.

### New features for Tanzania and East Africa

- **Swahili time** (saa za Kiswahili), with 24-hour time as an option.
- **Drying advice**: the best hours to dry clothes or crops.
- **Commute rain alerts** for your morning and evening trip times.
- **WhatsApp share card**: shares a weather image.
- **Rainy season tracker** (masika / vuli), with this year's rain compared with last year's.
- **Fishers' safety** for the sea and the big lakes (Victoria, Tanganyika, Nyasa).
- **Flood risk** from river flow data.
- **Health advice**: mosquito level, heat stress and UV.
- **Voice readout** of the weather in Swahili or English.
- **Low-data mode**: cached weather, no remote icons, and a counter showing data used today.
- **Farmer mode** with planting and spraying advice.

### Insights

- Added an **Insights** button (yellow, after Share) that opens a bottom sheet containing:
  - top warnings and tips
  - a day planner covering rain, heat, sun, mosquitoes, exercise and drying
  - category filters
  - insight cards with a "Why?" explanation
  - a "Did you know?" fact
  - a Listen button.

### Notifications, background and widget

- Notifications are created on the phone and include:
  - a morning briefing
  - severe-weather alerts
  - commute reminders
  - insight reminders.
- A background task refreshes the weather about every 2 hours.
- Added a home-screen widget for Android and iOS. It needs a development build and does not work in Expo Go.

### Settings

- Units, language (English / Kiswahili) and time format.
- Trip times, notifications and briefing time.
- Farmer and sea modes, and low-data mode with the data counter.
- Saved places and a feedback email link.

### Translations

- All screens are translated into English and Swahili, with one file per feature in `src/i18n/locales/`.

### Docs

- Updated `readme.md` with the new features.
- Rewrote `privacy-policy.md` in English and Swahili, listing every service the app contacts.
- Added `issues.md` with known issues and things to check on a device.

### Removed

- The old `src/screens`, `src/naviagation` and `src/services/open-weather` code, the old Redux store and slices, `App.tsx`, and `yarn.lock`.
- The OpenWeatherMap API key file (`src/costants/api-keys.ts`).
