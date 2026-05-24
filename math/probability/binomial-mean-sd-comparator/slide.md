# slide.md — binomial-mean-sd-comparator

**Applet:** Binomial Mean & SD Comparator
**Serves:** IB MAI SL 4.8.3 LM (Mean and Standard Deviation of the Binomial Distribution), Slide 7 (applet exploration block + restaurant motivation)
**Live URL:** https://frohlich-math-physics.netlify.app/math/probability/binomial-mean-sd-comparator/
**Repo path:** /math/probability/binomial-mean-sd-comparator/
**Tech stack:** vanilla JS + Canvas 2D, single-file HTML5, no CDN dependencies
**Background:** cream `#FAF3DE`
**Palette:** navy `#1E2A5C`, teal `#2E8B8B`, red `#C00000`
**Tools used:** none
**Applet type:** Sim (discovery goal: same-μ-different-σ visual contrast)
**Product tier:** embedded in lesson
**CSV export:** no
**First ship:** 2026-05-24

---

## Pedagogical role (LOAD-BEARING)

Per **Build_Rules v27 §0.1**, applets must deliver a concept the lesson cannot deliver as well without them. This applet's load-bearing beat:

> Two distributions can share the same mean and still tell very different stories. Spread matters. σ measures that spread.

The "Same μ, different σ" preset loads **B(100, 0.5)** (σ = 5.00) next to **B(300, 1/6)** (σ ≈ 6.45). Both have μ = 50. Direct visual contrast lands the insight that lesson narration alone cannot — the wider distribution is **visibly** more spread out, and the σ readout gives that "wideness" a number.

This is **not** a decorative bar chart. Without this applet on Slide 7, the lesson has to talk students INTO the same-μ-different-σ idea instead of letting them SEE it. Per Build_Rules v27 §0.1 sniff test: lesson cannot deliver this beat without the applet, so the applet earns its build budget.

---

## Sample narration (Slide 7)

Per **Build_Rules v27 §0.1 narration lock**: narration explains, does not read.

> Two binomial distributions. Both have the same average — fifty. Same μ. But look at the spread. The one on the left is bunched tightly around fifty; the one on the right is fatter — it reaches further left and further right, and the peak is shorter because it has to share probability over more values.
>
> They're not the same distribution. Same average is not enough. The number that captures the difference is what we call σ — the standard deviation. Left chart: σ is five. Right chart: σ is about six and a half. That difference in σ is everything you're seeing here.

Note: narration does **not** say "B of 100 comma 0.5" or "mu equals 50" or "sigma squared equals n p times one minus p." Those are on the screen. Narration translates what's on the screen into intuition.

---

## How to use the applet on Slide 7

1. **Land on the page.** Default state is B(20, 0.30) vs B(20, 0.30) — identical distributions, both panels show the same shape. Mild visual signal that the applet is symmetric and ready to be played with.
2. **Click "Same μ, different σ".** Loads B(100, 0.5) vs B(300, 1/6). This is the canonical comparison the lesson is built around. Pause here for the narration above to land. Students see both distributions centered on 50 but with visibly different widths.
3. **Click "Skewed vs symmetric"** (optional, if time permits). Loads B(20, 0.5) vs B(20, 0.1). Side-effect lesson: same n, different p changes both μ AND the shape (skewness). Useful for the moment where a student asks "what if I just change p?"
4. **Hand it off to students.** Slider it freely. The readout panel shows μ, σ², σ updating live. Hover/tap any bar for its P(X = k) value.

---

## Spec lock items (from build chat, 2026-05-24)

| # | Item | Locked value |
|---|---|---|
| 1 | n slider | integer, range [20, 300], both distributions |
| 2 | p slider | range [0.01, 0.99], step 0.01 (exact 1/6 preserved when loaded via preset; snaps on slider drag) |
| 3 | Readout | μ, σ², σ — all three, 3 sf, below sliders |
| 4 | Layout | side-by-side desktop, stacked at ≤700px; sliders below chart |
| 5 | Axis | shared x AND shared y across both panels — direct visual comparison |
| 6 | Visual aids on by default | μ vertical line (navy, dashed) · μ ± σ band (teal, 18% opacity) · axis labels · hover/tap shows k and P(X = k) |
| 7 | Path | `/math/probability/binomial-mean-sd-comparator/` (matches sibling applets in catalog) |
| 8 | Presets | "Same μ, different σ" → B(100, 0.5) vs B(300, 1/6) · "Symmetric base" → B(20, 0.30) twice · "Skewed vs symmetric" → B(20, 0.5) vs B(20, 0.1) · "Reset" |

---

## Numerical verification (run pre-ship)

All five locked cross-checks pass with PMF sums = 1.0 to machine precision:

| Case | μ | σ² | σ |
|---|---|---|---|
| B(20, 0.30) | 6.00 | 4.20 | 2.05 |
| B(100, 0.5) | 50.0 | 25.0 | 5.00 |
| B(300, 1/6) | 50.0 | 41.7 | 6.45 |
| B(50, 0.4) | 20.0 | 12.0 | 3.46 |
| B(200, 0.1) | 20.0 | 18.0 | 4.24 |

PMF computed via log-gamma (Lanczos g=7) for numerical stability up to n ≈ 1000+.

---

## Build notes

- **Shared x-axis range** is computed as the union of [μ − 4σ, μ + 4σ] for both distributions, clipped to [0, n_each] and integer-rounded. This captures essentially all visible mass while letting the eye compare widths directly.
- **Shared y-axis** uses max-of-both-peaks × 1.08 padding. Pedagogically useful: wider distributions show visibly shorter peaks (probability conservation).
- **Exact p values** (specifically 1/6) are stored in state separately from the slider's snapped value, so the canonical preset displays σ ≈ 6.45 rather than σ ≈ 6.51 (which would result from snapping to p = 0.17). Moving the slider overwrites the exact value with the snapped value — standard UX.
- **Cream `#FAF3DE` background** locked per Applet visual rules. Dark `#10121E` reserved for eGlass video recording only.
- **Mobile responsive** at ≤700px viewport. Per Build_Rules v25 §0.1, mobile-test before deploy.

---

## Cross-references

- **Build_Rules v27 §0.1** — load-bearing pedagogy lock; narration role lock
- **Build_Rules v27 §15.1** — applet folder contents (slide.md as separate file)
- **Applet_Patterns v4 §2.11** — side-by-side comparison applet pattern (first build)
- **Applet_Creation v9 §7.8** — vendoring philosophy (no tools vendored here — this applet uses none)
- **NAMING_RULES.md §4** — folder contents convention (slide.md required)

---

*slide.md · binomial-mean-sd-comparator · 2026-05-24 · v1*
