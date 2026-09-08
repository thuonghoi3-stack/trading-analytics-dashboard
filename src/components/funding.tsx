import { useEffect, useState } from "react";
import { FUND } from "@/data/fund";
import { t } from "@/lib/copy";
import {
  formatFund,
  formatHour,
  formatRet,
  fundRegime,
  isFundingHour,
  nextFundingMs,
  type Lang,
} from "@/lib/cycles";
import { cn } from "@/lib/utils";

export function FundingPanel({ lang, now, hour }: { lang: Lang; now: Date; hour: number }) {
  const c = t(lang);
  const [live, setLive] = useState<number>(FUND.live.rate);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  useEffect(() => {
    fetch("https://www.okx.com/api/v5/public/funding-rate?instId=BTC-USDT-SWAP")
      .then((r) => r.json())
      .then((j: { data?: Array<{ fundingRate: string }> }) => {
        const v = j.data?.[0]?.fundingRate;
        if (v) setLive(Number(v) * 100);
      })
      .catch(() => {});
  }, []);
  const remain = Math.max(0, nextFundingMs(now) - now.getTime());
  const regime = fundRegime(live);
  const ann = live * 3 * 365;
  const hh = Math.floor(remain / 3_600_000);
  const mm = Math.floor((remain % 3_600_000) / 60_000);
  const ss = Math.floor((remain % 60_000) / 1000);
  const clock = `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  const spark = FUND.spark.slice(-36);
  const sparkMax = Math.max(...spark.map((s) => Math.abs(s.mean)), 0.001);
  const pathMax = Math.max(...FUND.path.map((p) => Math.abs(p.mean)), 0.001);

  return (
    <section className="min-w-0 overflow-hidden rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] md:p-6">
      <h2 className="font-sans text-2xl font-bold text-fg">{c.fund}</h2>
      <p className="mt-1 max-w-2xl font-mono text-xs text-muted">{c.fundLead}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label={c.fundNow} value={formatFund(live)} hot={regime !== "wait"} />
        <Stat label={c.fundAnn} value={`${ann >= 0 ? "+" : ""}${ann.toFixed(1)}%`} />
        <Stat
          label={c.fundNext}
          value={ready ? clock : "—"}
        />
        <Stat label={c.fundRule} value={c.regime[regime]} hot={regime !== "wait"} />
      </div>
      <p className="mt-3 font-mono text-xs text-muted">
        {isFundingHour(hour) ? c.fundHourNow : c.fundHourOff} · {c.fundLiveNote}
      </p>

      <h3 className="mt-6 font-sans text-lg font-bold text-fg">{c.fundPath}</h3>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {FUND.path.map((p) => {
          const mag = Math.abs(p.mean) / pathMax;
          return (
            <div key={p.off} className="flex min-h-11 flex-col items-center justify-end rounded-md bg-bg px-1 py-2">
              <div
                className={cn("w-full rounded-sm", p.mean >= 0 ? "bg-heat-pos" : "bg-heat-neg")}
                style={{ height: `${Math.round(8 + mag * 28)}px` }}
              />
              <span className="mt-1 font-mono text-xs text-muted">t{p.off >= 0 ? `+${p.off}` : p.off}</span>
              <span className={cn("font-mono text-xs tabular-nums", p.mean >= 0 ? "text-primary" : "text-heat-neg")}>
                {p.mean.toFixed(3)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 font-mono text-xs text-muted">{c.fundPathHint}</p>

      <h3 className="mt-6 font-sans text-lg font-bold text-fg">{c.fundRules}</h3>
      <div className="mt-3 grid min-w-0 gap-3 md:grid-cols-2">
        {FUND.rules.map((r) => (
          <div key={r.k} className="rounded-lg bg-bg p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">{c.ruleK[r.k as keyof typeof c.ruleK] ?? r.k}</p>
            <p className={cn("mt-2 font-mono text-2xl tabular-nums", r.r8 >= 0 ? "text-primary" : "text-heat-neg")}>
              {formatRet(r.r8)} <span className="text-sm text-muted">/ 8h</span>
            </p>
            <p className="mt-2 font-mono text-xs text-muted">
              n={r.n.toLocaleString()} · win {r.win8}% · print {formatRet(r.r0)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-lg bg-bg p-4">
          <h3 className="font-sans text-base font-bold text-fg">{c.fundYear}</h3>
          <div className="mt-3 min-w-0 overflow-x-auto">
            <table className="w-max min-w-full text-left font-mono text-xs">
              <thead className="text-muted">
                <tr>
                  <th className="py-2 pr-3 font-medium">{c.fundY}</th>
                  <th className="py-2 pr-3 font-medium">{c.fundAvg}</th>
                  <th className="py-2 pr-3 font-medium">{c.fundHi}</th>
                  <th className="py-2 font-medium">{c.fundR8}</th>
                </tr>
              </thead>
              <tbody>
                {FUND.years.map((y) => (
                  <tr key={y.y} className="border-t border-border">
                    <td className="py-3 pr-3 text-fg">{y.y}</td>
                    <td className="py-3 pr-3 tabular-nums text-muted">{formatFund(y.mean_rate)}</td>
                    <td className="py-3 pr-3 tabular-nums text-fg">{y.hi03.toFixed(0)}%</td>
                    <td className={cn("py-3 tabular-nums", y.r8 >= 0 ? "text-primary" : "text-heat-neg")}>
                      {formatRet(y.r8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="min-w-0 rounded-lg bg-bg p-4">
          <h3 className="font-sans text-base font-bold text-fg">{c.fundClass}</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {FUND.byk.map((s) => (
              <li key={s.k} className="flex items-center gap-2">
                <span className="w-16 shrink-0 font-mono text-xs text-muted">{c.klass[s.k as keyof typeof c.klass]}</span>
                <span className="flex-1 font-mono text-xs text-muted">
                  {c.fundHi} {s.n_hi}
                  {s.r8_hi != null ? ` → ${formatRet(s.r8_hi)}` : ""}
                </span>
                <span className={cn("font-mono text-xs tabular-nums", (s.r8 ?? 0) >= 0 ? "text-primary" : "text-heat-neg")}>
                  {s.r8 == null ? "—" : formatRet(s.r8)}
                </span>
              </li>
            ))}
          </ul>
          <h3 className="mt-5 font-sans text-base font-bold text-fg">{c.fundSpark}</h3>
          <div className="mt-3 flex h-16 items-end gap-px">
            {spark.map((s) => (
              <div
                key={s.t}
                className="min-w-0 flex-1 rounded-sm bg-primary"
                style={{ height: `${Math.max(8, Math.round((Math.abs(s.mean) / sparkMax) * 100))}%`, opacity: 0.45 + 0.55 * (Math.abs(s.mean) / sparkMax) }}
                title={`${s.t} ${s.mean}`}
              />
            ))}
          </div>
          <p className="mt-2 font-mono text-xs text-muted">
            {spark[0]?.t} → {spark[spark.length - 1]?.t}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {FUND.byh.map((h) => (
          <div key={h.h} className="rounded-lg bg-bg px-3 py-3">
            <p className="font-mono text-xs text-muted">UTC {formatHour(h.h)}</p>
            <p className={cn("mt-1 font-mono text-lg tabular-nums", h.r0 >= 0 ? "text-primary" : "text-heat-neg")}>
              {formatRet(h.r0)}
            </p>
            <p className="font-mono text-xs text-muted">8h {formatRet(h.r8)}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-xs leading-relaxed text-muted">{c.fundHint}</p>
    </section>
  );
}

function Stat({ label, value, hot }: { label: string; value: string; hot?: boolean }) {
  return (
    <div className="rounded-lg bg-bg px-3 py-3">
      <p className="font-mono text-xs text-muted">{label}</p>
      <p className={cn("mt-1 font-mono text-xl tabular-nums", hot ? "text-heat-neg" : "text-fg")}>{value}</p>
    </div>
  );
}
