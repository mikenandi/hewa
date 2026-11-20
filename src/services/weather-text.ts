import type { TFunction } from "i18next";
import type { ForecastResponse } from "@/api/forecast";
import type { Place } from "@/api/geocoding";
import type { SettingsState } from "@/redux/reducers/settings-slice";
import type { WeatherAlert } from "@/utils/alerts";
import { currentHourIndex, todayIndex } from "@/utils/date-time";
import { buildSummary } from "@/utils/summary";
import { formatTime } from "@/utils/swahili-time";
import { formatTemp } from "@/utils/units";
import { getCondition } from "@/utils/weather-codes";

// Plain-language sentences shared by the summary card, the share image and
// the voice readout, so all three always say the same thing.

export const summarySentence = (
  forecast: ForecastResponse,
  t: TFunction,
  timeFormat: SettingsState["timeFormat"],
  style: "short" | "words" = "short",
): string => {
  const [feel, rain, ...extras] = buildSummary(forecast);
  const values = (part: typeof feel) =>
    part.values?.time
      ? {
          ...part.values,
          time: formatTime(String(part.values.time), timeFormat, style),
        }
      : (part.values ?? {});
  return [
    `${t(`summary:${feel.key}`, values(feel))}, ${t(`summary:${rain.key}`, values(rain))}.`,
    ...extras.map((part) => t(`summary:${part.key}`, values(part))),
  ].join(" ");
};

export const spokenWeather = (
  place: Place,
  forecast: ForecastResponse,
  alerts: WeatherAlert[],
  t: TFunction,
  settings: SettingsState,
): string => {
  const { current, daily, hourly } = forecast;
  const today = todayIndex(daily.time, current.time);
  const unit = settings.temperatureUnit;
  const rain =
    hourly.precipitation_probability[
      currentHourIndex(hourly.time, current.time)
    ] ?? 0;

  return [
    `${place.name}.`,
    t("home:speech.now", {
      temp: formatTemp(current.temperature_2m, unit),
      condition: t(
        `common:conditions.${getCondition(current.weather_code).key}`,
      ),
    }),
    t("home:speech.range", {
      high: formatTemp(daily.temperature_2m_max[today], unit),
      low: formatTemp(daily.temperature_2m_min[today], unit),
    }),
    `${t("home:rainChance")} ${rain}%.`,
    summarySentence(forecast, t, settings.timeFormat, "words"),
    ...alerts.map(
      (alert) => `${t(`home:alerts.${alert.key}`, { value: alert.value })}.`,
    ),
  ].join(" ");
};
