/**
 * Ruler — reusable horizontal meter-stick measurement-tool module
 *
 * Mr. Frohlich Math and Physics
 * Path: physics/labs/measurement-tools/ruler
 *
 * Visual: wood-toned horizontal ruler with tick marks on its bottom edge.
 *   - Major ticks every 10 cm, with numerals 0, 10, 20, ..., 100
 *   - Mid ticks every 1 cm, no numerals
 *   - Minor ticks every 0.5 cm
 *   - Reading edge: bottom edge of the ruler body
 *
 * No digital readout — student reads positions by eye. This is the
 * §3.1 tool-resolution + §3.2 alignment-uncertainty pedagogy.
 *
 * Drag: anywhere on the body. Bounded to parent container.
 *       Horizontal-only for v1 (no rotation).
 *
 * Scale: pixelsPerMeter is configured by the scene. The scene and the
 *        ruler MUST agree on this scale, or measurements will not match
 *        the physical setup the scene is simulating.
 *
 * Usage:
 *   const r = new Ruler({
 *     container: document.getElementById('frame'),
 *     x: 60, y: 80,
 *     pixelsPerMeter: 600,
 *     lengthMeters: 1.0,
 *     thicknessPx: 36
 *   });
 */
class Ruler {
  constructor(options) {
    this.container       = options.container;
    this.x               = options.x ?? 20;
    this.y               = options.y ?? 20;
    this.pixelsPerMeter  = options.pixelsPerMeter ?? 600;
    this.lengthMeters    = options.lengthMeters ?? 1.0;
    this.thicknessPx     = options.thicknessPx ?? 36;

    this.widthPx = this.lengthMeters * this.pixelsPerMeter;

    this._isDragging = false;
    this._dragOffsetX = 0;
    this._dragOffsetY = 0;

    this._buildDOM();
    this._attachEvents();
  }

  // ── DOM construction ──────────────────────────────────────────────────

  _buildDOM() {
    const NS = 'http://www.w3.org/2000/svg';

    const wrap = document.createElement('div');
    wrap.className = 'rl-wrap';
    wrap.style.left  = `${this.x}px`;
    wrap.style.top   = `${this.y}px`;
    wrap.style.width = `${this.widthPx}px`;
    this.wrap = wrap;

    const W = this.widthPx;
    const H = this.thicknessPx;

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'rl-svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width',  W);
    svg.setAttribute('height', H);
    this.svg = svg;

    // Body — wood-toned rectangle
    const body = document.createElementNS(NS, 'rect');
    body.setAttribute('class', 'rl-body');
    body.setAttribute('x', 0); body.setAttribute('y', 0);
    body.setAttribute('width', W); body.setAttribute('height', H);
    svg.appendChild(body);

    // Subtle grain — two thin darker lines parallel to the long edge
    for (const yy of [4, H - 4]) {
      const grain = document.createElementNS(NS, 'line');
      grain.setAttribute('class', 'rl-grain');
      grain.setAttribute('x1', 2); grain.setAttribute('y1', yy);
      grain.setAttribute('x2', W - 2); grain.setAttribute('y2', yy);
      svg.appendChild(grain);
    }

    // Ticks (every 0.5 cm = 0.005 m)
    // The reading edge is the BOTTOM edge of the body (y = H).
    // Ticks rise upward from that edge into the body.
    const cmPerMeter = 100;
    const totalCm = this.lengthMeters * cmPerMeter;
    const pxPerCm = this.pixelsPerMeter / 100;

    const tickGroup = document.createElementNS(NS, 'g');
    tickGroup.setAttribute('class', 'rl-ticks');

    for (let halfCm = 0; halfCm <= totalCm * 2; halfCm++) {
      const cm = halfCm / 2;
      const xPos = cm * pxPerCm;

      let cls, tickLen;
      if (halfCm % 20 === 0) {        // every 10 cm — major
        cls = 'rl-tick-major'; tickLen = 14;
      } else if (halfCm % 10 === 0) { // every 5 cm (but not 10) — half
        cls = 'rl-tick-half';  tickLen = 12;
      } else if (halfCm % 2 === 0) {  // every 1 cm — mid
        cls = 'rl-tick-mid';   tickLen = 9;
      } else {                        // every 0.5 cm — minor
        cls = 'rl-tick-minor'; tickLen = 5;
      }

      const tick = document.createElementNS(NS, 'line');
      tick.setAttribute('class', cls);
      tick.setAttribute('x1', xPos);
      tick.setAttribute('y1', H);            // bottom edge
      tick.setAttribute('x2', xPos);
      tick.setAttribute('y2', H - tickLen);  // up into the body
      tickGroup.appendChild(tick);

      // Major numerals
      if (halfCm % 20 === 0) {
        const lbl = document.createElementNS(NS, 'text');
        lbl.setAttribute('class', 'rl-numeral');
        // Position numeral above the tick, inside the ruler body
        lbl.setAttribute('x', xPos);
        lbl.setAttribute('y', H - tickLen - 4);
        lbl.textContent = cm;
        // Nudge endpoint numerals inward so they don't overflow
        if (cm === 0) {
          lbl.setAttribute('text-anchor', 'start');
          lbl.setAttribute('x', xPos + 2);
        } else if (cm === totalCm) {
          lbl.setAttribute('text-anchor', 'end');
          lbl.setAttribute('x', xPos - 2);
        } else {
          lbl.setAttribute('text-anchor', 'middle');
        }
        tickGroup.appendChild(lbl);
      }
    }
    svg.appendChild(tickGroup);

    // Tiny brand label, centered, very subtle
    const brand = document.createElementNS(NS, 'text');
    brand.setAttribute('class', 'rl-brand');
    brand.setAttribute('x', W / 2);
    brand.setAttribute('y', 11);
    brand.setAttribute('text-anchor', 'middle');
    brand.textContent = 'Mr. Frohlich Math and Physics';
    svg.appendChild(brand);

    wrap.appendChild(svg);
    this.container.appendChild(wrap);
  }

  // ── Drag handling ─────────────────────────────────────────────────────

  _attachEvents() {
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
}

// Expose globally
if (typeof window !== 'undefined') {
  window.Ruler = Ruler;
}
