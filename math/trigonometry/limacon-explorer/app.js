/* =========================================================
   Limaçon Explorer — app.js
   r = a + s · b · trig(θ),   s ∈ {+1, −1},   trig ∈ {sin, cos}
   a, b ∈ [0, 10],   step 0.1
   ========================================================= */

(function () {
  'use strict';

  // -----------------------------------------------------------
  // CONSTANTS
  // -----------------------------------------------------------
  const A_MIN = 0, A_MAX = 10;
  const B_MIN = 0, B_MAX = 10;
  const NUM_SAMPLES = 1000;
  const TWO_PI = Math.PI * 2;
  const EPS = 1e-9;

  // Logical canvas dimensions (drawing operations use these coordinates)
  const RECT_W = 500, RECT_H = 400;
  const POLAR_W = 500, POLAR_H = 500;

  // Rectangular plot bounds
  const RECT_X_MIN = 0, RECT_X_MAX = TWO_PI;
  const RECT_Y_MIN = -22, RECT_Y_MAX = 22;

  // Polar plot bounds
  const POLAR_BOUND = 22;

  // Polar concentric circle radii
  const POLAR_RADII = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];

  // Build_Design palette
  const C_NAVY      = '#1E2A5E';
  const C_GRID      = '#D8D8D8';
  const C_R0        = '#BFBFBF';
  const C_TEAL_FILL = 'rgba(45, 168, 168, 0.10)';
  const C_RED_FILL  = 'rgba(192,  74,  58, 0.10)';

  // Curve styling
  const CURVE_WIDTH = 2.5;

  // -----------------------------------------------------------
  // STATE
  // -----------------------------------------------------------
  const state = {
    a: 4,
    b: 2,
    sign: 1,     // +1 or -1
    trig: 'cos'  // 'sin' or 'cos'
  };

  // -----------------------------------------------------------
  // DEFENSIVE CLAMPS
  // -----------------------------------------------------------
  function clampA(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return state.a;
    return Math.max(A_MIN, Math.min(A_MAX, n));
  }
  function clampB(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return state.b;
    return Math.max(B_MIN, Math.min(B_MAX, n));
  }
  function clampSign(v) {
    return (Number(v) === -1) ? -1 : 1;
  }
  function clampTrig(v) {
    return (v === 'sin') ? 'sin' : 'cos';
  }

  // -----------------------------------------------------------
  // NUMBER FORMATTER — drops trailing zeros
  //   4 + 2     → "6"     (not "6.0")
  //   4.3 + 2.7 → "7"     (rounds to one decimal, then strips)
  //   3 + 4.5   → "7.5"
  // -----------------------------------------------------------
  function fmt(n) {
    if (!Number.isFinite(n)) return '0';
    return parseFloat(n.toFixed(1)).toString();
  }

  // -----------------------------------------------------------
  // POLAR FUNCTION — r(θ)
  // -----------------------------------------------------------
  function rAt(theta) {
    const t = state.trig === 'sin' ? Math.sin(theta) : Math.cos(theta);
    return state.a + state.sign * state.b * t;
  }

  // -----------------------------------------------------------
  // REGIME DETECTION — locked order (degenerate cases first)
  // -----------------------------------------------------------
  function detectRegime(a, b) {
    const aZero = a < EPS;
    const bZero = b < EPS;
    if (aZero && bZero)         return { kind: 'degenerate',   label: '' };
    if (aZero)                  return { kind: 'circle-pole',  label: 'Circle through pole' };
    if (bZero)                  return { kind: 'circle-around', label: 'Circle around pole' };
    if (Math.abs(a - b) < EPS)  return { kind: 'cardioid',     label: 'Cardioid' };
    if (a < b)                  return { kind: 'inner-loop',   label: 'Inner Loop Limaçon' };
    if (a / b >= 2)             return { kind: 'convex',       label: 'Convex Limaçon' };
    return                            { kind: 'dimpled',       label: 'Dimpled Limaçon' };
  }

  // -----------------------------------------------------------
  // HIGH-DPI CANVAS SETUP
  //   Drawing code uses logical (logicalW × logicalH) coords.
  //   Transform handles CSS-size and devicePixelRatio scaling.
  // -----------------------------------------------------------
  function setupCanvas(canvas, logicalW, logicalH) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    let cssW = rect.width;
    let cssH = rect.height;
    // Layout fallback (in case offscreen at first call)
    if (cssW < 1) cssW = logicalW;
    if (cssH < 1) cssH = logicalH;

    canvas.width  = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    const ctx = canvas.getContext('2d');
    const sx = (cssW * dpr) / logicalW;
    const sy = (cssH * dpr) / logicalH;
    ctx.setTransform(sx, 0, 0, sy, 0, 0);
    return ctx;
  }

  // -----------------------------------------------------------
  // RECTANGULAR PLOT
  // -----------------------------------------------------------
  function rectXToPx(x) {
    return ((x - RECT_X_MIN) / (RECT_X_MAX - RECT_X_MIN)) * RECT_W;
  }
  function rectYToPx(y) {
    return RECT_H - ((y - RECT_Y_MIN) / (RECT_Y_MAX - RECT_Y_MIN)) * RECT_H;
  }

  function drawRectGrid(ctx) {
    ctx.clearRect(0, 0, RECT_W, RECT_H);

    // Vertical gridlines at θ = π/4 increments
    ctx.strokeStyle = C_GRID;
    ctx.lineWidth = 1;
    for (let k = 0; k <= 8; k++) {
      const x = rectXToPx(k * Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, RECT_H);
      ctx.stroke();
    }

    // r = 0 reference line — slightly darker than gridlines (per spec A5)
    const y0 = rectYToPx(0);
    ctx.strokeStyle = C_R0;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(RECT_W, y0);
    ctx.stroke();

    // X-axis tick labels (anchored at the r=0 line)
    ctx.fillStyle = C_NAVY;
    ctx.font = '13px "Cambria Math", "Cambria", serif';
    ctx.textBaseline = 'top';
    const labels = ['0', 'π/4', 'π/2', '3π/4', 'π', '5π/4', '3π/2', '7π/4', '2π'];
    for (let k = 0; k <= 8; k++) {
      const x = rectXToPx(k * Math.PI / 4);
      ctx.textAlign = (k === 0) ? 'left' : (k === 8 ? 'right' : 'center');
      ctx.fillText(labels[k], x, y0 + 4);
    }

    // Corner labels: r (top-left), θ (bottom-right)
    ctx.font = 'italic bold 14px "Cambria Math", "Cambria", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('r', 6, 6);

    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('θ', RECT_W - 6, RECT_H - 6);
  }

  function drawRectFillsAndCurve(ctx) {
    // Sample the curve once
    const xs = new Float64Array(NUM_SAMPLES + 1);
    const ys = new Float64Array(NUM_SAMPLES + 1);
    for (let i = 0; i <= NUM_SAMPLES; i++) {
      const theta = (i / NUM_SAMPLES) * TWO_PI;
      xs[i] = rectXToPx(theta);
      ys[i] = rAt(theta);
    }

    // Above-r=0 fill: clamp y to max(y, 0) and close polygon along r=0
    ctx.fillStyle = C_TEAL_FILL;
    ctx.beginPath();
    ctx.moveTo(xs[0], rectYToPx(0));
    for (let i = 0; i <= NUM_SAMPLES; i++) {
      ctx.lineTo(xs[i], rectYToPx(Math.max(ys[i], 0)));
    }
    ctx.lineTo(xs[NUM_SAMPLES], rectYToPx(0));
    ctx.closePath();
    ctx.fill();

    // Below-r=0 fill: clamp y to min(y, 0)
    ctx.fillStyle = C_RED_FILL;
    ctx.beginPath();
    ctx.moveTo(xs[0], rectYToPx(0));
    for (let i = 0; i <= NUM_SAMPLES; i++) {
      ctx.lineTo(xs[i], rectYToPx(Math.min(ys[i], 0)));
    }
    ctx.lineTo(xs[NUM_SAMPLES], rectYToPx(0));
    ctx.closePath();
    ctx.fill();

    // Curve
    ctx.strokeStyle = C_NAVY;
    ctx.lineWidth = CURVE_WIDTH;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= NUM_SAMPLES; i++) {
      const px = xs[i];
      const py = rectYToPx(ys[i]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // -----------------------------------------------------------
  // POLAR PLOT
  // -----------------------------------------------------------
  function polarToPx(x, y) {
    const cx = POLAR_W / 2;
    const cy = POLAR_H / 2;
    const scale = (POLAR_W / 2) / POLAR_BOUND;
    return [cx + x * scale, cy - y * scale];
  }

  function drawPolarGrid(ctx) {
    ctx.clearRect(0, 0, POLAR_W, POLAR_H);

    const cx = POLAR_W / 2, cy = POLAR_H / 2;
    const scale = (POLAR_W / 2) / POLAR_BOUND;

    // Concentric circles
    ctx.strokeStyle = C_GRID;
    ctx.lineWidth = 1;
    POLAR_RADII.forEach((r) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, TWO_PI);
      ctx.stroke();
    });

    // Radial spokes (12)
    for (let k = 0; k < 12; k++) {
      const ang = (k / 12) * TWO_PI;
      const x2 = cx + Math.cos(ang) * POLAR_BOUND * scale;
      const y2 = cy - Math.sin(ang) * POLAR_BOUND * scale;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Axes (slightly darker)
    ctx.strokeStyle = C_R0;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);          ctx.lineTo(POLAR_W, cy);
    ctx.moveTo(cx, 0);          ctx.lineTo(cx, POLAR_H);
    ctx.stroke();

    // Tick labels at ±10, ±20 along the axes
    ctx.fillStyle = C_NAVY;
    ctx.font = '11px "Cambria Math", "Cambria", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    [10, 20].forEach((v) => {
      ctx.fillText(String(v),       cx + v * scale, cy + 4);
      ctx.fillText('-' + String(v), cx - v * scale, cy + 4);
    });
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    [10, 20].forEach((v) => {
      ctx.fillText(String(v),       cx + 4, cy - v * scale);
      ctx.fillText('-' + String(v), cx + 4, cy + v * scale);
    });
  }

  function drawPolarCurve(ctx) {
    ctx.strokeStyle = C_NAVY;
    ctx.lineWidth = CURVE_WIDTH;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= NUM_SAMPLES; i++) {
      const theta = (i / NUM_SAMPLES) * TWO_PI;
      const r = rAt(theta);
      // Negative r renders directly via Cartesian — inner loops appear naturally
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      const [px, py] = polarToPx(x, y);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // -----------------------------------------------------------
  // EQUATION DISPLAY (uses U+2212 for minus, U+03B8 for theta)
  // -----------------------------------------------------------
  function renderEquation() {
    const a = fmt(state.a);
    const b = fmt(state.b);
    const signChar = state.sign === 1 ? '+' : '\u2212';
    return 'r = ' + a + ' ' + signChar + ' ' + b + ' ' + state.trig + '(\u03B8)';
  }

  // -----------------------------------------------------------
  // DOM HANDLES
  // -----------------------------------------------------------
  let elEquation, elRegime, elValueA, elValueB;
  let elMaxDistance, elInnerLoop, elReadoutSep;
  let wrapRect, wrapPolar, overlayRect, overlayPolar;
  let canvasRect, canvasPolar;
  let rectCtx, polarCtx;

  // -----------------------------------------------------------
  // RENDER (rAF-throttled at top level)
  // -----------------------------------------------------------
  let rafScheduled = false;

  function render() {
    rafScheduled = false;

    // Defensive re-clamp before drawing
    state.a = clampA(state.a);
    state.b = clampB(state.b);

    const a = state.a;
    const b = state.b;
    const regime = detectRegime(a, b);

    // Equation + slider readouts
    elEquation.textContent = renderEquation();
    elValueA.textContent = fmt(a);
    elValueB.textContent = fmt(b);

    // Regime label
    if (regime.kind === 'cardioid') {
      elRegime.innerHTML = 'Cardioid <span class="regime-sub">(a = b)</span>';
    } else if (regime.kind === 'degenerate') {
      elRegime.innerHTML = '&nbsp;'; // hold height
    } else {
      elRegime.textContent = regime.label;
    }

    // Readouts: max distance and (conditionally) inner loop
    if (regime.kind === 'degenerate') {
      elMaxDistance.textContent = '';
      elInnerLoop.classList.add('hidden');
      elReadoutSep.classList.add('hidden');
    } else {
      elMaxDistance.textContent = 'Max distance: ' + fmt(a + b);
      if (a < b - EPS) {
        elInnerLoop.textContent = 'Inner loop reaches: ' + fmt(b - a);
        elInnerLoop.classList.remove('hidden');
        elReadoutSep.classList.remove('hidden');
      } else {
        elInnerLoop.classList.add('hidden');
        elReadoutSep.classList.add('hidden');
      }
    }

    // Degenerate state: dim canvases, show overlay
    if (regime.kind === 'degenerate') {
      wrapRect.classList.add('degenerate');
      wrapPolar.classList.add('degenerate');
      overlayRect.hidden = false;
      overlayPolar.hidden = false;
    } else {
      wrapRect.classList.remove('degenerate');
      wrapPolar.classList.remove('degenerate');
      overlayRect.hidden = true;
      overlayPolar.hidden = true;
    }

    // Draw grids always
    drawRectGrid(rectCtx);
    drawPolarGrid(polarCtx);

    // Draw curves (and fills) only if not degenerate
    if (regime.kind !== 'degenerate') {
      drawRectFillsAndCurve(rectCtx);
      drawPolarCurve(polarCtx);
    }
  }

  function scheduleRender() {
    if (rafScheduled) return;
    rafScheduled = true;
    requestAnimationFrame(render);
  }

  // -----------------------------------------------------------
  // EVENT WIRING
  // -----------------------------------------------------------
  function init() {
    // Cache DOM
    elEquation    = document.getElementById('equation');
    elRegime      = document.getElementById('regime');
    elValueA      = document.getElementById('value-a');
    elValueB      = document.getElementById('value-b');
    elMaxDistance = document.getElementById('max-distance');
    elInnerLoop   = document.getElementById('inner-loop');
    elReadoutSep  = document.getElementById('readout-sep');
    wrapRect      = document.getElementById('wrap-rect');
    wrapPolar     = document.getElementById('wrap-polar');
    overlayRect   = document.getElementById('overlay-rect');
    overlayPolar  = document.getElementById('overlay-polar');
    canvasRect    = document.getElementById('canvas-rect');
    canvasPolar   = document.getElementById('canvas-polar');

    // Initial canvas setup
    rectCtx  = setupCanvas(canvasRect,  RECT_W,  RECT_H);
    polarCtx = setupCanvas(canvasPolar, POLAR_W, POLAR_H);

    // Slider events — defensive clamp on every input
    const sliderA = document.getElementById('slider-a');
    const sliderB = document.getElementById('slider-b');

    sliderA.addEventListener('input', (e) => {
      state.a = clampA(e.target.value);
      scheduleRender();
    });
    sliderB.addEventListener('input', (e) => {
      state.b = clampB(e.target.value);
      scheduleRender();
    });

    // Toggle buttons
    document.querySelectorAll('[data-toggle="trig"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.trig = clampTrig(btn.dataset.value);
        document.querySelectorAll('[data-toggle="trig"]').forEach((b) => {
          b.classList.toggle('active', b === btn);
        });
        scheduleRender();
      });
    });
    document.querySelectorAll('[data-toggle="sign"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.sign = clampSign(parseInt(btn.dataset.value, 10));
        document.querySelectorAll('[data-toggle="sign"]').forEach((b) => {
          b.classList.toggle('active', b === btn);
        });
        scheduleRender();
      });
    });

    // Resize / orientation: re-setup canvases (CSS size and DPR may change)
    let resizeRaf = null;
    window.addEventListener('resize', () => {
      if (resizeRaf !== null) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        rectCtx  = setupCanvas(canvasRect,  RECT_W,  RECT_H);
        polarCtx = setupCanvas(canvasPolar, POLAR_W, POLAR_H);
        render();
      });
    });

    // First render
    render();
  }

  // -----------------------------------------------------------
  // BOOT
  // -----------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
