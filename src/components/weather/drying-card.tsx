import React from "react";
import { useTranslation } from "react-i18next";
import type { ForecastResponse } from "../../api/forecast";
import { useTimeFormat } from "../../hooks/use-formatters";
import { buildDryingAdvice } from "../../utils/drying";
import { InfoRow, LEVEL_COLORS } from "./info-row";
import { SectionCard } from "./section-card";

export const DryingCard: React.FC<{ forecast: ForecastResponse }> = ({
  forecast,
}) => {
  const { t } = useTranslation("home");
  const time = useTimeFormat();
  const advice = buildDryingAdvice(forecast);
  const day = t(`drying.${advice.day}`);
  const color =
    advice.status === "good"
      ? LEVEL_COLORS.good
      : advice.status === "fair"
        ? LEVEL_COLORS.caution
        : LEVEL_COLORS.bad;

  return (
    <SectionCard title={t("drying.title")} icon="tshirt-crew-outline">
      <InfoRow
        icon={
          advice.status === "poor" ? "weather-rainy" : "white-balance-sunny"
        }
        iconColor={color}
        label={t("drying.hint")}
        text={t(`drying.${advice.status}`, {
          day,
          start: advice.start ? time(advice.start) : "",
          end: advice.end ? time(advice.end) : "",
        })}
        detail={
          advice.rainAfter
            ? t("drying.rainAfter", { time: time(advice.rainAfter) })
            : undefined
        }
      />
    </SectionCard>
  );
};
