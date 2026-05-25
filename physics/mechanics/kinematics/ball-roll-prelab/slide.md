# Slide: Pre-Lab — Measuring with Uncertainty

**Lesson tag:** `[PLACEHOLDER — set by lesson context]`
**Applet folder:** `ball-roll-prelab`
**Slide top-bar title (~26pt bold per §5.X2):** `Pre-Lab · Ball Roll — Practice Your Measurements`
**Worksheet questions:** `[PLACEHOLDER — e.g., P1–P4 on the pre-lab handout]`

---

## Slide purpose

This slide hosts the **ball-roll-prelab** applet. The applet is a low-stakes
rehearsal of every measurement skill students will use in the actual launch-
cart lab next class:

- Aligning a meter stick and reading a distance (Δx)
- Hand-timing a brief motion event with an analog stopwatch
- Choosing the correct uncertainty for each tool given the **conditions of the measurement** (not just the instrument's display resolution)
- Converting wall-clock time → real time when using slow-motion playback
- Propagating uncertainties through `v = Δx / t` using the IB SL fractional-sum convention

The applet checks each field on submit. When a value or uncertainty is wrong,
the applet **reveals the correct answer with an explanation**, locks that
field, and the student propagates the corrected values forward to finish
the same problem. **RESET** generates a new problem (randomized markers,
new hidden launch speed). The goal is to complete one full problem with
**zero corrections** — that is the gating criterion for being ready for
the actual lab.

This slide is **load-bearing pedagogy** (v27 §0.1): it cannot be replaced
by a paper worksheet because the instant per-field feedback on
uncertainty-vs-resolution and on the fractional-sum propagation rule is
the entire point. The instructor cannot supervise 30 students simultaneously
making these errors and intervening at the right moment; the applet can.

---

## Narration (single-voice, narrator)

> NOTE: SSML wrapper is **not** included below — drop into your standard
> narrator template. Per §0.1 v27, this narration **explains the activity
> and the point of it**, it does not restate what the slide already shows.

```
You're about to spend a class period on a launch-cart lab where you measure
how fast the cart moves between two markers. Today's pre-lab is your chance
to practice every single measurement skill that lab will demand — without
a stopwatch in your hand, without a partner waiting, and without me looking
over your shoulder.

Work through the questions on your pre-lab handout. The applet on this
slide will let you run as many trial problems as you want. Every time you
press RESET, the markers shift and the launch speed changes, so each
attempt is genuinely new — you can't memorise an answer.

When you enter a value or an uncertainty that doesn't match the conditions
of the measurement — for example, reporting plus-or-minus zero-point-zero-
one seconds on a hand-timed interval — the applet will explain why that
answer is wrong and show you the right one. Then you keep going with the
corrected values. The point isn't to get it right the first time. The point
is to understand why each uncertainty has the value it has, so that when
you walk into lab next class, you are not learning the convention at the
same time you are trying to drive the apparatus.

One thing to watch carefully. When you slow the playback down to one-half
speed, your reaction-time uncertainty on the real-time reading shrinks
proportionally. That is the entire reason high-speed cameras exist in
physics labs. Try a few problems at one-times playback first, then a few
at zero-point-five-times playback, and watch what happens to sigma on the
real time. That insight is on the worksheet for a reason.
```

---

## Suggested worksheet questions (host on the handout, per §5.X3)

These are sketches — adapt to your handout template, question numbering,
and answer-box layout. The applet has no question text on it; the
worksheet carries the cognitive load.

- **P1.** Run one full problem at **1.0×** playback. Record Δx, t, v, and
  every uncertainty. Express σv as an absolute uncertainty (m s⁻¹) and as a
  percentage of v.

- **P2.** Press RESET. Run a new problem at **0.5×** playback. Record the
  same quantities. By what factor did σ on the real time change compared
  to P1? Explain in one sentence why.

- **P3.** Reset and run a problem. On your first attempt, **deliberately
  enter ±0.01 s** as your stopwatch uncertainty. Read the feedback the
  applet gives. In your own words, write the difference between an
  instrument's display resolution and the uncertainty appropriate for a
  hand-timed interval.

- **P4.** Complete one full problem with **zero corrections** from the
  applet. List your final `v ± σv`. This is the target — you are ready
  for the lab when you can do this.

---

## Embed notes for the LM build

- Embed via iframe at native **1280 × 640**. Applet fills the slide below
  the top-bar title (§5.X2). No internal header chrome inside the iframe
  in embedded form (§5.X4).
- The applet's own iframe-detect "dev preview" title self-hides when
  embedded — visible only on the standalone Netlify URL.
- Auto-plays on load. Students can interact immediately.
- The URL is **never spoken or shown** to students (§5.X2). The applet
  lives on this slide; students don't need to know the address.

---

## Build_Rules deltas surfaced by this build

(For the consolidation chat to roll into the next Build_Rules version.)

- **Stopwatch wrap-around constraint (NEW).** The current vendored analog
  stopwatch has a 10 s dial that wraps invisibly past 10 s. Any applet
  combining slow-motion playback with hand-timing using this module must
  constrain `(max real time) / (min playback multiplier) ≤ 10 s`. For this
  applet: speed range tightened to `[0.5, 1.1] m s⁻¹` and playback options
  reduced to `1.0×` and `0.5×` only. Worst case: 4 s real time at 0.5×
  playback = 8 s wall-clock, under the 10 s dial. Future applets needing
  more aggressive slow-mo will require the stopwatch module to be extended
  to a 30 s or 60 s dial (separate follow-up).

- **Per-field feedback pattern (NEW).** Two feedback elements per measurement
  row (one for value, one for uncertainty) instead of one shared element.
  Cleaner UX and avoids the value-message getting overwritten by the
  uncertainty-message in the same row. Worth standardising for future
  measurement-input applets.

- **Reveal-on-error pattern (NEW).** Wrong answer → field locked with red
  border, original value shown in the feedback line as `Was X → correct Y`,
  field's value replaced by the correct one so the student can propagate
  forward. Pass → field locked with teal border. Pattern is reusable for
  any quantitative-input applet with definite answers.
