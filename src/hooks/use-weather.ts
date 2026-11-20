import { useCallback, useEffect, useRef, useState } from "react";
import type { Place } from "@/api/geocoding";
import {
  type FetchOptions,
  type WeatherBundle,
  fetchWeather,
  readCachedWeather,
} from "@/services/weather";

// In low-data mode, cached weather younger than this is shown without refetching.
const LOW_DATA_FRESH_MS = 30 * 60 * 1000;

interface UseWeatherResult {
  data: WeatherBundle | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isOffline: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Shows cached data instantly (offline support), then refreshes from the network.
export const useWeather = (
  place: Place,
  options: FetchOptions,
  onLoaded?: (bundle: WeatherBundle) => void,
): UseWeatherResult => {
  const [data, setData] = useState<WeatherBundle | null>(() =>
    readCachedWeather(place),
  );
  const [isLoading, setIsLoading] = useState(data == null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  const load = useCallback(async () => {
    try {
      const bundle = await fetchWeather(place, options);
      setData(bundle);
      setIsOffline(false);
      setError(null);
      onLoadedRef.current?.(bundle);
    } catch (err: any) {
      const cached = readCachedWeather(place);
      if (cached) {
        setData(cached);
        setIsOffline(true);
      } else {
        setError(err?.reason || err?.message || "error");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place.latitude, place.longitude, options.marine, options.lowData]);

  useEffect(() => {
    const cached = readCachedWeather(place);
    setData(cached);
    setIsLoading(cached == null);
    if (
      options.lowData &&
      cached &&
      Date.now() - cached.fetchedAt < LOW_DATA_FRESH_MS
    ) {
      setIsLoading(false);
      return;
    }
    load().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  }, [load]);

  return { data, isLoading, isRefreshing, isOffline, error, refresh };
};
