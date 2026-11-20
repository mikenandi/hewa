// Open-Meteo is called with `timezone=auto`, so every timestamp it returns is a
// local wall-clock string for the place ("2026-11-20T21:15") with no offset.
// These helpers work on those strings directly so the app shows the place's
// local time regardless of the phone's own timezone.

const pad = (n: number) => n.toString().padStart(2, "0");

/** "HH:mm" part of a local ISO string. */
export const timeOf = (iso: string): string => iso.slice(11, 16);

/** Hour (0-23) of a local ISO string. */
export const hourOf = (iso: string): number => Number(iso.slice(11, 13));

/** Minutes since local midnight of a local ISO string. */
export const minutesOfDay = (iso: string): number =>
  Number(iso.slice(11, 13)) * 60 + Number(iso.slice(14, 16));

/** Day of week (0 = Sunday) for "YYYY-MM-DD..." */
export const weekdayOf = (iso: string): number => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

/** Parts of the place's current local time, given its UTC offset. */
export const localNow = (utcOffsetSeconds: number, now: Date = new Date()) => {
  const shifted = new Date(now.getTime() + utcOffsetSeconds * 1000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
    hours: shifted.getUTCHours(),
    minutes: shifted.getUTCMinutes(),
    iso: `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(
      shifted.getUTCDate(),
    )}T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`,
  };
};

/** Index of the hourly entry for the current local hour (falls back to 0). */
export const currentHourIndex = (
  hourlyTimes: string[],
  currentIso: string,
): number => {
  const prefix = currentIso.slice(0, 13);
  const index = hourlyTimes.findIndex((time) => time.startsWith(prefix));
  return index === -1 ? 0 : index;
};

export const formatClock = (date: Date): string =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/**
 * Index of the place's current local date in `daily.time`. Right after local
 * midnight Open-Meteo can still start the daily arrays at the previous day.
 */
export const todayIndex = (dailyTimes: string[], currentIso: string): number =>
  Math.max(0, dailyTimes.indexOf(currentIso.slice(0, 10)));
