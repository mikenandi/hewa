import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";
import { useTranslation } from "react-i18next";
import type { ForecastResponse } from "../../api/forecast";
import Colors from "../../costants/Colors";
import {
  type WindUnit,
  compassPoint,
  formatWind,
  windSymbol,
} from "../../utils/units";
import { AppText } from "../app-text";
import { SectionCard } from "./section-card";

interface WindCardProps {
  forecast: ForecastResponse;
  windUnit: WindUnit;
}

const SIZE = 110;
const C = SIZE / 2;

export const WindCard: React.FC<WindCardProps> = ({ forecast, windUnit }) => {
  const { t } = useTranslation("home");
  const { current } = forecast;
  // Wind direction is where wind comes FROM; the arrow points where it blows TO.
  const rotation = (current.wind_direction_10m + 180) % 360;

  return (
    <SectionCard title={t("wind")} icon="weather-windy">
      <View style={styles.row}>
        <View style={styles.info}>
          <View style={styles.speedRow}>
            <AppText variant="valueLarge">
              {formatWind(current.wind_speed_10m, windUnit)}
            </AppText>
            <AppText variant="body" style={styles.unit}>
              {windSymbol(windUnit)}
            </AppText>
          </View>
          <AppText variant="body" color={Colors.white + "CC"}>
            {t("gusts", {
              value: formatWind(current.wind_gusts_10m, windUnit),
              unit: windSymbol(windUnit),
            })}
          </AppText>
          <AppText
            variant="bodyBold"
            color={Colors.secondary}
            style={styles.from}
          >
            {t("from", { direction: compassPoint(current.wind_direction_10m) })}
          </AppText>
        </View>

        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={C}
            cy={C}
            r={C - 14}
            stroke={Colors.white + "40"}
            strokeWidth={2}
            fill="none"
          />
          {(["N", "E", "S", "W"] as const).map((label, i) => {
            const angle = (i * Math.PI) / 2;
            return (
              <SvgText
                key={label}
                x={C + Math.sin(angle) * (C - 5)}
                y={C - Math.cos(angle) * (C - 5) + 4}
                fill={label === "N" ? Colors.secondary : Colors.white}
                fontSize={11}
                fontWeight="bold"
                textAnchor="middle"
              >
                {label}
              </SvgText>
            );
          })}
          <G rotation={rotation} origin={`${C}, ${C}`}>
            <Path
              d={`M ${C} ${C - 30} L ${C + 9} ${C + 16} L ${C} ${C + 8} L ${C - 9} ${C + 16} Z`}
              fill={Colors.secondary}
            />
          </G>
        </Svg>
      </View>
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  info: { flex: 1 },
  speedRow: { flexDirection: "row", alignItems: "baseline" },
  unit: { marginLeft: 6 },
  from: { marginTop: 6 },
});
