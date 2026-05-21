# Single-Slit Path Difference — Slide Build Notes

> **Companion file to `index.html` in this folder.**
> The applet is the visual; this file is everything the slide author (and TTS)
> needs to wrap the applet into a finished LM slide.

---

## 1. Applet metadata

| Field            | Value                                                             |
| ---------------- | ----------------------------------------------------------------- |
| Slug             | `single-slit-path-difference-demo`                                |
| Title            | Single-Slit Diffraction: Path Difference                          |
| LM               | Single-Slit Diffraction                                           |
| Slide position   | **Slide 1 of 3** (derivation → exploration → measurement)         |
| Previous slide   | TBD (intro, or none)                                              |
| Next slide       | `single-slit-diffraction` (Sim/Demo)                              |
| Then             | `single-slit-diffraction-lab` (Lab)                               |
| Classification   | Sim (primary, discovery goal) / Demo (secondary, narration mode)  |
| Tools used       | None (no measurements taken)                                      |
| Folder contents  | `index.html`, `slide.md` (this file)                              |
| Applet dimensions| 1280 × 720 px (16:9, PowerPoint widescreen default)               |
| Locked           | 2026-05-21                                                        |

---

## 2. Narration script (for TTS)

Read at a moderate pace — about 2.5 minutes total. Pauses marked `[pause]` are
~1.5 seconds. Keep TTS voice consistent with the LM's other slides.

> Light passing through this single slit produces a diffraction pattern on the
> screen on the right. You can already see the bright central band and the
> smaller side fringes. In this slide, we'll derive *why* the first dark fringe
> appears exactly where it does.
>
> [pause]
>
> I've drawn two rays leaving the slit. The top ray starts at the very top edge
> of the slit. The bottom ray starts at the midpoint. These two source points
> are exactly *a*-over-two apart — half the slit width.
>
> [pause]
>
> Look at the marker on the screen. Right now it sits at the center. Both rays
> travel essentially the same distance to reach the marker, so they arrive in
> phase. That's the central bright spot.
>
> [pause]
>
> Now drag the marker upward or downward. As you do, the two rays now leave the
> slit at an angle theta from the optical axis. The top-edge ray has to travel
> a tiny bit further than the midpoint ray to reach the marker. We call this
> extra distance Delta-r.
>
> [pause]
>
> Look at the small framed picture in the lower-left of the slide. That's a
> magnified view of the geometry right at the slit, scaled up four times. The
> short red side is Delta-r. From the geometry, Delta-r equals *a*-over-two
> times sine theta.
>
> [pause]
>
> Now the key moment. Drag the marker until the Delta-r readout shows exactly
> point-five zero lambda — half a wavelength. You're aiming for the small teal
> tick labeled m equals plus one, or the one labeled m equals minus one.
>
> [pause]
>
> When Delta-r equals lambda-over-two, the top-edge wave and the midpoint wave
> arrive at the screen exactly out of phase. They cancel.
>
> [pause]
>
> Here's the powerful part. Every other point in the upper half of the slit has
> a partner directly *a*-over-two below it. At this same angle, *every* such
> pair is exactly out of phase. The entire aperture sums to zero. That's the
> first minimum.
>
> [pause]
>
> Setting Delta-r equal to lambda-over-two, and substituting *a*-over-two times
> sine theta for Delta-r, gives the famous formula: *a* sine theta equals
> lambda. This is the *m* equals one condition.
>
> [pause]
>
> The intensity strip on the right shows higher-order minima too — *m* equals
> two, three, and so on. But this two-ray construction only proves the *m*
> equals one case. Higher orders need a finer subdivision of the aperture; we
> won't do that here. We'll explore the rest of the pattern on the next slide.

---

## 3. Slide-build instructions (for the slide-author chat)

### Layout

- 16:9 slide at 1280 × 720 px (PowerPoint widescreen default).
- **No slide title.** The applet fills the slide edge-to-edge.
- The applet's `index.html` embeds as a full-slide iSpring web object.
- Background of the slide can be ignored (applet has its own cream background).

### TTS / audio

- One audio track for the slide, generated from §2 narration script above.
- Auto-play on slide open is fine; alternatively wire a small play/pause control
  on the slide chrome (your preference for the LM).
- Pacing: ~2.5 minutes total.

### Student interaction

The applet handles all interaction. The student:

1. Drags the marker on the screen strip (or clicks anywhere along the strip).
2. Watches the Δr readout change as θ changes.
3. Aims at the m = +1 or m = −1 tick to find Δr = 0.500 λ exactly (highlighted red).
4. Optionally hits Reset to return to the central maximum.

No slide-level interaction is needed. Do not add quiz prompts or scaffold
buttons on this slide — they belong on later LM slides.

### Visual coding the student will see

- Δr readout turns **teal** at the central maximum (Δr ≈ 0).
- Δr readout turns **red** at the first minimum (|Δr| ≈ 0.5 λ).
- Teal m=±1 tick marks on the intensity strip are the visual targets.
- All ray and intensity-pattern color is 633 nm red (fixed for this LM slide;
  wavelength is not a variable here).

### Honest annotations the narrator can mention (if relevant)

- Slit width *a* and wavelength λ are exaggerated relative to *L* for visibility.
- Rays are drawn as converging at the marker. This is the visual convention
  students see in textbooks. The Δr = (*a*/2) sin θ formula displayed is the
  Fraunhofer (parallel-ray) limit; with a/L ≈ 0.058 in this geometry, the
  visual converging-rays drawing is essentially indistinguishable from the
  true parallel-ray construction.
- The two-ray pairing predicts the *m* = 1 minimum exactly. Higher-order
  minima are visible on the intensity strip but are not proved by this
  construction. (Slide 2 of the LM does the full sinc² exploration.)

---

## 4. Pedagogical role within the LM

```
[Slide 1] DERIVATION                       ← this applet
          single-slit-path-difference-demo
          "Why does the first minimum occur at a sinθ = λ?"

[Slide 2] EXPLORATION                      ← next
          single-slit-diffraction (Sim/Demo)
          "How do a, λ, L change the full pattern?"

[Slide 3] MEASUREMENT                      ← then
          single-slit-diffraction-lab (Lab)
          "Measure a from observable y₁, L, λ"
```

Slide 1 establishes WHY. Slide 2 shows BEHAVIOR over parameters. Slide 3
asks the student to measure. The progression is deliberate and the slides
should not be reordered.

---

## 5. Asset checklist for the slide-author chat

Before publishing this slide:

- [ ] Audio file generated from §2 narration, saved beside this slide
- [ ] `index.html` embedded as iSpring web object at 1280×720, full slide
- [ ] Web object permissions: allow JavaScript, allow user interaction
- [ ] Slide tested on a low-spec device (the applet uses Canvas 2D — no GPU
      dependency, but check responsiveness on the lowest device your students
      will use)
- [ ] No slide title, no extra clickable overlays on top of the applet
- [ ] If the LM has a global navigation bar (Prev / Next), make sure it does
      NOT overlap the applet's Reset button (lower-right) or the marker drag
      area (right edge of the canvas)

---

## 6. Don't change

The narration script in §2 is matched to the applet's visual sequence. Do not
edit it during slide build. If a wording change is needed, send the request
back to the build chat so the applet and narration stay in lockstep.

The applet has zero on-canvas explanatory text by design — all explanation
lives in the TTS narration. Do not add captions or overlay text "to clarify."
If something is unclear, the fix belongs in the narration, not on top of the
visual.
