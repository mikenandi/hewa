import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { ForecastResponse } from "../../api/forecast";
import Colors from "../../costants/Colors";
import type { RootState } from "../../redux/redux";
import { currentHourIndex, hourOf, timeOf } from "../../utils/date-time";
import { swahiliHour, swahiliPeriod } from "../../utils/swahili-time";
import { type TemperatureUnit, formatTemp } from "../../utils/units";
import { AppText } from "../app-text";
import { SectionCard } from "./section-card";
import { WeatherIcon } from "./weather-icon";

interface HourlyForecastProps {
  forecast: ForecastResponse;
  temperatureUnit: TemperatureUnit;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  forecast,
  temperatureUnit,
}) => {
  const { t } = useTranslation("home");
  const { t: tc } = useTranslation("common");
  const swahili =
    useSelector((state: RootState) => state.settings.timeFormat) === "swahili";
  const { hourly, current } = forecast;
  const start = currentHourIndex(hourly.time, current.time);
  const hours = hourly.time.slice(start, start + 24).map((time, i) => ({
    time,
    temp: hourly.temperature_2m[start + i],
    code: hourly.weather_code[start + i],
    isDay: hourly.is_day[start + i],
    rain: hourly.precipitation_probability[start + i] ?? 0,
  }));

  return (
    <SectionCard
      title={t("hourly")}
      icon="clock-outline"
      titleInset={16}
      style={styles.card}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        nestedScrollEnabled
      >
        {hours.map((hour, i) => (
          <View key={hour.time} style={[styles.hour, i === 0 && styles.now]}>
            <AppText variant="caption" color={Colors.white + "CC"}>
              {i === 0
                ? tc("now")
                : swahili
                  ? `saa ${swahiliHour(hourOf(hour.time))}`
                  : timeOf(hour.time)}
            </AppText>
            {swahili ? (
              <AppText
                variant="caption"
                color={Colors.white + "80"}
                style={styles.period}
              >
                {i === 0 ? " " : swahiliPeriod(hourOf(hour.time))}
              </AppText>
            ) : null}
            <WeatherIcon code={hour.code} isDay={hour.isDay} size={44} />
            <AppText variant="bodyBold">
              {formatTemp(hour.temp, temperatureUnit)}°
            </AppText>
            <AppText
              variant="caption"
              color={Colors.secondary}
              style={styles.rain}
            >
              {hour.rain >= 10 ? `${hour.rain}%` : " "}
            </AppText>
          </View>
        ))}
      </ScrollView>
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  card: { paddingHorizontal: 0, paddingBottom: 10 },
  row: { paddingHorizontal: 8, gap: 2 },
  hour: {
    alignItems: "center",
    width: 58,
    paddingVertical: 8,
    borderRadius: 18,
  },
  now: { backgroundColor: Colors.white + "1F" },
  period: { fontSize: 10 },
  rain: { marginTop: 2 },
});
