import type { Place } from "@/api/geocoding";

// Shown on the home screen until (or unless) the device location is available.
export const DEFAULT_PLACE: Place = {
  id: "default-dar-es-salaam",
  name: "Dar es Salaam",
  region: "Dar es Salaam",
  country: "Tanzania",
  latitude: -6.8235,
  longitude: 39.2695,
};
