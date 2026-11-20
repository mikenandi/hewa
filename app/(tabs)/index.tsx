import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
} from "react-native";
import { useSelector } from "react-redux";
import type { Place } from "@/api/geocoding";
import { PageDots } from "@/components";
import { WeatherView } from "@/components/weather";
import { DEFAULT_PLACE } from "@/costants/default-location";
import { useDeviceLocation } from "@/hooks/use-device-location";
import { Screen } from "@/layouts";
import { type RootState, store } from "@/redux/redux";
import { syncPrimaryWeather } from "@/services/sync";
import type { WeatherBundle } from "@/services/weather";

// Page 0 is the device location (or Dar es Salaam until it is known);
// swipe left for saved places.
export default function Home() {
  useDeviceLocation();
  const { width } = useWindowDimensions();
  const [pageIndex, setPageIndex] = useState(0);

  const current = useSelector((state: RootState) => state.locations.current);
  const saved = useSelector((state: RootState) => state.locations.saved);
  const primary = current ?? DEFAULT_PLACE;
  const pages = useMemo<Place[]>(() => [primary, ...saved], [primary, saved]);

  const handlePrimaryLoaded = useCallback(
    (bundle: WeatherBundle) => {
      syncPrimaryWeather(primary, bundle, store.getState().settings).catch(
        () => {},
      );
    },
    [primary],
  );

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPageIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <Screen>
      <FlatList
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(place) => place.id}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        renderItem={({ item, index }) => (
          <WeatherView
            place={item}
            width={width}
            isDeviceLocation={index === 0 && current != null}
            pager={<PageDots count={pages.length} index={pageIndex} />}
            onLoaded={index === 0 ? handlePrimaryLoaded : undefined}
          />
        )}
      />
    </Screen>
  );
}
