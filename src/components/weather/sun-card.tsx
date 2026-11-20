import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { useTranslation } from "react-i18next";
import type { ForecastResponse } from "../../api/forecast";
import Colors from "../../costants/Colors";
import { useNow } from "../../hooks/use-now";
import {
  localNow,
  minutesOfDay,
  timeOf,
  todayIndex,
} from "../../utils/date-time";
import { AppText } from "../app-text";
import { useTimeFormat } from "../../hooks/use-formatters";
import { SectionCard } from "./section-card";

export const SunCard: React.FC<{ forecast: ForecastResponse }> = ({
  forecast,
}) => {
  const { t } = useTranslation("home");
  const now = useNow();
  const time = useTimeFormat();
  const { width: screenWidth } = useWindowDimensions();
  const today = todayIndex(forecast.daily.time, forecast.current.time);
  const sunrise = forecast.daily.sunrise[today];
  const sunset = forecast.daily.sunset[today];

  const rise = minutesOfDay(sunrise);
  const set = minutesOfDay(sunset);
  const local = localNow(forecast.utc_offset_seconds, now);
  const nowMinutes = local.hours * 60 + local.minutes;
  const progress = Math.min(
    1,
    Math.max(0, (nowMinutes - rise) / Math.max(1, set - rise)),
  );
  const daylight = set - rise;

  const width = screenWidth - 64;
  const height = 90;
  const radiusX = width / 2 - 12;
  const cx = width / 2;
  const baseY = height - 6;
  const angle = Math.PI * (1 - progress);
  const sunX = cx + radiusX * Math.cos(angle);
  const sunY = baseY - (height - 16) * Math.sin(angle);

  return (
    <SectionCard title={t("sun")} icon="weather-sunset">
      <Svg width={width} height={height}>
        <Path
          d={`M ${cx - radiusX} ${baseY} A ${radiusX} ${height - 16} 0 0 1 ${cx + radiusX} ${baseY}`}
          stroke={Colors.white + "50"}
          strokeWidth={2}
          strokeDasharray="4 6"
          fill="none"
        />
        <Line
          x1={0}
          y1={baseY}
          x2={width}
          y2={baseY}
          stroke={Colors.white + "40"}
          strokeWidth={1}
        />
        {progress > 0 && progress < 1 ? (
          <Circle cx={sunX} cy={sunY} r={9} fill={Colors.secondary} />
        ) : null}
      </Svg>
      <View style={styles.row}>
        <View>
          <AppText variant="caption" color={Colors.white + "B3"}>
            {t("sunrise")}
          </AppText>
          <AppText variant="value">{time(timeOf(sunrise))}</AppText>
        </View>
        <View style={styles.right}>
          <AppText variant="caption" color={Colors.white + "B3"}>
            {t("sunset")}
          </AppText>
          <AppText variant="value">{time(timeOf(sunset))}</AppText>
        </View>
      </View>
      <AppText
        variant="caption"
        color={Colors.secondary}
        style={styles.daylight}
      >
        {t("daylight", {
          hours: Math.floor(daylight / 60),
          minutes: daylight % 60,
        })}
      </AppText>
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  right: { alignItems: "flex-end" },
  daylight: { marginTop: 8, textAlign: "center" },
});
