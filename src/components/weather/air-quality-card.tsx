import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { AirQualityResponse } from "../../api/air-quality";
import Colors from "../../costants/Colors";
import { AQI_COLORS, type AqiLevel, aqiLevel } from "../../utils/air-quality";
import { AppText } from "../app-text";
import { SectionCard } from "./section-card";

const LEVELS: AqiLevel[] = [
  "good",
  "moderate",
  "sensitive",
  "unhealthy",
  "veryUnhealthy",
  "hazardous",
];

export const AirQualityCard: React.FC<{ airQuality: AirQualityResponse }> = ({
  airQuality,
}) => {
  const { t } = useTranslation("home");
  const { us_aqi, pm2_5, pm10, ozone } = airQuality.current;
  if (us_aqi == null) return null;

  const level = aqiLevel(us_aqi);
  const markerPercent = Math.min(100, (us_aqi / 300) * 100);

  return (
    <SectionCard title={t("airQuality")} icon="leaf">
      <View style={styles.header}>
        <AppText variant="valueLarge">{Math.round(us_aqi)}</AppText>
        <AppText
          variant="bodyBold"
          color={AQI_COLORS[level]}
          style={styles.level}
        >
          {t(`aqiLevels.${level}`)}
        </AppText>
      </View>

      <View style={styles.scale}>
        {LEVELS.map((l) => (
          <View
            key={l}
            style={[styles.segment, { backgroundColor: AQI_COLORS[l] }]}
          />
        ))}
        <View style={[styles.marker, { left: `${markerPercent}%` }]} />
      </View>

      <View style={styles.pollutants}>
        <AppText variant="caption" color={Colors.white + "B3"}>
          PM2.5 {pm2_5 != null ? Math.round(pm2_5) : "--"} µg/m³
        </AppText>
        <AppText variant="caption" color={Colors.white + "B3"}>
          PM10 {pm10 != null ? Math.round(pm10) : "--"} µg/m³
        </AppText>
        <AppText variant="caption" color={Colors.white + "B3"}>
          O₃ {ozone != null ? Math.round(ozone) : "--"} µg/m³
        </AppText>
      </View>
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  level: { flex: 1 },
  scale: {
    flexDirection: "row",
    height: 6,
    borderRadius: 3,
    overflow: "visible",
    marginVertical: 12,
  },
  segment: { flex: 1, height: 6 },
  marker: {
    position: "absolute",
    top: -4,
    width: 4,
    height: 14,
    marginLeft: -2,
    borderRadius: 2,
    backgroundColor: Colors.white,
  },
  pollutants: { flexDirection: "row", justifyContent: "space-between" },
});
