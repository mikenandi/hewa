export type AqiLevel =
  | "good"
  | "moderate"
  | "sensitive"
  | "unhealthy"
  | "veryUnhealthy"
  | "hazardous";

// US AQI bands.
export const aqiLevel = (aqi: number): AqiLevel => {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "sensitive";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "veryUnhealthy";
  return "hazardous";
};

export const AQI_COLORS: Record<AqiLevel, string> = {
  good: "#4CD964",
  moderate: "#FFD60A",
  sensitive: "#FF9F0A",
  unhealthy: "#FF453A",
  veryUnhealthy: "#BF5AF2",
  hazardous: "#8E1E2E",
};
