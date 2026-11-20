import type { ForecastResponse } from "@/api/forecast";
import type { MarineResponse } from "@/api/marine";
import { hourOf, localNow, timeOf } from "./date-time";
import { isThunderstorm } from "./weather-codes";

export type SafetyLevel = "safe" | "caution" | "danger";
export type SafetyReason = "storms" | "gusts" | "waves";

export interface SafetyWindow {
  window: "tonight" | "tomorrowMorning";
  level: SafetyLevel;
  reasons: SafetyReason[];
  peakGust: number;
  peakTime?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

// Storm risk for fishers. Lake Victoria storms build at night over the water,
// so the main window is 18:00–06:00. Uses wind gusts, convective energy (CAPE)
// and thunderstorm weather codes; waves are added near the coast.
const assess = (
  forecast: ForecastResponse,
  indices: number[],
  waveMax: number | null,
  window: SafetyWindow["window"],
): SafetyWindow => {
  const h = forecast.hourly;
  let peakGust = 0;
  let peakIndex: number | undefined;
  let maxCape = 0;
  let stormProbability = 0;

  for (const i of indices) {
    const gust = h.wind_gusts_10m[i] ?? 0;
    if (gust > peakGust) {
      peakGust = gust;
      peakIndex = i;
    }
    maxCape = Math.max(maxCape, h.cape[i] ?? 0);
    if (isThunderstorm(h.weather_code[i])) {
      stormProbability = Math.max(
        stormProbability,
        h.precipitation_probability[i] ?? 0,
      );
    }
  }
  const maxProbability = Math.max(
    0,
    ...indices.map((i) => h.precipitation_probability[i] ?? 0),
  );

  const reasons: SafetyReason[] = [];
  let level: SafetyLevel = "safe";
  const raise = (to: SafetyLevel, reason: SafetyReason) => {
    if (!reasons.includes(reason)) reasons.push(reason);
    if (to === "danger" || level === "safe") level = to;
  };

  if (stormProbability >= 40 || (maxCape >= 1500 && maxProbability >= 50))
    raise("danger", "storms");
  else if (stormProbability > 0 || maxCape >= 800) raise("caution", "storms");

  if (peakGust >= 40) raise("danger", "gusts");
  else if (peakGust >= 25) raise("caution", "gusts");

  if (waveMax != null) {
    if (waveMax >= 2) raise("danger", "waves");
    else if (waveMax >= 1.25) raise("caution", "waves");
  }

  return {
    window,
    level,
    reasons,
    peakGust: Math.round(peakGust),
    peakTime: peakIndex != null ? timeOf(h.time[peakIndex]) : undefined,
  };
};

export const buildWaterSafety = (
  forecast: ForecastResponse,
  marine: MarineResponse | null,
): SafetyWindow[] => {
  const { hourly, daily } = forecast;
  const local = localNow(forecast.utc_offset_seconds);
  const today = local.iso.slice(0, 10);
  const todayIdx = daily.time.indexOf(today);
  const tomorrow = daily.time[todayIdx + 1];
  const nowKey = `${today}T${pad(local.hours)}:00`;

  // Tonight: 18:00 today → 06:00 tomorrow (or from now if it is already night).
  const nightStart = local.hours < 6 ? nowKey : `${today}T18:00`;
  const nightEnd = local.hours < 6 ? `${today}T06:00` : `${tomorrow}T06:00`;
  const morningDate = local.hours < 6 ? today : tomorrow;

  const between = (from: string, to: string) =>
    hourly.time
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => t >= from && t < to && t >= nowKey)
      .map(({ i }) => i);

  const waveFor = (date: string) => {
    if (!marine || marine.current.wave_height == null) return null;
    const i = marine.daily.time.indexOf(date);
    return i >= 0
      ? (marine.daily.wave_height_max[i] ?? null)
      : marine.current.wave_height;
  };

  const windows: SafetyWindow[] = [];
  const night = between(nightStart, nightEnd);
  if (night.length)
    windows.push(assess(forecast, night, waveFor(today), "tonight"));
  const morning = between(
    `${morningDate}T06:00`,
    `${morningDate}T12:00`,
  ).filter((i) => hourOf(hourly.time[i]) >= 6);
  if (morning.length)
    windows.push(
      assess(forecast, morning, waveFor(morningDate), "tomorrowMorning"),
    );
  return windows;
};
