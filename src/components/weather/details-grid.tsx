import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { ForecastResponse } from "../../api/forecast";
import { todayIndex } from "../../utils/date-time";
import { type TemperatureUnit, formatTemp } from "../../utils/units";
import { SectionCard } from "./section-card";
import { StatTile } from "./stat-tile";

const uvLevel = (uv: number) =>
  uv < 3
    ? "low"
    : uv < 6
      ? "moderate"
      : uv < 8
        ? "high"
        : uv < 11
          ? "veryHigh"
          : "extreme";

interface DetailsGridProps {
  forecast: ForecastResponse;
  temperatureUnit: TemperatureUnit;
}

export const DetailsGrid: React.FC<DetailsGridProps> = ({
  forecast,
  temperatureUnit,
}) => {
  const { t } = useTranslation("home");
  const { current, daily } = forecast;
  const today = todayIndex(daily.time, current.time);
  const uvMax = daily.uv_index_max[today] ?? 0;

  return (
    <SectionCard title={t("details")} icon="view-grid-outline">
      <View style={styles.grid}>
        <StatTile
          label={t("uvIndex")}
          value={`${Math.round(current.uv_index)} / ${Math.round(uvMax)}`}
          hint={t(`uvLevels.${uvLevel(uvMax)}`)}
        />
        <StatTile
          label={t("precipitation")}
          value={`${(daily.precipitation_sum[today] ?? 0).toFixed(1)} mm`}
          hint={`${daily.precipitation_probability_max[today] ?? 0}%`}
        />
        <StatTile
          label={t("dewPoint")}
          value={`${formatTemp(current.dew_point_2m, temperatureUnit)}°`}
        />
        <StatTile
          label={t("pressure")}
          value={`${Math.round(current.pressure_msl)} hPa`}
        />
        <StatTile
          label={t("visibility")}
          value={`${Math.round(current.visibility / 1000)} km`}
        />
        <StatTile label={t("cloudCover")} value={`${current.cloud_cover}%`} />
      </View>
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
});
