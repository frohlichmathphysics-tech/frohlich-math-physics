# Normal Distribution — Master Applet

**Course:** IB Mathematics: Applications and Interpretation, Standard Level
**Topic:** 4.9 The Normal Distribution
**Folder:** `math/probability/normal-distribution/`
**Live URL** (after Mr. F deploys): `https://frohlich-math-physics.netlify.app/math/probability/normal-distribution/`

Single codebase, three modes, selected via the `?mode=` query parameter. Each mode hosts into a different Part B LM slide across Lessons 4.9.1, 4.9.2, and 4.9.3.

---

## Running locally

```text
Open index.html directly in a browser. No build step, no server required.
```

Open `index.html` in Chrome, Safari, or Firefox via `file://` and use the URL fragment to switch modes:

```text
index.html             → Mode A (default)
index.html?mode=A      → Mode A — Empirical Rule visualisation
index.html?mode=B      → Mode B — normalcdf (probability between two values)
index.html?mode=C      → Mode C — invNorm (finding a cutoff value)
```

No external dependencies, no CDN imports. Drop the folder into `C:\Dev\frohlich-math-physics\math\probability\normal-distribution\` and GitHub Desktop + Netlify do the rest.

---

## Mode reference

### Mode A — Empirical Rule (Lesson 4.9.1)

Curve with μ and σ sliders. Toggle button overlays the 68 % / 95 % / 99.7 % regions as concentric teal bands (centre darkest, outer lightest). No calculator readout in this mode — Mode A is pedagogical, not computational.

**Defaults:** μ = 50, σ = 10, zoom = 1.0×. ESR labels OFF. Advanced panel **auto-opens** (sliders are the primary interaction).

**Controls:**
- μ slider (range 0–200, step 0.1) — visibly pans the curve through the fixed window
- σ slider (range 1–50, step 0.1) — visibly scales the curve's width; height adapts so spikes don't clip
- **Zoom slider** (0.5×–5×, step 0.1) — widens or narrows the visible x-window. Use when μ is far from the default to bring the curve back on-screen.
- "Show 68 / 95 / 99.7 % regions" toggle button
- Reset

### Mode B — normalcdf (Lesson 4.9.2)

Curve with two draggable vertical lines (Lower, Upper). Shaded area between, live probability readout (3 sf), dual-syntax panel (TI-84 + TI-Nspire, both `μ`-before-`σ`).

**Defaults:** μ = 50, σ = 10, zoom = 1.0×. Lower = 40 (= μ−σ). Upper = 60 (= μ+σ). Advanced panel **collapsed** by default.

**Controls:**
- Drag the **L** and **U** handles on the canvas (mouse or touch) — constrained to the visible window
- Numeric input boxes for both bounds (type or paste — accepts any value, even outside the visible window)
- "Set −∞" / "Set +∞" toggle buttons — when active, the bound shows symbolically as `−∞`/`∞` on the canvas, and the calculator syntax uses `-1E99` / `1E99`
- **Zoom slider** (0.5×–5×) — widens or narrows the visible x-window
- Advanced panel: μ slider, σ slider
- Reset

**Lower bound is clamped ≤ upper bound** — dragging the L past the U pins it at U. Same for U dragging below L.

### Mode C — invNorm (Lesson 4.9.3)

Curve with one draggable vertical line. Default left-tail shading. Live x-value and left-tail-area readout. Dual-syntax panel.

**Defaults:** μ = 50, σ = 10, zoom = 1.0×. Line at x = μ (left-tail area = 0.5). Right-tail toggle OFF.

**Controls:**
- Drag the **x** handle on the canvas — constrained to the visible window
- Numeric input for "Target left-tail area" — type a value (clamped to [0.0001, 0.9999]) and the line snaps to `invNorm(area, μ, σ)`
- "Flip to right tail" toggle — **visual only**. Shading flips from left to right; a helper line appears showing the conversion *right-tail = p → left = 1 − p*. The formula in the dual-syntax panel **always** uses the left-tail area as input, because both calculators accept left-tail input.
- **Zoom slider** (0.5×–5×) — widens or narrows the visible x-window
- Advanced panel: μ slider, σ slider
- Reset

---

## Decision log

- **Locked window with zoom slider** (Mr. F decision, May 2026). All three modes use a fixed x-window centered at default μ = 50 with half-width = 4 × default σ × zoom = 40 × zoom. The μ slider visibly pans the curve through this fixed window; the σ slider visibly scales the curve's width. Y-axis adapts upward only (default-σ peak as floor, current peak as ceiling) so spikes don't clip vertically and large-σ flat-humps remain visibly flat. Default zoom = 1.0×; range 0.5× to 5×, step 0.1. Reset restores zoom to 1.0× along with μ and σ. **Note**: at extreme μ values, the curve pans off-screen at 1.0× and needs zoom to be increased — this is intentional visceral pedagogy (μ is a location parameter; large shifts move the curve away from the default centre).

- **Single-file deliverable.** ~1400 lines including HTML, CSS, and JS. Tested as a single file rather than splitting into `app.js` / `styles.css` because (a) Mr. F's copy-paste deploy workflow benefits from one file, (b) the precedents (4.8.2 cumulative-binomial-visualizer at 589 lines, 4.8.3 Comparator at 676 lines) are also single-file, (c) Build_Rules §0.1 / kickoff D5 set the extract threshold at ~800 lines and we're a controlled excess for a multi-mode tool. If maintenance grows painful, split at v2.

- **URL routing via `?mode=` query parameter** (kickoff D2 resolution). Canon §9.6 specified three separate URL-routed entry points (`/4-9-1/`, `/4-9-2/`, `/4-9-3/`); the kickoff overrode this in favour of a single folder. **Proposed canon edit** (carried in worker-summary doc).

- **TI-Nspire syntax is μ-before-σ**, same order as TI-84. Verified on TI-Nspire CX II hardware. Canon §8 / §9 / §6.3 / §7.3 originally specified σ-before-μ — that was a documentation error. **Proposed canon edits** for v3 (carried in worker-summary doc).

- **Math library**: pure JS, no scipy / no CDN.
  - `erf` via Abramowitz & Stegun 7.1.26 — analytic error bound `|ε| < 1.5e-7`.
  - `invNorm` via Acklam (`pjacklam.com`) — analytic error bound `|ε| < 1.15e-9`.
  - Empirical: tested against scipy across all 13 numerical kickoff test cases, max |Δ| = 4.96e-7 (target was 1e-4 per Lock Criterion L3). Three orders of magnitude headroom.

- **Curve sampling**: 220 points across μ ± 4σ for the stroke; 200 points for shaded-region polygons. Smooth at all sliders settings; no visible vertices on the curve.

- **Boot defaults all modes**: μ = 50, σ = 10 (kickoff D3). No per-mode default variation. No URL-parameter override of defaults.

- **Visual palette**: locked to canon §4.3 / Build_Rules §0.1.
  - Navy `#1E2A5C` — curve stroke, axis, headers, tick marks
  - Teal `#2E8B8B` — shading and accent
  - Cream `#FAF3DE` — applet background
  - Coral `#D95F52` — draggable bound lines and right-tail shading
  - Light grey `#888` — reference verticals (dashed, at μ, μ±σ, μ±2σ, μ±3σ)

- **Mobile breakpoint at 560 px**: aspect-ratio shifts from 5:3 to 4:3, control-row fields take full width, font sizes step down. Touch targets ≥40 px. Tested CSS only — hardware verification by Mr. F.

---

## Known limitations

- **Slider ranges**: μ slider is 0–200, σ slider is 1–50. Canon §9.2 specifies these as "e.g." (illustrative) examples, but they don't cover every canon problem — notably the ball-bearings problem (canon §7.3 P4, σ = 0.05) and the milk-carton problem (canon §6.3 P6, μ = 1005). Workaround: students compute these on their physical calculator using the dual-syntax shown in the applet. The applet's visualisation purpose still lands for the median problem.

- **Advanced panel — opening Mode C while right-tail toggle is active**: shading and helper line remain correct, but no visual cue distinguishes a fresh boot from a previously-right-tail session. Reset clears all state cleanly.

- **No undo / redo**. Reset is the only undo affordance.

- **Numeric input precision**: bound inputs (Mode B) and area input (Mode C) round to 3 dp / 4 dp on commit. Typing more digits gets silently rounded. This is consistent with calculator behaviour but worth noting if a teacher demonstrates a high-precision case.

- **Touch interaction**: when dragging on canvas, page-scroll is prevented (`e.preventDefault()` on touchstart/touchmove). User must release before scrolling. Same pattern as the 4.8.2 cumulative-binomial-visualizer.

---

## File layout

```
math/probability/normal-distribution/
├── index.html       (single-file applet, ~1300 lines)
├── slide.md         (this README's authoring sibling — see below)
├── README.md        (this file)
└── slides/
    ├── slide-mode-a.md   (Lesson 4.9.1 Part B slide-build + SSML draft)
    ├── slide-mode-b.md   (Lesson 4.9.2 Part B slide-build + SSML draft)
    └── slide-mode-c.md   (Lesson 4.9.3 Part B slide-build + SSML draft)
```

> Mr. F: I delivered the three `slide-mode-X.md` files at the top level of the bundle (not in a `slides/` subfolder) — see the chat. You decide whether to put them in a subfolder or alongside `index.html`. Both are fine; the iframe URL in each markdown file is independent of where the slide files themselves live.

---

## Verification — what passed before delivery

- ✅ JS math vs scipy: 13/13 test cases pass at 4 dp (max |Δ| = 5e-7)
- ✅ HTML parses with balanced tags (Python `html.parser` smoke test)
- ✅ All seven scope fences (F1–F7) respected — no z-score language, no normal approximation to binomial, no Casio, no out-of-Topic-4.9 content, no HL-only, no inflection-point property, σ-distance language used neutrally
- ✅ Dual-syntax panel uses **μ-before-σ** for both calculators (verified on TI-Nspire CX II hardware per uploaded screencaps May 26, 2026)

## What needs hardware verification by Mr. F

- ⚠️ Touch interaction at 360 / 380 / 414 px viewports
- ⚠️ Slider thumb size on small phones (target ≥ 26 px diameter)
- ⚠️ Mode-routing on actual Netlify deploy (the `?mode=` parameter must survive any redirect rules)
- ⚠️ Embedded iframe sizing on the Part B LM slides (560 px wide is the iSpring-friendly minimum; we target 720 wide)
