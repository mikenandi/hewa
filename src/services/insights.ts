import type { Place } from "@/api/geocoding";
import type { SettingsState } from "@/redux/reducers/settings-slice";
import { detectAlerts } from "@/utils/alerts";
import { todayIndex } from "@/utils/date-time";
import { assessFloodRisk } from "@/utils/flood";
import { mosquitoLevel } from "@/utils/health";
import { buildInsights } from "@/utils/insights";
import { isInEastAfrica, nearbyLake } from "@/utils/regions";
import { analyzeSeason } from "@/utils/season";
import { buildWaterSafety } from "@/utils/water-safety";
import { type WeatherBundle, rainByDate } from "./weather";

// Derived, location-aware insights shared by the home screen and notifications.

const today = (bundle: WeatherBundle) =>
  bundle.forecast.daily.time[
    todayIndex(bundle.forecast.daily.time, bundle.forecast.current.time)
  ];

export const floodRiskFor = (bundle: WeatherBundle) =>
  bundle.flood ? assessFloodRisk(bundle.flood.daily, today(bundle)) : null;

/** Only when fishers' mode is on and the place is on a big lake or the coast. */
export const waterSafetyFor = (
  place: Place,
  bundle: WeatherBundle,
  marineMode: boolean,
) => {
  if (!marineMode) return null;
  const lake = nearbyLake(place.latitude, place.longitude);
  const coastal = bundle.marine?.current.wave_height != null;
  if (!lake && !coastal) return null;
  return {
    lake,
    windows: buildWaterSafety(bundle.forecast, lake ? null : bundle.marine),
  };
};

export const seasonFor = (place: Place, bundle: WeatherBundle) => {
  if (!isInEastAfrica(place.latitude, place.longitude) || !bundle.recentRain)
    return null;
  return analyzeSeason(
    place.latitude,
    place.longitude,
    today(bundle),
    rainByDate(bundle),
  );
};

/** Observed rain over the last `days` days (not counting today). */
export const rainLastDays = (
  bundle: WeatherBundle,
  days: number,
): number | null => {
  if (!bundle.recentRain) return null;
  const day = today(bundle);
  const { time, precipitation_sum } = bundle.recentRain;
  const end = time.indexOf(day);
  if (end < 0) return null;
  return precipitation_sum
    .slice(Math.max(0, end - days), end)
    .reduce<number>((a, b) => a + (b ?? 0), 0);
};

export const rainLast14Days = (bundle: WeatherBundle) =>
  rainLastDays(bundle, 14);

export const insightsFor = (
  place: Place,
  bundle: WeatherBundle,
  settings: SettingsState,
) => {
  const mosquito = mosquitoLevel(bundle.forecast, rainLast14Days(bundle));
  return {
    mosquito,
    insights: buildInsights({
      forecast: bundle.forecast,
      airQuality: bundle.airQuality,
      rainLast3Days: rainLastDays(bundle, 3),
      mosquito,
      flood: floodRiskFor(bundle),
      season: seasonFor(place, bundle),
      onWater: waterSafetyFor(place, bundle, settings.marineMode) != null,
      farmerMode: settings.farmerMode,
    }),
  };
};

export const alertsFor = (
  place: Place,
  bundle: WeatherBundle,
  settings: SettingsState,
) =>
  detectAlerts(bundle.forecast, {
    flood: floodRiskFor(bundle),
    water: waterSafetyFor(place, bundle, settings.marineMode)?.windows,
  });
