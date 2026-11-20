import type { TFunction, i18n as I18n } from "i18next";
import type { SettingsState } from "@/redux/reducers/settings-slice";
import type { Insight, InsightValue } from "@/utils/insights";
import { formatTime } from "@/utils/swahili-time";
import { formatTemp, tempSymbol } from "@/utils/units";

interface FormatOptions {
  t: TFunction;
  i18n: I18n;
  settings: Pick<SettingsState, "timeFormat" | "temperatureUnit">;
  timeStyle?: "short" | "words";
}

const formatValue = (
  value: InsightValue,
  { t, i18n, settings, timeStyle = "short" }: FormatOptions,
) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const key = `insights:enums.${value}`;
    return i18n.exists(key) ? t(key) : value;
  }
  if ("time" in value)
    return formatTime(value.time, settings.timeFormat, timeStyle);
  if ("temp" in value)
    return `${formatTemp(value.temp, settings.temperatureUnit)}${tempSymbol(settings.temperatureUnit)}`;
  if ("weekday" in value)
    return (t("common:weekdays", { returnObjects: true }) as string[])[
      value.weekday
    ];
  const months = t("common:months", { returnObjects: true }) as string[];
  return `${Number(value.date.slice(8, 10))} ${months[Number(value.date.slice(5, 7)) - 1]}`;
};

/** Title, message and "why" for an insight, in the user's language, units and time format. */
export const insightText = (insight: Insight, options: FormatOptions) => {
  const values = Object.fromEntries(
    Object.entries(insight.values).map(([key, value]) => [
      key,
      formatValue(value, options),
    ]),
  );
  const base = `insights:items.${insight.id}`;
  return {
    title: options.t(`${base}.title`, values),
    message: options.t(`${base}.message`, values),
    why: options.t(`${base}.why`, values),
  };
};
