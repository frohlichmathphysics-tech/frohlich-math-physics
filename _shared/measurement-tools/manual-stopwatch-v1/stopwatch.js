/**
 * Stopwatch — reusable analog stopwatch measurement-tool module
 *
 * Mr. Frohlich Math and Physics
 * Path: physics/labs/measurement-tools/manual-stopwatch
 *
 * Display behavior:
 *   - Idle / Running:  hand frozen at 12 o'clock (zero)
 *   - Stopped:         hand snaps instantly to elapsed-time position
 *   - Running:         red indicator dot pulses near center (only visual
 *                      cue that it is timing — the hand does not move)
 *
 * Time source: performance.now() — wall-clock real time. The stopwatch
 * itself never knows or cares about scene playback speed; that is the
 * scene's responsibility (and is the §3.4 reaction-time teaching point).
 *
 * Dial range: 0..maxSeconds (default 10). If elapsed exceeds maxSeconds,
 * the hand position is taken modulo maxSeconds (analog wrap-around).
 *
 * Self-contained: this module injects its own CSS on first load. Hosts
 * need only load this JS file — no companion stylesheet required.
 *
 * Usage:
 *   const sw = new Stopwatch({
 *     container: document.getElementById('frame'),
 *     x: 40, y: 40,
 *     maxSeconds: 10,
 *     size: 220
 *   });
 */

// ── Embedded styles (was styles.css) ─────────────────────────────────────
const STOPWATCH_STYLES = `
.sw-wrap {
  position: absolute;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.sw-dial {
  display: block;
  cursor: grab;
}
.sw-dial:active { cursor: grabbing; }

/* Body */
.sw-bezel {
  fill: #3a3f4a;
  stroke: #1a1d24;
  stroke-width: 2;
}
.sw-face {
  fill: #ffffff;
  stroke: #bbbbbb;
  stroke-width: 1;
}

/* Ticks */
.sw-tick-major {
  stroke: #000000;
  stroke-width: 2.5;
  stroke-linecap: round;
}
.sw-tick-mid {
  stroke: #000000;
  stroke-width: 1.5;
  stroke-linecap: round;
}
.sw-tick-minor {
  stroke: #000000;
  stroke-width: 1;
  stroke-linecap: round;
}
.sw-tick-label {
  fill: #000000;
  font: bold 14px sans-serif;
  text-anchor: middle;
  dominant-baseline: central;
}

/* Hand — instant snap, no transition */
.sw-hand {
  stroke: #000000;
  stroke-width: 2.5;
  stroke-linecap: round;
  transform-origin: 0 0;
}
.sw-pin {
  fill: #000000;
  stroke: #000000;
  stroke-width: 1;
}

/* Brand + range labels (face decoration) */
.sw-brand {
  fill: #666666;
  font: 700 8px sans-serif;
  letter-spacing: 0.5px;
  text-anchor: middle;
}
.sw-brand-sub {
  fill: #666666;
  font: italic 6.5px sans-serif;
  letter-spacing: 0.3px;
  text-anchor: middle;
}
.sw-range {
  fill: #666666;
  font: 7px sans-serif;
  letter-spacing: 0.5px;
  text-anchor: middle;
}
.sw-indicator {
  fill: #c0142b;
}

/* Buttons */
.sw-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-top: 10px;
  padding: 0 2px;
}
.sw-btn {
  flex: 1;
  padding: 9px 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  background: #2a2e36;
  color: #e8e8e8;
  cursor: pointer;
  transition: background 0.12s, opacity 0.12s;
}
.sw-btn:hover:not(:disabled) { background: #3a3f4a; }
.sw-btn:active:not(:disabled) { transform: translateY(1px); }
.sw-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.sw-btn-start:not(:disabled) {
  background: #1f6b3d;
  border-color: #2a8c52;
}
.sw-btn-start:hover:not(:disabled) { background: #2a8c52; }

.sw-btn-stop:not(:disabled) {
  background: #a8222a;
  border-color: #cc333d;
}
.sw-btn-stop:hover:not(:disabled) { background: #cc333d; }
`;

// Inject styles once per page, on first load of this module.
(function injectStopwatchStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('frohlich-stopwatch-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'frohlich-stopwatch-styles';
  styleEl.textContent = STOPWATCH_STYLES;
  document.head.appendChild(styleEl);
})();

// ── Class ────────────────────────────────────────────────────────────────
class Stopwatch {
  constructor(options) {
    this.container   = options.container;
    this.x           = options.x ?? 20;
    this.y           = options.y ?? 20;
    this.maxSeconds  = options.maxSeconds ?? 10;
    this.size        = options.size ?? 220;

    this.state      = 'idle';   // 'idle' | 'running' | 'stopped'
    this.startTime  = 0;
    this.elapsedMs  = 0;

    this._isDragging = false;
    this._dragOffsetX = 0;
    this._dragOffsetY = 0;

    this._buildDOM();
    this._attachEvents();
    this._updateButtonStates();
  }

  // ── Public API ─────────────────────────────────────────────────────────

  start() {
    if (this.state === 'running') return;
    this.state = 'running';
    this.startTime = performance.now();
    this.elapsedMs = 0;
    this._setHandAngle(0);
    this._indicatorOn();
    this._updateButtonStates();
  }

  stop() {
    if (this.state !== 'running') return;
    this.elapsedMs = performance.now() - this.startTime;
    this.state = 'stopped';
    const sec = this.elapsedMs / 1000;
    const angle = (sec % this.maxSeconds) * (360 / this.maxSeconds);
    this._setHandAngle(angle);
    this._indicatorOff();
    this._updateButtonStates();
  }

  reset() {
    this.state = 'idle';
    this.elapsedMs = 0;
    this._setHandAngle(0);
    this._indicatorOff();
    this._updateButtonStates();
  }

  /** Last captured reading in ms. Returns 0 if never stopped. */
  getElapsedMs() {
    return this.state === 'stopped' ? this.elapsedMs : 0;
  }

  // ── DOM construction ──────────────────────────────────────────────────

  _buildDOM() {
    const NS = 'http://www.w3.org/2000/svg';

    const wrap = document.createElement('div');
    wrap.className = 'sw-wrap';
    wrap.style.left  = `${this.x}px`;
    wrap.style.top   = `${this.y}px`;
    wrap.style.width = `${this.size}px`;
    this.wrap = wrap;

    // SVG dial — viewBox centered on (0,0), radius ~115
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'sw-dial');
    svg.setAttribute('viewBox', '-120 -120 240 240');
    svg.setAttribute('width',  this.size);
    svg.setAttribute('height', this.size);
    this.svg = svg;

    // Outer bezel
    const bezel = document.createElementNS(NS, 'circle');
    bezel.setAttribute('class', 'sw-bezel');
    bezel.setAttribute('cx', 0); bezel.setAttribute('cy', 0); bezel.setAttribute('r', 115);
    svg.appendChild(bezel);

    // Face
    const face = document.createElementNS(NS, 'circle');
    face.setAttribute('class', 'sw-face');
    face.setAttribute('cx', 0); face.setAttribute('cy', 0); face.setAttribute('r', 108);
    svg.appendChild(face);

    // Tick marks + numbers
    const ticks = document.createElementNS(NS, 'g');
    ticks.setAttribute('class', 'sw-ticks');
    const M = this.maxSeconds;
    for (let s = 0; s < M; s++) {
      // Major tick at integer second
      const a = ((s / M) * 360 - 90) * Math.PI / 180;
      const cx = Math.cos(a), cy = Math.sin(a);
      const maj = document.createElementNS(NS, 'line');
      maj.setAttribute('x1', cx * 86); maj.setAttribute('y1', cy * 86);
      maj.setAttribute('x2', cx * 105); maj.setAttribute('y2', cy * 105);
      maj.setAttribute('class', 'sw-tick-major');
      ticks.appendChild(maj);

      // Number label
      const lbl = document.createElementNS(NS, 'text');
      lbl.setAttribute('x', cx * 73);
      lbl.setAttribute('y', cy * 73);
      lbl.setAttribute('class', 'sw-tick-label');
      lbl.textContent = s;
      ticks.appendChild(lbl);

      // Minor ticks every 0.1 s (9 between each integer)
      for (let t = 1; t < 10; t++) {
        const am = (((s + t / 10) / M) * 360 - 90) * Math.PI / 180;
        const mx = Math.cos(am), my = Math.sin(am);
        const min = document.createElementNS(NS, 'line');
        min.setAttribute('x1', mx * 98); min.setAttribute('y1', my * 98);
        min.setAttribute('x2', mx * 105); min.setAttribute('y2', my * 105);
        // Mid-tick at 0.5 is slightly longer for readability
        min.setAttribute('class', t === 5 ? 'sw-tick-mid' : 'sw-tick-minor');
        if (t === 5) {
          min.setAttribute('x1', mx * 92); min.setAttribute('y1', my * 92);
        }
        ticks.appendChild(min);
      }
    }
    svg.appendChild(ticks);

    // Brand text (small, top of face)
    const brand1 = document.createElementNS(NS, 'text');
    brand1.setAttribute('x', 0); brand1.setAttribute('y', -42);
    brand1.setAttribute('class', 'sw-brand');
    brand1.textContent = 'Mr. Frohlich';
    svg.appendChild(brand1);

    const brand2 = document.createElementNS(NS, 'text');
    brand2.setAttribute('x', 0); brand2.setAttribute('y', -30);
    brand2.setAttribute('class', 'sw-brand-sub');
    brand2.textContent = 'Math and Physics';
    svg.appendChild(brand2);

    // Range label (bottom of face)
    const range = document.createElementNS(NS, 'text');
    range.setAttribute('x', 0); range.setAttribute('y', 55);
    range.setAttribute('class', 'sw-range');
    range.textContent = `0 – ${this.maxSeconds} s`;
    svg.appendChild(range);

    // Running indicator (red dot below center)
    const ind = document.createElementNS(NS, 'circle');
    ind.setAttribute('class', 'sw-indicator');
    ind.setAttribute('cx', 0); ind.setAttribute('cy', 32);
    ind.setAttribute('r', 4);
    ind.setAttribute('opacity', 0);
    svg.appendChild(ind);
    this.indicator = ind;

    // Hand
    const hand = document.createElementNS(NS, 'line');
    hand.setAttribute('class', 'sw-hand');
    hand.setAttribute('x1', 0); hand.setAttribute('y1', 14);
    hand.setAttribute('x2', 0); hand.setAttribute('y2', -92);
    hand.setAttribute('transform', 'rotate(0)');
    svg.appendChild(hand);
    this.hand = hand;

    // Center pin
    const pin = document.createElementNS(NS, 'circle');
    pin.setAttribute('class', 'sw-pin');
    pin.setAttribute('cx', 0); pin.setAttribute('cy', 0); pin.setAttribute('r', 6);
    svg.appendChild(pin);

    wrap.appendChild(svg);

    // Buttons
    const btnRow = document.createElement('div');
    btnRow.className = 'sw-buttons';

    this.btnStart = document.createElement('button');
    this.btnStart.className = 'sw-btn sw-btn-start';
    this.btnStart.textContent = 'Start';

    this.btnStop = document.createElement('button');
    this.btnStop.className = 'sw-btn sw-btn-stop';
    this.btnStop.textContent = 'Stop';

    this.btnReset = document.createElement('button');
    this.btnReset.className = 'sw-btn sw-btn-reset';
    this.btnReset.textContent = 'Reset';

    btnRow.append(this.btnStart, this.btnStop, this.btnReset);
    wrap.appendChild(btnRow);

    this.container.appendChild(wrap);
  }

  // ── Events ────────────────────────────────────────────────────────────

  _attachEvents() {
    // Buttons (stopPropagation so a click does not initiate a drag)
    this.btnStart.addEventListener('click', e => { e.stopPropagation(); this.start(); });
    this.btnStop .addEventListener('click', e => { e.stopPropagation(); this.stop();  });
    this.btnReset.addEventListener('click', e => { e.stopPropagation(); this.reset(); });

    // Drag on the SVG dial only (not on buttons)
    const onDown = e => {
      if (e.target.closest('.sw-btn')) return;
      e.preventDefault();
      const ev = (e.touches && e.touches[0]) || e;
      const rect = this.wrap.getBoundingClientRect();
      this._dragOffsetX = ev.clientX - rect.left;
      this._dragOffsetY = ev.clientY - rect.top;
      this._isDragging = true;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend',  onUp);
    };

    const onMove = e => {
      if (!this._isDragging) return;
      e.preventDefault();
      const ev = (e.touches && e.touches[0]) || e;
      const parentRect = this.container.getBoundingClientRect();
      const w = this.wrap.offsetWidth;
      const h = this.wrap.offsetHeight;
      let nx = ev.clientX - parentRect.left - this._dragOffsetX;
      let ny = ev.clientY - parentRect.top  - this._dragOffsetY;
      nx = Math.max(0, Math.min(parentRect.width  - w, nx));
      ny = Math.max(0, Math.min(parentRect.height - h, ny));
      this.wrap.style.left = `${nx}px`;
      this.wrap.style.top  = `${ny}px`;
    };

    const onUp = () => {
      this._isDragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend',  onUp);
    };

    this.svg.addEventListener('mousedown',  onDown);
    this.svg.addEventListener('touchstart', onDown, { passive: false });
  }

  // ── Visual helpers ────────────────────────────────────────────────────

  _setHandAngle(deg) {
    this.hand.setAttribute('transform', `rotate(${deg})`);
  }

  _indicatorOn() {
    this.indicator.setAttribute('opacity', 1);
    this._pulse();
  }

  _indicatorOff() {
    this.indicator.setAttribute('opacity', 0);
  }

  _pulse() {
    if (this.state !== 'running') return;
    const t = performance.now() / 1000;
    const o = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2));
    this.indicator.setAttribute('opacity', o);
    requestAnimationFrame(() => this._pulse());
  }

  _updateButtonStates() {
    this.btnStart.disabled = this.state === 'running';
    this.btnStop.disabled  = this.state !== 'running';
    this.btnReset.disabled = false;  // always available — allows aborting a misclick
  }
}

// Expose globally so non-module scripts can use it
if (typeof window !== 'undefined') {
  window.Stopwatch = Stopwatch;
}
