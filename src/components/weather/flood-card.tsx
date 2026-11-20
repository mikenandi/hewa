import React from "react";
import { useTranslation } from "react-i18next";
import { useDateLabel } from "../../hooks/use-formatters";
import type { FloodRisk } from "../../utils/flood";
import { InfoRow, LEVEL_COLORS } from "./info-row";
import { SectionCard } from "./section-card";

export const FloodCard: React.FC<{ risk: FloodRisk }> = ({ risk }) => {
  const { t } = useTranslation("home");
  const date = useDateLabel();
  const color =
    risk.level === "high"
      ? LEVEL_COLORS.bad
      : risk.level === "elevated"
        ? LEVEL_COLORS.caution
        : LEVEL_COLORS.good;

  return (
    <SectionCard title={t("flood.title")} icon="home-flood">
      <InfoRow
        icon="waves-arrow-up"
        iconColor={color}
        text={t(`flood.${risk.level}`, { date: date(risk.peakDate) })}
        detail={t("flood.detail", { peak: risk.peak, typical: risk.typical })}
      />
    </SectionCard>
  );
};
