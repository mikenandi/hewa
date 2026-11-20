import { OPEN_METEO_FLOOD_URL, baseClient } from "./base";

// Matches Open-Meteo flood API (GloFAS river discharge, ~5 km river cells).
export interface FloodResponse {
  daily: {
    time: string[];
    river_discharge: (number | null)[];
  };
}

// About three years of history plus ten days of forecast in a single request.
export const floodReq = async (
  latitude: number,
  longitude: number,
  today: string,
): Promise<FloodResponse> => {
  try {
    const end = new Date(`${today}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() + 9);
    const response = await baseClient.get(OPEN_METEO_FLOOD_URL, {
      params: {
        latitude,
        longitude,
        daily: "river_discharge",
        start_date: `${Number(today.slice(0, 4)) - 3}${today.slice(4)}`,
        end_date: end.toISOString().slice(0, 10),
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
