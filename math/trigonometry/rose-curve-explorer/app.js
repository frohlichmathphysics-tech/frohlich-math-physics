/* ================================================================
   Rose Curve Explorer — app.js
   r = s · a · trig(n · θ),   s ∈ {+1,-1}, trig ∈ {sin, cos},
                              a ∈ [0.5, 10] step 0.5,
                              n ∈ {1..8} integer
   θ domain plotted: [0, 2π]   ·   1000 sample points
   Per Applet_Creation_v4 §7: vanilla JS, Canvas 2D, no libraries,
   relative paths, defensive math (input clamping inside physics
   function, not just on the slider).
   ================================================================ */

(function () {
  'use strict';

  // ------------------------------------------------------------------
  // Constants
  // ------------------------------------------------------------------
  const CANVAS_LOGICAL = 600;        // logical drawing units
  const PLOT_BOUND     = 11;         // ±11 on each axis (per spec A2)
  const N_SAMPLES      = 1000;       // sample points on [0, 2π]
  const TRACE_DURATION = 3000;       // ms (per spec D4)

  const COLOR_CURVE      = '#1E2A5E';    // navy
  const COLOR_GRID_RING  = '#BFBFBF';    // concentric circles
  const COLOR_GRID_SPOKE = '#D8D8D8';    // radial spokes
  const COLOR_AXIS       = '#9EA8C5';    // slightly darker navy-grey for x/y axes
  const COLOR_BG         = '#FFFFFF';

  const TWO_PI = Math.PI * 2;

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  const state = {
    a: 4,
    n: 3,
    trig: 'cos',          // 'cos' | 'sin'
    sign: 1,              // +1 | -1
    isTracing: false,
    traceStart: 0,
    rafId: null,
  };

  let cachedPoints = null;        // recomputed only when params change

  // ------------------------------------------------------------------
  // DOM lookups
  // ------------------------------------------------------------------
  const canvas       = document.getElementById('canvas');
  const sliderA      = document.getElementById('slider-a');
  const sliderN      = document.getElementById('slider-n');
  const valueA       = document.getElementById('value-a');
  const valueN       = document.getElementById('value-n');
  const equationEl   = document.getElementById('equation');
  const traceBtn     = document.getElementById('trace-btn');
  const readoutPet   = document.getElementById('readout-petals');
  const readoutCyc   = document.getElementById('readout-cycle');
  const readoutMax   = document.getElementById('readout-max');
  const trigBtns     = Array.from(document.querySelectorAll('#trig-cos, #trig-sin'));
  const signBtns     = Array.from(document.querySelectorAll('#sign-plus, #sign-minus'));

  const ctx = canvas.getContext('2d');

  // ------------------------------------------------------------------
  // Defensive clamping (per §7.3 — clamp again inside, not just slider)
  // ------------------------------------------------------------------
  function clampA(x) {
    const v = Number(x);
    if (!isFinite(v)) return 4;
    return Math.max(0.5, Math.min(10, v));
  }
  function clampN(x) {
    const v = parseInt(x, 10);
    if (!isFinite(v)) return 3;
    return Math.max(1, Math.min(8, Math.round(v)));
  }
  function clampSign(x) {
    return (Number(x) < 0) ? -1 : 1;
  }

  // ------------------------------------------------------------------
  // Math: r(θ) = s · a · trig(n·θ)
  // ------------------------------------------------------------------
  function radius(theta) {
    const s = clampSign(state.sign);
    const a = clampA(state.a);
    const n = clampN(state.n);
    const arg = n * theta;
    const t = (state.trig === 'sin') ? Math.sin(arg) : Math.cos(arg);
    return s * a * t;
  }

  function computePoints() {
    const points = new Array(N_SAMPLES);
    for (let i = 0; i < N_SAMPLES; i++) {
      const theta = (i / (N_SAMPLES - 1)) * TWO_PI;
      const r = radius(theta);
      points[i] = {
        x: r * Math.cos(theta),
        y: r * Math.sin(theta),
      };
    }
    return points;
  }

  // ------------------------------------------------------------------
  // High-DPI canvas setup. We draw in a logical 0..600 square, and the
  // setTransform call maps that into the actual backing-store pixels.
  // Re-run on resize.
  // ------------------------------------------------------------------
  function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const cssSize = canvas.clientWidth || canvas.offsetWidth || CANVAS_LOGICAL;
    const backing = Math.max(1, Math.round(cssSize * dpr));
    if (canvas.width !== backing)  canvas.width  = backing;
    if (canvas.height !== backing) canvas.height = backing;
    const k = (cssSize / CANVAS_LOGICAL) * dpr;
    ctx.setTransform(k, 0, 0, k, 0, 0);
  }

  // Map plot coords (x, y) ∈ [-11, 11] → logical canvas coords [0, 600]
  function plotToCanvas(x, y) {
    const half = CANVAS_LOGICAL / 2;
    const scale = half / PLOT_BOUND;
    return {
      cx: half + x * scale,
      cy: half - y * scale,        // flip y for screen coords
    };
  }

  // ------------------------------------------------------------------
  // Drawing: grid + curve
  // ------------------------------------------------------------------
  function drawGrid() {
    // background
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, CANVAS_LOGICAL, CANVAS_LOGICAL);

    const half = CANVAS_LOGICAL / 2;
    const scale = half / PLOT_BOUND;
    const maxR  = 10 * scale;     // outermost ring at r = 10

    // Radial spokes every 30° (π/6). 6 lines → 12 visible directions.
    ctx.strokeStyle = COLOR_GRID_SPOKE;
    ctx.lineWidth = 1;
    for (let deg = 0; deg < 180; deg += 30) {
      const rad = deg * Math.PI / 180;
      const dx = Math.cos(rad) * maxR;
      const dy = Math.sin(rad) * maxR;
      ctx.beginPath();
      ctx.moveTo(half - dx, half + dy);
      ctx.lineTo(half + dx, half - dy);
      ctx.stroke();
    }

    // Concentric circles at integer radii 1..10
    ctx.strokeStyle = COLOR_GRID_RING;
    ctx.lineWidth = 1;
    for (let r = 1; r <= 10; r++) {
      ctx.beginPath();
      ctx.arc(half, half, r * scale, 0, TWO_PI);
      ctx.stroke();
    }

    // Subtle x and y axes a touch darker so the pole is readable
    ctx.strokeStyle = COLOR_AXIS;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(half - maxR, half); ctx.lineTo(half + maxR, half);     // x-axis
    ctx.moveTo(half, half - maxR); ctx.lineTo(half, half + maxR);     // y-axis
    ctx.stroke();
  }

  function drawCurve(points, fraction) {
    if (!points || points.length === 0) return;
    fraction = Math.max(0, Math.min(1, fraction));
    const upTo = Math.round((points.length - 1) * fraction);
    if (upTo < 1) return;

    ctx.strokeStyle = COLOR_CURVE;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap  = 'round';
    ctx.beginPath();
    const p0 = plotToCanvas(points[0].x, points[0].y);
    ctx.moveTo(p0.cx, p0.cy);
    for (let i = 1; i <= upTo; i++) {
      const p = plotToCanvas(points[i].x, points[i].y);
      ctx.lineTo(p.cx, p.cy);
    }
    ctx.stroke();
  }

  function render(fraction) {
    if (typeof fraction !== 'number') fraction = 1;
    drawGrid();
    if (!cachedPoints) cachedPoints = computePoints();
    drawCurve(cachedPoints, fraction);
  }

  // ------------------------------------------------------------------
  // Readouts
  // ------------------------------------------------------------------
  function fmtNum(x) {
    // 4 → "4", 4.5 → "4.5", 0.5 → "0.5"
    return (Math.floor(x) === x) ? String(Math.floor(x)) : String(x);
  }

  function buildEquation() {
    const a = clampA(state.a);
    const n = clampN(state.n);
    const sign = (state.sign === 1) ? '' : '\u2212';   // U+2212 MINUS SIGN
    const trig = (state.trig === 'sin') ? 'sin' : 'cos';
    return `r = ${sign}${fmtNum(a)} ${trig}(${n}\u03B8)`;
  }

  function petalCount() {
    const n = clampN(state.n);
    return (n % 2 === 1) ? n : 2 * n;
  }

  function cycleInterval() {
    const n = clampN(state.n);
    return (n % 2 === 1) ? '[0, \u03C0]' : '[0, 2\u03C0]';
  }

  function updateReadouts() {
    valueA.textContent     = fmtNum(clampA(state.a));
    valueN.textContent     = String(clampN(state.n));
    equationEl.textContent = buildEquation();
    readoutPet.textContent = String(petalCount());
    readoutCyc.textContent = cycleInterval();
    readoutMax.textContent = fmtNum(clampA(state.a));
  }

  // ------------------------------------------------------------------
  // Trace animation
  // ------------------------------------------------------------------
  function startTrace() {
    cancelTrace();
    cachedPoints = computePoints();   // ensure fresh against current params
    state.isTracing = true;
    state.traceStart = performance.now();

    function frame(now) {
      if (!state.isTracing) return;
      const elapsed = now - state.traceStart;
      const f = Math.min(1, elapsed / TRACE_DURATION);
      render(f);
      if (f < 1) {
        state.rafId = requestAnimationFrame(frame);
      } else {
        state.isTracing = false;
        state.rafId = null;
      }
    }
    state.rafId = requestAnimationFrame(frame);
  }

  function cancelTrace() {
    if (state.rafId !== null) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    state.isTracing = false;
  }

  // ------------------------------------------------------------------
  // Event wiring
  // ------------------------------------------------------------------
  function onParamChange() {
    // Per spec F1: any param change cancels trace and resets to idle (full curve).
    cancelTrace();
    cachedPoints = null;
    updateReadouts();
    render(1);
  }

  sliderA.addEventListener('input', (e) => {
    state.a = clampA(e.target.value);
    onParamChange();
  });

  sliderN.addEventListener('input', (e) => {
    state.n = clampN(e.target.value);
    onParamChange();
  });

  trigBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.trig = (btn.dataset.value === 'sin') ? 'sin' : 'cos';
      trigBtns.forEach((b) => b.classList.toggle('active', b === btn));
      onParamChange();
    });
  });

  signBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.sign = clampSign(parseInt(btn.dataset.value, 10));
      signBtns.forEach((b) => b.classList.toggle('active', b === btn));
      onParamChange();
    });
  });

  traceBtn.addEventListener('click', startTrace);

  // Re-setup on resize/orientation change so the canvas stays crisp.
  let resizeRaf = null;
  window.addEventListener('resize', () => {
    if (resizeRaf !== null) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = null;
      setupCanvas();
      // If a trace is in progress, let the next frame redraw at new scale.
      if (!state.isTracing) render(1);
    });
  });

  // ------------------------------------------------------------------
  // Init
  // ------------------------------------------------------------------
  setupCanvas();
  updateReadouts();
  render(1);
})();
