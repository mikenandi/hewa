import type { AirQualityResponse } from "@/api/air-quality";
import type { ForecastResponse } from "@/api/forecast";
import { buildDryingAdvice } from "./drying";
import { buildFarmingAdvice } from "./farming";
import type { FloodRisk } from "./flood";
import { currentHourIndex, hourOf, timeOf, todayIndex } from "./date-time";
import { type MosquitoLevel, heatAdvice } from "./health";
import { moonPhase } from "./moon";
import type { SeasonStatus } from "./season";
import { isThunderstorm } from "./weather-codes";

export type InsightCategory = "health" | "home" | "travel" | "farm";
export type InsightSeverity = "warning" | "tip" | "info";

/** A value the UI formats for the user's units, language and time format. */
export type InsightValue =
  | string
  | number
  | { time: string }
  | { date: string }
  | { temp: number }
  | { weekday: number };

export interface Insight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  icon: string; // MaterialCommunityIcons name
  priority: number; // higher = more important
  values: Record<string, InsightValue>;
  /** Place-local date and time to remind the user, if this deserves a notification. */
  notify?: { date: string; time: string };
}

export interface InsightContext {
  forecast: ForecastResponse;
  airQuality: AirQualityResponse | null;
  rainLast3Days: number | null;
  mosquito: MosquitoLevel;
  flood: FloodRisk | null;
  season: SeasonStatus | null;
  onWater: boolean; // on a big lake or the coast, with fishers' mode on
  farmerMode: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");
const SEVERITY_WEIGHT: Record<InsightSeverity, number> = {
  warning: 300,
  tip: 100,
  info: 0,
};

const shiftTime = (hhmm: string, minutes: number) => {
  const total = Math.max(
    0,
    Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5)) + minutes,
  );
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
};

// Turns the forecast into short, practical insights for daily life in East Africa.
export const buildInsights = (ctx: InsightContext): Insight[] => {
  const { forecast } = ctx;
  const { current, hourly, daily } = forecast;
  const t = todayIndex(daily.time, current.time);
  const today = daily.time[t];
  const now = currentHourIndex(hourly.time, current.time);
  const nowTime = timeOf(current.time);
  const sunset = timeOf(daily.sunset[t]);
  const insights: Omit<Insight, "priority">[] = [];
  const add = (insight: Omit<Insight, "priority">, weight = 0) =>
    insights.push({
      ...insight,
      priority: SEVERITY_WEIGHT[insight.severity] + weight,
    } as Insight);

  const ahead = (hours: number) =>
    hourly.time
      .slice(now, now + hours)
      .map((time, k) => ({ time, i: now + k }));
  const todayHours = ahead(24).filter(({ time }) => time.startsWith(today));
  const future = (time: string) => time > nowTime;

  // ── Health ────────────────────────────────────────────────────────────
  const heat = heatAdvice(forecast);
  if (heat.level !== "none") {
    add(
      {
        id: "heat",
        category: "health",
        severity: heat.level === "danger" ? "warning" : "tip",
        icon: "cup-water",
        values: {
          start: { time: heat.start! },
          end: { time: heat.end! },
          peak: { temp: heat.peak! },
        },
        notify:
          heat.level === "danger" && future(shiftTime(heat.start!, -60))
            ? { date: today, time: shiftTime(heat.start!, -60) }
            : undefined,
      },
      heat.peak! - 30,
    );
  }

  const uvHours = todayHours.filter(({ i }) => (hourly.uv_index[i] ?? 0) >= 8);
  if (uvHours.length) {
    const uvMax = Math.round(
      Math.max(...uvHours.map(({ i }) => hourly.uv_index[i] ?? 0)),
    );
    add(
      {
        id: "uv",
        category: "health",
        severity: uvMax >= 11 ? "warning" : "tip",
        icon: "sunglasses",
        values: {
          start: { time: timeOf(uvHours[0].time) },
          end: {
            time: `${pad(hourOf(uvHours[uvHours.length - 1].time) + 1)}:00`,
          },
          uv: uvMax,
        },
      },
      uvMax,
    );
  }

  const aqi = ctx.airQuality?.current.us_aqi;
  if (aqi != null && aqi > 100) {
    add(
      {
        id: "airQuality",
        category: "health",
        severity: "warning",
        icon: "lungs",
        values: { aqi: Math.round(aqi) },
      },
      aqi / 10,
    );
  }
  const dust = ctx.airQuality?.current.dust;
  if (dust != null && dust >= 100) {
    add(
      {
        id: "dust",
        category: "health",
        severity: "tip",
        icon: "weather-dust",
        values: { dust: Math.round(dust) },
      },
      5,
    );
  }

  if (ctx.mosquito !== "low") {
    const remind = shiftTime(sunset, -30);
    add(
      {
        id: "mosquito",
        category: "health",
        severity: ctx.mosquito === "high" ? "warning" : "tip",
        icon: "bug-outline",
        values: { sunset: { time: sunset }, level: ctx.mosquito },
        notify:
          ctx.mosquito === "high" && future(remind)
            ? { date: today, time: remind }
            : undefined,
      },
      ctx.mosquito === "high" ? 20 : 0,
    );
  }

  const rainToday = daily.precipitation_sum[t] ?? 0;
  if (
    (ctx.rainLast3Days ?? 0) + rainToday >= 50 ||
    (ctx.flood && ctx.flood.level !== "normal")
  ) {
    add(
      {
        id: "treatWater",
        category: "health",
        severity: "warning",
        icon: "water-check",
        values: { rain: Math.round((ctx.rainLast3Days ?? 0) + rainToday) },
        notify: future("07:30") ? { date: today, time: "07:30" } : undefined,
      },
      25,
    );
  }

  const nightLow =
    daily.temperature_2m_min[t + 1] ?? daily.temperature_2m_min[t];
  if (nightLow <= 12) {
    add(
      {
        id: "coldNight",
        category: "health",
        severity: nightLow <= 8 ? "warning" : "tip",
        icon: "snowflake-thermometer",
        values: { low: { temp: nightLow } },
        notify: future("18:00") ? { date: today, time: "18:00" } : undefined,
      },
      12 - nightLow,
    );
  } else if (nightLow >= 25 && current.relative_humidity_2m >= 70) {
    add({
      id: "warmNight",
      category: "health",
      severity: "info",
      icon: "weather-night",
      values: { low: { temp: nightLow } },
    });
  }

  // Best hour to walk or exercise: dry, coolest, low sun — early morning or evening.
  const exercise = ahead(24)
    .filter(({ time }) => {
      const h = hourOf(time);
      return (h >= 5 && h <= 9) || (h >= 16 && h <= 20);
    })
    .filter(
      ({ i }) =>
        (hourly.precipitation_probability[i] ?? 0) < 30 &&
        (hourly.precipitation[i] ?? 0) === 0,
    )
    .map(({ time, i }) => ({
      time,
      score: hourly.apparent_temperature[i] + (hourly.uv_index[i] ?? 0) * 2,
    }))
    .sort((a, b) => a.score - b.score)[0];
  if (exercise) {
    add({
      id: "exercise",
      category: "health",
      severity: "info",
      icon: "run",
      values: {
        time: { time: timeOf(exercise.time) },
        day: exercise.time.startsWith(today) ? "today" : "tomorrow",
      },
    });
  }

  // ── Home ──────────────────────────────────────────────────────────────
  const storm = ahead(18).find(
    ({ i }) =>
      isThunderstorm(hourly.weather_code[i]) &&
      (hourly.precipitation_probability[i] ?? 0) >= 40,
  );
  if (storm) {
    const remind = shiftTime(timeOf(storm.time), -60);
    add(
      {
        id: "lightning",
        category: "home",
        severity: "warning",
        icon: "weather-lightning",
        values: { time: { time: timeOf(storm.time) } },
        notify:
          storm.time.startsWith(today) && future(remind)
            ? { date: today, time: remind }
            : undefined,
      },
      40,
    );
  }

  const maxGust = Math.max(
    0,
    ...ahead(24).map(({ i }) => hourly.wind_gusts_10m[i] ?? 0),
  );
  if (maxGust >= 50) {
    add(
      {
        id: "wind",
        category: "home",
        severity: "warning",
        icon: "home-roof",
        values: { gust: Math.round(maxGust) },
        notify: future("07:00") ? { date: today, time: "07:00" } : undefined,
      },
      maxGust / 5,
    );
  }

  const next36 = ahead(36);
  const rainSoon = next36.reduce(
    (sum, { i }) => sum + (hourly.precipitation[i] ?? 0),
    0,
  );
  const firstRain = next36.find(
    ({ i }) => (hourly.precipitation[i] ?? 0) >= 0.5,
  );
  if (rainSoon >= 10 && firstRain) {
    const remind = shiftTime(timeOf(firstRain.time), -60);
    add(
      {
        id: "rainwater",
        category: "home",
        severity: "tip",
        icon: "water-plus",
        values: {
          mm: Math.round(rainSoon),
          time: { time: timeOf(firstRain.time) },
          day: firstRain.time.startsWith(today) ? "today" : "tomorrow",
          litres: Math.round(rainSoon * 10),
        },
        notify:
          firstRain.time.startsWith(today) && future(remind)
            ? { date: today, time: remind }
            : undefined,
      },
      rainSoon / 2,
    );
  }

  const sunHours = Math.round((daily.sunshine_duration[t] ?? 0) / 3600);
  if (sunHours >= 8) {
    add({
      id: "solarGood",
      category: "home",
      severity: "info",
      icon: "solar-panel",
      values: { hours: sunHours },
    });
  } else if (sunHours <= 3) {
    add({
      id: "solarLow",
      category: "home",
      severity: "tip",
      icon: "battery-charging-30",
      values: { hours: sunHours },
    });
  }

  const drying = buildDryingAdvice(forecast);
  if (drying.status !== "poor") {
    add({
      id: "drying",
      category: "home",
      severity: "info",
      icon: "tshirt-crew-outline",
      values: {
        start: { time: drying.start! },
        end: { time: drying.end! },
        day: drying.day,
      },
    });
  }

  // Best day this week for outdoor plans (weddings, markets, travel).
  const week = daily.time.slice(t + 1, t + 7).map((date, k) => {
    const i = t + 1 + k;
    const score =
      (daily.precipitation_probability_max[i] ?? 50) +
      (daily.precipitation_sum[i] ?? 0) * 2 +
      Math.abs(daily.temperature_2m_max[i] - 28) * 2;
    return { date, i, score };
  });
  const best = week.sort((a, b) => a.score - b.score)[0];
  if (best) {
    const [y, m, d] = best.date.split("-").map(Number);
    add({
      id: "bestDay",
      category: "home",
      severity: "info",
      icon: "calendar-star",
      values: {
        weekday: { weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay() },
        rain: daily.precipitation_probability_max[best.i] ?? 0,
      },
    });
  }

  // ── Travel ────────────────────────────────────────────────────────────
  const rainNext12 = ahead(12).reduce(
    (sum, { i }) => sum + (hourly.precipitation[i] ?? 0),
    0,
  );
  if (rainToday >= 20 || rainNext12 >= 15) {
    add(
      {
        id: "roads",
        category: "travel",
        severity: "warning",
        icon: "road-variant",
        values: { mm: Math.round(Math.max(rainToday, rainNext12)) },
        notify: future("06:30") ? { date: today, time: "06:30" } : undefined,
      },
      15,
    );
  }

  const fog = ahead(18).find(
    ({ i }) => hourly.weather_code[i] === 45 || hourly.weather_code[i] === 48,
  );
  if (fog) {
    add(
      {
        id: "fog",
        category: "travel",
        severity: "tip",
        icon: "weather-fog",
        values: { time: { time: timeOf(fog.time) } },
      },
      5,
    );
  }

  // ── Farm & water ──────────────────────────────────────────────────────
  if (
    ctx.season &&
    (ctx.season.status === "notStarted" ||
      ctx.season.status === "falseStart") &&
    ctx.season.possibleOnsetDate
  ) {
    add(
      {
        id: "seasonSoon",
        category: "farm",
        severity: "tip",
        icon: "sprout",
        values: {
          date: { date: ctx.season.possibleOnsetDate },
          season: ctx.season.season,
        },
      },
      10,
    );
  }

  if (ctx.farmerMode) {
    const farming = buildFarmingAdvice(forecast);
    add({
      id: farming.spray.ok ? "sprayOk" : "sprayWait",
      category: "farm",
      severity: farming.spray.ok ? "info" : "tip",
      icon: "spray",
      values: { reason: farming.spray.reason },
    });
  }

  if (ctx.onWater) {
    const phase = moonPhase();
    if (phase !== "between") {
      add({
        id: phase === "dark" ? "moonDark" : "moonBright",
        category: "farm",
        severity: "info",
        icon: phase === "dark" ? "moon-new" : "moon-full",
        values: {},
      });
    }
  }

  return (insights as Insight[]).sort((a, b) => b.priority - a.priority);
};

// ── Day planner ─────────────────────────────────────────────────────────

export type PlannerRow =
  "rain" | "heat" | "sun" | "mosquito" | "exercise" | "drying";

export interface DayPlan {
  date: string;
  hours: number[]; // local clock hours shown, e.g. 6..21
  rows: Record<PlannerRow, boolean[]>;
  nowHour: number | null;
}

// Hour-by-hour "when to do what" grid for the rest of today (or tomorrow if late).
export const buildDayPlan = (
  forecast: ForecastResponse,
  mosquito: MosquitoLevel,
): DayPlan => {
  const { current, hourly, daily } = forecast;
  const t = todayIndex(daily.time, current.time);
  const late = hourOf(current.time) >= 20;
  const dayIdx = late ? t + 1 : t;
  const date = daily.time[dayIdx];
  const sunriseHour = hourOf(daily.sunrise[dayIdx]);
  const sunsetHour = hourOf(daily.sunset[dayIdx]);
  const hours = Array.from({ length: 16 }, (_, k) => 6 + k);

  const at = (h: number) => hourly.time.indexOf(`${date}T${pad(h)}:00`);
  const row = (test: (i: number, h: number) => boolean) =>
    hours.map((h) => {
      const i = at(h);
      return i >= 0 && test(i, h);
    });

  const dry = (i: number) =>
    (hourly.precipitation_probability[i] ?? 0) < 30 &&
    (hourly.precipitation[i] ?? 0) === 0;

  return {
    date,
    hours,
    nowHour: late ? null : hourOf(current.time),
    rows: {
      rain: row((i) => (hourly.precipitation_probability[i] ?? 0) >= 40),
      heat: row((i) => hourly.apparent_temperature[i] >= 32),
      sun: row((i) => (hourly.uv_index[i] ?? 0) >= 6),
      mosquito: row(
        (_, h) =>
          mosquito !== "low" && (h >= sunsetHour - 1 || h <= sunriseHour + 1),
      ),
      exercise: row(
        (i, h) =>
          dry(i) &&
          hourly.apparent_temperature[i] < 30 &&
          (hourly.uv_index[i] ?? 0) < 6 &&
          h >= sunriseHour &&
          h <= sunsetHour + 1,
      ),
      drying: row(
        (i, h) =>
          dry(i) &&
          h >= sunriseHour + 1 &&
          h < sunsetHour &&
          (hourly.relative_humidity_2m[i] ?? 100) < 80 &&
          ((hourly.sunshine_duration[i] ?? 0) >= 1800 ||
            (hourly.cloud_cover[i] ?? 100) < 60),
      ),
    },
  };
};

// ── Did you know? ───────────────────────────────────────────────────────

/** Picks a fact key that matches today's weather, rotating daily among matches. */
export const pickFact = (
  forecast: ForecastResponse,
  mosquito: MosquitoLevel,
): string => {
  const { current, daily, hourly } = forecast;
  const t = todayIndex(daily.time, current.time);
  const candidates: string[] = [];
  if (
    current.relative_humidity_2m >= 70 &&
    current.apparent_temperature > current.temperature_2m + 2
  )
    candidates.push("humidity");
  if (hourly.weather_code.some(isThunderstorm)) candidates.push("thunder");
  if ((daily.uv_index_max[t] ?? 0) >= 8 && current.cloud_cover >= 50)
    candidates.push("cloudyUv");
  if (
    (daily.precipitation_sum[t] ?? 0) + (daily.precipitation_sum[t + 1] ?? 0) >=
    5
  )
    candidates.push("rainLitres");
  if (mosquito !== "low") candidates.push("mosquitoNight");
  if (daily.temperature_2m_min[t] <= 15) candidates.push("altitude");
  candidates.push("daylight", "dewPoint", "uvMidday");
  const dayOfYear = Math.floor(Date.now() / 86400000);
  return candidates[dayOfYear % candidates.length];
};
