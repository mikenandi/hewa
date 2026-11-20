import type { ForecastResponse } from "@/api/forecast";
import { currentHourIndex, hourOf, timeOf, todayIndex } from "./date-time";
import { isThunderstorm } from "./weather-codes";

export interface SummaryPart {
  key: string;
  values?: Record<string, string | number>;
}

// Rule-based, plain-language description of the next ~12 hours.
// Each part is an i18n key under `summary:` so it reads naturally in both languages.
export const buildSummary = (forecast: ForecastResponse): SummaryPart[] => {
  const { current, hourly, daily } = forecast;
  const parts: SummaryPart[] = [];

  const feels = current.apparent_temperature;
  const humid = current.relative_humidity_2m >= 75;
  if (feels >= 35) parts.push({ key: humid ? "veryHotHumid" : "veryHot" });
  else if (feels >= 30) parts.push({ key: humid ? "hotHumid" : "hot" });
  else if (feels <= 12) parts.push({ key: "cold" });
  else if (feels <= 18) parts.push({ key: "cool" });
  else parts.push({ key: "pleasant" });

  const start = currentHourIndex(hourly.time, current.time);
  const window = hourly.time.slice(start, start + 12).map((time, i) => ({
    time,
    probability: hourly.precipitation_probability[start + i] ?? 0,
    code: hourly.weather_code[start + i],
  }));

  const storm = window.find(
    (h) => isThunderstorm(h.code) && h.probability >= 40,
  );
  const likely = window.find((h) => h.probability >= 60);
  const possible = window.find((h) => h.probability >= 30);

  if (storm)
    parts.push({ key: "stormsFrom", values: { time: timeOf(storm.time) } });
  else if (likely)
    parts.push({ key: "rainFrom", values: { time: timeOf(likely.time) } });
  else if (possible) parts.push({ key: "rainPossible" });
  else parts.push({ key: "dry" });

  if (current.wind_gusts_10m >= 40) parts.push({ key: "windy" });
  const today = todayIndex(daily.time, current.time);
  if ((daily.uv_index_max[today] ?? 0) >= 8 && hourOf(current.time) < 15)
    parts.push({ key: "highUv" });

  return parts;
};
