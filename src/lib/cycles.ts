export type Session = "asia-open" | "asia-close" | "europe" | "overlap" | "ny" | "dead";
export type Klass = "prime" | "strong" | "flow" | "thin" | "avoid";
export type Tz = "utc" | "vn";
export type Lang = "vi" | "en";
export type Metric = "klass" | "mean" | "win";

export const TZ_OFFSET: Record<Tz, number> = { utc: 0, vn: 7 };
export const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const DOW_VI = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] as const;
export const KLASS: Klass[] = ["prime", "strong", "flow", "thin", "avoid"];
export const SESSIONS: Session[] = ["asia-open", "asia-close", "europe", "overlap", "ny", "dead"];

export function sessionOf(hour: number): Session {
  if (hour < 4) return "asia-open";
  if (hour < 8) return "asia-close";
  if (hour < 13) return "europe";
  if (hour < 17) return "overlap";
  if (hour < 22) return "ny";
  return "dead";
}

export function classify(dow: number, hour: number): Klass {
  const sess = sessionOf(hour);
  const weekend = dow >= 5;
  const tueWed = dow === 1 || dow === 2;
  const monThu = dow === 0 || dow === 3;
  const dead = sess === "dead" || hour <= 1;
  if (weekend && (sess === "dead" || hour <= 1)) return "avoid";
  if (tueWed && sess === "overlap") return "prime";
  if ((tueWed && sess === "europe") || (monThu && sess === "overlap")) return "strong";
  if (weekend || dead) return "thin";
  return "flow";
}

export function nowCell(now: Date, tz: Tz): { dow: number; hour: number } {
  const ms = now.getTime() + TZ_OFFSET[tz] * 3_600_000;
  const shifted = new Date(ms);
  const sun0 = shifted.getUTCDay();
  return { dow: (sun0 + 6) % 7, hour: shifted.getUTCHours() };
}

export function utcNowCell(now: Date): { dow: number; hour: number } {
  return nowCell(now, "utc");
}

export function utcToDisplay(dow: number, hour: number, tz: Tz): { dow: number; hour: number } {
  const shift = TZ_OFFSET[tz];
  let h = hour + shift;
  let d = dow;
  if (h >= 24) {
    h -= 24;
    d = (d + 1) % 7;
  }
  return { dow: d, hour: h };
}

export function displayToUtc(dow: number, hour: number, tz: Tz): { dow: number; hour: number } {
  const shift = TZ_OFFSET[tz];
  let h = hour - shift;
  let d = dow;
  if (h < 0) {
    h += 24;
    d = (d + 6) % 7;
  }
  return { dow: d, hour: h };
}

export function isFundingHour(hour: number): boolean {
  return hour === 0 || hour === 8 || hour === 16;
}

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function formatFund(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(3)}%/8h`;
}

export type FundRegime = "crowd-long" | "reduce" | "wait" | "add" | "crowd-short";

export function fundRegime(ratePct: number): FundRegime {
  if (ratePct > 0.05) return "crowd-long";
  if (ratePct > 0.03) return "reduce";
  if (ratePct < -0.03) return "crowd-short";
  if (ratePct < -0.02) return "add";
  return "wait";
}

export function nextFundingMs(now: Date): number {
  const h = now.getUTCHours();
  const nextH = h < 8 ? 8 : h < 16 ? 16 : 24;
  const t = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    nextH % 24,
    0,
    0,
    0,
  );
  return nextH === 24 ? t + 86_400_000 : t;
}


export function formatRet(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(3)}%`;
}

export function heatBackground(v: number, min: number, max: number, diverging: boolean): string {
  if (diverging) {
    const span = Math.max(Math.abs(min), Math.abs(max), 1e-6);
    const t = Math.min(1, Math.abs(v) / span);
    const token = v >= 0 ? "var(--color-heat-pos)" : "var(--color-heat-neg)";
    return `color-mix(in oklab, ${token} ${Math.round(18 + t * 62)}%, var(--color-surface-2))`;
  }
  const t = (v - min) / Math.max(max - min, 1e-6);
  return `color-mix(in oklab, var(--color-primary) ${Math.round(12 + t * 70)}%, var(--color-surface-2))`;
}

export function klassBackground(k: Klass): string {
  const map: Record<Klass, string> = {
    prime: "color-mix(in oklab, var(--color-primary) 55%, var(--color-surface-2))",
    strong: "color-mix(in oklab, var(--color-primary) 28%, var(--color-surface-2))",
    flow: "var(--color-surface-2)",
    thin: "color-mix(in oklab, var(--color-muted) 22%, var(--color-surface-2))",
    avoid: "color-mix(in oklab, var(--color-heat-neg) 42%, var(--color-surface-2))",
  };
  return map[k];
}

export type LayerNow = {
  session: Session;
  klass: Klass;
  dow: number;
  hour: number;
  weekOfMonth: 1 | 2 | 3 | 4;
  month: number;
  quarter: 1 | 2 | 3 | 4;
  season: "q1" | "q2" | "q3" | "q4";
  halving: "accumulation" | "markup" | "distribution" | "markdown";
  daysAfterHalving: number;
};

export function layersNow(now: Date): LayerNow {
  const utc = utcNowCell(now);
  const day = now.getUTCDate();
  const month = now.getUTCMonth() + 1;
  const weekOfMonth = Math.min(4, Math.ceil(day / 7)) as 1 | 2 | 3 | 4;
  const quarter = (Math.floor((month - 1) / 3) + 1) as 1 | 2 | 3 | 4;
  const season = (`q${quarter}`) as LayerNow["season"];
  const halving = Date.UTC(2024, 3, 19);
  const daysAfterHalving = Math.floor((now.getTime() - halving) / 86_400_000);
  let hPhase: LayerNow["halving"];
  if (daysAfterHalving < -180) hPhase = "accumulation";
  else if (daysAfterHalving < 0) hPhase = "markup";
  else if (daysAfterHalving < 180) hPhase = "distribution";
  else if (daysAfterHalving < 518) hPhase = "distribution";
  else hPhase = "markdown";
  return {
    session: sessionOf(utc.hour),
    klass: classify(utc.dow, utc.hour),
    dow: utc.dow,
    hour: utc.hour,
    weekOfMonth,
    month,
    quarter,
    season,
    halving: hPhase,
    daysAfterHalving,
  };
}
