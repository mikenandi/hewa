import type { ForecastResponse } from "@/api/forecast";
import { hourOf, localNow, timeOf } from "./date-time";

export interface CommuteForecast {
  trip: "morning" | "evening";
  day: "today" | "tomorrow";
  time: string; // "HH:00" — the trip time
  status: "dry" | "maybe" | "rain";
  probability: number;
  advice: "none" | "leaveBefore" | "umbrella";
  rainStart?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

// Rain around one trip: looks at the hour before, during and after the trip.
const forecastTrip = (
  forecast: ForecastResponse,
  trip: "morning" | "evening",
  tripHour: number,
): CommuteForecast | null => {
  const { hourly } = forecast;
  const local = localNow(forecast.utc_offset_seconds);
  const today = local.iso.slice(0, 10);
  const isTomorrow = local.hours >= tripHour;
  const dayIdx = forecast.daily.time.indexOf(today) + (isTomorrow ? 1 : 0);
  const date = forecast.daily.time[dayIdx];
  if (!date) return null;

  const at = (h: number) => hourly.time.indexOf(`${date}T${pad(h)}:00`);
  const window = [tripHour - 1, tripHour, tripHour + 1]
    .map(at)
    .filter((i) => i >= 0);
  if (window.length === 0) return null;

  const probability = Math.max(
    ...window.map((i) => hourly.precipitation_probability[i] ?? 0),
  );
  const rainMm = window.reduce(
    (sum, i) => sum + (hourly.precipitation[i] ?? 0),
    0,
  );
  const status =
    probability >= 50 || rainMm >= 1
      ? "rain"
      : probability >= 30
        ? "maybe"
        : "dry";

  let advice: CommuteForecast["advice"] = "none";
  let rainStart: string | undefined;
  if (status !== "dry") {
    const look = [tripHour - 2, tripHour - 1, tripHour, tripHour + 1]
      .map(at)
      .filter((i) => i >= 0);
    const first = look.find(
      (i) => (hourly.precipitation_probability[i] ?? 0) >= 50,
    );
    if (
      first != null &&
      first !== look[0] &&
      hourOf(hourly.time[first]) <= tripHour
    ) {
      advice = "leaveBefore";
      rainStart = timeOf(hourly.time[first]);
    } else {
      advice = "umbrella";
    }
  }

  return {
    trip,
    day: isTomorrow ? "tomorrow" : "today",
    time: `${pad(tripHour)}:00`,
    status,
    probability,
    advice,
    rainStart,
  };
};

export const buildCommuteForecast = (
  forecast: ForecastResponse,
  morningHour: number,
  eveningHour: number,
): CommuteForecast[] =>
  [
    forecastTrip(forecast, "morning", morningHour),
    forecastTrip(forecast, "evening", eveningHour),
  ]
    .filter((trip): trip is CommuteForecast => trip != null)
    // Soonest trip first.
    .sort((a, b) =>
      a.day === b.day
        ? a.time.localeCompare(b.time)
        : a.day === "today"
          ? -1
          : 1,
    );
