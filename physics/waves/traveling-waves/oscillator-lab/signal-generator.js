/**
 * SignalGenerator — reusable analog signal-generator measurement-tool module
 *
 * Mr. Frohlich Math and Physics
 * Canonical archive: /_shared/measurement-tools/signal-generator-v1/signal-generator.js
 *
 * Front-panel instrument with two horizontal sliders + a power toggle.
 *
 *   FREQUENCY  — slider with a numbered tick scale above the track.
 *                Major ticks at every `majorStep` Hz, minor ticks at every
 *                `minorStep` Hz. Reading uncertainty = minorStep / 2.
 *                The thumb's fiducial line is the only readout — NO digital
 *                number is displayed. Students estimate f from where the
 *                fiducial sits against the scale. This is the §3.1
 *                tool-resolution pedagogy applied to a linear scale.
 *
 *   AMPLITUDE  — slider on a smooth gradient bar. No ticks, no numerals,
 *                no readout. Pure 0..1 input that the consuming lab applet
 *                scales to canvas pixels. NO uncertainty.
 *
 *   POWER      — single tap-to-toggle button. Red OFF (default) / green ON.
 *                When OFF: sliders still movable, getFrequency() and
 *                getAmplitude() still return their slider values, but
 *                isOn() returns false. The consuming applet decides what
 *                that means (typically: emit no wave).
 *
 * Drag: body is draggable anywhere outside the controls. Sliders drag
 *       horizontally with click-to-jump on the track. Touch-supported.
 *
 * Self-contained: this module injects its own CSS on first load. Hosts
 * need only load this JS file — no companion stylesheet required.
 *
 * Usage:
 *   const sg = new SignalGenerator({
 *     container: document.getElementById('frame'),
 *     x: 40, y: 40,
 *     minHz: 0, maxHz: 20,
 *     majorStep: 2, minorStep: 0.5,
 *     defaultFrequency: 0,
 *     defaultAmplitude: 0.5,
 *     defaultOn: false
 *   });
 *
 *   sg.onChange(({frequency, amplitude, isOn}) => {
 *     // fires on any user OR programmatic change to f, A, or power
 *   });
 *
 * Public methods:
 *   getFrequency()           -> number (Hz, current slider value, float)
 *   getAmplitude()           -> number (0..1, current slider value, float)
 *   getReadingUncertainty()  -> number (Hz, = minorStep / 2)
 *   isOn()                   -> boolean
 *   setFrequency(hz)         -> programmatically set (clamped, fires onChange)
 *   setAmplitude(a)          -> programmatically set (clamped, fires onChange)
 *   setOn(bool)              -> programmatically toggle power (fires onChange)
 *   onChange(callback)       -> register change callback (single listener)
 */

// ── Embedded styles (was styles.css) ─────────────────────────────────────
const SIGNAL_GENERATOR_STYLES = `
.sg-wrap {
  position: absolute;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.sg-svg {
  display: block;
  cursor: grab;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}
.sg-svg:active { cursor: grabbing; }

/* Body — light off-white instrument front panel with dark gray frame */
.sg-body {
  fill: #f0ede5;
  stroke: #3a3f4a;
  stroke-width: 2;
}

/* Header label */
.sg-header {
  fill: #1a1a1a;
  font: 700 11px sans-serif;
  letter-spacing: 0.8px;
  dominant-baseline: central;
}

/* Section labels */
.sg-section-label {
  fill: #3a3f4a;
  font: 700 9px sans-serif;
  letter-spacing: 0.6px;
}

/* Tick scale */
.sg-tick-major {
  stroke: #1a1a1a;
  stroke-width: 1.4;
  stroke-linecap: round;
}
.sg-tick-minor {
  stroke: #1a1a1a;
  stroke-width: 0.8;
  stroke-linecap: round;
}
.sg-tick-numeral {
  fill: #1a1a1a;
  font: 600 9px sans-serif;
}

/* Tracks */
.sg-track-line {
  stroke: #2a2a2a;
  stroke-width: 2;
  stroke-linecap: round;
}
.sg-amp-bar {
  stroke: #2a2a2a;
  stroke-width: 0.5;
}

/* Slider thumb (navy body + cream fiducial — locked palette) */
.sg-thumb-body {
  fill: #1E2A5C;
  stroke: #0d1430;
  stroke-width: 1;
}
.sg-thumb-fiducial {
  stroke: #FAF3DE;
  stroke-width: 1.5;
  stroke-linecap: round;
}

/* Interactive control groups */
.sg-freq-control,
.sg-amp-control { cursor: ew-resize; }
.sg-power-group { cursor: pointer; }

/* Power toggle states */
.sg-power-bg.sg-power-off {
  fill: #a8222a;
  stroke: #7a181e;
  stroke-width: 1;
}
.sg-power-bg.sg-power-on {
  fill: #1f6b3d;
  stroke: #155029;
  stroke-width: 1;
}
.sg-power-label {
  fill: #ffffff;
  font: 700 11px sans-serif;
  letter-spacing: 0.5px;
  dominant-baseline: central;
  text-anchor: middle;
  pointer-events: none;
}

/* Brand label inside the body */
.sg-brand {
  fill: #8a7a4a;
  font: italic 7px sans-serif;
  letter-spacing: 0.5px;
  opacity: 0.65;
}
`;

// Inject styles once per page, on first load of this module.
(function injectSignalGeneratorStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('frohlich-signal-generator-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'frohlich-signal-generator-styles';
  styleEl.textContent = SIGNAL_GENERATOR_STYLES;
  document.head.appendChild(styleEl);
})();

// ── Class ────────────────────────────────────────────────────────────────
class SignalGenerator {
  constructor(options) {
    this.container        = options.container;
    this.x                = options.x ?? 20;
    this.y                = options.y ?? 20;
    this.minHz            = options.minHz ?? 0;
    this.maxHz            = options.maxHz ?? 20;
    this.majorStep        = options.majorStep ?? 2;
    this.minorStep        = options.minorStep ?? 0.5;
    this.defaultFrequency = options.defaultFrequency ?? 0;
    this.defaultAmplitude = options.defaultAmplitude ?? 0.5;
    this.defaultOn        = options.defaultOn ?? false;

    // Panel geometry (viewBox 600 x 200)
    this.panelW       = 600;
    this.panelH       = 200;
    this.trackLeft    = 20;
    this.trackRight   = 580;
    this.trackWidth   = this.trackRight - this.trackLeft;
    this.freqTrackY   = 98;
    this.ampTrackY    = 153;

    // State (clamped on init)
    this.frequency = Math.max(this.minHz, Math.min(this.maxHz, this.defaultFrequency));
    this.amplitude = Math.max(0, Math.min(1, this.defaultAmplitude));
    this._isOn     = !!this.defaultOn;

    // Drag state
    this._dragMode    = null;   // null | 'body' | 'freq' | 'amp'
    this._dragOffsetX = 0;
    this._dragOffsetY = 0;

    // Change callback + last-emitted state (for no-op suppression)
    this._changeCallback = null;
    this._lastEmitted    = null;

    this._buildDOM();
    this._attachEvents();
    this._updatePowerVisual();
    this._updateFreqThumb();
    this._updateAmpThumb();
  }

  // ── Public API ─────────────────────────────────────────────────────────

  getFrequency()           { return this.frequency; }
  getAmplitude()           { return this.amplitude; }
  getReadingUncertainty()  { return this.minorStep / 2; }
  isOn()                   { return this._isOn; }

  setFrequency(hz) {
    this.frequency = Math.max(this.minHz, Math.min(this.maxHz, hz));
    this._updateFreqThumb();
    this._emitChange();
  }

  setAmplitude(a) {
    this.amplitude = Math.max(0, Math.min(1, a));
    this._updateAmpThumb();
    this._emitChange();
  }

  setOn(b) {
    this._isOn = !!b;
    this._updatePowerVisual();
    this._emitChange();
  }

  onChange(cb) {
    this._changeCallback = (typeof cb === 'function') ? cb : null;
  }

  // ── DOM construction ──────────────────────────────────────────────────

  _buildDOM() {
    const NS = 'http://www.w3.org/2000/svg';

    // Unique gradient ID so multiple instances on one page don't collide
    const ampGradId = 'sg-amp-grad-' + Math.random().toString(36).slice(2, 9);

    const wrap = document.createElement('div');
    wrap.className = 'sg-wrap';
    wrap.style.left  = `${this.x}px`;
    wrap.style.top   = `${this.y}px`;
    wrap.style.width = `${this.panelW}px`;
    this.wrap = wrap;

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'sg-svg');
    svg.setAttribute('viewBox', `0 0 ${this.panelW} ${this.panelH}`);
    svg.setAttribute('width',  this.panelW);
    svg.setAttribute('height', this.panelH);
    this.svg = svg;

    // defs — amplitude gradient
    const defs = document.createElementNS(NS, 'defs');
    const grad = document.createElementNS(NS, 'linearGradient');
    grad.setAttribute('id', ampGradId);
    grad.setAttribute('x1', '0%'); grad.setAttribute('x2', '100%');
    grad.setAttribute('y1', '0%'); grad.setAttribute('y2', '0%');
    const stop1 = document.createElementNS(NS, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#d8d3ca');
    const stop2 = document.createElementNS(NS, 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#2a2a2a');
    grad.appendChild(stop1); grad.appendChild(stop2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    // Body
    const body = document.createElementNS(NS, 'rect');
    body.setAttribute('class', 'sg-body');
    body.setAttribute('x', 0); body.setAttribute('y', 0);
    body.setAttribute('width', this.panelW); body.setAttribute('height', this.panelH);
    body.setAttribute('rx', 6);
    svg.appendChild(body);

    // Header label (top-left)
    const header = document.createElementNS(NS, 'text');
    header.setAttribute('class', 'sg-header');
    header.setAttribute('x', 12); header.setAttribute('y', 18);
    header.textContent = 'ANALOG SIGNAL GENERATOR';
    svg.appendChild(header);

    // ── Power toggle (top-right) ──
    const pwrGroup = document.createElementNS(NS, 'g');
    pwrGroup.setAttribute('class', 'sg-power-group');

    const pwrBg = document.createElementNS(NS, 'rect');
    pwrBg.setAttribute('class', 'sg-power-bg');
    pwrBg.setAttribute('x', 528); pwrBg.setAttribute('y', 6);
    pwrBg.setAttribute('width', 64); pwrBg.setAttribute('height', 22);
    pwrBg.setAttribute('rx', 4);
    pwrGroup.appendChild(pwrBg);
    this.powerBg = pwrBg;

    const pwrText = document.createElementNS(NS, 'text');
    pwrText.setAttribute('class', 'sg-power-label');
    pwrText.setAttribute('x', 560); pwrText.setAttribute('y', 17);
    pwrText.textContent = 'OFF';
    pwrGroup.appendChild(pwrText);
    this.powerText = pwrText;

    svg.appendChild(pwrGroup);
    this.powerGroup = pwrGroup;

    // ── FREQUENCY section ──
    const freqLabel = document.createElementNS(NS, 'text');
    freqLabel.setAttribute('class', 'sg-section-label');
    freqLabel.setAttribute('x', 12); freqLabel.setAttribute('y', 48);
    freqLabel.textContent = 'FREQUENCY (Hz)';
    svg.appendChild(freqLabel);

    // Tick scale
    const ticks = document.createElementNS(NS, 'g');
    ticks.setAttribute('class', 'sg-freq-ticks');

    const nMinors = Math.round((this.maxHz - this.minHz) / this.minorStep);
    for (let i = 0; i <= nMinors; i++) {
      const v = this.minHz + i * this.minorStep;
      // Major test: value is a clean multiple of majorStep from minHz
      const stepsFromMin = (v - this.minHz) / this.majorStep;
      const isMajor = Math.abs(stepsFromMin - Math.round(stepsFromMin)) < 1e-6;
      const xPos = this._freqValueToX(v);

      const tick = document.createElementNS(NS, 'line');
      tick.setAttribute('x1', xPos); tick.setAttribute('x2', xPos);
      if (isMajor) {
        tick.setAttribute('class', 'sg-tick-major');
        tick.setAttribute('y1', 76); tick.setAttribute('y2', 88);
      } else {
        tick.setAttribute('class', 'sg-tick-minor');
        tick.setAttribute('y1', 80); tick.setAttribute('y2', 88);
      }
      ticks.appendChild(tick);

      if (isMajor) {
        const lbl = document.createElementNS(NS, 'text');
        lbl.setAttribute('class', 'sg-tick-numeral');
        lbl.setAttribute('x', xPos); lbl.setAttribute('y', 70);
        lbl.setAttribute('text-anchor', 'middle');
        // Format: integer if whole, one decimal otherwise
        lbl.textContent = (Math.abs(v - Math.round(v)) < 1e-6)
          ? String(Math.round(v))
          : v.toFixed(1);
        // Nudge endpoint numerals inward so they don't overflow the body
        if (Math.abs(v - this.minHz) < 1e-6) {
          lbl.setAttribute('text-anchor', 'start');
          lbl.setAttribute('x', xPos - 2);
        } else if (Math.abs(v - this.maxHz) < 1e-6) {
          lbl.setAttribute('text-anchor', 'end');
          lbl.setAttribute('x', xPos + 2);
        }
        ticks.appendChild(lbl);
      }
    }
    svg.appendChild(ticks);

    // Frequency control group (track + hit area + thumb)
    const freqCtrl = document.createElementNS(NS, 'g');
    freqCtrl.setAttribute('class', 'sg-freq-control');

    const freqTrack = document.createElementNS(NS, 'line');
    freqTrack.setAttribute('class', 'sg-track-line');
    freqTrack.setAttribute('x1', this.trackLeft);  freqTrack.setAttribute('y1', this.freqTrackY);
    freqTrack.setAttribute('x2', this.trackRight); freqTrack.setAttribute('y2', this.freqTrackY);
    freqCtrl.appendChild(freqTrack);

    // Wider invisible hit area (so click anywhere near the track jumps the thumb)
    const freqHit = document.createElementNS(NS, 'rect');
    freqHit.setAttribute('class', 'sg-freq-hit');
    freqHit.setAttribute('x', this.trackLeft - 6);
    freqHit.setAttribute('y', this.freqTrackY - 14);
    freqHit.setAttribute('width', this.trackWidth + 12);
    freqHit.setAttribute('height', 28);
    freqHit.setAttribute('fill', 'transparent');
    freqCtrl.appendChild(freqHit);

    // Thumb (positioned via transform)
    const freqThumb = document.createElementNS(NS, 'g');
    freqThumb.setAttribute('class', 'sg-freq-thumb');

    const freqThumbBody = document.createElementNS(NS, 'rect');
    freqThumbBody.setAttribute('class', 'sg-thumb-body');
    freqThumbBody.setAttribute('x', -9); freqThumbBody.setAttribute('y', -13);
    freqThumbBody.setAttribute('width', 18); freqThumbBody.setAttribute('height', 26);
    freqThumbBody.setAttribute('rx', 3);
    freqThumb.appendChild(freqThumbBody);

    const freqFid = document.createElementNS(NS, 'line');
    freqFid.setAttribute('class', 'sg-thumb-fiducial');
    freqFid.setAttribute('x1', 0); freqFid.setAttribute('y1', -13);
    freqFid.setAttribute('x2', 0); freqFid.setAttribute('y2', 13);
    freqThumb.appendChild(freqFid);

    freqCtrl.appendChild(freqThumb);
    this.freqThumb = freqThumb;
    svg.appendChild(freqCtrl);

    // ── AMPLITUDE section ──
    const ampLabel = document.createElementNS(NS, 'text');
    ampLabel.setAttribute('class', 'sg-section-label');
    ampLabel.setAttribute('x', 12); ampLabel.setAttribute('y', 134);
    ampLabel.textContent = 'AMPLITUDE';
    svg.appendChild(ampLabel);

    const ampCtrl = document.createElementNS(NS, 'g');
    ampCtrl.setAttribute('class', 'sg-amp-control');

    // Gradient bar (visible track)
    const ampBar = document.createElementNS(NS, 'rect');
    ampBar.setAttribute('class', 'sg-amp-bar');
    ampBar.setAttribute('x', this.trackLeft);
    ampBar.setAttribute('y', this.ampTrackY - 5);
    ampBar.setAttribute('width', this.trackWidth);
    ampBar.setAttribute('height', 10);
    ampBar.setAttribute('rx', 2);
    ampBar.setAttribute('fill', `url(#${ampGradId})`);
    ampCtrl.appendChild(ampBar);

    // Wider invisible hit area
    const ampHit = document.createElementNS(NS, 'rect');
    ampHit.setAttribute('class', 'sg-amp-hit');
    ampHit.setAttribute('x', this.trackLeft - 6);
    ampHit.setAttribute('y', this.ampTrackY - 12);
    ampHit.setAttribute('width', this.trackWidth + 12);
    ampHit.setAttribute('height', 24);
    ampHit.setAttribute('fill', 'transparent');
    ampCtrl.appendChild(ampHit);

    // Thumb
    const ampThumb = document.createElementNS(NS, 'g');
    ampThumb.setAttribute('class', 'sg-amp-thumb');

    const ampThumbBody = document.createElementNS(NS, 'rect');
    ampThumbBody.setAttribute('class', 'sg-thumb-body');
    ampThumbBody.setAttribute('x', -9); ampThumbBody.setAttribute('y', -11);
    ampThumbBody.setAttribute('width', 18); ampThumbBody.setAttribute('height', 22);
    ampThumbBody.setAttribute('rx', 3);
    ampThumb.appendChild(ampThumbBody);

    const ampFid = document.createElementNS(NS, 'line');
    ampFid.setAttribute('class', 'sg-thumb-fiducial');
    ampFid.setAttribute('x1', 0); ampFid.setAttribute('y1', -11);
    ampFid.setAttribute('x2', 0); ampFid.setAttribute('y2', 11);
    ampThumb.appendChild(ampFid);

    ampCtrl.appendChild(ampThumb);
    this.ampThumb = ampThumb;
    svg.appendChild(ampCtrl);

    // Brand text at bottom of body
    const brand = document.createElementNS(NS, 'text');
    brand.setAttribute('class', 'sg-brand');
    brand.setAttribute('x', this.panelW / 2);
    brand.setAttribute('y', 192);
    brand.setAttribute('text-anchor', 'middle');
    brand.textContent = 'Mr. Frohlich Math and Physics';
    svg.appendChild(brand);

    wrap.appendChild(svg);
    this.container.appendChild(wrap);
  }

  // ── Coordinate helpers ────────────────────────────────────────────────

  _freqValueToX(hz) {
    return this.trackLeft + (hz - this.minHz) / (this.maxHz - this.minHz) * this.trackWidth;
  }

  _xToFreqValue(svgX) {
    const frac = (svgX - this.trackLeft) / this.trackWidth;
    return this.minHz + Math.max(0, Math.min(1, frac)) * (this.maxHz - this.minHz);
  }

  _ampValueToX(a) {
    return this.trackLeft + a * this.trackWidth;
  }

  _xToAmpValue(svgX) {
    const frac = (svgX - this.trackLeft) / this.trackWidth;
    return Math.max(0, Math.min(1, frac));
  }

  /** Convert a clientX (viewport px) to the SVG's internal viewBox X. */
  _clientXToSvgX(clientX) {
    const rect = this.svg.getBoundingClientRect();
    if (rect.width === 0) return 0;
    return (clientX - rect.left) / rect.width * this.panelW;
  }

  // ── Visual updates ────────────────────────────────────────────────────

  _updateFreqThumb() {
    const x = this._freqValueToX(this.frequency);
    this.freqThumb.setAttribute('transform', `translate(${x}, ${this.freqTrackY})`);
  }

  _updateAmpThumb() {
    const x = this._ampValueToX(this.amplitude);
    this.ampThumb.setAttribute('transform', `translate(${x}, ${this.ampTrackY})`);
  }

  _updatePowerVisual() {
    if (this._isOn) {
      this.powerBg.setAttribute('class', 'sg-power-bg sg-power-on');
      this.powerText.textContent = 'ON';
    } else {
      this.powerBg.setAttribute('class', 'sg-power-bg sg-power-off');
      this.powerText.textContent = 'OFF';
    }
  }

  _emitChange() {
    if (!this._changeCallback) return;

    const state = {
      frequency: this.frequency,
      amplitude: this.amplitude,
      isOn:      this._isOn
    };

    // No-op suppression: skip if the state tuple is identical to the
    // last emitted one. Prevents host spam from redundant calls (e.g.,
    // clicking the freq track at the current thumb position, or any
    // pointer event that re-runs the computation without an actual
    // state change).
    if (this._lastEmitted !== null
        && this._lastEmitted.frequency === state.frequency
        && this._lastEmitted.amplitude === state.amplitude
        && this._lastEmitted.isOn      === state.isOn) {
      return;
    }

    this._lastEmitted = state;
    this._changeCallback(state);
  }

  // ── Events ────────────────────────────────────────────────────────────

  _attachEvents() {
    const onDown = e => {
      const target = e.target;
      const ev = (e.touches && e.touches[0]) || e;

      // Power toggle — tap to toggle, no drag
      if (target.closest('.sg-power-group')) {
        e.preventDefault();
        this.setOn(!this._isOn);
        return;
      }

      e.preventDefault();

      // Frequency control — jump thumb to pointer, start freq-drag
      if (target.closest('.sg-freq-control')) {
        this._dragMode = 'freq';
        const sx = this._clientXToSvgX(ev.clientX);
        this.frequency = this._xToFreqValue(sx);
        this._updateFreqThumb();
        this._emitChange();
        this._attachDocListeners();
        return;
      }

      // Amplitude control — jump thumb to pointer, start amp-drag
      if (target.closest('.sg-amp-control')) {
        this._dragMode = 'amp';
        const sx = this._clientXToSvgX(ev.clientX);
        this.amplitude = this._xToAmpValue(sx);
        this._updateAmpThumb();
        this._emitChange();
        this._attachDocListeners();
        return;
      }

      // Otherwise — body drag (reposition the whole panel)
      const rect = this.wrap.getBoundingClientRect();
      this._dragOffsetX = ev.clientX - rect.left;
      this._dragOffsetY = ev.clientY - rect.top;
      this._dragMode = 'body';
      this._attachDocListeners();
    };

    const onMove = e => {
      if (!this._dragMode) return;
      e.preventDefault();
      const ev = (e.touches && e.touches[0]) || e;

      if (this._dragMode === 'freq') {
        const sx = this._clientXToSvgX(ev.clientX);
        this.frequency = this._xToFreqValue(sx);
        this._updateFreqThumb();
        this._emitChange();
        return;
      }

      if (this._dragMode === 'amp') {
        const sx = this._clientXToSvgX(ev.clientX);
        this.amplitude = this._xToAmpValue(sx);
        this._updateAmpThumb();
        this._emitChange();
        return;
      }

      if (this._dragMode === 'body') {
        const parentRect = this.container.getBoundingClientRect();
        const w = this.wrap.offsetWidth;
        const h = this.wrap.offsetHeight;
        let nx = ev.clientX - parentRect.left - this._dragOffsetX;
        let ny = ev.clientY - parentRect.top  - this._dragOffsetY;
        nx = Math.max(0, Math.min(parentRect.width  - w, nx));
        ny = Math.max(0, Math.min(parentRect.height - h, ny));
        this.wrap.style.left = `${nx}px`;
        this.wrap.style.top  = `${ny}px`;
      }
    };

    const onUp = () => {
      this._dragMode = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend',  onUp);
    };

    this._onMove = onMove;
    this._onUp   = onUp;

    this.svg.addEventListener('mousedown',  onDown);
    this.svg.addEventListener('touchstart', onDown, { passive: false });
  }

  _attachDocListeners() {
    document.addEventListener('mousemove', this._onMove);
    document.addEventListener('mouseup',   this._onUp);
    document.addEventListener('touchmove', this._onMove, { passive: false });
    document.addEventListener('touchend',  this._onUp);
  }
}

// Expose globally so non-module scripts can use it
if (typeof window !== 'undefined') {
  window.SignalGenerator = SignalGenerator;
}
