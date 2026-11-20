import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { ForecastResponse } from "../../api/forecast";
import Colors from "../../costants/Colors";
import { todayIndex, weekdayOf } from "../../utils/date-time";
import { type TemperatureUnit, formatTemp } from "../../utils/units";
import { AppText } from "../app-text";
import { SectionCard } from "./section-card";
import { WeatherIcon } from "./weather-icon";

interface DailyForecastProps {
  forecast: ForecastResponse;
  temperatureUnit: TemperatureUnit;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({
  forecast,
  temperatureUnit,
}) => {
  const { t } = useTranslation("home");
  const { t: tc } = useTranslation("common");
  const { daily, current } = forecast;
  const start = todayIndex(daily.time, current.time);
  const days = daily.time.map((day, i) => ({ day, i })).slice(start);
  const weekdays = tc("weekdaysShort", { returnObjects: true }) as string[];

  // Bars share one scale across all days, so warmer days visibly sit further right.
  const lowest = Math.min(...days.map(({ i }) => daily.temperature_2m_min[i]));
  const highest = Math.max(...days.map(({ i }) => daily.temperature_2m_max[i]));
  const span = Math.max(1, highest - lowest);

  return (
    <SectionCard title={t("daily")} icon="calendar-month-outline">
      {days.map(({ day, i }) => {
        const min = daily.temperature_2m_min[i];
        const max = daily.temperature_2m_max[i];
        const rain = daily.precipitation_probability_max[i] ?? 0;
        return (
          <View key={day} style={styles.row}>
            <AppText variant="bodyBold" style={styles.day}>
              {i === start ? tc("today") : weekdays[weekdayOf(day)]}
            </AppText>
            <View style={styles.iconBox}>
              <WeatherIcon code={daily.weather_code[i]} isDay size={36} />
              <AppText variant="caption" color={Colors.secondary}>
                {rain >= 10 ? `${rain}%` : ""}
              </AppText>
            </View>
            <AppText
              variant="body"
              color={Colors.white + "B3"}
              style={styles.temp}
            >
              {formatTemp(min, temperatureUnit)}°
            </AppText>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    left: `${((min - lowest) / span) * 100}%`,
                    width: `${Math.max(4, ((max - min) / span) * 100)}%`,
                  },
                ]}
              />
            </View>
            <AppText variant="bodyBold" style={[styles.temp, styles.maxTemp]}>
              {formatTemp(max, temperatureUnit)}°
            </AppText>
          </View>
        );
      })}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 5 },
  day: { width: 64 },
  iconBox: { width: 70, flexDirection: "row", alignItems: "center" },
  icon: { width: 36, height: 36 },
  temp: { width: 36, textAlign: "right" },
  maxTemp: { textAlign: "left", marginLeft: 8 },
  track: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    marginLeft: 8,
    backgroundColor: Colors.white + "30",
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
  },
});
