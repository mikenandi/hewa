import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { MarineResponse } from "../../api/marine";
import Colors from "../../costants/Colors";
import { type TemperatureUnit, formatTemp } from "../../utils/units";
import { AppText } from "../app-text";
import { SectionCard } from "./section-card";
import { StatTile } from "./stat-tile";

interface MarineCardProps {
  marine: MarineResponse;
  temperatureUnit: TemperatureUnit;
}

// Only rendered near the coast — the marine API returns nulls inland.
export const MarineCard: React.FC<MarineCardProps> = ({
  marine,
  temperatureUnit,
}) => {
  const { t } = useTranslation("home");
  const {
    wave_height,
    swell_wave_height,
    wave_period,
    sea_surface_temperature,
  } = marine.current;
  if (wave_height == null) return null;

  const state =
    wave_height < 0.5 ? "calm" : wave_height < 1.25 ? "moderate" : "rough";
  const maxToday = marine.daily.wave_height_max[0];

  return (
    <SectionCard title={t("marine.title")} icon="waves">
      <AppText variant="bodyBold" color={Colors.secondary} style={styles.state}>
        {t(`marine.${state}`)}
      </AppText>
      <View style={styles.grid}>
        <StatTile
          label={t("marine.waves")}
          value={`${wave_height.toFixed(1)} m`}
          hint={
            maxToday != null
              ? t("marine.maxToday", { value: maxToday.toFixed(1) })
              : undefined
          }
        />
        <StatTile
          label={t("marine.swell")}
          value={
            swell_wave_height != null
              ? `${swell_wave_height.toFixed(1)} m`
              : "--"
          }
        />
        <StatTile
          label={t("marine.period")}
          value={wave_period != null ? `${Math.round(wave_period)} s` : "--"}
        />
        <StatTile
          label={t("marine.seaTemp")}
          value={`${formatTemp(sea_surface_temperature, temperatureUnit)}°`}
        />
      </View>
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  state: { marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
});
