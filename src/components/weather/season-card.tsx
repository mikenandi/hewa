import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import Colors from "../../costants/Colors";
import { useDateLabel } from "../../hooks/use-formatters";
import type { SeasonStatus } from "../../utils/season";
import { AppText } from "../app-text";
import { InfoRow, LEVEL_COLORS } from "./info-row";
import { SectionCard } from "./section-card";

export const SeasonCard: React.FC<{ season: SeasonStatus }> = ({ season }) => {
  const { t } = useTranslation("home");
  const date = useDateLabel();

  const statusText = {
    upcoming: t("season.upcoming", { date: date(season.windowStart) }),
    notStarted: t("season.notStarted"),
    started: t("season.started", {
      date: season.onsetDate ? date(season.onsetDate) : "",
    }),
    falseStart: t("season.notStarted"),
  }[season.status];

  const statusColor =
    season.status === "started"
      ? LEVEL_COLORS.good
      : season.status === "upcoming"
        ? Colors.white
        : LEVEL_COLORS.caution;

  const notes: string[] = [];
  if (season.status === "started" && season.provisional)
    notes.push(t("season.provisional"));
  if (season.status === "started" && season.dryDays >= 7)
    notes.push(t("season.drySpell", { days: season.dryDays }));
  if (season.status === "falseStart" && season.falseStartDate)
    notes.push(t("season.falseStart", { date: date(season.falseStartDate) }));
  if (season.status === "notStarted" || season.status === "falseStart")
    notes.push(
      season.possibleOnsetDate
        ? t("season.possibleOnset", { date: date(season.possibleOnsetDate) })
        : t("season.noOnsetSoon"),
    );
  if (season.status === "upcoming" && season.normalSoFar != null)
    notes.push(t("season.normalSeason", { value: season.normalSoFar }));

  const progress =
    season.percentOfNormal != null
      ? Math.min(100, season.percentOfNormal)
      : null;

  return (
    <SectionCard title={t("season.title")} icon="sprout-outline">
      <InfoRow
        icon="weather-pouring"
        iconColor={statusColor}
        label={t(`season.names.${season.season}`)}
        text={statusText}
      />
      {season.status !== "upcoming" ? (
        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <AppText variant="caption" color={Colors.white + "B3"}>
              {t("season.totalSoFar")}
            </AppText>
            <AppText variant="bodyBold">
              {season.totalSoFar} mm
              {season.percentOfNormal != null ? (
                <AppText variant="caption" color={Colors.secondary}>
                  {"  "}
                  {t("season.ofNormal", { percent: season.percentOfNormal })}
                </AppText>
              ) : null}
            </AppText>
          </View>
          {progress != null ? (
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress}%` }]} />
            </View>
          ) : null}
        </View>
      ) : null}
      {notes.map((note) => (
        <AppText key={note} variant="body" style={styles.note}>
          {note}
        </AppText>
      ))}
      <AppText
        variant="caption"
        color={Colors.white + "80"}
        style={styles.rule}
      >
        {t("season.rule")}
      </AppText>
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  totals: { marginTop: 6 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white + "26",
    marginTop: 8,
    overflow: "hidden",
  },
  fill: { height: 6, borderRadius: 3, backgroundColor: Colors.secondary },
  note: { marginTop: 10 },
  rule: { marginTop: 12 },
});
