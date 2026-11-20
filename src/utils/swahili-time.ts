// Saa za Kiswahili: the day is counted from sunrise (06:00 = saa kumi na mbili,
// 07:00 = saa moja asubuhi, 13:00 = saa saba mchana, 19:00 = saa moja usiku).

export type TimeFormat = "24h" | "swahili";

const HOUR_WORDS = [
  "",
  "moja",
  "mbili",
  "tatu",
  "nne",
  "tano",
  "sita",
  "saba",
  "nane",
  "tisa",
  "kumi",
  "kumi na moja",
  "kumi na mbili",
];

export type SwahiliPeriod =
  "alfajiri" | "asubuhi" | "mchana" | "jioni" | "usiku";

export const swahiliPeriod = (hour24: number): SwahiliPeriod => {
  if (hour24 >= 4 && hour24 < 6) return "alfajiri";
  if (hour24 >= 6 && hour24 < 12) return "asubuhi";
  if (hour24 >= 12 && hour24 < 16) return "mchana";
  if (hour24 >= 16 && hour24 < 19) return "jioni";
  return "usiku";
};

/** Swahili clock hour (1-12) for a 24-hour clock hour. */
export const swahiliHour = (hour24: number): number => (hour24 + 6) % 12 || 12;

const parse = (hhmm: string) => ({
  hours: Number(hhmm.slice(0, 2)),
  minutes: Number(hhmm.slice(3, 5)),
});

/** "saa 1 asubuhi", "saa 3:30 usiku" */
export const swahiliShort = (hhmm: string): string => {
  const { hours, minutes } = parse(hhmm);
  const h = swahiliHour(hours);
  const mm = minutes ? `:${String(minutes).padStart(2, "0")}` : "";
  return `saa ${h}${mm} ${swahiliPeriod(hours)}`;
};

/** "saa moja na nusu asubuhi", "saa nne kasoro robo usiku" — natural spoken form. */
export const swahiliWords = (hhmm: string): string => {
  const { hours, minutes } = parse(hhmm);
  if (minutes === 45) {
    const next = (hours + 1) % 24;
    return `saa ${HOUR_WORDS[swahiliHour(next)]} kasoro robo ${swahiliPeriod(next)}`;
  }
  const h = HOUR_WORDS[swahiliHour(hours)];
  let rest = "";
  if (minutes === 15) rest = " na robo";
  else if (minutes === 30) rest = " na nusu";
  else if (minutes > 0) rest = ` na dakika ${minutes}`;
  return `saa ${h}${rest} ${swahiliPeriod(hours)}`;
};

/**
 * Formats a "HH:mm" clock time.
 * - `short`: compact label for UI ("07:00" / "saa 1 asubuhi")
 * - `words`: for sentences and speech ("07:00" / "saa moja asubuhi")
 */
export const formatTime = (
  hhmm: string,
  format: TimeFormat,
  style: "short" | "words" = "short",
): string => {
  if (format !== "swahili") return hhmm;
  return style === "words" ? swahiliWords(hhmm) : swahiliShort(hhmm);
};
