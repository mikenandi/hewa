// Moon phase from the date alone (no API). Reference new moon: 2000-01-06 18:14 UTC.
const SYNODIC_MONTH = 29.530588853;
const REFERENCE_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

/** Moon age in days (0 = new moon, ~14.8 = full moon). */
export const moonAge = (date: Date = new Date()): number => {
  const days = (date.getTime() - REFERENCE_NEW_MOON) / 86400000;
  return ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
};

export type MoonPhase = "dark" | "bright" | "between";

// Lamp fishing for dagaa works best on dark nights; catches drop around full moon.
export const moonPhase = (date: Date = new Date()): MoonPhase => {
  const age = moonAge(date);
  if (age < 3.5 || age > SYNODIC_MONTH - 3.5) return "dark";
  if (age > 11.5 && age < 18) return "bright";
  return "between";
};
