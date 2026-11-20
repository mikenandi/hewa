import { type RainRegime, rainRegime } from "./regions";

export type SeasonKey = "vuli" | "masika" | "msimu";

export interface SeasonStatus {
  season: SeasonKey;
  regime: RainRegime;
  status: "upcoming" | "notStarted" | "started" | "falseStart";
  windowStart: string; // YYYY-MM-DD
  windowEnd: string;
  onsetDate?: string;
  provisional?: boolean; // onset found but < 21 days observed since
  falseStartDate?: string;
  possibleOnsetDate?: string; // from the 16-day forecast
  dryDays: number; // current run of dry days (season started)
  totalSoFar: number;
  normalSoFar: number | null;
  percentOfNormal: number | null;
}

// Agro-meteorological onset rule of thumb used widely in East Africa:
// the season starts on the first day where 3 days of rain total >= 20 mm,
// and it is a FALSE start if a dry spell of 7+ days (< 1 mm/day) follows within 21 days.
const ONSET_RAIN_MM = 20;
const WET_DAY_MM = 1;
const DRY_SPELL_DAYS = 7;
const CONFIRM_DAYS = 21;

const SEASONS: Record<
  RainRegime,
  { key: SeasonKey; start: [number, number]; end: [number, number] }[]
> = {
  bimodal: [
    { key: "masika", start: [3, 1], end: [5, 31] },
    { key: "vuli", start: [10, 1], end: [12, 31] },
  ],
  unimodal: [{ key: "msimu", start: [11, 1], end: [4, 30] }],
};

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

const addDays = (date: string, days: number): string => {
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
};

const daysBetween = (a: string, b: string): number => {
  const [y1, m1, d1] = a.split("-").map(Number);
  const [y2, m2, d2] = b.split("-").map(Number);
  return Math.round(
    (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000,
  );
};

/** The season window containing `today`, or the next one to come. */
const seasonWindow = (regime: RainRegime, today: string) => {
  const year = Number(today.slice(0, 4));
  const candidates = [year - 1, year, year + 1].flatMap((y) =>
    SEASONS[regime].map((s) => {
      const endYear = s.end[0] < s.start[0] ? y + 1 : y;
      return {
        key: s.key,
        start: iso(y, s.start[0], s.start[1]),
        end: iso(endYear, s.end[0], s.end[1]),
      };
    }),
  );
  return candidates
    .filter((w) => w.end >= today)
    .sort((a, b) => a.start.localeCompare(b.start))[0];
};

export const analyzeSeason = (
  latitude: number,
  longitude: number,
  today: string,
  rainByDate: Map<string, number>,
): SeasonStatus => {
  const regime = rainRegime(latitude, longitude);
  const window = seasonWindow(regime, today);
  const rain = (date: string) => rainByDate.get(date);

  const base = {
    season: window.key,
    regime,
    windowStart: window.start,
    windowEnd: window.end,
    dryDays: 0,
  };

  // Season total so far vs the same part of the season in past years.
  const yesterday = addDays(today, -1);
  const sumRange = (from: string, to: string) => {
    let total = 0;
    let missing = 0;
    for (let d = from; d <= to; d = addDays(d, 1)) {
      const value = rain(d);
      if (value == null) missing++;
      else total += value;
    }
    return { total, missing };
  };

  const observedEnd = yesterday < window.end ? yesterday : window.end;
  const totalSoFar =
    today > window.start ? sumRange(window.start, observedEnd).total : 0;
  const elapsed =
    today > window.start ? daysBetween(window.start, observedEnd) : null;

  const pastTotals: number[] = [];
  for (let back = 1; back <= 5; back++) {
    const start = `${Number(window.start.slice(0, 4)) - back}${window.start.slice(4)}`;
    const end =
      elapsed != null
        ? addDays(start, elapsed)
        : addDays(start, daysBetween(window.start, window.end));
    const { total, missing } = sumRange(start, end);
    if (missing === 0) pastTotals.push(total);
  }
  const normal = pastTotals.length
    ? pastTotals.reduce((a, b) => a + b, 0) / pastTotals.length
    : null;

  const totals = {
    totalSoFar: Math.round(totalSoFar),
    normalSoFar: normal != null ? Math.round(normal) : null,
    percentOfNormal:
      normal && elapsed != null && normal > 0
        ? Math.round((totalSoFar / normal) * 100)
        : null,
  };

  if (today < window.start) {
    return { ...base, ...totals, status: "upcoming" };
  }

  // Scan observed days for an onset (and false starts).
  let onset: string | undefined;
  let provisional = false;
  let falseStartDate: string | undefined;
  for (
    let d = window.start;
    d <= addDays(yesterday, -2) && d <= window.end;
    d = addDays(d, 1)
  ) {
    const three = [0, 1, 2]
      .map((k) => rain(addDays(d, k)) ?? 0)
      .reduce((a, b) => a + b, 0);
    if (three < ONSET_RAIN_MM) continue;

    let dryRun = 0;
    let failed = false;
    let observed = 0;
    for (let k = 3; k < CONFIRM_DAYS; k++) {
      const day = addDays(d, k);
      if (day > yesterday) break;
      observed++;
      dryRun = (rain(day) ?? 0) < WET_DAY_MM ? dryRun + 1 : 0;
      if (dryRun >= DRY_SPELL_DAYS) {
        failed = true;
        break;
      }
    }
    if (failed) {
      falseStartDate = d;
      continue;
    }
    onset = d;
    provisional = observed < CONFIRM_DAYS - 3;
    break;
  }

  if (onset) {
    let dryDays = 0;
    for (
      let d = yesterday;
      d > onset && (rain(d) ?? 0) < WET_DAY_MM;
      d = addDays(d, -1)
    )
      dryDays++;
    return {
      ...base,
      ...totals,
      status: "started",
      onsetDate: onset,
      provisional,
      dryDays,
    };
  }

  // Not started: does the 16-day forecast contain an onset-sized rain event?
  let possibleOnsetDate: string | undefined;
  for (let d = today; daysBetween(today, d) <= 13; d = addDays(d, 1)) {
    const values = [0, 1, 2].map((k) => rain(addDays(d, k)));
    if (values.some((v) => v == null)) break;
    if ((values as number[]).reduce((a, b) => a + b, 0) >= ONSET_RAIN_MM) {
      possibleOnsetDate = d;
      break;
    }
  }

  return {
    ...base,
    ...totals,
    status: falseStartDate ? "falseStart" : "notStarted",
    falseStartDate,
    possibleOnsetDate,
  };
};
