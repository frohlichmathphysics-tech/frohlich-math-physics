# Applet entry: physics/measurement/circus/table-length

- Path: https://frohlich-math-physics.netlify.app/physics/measurement/circus/table-length/
- Tier: Trial
- Type: Lab support + Predict-test + Gated reveals
- Built for: IB Physics SL+HL (common) · Phys_00 · Measurement Station A — "Measuring the Table"
- Mode(s): single (slide.md)
- Dependencies: none — vanilla JS + Canvas 2D, no CDN, offline-capable; one requestAnimationFrame loop for the oscillating condition
- Mobile: best-effort (responsive; slider alignment + tap toggles; design-level only — not run in a device emulator here, see worker output §9)
- Built: 2026-06-04 (Revision 6)
- Build chat: APPLET-WORKER Phys_00 / circus / table-length
- Revision 6 (+corrections): static gates widened to ±3 mm (accept any honest reading; neutral blunder nudge only). Gap zero-adjust restored as an across-the-gap estimate where the WHOLE floating ruler slides sideways (no lock, residual folds in); both gap magnified views show scale-above / edge-below with NO connecting line (judge by eye); loupe text spacing fixed. Outlier lesson kept for UP-CLOSE only (one detached blunder 153.4 cm, honest cluster ±2σ; Qa spread → Qb exclude-the-blunder). GAP second question replaced by a same-scale COMPARISON of the two class histograms (up-close vs gap): the gap readings are clearly wider because the position is harder to estimate across the gap (no outlier planted in gap data). Worn end de-redded — scale simply begins at '1', ruler starts just before it. Per-condition gates: up-close/worn ±3 mm, gap ±20 mm band, osc swing envelope.
- Revision 5 (FINAL): different table per condition (trues 152.4 / 188.5 / 121.7 / 96.4 cm; each class sample centres on its own true). Worn reveal taught from the instrument (scale starts at 1 cm → +1 cm every reading); worn end unmistakably chewed. Oscillating: freeze removed (LIVE only); swing slowed to OSC_PERIOD=10000 ms; the SCALE swings, not the table (all wording fixed). GAP rebuilt: tape held floating away from the table, both ends estimated, no slider/lock, single estimate; σ=5 mm, class centres on 188.5 cm, wide ±20 mm acceptance band; Q2/Q3 reworded to both-ends-no-contact. Per-condition gates: up-close/worn ±0.5 mm, gap ±20 mm, osc swing envelope.
- Revision 4: GAP condition fixed — large unreadable gap + dashed projection (no scale under the gap) + WIDE ±15 mm estimation band (was the impossible ±0.5 mm gate that trapped students). Per-condition gates: up-close/worn ±0.5 mm, gap ±15 mm, osc swing envelope. B5 caption reworded to a distribution; B6 spatial wording fixed; B7+E1 red+bold varied nudges; E2 non-destructive Back on measure & question phases.
- Revision 3: four conditions (up-close → not-touching/gap → worn +10 mm → oscillating); precision-preserving TEXT input (B1); both magnified views render every phase, "magnified views" wording (B2); Done button (B3); caption/reveal rewording (B4); worn 5→10 mm with chewed end (D1); condition 2 reframed to not-touching across a gap, parallax dropped (D2); close softened to a teaser (D3); oscillating swing with LIVE and FREEZE read-modes + swing-envelope acceptance (N1–N5). Verified pieces unchanged.
- BUILD_RULES_DELTA:
  - **DELTA-1 (proposed → Applet_Conventions §5).** Align-and-read measurement read primitive. (Pending file filed 2026-06-04; supersedes the earlier read-only proposal.)
  - **DELTA-2 (proposed → Applet_Conventions §5).** Not-touching / projection-across-a-gap primitive: the instrument deliberately does not reach the target; a visible gap + dashed projection forces the learner to estimate across empty space; models estimation spread (σ≈4 mm) and motivates random uncertainty without any eye/parallax diagram. (Pending file filed.)
  - **DELTA-3 (proposed → Applet_Conventions §5).** Oscillating / moving-target read primitive: the target animates (small bounded swing); TWO selectable read-modes (LIVE read-while-moving; FREEZE-to-capture-then-read); acceptance = ANY reading inside the swing envelope (not ±½-division). Seeds process/timing uncertainty. (Pending file filed.)
  - DELTA-4 (note): single-mode index.html now 555 lines — under the ~800-line extract threshold (pending `applet-single-file-threshold`); no split.
  - Applied as overrides: Visual `footer-copyright-standard`; Lab `forward-facing-hygiene` rules 1–2.
  - Checked, not applicable: Applet `applet-locked-window-zoom-pattern`; Lab `hand-length-foot-sensitivity`. Build_Rules & Physics pending folders empty.

Catalog payload destination (LOCK-3):
`00_Standards_and_Specs/Catalogs/00_Pending_Entries/2026-06-04_table-length.md`
