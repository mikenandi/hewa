import type { ForecastResponse } from "@/api/forecast";
import { currentHourIndex, todayIndex } from "./date-time";
import type { FloodRisk } from "./flood";
import type { SafetyWindow } from "./water-safety";
import { isThunderstorm } from "./weather-codes";

export type AlertKey =
  | "heavyRain"
  | "strongWind"
  | "extremeHeat"
  | "extremeUv"
  | "thunderstorms"
  | "riverFlood"
  | "waterDanger";

export interface WeatherAlert {
  key: AlertKey;
  date: string; // local YYYY-MM-DD the alert applies to — used to de-duplicate notifications
  value: number;
}

// Threshold-based alerts for the next 24 hours. Official warnings for Tanzania
// are not available from a free API, so these thresholds stand in for them.
export const ALERT_THRESHOLDS = {
  heavyRainMm: 30,
  strongGustKmh: 60,
  extremeHeatC: 38,
  extremeUv: 11,
  stormProbability: 60,
};

export const detectAlerts = (
  forecast: ForecastResponse,
  extras: { flood?: FloodRisk | null; water?: SafetyWindow[] | null } = {},
): WeatherAlert[] => {
  const { current, hourly, daily } = forecast;
  const alerts: WeatherAlert[] = [];
  const todayIdx = todayIndex(daily.time, current.time);
  const today = daily.time[todayIdx];

  const start = currentHourIndex(hourly.time, current.time);
  const next24 = hourly.time.slice(start, start + 24).map((time, i) => ({
    time,
    code: hourly.weather_code[start + i],
    probability: hourly.precipitation_probability[start + i] ?? 0,
    precipitation: hourly.precipitation[start + i] ?? 0,
    gust: hourly.wind_gusts_10m[start + i] ?? 0,
  }));

  const rain24 = next24.reduce((sum, h) => sum + h.precipitation, 0);
  if (rain24 >= ALERT_THRESHOLDS.heavyRainMm)
    alerts.push({ key: "heavyRain", date: today, value: Math.round(rain24) });

  const maxGust = Math.max(0, ...next24.map((h) => h.gust));
  if (maxGust >= ALERT_THRESHOLDS.strongGustKmh)
    alerts.push({ key: "strongWind", date: today, value: Math.round(maxGust) });

  const maxTemp = Math.max(
    daily.temperature_2m_max[todayIdx] ?? 0,
    daily.temperature_2m_max[todayIdx + 1] ?? 0,
  );
  if (maxTemp >= ALERT_THRESHOLDS.extremeHeatC)
    alerts.push({
      key: "extremeHeat",
      date: today,
      value: Math.round(maxTemp),
    });

  const maxUv = daily.uv_index_max[todayIdx] ?? 0;
  if (maxUv >= ALERT_THRESHOLDS.extremeUv)
    alerts.push({ key: "extremeUv", date: today, value: Math.round(maxUv) });

  const storm = next24.find(
    (h) =>
      isThunderstorm(h.code) &&
      h.probability >= ALERT_THRESHOLDS.stormProbability,
  );
  if (storm)
    alerts.push({
      key: "thunderstorms",
      date: today,
      value: storm.probability,
    });

  if (extras.flood?.level === "high")
    alerts.push({ key: "riverFlood", date: today, value: extras.flood.peak });

  const tonight = extras.water?.find((w) => w.window === "tonight");
  if (tonight?.level === "danger")
    alerts.push({ key: "waterDanger", date: today, value: tonight.peakGust });

  return alerts;
};
