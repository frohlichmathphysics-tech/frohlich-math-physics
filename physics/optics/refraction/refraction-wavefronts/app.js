/* =============================================================
   Refraction at a Boundary — IBPHYS C1.3
   Mr. Frohlich Physics applet catalog · entry 01

   Pedagogy: Frequency is conserved across the boundary; wavelength
   and speed are not. Color is set by frequency (the wave's identity).
   A small amplitude drop appears at each boundary — conceptual stand-in
   for partial reflection — to seed the "where did the energy go?"
   discussion. (Simplification flagged per Applet_Creation §0.1; the
   real Fresnel amplitude is much smaller at typical index ratios.)

   Geometry: three equal regions across the canvas.
     Region 1 (left  third) — Medium 1
     Region 2 (middle third) — Medium 2
     Region 3 (right  third) — Medium 1 (returned)
   n3 = n1 by construction. No separate slider for region 3.

   Two waves rendered:
     Top band:    a Gaussian wave-packet pulse, fires on "Pulse" click.
                  Carrier frequency = f. Pulse duration = 4 periods
                  (visible width); σ_t = 1 period.
     Bottom band: a continuous monochromatic wave (the original applet).

   Physics formulation (used for BOTH waves):
     For each pixel x, compute the emission time τ_emit(x, t) — the time
     at which the wavefront now visible at x left the source.
       Region 1: τ_emit = t - x/v1
       Region 2: τ_emit = t - xb1/v1 - (x-xb1)/v2
       Region 3: τ_emit = t - xb1/v1 - (xb2-xb1)/v2 - (x-xb2)/v3
     Wave value at x:
       Continuous: y = A · factor(x) · cos(ω · τ_emit)
       Pulse:      y = A · factor(x) · Σ_p [env(τ_emit - τ_cp) · cos(ω·(τ_emit - τ_cp))]
       where env(τ) = exp(-τ²/(2σ_t²))
       and factor(x) = 1 in region 1, k in region 2, k² in region 3
       with k = 1 - 0.5 · |n2-n1|/(n1+n2).

   Phase is continuous across boundaries (frequency conserved).
   Amplitude is NOT — the step IS the visible partial-transmission cue.
   ============================================================= */

(function () {
  'use strict';

  // ---------------------------------------------------------
  // Constants
  // ---------------------------------------------------------
  const C = 3e8;
  const C_NM = 3e17;

  const PX_PER_NM = 0.18;     // visual scale: pixels per nm of wavelength
  const TIME_SCALE = 0.65;    // visible-Hz per (slider value in ×10¹⁴ Hz)

  const PULSE_SIGMA_PERIODS = 1.0;   // σ_t in periods; visible packet ≈ 4 periods wide
  const PULSE_AGE_MARGIN = 4.0;      // extra σ_t after expected exit before pruning
  const ENV_PRUNE = 1e-3;            // envelope threshold below which a pulse contributes ~nothing

  // ---------------------------------------------------------
  // State
  // ---------------------------------------------------------
  const state = {
    n1: 1.00,
    n2: 1.50,
    f:  5.45   // ×10¹⁴ Hz
  };

  // Active pulses: each element is { tau_c } (emission-peak time, seconds, in elapsed-time clock)
  const activePulses = [];

  // Draggable horizontal reference lines.
  // Stored as fractions of canvas height so they survive resize.
  // Default: at the continuous wave's region-1 peak / trough
  // (contCenterY = 0.70·H, A = 0.10·H → peak = 0.60·H, trough = 0.80·H).
  const refLines = {
    topFrac:     0.60,
    botFrac:     0.80,
    dragging:    null,   // 'top' | 'bot' | null
    dragOffset:  0       // y-offset between pointer and line at drag start (px)
  };
  const REF_HIT_RADIUS = 12;   // pixels — how close pointer must be to grab a line

  let valuesHidden = false;

  // ---------------------------------------------------------
  // DOM refs
  // ---------------------------------------------------------
  const $ = (id) => document.getElementById(id);

  const sliderN1 = $('slider-n1');
  const sliderN2 = $('slider-n2');
  const sliderF  = $('slider-f');

  const readoutN1 = $('readout-n1');
  const readoutN2 = $('readout-n2');
  const readoutF  = $('readout-f');

  const readoutV1 = $('readout-v1');
  const readoutV2 = $('readout-v2');
  const readoutV3 = $('readout-v3');
  const readoutF1 = $('readout-f1');
  const readoutF2 = $('readout-f2');
  const readoutF3 = $('readout-f3');
  const readoutL1 = $('readout-lambda1');
  const readoutL2 = $('readout-lambda2');
  const readoutL3 = $('readout-lambda3');

  const canvas = $('wave');
  const ctx    = canvas.getContext('2d');

  const btnPause       = $('btn-pause');
  const btnPulse       = $('btn-pulse');
  const btnToggleVals  = $('btn-toggle-values');
  const readoutsEl     = $('readouts');

  // ---------------------------------------------------------
  // Animation state
  // ---------------------------------------------------------
  const startTime = performance.now();
  let prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rafScheduled = false;

  let paused = false;
  let pauseStartedAt = null;
  let pausedAccumulator = 0;

  // Returns current elapsed seconds, freezing while paused
  function getElapsed(nowMs) {
    const refTime = paused ? pauseStartedAt : nowMs;
    return (refTime - startTime - pausedAccumulator) / 1000;
  }

  // ---------------------------------------------------------
  // Wavelength → RGB (Bruton's piecewise mapping with edge falloff)
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
    const v3   = v1;
    const lamAir = C_NM / f_Hz;
    const lam1 = lamAir / state.n1;
    const lam2 = lamAir / state.n2;
    const lam3 = lam1;

    readoutV1.textContent = (v1 / 1e8).toFixed(2) + ' × 10⁸ m/s';
    readoutV2.textContent = (v2 / 1e8).toFixed(2) + ' × 10⁸ m/s';
    readoutV3.textContent = (v3 / 1e8).toFixed(2) + ' × 10⁸ m/s';
    readoutF1.textContent = state.f.toFixed(2) + ' × 10¹⁴ Hz';
    readoutF2.textContent = state.f.toFixed(2) + ' × 10¹⁴ Hz';
    readoutF3.textContent = state.f.toFixed(2) + ' × 10¹⁴ Hz';
    readoutL1.textContent = Math.round(lam1) + ' nm';
    readoutL2.textContent = Math.round(lam2) + ' nm';
    readoutL3.textContent = Math.round(lam3) + ' nm';
  }

  // ---------------------------------------------------------
  // Canvas DPI handling
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
  // Emission time at x given current elapsed t
  // ---------------------------------------------------------
  function emissionTime(x, t, xb1, xb2, v1px, v2px, v3px) {
    if (x <= xb1) return t - x / v1px;
    if (x <= xb2) return t - xb1 / v1px - (x - xb1) / v2px;
    return t - xb1 / v1px - (xb2 - xb1) / v2px - (x - xb2) / v3px;
  }

  // ---------------------------------------------------------
  // Amplitude scaling factor at x (region-dependent)
  // ---------------------------------------------------------
  function ampFactor(x, xb1, xb2, factor) {
    if (x <= xb1) return 1;
    if (x <= xb2) return factor;
    return factor * factor;
  }

  // ---------------------------------------------------------
  // Where is the pulse center now? (inverse of emissionTime)
  // Returns null if pulse hasn't emerged or has fully exited.
  // ---------------------------------------------------------
  function pulseCenterX(tau_c, t, xb1, xb2, v1px, v2px, v3px, W) {
    const transit = t - tau_c;
    if (transit < 0) return null;

    const t1 = xb1 / v1px;
    const t2 = t1 + (xb2 - xb1) / v2px;
    const t3 = t2 + (W - xb2) / v3px;

    if (transit < t1) return transit * v1px;
    if (transit < t2) return xb1 + (transit - t1) * v2px;
    if (transit < t3) return xb2 + (transit - t2) * v3px;
    return null;
  }

  // ---------------------------------------------------------
  // Wavelength indicator (arrow with label)
  // ---------------------------------------------------------
  function drawWavelengthIndicator(x1, x2, y, label, W) {
    if (x2 - x1 < 14) return;
    if (x1 < 4 || x2 > W - 4) return;

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
  // Reference-line handle (small grippable tab on the right edge)
  // ---------------------------------------------------------
  function drawRefHandle(x, y, active) {
    const w = 28, h = 14;
    const yTop = y - h / 2;

    // Background pill
    ctx.fillStyle   = active ? '#1F4448' : '#2C5F66';
    ctx.strokeStyle = '#FAF8F5';
    ctx.lineWidth   = 1;

    // Rounded rect
    const r = 3;
    ctx.beginPath();
    ctx.moveTo(x + r, yTop);
    ctx.lineTo(x + w - r, yTop);
    ctx.arcTo(x + w, yTop, x + w, yTop + r, r);
    ctx.lineTo(x + w, yTop + h - r);
    ctx.arcTo(x + w, yTop + h, x + w - r, yTop + h, r);
    ctx.lineTo(x + r, yTop + h);
    ctx.arcTo(x, yTop + h, x, yTop + h - r, r);
    ctx.lineTo(x, yTop + r);
    ctx.arcTo(x, yTop, x + r, yTop, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Grip dots (three cream-coloured pips)
    ctx.fillStyle = '#FAF8F5';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(x + w / 2 + i * 5, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---------------------------------------------------------
  // Pointer position relative to canvas (mouse OR touch)
  // ---------------------------------------------------------
  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches && e.touches[0];
    const cx = t ? t.clientX : e.clientX;
    const cy = t ? t.clientY : e.clientY;
    return { x: cx - rect.left, y: cy - rect.top, H: rect.height };
  }

  // Returns 'top' / 'bot' / null based on which line (if any) the pointer is near.
  function hitTestRefLine(pos) {
    const refTopY = pos.H * refLines.topFrac;
    const refBotY = pos.H * refLines.botFrac;
    // If both lines are very close, prefer whichever is closer.
    const dTop = Math.abs(pos.y - refTopY);
    const dBot = Math.abs(pos.y - refBotY);
    if (dTop <= REF_HIT_RADIUS && dTop <= dBot) return 'top';
    if (dBot <= REF_HIT_RADIUS) return 'bot';
    return null;
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

    // Three regions, equal thirds
    const xb1 = W / 3;
    const xb2 = 2 * W / 3;

    // Backgrounds: cool | warm | cool
    ctx.fillStyle = '#EFF2F5'; ctx.fillRect(0,   0, xb1,       H);
    ctx.fillStyle = '#F5EFE6'; ctx.fillRect(xb1, 0, xb2 - xb1, H);
    ctx.fillStyle = '#EFF2F5'; ctx.fillRect(xb2, 0, W   - xb2, H);

    // Boundary lines
    ctx.strokeStyle = '#2D2D2D';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(xb1, 0); ctx.lineTo(xb1, H);
    ctx.moveTo(xb2, 0); ctx.lineTo(xb2, H);
    ctx.stroke();

    // Medium labels (top of each region)
    ctx.fillStyle    = '#8A8A8A';
    ctx.font         = '11px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('MEDIUM 1', 14, 12);
    ctx.fillText('MEDIUM 2', xb1 + 14, 12);
    ctx.fillText('MEDIUM 1', xb2 + 14, 12);

    // Wave band centerlines
    const pulseCenterY = H * 0.30;
    const contCenterY  = H * 0.70;
    const A = H * 0.10;

    // Physics
    const f_Hz    = state.f * 1e14;
    const lamAir  = C_NM / f_Hz;
    const lam1Nm  = lamAir / state.n1;
    const lam2Nm  = lamAir / state.n2;
    const lam3Nm  = lam1Nm;

    const pxLam1 = lam1Nm * PX_PER_NM;
    const pxLam2 = lam2Nm * PX_PER_NM;
    const pxLam3 = pxLam1;

    const visibleHz = state.f * TIME_SCALE;
    const omega     = 2 * Math.PI * visibleHz;
    const v1px = visibleHz * pxLam1;   // pixels/second
    const v2px = visibleHz * pxLam2;
    const v3px = visibleHz * pxLam3;

    const sigmaT = PULSE_SIGMA_PERIODS / visibleHz;   // seconds
    const twoSig2 = 2 * sigmaT * sigmaT;

    // Conceptual partial-reflection amplitude factor (per boundary crossing)
    const factor = 1 - 0.5 * Math.abs(state.n2 - state.n1) / (state.n1 + state.n2);

    // Color (driven by f via λ_air)
    const [R, G, B] = wavelengthToRGB(lamAir);
    const color = `rgb(${R}, ${G}, ${B})`;

    // Elapsed time
    const elapsed = getElapsed(timestampMs);

    // ------- Prune fully-exited pulses -------
    const xTransitMax = (xb1 / v1px) + ((xb2 - xb1) / v2px) + ((W - xb2) / v3px);
    const pulseLifetime = xTransitMax + PULSE_AGE_MARGIN * sigmaT;
    for (let i = activePulses.length - 1; i >= 0; i--) {
      if (elapsed - activePulses[i].tau_c > pulseLifetime) {
        activePulses.splice(i, 1);
      }
    }

    // ------- Draw continuous wave (bottom band) -------
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2.6;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';

    ctx.beginPath();
    for (let x = 0; x <= W; x++) {
      const tauE  = emissionTime(x, elapsed, xb1, xb2, v1px, v2px, v3px);
      const amp   = A * ampFactor(x, xb1, xb2, factor);
      const phase = prefersReducedMotion ? 0 : omega * tauE;
      const y     = contCenterY + amp * Math.cos(phase);
      if (x === 0) ctx.moveTo(x, y);
      else         ctx.lineTo(x, y);
    }
    ctx.stroke();

    // ------- Draw pulse(s) (top band) -------
    if (activePulses.length > 0 && !prefersReducedMotion) {
      ctx.beginPath();
      let firstPoint = true;
      for (let x = 0; x <= W; x++) {
        const tauE = emissionTime(x, elapsed, xb1, xb2, v1px, v2px, v3px);
        let sum = 0;
        for (let i = 0; i < activePulses.length; i++) {
          const dt = tauE - activePulses[i].tau_c;
          const env = Math.exp(-(dt * dt) / twoSig2);
          if (env < ENV_PRUNE) continue;
          sum += env * Math.cos(omega * dt);
        }
        const amp = A * ampFactor(x, xb1, xb2, factor);
        const y   = pulseCenterY + amp * sum;
        if (firstPoint) { ctx.moveTo(x, y); firstPoint = false; }
        else            { ctx.lineTo(x, y); }
      }
      ctx.stroke();
    }

    // ------- λ arrows for continuous wave (both sides of each boundary) -------
    const contArrowY = contCenterY - A - 16;
    drawWavelengthIndicator(xb1 - pxLam1, xb1,           contArrowY, 'λ\u2081', W);
    drawWavelengthIndicator(xb1,          xb1 + pxLam2,  contArrowY, 'λ\u2082', W);
    drawWavelengthIndicator(xb2 - pxLam2, xb2,           contArrowY, 'λ\u2082', W);
    drawWavelengthIndicator(xb2,          xb2 + pxLam3,  contArrowY, 'λ\u2081', W);

    // ------- λ arrows for each pulse (centered on pulse, showing local λ) -------
    const pulseArrowY = pulseCenterY - A - 16;
    for (let i = 0; i < activePulses.length; i++) {
      const xc = pulseCenterX(
        activePulses[i].tau_c, elapsed,
        xb1, xb2, v1px, v2px, v3px, W
      );
      if (xc === null) continue;

      let localLam, label;
      if (xc <= xb1)      { localLam = pxLam1; label = 'λ\u2081'; }
      else if (xc <= xb2) { localLam = pxLam2; label = 'λ\u2082'; }
      else                { localLam = pxLam3; label = 'λ\u2081'; }

      drawWavelengthIndicator(xc - localLam / 2, xc + localLam / 2,
                              pulseArrowY, label, W);
    }

    // ------- Draggable reference lines (drawn on top of everything) -------
    const refTopY = H * refLines.topFrac;
    const refBotY = H * refLines.botFrac;
    const draggingTop = (refLines.dragging === 'top');
    const draggingBot = (refLines.dragging === 'bot');

    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);

    // Top line
    ctx.strokeStyle = draggingTop ? 'rgba(44, 95, 102, 0.95)' : 'rgba(90, 97, 113, 0.55)';
    ctx.beginPath();
    ctx.moveTo(0, refTopY);
    ctx.lineTo(W, refTopY);
    ctx.stroke();

    // Bottom line
    ctx.strokeStyle = draggingBot ? 'rgba(44, 95, 102, 0.95)' : 'rgba(90, 97, 113, 0.55)';
    ctx.beginPath();
    ctx.moveTo(0, refBotY);
    ctx.lineTo(W, refBotY);
    ctx.stroke();

    ctx.setLineDash([]);

    // Handles (right edge) — drawn solid teal so they read as interactive
    drawRefHandle(W - 32, refTopY, draggingTop);
    drawRefHandle(W - 32, refBotY, draggingBot);

    ctx.restore();

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
  // Pulse button — fire a single packet from the source
  // ---------------------------------------------------------
  btnPulse.addEventListener('click', () => {
    const now      = performance.now();
    const elapsed  = getElapsed(now);
    const visHz    = state.f * TIME_SCALE;
    const sigmaT   = PULSE_SIGMA_PERIODS / visHz;
    // Peak emission time is 2σ after click, so the pulse rises in
    // visibly rather than starting at full amplitude.
    activePulses.push({ tau_c: elapsed + 2 * sigmaT });
    scheduleDraw();
  });

  // ---------------------------------------------------------
  // Pause / resume button
  // ---------------------------------------------------------
  function setPaused(p) {
    if (p === paused) return;

    if (p) {
      pauseStartedAt = performance.now();
      paused = true;
      btnPause.querySelector('.toolbar__icon').textContent = '▶';
      btnPause.querySelector('.toolbar__label').textContent = 'Resume';
      btnPause.setAttribute('aria-label', 'Resume wave animation');
      btnPause.setAttribute('aria-pressed', 'true');
    } else {
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
  // Show / hide numerical values toggle
  // ---------------------------------------------------------
  function setValuesHidden(hidden) {
    valuesHidden = hidden;
    if (hidden) {
      readoutsEl.setAttribute('hidden', '');
      btnToggleVals.querySelector('.toolbar__icon').textContent = '▸';
      btnToggleVals.querySelector('.toolbar__label').textContent = 'Show values';
      btnToggleVals.setAttribute('aria-label', 'Show numerical values');
      btnToggleVals.setAttribute('aria-pressed', 'false');
    } else {
      readoutsEl.removeAttribute('hidden');
      btnToggleVals.querySelector('.toolbar__icon').textContent = '▾';
      btnToggleVals.querySelector('.toolbar__label').textContent = 'Hide values';
      btnToggleVals.setAttribute('aria-label', 'Hide numerical values');
      btnToggleVals.setAttribute('aria-pressed', 'true');
    }
  }

  btnToggleVals.addEventListener('click', () => setValuesHidden(!valuesHidden));

  // ---------------------------------------------------------
  // Reference-line drag (mouse + touch)
  // ---------------------------------------------------------
  function beginRefDrag(pos) {
    const hit = hitTestRefLine(pos);
    if (!hit) return false;
    refLines.dragging = hit;
    const lineY = pos.H * (hit === 'top' ? refLines.topFrac : refLines.botFrac);
    refLines.dragOffset = pos.y - lineY;
    canvas.style.cursor = 'ns-resize';
    return true;
  }

  function updateRefDrag(pos) {
    if (!refLines.dragging) return;
    const newY = pos.y - refLines.dragOffset;
    let frac = newY / pos.H;
    // Clamp so handle stays visible inside the canvas
    frac = Math.max(0.02, Math.min(0.98, frac));
    if (refLines.dragging === 'top') refLines.topFrac = frac;
    else                              refLines.botFrac = frac;
    scheduleDraw();
  }

  function endRefDrag() {
    if (refLines.dragging) {
      refLines.dragging = null;
      canvas.style.cursor = 'default';
      scheduleDraw();
    }
  }

  // Mouse
  canvas.addEventListener('mousedown', (e) => {
    const pos = getCanvasPos(e);
    if (beginRefDrag(pos)) {
      e.preventDefault();
      scheduleDraw();
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (refLines.dragging) return;   // window-level handler takes over
    const pos = getCanvasPos(e);
    canvas.style.cursor = hitTestRefLine(pos) ? 'ns-resize' : 'default';
  });

  window.addEventListener('mousemove', (e) => {
    if (!refLines.dragging) return;
    updateRefDrag(getCanvasPos(e));
  });

  window.addEventListener('mouseup', endRefDrag);

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    const pos = getCanvasPos(e);
    if (beginRefDrag(pos)) {
      e.preventDefault();
      scheduleDraw();
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (!refLines.dragging) return;
    updateRefDrag(getCanvasPos(e));
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', endRefDrag);
  canvas.addEventListener('touchcancel', endRefDrag);

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
