import {
  BIG_DATA_CLOUD_REVERSE_URL,
  OPEN_METEO_GEOCODING_URL,
  baseClient,
} from "./base";

export interface Place {
  id: string;
  name: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

// Matches Open-Meteo geocoding result items (https://open-meteo.com/en/docs/geocoding-api).
interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

export const searchPlacesReq = async (
  query: string,
  language: string,
): Promise<Place[]> => {
  try {
    const response = await baseClient.get(OPEN_METEO_GEOCODING_URL, {
      params: { name: query, count: 8, language, format: "json" },
    });
    const results: GeocodingResult[] = response.data.results ?? [];
    return results.map((result) => ({
      id: String(result.id),
      name: result.name,
      region: result.admin1,
      country: result.country,
      latitude: result.latitude,
      longitude: result.longitude,
    }));
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Free client-side reverse geocoding (no key). Used only when the device
// geocoder (expo-location) returns nothing.
export const reverseGeocodeReq = async (
  latitude: number,
  longitude: number,
  language: string,
): Promise<{ name: string; region?: string; country?: string }> => {
  try {
    const response = await baseClient.get(BIG_DATA_CLOUD_REVERSE_URL, {
      params: { latitude, longitude, localityLanguage: language },
    });
    const data = response.data;
    return {
      name: data.city || data.locality || data.principalSubdivision || "",
      region: data.principalSubdivision || undefined,
      country: data.countryName || undefined,
    };
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
