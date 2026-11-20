import type { ForecastResponse } from "@/api/forecast";
import { currentHourIndex, hourOf, timeOf, todayIndex } from "./date-time";

export interface DryingAdvice {
  day: "today" | "tomorrow";
  status: "good" | "fair" | "poor";
  start?: string; // "HH:mm"
  end?: string;
  rainAfter?: string;
}

// Good drying hour: no rain expected, not too humid, and some sun.
const isGoodHour = (f: ForecastResponse, i: number) => {
  const h = f.hourly;
  const sunny =
    (h.sunshine_duration[i] ?? 0) >= 1800 || (h.cloud_cover[i] ?? 100) < 60;
  return (
    (h.precipitation_probability[i] ?? 0) < 30 &&
    (h.precipitation[i] ?? 0) === 0 &&
    (h.relative_humidity_2m[i] ?? 100) < 80 &&
    sunny
  );
};

// "Siku ya kuanika": the best stretch of daylight for drying clothes, maize,
// coffee, cassava or fish — today if enough daylight remains, otherwise tomorrow.
export const buildDryingAdvice = (forecast: ForecastResponse): DryingAdvice => {
  const { hourly, daily, current } = forecast;
  const today = todayIndex(daily.time, current.time);
  const now = currentHourIndex(hourly.time, current.time);

  const sunsetToday = hourOf(daily.sunset[today] ?? `T18:00`);
  const useToday =
    current.is_day === 1 && hourOf(current.time) <= sunsetToday - 2;
  const dayIdx = useToday ? today : today + 1;
  const date = daily.time[dayIdx];
  const startHour = useToday
    ? hourOf(current.time)
    : Math.max(7, hourOf(daily.sunrise[dayIdx] ?? "T07:00") + 1);
  const endHour = hourOf(daily.sunset[dayIdx] ?? "T18:00");

  const indices = hourly.time
    .map((time, i) => ({ time, i }))
    .filter(
      ({ time, i }) =>
        time.startsWith(date) &&
        hourOf(time) >= startHour &&
        hourOf(time) < endHour &&
        i >= now,
    )
    .map(({ i }) => i);

  // Longest run of consecutive good hours.
  let best: [number, number] | null = null;
  let runStart: number | null = null;
  indices.forEach((i, k) => {
    if (isGoodHour(forecast, i)) {
      if (runStart == null) runStart = k;
      const len = k - runStart + 1;
      if (!best || len > best[1] - best[0] + 1) best = [runStart, k];
    } else runStart = null;
  });

  const day = useToday ? "today" : "tomorrow";
  if (!best) return { day, status: "poor" };

  const [from, to] = best as [number, number];
  const hours = to - from + 1;
  const after = indices
    .slice(to + 1)
    .find((i) => (hourly.precipitation_probability[i] ?? 0) >= 50);

  return {
    day,
    status: hours >= 4 ? "good" : hours >= 2 ? "fair" : "poor",
    start: timeOf(hourly.time[indices[from]]),
    end: `${String(hourOf(hourly.time[indices[to]]) + 1).padStart(2, "0")}:00`,
    rainAfter: after != null ? timeOf(hourly.time[after]) : undefined,
  };
};
