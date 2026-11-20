import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/redux";
import { insightText } from "../../services/insight-text";
import type { Insight } from "../../utils/insights";

export const useInsightText = () => {
  const { t, i18n } = useTranslation();
  const settings = useSelector((state: RootState) => state.settings);
  return useCallback(
    (insight: Insight, timeStyle: "short" | "words" = "short") =>
      insightText(insight, { t, i18n, settings, timeStyle }),
    [t, i18n, settings],
  );
};
