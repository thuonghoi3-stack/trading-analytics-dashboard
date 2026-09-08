# 168 GRID — leaders vs alts, two eras

Interactive 7×24 UTC heatmaps. **Trend leaders** (BTC, ETH, SOL, BNB) and **altcoins** (XRP, ADA, DOGE, AVAX, LINK, DOT, ATOM, LTC, UNI, NEAR) are separate books. Pre-ETF is **not** mixed into Spot ETF.

## Why the split

Hourly BTC means from 2019–2026 blend a different market into the live number. Spot Bitcoin ETFs started **11 Jan 2024**. Mixing the old sample dilutes Prime, Strong, and overlap.

## Sample windows (closed 1h bars)

| Era | UTC range | Hours |
|---|---|---|
| Pre-ETF | 2021-01-01 → 2024-01-10 | 26,505 |
| Spot ETF | 2024-01-11 → 2026-08-26 | 23,016 |

Source: Binance spot USDT klines, `data.binance.vision`, 1h. Equal-weight basket return each UTC hour. `scripts/build-grids.py` rebuilds `src/data/grid.ts` from those zips.

## Verified Spot ETF Prime (Tue–Wed × 13–17 UTC)

| Book | Mean | Win | n |
|---|---|---|
| Leaders | **−0.010%** | 50.3% | 1,096 |
| Alts | **−0.024%** | 49.5% | 1,096 |

Same window **before** the ETF: leaders **+0.044%**, alts **+0.039%**.

BTC is the only leader still green in Prime after the ETF (**+0.008%**). ETH −0.021, SOL −0.010, BNB −0.016. Worst alt Prime: ADA **−0.055%**.

## Other Spot ETF facts from the same bars

- Overlap 13–17 UTC is the weak session: leaders −0.017%, alts −0.010%.
- New York 17–21 UTC stays green: leaders +0.013%, alts +0.007%.
- Alt **Sundays** −0.012%; leaders +0.005%.
- Flow (ordinary weekdays) is still the positive class after the ETF.
- Avoid (weekend × dead zone) mean is not red; σ is still wide. Do not read it as a buy.

Hourly edge is smaller than taker fees. This is a calendar map, not a trade signal.

## Rebuild

```bash
python3 scripts/build-grids.py
```

Requires network once; monthly zips cache under `.cache/klines`.
