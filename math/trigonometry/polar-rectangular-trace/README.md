# Polar / Rectangular Trace

**Handle:** `math/trigonometry/polar-rectangular-trace`
**Topic:** AP Precalculus 3.15 — Rates of Change in Polar Functions
**Pedagogical anchor:** synced θ-scrubber animation showing rectangular `r vs θ` (left) and the polar curve (right). As θ scrubs, both views animate; markers move in lockstep; the trace builds incrementally with sign-aware coloring (navy where r ≥ 0, coral where r < 0). Surfaces the negative-r trap — r decreasing while distance from pole is increasing — that students consistently miss.

## Curves

A fixed library of five. No parameter sliders — parameter exploration lives in Applets 1 and 2.

| # | Equation | Domain | Pedagogical role |
|---|---|---|---|
| a | `r = 6 sin(3θ)` | `[0, 2π]` | Odd-petal rose. Goes negative and retraces. |
| b | `r = 1 + 3 cos(θ)` | `[0, 2π]` | Inner-loop limaçon. Cleanest "r decreasing while \|r\| increasing" example. |
| c | `r = 4 + 2 sin(θ)` | `[0, 2π]` | Dimpled cardioid. Tame counterpoint; r > 0 throughout. |
| d | `r = 3 sin(2θ)` | `[0, 2π]` | Even-petal rose. Full domain cycle. |
| e | `r = θ` | `[0, 4π]` | Archimedes' spiral. Monotonically increasing. |

## Controls

- **Curve dropdown** — selects one of the five curves above.
- **θ scrubber** — drag to set θ. Step 0.01 rad. Range matches the selected curve's domain. Dragging while play is active pauses play.
- **Play / Pause** — animates θ across the full domain.
- **Speed selector** — 0.5×, 1×, 2×. At 1× the full domain sweeps in 8 seconds.
- **Reset** — returns θ to 0 and clears the trace for the current curve.
- **Radial line toggle** — dashed grey line from pole to current marker. Default ON. Visualizes \|r\| as a length.

## Readouts

- **θ** in radians, plus a cleaned π-fraction when one exists (e.g., `2.094 rad ≈ 2π/3`).
- **r** to 3 decimals.
- **\|r\|** to 3 decimals, labeled "distance from pole."
- **Sign indicator** — bold large `r > 0` (navy), `r < 0` (coral), or `r = 0 (at pole)` (grey).
- **Behavior banner** — two lines: r is increasing / decreasing / at extremum, and distance from pole is increasing / decreasing / at extremum / at the pole. Detected via central difference over a 0.05-rad window with a 0.02 dead-zone for extremum and 0.01 for "at pole."

## Files

- `index.html` — page structure
- `styles.css` — layout, palette, mobile fallback
- `app.js` — curve definitions, animation loop, dual-canvas drawing, sign-aware tracing
- `README.md` — this file

No external libraries. No CDN. Vanilla HTML5 + Canvas 2D, per Applet_Creation_v4 §7.

## Local test (Applet_Creation_v4 §7.5 checklist)

Open `index.html` in a browser via `file://` (no server needed) and verify:

- Curve dropdown: switch through all five — each loads cleanly, scrubber max updates, trace clears.
- Scrubber: drag from 0 to end on each curve. Trace builds. Drag back: trace stays. Drag forward past previous max: trace extends.
- Play / Pause: at 1×, full domain in ~8 sec. At 0.5×, ~16 sec. At 2×, ~4 sec.
- Reset: clears trace, scrubber to 0.
- Radial toggle: dashed line appears/disappears.
- Sign coloring: on rose3 and rose2 — alternating navy/coral petals on polar plot, wave goes above/below zero on rect plot.
- Limaçon (curve b): watch the inner loop. As θ moves through the zeros (≈ 0.608π and ≈ 1.392π) the marker passes through the pole and the trace color flips.
- Spiral: monotonically extending, all navy. r-axis shows π-notation ticks (0, π, 2π, 3π, 4π).
- Mobile: open at narrow width — canvases stack vertically, scrubber stretches full width. Touch-drag the scrubber.
- Leave running 60 sec untouched — no drift.
- Drag the scrubber rapidly back and forth for 10 sec — no flicker, no leak.

## Deploy path

```
C:\Dev\frohlich-math-physics\math\trigonometry\polar-rectangular-trace
```

Public URL after Netlify deploys (~30 s):

```
https://frohlich-math-physics.netlify.app/math/trigonometry/polar-rectangular-trace/
```

## Catalog entry (add to Applet_Creation §4)

| Handle | URL | Serves | Last updated | Status |
|---|---|---|---|---|
| math/trigonometry/polar-rectangular-trace | https://frohlich-math-physics.netlify.app/math/trigonometry/polar-rectangular-trace/ | AP Precalculus 3.15 (Rates of Change in Polar Functions); supports IB MAA HL polar work | 2026-05-05 | Live |
