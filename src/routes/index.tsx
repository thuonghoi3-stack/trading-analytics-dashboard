import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FundingPanel } from "@/components/funding";
import { HeatGrid } from "@/components/heatmap";
import { Inspect } from "@/components/inspect";
import { KlassCards, LayerStrip } from "@/components/layers";
import { MeansPanel } from "@/components/means";
import { Button } from "@/components/ui/button";
import { GRID, META, type GridSample } from "@/data/grid";
import { t } from "@/lib/copy";
import {
  layersNow,
  utcNowCell,
  type Klass,
  type Lang,
  type Metric,
  type Tz,
} from "@/lib/cycles";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [lang, setLang] = useState<Lang>("vi");
  const [tz, setTz] = useState<Tz>("vn");
  const [metric, setMetric] = useState<Metric>("mean");
  const [sample, setSample] = useState<GridSample>("etf");
  const [filter, setFilter] = useState<Klass | "all">("all");
  const [now, setNow] = useState(() => new Date());
  const [pinned, setPinned] = useState<{ dow: number; hour: number } | null>(null);
  const live = useMemo(() => utcNowCell(now), [now]);
  const layers = useMemo(() => layersNow(now), [now]);
  const view = pinned ?? live;
  const leaders = GRID.leaders[sample];
  const alts = GRID.alts[sample];
  const c = t(lang);
  const scale = useMemo(() => {
    const means = [...leaders.mean.flat(), ...alts.mean.flat()];
    const wins = [...leaders.win.flat(), ...alts.win.flat()];
    return {
      min: Math.min(...means),
      max: Math.max(...means),
      wmin: Math.min(...wins),
      wmax: Math.max(...wins),
    };
  }, [leaders, alts]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("168-lang");
    if (stored === "en" || stored === "vi") setLang(stored);
    const storedTz = window.localStorage.getItem("168-tz");
    if (storedTz === "utc" || storedTz === "vn") setTz(storedTz);
    const storedSample = window.localStorage.getItem("168-sample");
    if (storedSample === "pre" || storedSample === "etf") setSample(storedSample);
  }, []);
  useEffect(() => {
    window.localStorage.setItem("168-lang", lang);
  }, [lang]);
  useEffect(() => {
    window.localStorage.setItem("168-tz", tz);
  }, [tz]);
  useEffect(() => {
    window.localStorage.setItem("168-sample", sample);
  }, [sample]);

  return (
    <main className="min-h-dvh overflow-x-hidden bg-bg text-fg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">{c.kicker}</p>
              <h1 className="mt-2 flex items-baseline gap-3 text-balance font-sans text-5xl font-extrabold text-fg md:text-6xl">
                {c.wordmark}
                <span className="text-2xl font-bold tracking-widest text-primary md:text-3xl">{c.sub}</span>
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted">{c.lead}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="chip" data-on={lang === "vi"} aria-pressed={lang === "vi"} onClick={() => setLang("vi")}>
                VI
              </Button>
              <Button variant="chip" data-on={lang === "en"} aria-pressed={lang === "en"} onClick={() => setLang("en")}>
                EN
              </Button>
              <Button variant="chip" data-on={tz === "vn"} aria-pressed={tz === "vn"} onClick={() => setTz("vn")}>
                {c.tzVn}
              </Button>
              <Button variant="chip" data-on={tz === "utc"} aria-pressed={tz === "utc"} onClick={() => setTz("utc")}>
                {c.tzUtc}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="chip" data-on={sample === "etf"} onClick={() => setSample("etf")}>
              {c.sampleEtf}
            </Button>
            <Button variant="chip" data-on={sample === "pre"} onClick={() => setSample("pre")}>
              {c.samplePre}
            </Button>
            <Button variant="chip" data-on={metric === "klass"} onClick={() => setMetric("klass")}>
              {c.metricKlass}
            </Button>
            <Button variant="chip" data-on={metric === "mean"} onClick={() => setMetric("mean")}>
              {c.metricMean}
            </Button>
            <Button variant="chip" data-on={metric === "win"} onClick={() => setMetric("win")}>
              {c.metricWin}
            </Button>
          </div>
          <KlassCards lang={lang} filter={filter} onFilter={(k) => setFilter(k === "all" ? "all" : (k as Klass))} slice={leaders} />
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-10">
        <MeansPanel lang={lang} sample={sample} leaders={leaders} alts={alts} />
        <LayerStrip lang={lang} tz={tz} now={layers} />
        <Inspect lang={lang} tz={tz} cell={view} leaders={leaders} alts={alts} />
        <HeatGrid
          lang={lang}
          tz={tz}
          metric={metric}
          filter={filter}
          live={live}
          pinned={pinned}
          onPin={(cell) => setPinned((p) => (p && p.dow === cell.dow && p.hour === cell.hour ? null : cell))}
          slice={leaders}
          title={c.bookLeaders}
          hint={c.bookLeadersHint}
          scale={scale}
        />
        <HeatGrid
          lang={lang}
          tz={tz}
          metric={metric}
          filter={filter}
          live={live}
          pinned={pinned}
          onPin={(cell) => setPinned((p) => (p && p.dow === cell.dow && p.hour === cell.hour ? null : cell))}
          slice={alts}
          title={c.bookAlts}
          hint={c.bookAltsHint}
          scale={scale}
        />
        <FundingPanel lang={lang} now={now} hour={live.hour} />
        <footer className="pb-8 font-mono text-xs leading-relaxed text-muted">
          {c.source}: {META.source} · {META.etfStart} → {META.etfEnd} · {c.disclaimer}
        </footer>
      </div>
    </main>
  );
}
