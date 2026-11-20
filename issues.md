# Known issues and things to check

Open items after the move to Expo SDK 58, expo-router and pnpm, and the new Tanzania-focused features. Tick items off or move them to GitHub issues as they are handled.

## Needs a development build (not Expo Go)

- [ ] **Home-screen widget** (`expo-widgets`) only works in a dev or EAS build. In Expo Go it is skipped quietly (`src/widgets/index.ts` checks for the native module). Check both the Android and iOS layouts on real devices.
- [ ] **Background refresh** (`expo-background-task`) does not run in Expo Go. The OS decides when it runs, so the "about every 2 hours" refresh may come later, especially on iOS and on Android phones with aggressive battery savers (Tecno, Infinix, Xiaomi).
- [ ] **Notifications**: confirm the briefing, severe-weather, commute and insight reminders actually arrive in a release build. Also check Android 13+ permission prompts and the channels (`briefing`, `alerts`, `commute`, `insights`).

## Device testing

- [ ] Test the Insights bottom sheet: drag to close, tap the backdrop, Android back button, and that Listen stops when the sheet closes.
- [ ] Check that the tab bar's rounded corners blend into the gradient on Android and iOS, including phones with gesture navigation.
- [ ] Check that the action pills (Listen, Share, Insights) wrap neatly on small screens, especially in Swahili where labels are longer.
- [ ] Test sharing the image to WhatsApp (`react-native-view-shot` + `expo-sharing`).
- [ ] Check low-data mode on a slow connection: the vector icon fallback, the 30-minute cache, and the "Data used today" counter.
- [ ] Check offline start-up: cached weather should show with the "offline" badge.

## Data limitations

- [ ] **Swahili voice**: many Android phones have no Swahili text-to-speech voice. The app shows a "no voice" alert. Consider showing how to install one, or falling back to English.
- [ ] **Lakes (Victoria, Tanganyika, Nyasa)**: Open-Meteo Marine covers oceans only, so lake safety relies on wind and storm forecasts. Check the advice is sensible for Mwanza, Kigoma and Kyela.
- [ ] **Flood risk** uses the Open-Meteo GloFAS river discharge (95th-percentile threshold). It is coarse and won't capture flash floods in towns such as Dar es Salaam. Check with local reports during the rainy season.
- [ ] **Rainy-season tracker** uses region-based heuristics (`src/utils/season.ts`, `src/utils/regions.ts`). It should be checked against TMA seasonal outlooks.
- [ ] **Mosquito and health advice** is a simple model built from temperature, humidity and recent rain. It is not medical advice, and the wording should make that clear.
- [ ] Weather icons are still loaded from OpenWeatherMap's image server. Consider bundling them so the app needs no third-party image requests.

## Code housekeeping

- [ ] The folder `src/costants` is misspelled. Rename it to `src/constants` and update imports.
- [ ] Some files use deep relative imports (`../../`) instead of the `@/` alias. Make them consistent.
- [ ] There are no automated tests yet. Start with unit tests for the pure helpers in `src/utils/` (swahili-time, drying, flood, season, commute, insights).
- [ ] Replace `src/widgets/weather-widget.tsx` (a stub) once `expo-widgets` is stable.
- [ ] Update the effective date in `privacy-policy.md` whenever the app starts using data in a new way.
