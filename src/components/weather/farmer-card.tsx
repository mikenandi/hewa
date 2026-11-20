import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { ForecastResponse } from "../../api/forecast";
import Colors from "../../costants/Colors";
import { buildFarmingAdvice } from "../../utils/farming";
import { AppText } from "../app-text";
import { SectionCard } from "./section-card";
import { StatTile } from "./stat-tile";

const SPRAY_KEYS = {
  calm: "sprayOk",
  windy: "sprayWindy",
  rain: "sprayRain",
} as const;
const PLANT_KEYS = {
  moist: "plantingMoist",
  rainComing: "plantingRainComing",
  dry: "plantingDry",
} as const;

const AdviceRow: React.FC<{ ok: boolean; title: string; text: string }> = ({
  ok,
  title,
  text,
}) => (
  <View style={styles.adviceRow}>
    <MaterialCommunityIcons
      name={ok ? "check-circle" : "close-circle"}
      size={26}
      color={ok ? Colors.secondary : Colors.white + "99"}
    />
    <View style={styles.adviceText}>
      <AppText variant="caption" color={Colors.white + "B3"}>
        {title}
      </AppText>
      <AppText variant="bodyBold">{text}</AppText>
    </View>
  </View>
);

export const FarmerCard: React.FC<{ forecast: ForecastResponse }> = ({
  forecast,
}) => {
  const { t } = useTranslation("home");
  const advice = buildFarmingAdvice(forecast);

  return (
    <SectionCard title={t("farmer.title")} icon="sprout">
      <AdviceRow
        ok={advice.spray.ok}
        title={t("farmer.spray")}
        text={t(`farmer.${SPRAY_KEYS[advice.spray.reason]}`)}
      />
      <AdviceRow
        ok={advice.planting.ok}
        title={t("farmer.planting")}
        text={t(`farmer.${PLANT_KEYS[advice.planting.reason]}`)}
      />
      <View style={styles.grid}>
        <StatTile
          label={t("farmer.soilMoisture")}
          value={
            advice.soilMoisturePercent == null
              ? "--"
              : `${advice.soilMoisturePercent}%`
          }
        />
        <StatTile
          label={t("farmer.rain7")}
          value={`${advice.rainNext7Days} mm`}
        />
        <StatTile
          label={t("farmer.et0")}
          value={`${advice.evapotranspiration} mm`}
        />
      </View>
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  adviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  adviceText: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
});
