import Axios from "axios";
import { recordDataUsage } from "@/utils/data-usage";

// Every API Hewa talks to is a free, key-less public API on a different host,
// so calls pass absolute URLs and this client only carries shared settings.
export const baseClient = Axios.create({
  timeout: 15000,
  headers: { Accept: "application/json" },
});

// Counts downloaded bytes for the "data used today" figure in Settings.
baseClient.interceptors.response.use((response) => {
  const length = Number(response.headers["content-length"]);
  recordDataUsage(
    Number.isFinite(length) && length > 0
      ? length
      : JSON.stringify(response.data ?? "").length,
  );
  return response;
});

export const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
export const OPEN_METEO_GEOCODING_URL =
  "https://geocoding-api.open-meteo.com/v1/search";
export const OPEN_METEO_AIR_QUALITY_URL =
  "https://air-quality-api.open-meteo.com/v1/air-quality";
export const OPEN_METEO_MARINE_URL =
  "https://marine-api.open-meteo.com/v1/marine";
export const OPEN_METEO_ARCHIVE_URL =
  "https://archive-api.open-meteo.com/v1/archive";
export const OPEN_METEO_FLOOD_URL = "https://flood-api.open-meteo.com/v1/flood";
export const BIG_DATA_CLOUD_REVERSE_URL =
  "https://api.bigdatacloud.net/data/reverse-geocode-client";
