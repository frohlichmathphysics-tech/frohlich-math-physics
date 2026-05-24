# Refraction in Water — Pin Trace Lab

**Course:** IB Physics SL (Topic C.3 — Reflection and refraction)
**Tier:** Lab
**Folder:** `/physics/optics/refraction/refraction-water-pin-trace/`
**Files:** `index.html`, `protractor.js` (vendored), `slide.md`

---

## Purpose

A standalone, single-file pin-trace refraction lab that supports two distinct teaching uses:

**1. Pre-Snell's-law investigation.** Students collect raw pairs of incidence and refraction angles for a single colour without ever being shown the sine relationship. They plot θ₁ vs θ₂ themselves, observe it isn't linear, and are prompted to discover what function would describe the angle relationship. The applet deliberately does not display per-trial sin values or computed indices anywhere visible — that path of discovery is preserved.

**2. Post-Snell's-law IA.** Students collect data across multiple colours, apply whichever analysis method their teacher prescribes (typically a graph of sin θ₂ vs sin θ₁ where slope = n), then enter their calculated n and uncertainty into the Reveal modal to compare with the applet's internal cross-check and the expected indices.

In either mode the workflow is the same: aim the laser, place pins along the visible incident and exit beams, lift the dish to reveal the paper trace, align two virtual ray-line tools through the pin pairs, and measure the angles with an on-screen protractor. Three laser colours (red, green, violet) with intentionally exaggerated indices make dispersion visible at the resolution of the protractor and let dispersion comparisons happen with real measurable separation.

The applet is fully self-contained: no external libraries, no CDN, no persistence, no PDF export. The single HTML file plus the vendored protractor module is the entire deliverable.

---

## Build description

The applet renders an 800×600 canvas with a semicircular dish whose flat face sits along the horizontal centreline. The vertex (centre of the flat face) is the entry point of every refracted ray. A laser pen pivots on a 250 px arc above the flat face; dragging the pen sets the incidence angle, clamped between 0° and 80° on either side of the normal. Normal incidence (0°) is permitted and pedagogically important — students can observe directly that light perpendicular to the surface passes through without bending, and the resulting (0, 0) measurement is the natural anchor data point for a proportional fit through the origin. A **Laser ON/OFF** toggle hides the entire beam stack (laser body, incident spray, in-water band, exit band) when needed, leaving pins, dish, and paper trace untouched. Three colour buttons switch the active beam wavelength; switching colour preserves the laser position, all placed pins, all ray-line states, and the trial table.

Inside the dish the beam renders as a colour-matched wedge-shaped band — zero width at the vertex, 12 px at the exit point on the curved face — with stochastic grain texture. There is no explicit centreline; students must judge the centre of the band from its geometry, and that judgement is the spread-uncertainty pedagogy. The same band continues past the curved face for 80 px, fading to transparent. A **Spray (mist)** toggle reveals the incident-side ray between laser tip and vertex; off by default to match real pin-trace practice. The refraction direction obeys Snell's parallel-wave-vector convention: the refracted ray travels in the same horizontal direction as the incident ray, bent toward the normal.

Students click the canvas to place pins (4 px filled circles with a 10 px stem shadow). Right-click removes a pin; dragging a pin off the canvas also removes it. Pins are draggable in both apparatus and lifted modes. The **Lift dish** button cross-fades the apparatus out over 400 ms and reveals the paper-trace layer underneath: a 1 px navy flat-face line, a 1 px navy curved-face arc, a small vertex dot, and an auto-drawn 1.5 px red dashed normal extending 75 px above and below the vertex.

With the dish lifted (or at any time, really — the ray-line tools are not gated by mode), students turn on **Ray 1** and **Ray 2**. Each ray-line tool appears as two square endpoint handles connected by a line that passes through both handles and extends to the canvas edges. Ray 1 is rendered in navy, Ray 2 in violet, to distinguish them from each other and from the protractor (teal). Drag either endpoint to position the line — this is the virtual-ruler workflow that mirrors real lab practice of laying a ruler across two pins to draw a line. Lines persist across mode toggles and colour switches.

A vendored protractor module (`protractor.js`) toggles on top of the scene, fully translatable and rotatable with no snap. Pointer event priority is: protractor → ray-line endpoints → pins → laser body → empty-canvas pin placement.

The data sidebar holds a deliberately minimal trial table with only five columns: #, Colour, θ₁ ± Δθ₁, θ₂ ± Δθ₂, and a flag indicator (`!`). No sin θ or per-trial n columns are shown — these would compromise the investigation pedagogy. A four-input entry form adds rows tagged with the currently active colour. Each new row is silently checked: if the implied refractive index for that single trial is unphysical (n < 0.9 or n > 2.0) or deviates from the colour's expected n by more than 0.20, the row is highlighted in soft yellow with a `⚠` marker and an explanatory note appears below the table reading *"Yellow rows look inconsistent with the rest of your trials. Please verify those angle readings."* The flag wording is deliberately vague; it never reveals what relationship the applet is checking against.

The **Reveal results** button unlocks at three or more trials of any one colour. It opens a two-stage modal: first an input panel asking *"Calculate the index of refraction of water using the method your teacher determines. From your calculations, what is the index of refraction of water?"* with `n ± Δn` fields per colour (disabled for any colour with fewer than three trials); then a comparison table showing the student's value, the applet's own cross-check, and the expected value. The comparison table values are formatted per IB sig-fig convention: uncertainty rounded to one significant figure (two if the leading digit is one), and the value rounded to the same decimal place as the uncertainty. The accompanying note states only that the applet check is computed from the raw angle data with propagated Δθ uncertainty and is a sanity check rather than the assessment — without disclosing the underlying graphical method or the min/max formula. A Reset button clears the student inputs and returns to the input stage for re-entry.

Layout uses a fixed 800 px canvas column plus a fixed 380 px data sidebar with a 20 px gap; the whole 1200 px block is centred on viewports up to a max-width of 1248 px. The sidebar wraps below the canvas only on viewports narrower than ~1248 px (when it can no longer fit beside the canvas) and expands to full width only on viewports narrower than 720 px. The trial table uses `table-layout: fixed` with explicit per-column widths so columns cannot re-auto-size during browser zoom.

Stack: vanilla JS + Canvas 2D, single HTML file, no CDN, no localStorage, no service workers. DPR-aware canvas. Tablet-friendly (`touch-action: none`, pointer capture on drags).

---

## Physics notes

**Locked indices, exaggerated for clarity:**

| Colour | n (applet) | n (real water, ~20 °C) |
|---|---|---|
| Red    | 1.33 | ≈ 1.331 |
| Green  | 1.42 | ≈ 1.337 |
| Violet | 1.50 | ≈ 1.344 |

Real chromatic dispersion in water across the visible spectrum is only about 0.01 — well below the resolution of a paper-and-protractor lab. The exaggerated values make dispersion measurable with the tools the applet provides while keeping the relative ordering (red < green < violet) realistic.

**Snell's law:** n₁ sin θ₁ = n₂ sin θ₂, with n_air = 1.00. The refracted ray angle inside water is θ₂ = arcsin(sin θ₁ / n).

**Refracted ray direction:** The parallel component of the wave-vector is conserved at the surface, so the refracted ray travels in the same horizontal direction as the incident ray (down-right when the laser is upper-left; down-left when the laser is upper-right). The refracted ray bends *toward* the normal (smaller angle from vertical) because water is denser than air.

**Semicircular-dish geometry:** The refracted ray starts at the vertex and exits the curved face along the radial direction. Because the outward normal at any point on the curved face is the radius from the vertex, the ray strikes the curved face at exactly 0° of incidence and exits undeflected. This is the geometric reason a semicircular dish is the standard pin-trace refraction apparatus — refraction happens only once, at the flat face, where the geometry is being measured.

**Uncertainty pedagogy:** The visible beam is a band, not a thin line. Pin scatter, plus the student's judgement of the band centre, give a non-zero Δθ at every measurement. The applet's table records only raw θ measurements with student-stated Δθ; computed quantities and n values are never displayed (so the investigation pedagogy is preserved and so that students cannot bypass graphical analysis by averaging a column of per-trial n values).

**Applet cross-check formula (computed internally, not displayed):**
- Best-fit slope through origin: m_best = Σ xᵢ yᵢ / Σ xᵢ², with x = sin θ₂ and y = sin θ₁ (so slope = n directly).
- Min slope: m_min = MAX over i of (yᵢ − Δyᵢ) / (xᵢ + Δxᵢ).
- Max slope: m_max = MIN over i of (yᵢ + Δyᵢ) / (xᵢ − Δxᵢ).
- Δn = (m_max − m_min) / 2.
- If m_min > m_max, the data is flagged as inconsistent (error bars too tight for any line through the origin to pass through every box).
- Δ(sin θ) = cos θ · Δθ with Δθ converted to radians (linear propagation).

The applet check is a sanity check on the student's hand analysis, not the assessment. The teacher's prescribed method is what gets graded.

**Silent trial-flagging threshold:** A single trial is flagged if its implied n is outside the range [0.9, 2.0] or deviates from the colour's expected n by more than 0.20 in absolute value. The threshold is intentionally generous to avoid false-flagging legitimate measurement noise; only clear transcription or measurement errors get caught. The flag wording never reveals the threshold logic or the expected n. The normal-incidence anchor — both θ₁ and θ₂ below 0.5° — is exempt from flagging: the per-trial n is mathematically undefined (0/0) but the data point itself is valid and pedagogically valuable for through-origin fitting.

**Sig-fig display convention** (Reveal modal):
- Δ is rounded to 1 sig fig, or to 2 sig figs if the leading digit of Δ is 1.
- The value is rounded to the same decimal place as the rounded Δ.
- Example: 1.396 ± 0.029 → "1.40 ± 0.03"; 1.396 ± 0.015 → "1.396 ± 0.015".

This matches IB IA reporting convention.
