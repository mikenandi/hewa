import * as Localization from "expo-localization";
import type { LanguageDetectorAsyncModule } from "i18next";
import { AppLocalStorage } from "@/costants/storage-keys";

export const SUPPORTED_LANGUAGES = ["en", "sw"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const detector: LanguageDetectorAsyncModule = {
  type: "languageDetector",
  async: true,
  detect: async () => {
    const cached = globalThis.localStorage?.getItem(AppLocalStorage.LANGUAGE);
    if (cached) return cached;
    const deviceLanguage = Localization.getLocales()[0]?.languageCode;
    return deviceLanguage === "en" ? "en" : "sw";
  },
  cacheUserLanguage: (language: string) => {
    globalThis.localStorage?.setItem(AppLocalStorage.LANGUAGE, language);
  },
};
