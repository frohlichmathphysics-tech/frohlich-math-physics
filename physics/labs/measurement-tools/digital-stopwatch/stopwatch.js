/**
 * DigitalStopwatch — reusable digital stopwatch measurement-tool module
 *
 * Mr. Frohlich Math and Physics
 * Path: physics/labs/measurement-tools/digital-stopwatch
 *
 * Sibling to manual-stopwatch. Use this when the student must read
 * elapsed time mid-event (e.g., dropping breadcrumbs while a cart
 * rolls) — the live digital readout removes the analog-dial
 * coordination noise that pollutes that task's data.
 *
 * Display behavior:
 *   - Idle / Reset:  readout = 00.00
 *   - Running:       readout updates every animation frame
 *   - Stopped:       readout freezes at the last reading
 *
 * Time format (adaptive):
 *   -  <  60 s:  SS.cc          e.g.  07.42
 *   -  >= 60 s:  MM:SS.cc       e.g.  01:23.45
 *
 * Lap behavior (only when constructed with showLap: true):
 *   - The Start button morphs into Lap once the timer is running.
 *     A Lap press records cumulative elapsed time; the timer
 *     keeps running.
 *   - Cap: 20 laps. A persistent counter on the right edge of the
 *     lap row shows "N / 20" at all times. At N = 20 the counter
 *     turns red so the cap is visible before the next press. The
 *     21st press pulses the counter, flashes the Lap button, and
 *     is not recorded.
 *   - Lap chips render in a horizontally scrollable strip beneath
 *     the buttons. Each chip shows cumulative time (students compute
 *     splits themselves).
 *
 * Start-from-stopped guard:
 *   - If laps were recorded in the previous run, Start is disabled
 *     until Reset is pressed. Protects classroom data from a
 *     one-pixel slip.
 *   - With no laps recorded, Start from stopped wipes elapsed and
 *     restarts at 0 (matches manual-stopwatch behavior).
 *
 * Time source: performance.now() — wall-clock real time. The
 * stopwatch never knows scene playback speed; that is the scene's
 * responsibility.
 *
 * Self-contained: this module injects its own CSS on first load.
 * Hosts need only load this JS file — no companion stylesheet.
 *
 * Usage:
 *   const sw = new DigitalStopwatch({
 *     container: document.getElementById('frame'),
 *     x: 880, y: 40,
 *     size: 220,
 *     showLap: false
 *   });
 *
 *   sw.getElapsedMs();  // last captured ms (0 if never stopped)
 *   sw.getCurrentMs();  // live elapsed (even while running)
 *   sw.getLapsMs();     // cumulative ms per lap [t1, t2, t3, ...]
 *   sw.getSplitsMs();   // delta ms per lap [t1, t2-t1, t3-t2, ...]
 */

// ── Embedded styles ──────────────────────────────────────────────────────
const DIGITAL_STOPWATCH_STYLES = `
.dsw-wrap {
  position: absolute;
  user-select: none;
  -webkit-user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Body — the draggable region. Touch-action: none so a finger drag
   on the body doesn't trigger page scroll. Buttons and lap strip
   override touch-action below. */
.dsw-body {
  background: #ffffff;
  border: 1px solid #bbbbbb;
  border-radius: 10px;
  padding: 12px 14px 14px;
  box-sizing: border-box;
  cursor: grab;
  touch-action: none;
}
.dsw-body:active { cursor: grabbing; }

.dsw-wrap--with-laps .dsw-body {
  border-radius: 10px 10px 0 0;
  border-bottom: none;
}

/* Brand */
.dsw-brand {
  text-align: center;
  font: 700 9px sans-serif;
  color: #666666;
  letter-spacing: 0.5px;
  margin: 0 0 1px;
}
.dsw-brand-sub {
  text-align: center;
  font: italic 7px sans-serif;
  color: #888888;
  letter-spacing: 0.3px;
  margin: 0 0 10px;
}

/* Readout */
.dsw-readout {
  background: #10121E;
  border-radius: 6px;
  padding: 10px 8px;
  text-align: center;
  margin-bottom: 12px;
  overflow: hidden;
}
.dsw-readout-digits {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, 'Courier New', monospace;
  font-weight: 700;
  color: #FAF3DE;
  letter-spacing: 1px;
  display: inline-block;
  line-height: 1;
}

/* Buttons */
.dsw-buttons {
  display: flex;
  gap: 6px;
}
.dsw-btn {
  flex: 1;
  padding: 9px 6px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  color: #e8e8e8;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  background: #2a2e36;
  cursor: pointer;
  transition: background 0.12s, opacity 0.12s, transform 0.06s;
  touch-action: manipulation;
}
.dsw-btn:hover:not(:disabled) { background: #3a3f4a; }
.dsw-btn:active:not(:disabled) { transform: translateY(1px); }
.dsw-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.dsw-btn-start:not(:disabled),
.dsw-btn-lap:not(:disabled) {
  background: #1f6b3d;
  border-color: #2a8c52;
}
.dsw-btn-start:hover:not(:disabled),
.dsw-btn-lap:hover:not(:disabled) {
  background: #2a8c52;
}

.dsw-btn-stop:not(:disabled) {
  background: #a8222a;
  border-color: #cc333d;
}
.dsw-btn-stop:hover:not(:disabled) { background: #cc333d; }

/* Cap-reached flash (21st lap press) */
@keyframes dsw-flash {
  0%   { background: #1f6b3d; }
  50%  { background: #d44a4a; }
  100% { background: #1f6b3d; }
}
.dsw-btn-flash {
  animation: dsw-flash 150ms ease-in-out;
}

/* Lap row — sibling of body, not child, so the chip strip's pan-x
   touch-action isn't overridden by the body's touch-action: none.
   The row has two parts: a scrollable chip strip on the left, and
   a pinned "N / max" counter on the right that's always visible. */
.dsw-laps-wrap {
  display: flex;
  align-items: stretch;
  background: #ffffff;
  border: 1px solid #bbbbbb;
  border-top: 1px dashed #d8d8d8;
  border-radius: 0 0 10px 10px;
  box-sizing: border-box;
}
.dsw-laps {
  flex: 1;
  min-width: 0;            /* prevents flex blow-out from long chip rows */
  padding: 6px 8px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  touch-action: pan-x;
  scrollbar-width: thin;
}
.dsw-laps::-webkit-scrollbar { height: 6px; }
.dsw-laps::-webkit-scrollbar-thumb {
  background: #bbbbbb;
  border-radius: 3px;
}
.dsw-laps-counter {
  flex: 0 0 auto;
  align-self: center;
  margin: 4px 6px 4px 0;
  padding: 3px 7px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 11px;
  font-weight: 600;
  color: #666666;
  border-left: 1px solid #d8d8d8;
  padding-left: 8px;
  border-radius: 3px;
  white-space: nowrap;
}
.dsw-laps-counter--cap {
  color: #ffffff;
  background: #a8222a;
  border-left: 1px solid transparent;
}
@keyframes dsw-counter-pulse {
  0%   { transform: scale(1);    }
  50%  { transform: scale(1.18); }
  100% { transform: scale(1);    }
}
.dsw-laps-counter--pulse {
  animation: dsw-counter-pulse 220ms ease-in-out;
}
.dsw-lap-chip {
  display: inline-block;
  background: #f3f3ee;
  border: 1px solid #d0d0c7;
  border-radius: 4px;
  padding: 4px 7px;
  margin-right: 5px;
  font-size: 11px;
  color: #1E2A5C;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}
.dsw-lap-chip:last-child { margin-right: 0; }
.dsw-lap-chip-label {
  color: #666666;
  margin-right: 5px;
  font-family: sans-serif;
  font-weight: 600;
}
.dsw-laps-empty {
  display: inline-block;
  font-size: 11px;
  color: #aaaaaa;
  font-style: italic;
  padding: 4px 2px;
}
`;

(function injectDigitalStopwatchStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('frohlich-digital-stopwatch-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'frohlich-digital-stopwatch-styles';
  styleEl.textContent = DIGITAL_STOPWATCH_STYLES;
  document.head.appendChild(styleEl);
})();

// ── Class ────────────────────────────────────────────────────────────────
class DigitalStopwatch {
  constructor(options) {
    this.container = options.container;
    this.x       = options.x ?? 20;
    this.y       = options.y ?? 20;
    this.size    = options.size ?? 220;        // width in px
    this.showLap = options.showLap ?? false;
    this.maxLaps = 20;

    this.state     = 'idle';   // 'idle' | 'running' | 'stopped'
    this.startTime = 0;
    this.elapsedMs = 0;        // frozen at stop
    this.laps      = [];       // cumulative ms

    this._isDragging  = false;
    this._dragOffsetX = 0;
    this._dragOffsetY = 0;
    this._rafId = 0;

    this._buildDOM();
    this._attachEvents();
    this._renderDisplay(0);
    this._renderLapStrip();
    this._updateButtonStates();
  }

  // ── Public API ─────────────────────────────────────────────────────────

  start() {
    if (this.state === 'running') return;
    // Guard: refuse start from stopped state when laps are recorded.
    // User must press Reset first.
    if (this.state === 'stopped' && this.laps.length > 0) return;
    this.state = 'running';
    this.startTime = performance.now();
    this.elapsedMs = 0;
    this.laps = [];
    this._renderLapStrip();
    this._updateButtonStates();
    this._tick();
  }

  stop() {
    if (this.state !== 'running') return;
    this.elapsedMs = performance.now() - this.startTime;
    this.state = 'stopped';
    cancelAnimationFrame(this._rafId);
    this._renderDisplay(this.elapsedMs);
    this._updateButtonStates();
  }

  reset() {
    this.state = 'idle';
    cancelAnimationFrame(this._rafId);
    this.elapsedMs = 0;
    this.laps = [];
    this._renderDisplay(0);
    this._renderLapStrip();
    this._updateButtonStates();
  }

  lap() {
    if (this.state !== 'running') return;
    if (!this.showLap) return;
    if (this.laps.length >= this.maxLaps) {
      this._signalCapReached();
      return;
    }
    const t = performance.now() - this.startTime;
    this.laps.push(t);
    this._renderLapStrip();
  }

  /** Last captured reading in ms. 0 until first stop. */
  getElapsedMs() {
    return this.state === 'stopped' ? this.elapsedMs : 0;
  }

  /** Live elapsed in ms (even while running). 0 when idle. */
  getCurrentMs() {
    if (this.state === 'running') return performance.now() - this.startTime;
    if (this.state === 'stopped') return this.elapsedMs;
    return 0;
  }

  /** Cumulative ms per recorded lap, e.g. [1234, 2567, 3890]. */
  getLapsMs() {
    return this.laps.slice();
  }

  /** Split (delta) ms per lap, e.g. [1234, 1333, 1323]. */
  getSplitsMs() {
    return this.laps.map((t, i) => i === 0 ? t : t - this.laps[i - 1]);
  }

  // ── DOM construction ──────────────────────────────────────────────────

  _buildDOM() {
    const wrap = document.createElement('div');
    wrap.className = 'dsw-wrap' + (this.showLap ? ' dsw-wrap--with-laps' : '');
    wrap.style.left  = `${this.x}px`;
    wrap.style.top   = `${this.y}px`;
    wrap.style.width = `${this.size}px`;
    this.wrap = wrap;

    // Body — brand + readout + buttons
    const body = document.createElement('div');
    body.className = 'dsw-body';
    this.body = body;

    const brand1 = document.createElement('div');
    brand1.className = 'dsw-brand';
    brand1.textContent = 'MR. FROHLICH';
    body.appendChild(brand1);

    const brand2 = document.createElement('div');
    brand2.className = 'dsw-brand-sub';
    brand2.textContent = 'Math and Physics';
    body.appendChild(brand2);

    const readout = document.createElement('div');
    readout.className = 'dsw-readout';
    const digits = document.createElement('span');
    digits.className = 'dsw-readout-digits';
    // Scale font with size; default 220 → ~36 px digits
    digits.style.fontSize = `${Math.round(this.size * 0.165)}px`;
    digits.textContent = '00.00';
    readout.appendChild(digits);
    body.appendChild(readout);
    this.digits = digits;

    const btnRow = document.createElement('div');
    btnRow.className = 'dsw-buttons';

    this.btnPrimary = document.createElement('button');
    this.btnPrimary.className = 'dsw-btn dsw-btn-start';
    this.btnPrimary.textContent = 'Start';

    this.btnStop = document.createElement('button');
    this.btnStop.className = 'dsw-btn dsw-btn-stop';
    this.btnStop.textContent = 'Stop';

    this.btnReset = document.createElement('button');
    this.btnReset.className = 'dsw-btn dsw-btn-reset';
    this.btnReset.textContent = 'Reset';

    btnRow.append(this.btnPrimary, this.btnStop, this.btnReset);
    body.appendChild(btnRow);

    wrap.appendChild(body);

    // Lap row — sibling of body so the chip strip's pan-x touch-action
    // isn't overridden by body's touch-action: none. Two-part row:
    //   .dsw-laps          → scrollable chip strip (flex: 1)
    //   .dsw-laps-counter  → pinned right-side "N / max" counter
    if (this.showLap) {
      const lapsWrap = document.createElement('div');
      lapsWrap.className = 'dsw-laps-wrap';

      const laps = document.createElement('div');
      laps.className = 'dsw-laps';
      lapsWrap.appendChild(laps);
      this.lapStrip = laps;

      const counter = document.createElement('div');
      counter.className = 'dsw-laps-counter';
      counter.textContent = `0 / ${this.maxLaps}`;
      lapsWrap.appendChild(counter);
      this.lapCounter = counter;

      wrap.appendChild(lapsWrap);
    }

    this.container.appendChild(wrap);
  }

  // ── Events ────────────────────────────────────────────────────────────

  _attachEvents() {
    // Buttons (stopPropagation so click doesn't initiate drag)
    this.btnPrimary.addEventListener('click', e => {
      e.stopPropagation();
      if (this.state === 'running' && this.showLap) {
        this.lap();
      } else {
        this.start();
      }
    });
    this.btnStop .addEventListener('click', e => { e.stopPropagation(); this.stop();  });
    this.btnReset.addEventListener('click', e => { e.stopPropagation(); this.reset(); });

    // Drag attached to body only (lap strip excluded → native scroll)
    const onDown = e => {
      if (e.target.closest('.dsw-btn')) return;
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

    this.body.addEventListener('mousedown',  onDown);
    this.body.addEventListener('touchstart', onDown, { passive: false });
  }

  // ── Visual helpers ────────────────────────────────────────────────────

  _tick() {
    if (this.state !== 'running') return;
    const ms = performance.now() - this.startTime;
    this._renderDisplay(ms);
    this._rafId = requestAnimationFrame(() => this._tick());
  }

  _renderDisplay(ms) {
    this.digits.textContent = DigitalStopwatch.formatTime(ms);
  }

  /** Format ms as adaptive SS.cc (< 60 s) or MM:SS.cc (>= 60 s). */
  static formatTime(ms) {
    if (ms < 0) ms = 0;
    const totalCs  = Math.floor(ms / 10);     // hundredths
    const cs       = totalCs % 100;
    const totalSec = Math.floor(totalCs / 100);
    const sec      = totalSec % 60;
    const min      = Math.floor(totalSec / 60);
    const csStr    = String(cs ).padStart(2, '0');
    const secStr   = String(sec).padStart(2, '0');
    if (min === 0) {
      return `${secStr}.${csStr}`;
    }
    return `${String(min).padStart(2, '0')}:${secStr}.${csStr}`;
  }

  _renderLapStrip() {
    if (!this.lapStrip) return;

    // Chip area
    this.lapStrip.innerHTML = '';
    if (this.laps.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'dsw-laps-empty';
      empty.textContent = 'no laps recorded';
      this.lapStrip.appendChild(empty);
    } else {
      this.laps.forEach((t, i) => {
        const chip = document.createElement('span');
        chip.className = 'dsw-lap-chip';
        const lbl = document.createElement('span');
        lbl.className = 'dsw-lap-chip-label';
        lbl.textContent = `L${i + 1}`;
        chip.appendChild(lbl);
        chip.appendChild(document.createTextNode(DigitalStopwatch.formatTime(t)));
        this.lapStrip.appendChild(chip);
      });
      // Auto-scroll to newest chip
      this.lapStrip.scrollLeft = this.lapStrip.scrollWidth;
    }

    // Counter
    if (this.lapCounter) {
      this.lapCounter.textContent = `${this.laps.length} / ${this.maxLaps}`;
      if (this.laps.length >= this.maxLaps) {
        this.lapCounter.classList.add('dsw-laps-counter--cap');
      } else {
        this.lapCounter.classList.remove('dsw-laps-counter--cap');
      }
    }
  }

  /** Triple feedback when the 20-lap cap is hit on a Lap press:
   *  (1) red counter chip stays visible until Reset,
   *  (2) counter pulses briefly to draw the eye on the 21st press,
   *  (3) Lap button flashes red as secondary confirmation. */
  _signalCapReached() {
    // Button flash
    this.btnPrimary.classList.remove('dsw-btn-flash');
    void this.btnPrimary.offsetWidth;
    this.btnPrimary.classList.add('dsw-btn-flash');
    setTimeout(() => this.btnPrimary.classList.remove('dsw-btn-flash'), 200);

    // Counter pulse
    if (this.lapCounter) {
      this.lapCounter.classList.remove('dsw-laps-counter--pulse');
      void this.lapCounter.offsetWidth;
      this.lapCounter.classList.add('dsw-laps-counter--pulse');
      setTimeout(() => this.lapCounter.classList.remove('dsw-laps-counter--pulse'), 260);
    }
  }

  _updateButtonStates() {
    // Primary button morphs: Lap (running + showLap), otherwise Start
    if (this.state === 'running' && this.showLap) {
      this.btnPrimary.textContent = 'Lap';
      this.btnPrimary.className   = 'dsw-btn dsw-btn-lap';
      this.btnPrimary.disabled    = false;
    } else {
      this.btnPrimary.textContent = 'Start';
      this.btnPrimary.className   = 'dsw-btn dsw-btn-start';
      const guard = this.state === 'stopped' && this.laps.length > 0;
      this.btnPrimary.disabled = this.state === 'running' || guard;
    }
    this.btnStop .disabled = this.state !== 'running';
    this.btnReset.disabled = false;  // always available
  }
}

// Expose globally so non-module scripts can use it
if (typeof window !== 'undefined') {
  window.DigitalStopwatch = DigitalStopwatch;
}
