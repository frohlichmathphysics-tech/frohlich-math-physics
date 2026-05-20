/**
 * Ruler — reusable meter-stick measurement-tool module
 *
 * Mr. Frohlich Math and Physics
 * Canonical archive: /_shared/measurement-tools/ruler-v2/ruler.js
 *
 * v2 — adds orientation flag (Applet_Creation v7 §7.7 sibling pattern).
 *
 * Visual: wood-toned ruler with tick marks on its reading edge.
 *   - Major ticks every 10 cm, with numerals 0, 10, 20, ..., 100
 *   - Mid ticks every 1 cm, no numerals
 *   - Minor ticks every 0.5 cm
 *
 * Orientation flag (NEW v2):
 *   orientation: "horizontal"  (default — backward-compatible)
 *     reading edge = BOTTOM edge of the body; ticks rise upward.
 *   orientation: "vertical"
 *     reading edge = RIGHT edge of the body; ticks extend leftward.
 *     0 at top, 100 at bottom (matches screen y-axis).
 *     Numerals upright (readable straight on); brand label rotated
 *     90° CW along the left edge, reading top-to-bottom.
 *
 * No digital readout — student reads positions by eye. This is the
 * §3.1 tool-resolution + §3.2 alignment-uncertainty pedagogy.
 *
 * Drag: anywhere on the body. Bounded to parent container.
 *       No rotation handle in v2 — orientation is a constructor flag,
 *       not user-toggleable at runtime (per §7.7 lock).
 *
 * Scale: pixelsPerMeter is configured by the scene. The scene and the
 *        ruler MUST agree on this scale, or measurements will not match
 *        the physical setup the scene is simulating.
 *
 * Self-contained: this module injects its own CSS on first load. Hosts
 * need only load this JS file — no companion stylesheet required.
 *
 * Usage:
 *   // Horizontal (default — backward-compatible with v1 callers)
 *   new Ruler({
 *     container: document.getElementById('frame'),
 *     x: 60, y: 80,
 *     pixelsPerMeter: 600,
 *     lengthMeters: 1.0,
 *     thicknessPx: 36
 *   });
 *
 *   // Vertical (new in v2 — opt-in)
 *   new Ruler({
 *     container: document.getElementById('frame'),
 *     x: 800, y: 40,
 *     orientation: 'vertical',
 *     pixelsPerMeter: 600,
 *     lengthMeters: 1.0,
 *     thicknessPx: 36
 *   });
 */

// ── Embedded styles (was styles.css) ─────────────────────────────────────
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

/* Body — pale wood / yellow-tan */
.rl-body {
  fill: #e8c878;
  stroke: #8a6a2a;
  stroke-width: 1;
}

/* Faint grain lines parallel to the long edges */
.rl-grain {
  stroke: #c9a558;
  stroke-width: 0.5;
  opacity: 0.6;
}

/* Ticks */
.rl-tick-major {
  stroke: #1a1a1a;
  stroke-width: 1.4;
}
.rl-tick-half {
  stroke: #1a1a1a;
  stroke-width: 1.2;
}
.rl-tick-mid {
  stroke: #1a1a1a;
  stroke-width: 1;
}
.rl-tick-minor {
  stroke: #1a1a1a;
  stroke-width: 0.7;
}

/* Numerals at each 10 cm */
.rl-numeral {
  fill: #1a1a1a;
  font: 600 11px sans-serif;
}

/* Subtle brand label inside the body */
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
    // NEW v2: orientation flag. Defaults to "horizontal" (backward-compatible).
    this.orientation     = options.orientation ?? 'horizontal';
    this.pixelsPerMeter  = options.pixelsPerMeter ?? 600;
    this.lengthMeters    = options.lengthMeters ?? 1.0;
    this.thicknessPx     = options.thicknessPx ?? 36;

    // Long-axis length in pixels. In horizontal mode this is the SVG width;
    // in vertical mode it is the SVG height.
    this.lengthPx = this.lengthMeters * this.pixelsPerMeter;
    // Retained for backward compatibility with any v1 callers that read .widthPx.
    this.widthPx = this.lengthPx;

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

    // SVG canvas dimensions — long axis vs thickness, swapped by orientation.
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

    // Body — wood-toned rectangle filling the SVG canvas
    const body = document.createElementNS(NS, 'rect');
    body.setAttribute('class', 'rl-body');
    body.setAttribute('x', 0); body.setAttribute('y', 0);
    body.setAttribute('width', svgWidth);
    body.setAttribute('height', svgHeight);
    svg.appendChild(body);

    // Faint grain — two thin darker lines parallel to the long edges
    for (const off of [4, T - 4]) {
      const grain = document.createElementNS(NS, 'line');
      grain.setAttribute('class', 'rl-grain');
      if (isVertical) {
        // Vertical grain lines at x=4 and x=T-4, running from near top to near bottom
        grain.setAttribute('x1', off); grain.setAttribute('y1', 2);
        grain.setAttribute('x2', off); grain.setAttribute('y2', L - 2);
      } else {
        // Horizontal grain lines at y=4 and y=T-4, running from near left to near right
        grain.setAttribute('x1', 2);     grain.setAttribute('y1', off);
        grain.setAttribute('x2', L - 2); grain.setAttribute('y2', off);
      }
      svg.appendChild(grain);
    }

    // Ticks (every 0.5 cm = 0.005 m)
    //   Horizontal: reading edge is the BOTTOM (y = T). Ticks rise UP into the body.
    //   Vertical:   reading edge is the RIGHT  (x = T). Ticks extend LEFT into the body.
    //
    // Vertical uses slightly shorter tick lengths than horizontal so the upright
    // numerals fit comfortably inside the body (3-digit "100" must fit in the
    // body thickness minus the major-tick length and a 4 px gap).
    const cmPerMeter = 100;
    const totalCm = this.lengthMeters * cmPerMeter;
    const pxPerCm = this.pixelsPerMeter / 100;

    const tickGroup = document.createElementNS(NS, 'g');
    tickGroup.setAttribute('class', 'rl-ticks');

    for (let halfCm = 0; halfCm <= totalCm * 2; halfCm++) {
      const cm = halfCm / 2;
      const alongPx = cm * pxPerCm;

      let cls, tickLen;
      if (halfCm % 20 === 0) {           // every 10 cm — major
        cls = 'rl-tick-major';
        tickLen = isVertical ? 12 : 14;
      } else if (halfCm % 10 === 0) {    // every 5 cm (not 10) — half
        cls = 'rl-tick-half';
        tickLen = isVertical ? 10 : 12;
      } else if (halfCm % 2 === 0) {     // every 1 cm — mid
        cls = 'rl-tick-mid';
        tickLen = isVertical ? 7 : 9;
      } else {                           // every 0.5 cm — minor
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

      // Major numerals (at every 10 cm)
      if (halfCm % 20 === 0) {
        const lbl = document.createElementNS(NS, 'text');
        lbl.setAttribute('class', 'rl-numeral');
        lbl.textContent = cm;

        if (isVertical) {
          // Upright numerals to the LEFT of the tick, inside the body.
          // Right-aligned so the rightmost glyph sits 4 px left of the tick start.
          lbl.setAttribute('x', T - tickLen - 4);
          lbl.setAttribute('y', alongPx);
          lbl.setAttribute('text-anchor', 'end');

          if (cm === 0) {
            // Top endpoint — nudge down 1 px so glyph doesn't clip the top edge.
            lbl.setAttribute('y', alongPx + 1);
            lbl.style.dominantBaseline = 'hanging';
          } else if (cm === totalCm) {
            // Bottom endpoint — nudge up 1 px so glyph doesn't clip the bottom edge.
            lbl.setAttribute('y', alongPx - 1);
            lbl.style.dominantBaseline = 'alphabetic';
          } else {
            // Mid-numerals: visually centered on the tick row.
            lbl.style.dominantBaseline = 'middle';
          }
        } else {
          // Horizontal numerals: above the tick, inside the body.
          lbl.setAttribute('x', alongPx);
          lbl.setAttribute('y', T - tickLen - 4);
          if (cm === 0) {
            lbl.setAttribute('text-anchor', 'start');
            lbl.setAttribute('x', alongPx + 2);
          } else if (cm === totalCm) {
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

    // Tiny brand label, centered, very subtle.
    //   Horizontal: top of body, centered along the length.
    //   Vertical: hugging the LEFT edge, rotated 90° CW so it reads top-to-bottom.
    const brand = document.createElementNS(NS, 'text');
    brand.setAttribute('class', 'rl-brand');
    brand.textContent = 'Mr. Frohlich Math and Physics';
    if (isVertical) {
      brand.setAttribute('x', 11);
      brand.setAttribute('y', L / 2);
      brand.setAttribute('text-anchor', 'middle');
      // rotate(90) in SVG is visually CW; text reads top-to-bottom.
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

  // ── Drag handling ─────────────────────────────────────────────────────

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

      // Allow the ruler to extend beyond the frame on any side, but keep at
      // least this much visible so it stays grabbable. The constraint that
      // matters most is along the LONG axis (where the user is most likely
      // to drag the ruler off-screen).
      //   Horizontal: long axis is X → keep 40 px visible horizontally,
      //                                  20 px vertically.
      //   Vertical:   long axis is Y → swap: 20 px horizontally, 40 px vertically.
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
