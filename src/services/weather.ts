import { type AirQualityResponse, airQualityReq } from "@/api/air-quality";
import { type LastYearResponse, lastYearReq } from "@/api/climate";
import { type FloodResponse, floodReq } from "@/api/flood";
import { type ForecastResponse, forecastReq } from "@/api/forecast";
import type { Place } from "@/api/geocoding";
import { type MarineResponse, marineReq } from "@/api/marine";
import { type DailyRain, rainHistoryReq, recentRainReq } from "@/api/rainfall";
import { AppLocalStorage } from "@/costants/storage-keys";
import { todayIndex } from "@/utils/date-time";
import { isInEastAfrica, nearbyLake } from "@/utils/regions";
import { readJson, writeJson } from "@/utils/storage";

export interface WeatherBundle {
  forecast: ForecastResponse;
  airQuality: AirQualityResponse | null;
  marine: MarineResponse | null;
  lastYear: LastYearResponse | null;
  recentRain: DailyRain | null;
  rainHistory: DailyRain | null;
  flood: FloodResponse | null;
  fetchedAt: number;
}

export interface FetchOptions {
  marine: boolean;
  lowData: boolean;
}

const cacheKey = (place: Pick<Place, "latitude" | "longitude">) =>
  `${AppLocalStorage.WEATHER_CACHE_PREFIX}${place.latitude.toFixed(2)},${place.longitude.toFixed(2)}`;

export const readCachedWeather = (place: Place): WeatherBundle | null => {
  const cached = readJson<Partial<WeatherBundle> | null>(cacheKey(place), null);
  if (!cached?.forecast?.hourly?.uv_index) return null; // cache from an older app version
  return {
    airQuality: null,
    marine: null,
    lastYear: null,
    recentRain: null,
    rainHistory: null,
    flood: null,
    fetchedAt: 0,
    ...cached,
  } as WeatherBundle;
};

const settled = <T>(result: PromiseSettledResult<T>): T | null =>
  result.status === "fulfilled" ? result.value : null;

const skip = Promise.resolve(null);

// The forecast is required; everything else is best-effort so one flaky API
// never blanks the screen. Low-data mode keeps only the small, essential calls.
export const fetchWeather = async (
  place: Place,
  options: FetchOptions,
): Promise<WeatherBundle> => {
  const { latitude, longitude } = place;
  const forecast = await forecastReq(latitude, longitude);
  const today =
    forecast.daily.time[todayIndex(forecast.daily.time, forecast.current.time)];
  const eastAfrica = isInEastAfrica(latitude, longitude);
  const full = !options.lowData;
  const wantsMarine = options.marine && !nearbyLake(latitude, longitude);

  const [airQuality, marine, lastYear, recentRain, rainHistory, flood] =
    await Promise.allSettled([
      full ? airQualityReq(latitude, longitude) : skip,
      wantsMarine ? marineReq(latitude, longitude) : skip,
      full ? lastYearReq(latitude, longitude, today) : skip,
      recentRainReq(latitude, longitude),
      full && eastAfrica ? rainHistoryReq(latitude, longitude, today) : skip,
      full ? floodReq(latitude, longitude, today) : skip,
    ]);

  const bundle: WeatherBundle = {
    forecast,
    airQuality: settled(airQuality),
    marine: settled(marine),
    lastYear: settled(lastYear),
    recentRain: settled(recentRain),
    rainHistory: settled(rainHistory),
    flood: settled(flood),
    fetchedAt: Date.now(),
  };
  writeJson(cacheKey(place), bundle);
  return bundle;
};

/** Merged date → rain (mm) map: archive first, then recent/forecast on top. */
export const rainByDate = (bundle: WeatherBundle): Map<string, number> => {
  const map = new Map<string, number>();
  for (const source of [bundle.rainHistory, bundle.recentRain]) {
    source?.time.forEach((date, i) => {
      const value = source.precipitation_sum[i];
      if (value != null) map.set(date, value);
    });
  }
  return map;
};
