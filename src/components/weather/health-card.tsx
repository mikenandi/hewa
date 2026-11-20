import React from "react";
import { useTranslation } from "react-i18next";
import type { ForecastResponse } from "../../api/forecast";
import { useTimeFormat } from "../../hooks/use-formatters";
import { heatAdvice, mosquitoLevel } from "../../utils/health";
import { InfoRow, LEVEL_COLORS } from "./info-row";
import { SectionCard } from "./section-card";

interface HealthCardProps {
  forecast: ForecastResponse;
  rainLast14Days: number | null;
}

export const HealthCard: React.FC<HealthCardProps> = ({
  forecast,
  rainLast14Days,
}) => {
  const { t } = useTranslation("home");
  const time = useTimeFormat();
  const mosquito = mosquitoLevel(forecast, rainLast14Days);
  const heat = heatAdvice(forecast);

  const mosquitoColor =
    mosquito === "high"
      ? LEVEL_COLORS.bad
      : mosquito === "medium"
        ? LEVEL_COLORS.caution
        : LEVEL_COLORS.good;
  const heatColor =
    heat.level === "danger"
      ? LEVEL_COLORS.bad
      : heat.level === "caution"
        ? LEVEL_COLORS.caution
        : LEVEL_COLORS.good;

  return (
    <SectionCard title={t("health.title")} icon="heart-pulse">
      <InfoRow
        icon="bug-outline"
        iconColor={mosquitoColor}
        label={`${t("health.mosquito")} · ${t(`health.mosquitoLevels.${mosquito}`)}`}
        text={t(`health.mosquitoTips.${mosquito}`)}
        detail={t("health.mosquitoNote")}
      />
      <InfoRow
        icon="thermometer-high"
        iconColor={heatColor}
        label={t("health.heat")}
        text={
          heat.level === "none"
            ? t("health.heatNone")
            : t(
                heat.level === "danger"
                  ? "health.heatDanger"
                  : "health.heatCaution",
                {
                  start: time(heat.start!),
                  end: time(heat.end!),
                  peak: heat.peak,
                },
              )
        }
      />
    </SectionCard>
  );
};
