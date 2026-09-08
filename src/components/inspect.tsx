import { type GridSlice } from "@/data/grid";
import { t } from "@/lib/copy";
import {
  classify,
  DOW,
  DOW_VI,
  formatHour,
  formatRet,
  isFundingHour,
  sessionOf,
  utcToDisplay,
  type Klass,
  type Lang,
  type Tz,
} from "@/lib/cycles";
import { cn } from "@/lib/utils";

export function Inspect({
  lang,
  tz,
  cell,
  leaders,
  alts,
}: {
  lang: Lang;
  tz: Tz;
  cell: { dow: number; hour: number };
  leaders: GridSlice;
  alts: GridSlice;
}) {
  const c = t(lang);
  const days = lang === "vi" ? DOW_VI : DOW;
  const show = utcToDisplay(cell.dow, cell.hour, tz);
  const k = classify(cell.dow, cell.hour);
  const sess = sessionOf(cell.hour);
  const lMean = leaders.mean[cell.dow]![cell.hour]!;
  const aMean = alts.mean[cell.dow]![cell.hour]!;
  const spread = aMean - lMean;
  return (
    <section className="min-w-0 overflow-hidden rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] md:p-6">
      <h2 className="text-balance font-sans text-2xl font-bold text-fg">{c.inspect}</h2>
      <p className="mt-1 font-mono text-xs text-muted">
        {days[show.dow]} {formatHour(show.hour)} · UTC {formatHour(cell.hour)} · {c.sess[sess]}
        {isFundingHour(cell.hour) ? ` · ${c.fundHourNow}` : ""} · {leaders.from} → {leaders.to}
      </p>
      <p className="mt-3 font-sans text-3xl font-bold text-primary">{c.klass[k]}</p>
      <p className="mt-2 max-w-xl text-pretty font-mono text-xs leading-relaxed text-muted">{c.klassHint[k]}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <BookStats
          title={c.bookLeaders}
          mean={lMean}
          win={leaders.win[cell.dow]![cell.hour]!}
          n={leaders.nn[cell.dow]![cell.hour]!}
          std={leaders.std[cell.dow]![cell.hour]!}
          agg={leaders.klass.find((x) => x.k === k)}
          classLabel={c.klass[k as Klass]}
          classAgg={c.classAgg}
          labels={{ mean: c.mean, win: c.win, n: c.n, std: c.std }}
        />
        <BookStats
          title={c.bookAlts}
          mean={aMean}
          win={alts.win[cell.dow]![cell.hour]!}
          n={alts.nn[cell.dow]![cell.hour]!}
          std={alts.std[cell.dow]![cell.hour]!}
          agg={alts.klass.find((x) => x.k === k)}
          classLabel={c.klass[k as Klass]}
          classAgg={c.classAgg}
          labels={{ mean: c.mean, win: c.win, n: c.n, std: c.std }}
        />
      </div>
      <p className="mt-4 font-mono text-sm tabular-nums">
        {c.spread}:{" "}
        <span className={cn(spread >= 0 ? "text-heat-pos" : "text-heat-neg")}>{formatRet(spread)}</span>
      </p>
    </section>
  );
}

function BookStats({
  title,
  mean,
  win,
  n,
  std,
  agg,
  classLabel,
  classAgg,
  labels,
}: {
  title: string;
  mean: number;
  win: number;
  n: number;
  std: number;
  agg?: { mean: number; win: number; n: number };
  classLabel: string;
  classAgg: string;
  labels: { mean: string; win: string; n: string; std: string };
}) {
  return (
    <div className="rounded-lg bg-bg p-4">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">{title}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat label={labels.mean} value={formatRet(mean)} />
        <Stat label={labels.win} value={`${win.toFixed(1)}%`} />
        <Stat label={labels.n} value={String(n)} />
        <Stat label={labels.std} value={`${std.toFixed(2)}%`} />
      </div>
      {agg ? (
        <p className="mt-3 font-mono text-xs text-muted">
          {classAgg}: {classLabel} · {formatRet(agg.mean)} · win {agg.win}% · n={agg.n.toLocaleString()}
        </p>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-xs text-muted">{label}</p>
      <p className="mt-1 font-mono text-xl tabular-nums text-fg">{value}</p>
    </div>
  );
}
