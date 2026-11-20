import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { ForecastResponse } from "../../api/forecast";
import Colors from "../../costants/Colors";
import { currentHourIndex, todayIndex } from "../../utils/date-time";
import {
  type TemperatureUnit,
  type WindUnit,
  formatTemp,
  formatWind,
  windSymbol,
} from "../../utils/units";
import { getCondition } from "../../utils/weather-codes";
import { AppText } from "../app-text";
import { WeatherIcon } from "./weather-icon";

interface WeatherHeroProps {
  forecast: ForecastResponse;
  temperatureUnit: TemperatureUnit;
  windUnit: WindUnit;
}

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const Stat: React.FC<{ icon: IconName; value: string; label: string }> = ({
  icon,
  value,
  label,
}) => (
  <View style={styles.stat}>
    <MaterialCommunityIcons name={icon} size={22} color={Colors.secondary} />
    <AppText variant="bodyBold" style={styles.statValue}>
      {value}
    </AppText>
    <AppText variant="caption" color={Colors.white + "A6"}>
      {label}
    </AppText>
  </View>
);

export const WeatherHero: React.FC<WeatherHeroProps> = ({
  forecast,
  temperatureUnit,
  windUnit,
}) => {
  const { t } = useTranslation("home");
  const { t: tc } = useTranslation("common");
  const { current, daily, hourly } = forecast;
  const today = todayIndex(daily.time, current.time);
  const rainChance =
    hourly.precipitation_probability[
      currentHourIndex(hourly.time, current.time)
    ] ?? 0;

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <WeatherIcon
          code={current.weather_code}
          isDay={current.is_day}
          size={150}
          large
        />
      </View>

      <View style={styles.tempRow}>
        <AppText style={styles.temp}>
          {formatTemp(current.temperature_2m, temperatureUnit)}
        </AppText>
        <AppText style={styles.degree}>°</AppText>
      </View>

      <AppText style={styles.condition}>
        {tc(`conditions.${getCondition(current.weather_code).key}`)}
      </AppText>

      <AppText variant="body" color={Colors.white + "CC"} style={styles.range}>
        {t("high")}{" "}
        {formatTemp(daily.temperature_2m_max[today], temperatureUnit)}°{"   "}
        {t("low")}{" "}
        {formatTemp(daily.temperature_2m_min[today], temperatureUnit)}°{"   "}
        {t("feelsLike")}{" "}
        <AppText variant="bodyBold" color={Colors.secondary}>
          {formatTemp(current.apparent_temperature, temperatureUnit)}°
        </AppText>
      </AppText>

      <View style={styles.stats}>
        <Stat
          icon="weather-windy"
          value={`${formatWind(current.wind_speed_10m, windUnit)} ${windSymbol(windUnit)}`}
          label={t("windspeed")}
        />
        <View style={styles.divider} />
        <Stat
          icon="water-percent"
          value={`${current.relative_humidity_2m}%`}
          label={t("humidity")}
        />
        <View style={styles.divider} />
        <Stat
          icon="umbrella-outline"
          value={`${rainChance}%`}
          label={t("rainChance")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingHorizontal: 16, paddingBottom: 20 },
  icon: { marginBottom: -24 },
  tempRow: { flexDirection: "row", alignItems: "flex-start" },
  temp: { fontFamily: "LatoSemiBold", fontSize: 104, lineHeight: 116 },
  degree: {
    fontFamily: "LatoRegular",
    fontSize: 56,
    lineHeight: 76,
    color: Colors.secondary,
  },
  condition: { fontFamily: "DMSansMedium", fontSize: 22 },
  range: { marginTop: 6, fontSize: 15 },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: Colors.white + "14",
    borderColor: Colors.white + "1F",
    borderWidth: StyleSheet.hairlineWidth,
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 16, marginTop: 2 },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: Colors.white + "33",
  },
});
