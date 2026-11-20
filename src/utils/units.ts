export type TemperatureUnit = "c" | "f";
export type WindUnit = "kmh" | "ms" | "mph";

export const convertTemp = (celsius: number, unit: TemperatureUnit): number =>
  unit === "f" ? celsius * 1.8 + 32 : celsius;

export const formatTemp = (
  celsius: number | null | undefined,
  unit: TemperatureUnit,
): string =>
  celsius == null || Number.isNaN(celsius)
    ? "--"
    : Math.round(convertTemp(celsius, unit)).toString();

export const tempSymbol = (unit: TemperatureUnit): string =>
  unit === "f" ? "°F" : "°C";

export const convertWind = (kmh: number, unit: WindUnit): number => {
  if (unit === "ms") return kmh / 3.6;
  if (unit === "mph") return kmh / 1.609344;
  return kmh;
};

export const formatWind = (
  kmh: number | null | undefined,
  unit: WindUnit,
): string =>
  kmh == null ? "--" : Math.round(convertWind(kmh, unit)).toString();

export const windSymbol = (unit: WindUnit): string =>
  unit === "ms" ? "m/s" : unit === "mph" ? "mph" : "km/h";

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

export const compassPoint = (degrees: number): string =>
  COMPASS[Math.round((((degrees % 360) + 360) % 360) / 45) % 8];
