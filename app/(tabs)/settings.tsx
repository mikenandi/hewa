import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { Switch, TouchableRipple } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { AppText, OptionChips } from "@/components";
import { SectionCard } from "@/components/weather/section-card";
import { DEFAULT_PLACE } from "@/costants/default-location";
import Colors from "@/costants/Colors";
import { Screen, Topbar } from "@/layouts";
import { removePlaceReducer } from "@/redux/reducers/locations-slice";
import {
  briefingHourReducer,
  commuteEveningHourReducer,
  commuteMorningHourReducer,
  commuteReducer,
  farmerModeReducer,
  insightAlertsReducer,
  lowDataReducer,
  marineModeReducer,
  morningBriefingReducer,
  severeAlertsReducer,
  temperatureUnitReducer,
  timeFormatReducer,
  windUnitReducer,
} from "@/redux/reducers/settings-slice";
import type { RootState } from "@/redux/redux";
import { requestNotificationPermission } from "@/services/notifications";
import { resyncFromCache } from "@/services/sync";
import { dataUsedToday, formatBytes } from "@/utils/data-usage";
import { type TimeFormat, formatTime } from "@/utils/swahili-time";
import type { TemperatureUnit, WindUnit } from "@/utils/units";

const FEEDBACK_EMAIL = "michaelnandi05@gmail.com";

const SwitchRow: React.FC<{
  title: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
}> = ({ title, hint, value, onChange }) => (
  <View style={styles.switchRow}>
    <View style={styles.switchText}>
      <AppText variant="bodyBold">{title}</AppText>
      <AppText variant="caption" color={Colors.white + "B3"}>
        {hint}
      </AppText>
    </View>
    <Switch value={value} onValueChange={onChange} color={Colors.secondary} />
  </View>
);

export default function Settings() {
  const { t, i18n } = useTranslation("settings");
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  const saved = useSelector((state: RootState) => state.locations.saved);
  const current = useSelector((state: RootState) => state.locations.current);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Keep the widget and scheduled notifications in line with the new settings.
  useEffect(() => {
    resyncFromCache(current ?? DEFAULT_PLACE, settings).catch(() => {});
  }, [settings, current, i18n.language]);

  const enableNotifications = async (
    value: boolean,
    action: (value: boolean) => { type: string; payload: boolean },
  ) => {
    if (value) {
      const granted = await requestNotificationPermission();
      setPermissionDenied(!granted);
      if (!granted) return;
    }
    dispatch(action(value));
  };

  // The commute card works without notifications; the reminder needs permission.
  const toggleCommute = async (value: boolean) => {
    dispatch(commuteReducer(value));
    if (value) setPermissionDenied(!(await requestNotificationPermission()));
  };

  const hourChips = (hours: number[]) =>
    hours.map((hour) => ({
      value: hour,
      label: formatTime(
        `${String(hour).padStart(2, "0")}:00`,
        settings.timeFormat,
      ),
    }));

  return (
    <Screen>
      <Topbar />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard title={t("units")}>
          <AppText
            variant="caption"
            color={Colors.white + "B3"}
            style={styles.label}
          >
            {t("temperature")}
          </AppText>
          <OptionChips<TemperatureUnit>
            options={[
              { value: "c", label: "°C" },
              { value: "f", label: "°F" },
            ]}
            value={settings.temperatureUnit}
            onChange={(value) => dispatch(temperatureUnitReducer(value))}
          />
          <AppText
            variant="caption"
            color={Colors.white + "B3"}
            style={styles.label}
          >
            {t("windSpeed")}
          </AppText>
          <OptionChips<WindUnit>
            options={[
              { value: "kmh", label: "km/h" },
              { value: "ms", label: "m/s" },
              { value: "mph", label: "mph" },
            ]}
            value={settings.windUnit}
            onChange={(value) => dispatch(windUnitReducer(value))}
          />
        </SectionCard>

        <SectionCard title={t("language")}>
          <OptionChips<string>
            options={[
              { value: "en", label: "English" },
              { value: "sw", label: "Kiswahili" },
            ]}
            value={i18n.language}
            onChange={(value) => i18n.changeLanguage(value)}
          />
        </SectionCard>

        <SectionCard title={t("timeFormat")}>
          <OptionChips<TimeFormat>
            options={[
              { value: "swahili", label: t("timeSwahili") },
              { value: "24h", label: t("time24") },
            ]}
            value={settings.timeFormat}
            onChange={(value) => dispatch(timeFormatReducer(value))}
          />
        </SectionCard>

        <SectionCard title={t("commute")}>
          <SwitchRow
            title={t("commuteToggle")}
            hint={t("commuteHint")}
            value={settings.commute}
            onChange={toggleCommute}
          />
          {settings.commute ? (
            <>
              <AppText
                variant="caption"
                color={Colors.white + "B3"}
                style={styles.label}
              >
                {t("morningTrip")}
              </AppText>
              <OptionChips<number>
                options={hourChips([5, 6, 7, 8, 9])}
                value={settings.commuteMorningHour}
                onChange={(value) => dispatch(commuteMorningHourReducer(value))}
              />
              <AppText
                variant="caption"
                color={Colors.white + "B3"}
                style={styles.label}
              >
                {t("eveningTrip")}
              </AppText>
              <OptionChips<number>
                options={hourChips([16, 17, 18, 19, 20])}
                value={settings.commuteEveningHour}
                onChange={(value) => dispatch(commuteEveningHourReducer(value))}
              />
            </>
          ) : null}
        </SectionCard>

        <SectionCard title={t("notifications")}>
          <SwitchRow
            title={t("morningBriefing")}
            hint={t("morningBriefingHint")}
            value={settings.morningBriefing}
            onChange={(value) =>
              enableNotifications(value, morningBriefingReducer)
            }
          />
          {settings.morningBriefing ? (
            <>
              <AppText
                variant="caption"
                color={Colors.white + "B3"}
                style={styles.label}
              >
                {t("briefingTime")}
              </AppText>
              <OptionChips<number>
                options={hourChips([5, 6, 7, 8, 9])}
                value={settings.briefingHour}
                onChange={(value) => dispatch(briefingHourReducer(value))}
              />
            </>
          ) : null}
          <SwitchRow
            title={t("severeAlerts")}
            hint={t("severeAlertsHint")}
            value={settings.severeAlerts}
            onChange={(value) =>
              enableNotifications(value, severeAlertsReducer)
            }
          />
          <SwitchRow
            title={t("insights:notifyToggle")}
            hint={t("insights:notifyHint")}
            value={settings.insightAlerts}
            onChange={(value) =>
              enableNotifications(value, insightAlertsReducer)
            }
          />
          {permissionDenied ? (
            <AppText
              variant="caption"
              color={Colors.secondary}
              style={styles.label}
            >
              {t("permissionDenied")}
            </AppText>
          ) : null}
        </SectionCard>

        <SectionCard title={t("modes")}>
          <SwitchRow
            title={t("farmerMode")}
            hint={t("farmerModeHint")}
            value={settings.farmerMode}
            onChange={(value) => dispatch(farmerModeReducer(value))}
          />
          <SwitchRow
            title={t("marineMode")}
            hint={t("marineModeHint")}
            value={settings.marineMode}
            onChange={(value) => dispatch(marineModeReducer(value))}
          />
        </SectionCard>

        <SectionCard title={t("lowData")}>
          <SwitchRow
            title={t("lowData")}
            hint={t("lowDataHint")}
            value={settings.lowData}
            onChange={(value) => dispatch(lowDataReducer(value))}
          />
          <AppText
            variant="caption"
            color={Colors.secondary}
            style={styles.label}
          >
            {t("dataUsed", { value: formatBytes(dataUsedToday()) })}
          </AppText>
        </SectionCard>

        <SectionCard title={t("savedPlaces")}>
          {saved.length === 0 ? (
            <AppText variant="body" color={Colors.white + "B3"}>
              {t("noSavedPlaces")}
            </AppText>
          ) : (
            saved.map((place) => (
              <View key={place.id} style={styles.placeRow}>
                <View style={styles.switchText}>
                  <AppText variant="bodyBold">{place.name}</AppText>
                  <AppText variant="caption" color={Colors.white + "B3"}>
                    {[place.region, place.country].filter(Boolean).join(", ")}
                  </AppText>
                </View>
                <TouchableRipple
                  onPress={() => dispatch(removePlaceReducer(place.id))}
                  rippleColor={Colors.tertiary}
                  borderless
                  style={styles.removeButton}
                  accessibilityLabel={t("remove")}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={24}
                    color={Colors.secondary}
                  />
                </TouchableRipple>
              </View>
            ))
          )}
        </SectionCard>

        <SectionCard>
          <TouchableRipple
            onPress={() =>
              Linking.openURL(
                `mailto:${FEEDBACK_EMAIL}?subject=${t("feedbackSubject")}`,
              )
            }
            rippleColor={Colors.tertiary}
            borderless
          >
            <View style={styles.placeRow}>
              <View style={styles.switchText}>
                <AppText variant="bodyBold">{t("feedback")}</AppText>
                <AppText variant="caption" color={Colors.white + "B3"}>
                  {t("feedbackHint")}
                </AppText>
              </View>
              <MaterialCommunityIcons
                name="email-outline"
                size={24}
                color={Colors.secondary}
              />
            </View>
          </TouchableRipple>
        </SectionCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingBottom: 24 },
  label: { marginTop: 12, marginBottom: 8 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  switchText: { flex: 1 },
  placeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  removeButton: { padding: 6, borderRadius: 20 },
});
