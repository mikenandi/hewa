import {
  OPEN_METEO_ARCHIVE_URL,
  OPEN_METEO_FORECAST_URL,
  baseClient,
} from "./base";

export interface DailyRain {
  time: string[];
  precipitation_sum: (number | null)[];
}

// Last 92 days of observed/modelled rain plus the 16-day forecast, in one call.
// Feeds the rainy-season tracker and the mosquito activity level.
export const recentRainReq = async (
  latitude: number,
  longitude: number,
): Promise<DailyRain> => {
  try {
    const response = await baseClient.get(OPEN_METEO_FORECAST_URL, {
      params: {
        latitude,
        longitude,
        timezone: "auto",
        daily: "precipitation_sum",
        past_days: 92,
        forecast_days: 16,
      },
    });
    return response.data.daily;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Five-plus years of daily rain from the historical archive (ends ~a week ago),
// used to compare this season with past seasons and to cover season starts
// older than 92 days.
export const rainHistoryReq = async (
  latitude: number,
  longitude: number,
  today: string,
): Promise<DailyRain> => {
  try {
    const year = Number(today.slice(0, 4));
    const end = new Date(`${today}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() - 7);
    const response = await baseClient.get(OPEN_METEO_ARCHIVE_URL, {
      params: {
        latitude,
        longitude,
        timezone: "auto",
        daily: "precipitation_sum",
        start_date: `${year - 6}-10-01`,
        end_date: end.toISOString().slice(0, 10),
      },
    });
    return response.data.daily;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
