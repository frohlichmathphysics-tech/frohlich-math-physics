/* ============================================================
 * Protractor — shared measurement-tool module
 * ============================================================
 * Canonical archive: /_shared/measurement-tools/protractor-v1/
 * Vendored into host applets per Applet_Creation v9 §7.8.
 *
 * Visual: 180° school-grade transparent-plastic protractor.
 * Dual scale (0–180 outer, 180–0 inner). Drag body to translate,
 * drag teal knob at right baseline endpoint to rotate around center.
 * No snapping.
 *
 * Rotation convention: math-frame radians, CCW positive,
 * 0 = horizontal baseline with curve up.
 *
 * Coordinate input: API takes CSS-pixel coords. Host is responsible
 * for DPR-scaling the canvas (ctx.scale(dpr, dpr)) and converting
 * pointer events to CSS-pixel coords (clientX - rect.left, etc.).
 * ============================================================ */

(function () {
  'use strict';

  // --- Palette -------------------------------------------------
  const NAVY      = '#1E2A5C';
  const TEAL      = '#2E8B8B';
  const BODY_FILL = 'rgba(70, 90, 120, 0.08)';
  const BASELINE  = '#000000';
  const TICK_10   = '#000000';
  const TICK_5    = '#000000';
  const TICK_1    = '#333333';
  const TICK_HALF = 'rgba(0, 0, 0, 0.35)';
  const LABEL     = '#333333';
  const SHADOW    = 'rgba(0, 0, 0, 0.30)';

  // --- Tunables ------------------------------------------------
  const KNOB_VISIBLE_RADIUS = 9;
  const KNOB_HIT_RADIUS     = 22;
  const HALF_DEGREE_MIN_DIAMETER = 340; // below this, hide 0.5° ticks
  const MIN_DIAMETER = 60;

  class Protractor {
    constructor(canvas, options) {
      options = options || {};
      this.canvas = canvas;

      this.x        = options.x !== undefined ? options.x : (canvas.clientWidth  / 2);
      this.y        = options.y !== undefined ? options.y : (canvas.clientHeight / 2);
      this.rotation = options.rotation !== undefined ? options.rotation : 0;
      this.diameter = Math.max(MIN_DIAMETER, options.diameter !== undefined ? options.diameter : 280);
      this.visible  = options.visible !== false;

      // Drag state
      this._dragMode = null;            // null | 'translate' | 'rotate'
      this._dragOffsetX = 0;
      this._dragOffsetY = 0;
      this._lastPointerAngle = null;
    }

    // ----- Geometry getters --------------------------------------
    get radius() { return this.diameter / 2; }

    getCenter()   { return { x: this.x, y: this.y }; }
    getRotation() { return this.rotation; }

    setVisible(v) {
      this.visible = !!v;
      if (!this.visible) {
        this._dragMode = null;
        this._lastPointerAngle = null;
      }
    }

    // ----- Coordinate transforms ---------------------------------
    /**
     * World point → local frame. Local frame: origin at center,
     * baseline along x-axis from (-R,0) to (R,0); curve at y<0
     * (Canvas y grows down, "above baseline" = negative y).
     */
    _worldToLocal(wx, wy) {
      const dx = wx - this.x;
      const dy = wy - this.y;
      // Inverse of: world = R(-rotation) * local
      // (we draw with ctx.rotate(-rotation); inverse is ctx.rotate(+rotation))
      const c = Math.cos(this.rotation);
      const s = Math.sin(this.rotation);
      return {
        x:  dx * c + dy * s,
        y: -dx * s + dy * c,
      };
    }

    /** World-space position of the rotation knob. */
    _knobWorld() {
      return {
        x: this.x + this.radius * Math.cos(this.rotation),
        y: this.y - this.radius * Math.sin(this.rotation),
      };
    }

    /**
     * Math-frame angle from center to pointer (CCW from +x axis,
     * compensating for Canvas y-flip).
     */
    _pointerAngleFromCenter(wx, wy) {
      return Math.atan2(-(wy - this.y), wx - this.x);
    }

    // ----- Hit detection -----------------------------------------
    _isOnKnob(wx, wy) {
      const k = this._knobWorld();
      const d = Math.hypot(wx - k.x, wy - k.y);
      return d <= KNOB_HIT_RADIUS;
    }

    _isInsideBody(wx, wy) {
      const local = this._worldToLocal(wx, wy);
      const R = this.radius;
      // Baseline strip (thin band so the diameter line is grabbable)
      if (Math.abs(local.y) < 3 && Math.abs(local.x) <= R) return true;
      // Semicircle interior: above baseline in local frame (y < 0)
      if (local.y > 0) return false;
      return (local.x * local.x + local.y * local.y) <= (R * R);
    }

    // ----- Pointer event handlers --------------------------------
    handlePointerDown(x, y) {
      if (!this.visible) return false;

      // Knob takes priority over body.
      if (this._isOnKnob(x, y)) {
        this._dragMode = 'rotate';
        this._lastPointerAngle = this._pointerAngleFromCenter(x, y);
        this.canvas.style.cursor = 'crosshair';
        return true;
      }
      if (this._isInsideBody(x, y)) {
        this._dragMode = 'translate';
        this._dragOffsetX = x - this.x;
        this._dragOffsetY = y - this.y;
        this.canvas.style.cursor = 'grabbing';
        return true;
      }
      return false;
    }

    handlePointerMove(x, y) {
      if (!this.visible) return false;

      if (this._dragMode === 'translate') {
        this.x = x - this._dragOffsetX;
        this.y = y - this._dragOffsetY;
        this.canvas.style.cursor = 'grabbing';
        return true;
      }
      if (this._dragMode === 'rotate') {
        const current = this._pointerAngleFromCenter(x, y);
        let delta = current - this._lastPointerAngle;
        // Unwrap to (-π, π] so crossing the ±π boundary is smooth
        while (delta >  Math.PI) delta -= 2 * Math.PI;
        while (delta < -Math.PI) delta += 2 * Math.PI;
        this.rotation += delta;
        this._lastPointerAngle = current;
        this.canvas.style.cursor = 'crosshair';
        return true;
      }

      // Not dragging — update hover cursor
      if (this._isOnKnob(x, y)) {
        this.canvas.style.cursor = 'crosshair';
      } else if (this._isInsideBody(x, y)) {
        this.canvas.style.cursor = 'grab';
      } else {
        this.canvas.style.cursor = '';
      }
      return false;
    }

    handlePointerUp() {
      this._dragMode = null;
      this._lastPointerAngle = null;
      this.canvas.style.cursor = '';
    }

    // ----- Rendering ---------------------------------------------
    draw(ctx) {
      if (!this.visible) return;

      const R = this.radius;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(-this.rotation); // negate to convert math-CCW → screen-CCW

      this._drawShadow(ctx, R);
      this._drawBody(ctx, R);
      this._drawTicks(ctx, R);
      this._drawLabels(ctx, R);
      this._drawBaselineAndCenter(ctx, R);
      this._drawKnob(ctx, R);

      ctx.restore();
    }

    _semicirclePath(ctx, R) {
      // Semicircle: arc from (R, 0) over the top (y<0) to (-R, 0),
      // closed along the baseline (diameter).
      ctx.beginPath();
      ctx.arc(0, 0, R, Math.PI, 0, false);
      ctx.closePath();
    }

    /**
     * Draw a real drop shadow under a transparent body.
     * Trick: clip to OUTSIDE the body shape, then fill an opaque
     * shape with shadow. Only the shadow renders (the opaque fill
     * itself is clipped away by the inverse clip).
     *
     * FIX 2026-05-23: build the two clip subpaths manually with
     * explicit moveTo. Using ctx.rect() followed by ctx.arc()
     * without a moveTo between them caused Canvas to draw a
     * connector line from the rect's residual current-point to
     * the arc start, producing a malformed evenodd region and a
     * visible black wedge inside the body.
     */
    _drawShadow(ctx, R) {
      ctx.save();

      const pad = R + 30;

      // Subpath 1: outer rect, drawn manually for predictable subpath state.
      ctx.beginPath();
      ctx.moveTo(-pad, -pad);
      ctx.lineTo( pad, -pad);
      ctx.lineTo( pad,  pad);
      ctx.lineTo(-pad,  pad);
      ctx.closePath();

      // Subpath 2: semicircle body. Explicit moveTo starts a clean subpath
      // at the arc's start point — no spurious connector line.
      ctx.moveTo(-R, 0);
      ctx.arc(0, 0, R, Math.PI, 0, false);
      ctx.closePath();

      // Evenodd: rect (1 enclosure) minus semicircle (2 enclosures) = outside-body region.
      ctx.clip('evenodd');

      // Fill the body shape with an opaque source. Body pixels are clipped
      // away; only the offset shadow renders in the outside-body region.
      ctx.shadowColor   = SHADOW;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 5;
      ctx.shadowBlur    = 7;
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      this._semicirclePath(ctx, R);
      ctx.fill();

      ctx.restore();
    }

    _drawBody(ctx, R) {
      ctx.save();
      ctx.fillStyle   = BODY_FILL;
      ctx.strokeStyle = NAVY;
      ctx.lineWidth   = 1;
      this._semicirclePath(ctx, R);
      ctx.fill();
      // Stroke only the curved arc — the baseline gets its own bolder stroke later
      ctx.beginPath();
      ctx.arc(0, 0, R, Math.PI, 0, false);
      ctx.stroke();
      ctx.restore();
    }

    _drawTicks(ctx, R) {
      // 0.5° half-degree ticks (lightest, shortest) — only when room
      if (this.diameter >= HALF_DEGREE_MIN_DIAMETER) {
        ctx.save();
        ctx.strokeStyle = TICK_HALF;
        ctx.lineWidth   = 0.5;
        const L = 2.5;
        ctx.beginPath();
        for (let halves = 1; halves < 360; halves += 2) {
          // halves = 1 → 0.5°, halves = 3 → 1.5°, ..., halves = 359 → 179.5°
          const deg = halves / 2;
          const th  = deg * Math.PI / 180;
          const c = Math.cos(th), s = Math.sin(th);
          ctx.moveTo( R      * c, -R      * s);
          ctx.lineTo((R - L) * c, -(R - L) * s);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 1° whole-degree ticks (bolder than half, lighter than 5°)
      ctx.save();
      ctx.strokeStyle = TICK_1;
      ctx.lineWidth   = 1;
      {
        const L = 4;
        ctx.beginPath();
        for (let deg = 1; deg <= 179; deg++) {
          if (deg % 5 === 0) continue; // 5° and 10° drawn below
          const th = deg * Math.PI / 180;
          const c = Math.cos(th), s = Math.sin(th);
          ctx.moveTo( R      * c, -R      * s);
          ctx.lineTo((R - L) * c, -(R - L) * s);
        }
        ctx.stroke();
      }
      ctx.restore();

      // 5° ticks (medium)
      ctx.save();
      ctx.strokeStyle = TICK_5;
      ctx.lineWidth   = 1;
      {
        const L = 7;
        ctx.beginPath();
        for (let deg = 5; deg <= 175; deg += 5) {
          if (deg % 10 === 0) continue; // 10° drawn below
          const th = deg * Math.PI / 180;
          const c = Math.cos(th), s = Math.sin(th);
          ctx.moveTo( R      * c, -R      * s);
          ctx.lineTo((R - L) * c, -(R - L) * s);
        }
        ctx.stroke();
      }
      ctx.restore();

      // 10° major ticks (boldest, longest)
      ctx.save();
      ctx.strokeStyle = TICK_10;
      ctx.lineWidth   = 1.5;
      {
        const L = 10;
        ctx.beginPath();
        for (let deg = 0; deg <= 180; deg += 10) {
          const th = deg * Math.PI / 180;
          const c = Math.cos(th), s = Math.sin(th);
          ctx.moveTo( R      * c, -R      * s);
          ctx.lineTo((R - L) * c, -(R - L) * s);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    _drawLabels(ctx, R) {
      ctx.save();
      ctx.fillStyle    = LABEL;
      ctx.font         = '11px Cambria, Georgia, "Times New Roman", serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';

      const outerR = R - 18; // outer scale: labels just inside the 10° tick
      const innerR = R - 32; // inner scale: labels further toward center

      for (let deg = 0; deg <= 180; deg += 10) {
        const th = deg * Math.PI / 180;
        const c = Math.cos(th), s = Math.sin(th);
        // Outer scale: 0 at right → 180 at left
        ctx.fillText(String(deg),       outerR * c, -outerR * s);
        // Inner scale: 180 at right → 0 at left
        ctx.fillText(String(180 - deg), innerR * c, -innerR * s);
      }
      ctx.restore();
    }

    _drawBaselineAndCenter(ctx, R) {
      // Baseline (solid black 1.5px diameter line)
      ctx.save();
      ctx.strokeStyle = BASELINE;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(-R, 0);
      ctx.lineTo( R, 0);
      ctx.stroke();

      // Center crosshair (8px arms, 1.5px stroke)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo( 4, 0);
      ctx.moveTo(0, -4);
      ctx.lineTo(0,  4);
      ctx.stroke();
      ctx.restore();
    }

    _drawKnob(ctx, R) {
      ctx.save();
      ctx.fillStyle   = TEAL;
      ctx.strokeStyle = NAVY;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.arc(R, 0, KNOB_VISIBLE_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  // Vanilla global export — no ES modules, single-file vendoring.
  window.Protractor = Protractor;
})();
