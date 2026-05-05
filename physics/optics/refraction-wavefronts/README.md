# Refraction at a Boundary — IBPHYS C1.3

Catalog handle: `applet:IBPHYS_C1.3_refraction-wavefronts`
Catalog entry: 01 (first applet in the Frohlich Physics catalog)
Last updated: 2026-05-04

## What this applet shows

A monochromatic light wave passes from Medium 1 into Medium 2. The student
controls:

- `n₁` — index of refraction of Medium 1 (1.00 to 2.50)
- `n₂` — index of refraction of Medium 2 (1.00 to 2.50)
- `f`  — frequency of the light, in 10¹⁴ Hz (4.00 to 7.90 — the visible range)

The applet displays:

- A continuous sinusoidal wave that compresses or stretches as it crosses
  the boundary, depending on the index ratio.
- Color of the wave determined by frequency (the wave's identity). Because
  frequency is conserved across the boundary, the color is the same on both
  sides — only wavelength changes.
- Numerical readouts of v, f, λ for each medium.
- λ arrows above the wave anchored at the boundary, making the wavelength
  difference visually explicit.

## Pedagogical anchor (per Applet_Creation §8)

The applet is designed to support the central insight that **frequency is
the identity of a light wave**, while wavelength and speed are properties
of the medium. The set/observe/predict/verify/explain cycles live in the
student notes PDF, not in the applet itself.

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

## Deployment (Netlify)

1. Drag the entire `IBPHYS_C1.3_refraction-wavefronts/` folder onto the
   Netlify deploy drop zone.
2. Netlify returns a URL.
3. Verify on a phone — touch dragging, layout fit, performance.
4. Add the URL to the Applet_Creation §4 catalog entry.

For updates: drag the same folder onto the same site again. URL stays
stable; browser caches expire naturally over days/weeks.
