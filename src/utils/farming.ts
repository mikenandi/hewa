import type { ForecastResponse } from "@/api/forecast";
import { currentHourIndex, todayIndex } from "./date-time";

export interface FarmingAdvice {
  spray: { ok: boolean; reason: "calm" | "windy" | "rain" };
  planting: { ok: boolean; reason: "moist" | "rainComing" | "dry" };
  soilMoisturePercent: number | null;
  rainNext7Days: number;
  evapotranspiration: number;
}

// Simple agronomy rules of thumb:
// - spraying needs light wind (< 15 km/h) and no rain expected for ~6 hours
// - planting is favoured by moist topsoil (>= 0.25 m³/m³) or >= 10 mm of rain in 3 days
export const buildFarmingAdvice = (
  forecast: ForecastResponse,
): FarmingAdvice => {
  const { current, hourly, daily } = forecast;
  const start = currentHourIndex(hourly.time, current.time);
  const today = todayIndex(daily.time, current.time);

  const next6 = hourly.precipitation_probability
    .slice(start, start + 6)
    .map((p) => p ?? 0);
  const rainSoon = Math.max(0, ...next6) >= 30 || current.precipitation > 0;
  const windy = current.wind_speed_10m >= 15 || current.wind_gusts_10m >= 25;

  const soil =
    hourly.soil_moisture_3_to_9cm[start] ??
    hourly.soil_moisture_0_to_1cm[start];
  const rainNext3 = daily.precipitation_sum
    .slice(today, today + 3)
    .reduce((a, b) => a + (b ?? 0), 0);
  const rainNext7 = daily.precipitation_sum
    .slice(today, today + 7)
    .reduce((a, b) => a + (b ?? 0), 0);

  return {
    spray: rainSoon
      ? { ok: false, reason: "rain" }
      : windy
        ? { ok: false, reason: "windy" }
        : { ok: true, reason: "calm" },
    planting:
      soil != null && soil >= 0.25
        ? { ok: true, reason: "moist" }
        : rainNext3 >= 10
          ? { ok: true, reason: "rainComing" }
          : { ok: false, reason: "dry" },
    soilMoisturePercent: soil == null ? null : Math.round(soil * 100),
    rainNext7Days: Math.round(rainNext7),
    evapotranspiration:
      Math.round((daily.et0_fao_evapotranspiration[today] ?? 0) * 10) / 10,
  };
};
