import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/redux";
import { formatTime } from "@/utils/swahili-time";

/** Formats "HH:mm" per the user's time format (24h or Saa za Kiswahili). */
export const useTimeFormat = () => {
  const timeFormat = useSelector(
    (state: RootState) => state.settings.timeFormat,
  );
  return useCallback(
    (hhmm: string, style: "short" | "words" = "short") =>
      formatTime(hhmm, timeFormat, style),
    [timeFormat],
  );
};

/** "14 Oct" / "14 Okt" for a YYYY-MM-DD date. */
export const useDateLabel = () => {
  const { t } = useTranslation("common");
  return useCallback(
    (isoDate: string) => {
      const months = t("months", { returnObjects: true }) as string[];
      return `${Number(isoDate.slice(8, 10))} ${months[Number(isoDate.slice(5, 7)) - 1]}`;
    },
    [t],
  );
};
