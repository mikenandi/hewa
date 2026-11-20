import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import "@/i18n";
import { DEFAULT_PLACE } from "@/costants/default-location";
import { AppLocalStorage } from "@/costants/storage-keys";
import type { LocationsState } from "@/redux/reducers/locations-slice";
import {
  type SettingsState,
  defaultSettings,
} from "@/redux/reducers/settings-slice";
import { syncPrimaryWeather } from "@/services/sync";
import { fetchWeather, readCachedWeather } from "@/services/weather";
import { readJson } from "@/utils/storage";

export const WEATHER_TASK = "hewa-weather-refresh";

// Periodic refresh (OS decides exact timing, at most every ~2 hours):
// keeps the widget current, re-schedules the morning briefing and checks alerts.
TaskManager.defineTask(WEATHER_TASK, async () => {
  try {
    const settings: SettingsState = {
      ...defaultSettings,
      ...readJson<Partial<SettingsState>>(AppLocalStorage.SETTINGS, {}),
    };
    const locations = readJson<Partial<LocationsState>>(
      AppLocalStorage.LOCATIONS,
      {},
    );
    const place = locations.current ?? DEFAULT_PLACE;

    // Low-data mode: refresh at most every 6 hours in the background.
    const cached = readCachedWeather(place);
    if (
      settings.lowData &&
      cached &&
      Date.now() - cached.fetchedAt < 6 * 60 * 60 * 1000
    ) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }
    const bundle = await fetchWeather(place, {
      marine: settings.marineMode,
      lowData: settings.lowData,
    });
    await syncPrimaryWeather(place, bundle, settings);
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export const registerWeatherTask = async () => {
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status !== BackgroundTask.BackgroundTaskStatus.Available) return;
    if (await TaskManager.isTaskRegisteredAsync(WEATHER_TASK)) return;
    await BackgroundTask.registerTaskAsync(WEATHER_TASK, {
      minimumInterval: 120,
    });
  } catch {
    // Not supported in this environment (e.g. Expo Go on iOS, web).
  }
};
