# bars-to-curve — narration & build description

Applet handle: `math/probability/bars-to-curve`
Deploy URL (after Alex deploys): `https://frohlich-math-physics.netlify.app/math/probability/bars-to-curve/`
Single-mode applet → this is `slide.md` (not `slide-mode-*.md`).

This file is a **separate** narration/build file per the applet-folder rule. It is an
internal/build document (exempt from the public footer rule). It covers **both** usages:
Track A (Lesson 4.9.1, in scope) and Track B (Topic 5 reintroduction, integration bridge).

---

## What the applet shows (build description)

- A continuous variable — **café wait time at Café Tinto Alto**, Normal(μ = 3.2 min, σ = 0.9 min) —
  drawn over the window [0.05, 6.35] min (μ ± 3.5σ; the left edge stays above 0 so no negative wait
  times appear).
- A **density histogram**: each bar's height is the *average density over its bin*
  (height = probability-in-bin ÷ bin-width), so **each bar's area equals the probability of landing in
  that bin**, and the **total area of all bars is 1** at every bin count.
- A faint **navy normal curve**, always visible, that the bars approach as the bins get finer.
- A **bins control** (slider) stepping n = 4 → 8 → 16 → 32 → 64 → 128. Bin width = range ÷ n, so bars
  narrow as n grows and the step outline closes onto the curve.
- A **shaded region** between two **draggable** markers a and b (default 2.0–4.0 min). Read-outs:
  - "Total area of bars = 1.00"
  - "Shaded area … from bars ≈ (value)" — the area of the bar-pieces inside [a, b]
  - "… under curve = (value)" — the true probability P(a < wait < b)
- **Auto-sweep on load:** the bin count climbs 4 → 128 once, the curve stays visible the whole time,
  and the bars visibly merge into it; it settles at n = 128. A **"Show the limit"** button replays it.

Palette: cream `#FAF3DE` background, navy `#1E2A5C` curve/axes/handles, teal `#2E8B8B` for the bars
inside the shaded region, coral `#D95F52` for the tail bars outside it. System sans-serif UI.
No internal chrome when embedded; the standalone preview adds a title + copyright line only.

---

## Track A — Lesson 4.9.1 (in scope: "probability = area"; NO calculus language)

*Use this narration when the applet appears in 4.9.1 Part B exploration, right after the curve is
introduced. Keep everything to "area" and "probability." Do not say "integration" or show ∫.*

Opening:
"Yesterday we counted things — how many free throws, how many defects. Today Mira isn't counting; she's
*measuring* a wait time, and a measured time can be anything: 2.7 minutes, 3.04 minutes, 3.041…
So instead of separate bars for separate counts, we bunch the wait times into intervals and draw a bar
for each interval. Watch the height: we've set each bar so that its **area** is the chance of a wait
landing in that interval."

On the sweep / bins control:
"Look what happens as I cut the intervals thinner. Four fat bars… eight… sixteen. The staircase keeps
getting smoother, and it's settling onto that smooth curve. The bars never leave the curve behind —
they *become* it. And notice the number that doesn't move: the **total area of the bars stays 1**.
That's what makes this a probability model — all the chance, added up, is 1 (100%)."

On the shaded region:
"Now the point of the whole thing. Mira wants the chance a customer waits **between 2 and 4 minutes**
for the menu board. That chance is just the **area** sitting over 2-to-4 — the teal piece. Read the two
numbers: the area from the bars, and the area under the smooth curve. With fat bars the bar-area is only
a rough guess. Drag the bins finer and the bar-area slides right up to the curve's area — about 0.722,
roughly **72%** of customers. Probability is area. That's the whole idea."

Drag prompt (for Student Notes Part B):
"Drag a and b to 1.4 and 5.0. What area do you get, and how does it compare to what the Empirical Rule
predicts for μ ± 2σ?" (Expected ≈ 0.954.)

Scope reminders for this track: no z-scores, no standardizing, no "integration," no ∫ notation,
no binomial, no Empirical-Rule arithmetic beyond reading the shaded area.

---

## Track B — Topic 5 reintroduction (approved forward-bridge: integration, conceptual only)

*Use this narration only when the same applet is brought back in Topic 5 (Integration). Here the
forward-reference fence is deliberately lifted for this asset (Alex, 2026-05-30). Still conceptual —
the applet computes nothing with calculus; it just makes the picture that motivates the integral.*

Reconnect:
"You've seen this picture before, in the normal-distribution lesson: thinner and thinner bars closing
onto a smooth curve, and probability read off as **area**. Today we give that area its real name."

The bridge:
"Each bar is a **thin rectangle**: width Δx, height the curve's value across that strip, so its area is
(height × Δx). The shaded probability is the **sum of these rectangles' areas** between a and b. As the
bars get thinner — Δx → 0 — that sum stops being an estimate and becomes exact. That limiting sum of
thin rectangles is the **definite integral**:
the area between a and b under y = f(x) is ∫ from a to b of f(x) dx.
So 'probability = area under the curve' is literally 'probability = the integral of the density.'
The applet's 'from bars' number creeping up to the 'under curve' number is a Riemann sum converging to
its integral."

Close:
"Everything you'll do with definite integrals — area under a curve as a limit of rectangles — you have
already seen, physically, the day we watched these bars become a curve."

Scope note for Track B: keep it conceptual. No antiderivative rules, no Fundamental Theorem statement,
no computation of ∫ by hand — the applet is the *motivation* picture for the integral, not a solver.

---

## Recording / embedding notes

- Auto-plays; no click needed to start the sweep. Good for a live clip: let the sweep run once, then
  drag a/b to the café interval while narrating Track A.
- Embed full-bleed on the applet-host slide with a title bar above it (per the slide-layout rule);
  deliver the exploration questions on the Student Notes Part B handout, not on the slide.
- The applet hides its title/copyright when embedded (iframe); they show only in the standalone preview.
