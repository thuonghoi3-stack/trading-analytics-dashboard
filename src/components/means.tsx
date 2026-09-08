import { GRID, klassOf, overallMean, type GridSample, type GridSlice } from "@/data/grid";
import { COINS } from "@/data/coins";
import { t } from "@/lib/copy";
import { DOW, DOW_VI, formatRet, KLASS, type Lang, type Session } from "@/lib/cycles";
import { cn } from "@/lib/utils";

export function MeansPanel({
  lang,
  sample,
  leaders,
  alts,
}: {
  lang: Lang;
  sample: GridSample;
  leaders: GridSlice;
  alts: GridSlice;
}) {
  const c = t(lang);
  const days = lang === "vi" ? DOW_VI : DOW;
  const other: GridSample = sample === "etf" ? "pre" : "etf";
  const lPrime = klassOf(leaders, "prime")!.mean;
  const aPrime = klassOf(alts, "prime")!.mean;
  const lPrimeOther = klassOf(GRID.leaders[other], "prime")!.mean;
  const aPrimeOther = klassOf(GRID.alts[other], "prime")!.mean;

  return (
    <section className="min-w-0 overflow-hidden rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-balance font-sans text-2xl font-bold text-fg">{c.meanRecalc}</h2>
          <p className="mt-1 max-w-2xl text-pretty font-mono text-xs leading-relaxed text-muted">{c.meanRecalcHint}</p>
        </div>
        <p className="font-mono text-xs text-muted">
          {sample === "etf" ? c.sampleEtf : c.samplePre} · {leaders.from} → {leaders.to}
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="grid min-w-lg grid-cols-3 gap-px">
          <div className="px-2 py-2 font-mono text-xs uppercase tracking-widest text-muted">{c.metricKlass}</div>
          <div className="bg-surface-2 px-2 py-2 font-mono text-xs uppercase tracking-widest text-fg">{c.bookLeaders}</div>
          <div className="bg-surface-2 px-2 py-2 font-mono text-xs uppercase tracking-widest text-fg">{c.bookAlts}</div>
          {KLASS.map((k) => {
            const L = klassOf(leaders, k)!;
            const A = klassOf(alts, k)!;
            return (
              <KlassPair key={k} label={c.klass[k]} left={L} right={A} />
            );
          })}
        </div>
      </div>

      <p className="mt-4 font-mono text-xs leading-relaxed text-muted">
        Prime {c.bookLeaders} {sample === "etf" ? c.samplePre : c.sampleEtf} {formatRet(lPrimeOther)} →{" "}
        {sample === "etf" ? c.sampleEtf : c.samplePre} {formatRet(lPrime)}. {c.bookAlts} {formatRet(aPrimeOther)} →{" "}
        {formatRet(aPrime)}. {c.feeNote}
      </p>

      <h3 className="mt-6 font-sans text-lg font-bold text-fg">{c.coins}</h3>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {Object.entries(COINS).map(([sym, row]) => {
          const prime = row[sample].klass.prime.mean;
          return (
            <div key={sym} className="rounded-lg bg-bg px-3 py-3">
              <p className="font-mono text-xs uppercase tracking-widest text-muted">{sym.replace("USDT", "")}</p>
              <p className="mt-2 font-mono text-sm tabular-nums">
                <Signed v={prime} />
              </p>
              <p className="mt-1 font-mono text-xs text-muted">{row.book === "leaders" ? c.bookLeaders : c.bookAlts}</p>
            </div>
          );
        })}
      </div>

      <h3 className="mt-6 font-sans text-lg font-bold text-fg">{c.sessMeans}</h3>
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {leaders.sess.map((row, i) => {
          const alt = alts.sess[i]!;
          return (
            <MiniPair
              key={row.k}
              label={c.sess[row.k as Session]}
              left={row.mean}
              right={alt.mean}
              leftWin={row.win}
              rightWin={alt.win}
            />
          );
        })}
      </div>

      <h3 className="mt-6 font-sans text-lg font-bold text-fg">{c.dowMeans}</h3>
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
        {leaders.dow.map((row, i) => {
          const alt = alts.dow[i]!;
          return (
            <MiniPair
              key={row.k}
              label={days[row.k]!}
              left={row.mean}
              right={alt.mean}
              leftWin={row.win}
              rightWin={alt.win}
            />
          );
        })}
      </div>

      <p className="mt-4 font-mono text-xs text-muted">
        {c.all}: {c.bookLeaders} <Signed v={overallMean(leaders)} /> · {c.bookAlts} <Signed v={overallMean(alts)} />
      </p>
    </section>
  );
}

function KlassPair({
  label,
  left,
  right,
}: {
  label: string;
  left: { mean: number; win: number; n: number };
  right: { mean: number; win: number; n: number };
}) {
  return (
    <>
      <div className="flex items-center px-2 py-3 font-mono text-sm text-fg">{label}</div>
      <Cell mean={left.mean} win={left.win} n={left.n} />
      <Cell mean={right.mean} win={right.win} n={right.n} />
    </>
  );
}

function Cell({ mean, win, n }: { mean: number; win: number; n: number }) {
  return (
    <div className="flex flex-col justify-center rounded-sm bg-surface-2 px-2 py-3">
      <Signed v={mean} />
      <span className="mt-1 font-mono text-xs text-muted">
        {win.toFixed(1)}% · n={n.toLocaleString()}
      </span>
    </div>
  );
}

function MiniPair({
  label,
  left,
  right,
  leftWin,
  rightWin,
}: {
  label: string;
  left: number;
  right: number;
  leftWin: number;
  rightWin: number;
}) {
  return (
    <div className="rounded-lg bg-bg px-3 py-3">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-2 font-mono text-xs tabular-nums">
        L <Signed v={left} />
      </p>
      <p className="mt-1 font-mono text-xs tabular-nums">
        A <Signed v={right} />
      </p>
      <p className="mt-1 font-mono text-xs text-muted">
        {leftWin.toFixed(0)}/{rightWin.toFixed(0)}
      </p>
    </div>
  );
}

function Signed({ v }: { v: number }) {
  return <span className={cn("tabular-nums", v >= 0 ? "text-heat-pos" : "text-heat-neg")}>{formatRet(v)}</span>;
}
