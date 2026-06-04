# slide.md — Measuring the Table (Measurement Station A)  ·  REVISION 5

Companion build + verbatim on-screen guided-text description for `index.html`.
No eGlass recording, no audio. Single-mode → `slide.md`.

Handle: `physics/measurement/circus/table-length`
Deploy: `https://frohlich-math-physics.netlify.app/physics/measurement/circus/table-length/`
For: IB Physics SL+HL (common) · Phys_00 · Measurement Station A — "Measuring the Table"
Pattern: Lab support + Predict-test + Gated reveals.

## What changed in Revision 6 (+ corrections, on top of Rev 5 final)
- STATIC GATES widened to ±3 mm (up-close, worn) so any honest reading is accepted; only a blunder fires
  the neutral nudge. (gap ±20 mm band; oscillating swing envelope — unchanged.) "Your reading" still plotted.
- GAP interaction: across-the-gap ZERO-ADJUST restored — the slider now slides the ENTIRE floating ruler
  sideways (not a moving 0-mark on a fixed ruler), held above and clear of the table-edge marker; no
  snap/lock, residual folds into the reading. Both magnified views show the floating scale ABOVE and the
  table edge BELOW with NO connecting line (judge by eye); loupe text spacing fixed (no overlap).
- UP-CLOSE outlier lesson: honest cluster truncated at ±2σ with exactly ONE detached outlier (153.4 cm);
  two gated questions — Qa (spread = uncertainty; true sits in the cluster) then Qb (the far-out one is a
  blunder you can exclude; outlier bar highlighted red on the reveal).
- GAP second question is now a COMPARISON (no repeated outlier): both class histograms are shown to the
  SAME scale (up-close table 1 on top, across-the-gap table 2 below); the student is asked what they notice;
  the answer is that the gap readings are spread much more widely, and the reveal explains it is because the
  position had to be estimated in a harder way (judging both ends across empty space) — harder measurement,
  wider spread, more uncertainty. (No outlier planted in the gap data.)
- WORN end de-emphasised: removed the red stub/jagged/red caption; the printed scale simply begins at "1"
  with the ruler starting just before it (muted "scale starts at 1 cm (0 worn off)" note). Worn Q4 reveal and
  the systematic teaching are unchanged.
- WORN and OSCILLATING reveals otherwise unchanged. Per-condition gates: up-close/worn ±3 mm · gap ±20 mm
  band · oscillating swing envelope.

## What changed in Revision 5 (FINAL, consolidated; on top of Rev 4)
- DIFFERENT TABLE PER CONDITION: up-close 152.4 · gap 188.5 · worn 121.7 · oscillating 96.4 cm; each class
  sample (N=28) centres on its own true; intros say "a different table"; tables drawn at different widths.
- WORN reveal taught from the INSTRUMENT (Q4): the 0 is worn so the scale starts at 1 cm → every reading
  ~1 cm long, same way every time = systematic (consistent but not accurate). Worn end drawn unmistakably
  chewed (first cm gone, prominent "1"). Q4 shows the worn-end diagram, not the class strip.
- OSCILLATING: freeze-to-capture removed entirely (LIVE read only). Swing slowed to OSC_PERIOD = 10000 ms
  (10 s per swing); amplitude unchanged. The TABLE never moves — the TAPE/scale swings; all wording fixed
  (intro, live hint, Q5, swing reveal, loupe). Acceptance = swing envelope (true ± 6 mm) = 95.8–97.0 cm.
- GAP REBUILT — tape held AWAY from the table (floating, parallel, full length, nothing touches). NO slider,
  NO lock: a single ESTIMATE step. Scene shows the floating tape with perpendicular dashed projections at
  both ends and the label "the tape is held away from the table — nothing touches it." Left magnified view:
  the zero floats above the left edge across a gap ("judge where the zero lines up — across the gap"). Right
  magnified view: the scale floats above the far edge, projection up to the scale ("estimate where the far
  edge falls — across the gap"). Both ends estimated → σ = 5 mm (±2.5σ), class centres on 188.5 cm,
  acceptance a WIDE ±20 mm band around the gap true (186.5–190.5 cm; never traps). Q2/Q3 reveals reworded to
  "both ends judged across empty space; no contact" (no short-tape, no parallax).
- Per-condition gates: up-close ±0.5 mm · gap ±20 mm band · worn ±0.5 mm · oscillating swing envelope.

## What changed in Revision 4 (on top of Rev 3)
- GAP BLOCKER FIXED. (a) Scene gap is now large — the tape ends ~62% across with a wide visible gap; the
  right magnified view shows the scale ENDING at the tape's last tick (~148 cm) then EMPTY space with a
  dashed projection only (no ticks/scale under the gap) to a floating "table edge — how far past?" marker.
  Nothing at the edge to align to; the student must ESTIMATE. (b) Gap acceptance is now a WIDE estimation
  band: accept within ±15 mm of the rendered far value (only absurd values nudge). No more trap.
- Per-condition gates: up-close ±0.5 mm · worn ±0.5 mm · GAP ±15 mm · oscillating swing envelope.
- B5: class-sample caption now "28 class readings of this table — a taller bar means more learners read
  that value" (all four samples).
- B6: orientation says the magnified views are "in the picture above (below the table)" — spatially correct.
- B7 + E1: the re-check nudge is RED + BOLD and randomly varied ("Are you sure? Check again." / "Hmm — take
  another look." / "Worth a second look." / "Give that one another look." / "Look again and re-enter.");
  "Reading recorded." stays teal.
- E2: a "← Back" control on every measure and question phase returns to the previous phase WITHOUT
  destroying recorded readings or regenerating class samples (returning to a completed measure restores the
  locked state and pre-fills the prior reading). No skip-ahead; the measure gate must still be passed.

## What changed in Revision 3 (consolidated)
- FOUR conditions now, one reading each, in order: up-close → not-touching(gap) → worn(+10 mm) → oscillating.
- B1 precision: reading entry is a TEXT input; the student's string is stored and displayed VERBATIM
  ("152.90" stays "152.90", "152.9599" stays "152.9599"). A numeric copy is parsed ONLY for the gate
  and the histogram mark; nothing is ever re-rounded or stripped. (Unit teaches 13 vs 13.0.)
- B2: both magnified views render in every measure phase; wording is "magnified views" (not "circles");
  re-renders on first paint, on `load`, and on resize.
- B3: close has a primary "Done" button alongside "Start over".
- B4: captions/reveals reworded to match what each condition shows.
- D1: worn shift 5 → 10 mm; the worn end is drawn clearly chewed (0 gone, first visible mark "1" = 1 cm).
- D2: condition 2 is now NOT-TOUCHING — the tape ends well short of the far edge (significant gap); the
  student projects the reading across the gap. Parallax eye-diagram dropped entirely. σ stays 4 mm.
- D3: close is a TEASER — it poses "which single number was the true length?" and does NOT declare
  "a measurement is a range." No ± formula, no printable.
- N1–N5: NEW oscillating condition — the tape hangs from two strings and swings (animated, small
  amplitude). Two read-modes built: LIVE (read while it moves) and FREEZE-to-capture (freeze an instant,
  then read). Acceptance = anywhere within the swing envelope (NOT ±0.5 mm).
- KEPT/verified unchanged: noise model (far = TRUE + offset − align + gauss(σ); class = TRUE + offset +
  gauss(σ), N=28, ±2.5σ), ±0.5 mm gate for STATIC conditions, neutral "Are you sure? Check again.",
  palette/offline/no-CDN/footer, full-table side-view scene, generic non-152.4 example,
  class-sample-then-Socratic flow, one reading per condition. No capture/ID/POST/pipeline.

## Data / RNG (re-verified — worker output §3)
- True length 1524.0 mm (152.4 cm); never shown as a single answer. mulberry32 PRNG, reseeded per session.
- Static/gap/worn reading frozen at lock: `far = TRUE + offset − alignResidual + gauss(σ)`; gate |typed−far| ≤ 0.5 mm.
  - up-close σ=1, offset 0 · gap σ=4, offset 0 · worn σ=1, offset +10 mm.
- Class sample (N=28): `round(TRUE + offset + gauss(σ))`.
- Oscillating: amplitude A=6 mm; live far(t)=TRUE + A·sin(2π t/2000ms); swing envelope = TRUE ± 6 mm
  (151.8–153.0 cm). Acceptance = any reading inside the envelope (both read-modes). Class sample =
  `round(TRUE + gauss(σ=3 mm, truncated at ±2σ = ±A))` → centred, no systematic, spread tied to the swing.
- Verified ranges: class median range ≈ up-close 4 mm · gap 15 mm · worn 4 mm (centred +10) · osc 10 mm.

## Interaction
- Static/gap/worn: slider to position the zero end (left magnified view), "Lock the zero in place"
  (always enabled — the student judges "good enough"; residual folds into the reading), then read the far
  edge in the right magnified view and type it. Gap right-view shows the tape ending short + a dashed
  projection across the gap to the floating edge.
- Oscillating: no align step (it's moving). A "Live read / Freeze to capture" toggle; in Live the value
  moves as you read; in Freeze, "Capture this instant" freezes the tape, then you read the frozen position.
  Accept anywhere in the swing envelope; otherwise "Are you sure? Check again."

## On-screen guided text (verbatim, by phase)

**Intro.** "What you're looking at: a side view of a table with a tape measure lying along its top, from
the table's left edge across to its far edge. The two boxes below are magnified views — the left one zooms
in on where the tape's zero end meets the table's left edge, and the right one zooms in on where the
table's far edge falls on the tape scale." + numbered What to do (line up zero / read far edge / type
exactly what you read, e.g. 88.6) + "You'll measure the same table four times… (the last one moves —
you'll just read it). Nothing here is right or wrong." Button: Start measuring.

**Measure (static/gap/worn).** Orientation note ("Side view: … the two magnified views zoom in on each
end."), condition line, Step "Line up the zero end" (slider + Lock, hint), Step "Read the far edge"
(text field, hint "Type exactly what you read — keep any decimals.").
- Up-close: "Measure the length of the table up close. Line the zero end of the tape up with the table's
  left edge, then read the far edge."
- Gap: "This tape is a little short — its end stops well before the table's far edge. Line up the zero end,
  then estimate the far edge across the empty gap."
- Worn: "Now switch to this other tape measure and measure up close again, the same careful way." (left
  view shows a chewed end, first mark "1", "(0 chewed off)" — never named "worn" here.)

**Measure (oscillating).** "This tape hangs from two strings and won't stay still. Read the far edge as
best you can while it keeps swinging." Toggle Live/Freeze with descriptions; Capture button in Freeze;
text field. (Both magnified views show the swaying ends.)

**Class sample (after each).** "Your reading is [verbatim] cm. A class measuring this table [label] got the
readings shown above, with yours marked." Labels: up-close "the same careful, up-close way"; gap "the same
way, estimating across the gap"; worn "with the same tape"; osc "the same way, while it kept moving".

**Q1 (up-close):** which single one is the correct length? → none; it's within the spread.
**Q2 (gap):** is any single reading wrong? → none; projecting across the gap made everyone less certain.
**Q3 (gap, predict):** why less certain across the gap? → no contact, people project the edge differently.
**Q4 (worn):** all ~10 mm longer, tightly grouped — what does it point to? → systematic; worn zero ~10 mm.
**Q5 (oscillating):** what made this hard to pin down? → the target was moving; uncertainty from the
measuring process, not the ruler. (No internal "Pillar" label on screen.)

**Close (teaser).** "So — across all four tries, which single number was the table's true length? You
couldn't point to just one. … That's the puzzle we'll make precise next: how to report a measurement so it
actually says what you do — and don't — know." Buttons: Done (→ "You've finished Measurement Station A.")
and Start over (reseeds). No "a measurement is a range" statement, no ± formula, no printable.

## Forward-facing hygiene
No "deck"/"Spine"/"LM"/worker/egg/"Pillar"/"parallax"/"circles" on screen. "worn"/"systematic" appear only
in the worn reveal; the moving-target framing avoids any internal uncertainty-taxonomy label.
