import * as Location from "expo-location";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { reverseGeocodeReq } from "@/api/geocoding";
import { currentLocationReducer } from "@/redux/reducers/locations-slice";

// Asks for foreground location once and stores the resolved place in Redux.
// If permission is denied the home screen keeps using the last known place
// (or the Dar es Salaam default).
export const useDeviceLocation = () => {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const position =
          (await Location.getLastKnownPositionAsync({
            maxAge: 30 * 60 * 1000,
          })) ??
          (await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }));
        const { latitude, longitude } = position.coords;

        let name = "";
        let region: string | undefined;
        let country: string | undefined;
        try {
          const [address] = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          name = address?.city || address?.district || address?.subregion || "";
          region = address?.region ?? undefined;
          country = address?.country ?? undefined;
        } catch {
          // Device geocoder unavailable — fall back to the free web service below.
        }
        if (!name) {
          const place = await reverseGeocodeReq(
            latitude,
            longitude,
            i18n.language,
          ).catch(() => null);
          name =
            place?.name || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          region = region ?? place?.region;
          country = country ?? place?.country;
        }

        dispatch(
          currentLocationReducer({
            id: "device",
            name,
            region,
            country,
            latitude,
            longitude,
          }),
        );
      } catch {
        // Location is a nice-to-have; never block the app on it.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
