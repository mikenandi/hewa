import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { LastYearResponse } from "../../api/climate";
import type { ForecastResponse } from "../../api/forecast";
import Colors from "../../costants/Colors";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/redux";
import { summarySentence } from "../../services/weather-text";
import type { WeatherAlert } from "../../utils/alerts";
import { todayIndex } from "../../utils/date-time";
import { type TemperatureUnit } from "../../utils/units";
import { AppText } from "../app-text";
import { SectionCard } from "./section-card";

interface SummaryCardProps {
  forecast: ForecastResponse;
  lastYear: LastYearResponse | null;
  temperatureUnit: TemperatureUnit;
  alerts: WeatherAlert[];
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  forecast,
  lastYear,
  temperatureUnit,
  alerts,
}) => {
  const { t } = useTranslation("home");

  const { t: tAll } = useTranslation();
  const timeFormat = useSelector(
    (state: RootState) => state.settings.timeFormat,
  );
  const sentence = summarySentence(forecast, tAll, timeFormat);

  const lastYearMax = lastYear?.daily.temperature_2m_max[0];
  const todayMax =
    forecast.daily.temperature_2m_max[
      todayIndex(forecast.daily.time, forecast.current.time)
    ];
  let comparison: string | null = null;
  if (lastYearMax != null && todayMax != null) {
    const diffC = todayMax - lastYearMax;
    const diff = Math.round(
      Math.abs(temperatureUnit === "f" ? diffC * 1.8 : diffC),
    );
    comparison =
      diff === 0
        ? t("lastYear.same")
        : t(diffC > 0 ? "lastYear.warmer" : "lastYear.cooler", { diff });
  }

  return (
    <>
      {alerts.map((alert) => (
        <View key={alert.key} style={styles.alert}>
          <MaterialCommunityIcons
            name="alert"
            size={22}
            color={Colors.primary}
          />
          <AppText
            variant="bodyBold"
            color={Colors.primary}
            style={styles.alertText}
          >
            {t(`alerts.${alert.key}`, { value: alert.value })}
          </AppText>
        </View>
      ))}
      <SectionCard>
        <View style={styles.summaryRow}>
          <MaterialCommunityIcons
            name="text-box-outline"
            size={20}
            color={Colors.secondary}
          />
          <AppText variant="body" style={styles.sentence}>
            {sentence}
          </AppText>
        </View>
        {comparison ? (
          <AppText
            variant="caption"
            color={Colors.white + "B3"}
            style={styles.comparison}
          >
            {comparison}
          </AppText>
        ) : null}
      </SectionCard>
    </>
  );
};

const styles = StyleSheet.create({
  alert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.secondary,
    borderRadius: 22,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  alertText: { flex: 1 },
  summaryRow: { flexDirection: "row", gap: 10 },
  sentence: { flex: 1, fontSize: 16, lineHeight: 23 },
  comparison: { marginTop: 10, marginLeft: 30 },
});
