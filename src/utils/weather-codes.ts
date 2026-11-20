// WMO weather interpretation codes (used by Open-Meteo) mapped to:
// - a condition key, translated under `common:conditions.<key>`
// - an OpenWeatherMap icon code, so the app keeps the same weather icon artwork
//   it has always used (served key-less from openweathermap.org/img).
type Condition = { key: string; icon: string };

const CODES: Record<number, Condition> = {
  0: { key: "clear", icon: "01" },
  1: { key: "mainlyClear", icon: "02" },
  2: { key: "partlyCloudy", icon: "03" },
  3: { key: "overcast", icon: "04" },
  45: { key: "fog", icon: "50" },
  48: { key: "fog", icon: "50" },
  51: { key: "drizzle", icon: "09" },
  53: { key: "drizzle", icon: "09" },
  55: { key: "drizzle", icon: "09" },
  56: { key: "freezingDrizzle", icon: "09" },
  57: { key: "freezingDrizzle", icon: "09" },
  61: { key: "lightRain", icon: "10" },
  63: { key: "rain", icon: "10" },
  65: { key: "heavyRain", icon: "10" },
  66: { key: "freezingRain", icon: "13" },
  67: { key: "freezingRain", icon: "13" },
  71: { key: "snow", icon: "13" },
  73: { key: "snow", icon: "13" },
  75: { key: "snow", icon: "13" },
  77: { key: "snow", icon: "13" },
  80: { key: "showers", icon: "09" },
  81: { key: "showers", icon: "09" },
  82: { key: "heavyShowers", icon: "09" },
  85: { key: "snow", icon: "13" },
  86: { key: "snow", icon: "13" },
  95: { key: "thunderstorm", icon: "11" },
  96: { key: "thunderstorm", icon: "11" },
  99: { key: "thunderstorm", icon: "11" },
};

export const getCondition = (code: number): Condition =>
  CODES[code] ?? { key: "unknown", icon: "03" };

export const isThunderstorm = (code: number): boolean => code >= 95;

export const isRainy = (code: number): boolean =>
  (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;

export const weatherIconUrl = (code: number, isDay: boolean | number): string =>
  `https://openweathermap.org/img/wn/${getCondition(code).icon}${isDay ? "d" : "n"}@2x.png`;
