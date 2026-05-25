/**
 * Ruler (transparent variant) — reusable meter-stick measurement-tool module
 *
 * Mr. Frohlich Math and Physics
 * Canonical archive: /_shared/measurement-tools/ruler-v4-transparent/ruler.js
 *
 * PAIR: This file is the transparent-plastic skin of the v4 rotating ruler.
 *       Its sibling, /_shared/measurement-tools/ruler-v4/ruler.js, is the
 *       wooden skin. Both files expose IDENTICAL public APIs — same
 *       constructor signature, same parameters, same window.Ruler global.
 *       Each applet vendors EXACTLY ONE of them as its local ruler.js;
 *       the choice is purely cosmetic, not behavioral.
 *
 *       Differences from wooden v4 (this file):
 *         - Body: faint frosted-white fill with dark gray edge stroke
 *           instead of wood color
 *         - No grain lines
 *         - Pivot dots: dark metallic instead of brass screws
 *         - Brand label: dark gray instead of warm brown
 *         - Drop-shadow: lighter (transparent objects cast less shadow)
 *
 *       Everything else — geometry, hit zones, rotation math, cursor
 *       handling, snap behavior, range/tickScale, backward compat —
 *       is line-for-line identical to wooden v4.
 *
 * v4 — adds optional free-angle rotation (rotatable flag).
 *      Body-translate / ends-rotate hybrid: middle of body translates;
 *      each end zone rotates around the opposite end.
 *
 *      v4 UX revision (carried over from wooden):
 *        - Visible pivot dots at each end of the body (dark metallic here)
 *        - Custom rotation cursor (curved-arrow SVG) on end zones
 *        - Cursor stays mode-specific during drag (move vs. rotation arrow)
 *
 * v3 (prior) — added range + tickScale ('cm' | 'mm') constructor params.
 * v2 (prior) — added orientation flag ('horizontal' | 'vertical').
 * v1 (prior) — original horizontal-only meter stick.
 *
 * ── PARAMS (identical to wooden v4) ──────────────────────────────────────
 *
 *   rotatable: boolean (default false)
 *     If true, body becomes a rigid rotating-arm:
 *       - middle zone (~80% of length) → drag to translate
 *       - end zone (each ~50 px)       → drag to rotate around OPPOSITE end
 *     When false, behavior is byte-identical to v3.
 *
 *   initialRotationDeg: number (default 0)
 *     Starting angle in degrees. Positive = clockwise on screen.
 *     Set to 90 to produce v2's "vertical" orientation. Only effective
 *     when rotatable: true.
 *
 *   snapDeg: number | null (default 15)
 *     Hold Shift during a rotation drag → snap to multiples of snapDeg.
 *     Set to null (or 0) to disable snap.
 *
 *   container, x, y, orientation, pixelsPerMeter, thicknessPx,
 *   lengthMeters, range, tickScale: all identical to wooden v4 / v3.
 *
 * ── INTERACTION (rotatable: true) ────────────────────────────────────────
 *
 *   - MIDDLE zone → cursor: move (4-directional arrow). Drag to translate.
 *   - END zones   → cursor: curved-arrow (rotation). Drag to rotate around
 *                   the OPPOSITE end.
 *   - Hold Shift during rotation drag → snap to multiples of snapDeg.
 *   - During an active drag, the cursor is locked to its mode-specific
 *     form on the entire page until mouseup.
 *
 *   A small visible dark metallic pivot dot sits at the top of each end
 *   zone as a discoverability cue. The dot is decorative; the entire
 *   ~50 px end region is the rotation hit area.
 *
 * ── BACKWARD COMPATIBILITY ───────────────────────────────────────────────
 *
 *   Default rotatable: false → output is byte-identical to v3-transparent
 *   (or to v3 wooden with the visual skin swapped). Existing callers in
 *   any applet work unchanged when swapping ruler.js files.
 */

// ── Rotation cursor (identical to wooden v4) ─────────────────────────────
const ROTATE_CURSOR_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><g fill='none' stroke-linecap='round' stroke-linejoin='round'><path d='M 12 4 A 8 8 0 1 1 4 12' stroke='white' stroke-width='4'/><polyline points='1 9, 4 12, 7 9' stroke='white' stroke-width='4'/><path d='M 12 4 A 8 8 0 1 1 4 12' stroke='black' stroke-width='1.5'/><polyline points='1 9, 4 12, 7 9' stroke='black' stroke-width='1.5'/></g></svg>`;
const ROTATE_CURSOR = `url("data:image/svg+xml;utf8,${ROTATE_CURSOR_SVG}") 12 12, grab`;

// ── Embedded styles (TRANSPARENT skin) ───────────────────────────────────
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
  /* Lighter shadow than wooden — transparent objects cast less */
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25));
}

/* Non-rotatable mode: whole body grabs */
.rl-svg.rl-svg-static { cursor: grab; }
.rl-svg.rl-svg-static:active { cursor: grabbing; }

/* Rotatable mode: per-zone cursors */
.rl-zone-end    { fill: transparent; cursor: ${ROTATE_CURSOR}; }
.rl-zone-middle { fill: transparent; cursor: move; }

/* During an active drag, lock cursor across the whole page */
body.rl-cursor-translate,
body.rl-cursor-translate * { cursor: move !important; }
body.rl-cursor-rotate,
body.rl-cursor-rotate *    { cursor: ${ROTATE_CURSOR} !important; }

/* TRANSPARENT body: faint frosted-white fill, dark gray edge */
.rl-body {
  fill: rgba(255, 255, 255, 0.45);
  stroke: #4a4a4a;
  stroke-width: 1.2;
}

/* Ticks: black, same as wooden — high contrast on any background */
.rl-tick-major { stroke: #1a1a1a; stroke-width: 1.4; }
.rl-tick-half  { stroke: #1a1a1a; stroke-width: 1.2; }
.rl-tick-mid   { stroke: #1a1a1a; stroke-width: 1;   }
.rl-tick-minor { stroke: #1a1a1a; stroke-width: 0.7; }

/* Numerals: black, same as wooden */
.rl-numeral {
  fill: #1a1a1a;
  font: 600 11px sans-serif;
}

/* Brand: dark gray (was warm brown on wooden) */
.rl-brand {
  fill: #2a2a2a;
  font: italic 7px sans-serif;
  letter-spacing: 0.5px;
  opacity: 0.55;
}
`;

(function injectRulerStyles() {
  if (typeof document === 'undefined') return;
  // Remove any prior version so cursor-URL updates re-take effect on reload
  const prior = document.getElementById('frohlich-ruler-styles');
  if (prior) prior.parentNode.removeChild(prior);
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

    // v3: tickScale
    this.tickScale = options.tickScale ?? 'cm';
    if (this.tickScale !== 'cm' && this.tickScale !== 'mm') {
      console.warn(`Ruler v4-transparent: unknown tickScale "${this.tickScale}", falling back to 'cm'.`);
      this.tickScale = 'cm';
    }

    // v3: range
    const lengthMetersIn = options.lengthMeters ?? 1.0;
    this.range = options.range ?? { min: 0, max: lengthMetersIn };
    this.lengthMeters = this.range.max - this.range.min;
    this.lengthPx = this.lengthMeters * this.pixelsPerMeter;
    this.widthPx  = this.lengthPx;

    this._unitMeters     = (this.tickScale === 'mm') ? 0.001 : 0.01;
    this._halfUnitMeters = this._unitMeters / 2;

    // v3: minor tick density floor
    this._minorSpacingPx = this._halfUnitMeters * this.pixelsPerMeter;
    this._skipMinor = this._minorSpacingPx < 2;
    if (this._skipMinor) {
      console.warn(
        `Ruler v4-transparent: minor ticks omitted (spacing ${this._minorSpacingPx.toFixed(2)} px ` +
        `below 2 px floor). orientation=${this.orientation}, tickScale=${this.tickScale}, ` +
        `pixelsPerMeter=${this.pixelsPerMeter}, range=[${this.range.min}, ${this.range.max}].`
      );
    }

    // v4: rotation
    this.rotatable          = options.rotatable ?? false;
    this.initialRotationDeg = options.initialRotationDeg ?? 0;
    this.snapDeg            = options.snapDeg ?? 15;
    this._rotationDeg       = this.initialRotationDeg;

    if (this.rotatable && this.orientation === 'vertical') {
      console.warn(
        'Ruler v4-transparent: orientation: "vertical" is ignored when rotatable: true. ' +
        'Use initialRotationDeg: 90 (or -90) instead. Forcing orientation: "horizontal".'
      );
      this.orientation = 'horizontal';
    }

    this._isDragging  = false;
    this._dragMode    = null;
    this._dragOffsetX = 0;
    this._dragOffsetY = 0;
    this._pivotX      = 0;
    this._pivotY      = 0;

    this._buildDOM();
    this._attachEvents();
  }

  // ── DOM construction ──────────────────────────────────────────────────

  _buildDOM() {
    const NS = 'http://www.w3.org/2000/svg';
    const isVertical    = this.orientation === 'vertical';
    const isRotatable   = this.rotatable;
    const drawnVertical = isVertical && !isRotatable;

    const L = this.lengthPx;
    const T = this.thicknessPx;

    const svgWidth  = drawnVertical ? T : L;
    const svgHeight = drawnVertical ? L : T;

    const wrap = document.createElement('div');
    wrap.className = 'rl-wrap';
    wrap.style.left  = `${this.x}px`;
    wrap.style.top   = `${this.y}px`;
    wrap.style.width = `${svgWidth}px`;
    if (isRotatable) {
      wrap.style.transformOrigin = `0px ${T}px`;
      wrap.style.transform = `rotate(${this._rotationDeg}deg)`;
    }
    this.wrap = wrap;

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', isRotatable ? 'rl-svg' : 'rl-svg rl-svg-static');
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

    // TRANSPARENT: no grain lines (wood-specific element omitted)

    // Ticks
    const halfUnitPx       = this._halfUnitMeters * this.pixelsPerMeter;
    const totalHalfUnits   = Math.round(this.lengthMeters / this._halfUnitMeters);
    const startHalfUnitIdx = Math.round(this.range.min / this._halfUnitMeters);

    const tickGroup = document.createElementNS(NS, 'g');
    tickGroup.setAttribute('class', 'rl-ticks');

    for (let i = 0; i <= totalHalfUnits; i++) {
      const alongPx      = i * halfUnitPx;
      const absHalfUnits = i + startHalfUnitIdx;

      let cls, tickLen;
      if (absHalfUnits % 20 === 0) {
        cls = 'rl-tick-major';
        tickLen = drawnVertical ? 12 : 14;
      } else if (absHalfUnits % 10 === 0) {
        cls = 'rl-tick-half';
        tickLen = drawnVertical ? 10 : 12;
      } else if (absHalfUnits % 2 === 0) {
        cls = 'rl-tick-mid';
        tickLen = drawnVertical ? 7 : 9;
      } else {
        if (this._skipMinor) continue;
        cls = 'rl-tick-minor';
        tickLen = drawnVertical ? 4 : 5;
      }

      const tick = document.createElementNS(NS, 'line');
      tick.setAttribute('class', cls);
      if (drawnVertical) {
        tick.setAttribute('x1', T);           tick.setAttribute('y1', alongPx);
        tick.setAttribute('x2', T - tickLen); tick.setAttribute('y2', alongPx);
      } else {
        tick.setAttribute('x1', alongPx);     tick.setAttribute('y1', T);
        tick.setAttribute('x2', alongPx);     tick.setAttribute('y2', T - tickLen);
      }
      tickGroup.appendChild(tick);

      if (absHalfUnits % 20 === 0) {
        const unitValue = absHalfUnits / 2;
        const isStartEdge = (i === 0);
        const isEndEdge   = (i === totalHalfUnits);

        const lbl = document.createElementNS(NS, 'text');
        lbl.setAttribute('class', 'rl-numeral');
        lbl.textContent = unitValue;

        if (drawnVertical) {
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
    if (drawnVertical) {
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

    // v4: visible pivot dots + invisible hit zones (rotatable only)
    if (isRotatable) {
      const endZoneSize = Math.min(50, Math.max(20, Math.floor(L * 0.10)));
      this._endZoneSize = endZoneSize;

      // TRANSPARENT pivot dots: dark metallic (instead of brass screws).
      // Same placement and size as wooden — top strip of body, above
      // labels and brand to avoid collision with "0" / end numerals.
      const pivotY = 7;
      const makePivot = (cx) => {
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'rl-pivot');
        const outer = document.createElementNS(NS, 'circle');
        outer.setAttribute('cx', cx);
        outer.setAttribute('cy', pivotY);
        outer.setAttribute('r', 3.5);
        outer.setAttribute('fill', '#3a3a3a');
        outer.setAttribute('stroke', '#1a1a1a');
        outer.setAttribute('stroke-width', '0.7');
        g.appendChild(outer);
        // Inner dot (instead of wooden's screw slot)
        const inner = document.createElementNS(NS, 'circle');
        inner.setAttribute('cx', cx);
        inner.setAttribute('cy', pivotY);
        inner.setAttribute('r', 1.2);
        inner.setAttribute('fill', '#0a0a0a');
        g.appendChild(inner);
        return g;
      };
      svg.appendChild(makePivot(8));
      svg.appendChild(makePivot(L - 8));

      // Hit zones — invisible rects, appended LAST so they're on top of
      // pivot dots in painter's order and receive pointer events first.
      const zoneA = document.createElementNS(NS, 'rect');
      zoneA.setAttribute('class', 'rl-zone-end rl-zone-A');
      zoneA.setAttribute('x', 0);
      zoneA.setAttribute('y', 0);
      zoneA.setAttribute('width', endZoneSize);
      zoneA.setAttribute('height', T);
      svg.appendChild(zoneA);
      this._zoneA = zoneA;

      const zoneMid = document.createElementNS(NS, 'rect');
      zoneMid.setAttribute('class', 'rl-zone-middle');
      zoneMid.setAttribute('x', endZoneSize);
      zoneMid.setAttribute('y', 0);
      zoneMid.setAttribute('width', L - 2 * endZoneSize);
      zoneMid.setAttribute('height', T);
      svg.appendChild(zoneMid);
      this._zoneMid = zoneMid;

      const zoneB = document.createElementNS(NS, 'rect');
      zoneB.setAttribute('class', 'rl-zone-end rl-zone-B');
      zoneB.setAttribute('x', L - endZoneSize);
      zoneB.setAttribute('y', 0);
      zoneB.setAttribute('width', endZoneSize);
      zoneB.setAttribute('height', T);
      svg.appendChild(zoneB);
      this._zoneB = zoneB;
    }

    wrap.appendChild(svg);
    this.container.appendChild(wrap);
  }

  // ── Event handling (identical to wooden v4) ──────────────────────────

  _attachEvents() {
    if (this.rotatable) {
      this._attachRotatableEvents();
    } else {
      this._attachStaticEvents();
    }
  }

  _attachStaticEvents() {
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

  _attachRotatableEvents() {
    const T = this.thicknessPx;
    const L = this.lengthPx;

    const makeOnDown = mode => e => {
      e.preventDefault();
      e.stopPropagation();
      const ev = (e.touches && e.touches[0]) || e;
      const parentRect = this.container.getBoundingClientRect();
      const cursorX = ev.clientX - parentRect.left;
      const cursorY = ev.clientY - parentRect.top;

      this._isDragging = true;
      this._dragMode = mode;

      if (mode === 'translate') {
        document.body.classList.add('rl-cursor-translate');
      } else {
        document.body.classList.add('rl-cursor-rotate');
      }

      const wrapLeft = parseFloat(this.wrap.style.left) || 0;
      const wrapTop  = parseFloat(this.wrap.style.top)  || 0;
      const θ_rad    = this._rotationDeg * Math.PI / 180;

      const Ax = wrapLeft;
      const Ay = wrapTop + T;
      const Bx = Ax + L * Math.cos(θ_rad);
      const By = Ay + L * Math.sin(θ_rad);

      if (mode === 'translate') {
        this._dragOffsetX = cursorX - wrapLeft;
        this._dragOffsetY = cursorY - wrapTop;
      } else if (mode === 'rotate-A') {
        this._pivotX = Bx;
        this._pivotY = By;
      } else if (mode === 'rotate-B') {
        this._pivotX = Ax;
        this._pivotY = Ay;
      }

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
      const cursorX = ev.clientX - parentRect.left;
      const cursorY = ev.clientY - parentRect.top;
      const shiftHeld = !!e.shiftKey;

      if (this._dragMode === 'translate') {
        const newWrapLeft = cursorX - this._dragOffsetX;
        const newWrapTop  = cursorY - this._dragOffsetY;
        this.wrap.style.left = `${newWrapLeft}px`;
        this.wrap.style.top  = `${newWrapTop}px`;

      } else if (this._dragMode === 'rotate-A') {
        const Bx = this._pivotX, By = this._pivotY;
        let newθ_rad = Math.atan2(By - cursorY, Bx - cursorX);

        if (shiftHeld && this.snapDeg && this.snapDeg > 0) {
          const newθ_deg = newθ_rad * 180 / Math.PI;
          const snapped  = Math.round(newθ_deg / this.snapDeg) * this.snapDeg;
          newθ_rad = snapped * Math.PI / 180;
        }

        const newAx = Bx - L * Math.cos(newθ_rad);
        const newAy = By - L * Math.sin(newθ_rad);
        this.wrap.style.left = `${newAx}px`;
        this.wrap.style.top  = `${newAy - T}px`;
        this._rotationDeg = newθ_rad * 180 / Math.PI;
        this.wrap.style.transform = `rotate(${this._rotationDeg}deg)`;

      } else if (this._dragMode === 'rotate-B') {
        const Ax = this._pivotX, Ay = this._pivotY;
        let newθ_rad = Math.atan2(cursorY - Ay, cursorX - Ax);

        if (shiftHeld && this.snapDeg && this.snapDeg > 0) {
          const newθ_deg = newθ_rad * 180 / Math.PI;
          const snapped  = Math.round(newθ_deg / this.snapDeg) * this.snapDeg;
          newθ_rad = snapped * Math.PI / 180;
        }

        this._rotationDeg = newθ_rad * 180 / Math.PI;
        this.wrap.style.transform = `rotate(${this._rotationDeg}deg)`;
      }
    };

    const onUp = () => {
      this._isDragging = false;
      this._dragMode = null;
      document.body.classList.remove('rl-cursor-translate', 'rl-cursor-rotate');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend',  onUp);
    };

    const downA   = makeOnDown('rotate-A');
    const downB   = makeOnDown('rotate-B');
    const downMid = makeOnDown('translate');

    this._zoneA.addEventListener('mousedown',  downA);
    this._zoneA.addEventListener('touchstart', downA, { passive: false });
    this._zoneB.addEventListener('mousedown',  downB);
    this._zoneB.addEventListener('touchstart', downB, { passive: false });
    this._zoneMid.addEventListener('mousedown',  downMid);
    this._zoneMid.addEventListener('touchstart', downMid, { passive: false });
  }
}

// Expose globally — identical to wooden v4 so applets can swap files
if (typeof window !== 'undefined') {
  window.Ruler = Ruler;
}
