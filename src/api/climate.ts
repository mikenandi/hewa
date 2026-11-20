import { OPEN_METEO_ARCHIVE_URL, baseClient } from "./base";

export interface LastYearResponse {
  daily: {
    time: string[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
  };
}

// Same calendar day one year ago, from Open-Meteo's historical archive.
export const lastYearReq = async (
  latitude: number,
  longitude: number,
  isoDate: string,
): Promise<LastYearResponse> => {
  try {
    const [year, month, day] = isoDate.split("-");
    const date = `${Number(year) - 1}-${month}-${day}`;
    const response = await baseClient.get(OPEN_METEO_ARCHIVE_URL, {
      params: {
        latitude,
        longitude,
        timezone: "auto",
        start_date: date,
        end_date: date,
        daily: "temperature_2m_max,temperature_2m_min",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
