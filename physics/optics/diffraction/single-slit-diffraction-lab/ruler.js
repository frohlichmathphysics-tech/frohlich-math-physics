/**
 * Ruler — reusable meter-stick measurement-tool module
 *
 * Mr. Frohlich Math and Physics
 * Canonical archive: /_shared/measurement-tools/ruler-v3/ruler.js
 *
 * v3 — adds `range` (start/end in meters) and `tickScale` ('cm' | 'mm')
 *      constructor params. With neither supplied, behaves identical to v2.
 *
 * v2 (prior) — added orientation flag (horizontal | vertical).
 * v1 (prior) — original horizontal-only meter stick.
 *
 * NEW v3 PARAMS (both optional, both default to v2 behavior):
 *   range: { min, max }   in meters. Defines the numeric span the ruler covers
 *                         end-to-end. If omitted, derived from lengthMeters as
 *                         { min: 0, max: lengthMeters }. If supplied, the value
 *                         of lengthMeters is ignored (recomputed as max-min).
 *   tickScale: 'cm'       (DEFAULT — matches v2 exactly)
 *                         major every 10 cm + numeral, half every 5 cm,
 *                         mid every 1 cm, minor every 0.5 cm. Numerals in cm.
 *   tickScale: 'mm'       major every 10 mm + numeral, half every 5 mm,
 *                         mid every 1 mm, minor every 0.5 mm. Numerals in mm.
 *
 * Numerals: bare integers, no unit suffix (matches v2). Student infers the
 * unit from tick density, exactly as with a physical ruler.
 *
 * Numerals at major ticks are computed from absolute position, so a ruler
 * with range { min: 0.5, max: 1.5 } at 'cm' tickScale will label
 * 50, 60, ..., 150. Caller is responsible for choosing a range.min aligned
 * to the major-tick grid; an off-grid range.min produces shifted (but
 * mathematically correct) labels.
 *
 * Tick-density safety floor (v3): if minor-tier spacing on screen would be
 * below 2 px, minor ticks are silently omitted and a console.warn fires
 * once per instance. v2 had no such guard.
 *
 * Vertical x mm caveat: numerals must fit in body thickness minus tick
 * length minus 4 px gap. At thicknessPx=36 this admits up to 3-digit
 * numerals ("300"). For >3-digit values (e.g., a 1 m vertical-mm ruler
 * labeled to "1000"), increase thicknessPx or use horizontal orientation.
 *
 * Backward compatibility: existing v1/v2 callers passing no new params get
 * identical behavior. Shipped wave-series applets vendor ruler v2 locally
 * per Applet_Creation §7.8 and need no migration.
 *
 * Self-contained: this module injects its own CSS on first load. Hosts need
 * only load this JS file — no companion stylesheet required.
 *
 * Usage:
 *   // 1. v2-mode (no new params — identical behavior to ruler-v2)
 *   new Ruler({
 *     container: document.getElementById('frame'),
 *     x: 60, y: 80,
 *     pixelsPerMeter: 600,
 *     lengthMeters: 1.0,
 *     thicknessPx: 36
 *   });
 *
 *   // 2. Long-range cm ruler (e.g. side-view of a 3 m optical bench)
 *   new Ruler({
 *     container: document.getElementById('frame'),
 *     x: 60, y: 80,
 *     pixelsPerMeter: 240,
 *     range: { min: 0, max: 3.0 },
 *     tickScale: 'cm',
 *     thicknessPx: 36
 *   });
 *
 *   // 3. Fine-resolution mm ruler (e.g. diffraction pattern screen)
 *   new Ruler({
 *     container: document.getElementById('frame'),
 *     x: 60, y: 80,
 *     pixelsPerMeter: 2400,
 *     range: { min: 0, max: 0.3 },
 *     tickScale: 'mm',
 *     thicknessPx: 36
 *   });
 */

// ── Embedded styles (identical to v2) ────────────────────────────────────
const RULER_STYLES = `
.rl-wrap {
  position: absolute;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.rl-svg {
  display: block;
  cursor: grab;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.45));
}
.rl-svg:active { cursor: grabbing; }

.rl-body {
  fill: #e8c878;
  stroke: #8a6a2a;
  stroke-width: 1;
}

.rl-grain {
  stroke: #c9a558;
  stroke-width: 0.5;
  opacity: 0.6;
}

.rl-tick-major { stroke: #1a1a1a; stroke-width: 1.4; }
.rl-tick-half  { stroke: #1a1a1a; stroke-width: 1.2; }
.rl-tick-mid   { stroke: #1a1a1a; stroke-width: 1;   }
.rl-tick-minor { stroke: #1a1a1a; stroke-width: 0.7; }

.rl-numeral {
  fill: #1a1a1a;
  font: 600 11px sans-serif;
}

.rl-brand {
  fill: #8a6a2a;
  font: italic 7px sans-serif;
  letter-spacing: 0.5px;
  opacity: 0.55;
}
`;

// Inject styles once per page, on first load of this module.
(function injectRulerStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('frohlich-ruler-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'frohlich-ruler-styles';
  styleEl.textContent = RULER_STYLES;
  document.head.appendChild(styleEl);
})();

// ── Class ────────────────────────────────────────────────────────────────
class Ruler {
  constructor(options) {
    this.container       = options.container;
    this.x               = options.x ?? 20;
    this.y               = options.y ?? 20;
    this.orientation     = options.orientation ?? 'horizontal';
    this.pixelsPerMeter  = options.pixelsPerMeter ?? 600;
    this.thicknessPx     = options.thicknessPx ?? 36;

    // v3: tickScale defaults to 'cm' (backward-compat with v2).
    this.tickScale = options.tickScale ?? 'cm';
    if (this.tickScale !== 'cm' && this.tickScale !== 'mm') {
      console.warn(
        `Ruler v3: unknown tickScale "${this.tickScale}", ` +
        `falling back to 'cm'.`
      );
      this.tickScale = 'cm';
    }

    // v3: range defaults from lengthMeters if absent (backward-compat with v2).
    // If both supplied, range wins; lengthMeters is recomputed as max - min.
    const lengthMetersIn = options.lengthMeters ?? 1.0;
    this.range = options.range ?? { min: 0, max: lengthMetersIn };
    this.lengthMeters = this.range.max - this.range.min;

    this.lengthPx = this.lengthMeters * this.pixelsPerMeter;
    this.widthPx  = this.lengthPx;   // backward compat — v1/v2 may read .widthPx

    // v3: smallest tick spacing.
    //   'cm': unit = 0.01 m,  halfUnit = 0.005 m  (minor every 0.5 cm)
    //   'mm': unit = 0.001 m, halfUnit = 0.0005 m (minor every 0.5 mm)
    this._unitMeters     = (this.tickScale === 'mm') ? 0.001 : 0.01;
    this._halfUnitMeters = this._unitMeters / 2;

    // v3 (D4): tick-density safety floor.
    // If the minor-tier spacing on screen would be < 2 px, drop the tier.
    this._minorSpacingPx = this._halfUnitMeters * this.pixelsPerMeter;
    this._skipMinor = this._minorSpacingPx < 2;
    if (this._skipMinor) {
      console.warn(
        `Ruler v3: minor ticks omitted (spacing ` +
        `${this._minorSpacingPx.toFixed(2)} px below 2 px floor). ` +
        `orientation=${this.orientation}, tickScale=${this.tickScale}, ` +
        `pixelsPerMeter=${this.pixelsPerMeter}, ` +
        `range=[${this.range.min}, ${this.range.max}].`
      );
    }

    this._isDragging = false;
    this._dragOffsetX = 0;
    this._dragOffsetY = 0;

    this._buildDOM();
    this._attachEvents();
  }

  // ── DOM construction ──────────────────────────────────────────────────

  _buildDOM() {
    const NS = 'http://www.w3.org/2000/svg';
    const isVertical = this.orientation === 'vertical';

    const L = this.lengthPx;        // long-axis length
    const T = this.thicknessPx;     // thickness across the body

    const svgWidth  = isVertical ? T : L;
    const svgHeight = isVertical ? L : T;

    const wrap = document.createElement('div');
    wrap.className = 'rl-wrap';
    wrap.style.left  = `${this.x}px`;
    wrap.style.top   = `${this.y}px`;
    wrap.style.width = `${svgWidth}px`;
    this.wrap = wrap;

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'rl-svg');
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute('width',  svgWidth);
    svg.setAttribute('height', svgHeight);
    this.svg = svg;

    // Body
    const body = document.createElementNS(NS, 'rect');
    body.setAttribute('class', 'rl-body');
    body.setAttribute('x', 0); body.setAttribute('y', 0);
    body.setAttribute('width', svgWidth);
    body.setAttribute('height', svgHeight);
    svg.appendChild(body);

    // Grain (two thin darker lines parallel to long edges)
    for (const off of [4, T - 4]) {
      const grain = document.createElementNS(NS, 'line');
      grain.setAttribute('class', 'rl-grain');
      if (isVertical) {
        grain.setAttribute('x1', off); grain.setAttribute('y1', 2);
        grain.setAttribute('x2', off); grain.setAttribute('y2', L - 2);
      } else {
        grain.setAttribute('x1', 2);     grain.setAttribute('y1', off);
        grain.setAttribute('x2', L - 2); grain.setAttribute('y2', off);
      }
      svg.appendChild(grain);
    }

    // Ticks
    //
    // Iterate half-unit steps from i=0 to i=totalHalfUnits.
    // Tier is determined by absHalfUnits (= i + startHalfUnitIdx) modulo:
    //   % 20 === 0 → major (every 10 units)
    //   % 10 === 0 → half  (every 5 units, not major)
    //   % 2  === 0 → mid   (every 1 unit)
    //   else        → minor (every 0.5 unit)
    //
    // For range.min=0 (the common case), startHalfUnitIdx=0 and the modulo
    // checks reduce to i%20, i%10, i%2 — identical to v2.
    const halfUnitPx       = this._halfUnitMeters * this.pixelsPerMeter;
    const totalHalfUnits   = Math.round(this.lengthMeters / this._halfUnitMeters);
    const startHalfUnitIdx = Math.round(this.range.min / this._halfUnitMeters);

    const tickGroup = document.createElementNS(NS, 'g');
    tickGroup.setAttribute('class', 'rl-ticks');

    for (let i = 0; i <= totalHalfUnits; i++) {
      const alongPx = i * halfUnitPx;
      const absHalfUnits = i + startHalfUnitIdx;

      let cls, tickLen;
      if (absHalfUnits % 20 === 0) {           // major
        cls = 'rl-tick-major';
        tickLen = isVertical ? 12 : 14;
      } else if (absHalfUnits % 10 === 0) {    // half (every 5 units)
        cls = 'rl-tick-half';
        tickLen = isVertical ? 10 : 12;
      } else if (absHalfUnits % 2 === 0) {     // mid (every 1 unit)
        cls = 'rl-tick-mid';
        tickLen = isVertical ? 7 : 9;
      } else {                                  // minor (every 0.5 unit)
        if (this._skipMinor) continue;         // v3 D4: density floor
        cls = 'rl-tick-minor';
        tickLen = isVertical ? 4 : 5;
      }

      const tick = document.createElementNS(NS, 'line');
      tick.setAttribute('class', cls);
      if (isVertical) {
        tick.setAttribute('x1', T);            tick.setAttribute('y1', alongPx);
        tick.setAttribute('x2', T - tickLen);  tick.setAttribute('y2', alongPx);
      } else {
        tick.setAttribute('x1', alongPx);      tick.setAttribute('y1', T);
        tick.setAttribute('x2', alongPx);      tick.setAttribute('y2', T - tickLen);
      }
      tickGroup.appendChild(tick);

      // Numeral at every major tick.
      if (absHalfUnits % 20 === 0) {
        const unitValue = absHalfUnits / 2;     // integer (always multiple of 10)
        const isStartEdge = (i === 0);
        const isEndEdge   = (i === totalHalfUnits);

        const lbl = document.createElementNS(NS, 'text');
        lbl.setAttribute('class', 'rl-numeral');
        lbl.textContent = unitValue;

        if (isVertical) {
          lbl.setAttribute('x', T - tickLen - 4);
          lbl.setAttribute('y', alongPx);
          lbl.setAttribute('text-anchor', 'end');

          if (isStartEdge) {
            lbl.setAttribute('y', alongPx + 1);
            lbl.style.dominantBaseline = 'hanging';
          } else if (isEndEdge) {
            lbl.setAttribute('y', alongPx - 1);
            lbl.style.dominantBaseline = 'alphabetic';
          } else {
            lbl.style.dominantBaseline = 'middle';
          }
        } else {
          lbl.setAttribute('x', alongPx);
          lbl.setAttribute('y', T - tickLen - 4);
          if (isStartEdge) {
            lbl.setAttribute('text-anchor', 'start');
            lbl.setAttribute('x', alongPx + 2);
          } else if (isEndEdge) {
            lbl.setAttribute('text-anchor', 'end');
            lbl.setAttribute('x', alongPx - 2);
          } else {
            lbl.setAttribute('text-anchor', 'middle');
          }
        }
        tickGroup.appendChild(lbl);
      }
    }
    svg.appendChild(tickGroup);

    // Brand label
    const brand = document.createElementNS(NS, 'text');
    brand.setAttribute('class', 'rl-brand');
    brand.textContent = 'Mr. Frohlich Math and Physics';
    if (isVertical) {
      brand.setAttribute('x', 11);
      brand.setAttribute('y', L / 2);
      brand.setAttribute('text-anchor', 'middle');
      brand.setAttribute('transform', `rotate(90 11 ${L / 2})`);
    } else {
      brand.setAttribute('x', L / 2);
      brand.setAttribute('y', 11);
      brand.setAttribute('text-anchor', 'middle');
    }
    svg.appendChild(brand);

    wrap.appendChild(svg);
    this.container.appendChild(wrap);
  }

  // ── Drag handling (identical to v2) ───────────────────────────────────

  _attachEvents() {
    const isVertical = this.orientation === 'vertical';

    const onDown = e => {
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

      const minVisibleX = Math.min(isVertical ? 20 : 40, w);
      const minVisibleY = Math.min(isVertical ? 40 : 20, h);

      let nx = ev.clientX - parentRect.left - this._dragOffsetX;
      let ny = ev.clientY - parentRect.top  - this._dragOffsetY;
      nx = Math.max(-(w - minVisibleX), Math.min(parentRect.width  - minVisibleX, nx));
      ny = Math.max(-(h - minVisibleY), Math.min(parentRect.height - minVisibleY, ny));
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
}

// Expose globally
if (typeof window !== 'undefined') {
  window.Ruler = Ruler;
}
