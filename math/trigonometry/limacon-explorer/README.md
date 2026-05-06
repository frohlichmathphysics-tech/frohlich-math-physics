# Limaçon Explorer

**Handle:** `math/trigonometry/limacon-explorer`
**Public URL (after deploy):** `https://frohlich-math-physics.netlify.app/math/trigonometry/limacon-explorer/`

## What it does

Slider-driven exploration of polar limaçon-family curves of the form

```
r = a ± b · trig(θ)
```

where `trig ∈ {sin, cos}`, sign `∈ {+, −}`, and `a, b ∈ [0, 10]` step 0.1.

Two views render side-by-side:

- **Rectangular** (left, 500 × 400): `r` as a function of `θ` over `[0, 2π]`.
  Above-`r=0` regions filled in light teal, below-`r=0` regions in light red.
  Negative-`r` intervals correspond to inner-loop regions in the polar view.
- **Polar** (right, 500 × 500): the actual curve, with negative `r`
  rendered directly via `(r·cos θ, r·sin θ)` so inner loops emerge naturally
  on the opposite side of the pole.

The pedagogical anchor is the **regime transitions across `a/b`**:

| `a` vs `b`               | Regime                |
|--------------------------|-----------------------|
| `a = 0`, `b > 0`         | Circle through pole   |
| `a > 0`, `b = 0`         | Circle around pole    |
| `a < b`                  | Inner Loop Limaçon    |
| `a = b ≠ 0`              | Cardioid              |
| `1 < a/b < 2`            | Dimpled Limaçon       |
| `a/b ≥ 2`                | Convex Limaçon        |

The default `a = 4`, `b = 2` lands exactly on the convex/dimpled boundary
(`a/b = 2.0`). Bumping `b` up by `0.1` flips the regime to dimpled — the
intended classroom hook.

## Live readouts

- **Max distance from pole** = `a + b` (always shown when curves are visible).
- **Inner loop reaches** = `b − a` (shown only when `a < b`).
- **Regime label** updates live in 28pt teal above the canvases.
- The displayed equation re-renders on every input
  (e.g. `r = 4 + 2 cos(θ)` → `r = 4 − 2 sin(θ)` when sign and trig flip).

## Edge cases handled

- `a = 0, b = 0`: both canvases dim to grey, overlay reads
  `r = 0 — both terms zero`. Equation still displays `r = 0 + 0 cos(θ)`.
- Cardioid boundary detected via `|a − b| < 1e-9` (defensive equality).
- Inputs re-clamped to `[0, 10]` inside the physics function; UI bounds
  alone are not relied on.
- High-DPI rendering: drawing buffer scaled by `devicePixelRatio` and
  re-initialized on resize so the curves stay crisp on Retina / 4K.

## Local test checklist (Applet_Creation §7.5)

When opened from disk (`file://`):

- Drag `a` to 0 with `b` at default → "Circle through pole" label, curve = circle of diameter `b`
- Drag `b` to 0 with `a` at default → "Circle around pole" label, curve = circle of radius `a`
- Drag both to 0 → both canvases dim, overlay shows `r = 0 — both terms zero`
- Set `a = b = 5` → "Cardioid (a = b)" with subscript visible
- Set `a = 2, b = 5` → "Inner Loop Limaçon", inner loop indicator appears reading `3`
- Default `a = 4, b = 2` → "Convex Limaçon", `Max distance: 6`, no inner-loop indicator
- Bump `b` to `2.1` → label flips to "Dimpled Limaçon"
- Toggle `sin / cos` and `+ / −` — labels and curves update instantly
- Spam both sliders for 10s → no flicker, no freeze
- Leave idle 60s → no drift
- Phone check (≤1024px viewport) → canvases stack vertically, rectangular above polar
- Refresh page → defaults restore (`a=4, b=2, +, cos`)

## Deploy

```
limacon-explorer
```

Drop into:

```
C:\Dev\frohlich-math-physics\math\trigonometry\
```

Suggested GitHub Desktop commit message:

```
Add limacon-explorer applet (math/trigonometry)
```

After Netlify auto-deploys (~30 s), verify at:

```
https://frohlich-math-physics.netlify.app/math/trigonometry/limacon-explorer/
```

## Related

- **Applet 1**: `math/trigonometry/rose-curve-explorer` (Topic 3.14A)
- **Applet 2**: this applet — `math/trigonometry/limacon-explorer` (Topic 3.14B)
- **Applet 3**: TBD
