import { type GridSlice } from "@/data/grid";
import { t } from "@/lib/copy";
import {
  classify,
  formatHour,
  heatBackground,
  klassBackground,
  isFundingHour,
  utcToDisplay,
  type Klass,
  type Lang,
  type Metric,
  type Tz,
} from "@/lib/cycles";
import { cn } from "@/lib/utils";

export function HeatGrid({
  lang,
  tz,
  metric,
  filter,
  live,
  pinned,
  onPin,
  slice,
  title,
  hint,
  scale,
}: {
  lang: Lang;
  tz: Tz;
  metric: Metric;
  filter: Klass | "all";
  live: { dow: number; hour: number };
  pinned: { dow: number; hour: number } | null;
  onPin: (cell: { dow: number; hour: number }) => void;
  slice: GridSlice;
  title: string;
  hint: string;
  scale: { min: number; max: number; wmin: number; wmax: number };
}) {
  const c = t(lang);
  const days = lang === "vi" ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const displayLive = utcToDisplay(live.dow, live.hour, tz);

  return (
    <section className="min-w-0 overflow-hidden rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-balance font-sans text-2xl font-bold text-fg">{title}</h2>
          <p className="mt-1 font-mono text-xs text-muted">{hint}</p>
        </div>
        <p className="font-mono text-xs text-muted">
          {slice.from} → {slice.to} · n={slice.n.toLocaleString()}
        </p>
      </div>
      <p className="mt-2 font-mono text-xs text-muted">{c.gridHint}</p>
      <div className="mt-4 min-w-0 overflow-x-auto">
        <div className="grid w-full min-w-0 grid-cols-8 gap-px">
          <div />
          {days.map((d) => (
            <div key={d} className="py-2 text-center font-mono text-xs text-muted">
              {d}
            </div>
          ))}
          {Array.from({ length: 24 }, (_, hour) => {
            const utcHour = tz === "utc" ? hour : (hour - 7 + 24) % 24;
            return (
              <HourRow
                key={hour}
                label={formatHour(hour)}
                utcHour={utcHour}
                wrapDow={tz === "vn" && hour < 7}
                metric={metric}
                filter={filter}
                min={scale.min}
                max={scale.max}
                wmin={scale.wmin}
                wmax={scale.wmax}
                live={displayLive}
                pinned={pinned ? utcToDisplay(pinned.dow, pinned.hour, tz) : null}
                onPin={onPin}
                slice={slice}
              />
            );
          }).flat()}
        </div>
      </div>
    </section>
  );
}

function HourRow({
  label,
  utcHour,
  wrapDow,
  metric,
  filter,
  min,
  max,
  wmin,
  wmax,
  live,
  pinned,
  onPin,
  slice,
}: {
  label: string;
  utcHour: number;
  wrapDow: boolean;
  metric: Metric;
  filter: Klass | "all";
  min: number;
  max: number;
  wmin: number;
  wmax: number;
  live: { dow: number; hour: number };
  pinned: { dow: number; hour: number } | null;
  onPin: (cell: { dow: number; hour: number }) => void;
  slice: GridSlice;
}) {
  return (
    <>
      <div className={cn("flex items-center font-mono text-xs", isFundingHour(utcHour) ? "text-primary" : "text-muted")}>
        {label}
        {isFundingHour(utcHour) ? " F" : ""}
      </div>
      {Array.from({ length: 7 }, (_, displayDow) => {
        const utcDow = wrapDow ? (displayDow + 6) % 7 : displayDow;
        const k = classify(utcDow, utcHour);
        const dim = filter !== "all" && filter !== k;
        const mean = slice.mean[utcDow]![utcHour]!;
        const win = slice.win[utcDow]![utcHour]!;
        const isLive = live.dow === displayDow && live.hour === Number(label.slice(0, 2));
        const isPin = pinned?.dow === displayDow && pinned.hour === Number(label.slice(0, 2));
        let bg: string;
        if (metric === "klass") bg = klassBackground(k);
        else if (metric === "mean") bg = heatBackground(mean, min, max, true);
        else bg = heatBackground(win, wmin, wmax, false);
        return (
          <button
            key={displayDow}
            type="button"
            onClick={() => onPin({ dow: utcDow, hour: utcHour })}
            className={cn(
              "flex min-h-11 min-w-0 items-center justify-center rounded-sm px-0.5 font-mono text-xs tabular-nums text-fg",
              dim && "opacity-25",
              isLive && "ring-2 ring-primary",
              isPin && !isLive && "ring-1 ring-fg",
            )}
            style={{ background: bg }}
            aria-label={`${label} ${k} ${mean.toFixed(3)}`}
          >
            {metric === "klass" ? k[0]!.toUpperCase() : metric === "mean" ? mean.toFixed(3) : `${win.toFixed(0)}`}
          </button>
        );
      })}
    </>
  );
}
