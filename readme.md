# Hewa - Weather App

Hewa is a weather app that allows users to check the current weather conditions of different locations.

## Table of Contents

- [Features](#features)
- [Folder Structure](#folder-structure)
- [Design](#design)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [APK Files](#apk-files)

## Features

- Current weather for your device location (falls back to Dar es Salaam), plus saved places you swipe between.
- Hourly (24 h) and 10-day forecast, plain-language summary, and a comparison with the same day last year.
- Details: UV index, rain, dew point, pressure, visibility, cloud cover, wind compass, air quality (US AQI), sunrise/sunset.
- Search with autocomplete; open any place and star it to save it.
- Send feedback by email from Settings.
- Morning briefing notification and severe-weather alerts (heavy rain, strong wind, heat, UV, storms).
- Farmer mode (spraying/planting advice, soil moisture, rainfall, ET₀) and sea conditions near the coast.
- Saa za Kiswahili: times shown the Swahili way (07:00 = saa 1 asubuhi), on by default for Kiswahili.
- Siku ya kuanika: best hours to dry clothes, maize, coffee, cassava or fish.
- Commute rain alerts for your morning and evening trips, with a reminder an hour before.
- Rainy season tracker (Vuli, Masika, Msimu): onset, false starts, dry spells and rain vs normal.
- Fishers' safety: tonight's storm risk on Lakes Victoria, Tanganyika and Nyasa and the coast.
- River flood risk from the GloFAS river-flow forecast.
- Health: mosquito activity level and heat advice for outdoor workers.
- Listen: the weather read aloud in Kiswahili or English. Share: a weather card image for WhatsApp.
- Low-data mode with a daily data-use counter.
- Insights (Maarifa), opened from the yellow button on the weather screen as a bottom sheet: the day's top warnings as swipeable cards, a day planner grid (rain, heat, strong sun, mosquitoes, exercise, drying), and practical tips on health, home, travel and farming — each with a "why". Optional timed reminders (lightning, rainwater, treat water, mosquitoes, cold nights, heat, roads, wind).
- °C/°F and km/h · m/s · mph, English and Kiswahili, offline cache, pull to refresh.
- Home-screen widget on Android and iOS (development/production builds only).

All weather data comes from free, key-less APIs: [Open-Meteo](https://open-meteo.com) (forecast, geocoding, air quality, marine, historical) and [BigDataCloud](https://www.bigdatacloud.com) reverse geocoding.

## Folder Structure

```
├── app/                   # Expo Router routes (tabs, city/[id])
├── src/
│   ├── api/               # One file per external API (*Req functions)
│   ├── components/        # UI components (weather/ = forecast sections)
│   ├── costants/          # Colors, fonts, storage keys, default place
│   ├── hooks/             # useWeather, useDeviceLocation, useNow
│   ├── i18n/              # i18next setup + en/sw locale files
│   ├── layouts/           # Screen (gradient), Topbar
│   ├── redux/             # Store + reducers/ (settings, locations)
│   ├── services/          # Weather loading/cache, notifications, widget sync
│   ├── tasks/             # Background refresh task
│   ├── utils/             # Units, dates, summary, farming, alerts
│   └── widgets/           # Home-screen widget (Android + iOS)
└── app.json, eas.json
```

## Design

The design of the Hewa app can be accessed [here](https://www.figma.com/file/iYTa0lglZwQbvbeMFKEMR1/Weather-App?type=design&node-id=105-4726&mode=design&t=7L56UAoH9NYgIxw3-0).

## Technologies Used

- React Native
- TypeScript
- Redux
- Expo Router (SDK 58)
- Open-Meteo
- i18next (English / Kiswahili)
- React Native Paper
- Prettier (for code formatting)

## Installation

1. Clone the repository: `git clone https://github.com/mikenandi/hewa.git`
2. Navigate to the project directory: `cd hewa`
3. Install dependencies: `pnpm install`

## Usage

Widgets, background refresh and some notification features need a development build (`eas build --profile development`), not Expo Go.

1. Start the Metro server: `pnpm start`
2. For Android, run: `pnpm android`
3. For iOS, run: `pnpm ios`

## APK Files

APK files for previewing the app can be found in the [App Releases](releases/) folder. Please download the appropriate APK file based on your device's architecture.
