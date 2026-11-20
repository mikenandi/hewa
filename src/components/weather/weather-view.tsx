import React, { ReactNode, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { TouchableRipple } from "react-native-paper";
import { useSelector } from "react-redux";
import type { Place } from "../../api/geocoding";
import Colors from "../../costants/Colors";
import { useTimeFormat } from "../../hooks/use-formatters";
import { useWeather } from "../../hooks/use-weather";
import type { RootState } from "../../redux/redux";
import {
  alertsFor,
  floodRiskFor,
  rainLast14Days,
  seasonFor,
  waterSafetyFor,
} from "../../services/insights";
import { speak, stopSpeaking } from "../../services/speech";
import type { WeatherBundle } from "../../services/weather";
import { spokenWeather } from "../../services/weather-text";
import { formatClock } from "../../utils/date-time";
import { AppText } from "../app-text";
import { InsightsSheet } from "../insights/insights-sheet";
import { LoadingGif } from "../loader";
import { AirQualityCard } from "./air-quality-card";
import { CommuteCard } from "./commute-card";
import { DailyForecast } from "./daily-forecast";
import { DetailsGrid } from "./details-grid";
import { DryingCard } from "./drying-card";
import { FarmerCard } from "./farmer-card";
import { FloodCard } from "./flood-card";
import { HealthCard } from "./health-card";
import { HourlyForecast } from "./hourly-forecast";
import { MarineCard } from "./marine-card";
import { SeasonCard } from "./season-card";
import { ShareSheet } from "./share-sheet";
import { SummaryCard } from "./summary-card";
import { SunCard } from "./sun-card";
import { WaterSafetyCard } from "./water-safety-card";
import { WeatherHeader } from "./weather-header";
import { WeatherHero } from "./weather-hero";
import { WindCard } from "./wind-card";

interface WeatherViewProps {
  place: Place;
  width: number;
  isDeviceLocation?: boolean;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  pager?: ReactNode;
  /** Extra bottom space, e.g. to clear the floating tab bar. */
  bottomInset?: number;
  onLoaded?: (bundle: WeatherBundle) => void;
}

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const ActionPill: React.FC<{
  icon: IconName;
  label: string;
  onPress: () => void;
  accent?: boolean;
}> = ({ icon, label, onPress, accent }) => (
  <TouchableRipple
    onPress={onPress}
    borderless
    style={[styles.pill, accent && styles.pillAccent]}
    rippleColor={Colors.tertiary}
  >
    <View style={styles.pillContent}>
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={accent ? Colors.primary : Colors.secondary}
      />
      <AppText
        variant="bodyBold"
        color={accent ? Colors.primary : Colors.white}
      >
        {label}
      </AppText>
    </View>
  </TouchableRipple>
);

export const WeatherView: React.FC<WeatherViewProps> = ({
  place,
  width,
  isDeviceLocation,
  headerLeft,
  headerRight,
  pager,
  bottomInset = 24,
  onLoaded,
}) => {
  const { t, i18n } = useTranslation("home");
  const { t: tAll } = useTranslation();
  const time = useTimeFormat();
  const settings = useSelector((state: RootState) => state.settings);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const { data, isLoading, isRefreshing, isOffline, error, refresh } =
    useWeather(
      place,
      { marine: settings.marineMode, lowData: settings.lowData },
      onLoaded,
    );

  // Stop reading aloud when this page goes away.
  useEffect(
    () => () => {
      stopSpeaking();
    },
    [],
  );

  const handleRefresh = async () => {
    await refresh();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const alerts = data ? alertsFor(place, data, settings) : [];
  const flood = data ? floodRiskFor(data) : null;
  const water = data ? waterSafetyFor(place, data, settings.marineMode) : null;
  const season = data ? seasonFor(place, data) : null;

  const handleListen = async () => {
    if (!data) return;
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const text = spokenWeather(place, data.forecast, alerts, tAll, settings);
    const result = await speak(text, i18n.language, () => setSpeaking(false));
    if (result === "noVoice")
      Alert.alert(t("speech.noVoiceTitle"), t("speech.noVoice"));
    else setSpeaking(true);
  };

  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
      showsVerticalScrollIndicator={false}
      onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.secondary}
          colors={[Colors.secondary]}
          progressBackgroundColor={Colors.primary}
        />
      }
    >
      <WeatherHeader
        placeName={place.name}
        isDeviceLocation={isDeviceLocation}
        utcOffsetSeconds={data?.forecast.utc_offset_seconds}
        left={headerLeft}
        right={headerRight}
      />
      <View style={styles.meta}>
        {pager}
        {isOffline && data ? (
          <View style={styles.offline}>
            <AppText variant="caption" color={Colors.primary}>
              {t("offline", {
                time: time(formatClock(new Date(data.fetchedAt))),
              })}
            </AppText>
          </View>
        ) : null}
      </View>

      {isLoading && !data ? (
        <View style={{ height: viewportHeight * 0.7 }}>
          <LoadingGif />
        </View>
      ) : !data ? (
        <View style={[styles.errorBox, { height: viewportHeight * 0.7 }]}>
          <AppText variant="body" style={styles.errorText}>
            {error ? t("loadError") : ""}
          </AppText>
        </View>
      ) : (
        <>
          <WeatherHero
            forecast={data.forecast}
            temperatureUnit={settings.temperatureUnit}
            windUnit={settings.windUnit}
          />
          <View style={styles.actions}>
            <ActionPill
              icon={speaking ? "stop-circle-outline" : "volume-high"}
              label={speaking ? t("actions.stop") : t("actions.listen")}
              onPress={handleListen}
            />
            <ActionPill
              icon="share-variant"
              label={t("actions.share")}
              onPress={() => setSharing(true)}
            />
            <ActionPill
              icon="lightbulb-on-outline"
              accent
              label={tAll("insights:tabTitle")}
              onPress={() => setShowInsights(true)}
            />
          </View>

          <SummaryCard
            forecast={data.forecast}
            lastYear={data.lastYear}
            temperatureUnit={settings.temperatureUnit}
            alerts={alerts}
          />
          {settings.commute ? (
            <CommuteCard
              forecast={data.forecast}
              morningHour={settings.commuteMorningHour}
              eveningHour={settings.commuteEveningHour}
            />
          ) : null}
          <HourlyForecast
            forecast={data.forecast}
            temperatureUnit={settings.temperatureUnit}
          />
          <DryingCard forecast={data.forecast} />
          <HealthCard
            forecast={data.forecast}
            rainLast14Days={rainLast14Days(data)}
          />
          <DailyForecast
            forecast={data.forecast}
            temperatureUnit={settings.temperatureUnit}
          />
          {season ? <SeasonCard season={season} /> : null}
          {flood ? <FloodCard risk={flood} /> : null}
          {settings.farmerMode ? <FarmerCard forecast={data.forecast} /> : null}
          {water ? (
            <WaterSafetyCard
              forecast={data.forecast}
              marine={data.marine}
              lake={water.lake}
            />
          ) : null}
          {settings.marineMode && data.marine && !water?.lake ? (
            <MarineCard
              marine={data.marine}
              temperatureUnit={settings.temperatureUnit}
            />
          ) : null}
          <DetailsGrid
            forecast={data.forecast}
            temperatureUnit={settings.temperatureUnit}
          />
          <WindCard forecast={data.forecast} windUnit={settings.windUnit} />
          {data.airQuality ? (
            <AirQualityCard airQuality={data.airQuality} />
          ) : null}
          <SunCard forecast={data.forecast} />
          <AppText
            variant="caption"
            color={Colors.white + "80"}
            style={styles.attribution}
          >
            {tAll("common:dataAttribution")}
          </AppText>

          <ShareSheet
            visible={sharing}
            onClose={() => setSharing(false)}
            placeName={place.name}
            forecast={data.forecast}
          />
          <InsightsSheet
            visible={showInsights}
            onClose={() => setShowInsights(false)}
            place={place}
            bundle={data}
          />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  meta: { alignItems: "center", gap: 8, marginTop: 10, minHeight: 7 },
  offline: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginTop: -6,
    marginBottom: 16,
  },
  pill: {
    borderRadius: 20,
    backgroundColor: Colors.white + "14",
    borderColor: Colors.white + "1F",
    borderWidth: StyleSheet.hairlineWidth,
  },
  pillAccent: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  pillContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  errorBox: { justifyContent: "center", paddingHorizontal: 32 },
  errorText: { textAlign: "center" },
  attribution: { textAlign: "center", marginTop: 4 },
});
