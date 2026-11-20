import type { Place } from "@/api/geocoding";
import i18n from "@/i18n";
import type { SettingsState } from "@/redux/reducers/settings-slice";
import { todayIndex } from "@/utils/date-time";
import { formatTemp } from "@/utils/units";
import { getCondition } from "@/utils/weather-codes";
import { updateWeatherWidget } from "@/widgets";
import {
  cancelCommuteAlerts,
  cancelInsightReminders,
  cancelMorningBriefing,
  scheduleCommuteAlerts,
  scheduleInsightReminders,
  scheduleMorningBriefing,
  sendSevereAlerts,
} from "./notifications";
import { type WeatherBundle, readCachedWeather } from "./weather";

// Everything that should follow fresh weather for the primary (home) place:
// the home-screen widget, tomorrow's morning briefing, and severe alerts.
export const syncPrimaryWeather = async (
  place: Place,
  bundle: WeatherBundle,
  settings: SettingsState,
) => {
  const { current, daily } = bundle.forecast;
  const unit = settings.temperatureUnit;
  const today = todayIndex(daily.time, current.time);

  updateWeatherWidget({
    place: place.name,
    temperature: `${formatTemp(current.temperature_2m, unit)}°`,
    condition: i18n.t(
      `common:conditions.${getCondition(current.weather_code).key}`,
    ),
    highLow: `↑ ${formatTemp(daily.temperature_2m_max[today], unit)}°  ↓ ${formatTemp(
      daily.temperature_2m_min[today],
      unit,
    )}°`,
  });

  await Promise.allSettled([
    scheduleMorningBriefing(place, bundle, settings),
    sendSevereAlerts(place, bundle, settings),
    scheduleCommuteAlerts(bundle, settings),
    scheduleInsightReminders(place, bundle, settings),
  ]);
};

// Re-apply settings (units, language, briefing time…) to the widget and
// notifications using the cached weather, without waiting for a network refresh.
export const resyncFromCache = async (
  place: Place,
  settings: SettingsState,
) => {
  const cached = readCachedWeather(place);
  if (cached) await syncPrimaryWeather(place, cached, settings);
  else {
    if (!settings.morningBriefing) await cancelMorningBriefing();
    if (!settings.commute) await cancelCommuteAlerts();
    if (!settings.insightAlerts) await cancelInsightReminders();
  }
};
