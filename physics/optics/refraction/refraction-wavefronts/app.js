/* =============================================================
   Refraction at a Boundary — IBPHYS C1.3
   Mr. Frohlich Physics applet catalog · entry 01

   Pedagogy: Frequency is conserved across the boundary; wavelength
   and speed are not. Color is set by frequency (the wave's identity).

   Physics:
     v = c / n
     λ = v / f = c / (n · f)
     Wave is continuous across boundary (phase matches at interface).

   Visual conventions:
     - Color of the wave is set by the AIR wavelength (λ when n = 1),
       so it depends only on frequency. Both sides render the same color.
     - Wavelength on screen is proportional to physical wavelength,
       so Medium 2 visibly compresses/stretches relative to Medium 1.
     - Animation speed is proportional to frequency (scaled down for
       visibility) — same number of crests pass any point per second
       on both sides, reinforcing that f is conserved.
   ============================================================= */

(function () {
  'use strict';

  // ---------------------------------------------------------
  // Constants
  // ---------------------------------------------------------
  const C = 3e8;             // speed of light, m/s
  const C_NM = 3e17;         // speed of light, nm/s (used for λ in nm)

  const PX_PER_NM = 0.18;    // visual scale: pixels per nm of wavelength
                             // calibrated so f=5.45 in air ≈ 5 wavelengths per half-canvas
  const TIME_SCALE = 0.65;   // visible-Hz per (slider value in ×10¹⁴ Hz)
                             // gives ~2.6–5.1 visible crest-passings per second

  // ---------------------------------------------------------
  // State
  // ---------------------------------------------------------
  const state = {
    n1: 1.00,
    n2: 1.50,
    f:  5.45   // in units of 10^14 Hz
  };

  // ---------------------------------------------------------
  // DOM refs
  // ---------------------------------------------------------
  const $ = (id) => document.getElementById(id);

  const sliderN1   = $('slider-n1');
  const sliderN2   = $('slider-n2');
  const sliderF    = $('slider-f');

  const readoutN1  = $('readout-n1');
  const readoutN2  = $('readout-n2');
  const readoutF   = $('readout-f');

  const readoutV1  = $('readout-v1');
  const readoutV2  = $('readout-v2');
  const readoutF1  = $('readout-f1');
  const readoutF2  = $('readout-f2');
  const readoutL1  = $('readout-lambda1');
  const readoutL2  = $('readout-lambda2');

  const canvas = $('wave');
  const ctx    = canvas.getContext('2d');

  const btnPause = $('btn-pause');

  // ---------------------------------------------------------
  // Animation state
  // ---------------------------------------------------------
  const startTime = performance.now();
  let prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rafScheduled = false;

  // Pause state. Time accounting: when paused, the wave freezes at the
  // moment of pause. On resume, the duration spent paused is added to
  // pausedAccumulator so the phase continues smoothly (no visual jump).
  let paused = false;
  let pauseStartedAt = null;
  let pausedAccumulator = 0;

  // ---------------------------------------------------------
  // Wavelength → RGB (Bruton's piecewise mapping with edge falloff)
  // Input: lambda in nm. Output: [R, G, B] each 0..255.
  // ---------------------------------------------------------
  function wavelengthToRGB(lambda) {
    let r = 0, g = 0, b = 0;

    if (lambda >= 380 && lambda < 440) {
      r = -(lambda - 440) / 60; g = 0; b = 1;
    } else if (lambda >= 440 && lambda < 490) {
      r = 0; g = (lambda - 440) / 50; b = 1;
    } else if (lambda >= 490 && lambda < 510) {
      r = 0; g = 1; b = -(lambda - 510) / 20;
    } else if (lambda >= 510 && lambda < 580) {
      r = (lambda - 510) / 70; g = 1; b = 0;
    } else if (lambda >= 580 && lambda < 645) {
      r = 1; g = -(lambda - 645) / 65; b = 0;
    } else if (lambda >= 645 && lambda <= 750) {
      r = 1; g = 0; b = 0;
    }

    // Intensity falloff at far violet/red ends
    let intensity = 1.0;
    if (lambda >= 380 && lambda < 420) {
      intensity = 0.3 + 0.7 * (lambda - 380) / 40;
    } else if (lambda > 700 && lambda <= 750) {
      intensity = 0.3 + 0.7 * (750 - lambda) / 50;
    }

    const gamma = 0.8;
    const R = Math.round(255 * Math.pow(Math.max(0, r) * intensity, gamma));
    const G = Math.round(255 * Math.pow(Math.max(0, g) * intensity, gamma));
    const B = Math.round(255 * Math.pow(Math.max(0, b) * intensity, gamma));

    return [R, G, B];
  }

  // ---------------------------------------------------------
  // Numerical readouts
  // ---------------------------------------------------------
  function updateReadouts() {
    readoutN1.textContent = state.n1.toFixed(2);
    readoutN2.textContent = state.n2.toFixed(2);
    readoutF.textContent  = state.f.toFixed(2);

    const f_Hz = state.f * 1e14;
    const v1   = C / state.n1;
    const v2   = C / state.n2;
    const lam_air = C_NM / f_Hz;
    const lam1 = lam_air / state.n1;
    const lam2 = lam_air / state.n2;

    readoutV1.textContent = (v1 / 1e8).toFixed(2) + ' × 10⁸ m/s';
    readoutV2.textContent = (v2 / 1e8).toFixed(2) + ' × 10⁸ m/s';
    readoutF1.textContent = state.f.toFixed(2) + ' × 10¹⁴ Hz';
    readoutF2.textContent = state.f.toFixed(2) + ' × 10¹⁴ Hz';
    readoutL1.textContent = Math.round(lam1) + ' nm';
    readoutL2.textContent = Math.round(lam2) + ' nm';
  }

  // ---------------------------------------------------------
  // Canvas DPI handling — keeps lines crisp on retina/HiDPI screens
  // ---------------------------------------------------------
  function setupCanvas() {
    const dpr  = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = Math.max(1, Math.floor(rect.width  * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  // ---------------------------------------------------------
  // Wavelength indicator (arrow with label, drawn above the wave)
  // ---------------------------------------------------------
  function drawWavelengthIndicator(x1, x2, y, label, W) {
    if (x2 - x1 < 14) return;          // too small to read
    if (x1 < 4 || x2 > W - 4) return;  // out of canvas

    ctx.strokeStyle = '#5A6171';
    ctx.fillStyle   = '#5A6171';
    ctx.lineWidth   = 1;

    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();

    const ah = 4;
    ctx.beginPath();
    ctx.moveTo(x1, y); ctx.lineTo(x1 + ah, y - ah);
    ctx.moveTo(x1, y); ctx.lineTo(x1 + ah, y + ah);
    ctx.moveTo(x2, y); ctx.lineTo(x2 - ah, y - ah);
    ctx.moveTo(x2, y); ctx.lineTo(x2 - ah, y + ah);
    ctx.stroke();

    ctx.font         = '13px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, (x1 + x2) / 2, y - 4);
  }

  // ---------------------------------------------------------
  // Main draw routine
  // ---------------------------------------------------------
  function draw(timestampMs) {
    rafScheduled = false;

    const rect = canvas.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    ctx.clearRect(0, 0, W, H);

    // Two-medium backgrounds
    const boundaryX = W / 2;
    ctx.fillStyle = '#EFF2F5';
    ctx.fillRect(0, 0, boundaryX, H);
    ctx.fillStyle = '#F5EFE6';
    ctx.fillRect(boundaryX, 0, W - boundaryX, H);

    // Boundary line
    ctx.strokeStyle = '#2D2D2D';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(boundaryX, 0);
    ctx.lineTo(boundaryX, H);
    ctx.stroke();

    // Subtle medium labels
    ctx.fillStyle    = '#8A8A8A';
    ctx.font         = '11px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('MEDIUM 1', 14, 12);
    ctx.fillText('MEDIUM 2', boundaryX + 14, 12);

    // Compute physics
    const f_Hz       = state.f * 1e14;
    const lam_air_nm = C_NM / f_Hz;          // λ when n = 1
    const lam1_nm    = lam_air_nm / state.n1;
    const lam2_nm    = lam_air_nm / state.n2;

    const pxLam1 = lam1_nm * PX_PER_NM;
    const pxLam2 = lam2_nm * PX_PER_NM;

    // Color (driven by frequency / air-wavelength)
    const [R, G, B] = wavelengthToRGB(lam_air_nm);
    const color = `rgb(${R}, ${G}, ${B})`;

    // Time phase — same ω across boundary because frequency is conserved.
    // When paused, freeze elapsed at the moment pause started.
    const refTime     = paused ? pauseStartedAt : timestampMs;
    const elapsed     = (refTime - startTime - pausedAccumulator) / 1000;
    const visibleHz   = state.f * TIME_SCALE;
    const omegaT      = prefersReducedMotion ? 0 : 2 * Math.PI * visibleHz * elapsed;

    // Wave geometry
    const A       = H * 0.28;
    const centerY = H / 2 + 10;   // shift down a bit to leave room for λ arrows above

    // Walk pixel-by-pixel; phase increments by k*dx, where k differs per side.
    // This gives a continuous wave at the boundary (no jump) by construction.
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2.6;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';

    ctx.beginPath();
    let phase = -omegaT;
    ctx.moveTo(0, centerY + A * Math.sin(phase));
    for (let x = 1; x <= W; x++) {
      const dphase = (x <= boundaryX)
        ? (2 * Math.PI / pxLam1)
        : (2 * Math.PI / pxLam2);
      phase += dphase;
      ctx.lineTo(x, centerY + A * Math.sin(phase));
    }
    ctx.stroke();

    // λ indicators above the wave, anchored at the boundary
    const arrowY = centerY - A - 16;
    drawWavelengthIndicator(boundaryX - pxLam1, boundaryX,         arrowY, 'λ\u2081', W);
    drawWavelengthIndicator(boundaryX,         boundaryX + pxLam2, arrowY, 'λ\u2082', W);

    // Continue animation
    if (!prefersReducedMotion && !paused) {
      scheduleDraw();
    }
  }

  function scheduleDraw() {
    if (rafScheduled) return;
    rafScheduled = true;
    requestAnimationFrame(draw);
  }

  // ---------------------------------------------------------
  // Slider event wiring
  // ---------------------------------------------------------
  sliderN1.addEventListener('input', () => {
    state.n1 = parseFloat(sliderN1.value);
    updateReadouts();
    scheduleDraw();
  });
  sliderN2.addEventListener('input', () => {
    state.n2 = parseFloat(sliderN2.value);
    updateReadouts();
    scheduleDraw();
  });
  sliderF.addEventListener('input', () => {
    state.f = parseFloat(sliderF.value);
    updateReadouts();
    scheduleDraw();
  });

  // ---------------------------------------------------------
  // Pause / resume button
  // ---------------------------------------------------------
  function setPaused(p) {
    if (p === paused) return;

    if (p) {
      // Pausing: freeze elapsed at this moment.
      pauseStartedAt = performance.now();
      paused = true;
      btnPause.querySelector('.toolbar__icon').textContent = '▶';
      btnPause.querySelector('.toolbar__label').textContent = 'Resume';
      btnPause.setAttribute('aria-label', 'Resume wave animation');
      btnPause.setAttribute('aria-pressed', 'true');
    } else {
      // Resuming: add the time spent paused to the accumulator so the
      // phase continues smoothly from where it stopped.
      if (pauseStartedAt !== null) {
        pausedAccumulator += performance.now() - pauseStartedAt;
        pauseStartedAt = null;
      }
      paused = false;
      btnPause.querySelector('.toolbar__icon').textContent = '❚❚';
      btnPause.querySelector('.toolbar__label').textContent = 'Pause';
      btnPause.setAttribute('aria-label', 'Pause wave animation');
      btnPause.setAttribute('aria-pressed', 'false');
      scheduleDraw();
    }
  }

  btnPause.addEventListener('click', () => setPaused(!paused));

  // ---------------------------------------------------------
  // Resize + reduced-motion handling
  // ---------------------------------------------------------
  let resizeRaf = null;
  window.addEventListener('resize', () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      setupCanvas();
      scheduleDraw();
    });
  });

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    prefersReducedMotion = e.matches;
    document.body.classList.toggle('reduced-motion', prefersReducedMotion);
    scheduleDraw();
  });

  // ---------------------------------------------------------
  // Init
  // ---------------------------------------------------------
  document.body.classList.toggle('reduced-motion', prefersReducedMotion);
  setupCanvas();
  updateReadouts();
  scheduleDraw();

})();
