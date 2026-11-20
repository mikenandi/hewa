import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import * as Localization from "expo-localization";
import { AppLocalStorage } from "@/costants/storage-keys";
import type { TemperatureUnit, WindUnit } from "@/utils/units";
import { readJson } from "@/utils/storage";
import type { TimeFormat } from "@/utils/swahili-time";

export interface SettingsState {
  temperatureUnit: TemperatureUnit;
  windUnit: WindUnit;
  morningBriefing: boolean;
  briefingHour: number;
  severeAlerts: boolean;
  farmerMode: boolean;
  marineMode: boolean;
  timeFormat: TimeFormat;
  commute: boolean;
  commuteMorningHour: number;
  commuteEveningHour: number;
  lowData: boolean;
  insightAlerts: boolean;
}

export const defaultSettings: SettingsState = {
  temperatureUnit: "c",
  windUnit: "kmh",
  morningBriefing: false,
  briefingHour: 7,
  severeAlerts: false,
  farmerMode: false,
  marineMode: false,
  timeFormat: "24h",
  commute: false,
  commuteMorningHour: 7,
  commuteEveningHour: 17,
  lowData: false,
  insightAlerts: false,
};

// Swahili speakers get Saa za Kiswahili by default; everyone can switch in Settings.
const defaultTimeFormat = (): TimeFormat => {
  const language =
    globalThis.localStorage?.getItem(AppLocalStorage.LANGUAGE) ??
    Localization.getLocales()[0]?.languageCode;
  return language === "en" ? "24h" : "swahili";
};

// Persisted by the store subscriber in src/redux/redux.ts.
const initialState: SettingsState = {
  ...defaultSettings,
  timeFormat: defaultTimeFormat(),
  ...readJson<Partial<SettingsState>>(AppLocalStorage.SETTINGS, {}),
};

const settingsSlice = createSlice({
  name: "SETTINGS_SLICE",
  initialState,
  reducers: {
    temperatureUnitReducer: (state, action: PayloadAction<TemperatureUnit>) => {
      state.temperatureUnit = action.payload;
    },
    windUnitReducer: (state, action: PayloadAction<WindUnit>) => {
      state.windUnit = action.payload;
    },
    morningBriefingReducer: (state, action: PayloadAction<boolean>) => {
      state.morningBriefing = action.payload;
    },
    briefingHourReducer: (state, action: PayloadAction<number>) => {
      state.briefingHour = action.payload;
    },
    severeAlertsReducer: (state, action: PayloadAction<boolean>) => {
      state.severeAlerts = action.payload;
    },
    farmerModeReducer: (state, action: PayloadAction<boolean>) => {
      state.farmerMode = action.payload;
    },
    marineModeReducer: (state, action: PayloadAction<boolean>) => {
      state.marineMode = action.payload;
    },
    timeFormatReducer: (state, action: PayloadAction<TimeFormat>) => {
      state.timeFormat = action.payload;
    },
    commuteReducer: (state, action: PayloadAction<boolean>) => {
      state.commute = action.payload;
    },
    commuteMorningHourReducer: (state, action: PayloadAction<number>) => {
      state.commuteMorningHour = action.payload;
    },
    commuteEveningHourReducer: (state, action: PayloadAction<number>) => {
      state.commuteEveningHour = action.payload;
    },
    lowDataReducer: (state, action: PayloadAction<boolean>) => {
      state.lowData = action.payload;
    },
    insightAlertsReducer: (state, action: PayloadAction<boolean>) => {
      state.insightAlerts = action.payload;
    },
  },
});

export const {
  temperatureUnitReducer,
  windUnitReducer,
  morningBriefingReducer,
  briefingHourReducer,
  severeAlertsReducer,
  farmerModeReducer,
  marineModeReducer,
  timeFormatReducer,
  commuteReducer,
  commuteMorningHourReducer,
  commuteEveningHourReducer,
  lowDataReducer,
  insightAlertsReducer,
} = settingsSlice.actions;

export default settingsSlice.reducer;
