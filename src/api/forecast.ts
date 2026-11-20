import { OPEN_METEO_FORECAST_URL, baseClient } from "./base";

// Field names match Open-Meteo's forecast API (https://open-meteo.com/en/docs).
// All values are requested in metric units; conversion happens in src/utils/units.ts.
export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  is_day: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
  pressure_msl: number;
  precipitation: number;
  cloud_cover: number;
  visibility: number;
  dew_point_2m: number;
  uv_index: number;
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  precipitation_probability: (number | null)[];
  precipitation: number[];
  is_day: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
  soil_moisture_0_to_1cm: (number | null)[];
  soil_moisture_3_to_9cm: (number | null)[];
  relative_humidity_2m: number[];
  apparent_temperature: number[];
  cape: (number | null)[];
  sunshine_duration: (number | null)[];
  cloud_cover: number[];
  uv_index: (number | null)[];
}

export interface DailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_sum: number[];
  precipitation_probability_max: (number | null)[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
  et0_fao_evapotranspiration: number[];
  sunshine_duration: (number | null)[];
}

export interface ForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset_seconds: number;
  current: CurrentWeather;
  hourly: HourlyWeather;
  daily: DailyWeather;
}

const CURRENT_FIELDS = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "is_day",
  "weather_code",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
  "pressure_msl",
  "precipitation",
  "cloud_cover",
  "visibility",
  "dew_point_2m",
  "uv_index",
];

const HOURLY_FIELDS = [
  "temperature_2m",
  "weather_code",
  "precipitation_probability",
  "precipitation",
  "is_day",
  "wind_speed_10m",
  "wind_gusts_10m",
  "soil_moisture_0_to_1cm",
  "soil_moisture_3_to_9cm",
  "relative_humidity_2m",
  "apparent_temperature",
  "cape",
  "sunshine_duration",
  "cloud_cover",
  "uv_index",
];

const DAILY_FIELDS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "sunrise",
  "sunset",
  "uv_index_max",
  "precipitation_sum",
  "precipitation_probability_max",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
  "et0_fao_evapotranspiration",
  "sunshine_duration",
];

export const forecastReq = async (
  latitude: number,
  longitude: number,
): Promise<ForecastResponse> => {
  try {
    const response = await baseClient.get(OPEN_METEO_FORECAST_URL, {
      params: {
        latitude,
        longitude,
        timezone: "auto",
        forecast_days: 10,
        wind_speed_unit: "kmh",
        current: CURRENT_FIELDS.join(","),
        hourly: HOURLY_FIELDS.join(","),
        daily: DAILY_FIELDS.join(","),
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
