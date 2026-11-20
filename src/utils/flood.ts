export interface FloodRisk {
  level: "normal" | "elevated" | "high";
  peak: number; // m³/s, highest forecast flow in the next 7 days
  peakDate: string;
  typical: number; // median flow
}

const percentile = (sorted: number[], p: number) =>
  sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];

// Compares the next 7 days of forecast river flow (GloFAS via Open-Meteo) with
// the last ~3 years at the same river cell. Returns null where there is no
// meaningful river (tiny flows) or not enough history.
export const assessFloodRisk = (
  daily: { time: string[]; river_discharge: (number | null)[] },
  today: string,
): FloodRisk | null => {
  const history: number[] = [];
  const upcoming: { date: string; value: number }[] = [];
  daily.time.forEach((date, i) => {
    const value = daily.river_discharge[i];
    if (value == null) return;
    if (date < today) history.push(value);
    else if (upcoming.length < 7) upcoming.push({ date, value });
  });

  if (history.length < 365 || upcoming.length === 0) return null;
  const sorted = [...history].sort((a, b) => a - b);
  // Only rivers that regularly carry real flow (>= 5 m³/s on high days).
  if (percentile(sorted, 95) < 5) return null;

  const peak = upcoming.reduce((a, b) => (b.value > a.value ? b : a));
  const p95 = percentile(sorted, 95);
  const p99 = percentile(sorted, 99);

  return {
    level:
      peak.value >= p99 ? "high" : peak.value >= p95 ? "elevated" : "normal",
    peak: Math.round(peak.value * 10) / 10,
    peakDate: peak.date,
    typical: Math.round(percentile(sorted, 50) * 10) / 10,
  };
};
