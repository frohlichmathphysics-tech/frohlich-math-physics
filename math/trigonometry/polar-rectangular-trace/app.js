/* Polar / Rectangular Trace -- AP Precalculus 3.15 applet
   Vanilla JS + Canvas 2D, no libraries.
   Conventions: Build_Design v4 palette; Applet_Creation_v4 §7 resilience.
*/

(function () {
  'use strict';

  // ===== Palette (Build_Design v4) =====
  var COLOR = {
    navy: '#1E2A5E',
    coral: '#C04A3A',
    cream: '#FAF6E8',
    teal: '#2DA8A8',
    ink: '#1F1F1F',
    grey: '#BFBFBF',
    greyLight: '#D8D8D8',
    greyDark: '#666666',
    white: '#FFFFFF'
  };

  // ===== Curve library =====
  // Each curve: label (with U+03B8), caption, fn, domainMax,
  // rectRRange (curve's actual r-range), rTicks (visible r-axis ticks).
  var TWO_PI = 2 * Math.PI;
  var FOUR_PI = 4 * Math.PI;

  var CURVES = {
    rose3: {
      label: 'r = 6 sin(3\u03B8)',
      caption: 'Odd-petal rose \u2014 goes negative and retraces',
      fn: function (t) { return 6 * Math.sin(3 * t); },
      domainMax: TWO_PI,
      rectRRange: [-6, 6],
      rTicks: { values: [-6, -3, 0, 3, 6], labels: ['\u22126', '\u22123', '0', '3', '6'] }
    },
    limacon: {
      label: 'r = 1 + 3 cos(\u03B8)',
      caption: 'Inner-loop lima\u00E7on \u2014 watch r go negative',
      fn: function (t) { return 1 + 3 * Math.cos(t); },
      domainMax: TWO_PI,
      rectRRange: [-2, 4],
      rTicks: { values: [-2, 0, 2, 4], labels: ['\u22122', '0', '2', '4'] }
    },
    dimpled: {
      label: 'r = 4 + 2 sin(\u03B8)',
      caption: 'Dimpled cardioid \u2014 r > 0 throughout',
      fn: function (t) { return 4 + 2 * Math.sin(t); },
      domainMax: TWO_PI,
      rectRRange: [0, 6],
      rTicks: { values: [0, 2, 4, 6], labels: ['0', '2', '4', '6'] }
    },
    rose2: {
      label: 'r = 3 sin(2\u03B8)',
      caption: 'Even-petal rose \u2014 full cycle on [0, 2\u03C0]',
      fn: function (t) { return 3 * Math.sin(2 * t); },
      domainMax: TWO_PI,
      rectRRange: [-3, 3],
      rTicks: { values: [-3, 0, 3], labels: ['\u22123', '0', '3'] }
    },
    spiral: {
      label: 'r = \u03B8',
      caption: "Archimedes' spiral \u2014 monotonically increasing",
      fn: function (t) { return t; },
      domainMax: FOUR_PI,
      rectRRange: [0, FOUR_PI],
      rTicks: {
        values: [0, Math.PI, 2 * Math.PI, 3 * Math.PI, 4 * Math.PI],
        labels: ['0', '\u03C0', '2\u03C0', '3\u03C0', '4\u03C0']
      }
    }
  };

  // ===== State =====
  var state = {
    curveId: 'rose3',
    theta: 0,            // current scrubber position
    maxTheta: 0,         // max theta reached so far (controls trace extent)
    playing: false,
    speed: 1,            // 0.5, 1, 2
    radialOn: true,
    lastFrameMs: null,
    polarHalfSide: 0     // computed per curve
  };

  // ===== DOM refs =====
  var equationEl, captionEl, curveSelect, scrubber;
  var playPauseBtn, resetBtn, speedBtns, radialBtn;
  var rectCanvas, polarCanvas, rectCtx, polarCtx;
  var thetaReadout, rReadout, absRReadout, signIndicator, behaviorR, behaviorDist;

  // ===== Init =====
  function init() {
    equationEl = document.getElementById('equation');
    captionEl = document.getElementById('caption');
    curveSelect = document.getElementById('curve-select');
    scrubber = document.getElementById('scrubber');
    playPauseBtn = document.getElementById('play-pause');
    resetBtn = document.getElementById('reset');
    speedBtns = Array.prototype.slice.call(document.querySelectorAll('.btn-speed'));
    radialBtn = document.getElementById('radial-toggle');

    rectCanvas = document.getElementById('rect-canvas');
    polarCanvas = document.getElementById('polar-canvas');

    thetaReadout = document.getElementById('theta-readout');
    rReadout = document.getElementById('r-readout');
    absRReadout = document.getElementById('abs-r-readout');
    signIndicator = document.getElementById('sign-indicator');
    behaviorR = document.getElementById('behavior-r');
    behaviorDist = document.getElementById('behavior-dist');

    setupCanvases();
    bindEvents();
    applyCurveChange(state.curveId);
    updateAll();
  }

  // ===== High-DPI canvas setup =====
  function setupCanvases() {
    rectCtx = setupOneCanvas(rectCanvas);
    polarCtx = setupOneCanvas(polarCanvas);
  }

  function setupOneCanvas(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.clientWidth;
    var cssH = canvas.clientHeight;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  // ===== Event wiring =====
  function bindEvents() {
    curveSelect.addEventListener('change', function () {
      applyCurveChange(curveSelect.value);
      updateAll();
    });

    scrubber.addEventListener('input', function () {
      // Per flag #8: dragging scrubber pauses play.
      if (state.playing) setPlaying(false);
      var t = parseFloat(scrubber.value);
      setTheta(t);
      updateAll();
    });

    playPauseBtn.addEventListener('click', function () {
      // If at end of domain, reset theta to 0 before starting (smoother UX).
      if (!state.playing && state.theta >= CURVES[state.curveId].domainMax - 1e-6) {
        setTheta(0);
      }
      setPlaying(!state.playing);
    });

    resetBtn.addEventListener('click', function () {
      setPlaying(false);
      state.theta = 0;
      state.maxTheta = 0;
      scrubber.value = '0';
      updateAll();
    });

    speedBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        speedBtns.forEach(function (x) { x.classList.remove('is-active'); });
        b.classList.add('is-active');
        state.speed = parseFloat(b.getAttribute('data-speed'));
      });
    });

    radialBtn.addEventListener('click', function () {
      state.radialOn = !state.radialOn;
      radialBtn.classList.toggle('is-on', state.radialOn);
      radialBtn.setAttribute('aria-pressed', state.radialOn ? 'true' : 'false');
      radialBtn.textContent = 'Radial line: ' + (state.radialOn ? 'ON' : 'OFF');
      drawAll();
    });

    window.addEventListener('resize', function () {
      setupCanvases();
      drawAll();
    });
  }

  // ===== Curve change =====
  function applyCurveChange(id) {
    state.curveId = id;
    state.theta = 0;
    state.maxTheta = 0;
    setPlaying(false);

    var curve = CURVES[id];
    equationEl.textContent = curve.label;
    captionEl.textContent = curve.caption;
    scrubber.min = '0';
    scrubber.max = curve.domainMax.toFixed(5);
    scrubber.value = '0';

    state.polarHalfSide = computePolarHalfSide(curve);
  }

  function computePolarHalfSide(curve) {
    // Sample 720 points around the domain, find max |x| or |y|, pad 10%.
    var maxAbs = 0;
    var N = 720;
    for (var i = 0; i <= N; i++) {
      var t = (i / N) * curve.domainMax;
      var r = curve.fn(t);
      var ax = Math.abs(r * Math.cos(t));
      var ay = Math.abs(r * Math.sin(t));
      if (ax > maxAbs) maxAbs = ax;
      if (ay > maxAbs) maxAbs = ay;
    }
    return maxAbs * 1.1;
  }

  // ===== Theta setters =====
  function setTheta(t) {
    var curve = CURVES[state.curveId];
    if (t < 0) t = 0;
    if (t > curve.domainMax) t = curve.domainMax;
    state.theta = t;
    if (t > state.maxTheta) state.maxTheta = t;
  }

  function setPlaying(p) {
    state.playing = p;
    playPauseBtn.textContent = p ? 'Pause' : 'Play';
    if (p) {
      state.lastFrameMs = null;
      requestAnimationFrame(animate);
    }
  }

  // ===== Animation loop =====
  function animate(timestamp) {
    if (!state.playing) return;
    if (state.lastFrameMs == null) state.lastFrameMs = timestamp;
    var dtSec = (timestamp - state.lastFrameMs) / 1000;
    state.lastFrameMs = timestamp;
    // Defensive: huge frame gap (tab backgrounded) -> cap dt to 0.1s.
    if (dtSec > 0.1) dtSec = 0.1;

    var curve = CURVES[state.curveId];
    var dThetaPerSec = (curve.domainMax / 8) * state.speed;  // 1x = full domain in 8 sec
    var newTheta = state.theta + dThetaPerSec * dtSec;

    if (newTheta >= curve.domainMax) {
      // Wrap per F2 -- ensure trace stays full
      state.maxTheta = curve.domainMax;
      newTheta = newTheta - curve.domainMax;
    }

    setTheta(newTheta);
    scrubber.value = state.theta.toFixed(4);
    updateAll();

    if (state.playing) requestAnimationFrame(animate);
  }

  // ===== Update everything =====
  function updateAll() {
    var curve = CURVES[state.curveId];
    var t = state.theta;
    var r = curve.fn(t);

    // Theta readout
    thetaReadout.textContent = formatTheta(t);

    // r readout (3 decimals, U+2212 minus)
    rReadout.textContent = fmtSigned(r, 3);

    // |r| readout
    absRReadout.textContent = Math.abs(r).toFixed(3);

    // Sign indicator
    if (Math.abs(r) < 0.01) {
      signIndicator.textContent = 'r = 0 (at pole)';
      signIndicator.className = 'sign-indicator is-zero';
    } else if (r > 0) {
      signIndicator.textContent = 'r > 0';
      signIndicator.className = 'sign-indicator is-pos';
    } else {
      signIndicator.textContent = 'r < 0';
      signIndicator.className = 'sign-indicator is-neg';
    }

    // Behavior banner
    behaviorR.textContent = describeRBehavior(curve, t);
    behaviorDist.textContent = describeDistBehavior(curve, t);

    drawAll();
  }

  function fmtSigned(x, dec) {
    if (x < 0) return '\u2212' + Math.abs(x).toFixed(dec);
    return x.toFixed(dec);
  }

  // ===== Theta formatting =====
  function formatTheta(theta) {
    var rad = theta.toFixed(3);
    var pf = cleanPiFraction(theta);
    if (pf) return rad + ' rad \u2248 ' + pf;
    return rad + ' rad';
  }

  function cleanPiFraction(theta) {
    if (Math.abs(theta) < 1e-9) return '0';
    var tOverPi = theta / Math.PI;
    var denoms = [1, 2, 3, 4, 6, 8, 12];
    for (var i = 0; i < denoms.length; i++) {
      var d = denoms[i];
      var num = tOverPi * d;
      var nr = Math.round(num);
      if (nr === 0) continue;
      if (Math.abs(num - nr) < 1e-3) {
        var g = gcd(Math.abs(nr), d);
        var n = nr / g;
        var dd = d / g;
        if (dd === 1) {
          if (n === 1) return '\u03C0';
          if (n === -1) return '\u2212\u03C0';
          return n + '\u03C0';
        }
        var nStr;
        if (n === 1) nStr = '\u03C0';
        else if (n === -1) nStr = '\u2212\u03C0';
        else nStr = n + '\u03C0';
        return nStr + '/' + dd;
      }
    }
    return null;
  }

  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

  // ===== Behavior detection =====
  function describeRBehavior(curve, t) {
    var eps = 0.025;
    var tBack = Math.max(0, t - eps);
    var tFwd = Math.min(curve.domainMax, t + eps);
    if (tFwd - tBack < 1e-6) return 'r is at extremum';
    var rBack = curve.fn(tBack);
    var rFwd = curve.fn(tFwd);
    var d = (rFwd - rBack) / (tFwd - tBack);
    if (Math.abs(d) < 0.02) return 'r is at extremum';
    return d > 0 ? 'r is increasing' : 'r is decreasing';
  }

  function describeDistBehavior(curve, t) {
    var r = curve.fn(t);
    if (Math.abs(r) < 0.01) return 'At the pole';
    var eps = 0.025;
    var tBack = Math.max(0, t - eps);
    var tFwd = Math.min(curve.domainMax, t + eps);
    if (tFwd - tBack < 1e-6) return 'Distance at extremum';
    var dBack = Math.abs(curve.fn(tBack));
    var dFwd = Math.abs(curve.fn(tFwd));
    var d = (dFwd - dBack) / (tFwd - tBack);
    if (Math.abs(d) < 0.02) return 'Distance at extremum';
    return d > 0
      ? 'Distance from pole is increasing'
      : 'Distance from pole is decreasing';
  }

  // ===== Drawing =====
  function drawAll() {
    drawRect();
    drawPolar();
  }

  // --- Rectangular plot ---
  function drawRect() {
    var w = rectCanvas.clientWidth;
    var h = rectCanvas.clientHeight;
    var ctx = rectCtx;
    ctx.clearRect(0, 0, w, h);

    var curve = CURVES[state.curveId];
    var margin = { top: 22, right: 18, bottom: 36, left: 52 };
    var plotW = w - margin.left - margin.right;
    var plotH = h - margin.top - margin.bottom;

    // r-axis plot range with 10% margin (always include 0 in visible range).
    var rLo0 = curve.rectRRange[0];
    var rHi0 = curve.rectRRange[1];
    var visLo = Math.min(rLo0, 0);
    var visHi = Math.max(rHi0, 0);
    var span = visHi - visLo;
    var pad = span * 0.1;
    var rPlotLo = visLo - pad;
    var rPlotHi = visHi + pad;

    function tx(t) { return margin.left + (t / curve.domainMax) * plotW; }
    function ty(r) { return margin.top + plotH - ((r - rPlotLo) / (rPlotHi - rPlotLo)) * plotH; }

    // ----- Grid -----
    ctx.lineWidth = 1;
    ctx.strokeStyle = COLOR.greyLight;
    ctx.beginPath();
    for (var i = 0; i < curve.rTicks.values.length; i++) {
      var rv = curve.rTicks.values[i];
      ctx.moveTo(margin.left, ty(rv));
      ctx.lineTo(margin.left + plotW, ty(rv));
    }
    var thetaTicks = getThetaTicks(curve.domainMax);
    for (var j = 0; j < thetaTicks.length; j++) {
      ctx.moveTo(tx(thetaTicks[j]), margin.top);
      ctx.lineTo(tx(thetaTicks[j]), margin.top + plotH);
    }
    ctx.stroke();

    // Bold zero line (per flag #10).
    ctx.strokeStyle = COLOR.grey;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin.left, ty(0));
    ctx.lineTo(margin.left + plotW, ty(0));
    ctx.stroke();

    // Plot border
    ctx.lineWidth = 1;
    ctx.strokeStyle = COLOR.grey;
    ctx.strokeRect(margin.left + 0.5, margin.top + 0.5, plotW, plotH);

    // ----- Tick labels -----
    ctx.fillStyle = COLOR.ink;
    ctx.font = '12px ' + getUiFont();
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (var k = 0; k < curve.rTicks.values.length; k++) {
      ctx.fillText(curve.rTicks.labels[k], margin.left - 6, ty(curve.rTicks.values[k]));
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (var m = 0; m < thetaTicks.length; m++) {
      ctx.fillText(formatThetaTick(thetaTicks[m]), tx(thetaTicks[m]), margin.top + plotH + 6);
    }

    // ----- Axis labels -----
    ctx.fillStyle = COLOR.greyDark;
    ctx.font = 'italic 13px ' + getMathFont();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('\u03B8', margin.left + plotW / 2, h - 4);

    ctx.save();
    ctx.translate(14, margin.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('r', 0, 0);
    ctx.restore();

    // ----- Trace -----
    drawRectTrace(curve, tx, ty);

    // ----- Marker -----
    var rNow = curve.fn(state.theta);
    drawMarker(ctx, tx(state.theta), ty(rNow), rNow);
  }

  function drawRectTrace(curve, tx, ty) {
    var maxT = state.maxTheta;
    if (maxT <= 0) return;
    var step = 0.01;
    var ctx = rectCtx;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    var r0 = curve.fn(0);
    var lastSign = r0 >= 0 ? 1 : -1;
    ctx.strokeStyle = lastSign >= 0 ? COLOR.navy : COLOR.coral;
    ctx.beginPath();
    ctx.moveTo(tx(0), ty(r0));

    var prevT = 0;
    var prevR = r0;
    for (var t = step; t <= maxT + 1e-9; t += step) {
      var tc = t > maxT ? maxT : t;
      var rc = curve.fn(tc);
      var sign = rc >= 0 ? 1 : -1;
      if (sign !== lastSign) {
        // Linear interp the zero crossing
        var frac = prevR / (prevR - rc);  // r=0 fraction along [prevR, rc]
        if (!isFinite(frac) || frac < 0 || frac > 1) frac = 0.5;
        var tZero = prevT + frac * (tc - prevT);
        ctx.lineTo(tx(tZero), ty(0));
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = sign >= 0 ? COLOR.navy : COLOR.coral;
        ctx.moveTo(tx(tZero), ty(0));
        ctx.lineTo(tx(tc), ty(rc));
        lastSign = sign;
      } else {
        ctx.lineTo(tx(tc), ty(rc));
      }
      prevT = tc;
      prevR = rc;
      if (tc >= maxT) break;
    }
    ctx.stroke();
  }

  // --- Polar plot ---
  function drawPolar() {
    var w = polarCanvas.clientWidth;
    var h = polarCanvas.clientHeight;
    var ctx = polarCtx;
    ctx.clearRect(0, 0, w, h);

    var halfSide = state.polarHalfSide;
    if (halfSide <= 0) halfSide = 1;
    var cx = w / 2;
    var cy = h / 2;
    var scale = (Math.min(w, h) / 2) / halfSide;

    function px(x) { return cx + x * scale; }
    function py(y) { return cy - y * scale; }

    // ----- Polar grid -----
    drawPolarGrid(ctx, cx, cy, halfSide, scale);

    // ----- Pole indicator (4px black) -----
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, TWO_PI);
    ctx.fill();

    // ----- Trace -----
    drawPolarTrace(CURVES[state.curveId], px, py);

    // ----- Radial line (if toggled on) -----
    var curve = CURVES[state.curveId];
    var t = state.theta;
    var r = curve.fn(t);
    var markerX = r * Math.cos(t);
    var markerY = r * Math.sin(t);
    var msx = px(markerX);
    var msy = py(markerY);

    if (state.radialOn) {
      ctx.save();
      ctx.strokeStyle = COLOR.grey;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(msx, msy);
      ctx.stroke();
      ctx.restore();
    }

    // ----- Marker -----
    drawMarker(ctx, msx, msy, r);
  }

  function drawPolarGrid(ctx, cx, cy, halfSide, scale) {
    // 6 concentric rings up to maxR (= halfSide / 1.1).
    var maxR = halfSide / 1.1;
    var nRings = 6;
    var ringStep = maxR / nRings;

    ctx.strokeStyle = COLOR.greyLight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 1; i <= nRings - 1; i++) {
      ctx.moveTo(cx + i * ringStep * scale, cy);
      ctx.arc(cx, cy, i * ringStep * scale, 0, TWO_PI);
    }
    ctx.stroke();

    // Outer ring slightly darker
    ctx.strokeStyle = COLOR.grey;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * scale, 0, TWO_PI);
    ctx.stroke();

    // 12 radial spokes (every pi/6)
    ctx.strokeStyle = COLOR.greyLight;
    ctx.beginPath();
    for (var k = 0; k < 12; k++) {
      // Skip cardinals -- drawn slightly darker below
      if (k % 3 === 0) continue;
      var ang = (k / 12) * TWO_PI;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * maxR * scale, cy + Math.sin(-ang) * maxR * scale);
    }
    ctx.stroke();

    // Cardinal axes (darker)
    ctx.strokeStyle = COLOR.grey;
    ctx.beginPath();
    ctx.moveTo(cx - maxR * scale, cy);
    ctx.lineTo(cx + maxR * scale, cy);
    ctx.moveTo(cx, cy - maxR * scale);
    ctx.lineTo(cx, cy + maxR * scale);
    ctx.stroke();

    // Polar axis label
    ctx.fillStyle = COLOR.greyDark;
    ctx.font = 'italic 11px ' + getUiFont();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Polar Axis', cx + maxR * scale + 4, cy);
  }

  function drawPolarTrace(curve, px, py) {
    var maxT = state.maxTheta;
    if (maxT <= 0) return;
    var step = 0.005;  // finer for polar -- curves can be tight
    var ctx = polarCtx;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    var r0 = curve.fn(0);
    var lastSign = r0 >= 0 ? 1 : -1;
    ctx.strokeStyle = lastSign >= 0 ? COLOR.navy : COLOR.coral;
    ctx.beginPath();
    ctx.moveTo(px(r0 * Math.cos(0)), py(r0 * Math.sin(0)));

    var prevT = 0;
    var prevR = r0;
    for (var t = step; t <= maxT + 1e-9; t += step) {
      var tc = t > maxT ? maxT : t;
      var rc = curve.fn(tc);
      var sign = rc >= 0 ? 1 : -1;
      if (sign !== lastSign) {
        var frac = prevR / (prevR - rc);
        if (!isFinite(frac) || frac < 0 || frac > 1) frac = 0.5;
        var tZero = prevT + frac * (tc - prevT);
        // At the zero crossing the point lies AT the pole (origin), regardless of theta.
        ctx.lineTo(px(0), py(0));
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = sign >= 0 ? COLOR.navy : COLOR.coral;
        ctx.moveTo(px(0), py(0));
        ctx.lineTo(px(rc * Math.cos(tc)), py(rc * Math.sin(tc)));
        lastSign = sign;
      } else {
        ctx.lineTo(px(rc * Math.cos(tc)), py(rc * Math.sin(tc)));
      }
      prevT = tc;
      prevR = rc;
      if (tc >= maxT) break;
    }
    ctx.stroke();
  }

  // ===== Marker =====
  function drawMarker(ctx, sx, sy, r) {
    var color = r >= 0 ? COLOR.navy : COLOR.coral;
    // White halo
    ctx.beginPath();
    ctx.arc(sx, sy, 5.5, 0, TWO_PI);
    ctx.fillStyle = COLOR.white;
    ctx.fill();
    // Filled circle
    ctx.beginPath();
    ctx.arc(sx, sy, 4, 0, TWO_PI);
    ctx.fillStyle = color;
    ctx.fill();
  }

  // ===== Tick helpers =====
  function getThetaTicks(domainMax) {
    var step = (domainMax > TWO_PI + 1e-6) ? Math.PI : Math.PI / 2;
    var ticks = [];
    for (var t = 0; t <= domainMax + 1e-6; t += step) {
      ticks.push(t);
    }
    // Snap last tick to exact domainMax if close
    if (Math.abs(ticks[ticks.length - 1] - domainMax) < 1e-6) {
      ticks[ticks.length - 1] = domainMax;
    }
    return ticks;
  }

  function formatThetaTick(t) {
    var pf = cleanPiFraction(t);
    if (pf) return pf;
    return t.toFixed(2);
  }

  // ===== Font helpers =====
  function getUiFont() {
    return "Aptos, Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  }

  function getMathFont() {
    return "'Cambria Math', Cambria, 'STIX Two Math', Georgia, serif";
  }

  // ===== Boot =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
