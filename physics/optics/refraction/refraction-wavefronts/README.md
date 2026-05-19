# Refraction at a Boundary — IBPHYS C1.3

Path: `physics/optics/refraction/refraction-wavefronts/`
Live: https://frohlich-math-physics.netlify.app/physics/optics/refraction/refraction-wavefronts/
Catalog entry: 01 (first applet in the Frohlich Physics catalog)
Last updated: 2026-05-18

## What this applet shows

A monochromatic light wave passes from **Medium 1** into **Medium 2** and
then **back into Medium 1** — three equal regions across the canvas.
n₃ = n₁ by construction; there is no separate slider for the third region.

The student controls:

- `n₁` — index of refraction of Medium 1 (1.00 to 2.50)
- `n₂` — index of refraction of Medium 2 (1.00 to 2.50)
- `f`  — frequency of the light, in 10¹⁴ Hz (4.00 to 7.90 — the visible range)

Two waves are rendered simultaneously, both crossing all three regions:

- **Top band — pulse.** A Gaussian wave packet (carrier = f, visible
  duration ≈ 4 periods). Click **Pulse** to emit one. Multiple pulses can
  be in flight at once. The pulse spatially compresses in Medium 2 (because
  v₂ < v₁ when n₂ > n₁) and re-expands in the third region.
- **Bottom band — continuous wave.** A steady sinusoid showing the
  long-wavelength → short-wavelength → long-wavelength pattern at a glance.

Conceptual partial reflection is modeled as an **amplitude drop at each
boundary** (factor `1 − ½·|n₂−n₁|/(n₁+n₂)` per crossing, applied to both
waves). This is NOT the real Fresnel coefficient — it is tuned for
visibility to seed the *"where did the energy go?"* discussion.

λ arrows above each wave label the wavelength in each region. The pulse's
arrow follows the pulse and re-labels (λ₁ / λ₂ / λ₁) as it crosses
boundaries.

## Controls (toolbar)

- **Pulse** — emits one wave packet from the left edge.
- **Pause / Resume** — freezes both waves together. Pulses can still be
  fired while paused; they appear at the source and begin moving when you
  resume.
- **Hide / Show values** — hides the three numerical-readout panels at the
  bottom of the page. Designed for the *"what do you observe?"* phase
  before students see numbers.

## Reference lines (draggable)

Two horizontal dashed reference lines span the canvas, with grippable
tabs on the right edge. Drag either line up or down (mouse or touch) to
align it with a wave's peak or trough in any region. Default position:
the continuous wave's region-1 peak and trough — so on first load, the
lines visibly mark where the region-1 amplitude reaches and the region-2
and region-3 amplitudes fall short of.

The lines are a qualitative comparison aid only. Quantitative measurement
belongs to a lab applet (per Lab_Inquiry_Design §6.2).

## Pedagogical anchor (per Applet_Creation §8)

The central insight is that **frequency is the identity of a light wave**;
wavelength and speed are properties of the medium. The third region drives
the conservation point home: same medium → same wavelength → same speed,
regardless of what happened in between.

The amplitude drops at the boundaries open the secondary discussion about
partial reflection. The set/observe/predict/verify/explain cycles live in
the student notes PDF, not in the applet itself.

## Physics simplifications (flagged per Applet_Creation §0.1)

1. **No reflected wave drawn.** Only the transmitted/propagating wave is
   shown; the missing energy is implied by the amplitude drop.
2. **Amplitude drop is symbolic, not Fresnel-correct.** Tuned for visual
   clarity, not numerical accuracy.
3. **No dispersion.** Each medium has a single index of refraction across
   the full frequency range.
4. **1D propagation only.** No oblique incidence, no refraction angle.
5. **Pulse envelope speed = phase speed.** No group-velocity vs.
   phase-velocity distinction.

## Files

- `index.html` — page structure
- `styles.css` — visual styling
- `app.js`     — physics + canvas drawing
- `README.md`  — this file

No external libraries. No CDN dependencies. Fully self-contained per
Applet_Creation §7.1.

## Local testing

Open `index.html` directly in any modern browser (Chrome, Safari, Firefox,
Edge). No server required — the `file://` URL works.

## Deployment

Per Applet_Creation §5.2 (v4 path):

1. Place updated files in `C:\Dev\frohlich-math-physics\physics\optics\refraction\refraction-wavefronts\`
2. GitHub Desktop → commit → push.
3. Netlify auto-deploys within ~30 seconds.
4. Verify the live URL above on desktop and a phone.
