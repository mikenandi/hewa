import { OPEN_METEO_MARINE_URL, baseClient } from "./base";

// Matches Open-Meteo marine API `current` fields. Values are null inland.
export interface MarineResponse {
  current: {
    time: string;
    wave_height: number | null;
    wave_period: number | null;
    wave_direction: number | null;
    swell_wave_height: number | null;
    sea_surface_temperature: number | null;
  };
  daily: {
    time: string[];
    wave_height_max: (number | null)[];
  };
}

export const marineReq = async (
  latitude: number,
  longitude: number,
): Promise<MarineResponse> => {
  try {
    const response = await baseClient.get(OPEN_METEO_MARINE_URL, {
      params: {
        latitude,
        longitude,
        timezone: "auto",
        forecast_days: 3,
        current:
          "wave_height,wave_period,wave_direction,swell_wave_height,sea_surface_temperature",
        daily: "wave_height_max",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
