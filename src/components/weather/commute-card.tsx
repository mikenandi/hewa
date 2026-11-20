import React from "react";
import { useTranslation } from "react-i18next";
import type { ForecastResponse } from "../../api/forecast";
import { useTimeFormat } from "../../hooks/use-formatters";
import { buildCommuteForecast } from "../../utils/commute";
import { InfoRow, LEVEL_COLORS } from "./info-row";
import { SectionCard } from "./section-card";

interface CommuteCardProps {
  forecast: ForecastResponse;
  morningHour: number;
  eveningHour: number;
}

export const CommuteCard: React.FC<CommuteCardProps> = ({
  forecast,
  morningHour,
  eveningHour,
}) => {
  const { t } = useTranslation("home");
  const time = useTimeFormat();
  const trips = buildCommuteForecast(forecast, morningHour, eveningHour);
  if (trips.length === 0) return null;

  return (
    <SectionCard title={t("commute.title")} icon="bus">
      {trips.map((trip) => (
        <InfoRow
          key={trip.trip}
          icon={trip.status === "dry" ? "weather-partly-cloudy" : "umbrella"}
          iconColor={
            trip.status === "rain"
              ? LEVEL_COLORS.bad
              : trip.status === "maybe"
                ? LEVEL_COLORS.caution
                : LEVEL_COLORS.good
          }
          label={`${t(`commute.${trip.trip}`)} · ${t(`commute.${trip.day}`)} ${time(trip.time)}`}
          text={t(`commute.${trip.status}`, { probability: trip.probability })}
          detail={
            trip.advice === "leaveBefore"
              ? t("commute.leaveBefore", { time: time(trip.rainStart!) })
              : trip.advice === "umbrella"
                ? t("commute.umbrella")
                : undefined
          }
        />
      ))}
    </SectionCard>
  );
};
