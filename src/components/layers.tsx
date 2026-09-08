import { klassOf, overallMean, type GridSlice } from "@/data/grid";
import { t } from "@/lib/copy";
import { DOW, DOW_VI, formatHour, formatRet, type Klass, type Lang, type LayerNow, utcToDisplay, type Tz } from "@/lib/cycles";
import { cn } from "@/lib/utils";

export function LayerStrip({ lang, tz, now }: { lang: Lang; tz: Tz; now: LayerNow }) {
  const c = t(lang);
  const days = lang === "vi" ? DOW_VI : DOW;
  const show = utcToDisplay(now.dow, now.hour, tz);
  const items = [
    { k: c.layerIntraday, v: c.sess[now.session] },
    { k: c.layerWeekly, v: `${days[show.dow]} ${formatHour(show.hour)}` },
    { k: c.layerMonthly, v: c.week[now.weekOfMonth] },
    { k: c.layerSeason, v: c.season[now.season] },
    { k: c.layerHalving, v: `${c.halving[now.halving]} · ${now.daysAfterHalving}d` },
    { k: c.layerMacro, v: "M2 / DXY" },
    { k: c.layerAlt, v: "BTC.D" },
  ];
  return (
    <section className="min-w-0 overflow-hidden rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] md:p-6">
      <h2 className="text-balance font-sans text-2xl font-bold text-fg">{c.layers}</h2>
      <p className="mt-1 font-mono text-xs text-muted">
        {c.klass[now.klass]} · {c.klassHint[now.klass]}
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
        {items.map((it) => (
          <li key={it.k} className="rounded-lg bg-bg px-3 py-3">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">{it.k}</p>
            <p className="mt-2 font-sans text-sm font-semibold text-fg">{it.v}</p>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <p className="text-pretty font-mono text-xs leading-relaxed text-muted">{c.macro}</p>
        <p className="text-pretty font-mono text-xs leading-relaxed text-muted">{c.alt}</p>
      </div>
    </section>
  );
}

export function KlassCards({
  lang,
  filter,
  onFilter,
  slice,
}: {
  lang: Lang;
  filter: string;
  onFilter: (k: string) => void;
  slice: GridSlice;
}) {
  const c = t(lang);
  const keys = ["all", "prime", "strong", "flow", "thin", "avoid"] as const;
  const overall = overallMean(slice);
  return (
    <div className="flex flex-wrap gap-2">
      {keys.map((k) => {
        const on = filter === k;
        const mean = k === "all" ? overall : klassOf(slice, k)?.mean;
        return (
          <button
            key={k}
            type="button"
            data-on={on}
            onClick={() => onFilter(k)}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full bg-surface-2 px-4 font-mono text-sm text-muted shadow-[var(--shadow-border)] data-[on=true]:bg-primary data-[on=true]:text-bg data-[on=true]:shadow-none",
            )}
          >
            {k === "all" ? c.all : c.klass[k as Klass]}
            {mean !== undefined ? (
              <span
                className={cn(
                  "ml-2 tabular-nums",
                  on ? "text-bg" : mean >= 0 ? "text-heat-pos" : "text-heat-neg",
                )}
              >
                {formatRet(mean)}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
