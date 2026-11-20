import React, { useRef, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Sharing from "expo-sharing";
import { useTranslation } from "react-i18next";
import { TouchableRipple } from "react-native-paper";
import { captureRef } from "react-native-view-shot";
import { useSelector } from "react-redux";
import type { ForecastResponse } from "../../api/forecast";
import Colors from "../../costants/Colors";
import { useDateLabel } from "../../hooks/use-formatters";
import { GRADIENT } from "../../layouts/screen";
import type { RootState } from "../../redux/redux";
import { summarySentence } from "../../services/weather-text";
import { currentHourIndex, todayIndex } from "../../utils/date-time";
import { formatTemp } from "../../utils/units";
import { getCondition } from "../../utils/weather-codes";
import { AppText } from "../app-text";
import { WeatherIcon } from "./weather-icon";

interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  placeName: string;
  forecast: ForecastResponse;
}

// A branded weather card rendered as an image and handed to the system share
// sheet — made for WhatsApp groups.
export const ShareSheet: React.FC<ShareSheetProps> = ({
  visible,
  onClose,
  placeName,
  forecast,
}) => {
  const { t } = useTranslation("home");
  const { t: tAll } = useTranslation();
  const date = useDateLabel();
  const settings = useSelector((state: RootState) => state.settings);
  const cardRef = useRef<React.ComponentRef<typeof View>>(null);
  const [busy, setBusy] = useState(false);

  const { current, daily, hourly } = forecast;
  const today = todayIndex(daily.time, current.time);
  const unit = settings.temperatureUnit;
  const rain =
    hourly.precipitation_probability[
      currentHourIndex(hourly.time, current.time)
    ] ?? 0;

  const handleShare = async () => {
    try {
      setBusy(true);
      // RN 0.88 refs are ReactNativeElement host instances; view-shot resolves them
      // to a native view at runtime, its typings just predate the new type.
      const target = cardRef.current as unknown as Parameters<
        typeof captureRef
      >[0];
      const uri = await captureRef(target, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          UTI: "public.png",
          dialogTitle: t("shareCard.dialogTitle"),
        });
      }
    } catch {
      // User cancelled or sharing unavailable.
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View ref={cardRef} collapsable={false} style={styles.cardShadow}>
          <LinearGradient colors={GRADIENT} style={styles.card}>
            <View style={styles.topRow}>
              <AppText variant="bodyBold" color={Colors.secondary}>
                {t("shareCard.title")}
              </AppText>
              <AppText variant="caption" color={Colors.white + "B3"}>
                {date(daily.time[today])}
              </AppText>
            </View>

            <AppText style={styles.place}>{placeName}</AppText>

            <View style={styles.tempRow}>
              <WeatherIcon
                code={current.weather_code}
                isDay={current.is_day}
                size={96}
                large
              />
              <View>
                <AppText style={styles.temp}>
                  {formatTemp(current.temperature_2m, unit)}
                  <AppText style={styles.degree}>°</AppText>
                </AppText>
                <AppText variant="bodyBold">
                  {tAll(
                    `common:conditions.${getCondition(current.weather_code).key}`,
                  )}
                </AppText>
              </View>
            </View>

            <View style={styles.stats}>
              <AppText variant="bodyBold">
                ↑ {formatTemp(daily.temperature_2m_max[today], unit)}° ↓{" "}
                {formatTemp(daily.temperature_2m_min[today], unit)}°
              </AppText>
              <View style={styles.statsRain}>
                <MaterialCommunityIcons
                  name="umbrella-outline"
                  size={16}
                  color={Colors.secondary}
                />
                <AppText variant="bodyBold">{rain}%</AppText>
              </View>
            </View>

            <AppText variant="body" style={styles.summary}>
              {summarySentence(forecast, tAll, settings.timeFormat)}
            </AppText>

            <View style={styles.footer}>
              <AppText variant="bodyBold">
                Hewa<AppText color={Colors.secondary}>•</AppText>
              </AppText>
              <AppText variant="caption" color={Colors.white + "B3"}>
                {t("shareCard.footer")}
              </AppText>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.actions}>
          <TouchableRipple
            onPress={onClose}
            borderless
            style={[styles.button, styles.secondaryButton]}
          >
            <AppText variant="bodyBold">{t("shareCard.close")}</AppText>
          </TouchableRipple>
          <TouchableRipple
            onPress={handleShare}
            disabled={busy}
            borderless
            style={[styles.button, styles.primaryButton]}
          >
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons
                name="whatsapp"
                size={20}
                color={Colors.primary}
              />
              <AppText variant="bodyBold" color={Colors.primary}>
                {t("shareCard.button")}
              </AppText>
            </View>
          </TouchableRipple>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#000000B3",
    justifyContent: "center",
    padding: 20,
  },
  cardShadow: { borderRadius: 28, overflow: "hidden" },
  card: { padding: 22 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  place: { fontFamily: "DMSansBold", fontSize: 26, marginTop: 10 },
  tempRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
  temp: { fontFamily: "LatoSemiBold", fontSize: 64, lineHeight: 72 },
  degree: { fontFamily: "LatoRegular", fontSize: 40, color: Colors.secondary },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: Colors.white + "14",
  },
  statsRain: { flexDirection: "row", alignItems: "center", gap: 4 },
  summary: { marginTop: 14, fontSize: 15, lineHeight: 22 },
  footer: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.white + "40",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actions: { flexDirection: "row", gap: 12, marginTop: 16 },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: { backgroundColor: Colors.white + "26" },
  primaryButton: { backgroundColor: Colors.secondary },
  buttonContent: { flexDirection: "row", alignItems: "center", gap: 8 },
});
