# Refraction Pre-Lab — Protractor Reading Trainer

## Purpose

This pre-lab trains two skills students need before doing the refraction (water + pins) lab:

1. Reading angles from a school-grade protractor against a fixed reference line.
2. Estimating realistic reading uncertainty on a 1°-division scale.

Students who can't yet read the protractor reliably will produce noise-dominated data in the real lab. Doing this trainer first surfaces the reading skill before the experimental procedure is layered on top.

## Build description

Three trials in sequence. On each trial, the canvas shows a horizontal surface line, a vertex centered on it, and a red incident ray entering the vertex from the upper-left at the trial's true angle (20°, 45°, 70° from the normal). The student positions the vendored protractor on the geometry and types two numbers: the angle of incidence from the normal (central value, 1-decimal allowed) and its uncertainty.

Trial 1 shows a dashed normal as a training-wheel hint. Trials 2 and 3 hide it by default; a "Show normal" toggle is available, and resets to off at the start of each trial so the student must actively re-engage the safety net.

The dashed normal is the conversion crutch: the protractor's dual scale reads from the surface, so the student must mentally convert (90° − reading) or realign the protractor with its baseline on the normal.

Tolerance: ±1° on the central value, [0.5°, 2.0°] inclusive on the uncertainty. Three attempts per ray. On the third wrong attempt the student is shown a summary of both error categories and advances. After all three rays, the student is sent to the refraction lab.

Wrong-answer overlays:

- **Value off (> 1° from truth)** — small SVG diagram of the geometry with both angles labeled (from-normal vs from-surface) and the conversion rule. Value error takes priority over uncertainty error when both are wrong on the same attempt.
- **Uncertainty out of range** — text-only message naming the value as too optimistic (< 0.5°) or too pessimistic (> 2.0°).
- **3rd-attempt review** — both rules in one place, no truth-value reveal, then advances to the next ray.

## Navigation

On pre-lab completion the "Begin lab" button links to `../refraction-water-pin-trace/index.html`.
