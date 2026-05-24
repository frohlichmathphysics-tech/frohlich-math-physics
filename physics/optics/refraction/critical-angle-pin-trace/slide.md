# Critical Angle — Pin Trace Lab

**Course:** IB Physics SL (Topic C.3 — Reflection and refraction)
**Tier:** Lab
**Folder:** `/physics/optics/refraction/critical-angle-pin-trace/`
**Files:** `index.html`, `protractor.js` (vendored), `slide.md`

---

## Purpose

The Lab-tier counterpart to `refraction-threshold` (Sim). Students who have already met the phenomenon — "above some angle, light going from water to air stops refracting and reflects completely back into the water" — now **measure** the critical angle θ_c for each of three colours using pin-tracing methodology.

The protocol mirrors the classical school refraction lab, with one important shift: the measurement target is the angle of incidence at the threshold (where the refracted ray exits parallel to the flat face, or equivalently, just vanishes). Students sweep, pin the threshold direction in the in-water incident beam, lift the dish, lay a ray-line tool through the pin pair, and read θ_c off an on-screen protractor. Multiple trials per colour (optional) give a spread for Δθ_c; one careful trial is sufficient to reveal.

The pedagogy connects to the Sim cleanly: the Sim tells students *what* happens; the Lab makes them *measure* it. The Reveal modal then closes the loop with the applet's expected θ_c per colour — no formula derivation, no n-calculation step in between. (The relationship θ_c = arcsin(1/n) belongs in the lesson narration that frames this applet, not in the applet itself.)

The applet is fully self-contained: no external libraries, no CDN, no persistence, no PDF export. The single HTML file plus the vendored protractor module is the entire deliverable.

---

## Build description

The applet renders an 800 × 720 canvas with a semicircular water dish whose **curved face sits ABOVE** and **flat face sits BELOW**. Geometry inherited verbatim from `refraction-threshold`: vertex at (400, 460); curved face apex at (400, 310); flat face at y = 460, spanning x ∈ [250, 550] in the apparatus and full canvas width when revealed as paper trace.

A laser pen pivots on a 250 px arc above the curved face. Dragging the pen sets the angle of incidence, clamped between 0° and 80° on either side of the normal — **normal incidence is reachable** (THETA_MIN = 0). The laser pen graphic (black cylinder, coloured tip cap, grip ring) is taken directly from the Sim. Three colour buttons switch the active beam wavelength; switching colour preserves the laser position, all placed pins, all ray-line states, the protractor position, and the trial table. A **Laser [ON/OFF]** toggle hides the entire beam stack while leaving the laser body visible in a faded form. A **Spray (mist) [OFF]** toggle (default OFF, matching Lab tier convention) shows or hides the incident-side in-air beam between the laser tip and the curved-face entry point.

Inside the water, the beam renders as a colour-matched wedge band — zero width at the vertex, 12 px at the curved-face entry — with stochastic deterministic grain (seeded by laser angle, active colour, and a beam-section key). The in-air incident beam (when spray is on) follows the same wedge convention. There is no explicit centreline — the locked spread-uncertainty pedagogy carries over from both predecessor applets.

At the vertex, three beams emerge. The **refracted beam** (in air, below the flat face) extends 200 px below the flat face in the Snell-correct direction; its far-end width is computed from Snell differentiation, Δθ₂ = n (cos θ₁ / cos θ₂) Δθ₁ with Δθ₁ ≈ 2.75°, capped at 80 px. The **reflected beam** (in water, back into the dish) bounces off the flat face at angle θ₁ and exits the curved face on the side opposite the laser, undeflected (radial geometric property of the dish). The **reflected-exit beam** in air continues 80 px past the curved face, fading from full Fresnel-modulated alpha to zero via a linear gradient. Above the critical angle the refracted beam vanishes entirely; the reflected beam is at full intensity.

Beam intensities follow the same unpolarized Fresnel √-boost rendering as the Sim: reflected α = √R, refracted α = √(1−R). The √-boost stretches the dramatic part of the Fresnel curve into the last 10° before θ_c, making the brightening-reflected / fading-refracted transition pedagogically visible. **This is the visual cue students use to locate the threshold for pinning** — at α slightly below θ_c, the refracted ray fades hard while the reflected ray brightens to near-full, and the refracted wedge spreads wide as Δθ₂ blows up.

**The Sim's auto-readout artifacts are dropped here.** No threshold-observations panel, no on-canvas θ₁/θ₂ pills. Students must measure with the protractor; the Lab cannot spoil its own measurement.

Students click the canvas to place pins (4 px filled circles with a 10 px stem shadow). Right-click removes a pin; dragging a pin off the canvas removes it. Pins are draggable in both apparatus and lifted modes. The **Lift dish** button cross-fades the apparatus over 400 ms and reveals the paper trace layer underneath: a 1 px navy full-canvas-width flat-face line at y = 460, a 1 px navy curved-face arc above (apex at y = 310), a small vertex registration dot, and a 1.5 px red C00000 dashed normal extending 75 px each side of the vertex. The beam stack is tied to apparatus alpha — when the dish is lifted, beams are gone (matching physical reality: no water, nothing to refract).

With the dish lifted (or in apparatus mode — the ray-line tools are not gated by mode), students turn on **Ray 1** and **Ray 2**. Each ray-line tool is two square endpoint handles connected by a line passing through both and extending to the canvas edges. **Ray 1 (navy)** — student aligns through the two incident-beam pins. **Ray 2 (violet)** — student lays along the flat face, providing geometric confirmation that the refracted ray at θ_c is parallel to the surface (θ₂ = 90°). Lines persist across mode toggles and colour switches.

A vendored protractor module (`protractor.js`) toggles on top of the scene, fully translatable and rotatable with no snap. Pointer event priority: protractor → ray-line endpoints → pins → laser body → empty-canvas pin placement. Verbatim from `refraction-water-pin-trace`.

The data sidebar holds a minimal trial table with four columns: `#`, `Colour`, `θc ± Δθc`, flag indicator (`⚠`). A two-input entry form adds rows tagged with the currently active colour. Each new row is silently checked: flagged if θc is outside [25°, 75°] or deviates from the colour's expected θc by more than 8°. The yellow row + footer note pattern is identical to `refraction-water-pin-trace`; the flag wording is intentionally vague and the threshold logic is never disclosed.

The **Reveal results** button unlocks at **one or more trials** (any colour). It opens a two-stage modal:
- *Input stage*: per-colour `θc ± Δθc` inputs, enabled for any colour with at least one trial. The student can take the mean of their trials (with spread giving Δθc) or use a single best measurement.
- *Compare stage*: a three-column table — `Color`, `Your result`, `Expected θc`. No applet-check column (the comparison is direct: student's measurement vs the applet's locked expected value per colour). Values formatted per IB sig-fig convention (Δ to 1 sig fig, or 2 if the leading digit is 1; value rounded to the same decimal place).

A Reset button clears student inputs and returns to the input stage.

Layout uses a fixed 800 px canvas column plus a fixed 380 px sidebar with a 20 px gap; the whole 1200 px block is centred on viewports up to a max-width of 1248 px. The sidebar wraps below the canvas on viewports narrower than ~1248 px and expands to full width on viewports narrower than 720 px.

Stack: vanilla JS + Canvas 2D, single HTML file, no CDN, no localStorage, no service workers. DPR-aware canvas. Tablet-friendly (`touch-action: none`, pointer capture on drags).

---

## Physics notes

**Locked indices, exaggerated for clarity (inherited from `refraction-threshold`):**

| Colour | n (applet) | θc (applet) | n (real water, ~20 °C) | θc (real) |
|---|---|---|---|---|
| Red    | 1.33 | 48.75° | ≈ 1.331 | ≈ 48.78° |
| Green  | 1.42 | 44.77° | ≈ 1.337 | ≈ 48.42° |
| Violet | 1.50 | 41.81° | ≈ 1.344 | ≈ 48.05° |

Real dispersion of water across the visible spectrum gives about 0.3° of spread in critical angle — undetectable with a school-grade protractor. The exaggerated indices produce roughly 7° of spread between red and violet, comfortably measurable at the protractor's 1° resolution, while keeping the relative ordering (red < green < violet in n, so red > green > violet in θc) physically correct.

**Snell's law:** n_water sin θ₁ = n_air sin θ₂, with n_air = 1.00.

**Critical angle:** θ_c = arcsin(1/n_water). When θ₁ ≥ θ_c, the refracted ray vanishes and all light is reflected back into the water.

**Refracted ray direction:** The parallel component of the wave-vector is conserved at the surface, so the refracted ray continues in the same horizontal direction as the incident ray. If the laser is upper-left of the normal, the incident ray travels down-right, and the refracted ray (when present) travels down-right — bending *away* from the normal because water → air goes from dense to less dense.

**Reflected ray direction:** The angle of reflection equals the angle of incidence, both measured from the normal. The reflected ray exits the curved face on the opposite side from the laser, undeflected at the curved face (radial property of the semicircular dish).

**Threshold-detection visual cue:** Two effects converge in the last ~3° before θ_c. (1) Fresnel R rises from ~13% to 100%; the √-boost rendering makes the reflected band brighten visibly. (2) Snell differentiation makes Δθ₂ blow up — the refracted band fans out and dims. The student locates the threshold by watching either signal. After pinning, lifting the dish, and measuring θ₁ with the protractor through the incident-beam pin pair, the value θ_c is determined.

**Pin-tracing geometry (note for teachers):** In a real bench TIR lab, students place pins on paper *outside* the dish along the visible in-air beams. In this applet's geometry — water *inside* the dish, air below — the in-water incident beam runs from curved-face entry to vertex, *inside* the dish footprint. The applet allows pins to be placed anywhere on the canvas (including over the dish footprint), which doesn't correspond to a literal pin-in-paper but does correspond to the equivalent pencil-mark-on-paper students would make if the dish were transparent and the paper were behind it. The lifted-dish reveal restores the paper-trace geometry and the pins remain at their canvas positions for ray-line alignment.

**Silent trial-flagging thresholds:** A trial is flagged if θ_c < 25° or θ_c > 75° (well outside any plausible water → air critical angle), or if |θ_c − expected| > 8° for the active colour. Thresholds are intentionally generous to avoid nagging honest noisy data; the typical Δθ_c a student will report (1°–3°) sits comfortably inside the flag-free range. The flag wording never reveals the threshold logic or the expected θ_c.

**No applet-cross-check on student analysis.** Unlike `refraction-water-pin-trace` (which provides a min-max-through-origin slope check on n), this applet's Reveal stage compares student value directly against the locked expected θ_c. The reasoning: for a direct critical-angle measurement, there is no qualitatively different analytical method the applet could perform that the student couldn't; an "applet check" computed from the same trial data as the student's mean would be redundant. The comparison is honest: did you measure the threshold accurately, within your stated reading uncertainty?
