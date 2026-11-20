import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Place } from "@/api/geocoding";
import { AppLocalStorage } from "@/costants/storage-keys";
import i18n from "@/i18n";
import type { SettingsState } from "@/redux/reducers/settings-slice";
import type { WeatherAlert } from "@/utils/alerts";
import { buildCommuteForecast } from "@/utils/commute";
import { readJson, writeJson } from "@/utils/storage";
import { formatTime } from "@/utils/swahili-time";
import { formatTemp } from "@/utils/units";
import { getCondition } from "@/utils/weather-codes";
import { insightText } from "./insight-text";
import { alertsFor, insightsFor } from "./insights";
import type { WeatherBundle } from "./weather";

const BRIEFING_CHANNEL = "briefing";
const ALERTS_CHANNEL = "alerts";
const COMMUTE_CHANNEL = "commute";
const INSIGHTS_CHANNEL = "insights";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const ensureChannels = async () => {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(BRIEFING_CHANNEL, {
    name: i18n.t("notifications:channelBriefing"),
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  await Notifications.setNotificationChannelAsync(ALERTS_CHANNEL, {
    name: i18n.t("notifications:channelAlerts"),
    importance: Notifications.AndroidImportance.HIGH,
  });
  await Notifications.setNotificationChannelAsync(INSIGHTS_CHANNEL, {
    name: i18n.t("notifications:channelInsights"),
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  await Notifications.setNotificationChannelAsync(COMMUTE_CHANNEL, {
    name: i18n.t("notifications:channelCommute"),
    importance: Notifications.AndroidImportance.DEFAULT,
  });
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  if (!existing.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

const hasPermission = async () =>
  (await Notifications.getPermissionsAsync()).granted;

const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

export const cancelMorningBriefing = async () => {
  const previousId = readJson<string | null>(
    AppLocalStorage.BRIEFING_NOTIFICATION_ID,
    null,
  );
  if (previousId) {
    await Notifications.cancelScheduledNotificationAsync(previousId).catch(
      () => {},
    );
    writeJson(AppLocalStorage.BRIEFING_NOTIFICATION_ID, null);
  }
};

// Local notifications carry fixed text, so the briefing is re-scheduled with
// fresh numbers every time new weather arrives (foreground or background task).
export const scheduleMorningBriefing = async (
  place: Place,
  bundle: WeatherBundle,
  settings: SettingsState,
) => {
  await cancelMorningBriefing();
  if (!settings.morningBriefing || !(await hasPermission())) return;
  await ensureChannels();

  const trigger = new Date();
  trigger.setHours(settings.briefingHour, 0, 0, 0);
  if (trigger.getTime() <= Date.now()) trigger.setDate(trigger.getDate() + 1);

  const { daily } = bundle.forecast;
  const index = Math.max(0, daily.time.indexOf(localDateKey(trigger)));
  const unit = settings.temperatureUnit;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t("notifications:briefingTitle", {
        place: place.name,
        high: formatTemp(daily.temperature_2m_max[index], unit),
        low: formatTemp(daily.temperature_2m_min[index], unit),
      }),
      body: i18n.t("notifications:briefingBody", {
        condition: i18n.t(
          `common:conditions.${getCondition(daily.weather_code[index]).key}`,
        ),
        rain: daily.precipitation_probability_max[index] ?? 0,
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
      channelId: BRIEFING_CHANNEL,
    },
  });
  writeJson(AppLocalStorage.BRIEFING_NOTIFICATION_ID, id);
};

const alertId = (place: Place, alert: WeatherAlert) =>
  `${place.id}:${alert.key}:${alert.date}`;

// Fires each threshold alert at most once per place per day.
export const sendSevereAlerts = async (
  place: Place,
  bundle: WeatherBundle,
  settings: SettingsState,
) => {
  if (!settings.severeAlerts || !(await hasPermission())) return;
  const alerts = alertsFor(place, bundle, settings);
  if (alerts.length === 0) return;
  await ensureChannels();

  const sent = readJson<string[]>(AppLocalStorage.SENT_ALERTS, []);
  for (const alert of alerts) {
    const id = alertId(place, alert);
    if (sent.includes(id)) continue;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t("notifications:alertTitle", { place: place.name }),
        body: i18n.t(`home:alerts.${alert.key}`, { value: alert.value }),
      },
      trigger: { channelId: ALERTS_CHANNEL },
    });
    sent.push(id);
  }
  writeJson(AppLocalStorage.SENT_ALERTS, sent.slice(-50));
};

export const cancelCommuteAlerts = async () => {
  const ids = readJson<string[]>(AppLocalStorage.COMMUTE_NOTIFICATION_IDS, []);
  await Promise.all(
    ids.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
    ),
  );
  writeJson(AppLocalStorage.COMMUTE_NOTIFICATION_IDS, []);
};

// One reminder an hour before each upcoming trip, only when rain is possible.
export const scheduleCommuteAlerts = async (
  bundle: WeatherBundle,
  settings: SettingsState,
) => {
  await cancelCommuteAlerts();
  if (!settings.commute || !(await hasPermission())) return;
  await ensureChannels();

  const trips = buildCommuteForecast(
    bundle.forecast,
    settings.commuteMorningHour,
    settings.commuteEveningHour,
  );
  const ids: string[] = [];
  for (const trip of trips) {
    if (trip.status === "dry") continue;
    const trigger = new Date();
    if (trip.day === "tomorrow") trigger.setDate(trigger.getDate() + 1);
    trigger.setHours(Number(trip.time.slice(0, 2)) - 1, 0, 0, 0);
    if (trigger.getTime() <= Date.now()) continue;

    const time = (hhmm: string) => formatTime(hhmm, settings.timeFormat);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t("notifications:commuteTitle", {
          trip: i18n.t(`home:commute.${trip.trip}`),
          time: time(trip.time),
          status: i18n.t(`home:commute.${trip.status}`, {
            probability: trip.probability,
          }),
        }),
        body: i18n.t("notifications:commuteBody", {
          advice:
            trip.advice === "leaveBefore"
              ? i18n.t("home:commute.leaveBefore", {
                  time: time(trip.rainStart!),
                })
              : i18n.t("home:commute.umbrella"),
        }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
        channelId: COMMUTE_CHANNEL,
      },
    });
    ids.push(id);
  }
  writeJson(AppLocalStorage.COMMUTE_NOTIFICATION_IDS, ids);
};

export const cancelInsightReminders = async () => {
  const ids = readJson<string[]>(AppLocalStorage.INSIGHT_NOTIFICATION_IDS, []);
  await Promise.all(
    ids.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
    ),
  );
  writeJson(AppLocalStorage.INSIGHT_NOTIFICATION_IDS, []);
};

const MAX_INSIGHT_REMINDERS = 4;

// Timed reminders for the most important insights of the day (lightning,
// rainwater, treat water, mosquitoes, cold night, heat, roads, wind).
// Re-planned with every weather refresh, so they always match the latest forecast.
export const scheduleInsightReminders = async (
  place: Place,
  bundle: WeatherBundle,
  settings: SettingsState,
) => {
  await cancelInsightReminders();
  if (!settings.insightAlerts || !(await hasPermission())) return;
  await ensureChannels();

  const { insights } = insightsFor(place, bundle, settings);
  const ids: string[] = [];
  for (const insight of insights) {
    if (!insight.notify || ids.length >= MAX_INSIGHT_REMINDERS) continue;
    const [y, m, d] = insight.notify.date.split("-").map(Number);
    const [hh, mm] = insight.notify.time.split(":").map(Number);
    const trigger = new Date(y, m - 1, d, hh, mm, 0, 0);
    if (trigger.getTime() <= Date.now() + 60 * 1000) continue;

    const text = insightText(insight, { t: i18n.t.bind(i18n), i18n, settings });
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: `${place.name} · ${text.title}`, body: text.message },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
        channelId: INSIGHTS_CHANNEL,
      },
    });
    ids.push(id);
  }
  writeJson(AppLocalStorage.INSIGHT_NOTIFICATION_IDS, ids);
};
