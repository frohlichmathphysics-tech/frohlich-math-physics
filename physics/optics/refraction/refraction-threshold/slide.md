# Refraction Threshold — Water to Air (Sim)

**Course:** IB Physics SL (Topic C.3 — Reflection and refraction)
**Tier:** Sim
**Folder:** `/physics/optics/refraction/refraction-threshold/`
**Files:** `index.html`, `slide.md`

---

## Purpose

The first of a two-applet set on total internal reflection. This Sim is the **phenomenon-discovery** half — students sweep a laser through angles of incidence inside a water dish and observe (without measurement) that above some angle the refracted ray stops appearing. The angles are auto-displayed on the canvas; there are no pins, no protractor, no trial table, no commit-then-reveal modal. The companion measurement applet (`critical-angle-pin-trace`, to be built next) handles the quantitative side.

The pedagogy mirrors how Mr. F has always taught TIR: identify the phenomenon first ("when light goes from a slow medium to a fast medium and the incidence angle is large enough, refraction stops happening"), then do the math. This applet is the identification step. The angle readouts let students articulate the discovery from the labels themselves without the applet pre-naming what they're seeing.

The applet is fully self-contained: no external libraries, no CDN, no persistence, no PDF export. The single HTML file is the entire deliverable.

---

## Build description

The applet renders an 800 × 720 canvas with a semicircular water dish whose **curved face sits ABOVE** and **flat face sits BELOW**. This is the geometric inversion of `refraction-water-pin-trace`: water inside the dish, air below. The vertex (centre of the flat face) sits at (400, 460); curved face apex at (400, 310); flat face spans x ∈ [250, 550] at y = 460.

A laser pen pivots on a 250 px arc above the curved face. Dragging the pen sets the angle of incidence, clamped to between 0° and 80° on either side of the normal (normal incidence is included, since this Sim tier has no pin-tracing). The laser pen graphic (black cylinder with coloured tip cap and grip ring) is taken directly from the refraction lab, oriented to point radially at the vertex. Three colour buttons switch the active beam wavelength; switching colour preserves the laser position and the threshold-observations panel state. A **Laser ON/OFF** toggle hides the entire beam stack while leaving the laser body visible (in a faded form, so the student understands its position), and a **Spray (mist) [ON]** toggle (default ON) shows or hides the incident-side in-air beam between the laser tip and the curved-face entry point.

Inside the water, the beam renders as a colour-matched wedge band — zero width at the vertex, 12 px at the curved-face entry — with stochastic deterministic grain (seeded by laser angle, active colour, and a beam-section key, so each beam has a stable per-render pattern that updates smoothly during sweeps). The same wedge convention applies to the in-air incident beam (laser tip to curved-face entry). There is no explicit centreline — the locked spread-uncertainty pedagogy from the refraction lab carries over even though this applet doesn't have a measurement step.

At the vertex three beams emerge. The **refracted beam** (in air, below the flat face) travels along the Snell-correct direction (parallel wave-vector preserved: same horizontal direction as the incident ray) and extends 200 px below the flat face. Its far-end width is computed from Snell differentiation, Δθ₂ = n (cos θ₁ / cos θ₂) Δθ₁, with Δθ₁ ≈ 2.75° inherited from the refraction lab's incident-band geometry; the width is capped at 80 px so the rendering stays bounded at the edge of the critical angle. The **reflected beam** (in water, back into the dish) bounces off the flat face at angle θ₁ and exits the curved face on the side opposite the laser (by the radial geometric property of the dish, the reflected ray exits the curved face undeflected). The **reflected-exit beam** in air continues 80 px past the curved face, fading from full Fresnel-modulated alpha to zero via a linear gradient. Above the critical angle the refracted beam vanishes entirely and the reflected beam is at full intensity.

The intensity of the reflected and refracted beams is computed from the **unpolarized Fresnel reflectance** R(θ₁) — the average of s-polarization and p-polarization reflectances for the water → air interface. Reflected-beam alpha is set to √R; refracted-beam alpha is set to √(1−R). The square-root boost stretches the dramatic part of the Fresnel curve into roughly the last 10° before the critical angle, making the brightening-reflected / fading-refracted transition pedagogically visible across a range students will actually sweep through. At normal incidence the reflected ray sits at √(0.02) ≈ 14% alpha — faint but visible, matching the physical reality that partial reflection always exists, just weakly at small angles. Energy conservation holds in the rendering: the two band alphas always sum to (approximately) the base alpha, with the crossover landing in the last few degrees before the critical angle.

Two angle pills float near each beam: a θ₁ pill positioned along the in-water incident beam, offset perpendicular to clear the beam, and a θ₂ pill along the refracted beam. The pills render as semi-transparent cream rounded rectangles with thin navy borders and navy text in 13 px Cambria serif. Above the critical angle the θ₂ pill becomes "θ₂ = —" — a neutral dash, not a "TIR" label, preserving the discovery framing per the locked decision.

A red `#C00000` dashed normal line runs through the vertex, 75 px each side, always visible. Matches the refraction lab's paper-trace styling so the two applets visually link even though the normal lives on different layers (paper-trace in the lab, apparatus in this Sim).

The data sidebar holds only the **Threshold observations** panel: three rows, one per colour, each with a colour swatch and a value cell that starts blank with placeholder text *"— sweep to find —"*. Each row fills in when the student has been **both below and at-or-above** the critical angle for that colour — i.e., when they've actually crossed the threshold during exploration. The filled value displays the true θ_c for that colour (e.g., "θ = 48.8°"), rounded to one decimal place. The neutral terminology ("threshold," not "critical angle") preserves the discovery framing in the applet; the lesson that uses the applet introduces the formal term.

Layout uses a fixed 800 px canvas column plus a fixed 380 px sidebar with a 20 px gap; the whole 1200 px block is centred on viewports up to a max-width of 1248 px. Sidebar wraps below the canvas on viewports narrower than ~1248 px and expands to full width on viewports narrower than 720 px — same responsive behaviour as the refraction lab.

Stack: vanilla JS + Canvas 2D, single HTML file, no CDN, no localStorage, no service workers. DPR-aware canvas. Tablet-friendly (`touch-action: none`, pointer capture on laser drag).

---

## Physics notes

**Locked indices, exaggerated for clarity (carried from refraction-water-pin-trace):**

| Colour | n (applet) | θc (applet) | n (real water, ~20 °C) | θc (real) |
|---|---|---|---|---|
| Red    | 1.33 | 48.75° | ≈ 1.331 | ≈ 48.78° |
| Green  | 1.42 | 44.77° | ≈ 1.337 | ≈ 48.42° |
| Violet | 1.50 | 41.81° | ≈ 1.344 | ≈ 48.05° |

Real dispersion of water across the visible spectrum gives about 0.3° of spread in critical angle — undetectable with a school-grade protractor. The exaggerated indices produce roughly 7° of spread between red and violet, comfortably visible and pedagogically useful, while keeping the relative ordering (red < green < violet in n, so red > green > violet in θc) physically correct.

**Snell's law:** n_water sin θ₁ = n_air sin θ₂, with n_air = 1.00. The refracted angle in air is θ₂ = arcsin(n_water sin θ₁) when this is ≤ 1; otherwise no refracted ray exists (TIR).

**Critical angle:** θ_c = arcsin(1/n_water). When θ₁ ≥ θ_c, the refracted ray vanishes and all light is reflected back into the water.

**Refracted ray direction:** The parallel component of the wave-vector is conserved at the surface, so the refracted ray continues in the same horizontal direction as the incident ray. If the laser is upper-left of the normal, the incident ray travels DOWN-RIGHT, and the refracted ray (when present) travels DOWN-RIGHT — bending *away* from the normal because water → air goes from dense to less dense.

**Reflected ray direction:** The angle of reflection equals the angle of incidence, both measured from the normal. The reflected ray travels UP-OPPOSITE — same horizontal direction as the refracted ray would, but into the water.

**Semicircular-dish geometry:** The curved face's outward normal at any point is along the radial direction from the vertex. A ray entering or exiting the curved face along a radial line strikes the surface at 0° incidence and is undeflected. This is why the laser appears to enter the water "magically" at the curved face — the in-air incident ray and the in-water incident ray are collinear at the entry point. Same geometric reason a semicircular dish is the standard pin-trace refraction apparatus.

**Fresnel reflectance (unpolarized, water → air, below θ_c):**

- s-polarization: r_s = (n cos θ₁ − cos θ₂) / (n cos θ₁ + cos θ₂)
- p-polarization: r_p = (n cos θ₂ − cos θ₁) / (n cos θ₂ + cos θ₁)
- Unpolarized: R = (r_s² + r_p²) / 2

For red (n = 1.33) the curve runs:

| θ₁ | R | √R (rendered reflected α) | √(1−R) (rendered refracted α) |
|---|---|---|---|
| 10° | 0.020 | 14% | 99% |
| 30° | 0.025 | 16% | 99% |
| 40° | 0.054 | 23% | 97% |
| 45° | 0.134 | 37% | 93% |
| 47° | 0.247 | 50% | 87% |
| 48° | 0.394 | 63% | 78% |
| 48.5° | 0.579 | 76% | 65% |
| 48.7° | 0.776 | 88% | 47% |
| 48.75° = θ_c | 1.000 | 100% | 0% |
| above θ_c | 1.000 | 100% | 0% |

The dramatic transition happens in the last ~3° before the critical angle. The √-boost stretches this visibly: students sweeping through 40°–48° see the reflected ray noticeably brighten and the refracted ray noticeably fade.

**Refracted-beam spread:** Snell differentiation gives Δθ₂ = n (cos θ₁ / cos θ₂) Δθ₁. As θ₂ → 90°, cos θ₂ → 0 and Δθ₂ blows up. The applet renders the refracted band as a wedge of geometric width 2 × 200 × tan(Δθ₂/2), capped at 80 px. The cap kicks in within the last ~0.5° before θ_c, and at that point the band's alpha is also fading hard via √(1−R), so the cap rarely shows undimmed — the visual is a fan that broadens and dims toward the critical angle, then disappears.

**Threshold-detection logic:** A row in the observations panel fills in when the student has been *both* below the critical angle and at-or-above it for that colour during the session. The applet displays the true θ_c — not the student's last-visited angle — so the panel is reporting the underlying truth, not the measurement (the measurement is the companion lab applet's job). The filled state persists across colour switches and laser off/on; no reset within a session.
