import { ALTS_GRID } from "./grid-alts";
import { LEADERS_GRID } from "./grid-leaders";

export type Book = "leaders" | "alts";
export type GridSample = "pre" | "etf";
export type GridSlice = {
  n: number;
  from: string;
  to: string;
  mean: ReadonlyArray<ReadonlyArray<number>>;
  win: ReadonlyArray<ReadonlyArray<number>>;
  std: ReadonlyArray<ReadonlyArray<number>>;
  nn: ReadonlyArray<ReadonlyArray<number>>;
  klass: ReadonlyArray<{ k: string; n: number; mean: number; win: number; std: number }>;
  sess: ReadonlyArray<{ k: string; n: number; mean: number; win: number }>;
  dow: ReadonlyArray<{ k: number; n: number; mean: number; win: number }>;
};

export const META = {
  source: "Binance spot USDT 1h (data.binance.vision)",
  leaders: ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"],
  alts: ["XRPUSDT", "ADAUSDT", "DOGEUSDT", "AVAXUSDT", "LINKUSDT", "DOTUSDT", "ATOMUSDT", "LTCUSDT", "UNIUSDT", "NEARUSDT"],
  etfStart: "2024-01-11",
  etfEnd: "2026-08-26",
  preFrom: "2021-01-01",
  note: "Equal-weight basket return each UTC hour. Closed bars only. Pre-ETF is not mixed into Spot ETF.",
} as const;

export const GRID: Record<Book, Record<GridSample, GridSlice>> = {
  leaders: LEADERS_GRID,
  alts: ALTS_GRID,
};
export const SAMPLES: GridSample[] = ["etf", "pre"];
export const BOOKS: Book[] = ["leaders", "alts"];

export function overallMean(slice: GridSlice): number {
  let acc = 0;
  let n = 0;
  for (let d = 0; d < 7; d += 1) {
    const means = slice.mean[d];
    const counts = slice.nn[d];
    if (!means || !counts) continue;
    for (let h = 0; h < 24; h += 1) {
      const nn = counts[h] ?? 0;
      acc += (means[h] ?? 0) * nn;
      n += nn;
    }
  }
  return n === 0 ? 0 : acc / n;
}

export function klassOf(slice: GridSlice, k: string) {
  return slice.klass.find((row) => row.k === k);
}
