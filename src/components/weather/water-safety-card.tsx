import React from "react";
import { useTranslation } from "react-i18next";
import type { ForecastResponse } from "../../api/forecast";
import type { MarineResponse } from "../../api/marine";
import { useTimeFormat } from "../../hooks/use-formatters";
import type { LakeKey } from "../../utils/regions";
import { buildWaterSafety } from "../../utils/water-safety";
import { InfoRow, LEVEL_COLORS } from "./info-row";
import { SectionCard } from "./section-card";

interface WaterSafetyCardProps {
  forecast: ForecastResponse;
  marine: MarineResponse | null;
  lake: LakeKey | null;
}

export const WaterSafetyCard: React.FC<WaterSafetyCardProps> = ({
  forecast,
  marine,
  lake,
}) => {
  const { t } = useTranslation("home");
  const time = useTimeFormat();
  const windows = buildWaterSafety(forecast, lake ? null : marine);
  if (windows.length === 0) return null;

  return (
    <SectionCard
      title={`${t("water.title")} · ${t(`water.places.${lake ?? "coast"}`)}`}
      icon="ferry"
    >
      {windows.map((w) => {
        const color =
          w.level === "danger"
            ? LEVEL_COLORS.bad
            : w.level === "caution"
              ? LEVEL_COLORS.caution
              : LEVEL_COLORS.good;
        const details = [
          w.reasons.length
            ? t("water.because", {
                reasons: w.reasons
                  .map((r) => t(`water.reasons.${r}`))
                  .join(", "),
              })
            : null,
          w.peakTime
            ? t("water.gustPeak", { value: w.peakGust, time: time(w.peakTime) })
            : null,
        ].filter(Boolean);
        return (
          <InfoRow
            key={w.window}
            icon={
              w.level === "safe"
                ? "check-circle-outline"
                : w.level === "caution"
                  ? "alert-outline"
                  : "alert-octagon"
            }
            iconColor={color}
            label={t(`water.${w.window}`)}
            text={t(`water.levels.${w.level}`)}
            detail={details.join(" · ")}
          />
        );
      })}
    </SectionCard>
  );
};
