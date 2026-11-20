import "expo-sqlite/localStorage/install";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { detector } from "./detector";

import commonEn from "./locales/en/commonEn.json";
import commonSw from "./locales/sw/commonSw.json";
import homeEn from "./locales/en/homeEn.json";
import homeSw from "./locales/sw/homeSw.json";
import summaryEn from "./locales/en/summaryEn.json";
import summarySw from "./locales/sw/summarySw.json";
import searchEn from "./locales/en/searchEn.json";
import searchSw from "./locales/sw/searchSw.json";
import settingsEn from "./locales/en/settingsEn.json";
import settingsSw from "./locales/sw/settingsSw.json";
import insightsEn from "./locales/en/insightsEn.json";
import insightsSw from "./locales/sw/insightsSw.json";
import notificationsEn from "./locales/en/notificationsEn.json";
import notificationsSw from "./locales/sw/notificationsSw.json";

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    defaultNS: "common",
    resources: {
      en: {
        common: commonEn,
        home: homeEn,
        summary: summaryEn,
        search: searchEn,
        settings: settingsEn,
        notifications: notificationsEn,
        insights: insightsEn,
      },
      sw: {
        common: commonSw,
        home: homeSw,
        summary: summarySw,
        search: searchSw,
        settings: settingsSw,
        notifications: notificationsSw,
        insights: insightsSw,
      },
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
