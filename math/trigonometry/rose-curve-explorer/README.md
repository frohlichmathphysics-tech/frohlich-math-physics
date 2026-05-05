# Rose Curve Explorer

**Handle:** `math/trigonometry/rose-curve-explorer`
**Public URL (after deploy):** `https://frohlich-math-physics.netlify.app/math/trigonometry/rose-curve-explorer/`

## What it does

Slider-driven exploration of polar rose curves of the form

```
r = ± a · trig(n · θ)
```

where `trig ∈ {sin, cos}`, `a ∈ [0.5, 10]` step 0.5, and `n ∈ {1, 2, …, 8}`.

The pedagogical anchor is the **petal-count rule**:

- **n odd  → n petals** (curve completes in `[0, π]`, retraces in `[π, 2π]`)
- **n even → 2n petals** (curve uses the full `[0, 2π]` to draw)

The Trace button replays the curve point-by-point over ~3 seconds across the
full `[0, 2π]` domain — the retrace for odd `n` becomes visible as the second
half of the trace draws over the first half.

## Controls

| Control      | Range / values                | Default |
|--------------|-------------------------------|---------|
| Amplitude `a`| 0.5 – 10, step 0.5            | 4       |
| Frequency `n`| 1 – 8, integer                | 3       |
| Trig         | `cos` / `sin`                 | `cos`   |
| Sign         | `+` / `−`                     | `+`     |
| Trace        | redraws curve over ~3 s        | —       |

Any parameter change cancels an in-progress trace and snaps back to the full
curve. The Trace button stays enabled at all times and is re-runnable.

## Readouts

- **Petals** — derived from `n` (n odd → n, n even → 2n)
- **Cycle** — `[0, π]` for odd n, `[0, 2π]` for even n
- **Max distance** — equals `a`

## Pedagogy

Designed as an **inline application slide** for AP Precalculus Topic 3.14A,
sitting between the Flipped Math video and Q1. Suggested student prompt cycle
(per Applet_Creation §8.1, capped at 2–3 prompts per applet):

1. **Set / observe.** Set `a = 4`, `n = 3`, `cos`, `+`. Click Trace. How many
   petals do you see drawn? When does the second half of the trace start
   re-drawing on top of the first half?
2. **Predict.** Without clicking Trace, change `n` to 4 and predict the petal
   count. Write your prediction.
3. **Verify / explain.** Click Trace. Was your prediction right? Explain why
   even `n` produces twice as many petals as odd `n`.

## Files

```
rose-curve-explorer/
  index.html      — markup, no inline scripts
  app.js          — all logic (state, math, drawing, trace, events)
  styles.css      — Build_Design palette, mobile breakpoint at 768 px
  README.md       — this file
```

No external libraries. No CDN links. Pure vanilla JS + Canvas 2D, per
Applet_Creation_v4 §7.1–7.2.

## Deploy

1. Drop the `rose-curve-explorer` folder into the local working copy at:
   ```
   C:\Dev\frohlich-math-physics\math\trigonometry\
   ```
2. GitHub Desktop → commit (e.g. *"Add rose-curve-explorer applet"*) → push.
3. Netlify auto-deploys in ~30 s. Verify URL above.
4. Run §7.5 test checklist (slider min/max, rapid drag, double-click toggles,
   60 s idle, file:// open, mobile tap-drag).

## Math accuracy notes

- Plot bounds are `±11` (per spec A2) so `a = 10` clears the outer ring with
  a 1-unit margin, and any negative-`r` excursions stay inside the canvas.
- The curve is rendered in Cartesian — for each `θ ∈ [0, 2π]` we compute
  `(r·cos θ, r·sin θ)` directly. This is the natural way to plot polar
  curves on a Canvas 2D and avoids any negative-`r` rendering quirks.
- Sample density: **1000 points** across `[0, 2π]`, giving Δθ ≈ 0.0063 rad.
  At `a = 10`, `n = 8`, that's ~125 samples per petal — visually smooth.
- Slider values are clamped *again inside* the radius function (per §7.3
  defensive math), so any out-of-range input gets the closest valid value
  rather than producing NaN or a garbled curve.
