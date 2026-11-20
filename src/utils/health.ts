import type { ForecastResponse } from "@/api/forecast";
import { currentHourIndex, hourOf, timeOf, todayIndex } from "./date-time";

export type MosquitoLevel = "low" | "medium" | "high";

// Mosquito *activity* (not a malaria forecast): mosquitoes breed and bite most
// when it is warm (22–30°C), humid, and there has been rain in the last two weeks.
export const mosquitoLevel = (
  forecast: ForecastResponse,
  rainLast14Days: number | null,
): MosquitoLevel => {
  const { daily, current } = forecast;
  const today = todayIndex(daily.time, current.time);
  const meanTemp =
    ((daily.temperature_2m_max[today] ?? 0) +
      (daily.temperature_2m_min[today] ?? 0)) /
    2;

  let score = 0;
  if (meanTemp >= 22 && meanTemp <= 30) score += 2;
  else if (meanTemp >= 18 && meanTemp <= 34) score += 1;

  if (current.relative_humidity_2m >= 70) score += 2;
  else if (current.relative_humidity_2m >= 55) score += 1;

  if (rainLast14Days != null) {
    if (rainLast14Days >= 40) score += 2;
    else if (rainLast14Days >= 10) score += 1;
  } else if ((daily.precipitation_sum[today] ?? 0) > 0) score += 1;

  return score >= 5 ? "high" : score >= 3 ? "medium" : "low";
};

export interface HeatAdvice {
  level: "none" | "caution" | "danger";
  start?: string;
  end?: string;
  peak?: number;
}

// Heat stress for people working outside, from the "feels like" temperature
// for the rest of today's daylight: caution from 32°C, danger from 40°C.
export const heatAdvice = (forecast: ForecastResponse): HeatAdvice => {
  const { hourly, current } = forecast;
  const start = currentHourIndex(hourly.time, current.time);
  const date = current.time.slice(0, 10);

  const hours = hourly.time
    .map((time, i) => ({ time, i }))
    .filter(
      ({ time, i }) =>
        i >= start &&
        time.startsWith(date) &&
        hourOf(time) >= 8 &&
        hourOf(time) <= 18,
    );

  const hot = hours.filter(
    ({ i }) => (hourly.apparent_temperature[i] ?? 0) >= 32,
  );
  if (hot.length === 0) return { level: "none" };

  const peak = Math.max(...hot.map(({ i }) => hourly.apparent_temperature[i]));
  const last = hot[hot.length - 1];
  return {
    level: peak >= 40 ? "danger" : "caution",
    start: timeOf(hot[0].time),
    end: `${String(hourOf(last.time) + 1).padStart(2, "0")}:00`,
    peak: Math.round(peak),
  };
};
