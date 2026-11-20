import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Colors from "../../costants/Colors";
import { useNow } from "../../hooks/use-now";
import { localNow } from "../../utils/date-time";
import { AppText } from "../app-text";
import { useTimeFormat } from "../../hooks/use-formatters";

interface WeatherHeaderProps {
  placeName: string;
  isDeviceLocation?: boolean;
  utcOffsetSeconds?: number;
  left?: ReactNode;
  right?: ReactNode;
}

export const WeatherHeader: React.FC<WeatherHeaderProps> = ({
  placeName,
  isDeviceLocation,
  utcOffsetSeconds,
  left,
  right,
}) => {
  const { t } = useTranslation("common");
  const now = useNow();
  const time = useTimeFormat();

  let dateLabel = "";
  if (utcOffsetSeconds != null) {
    const local = localNow(utcOffsetSeconds, now);
    const weekdays = t("weekdays", { returnObjects: true }) as string[];
    const months = t("months", { returnObjects: true }) as string[];
    dateLabel = `${weekdays[local.weekday]}, ${local.day} ${months[local.month]} · ${time(local.iso.slice(11, 16))}`;
  }

  return (
    <View style={styles.row}>
      <View style={styles.side}>{left}</View>
      <View style={styles.center}>
        <View style={styles.nameRow}>
          <Ionicons
            name={isDeviceLocation ? "navigate" : "location-sharp"}
            size={isDeviceLocation ? 15 : 18}
            color={Colors.secondary}
          />
          <AppText style={styles.name} numberOfLines={1}>
            {placeName}
          </AppText>
        </View>
        {dateLabel ? (
          <AppText variant="caption" color={Colors.white + "B3"}>
            {dateLabel}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  side: { width: 48 },
  sideRight: { alignItems: "flex-end" },
  center: { flex: 1, alignItems: "center", gap: 2 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontFamily: "DMSansBold", fontSize: 22, flexShrink: 1 },
});
