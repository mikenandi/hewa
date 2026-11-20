import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TouchableRipple } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import type { Place } from "@/api/geocoding";
import { WeatherView } from "@/components/weather";
import Colors from "@/costants/Colors";
import { Screen } from "@/layouts";
import {
  removePlaceReducer,
  savePlaceReducer,
} from "@/redux/reducers/locations-slice";
import type { RootState } from "@/redux/redux";

// Weather for a searched place, with a star to save it to the home screen.
export default function CityWeather() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    region?: string;
    country?: string;
    latitude: string;
    longitude: string;
  }>();

  const place: Place = {
    id: params.id,
    name: params.name,
    region: params.region || undefined,
    country: params.country || undefined,
    latitude: Number(params.latitude),
    longitude: Number(params.longitude),
  };

  const isSaved = useSelector((state: RootState) =>
    state.locations.saved.some((saved) => saved.id === place.id),
  );

  const toggleSaved = () => {
    dispatch(isSaved ? removePlaceReducer(place.id) : savePlaceReducer(place));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  return (
    <Screen>
      <WeatherView
        place={place}
        width={width}
        headerLeft={
          <TouchableRipple
            onPress={() => router.back()}
            rippleColor={Colors.tertiary}
            borderless
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={26} color={Colors.white} />
          </TouchableRipple>
        }
        headerRight={
          <TouchableRipple
            onPress={toggleSaved}
            rippleColor={Colors.tertiary}
            borderless
            style={styles.iconButton}
          >
            <Ionicons
              name={isSaved ? "star" : "star-outline"}
              size={26}
              color={Colors.secondary}
            />
          </TouchableRipple>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
    borderRadius: 22,
    backgroundColor: Colors.white + "14",
  },
});
