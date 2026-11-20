import { OPEN_METEO_AIR_QUALITY_URL, baseClient } from "./base";

// Matches Open-Meteo air-quality API `current` fields.
export interface AirQualityResponse {
  current: {
    time: string;
    us_aqi: number | null;
    pm2_5: number | null;
    pm10: number | null;
    ozone: number | null;
    dust: number | null;
  };
}

export const airQualityReq = async (
  latitude: number,
  longitude: number,
): Promise<AirQualityResponse> => {
  try {
    const response = await baseClient.get(OPEN_METEO_AIR_QUALITY_URL, {
      params: {
        latitude,
        longitude,
        timezone: "auto",
        current: "us_aqi,pm2_5,pm10,ozone,dust",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
