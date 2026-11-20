import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import Colors from "../../costants/Colors";
import type { RootState } from "../../redux/redux";
import type { DayPlan, PlannerRow } from "../../utils/insights";
import { swahiliHour } from "../../utils/swahili-time";
import { AppText } from "../app-text";
import { SectionCard } from "../weather/section-card";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const ROWS: { key: PlannerRow; icon: IconName; color: string }[] = [
  { key: "rain", icon: "weather-rainy", color: "#5AC8FA" },
  { key: "heat", icon: "thermometer-high", color: "#FF6B5E" },
  { key: "sun", icon: "white-balance-sunny", color: "#FF9F0A" },
  { key: "mosquito", icon: "bug-outline", color: "#BF5AF2" },
  { key: "exercise", icon: "run", color: "#4CD964" },
  { key: "drying", icon: "tshirt-crew-outline", color: Colors.secondary },
];

// A when-to-do-what grid: one row per activity/risk, one cell per hour 06–21.
export const DayPlanner: React.FC<{ plan: DayPlan }> = ({ plan }) => {
  const { t } = useTranslation("insights");
  const swahili =
    useSelector((state: RootState) => state.settings.timeFormat) === "swahili";
  const hourLabel = (h: number) =>
    swahili ? String(swahiliHour(h)) : String(h).padStart(2, "0");

  return (
    <SectionCard
      title={
        plan.nowHour == null
          ? `${t("planner")} · ${t("tomorrowPlan")}`
          : t("planner")
      }
      icon="calendar-clock"
    >
      <AppText
        variant="caption"
        color={Colors.white + "99"}
        style={styles.hint}
      >
        {t("plannerHint")}
      </AppText>

      {ROWS.map((row) => (
        <View key={row.key} style={styles.row}>
          <View style={styles.label}>
            <MaterialCommunityIcons
              name={row.icon}
              size={15}
              color={row.color}
            />
            <AppText
              variant="caption"
              numberOfLines={1}
              style={styles.labelText}
            >
              {t(`rows.${row.key}`)}
            </AppText>
          </View>
          <View style={styles.cells}>
            {plan.rows[row.key].map((active, k) => (
              <View
                key={k}
                style={[
                  styles.cell,
                  { backgroundColor: active ? row.color : Colors.white + "12" },
                  plan.hours[k] === plan.nowHour && styles.nowCell,
                ]}
              />
            ))}
          </View>
        </View>
      ))}

      <View style={styles.row}>
        <View style={styles.label} />
        <View style={styles.cells}>
          {plan.hours.map((h, k) => (
            <AppText
              key={h}
              variant="caption"
              color={
                h === plan.nowHour ? Colors.secondary : Colors.white + "80"
              }
              style={styles.hour}
            >
              {k % 3 === 0 ? hourLabel(h) : ""}
            </AppText>
          ))}
        </View>
      </View>
      {swahili ? (
        <AppText
          variant="caption"
          color={Colors.white + "80"}
          style={styles.axisNote}
        >
          saa za Kiswahili
        </AppText>
      ) : null}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  hint: { marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  label: { width: 92, flexDirection: "row", alignItems: "center", gap: 5 },
  labelText: { flexShrink: 1 },
  cells: { flex: 1, flexDirection: "row", gap: 2 },
  cell: { flex: 1, height: 16, borderRadius: 4 },
  nowCell: { borderWidth: 1.5, borderColor: Colors.white },
  hour: { flex: 1, fontSize: 10, textAlign: "left" },
  axisNote: { textAlign: "right", fontSize: 10 },
});
