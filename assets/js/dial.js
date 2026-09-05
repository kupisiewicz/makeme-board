/**
 * THE DIAL — the nouns on a barrel, `makeme.` held still beside it.
 *
 * This is the pinned signature interaction (PRODUCT.md, Brand Commitments):
 * an iOS picker wheel, not a fade and not a typewriter. Real picker mechanics —
 * a flick that decelerates, momentum that carries past a stop, and a snap that
 * overshoots a hair before settling — because that overshoot is the entire
 * difference between "a wheel" and "a CSS animation of a wheel".
 *
 * GEOMETRY IS DERIVED FROM THE NOUN COUNT, never hardcoded. The first version
 * baked eleven into the step angle and the radius, in two files, so buying a
 * twelfth domain silently broke the barrel into a cone. The count belongs to
 * destinations.js and nothing else is allowed to know it.
 *
 * `pos` is a continuous position in item units and is deliberately unbounded:
 * the arrival spin travels two whole turns rather than wrapping, which is what
 * lets a single tween express "spin up, then land".
 */

const reduced = matchMedia("(prefers-reduced-motion: reduce)");

/** Mild overshoot: the part indexes past its stop and settles back. */
const easeOutBack = (t) => 1 + 2.2 * (t - 1) ** 3 + 1.35 * (t - 1) ** 2;
/** A hard flick: leaves fast, arrives slowly. Used for the arrival spin. */
const easeOutQuint = (t) => 1 - (1 - t) ** 5;

/** Shortest signed distance from `pos` to item `i`, wrapped around a barrel of n. */
function delta(i, pos, n) {
  const half = n / 2;
  return ((((i - pos) % n) + n + half) % n) - half;
}

export function createDial(root, nouns, options = {}) {
  const { onChange, idleMs = 2400, autoroll = true } = options;

  const cyl = root.querySelector(".dial__cyl");
  const live = options.live ?? null;

  // --- Geometry, from the count ------------------------------------------
  // n faces evenly around a cylinder: the step is 360/n, and the radius that
  // puts flat faces exactly one item-height apart on the wall is
  // (h/2)/tan(θ/2). Written into CSS custom properties so the stylesheet
  // consumes them without knowing n.
  const TAU_ITEMS = nouns.length;
  const STEP_DEG = 360 / TAU_ITEMS;
  const radiusMultiple = 0.5 / Math.tan(Math.PI / TAU_ITEMS);
  // Faces past ±90° are edge-on and hidden by backface-visibility, so this is
  // where an item stops being painted at all.
  const HIDE = 90 / STEP_DEG;

  root.style.setProperty("--dial-step", `${STEP_DEG}deg`);
  root.style.setProperty("--dial-r-mult", radiusMultiple.toFixed(4));

  // --- Build the barrel ---------------------------------------------------
  // The width axis is set per noun so every destination fills the same optical
  // slot: "codes" gets stretched, "boutique" gets condensed. A real board does
  // exactly this, and it is why Archivo's wdth axis is in this design at all.
  const longest = Math.max(...nouns.map((n) => n.length));
  const items = nouns.map((noun, i) => {
    const el = document.createElement("span");
    el.className = "dial__item";
    el.id = `dial-opt-${noun}`;
    el.setAttribute("role", "option");
    el.setAttribute("aria-selected", i === 0 ? "true" : "false");
    el.textContent = noun;
    el.style.setProperty("--i", String(i));
    // 62–125 is Archivo's width axis. Short words widen, long words condense.
    const w = Math.round(Math.min(125, Math.max(64, 62 + (longest / noun.length) * 34)));
    el.style.setProperty("--w", String(w));
    cyl.append(el);
    return el;
  });

  let pos = 0;
  let raf = 0;
  let idleTimer = 0;
  let locked = false;
  let interacting = false;

  // --- Paint --------------------------------------------------------------
  // Only opacity is touched per frame. The fog belongs to .dial__glass, one
  // GPU-composited element, so the big glyphs never pay for a filter.
  function paint() {
    cyl.style.setProperty("--dial-angle", `${-pos * STEP_DEG}deg`);
    for (let i = 0; i < items.length; i++) {
      const d = Math.abs(delta(i, pos, TAU_ITEMS));
      const o = d >= HIDE ? 0 : Math.max(0, 1 - d / HIDE) ** 1.35;
      items[i].style.setProperty("--o", o.toFixed(3));
    }
  }

  let current = -1;
  function settleIndex() {
    const idx = ((Math.round(pos) % TAU_ITEMS) + TAU_ITEMS) % TAU_ITEMS;
    if (idx === current) return;
    current = idx;
    // Selection is geometric and immediate; the LAMP is not. Which word burns
    // colour is decided by `light()` when the board commits, so a noun flying
    // through the window mid-spin does not glow in another destination's colour.
    items.forEach((el, i) => el.setAttribute("aria-selected", i === idx ? "true" : "false"));
    root.setAttribute("aria-activedescendant", items[idx].id);
    if (live) live.textContent = nouns[idx];
    onChange?.(idx, nouns[idx]);
  }

  // --- Tweening -----------------------------------------------------------
  function glide(to, ms, ease = easeOutBack) {
    cancelAnimationFrame(raf);
    if (reduced.matches) {
      pos = to;
      paint();
      settleIndex();
      return Promise.resolve();
    }
    const from = pos;
    const t0 = performance.now();
    return new Promise((done) => {
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / ms);
        pos = from + (to - from) * ease(t);
        paint();
        // The index commits as the window passes it, not when the tween ends,
        // so the status strip retimes in step with the wheel rather than after.
        settleIndex();
        if (t < 1) raf = requestAnimationFrame(tick);
        else {
          pos = to;
          paint();
          settleIndex();
          done();
        }
      };
      raf = requestAnimationFrame(tick);
    });
  }

  // --- Idle roll ----------------------------------------------------------
  // A departure board is never still: it keeps cycling its destinations. One
  // index per beat, with the machine's own easing.
  function scheduleIdle() {
    clearTimeout(idleTimer);
    if (locked || !autoroll || reduced.matches) return;
    idleTimer = setTimeout(async () => {
      if (interacting || locked) return;
      await glide(Math.round(pos) + 1, 620);
      scheduleIdle();
    }, idleMs);
  }

  function stopIdle() {
    clearTimeout(idleTimer);
    cancelAnimationFrame(raf);
  }

  // --- Pointer drag with momentum ----------------------------------------
  let dragging = false;
  let lastY = 0;
  let lastT = 0;
  let vel = 0; // items per ms
  let startPos = 0;

  const itemPx = () => root.getBoundingClientRect().height / 3 || 60;

  root.addEventListener("pointerdown", (e) => {
    if (locked) return;
    dragging = true;
    interacting = true;
    stopIdle();
    startPos = pos;
    lastY = e.clientY;
    lastT = performance.now();
    vel = 0;
    root.setPointerCapture(e.pointerId);
  });

  root.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const now = performance.now();
    const dy = e.clientY - lastY;
    const dt = Math.max(1, now - lastT);
    // Dragging down rolls the barrel towards earlier items, like a real wheel.
    pos -= dy / itemPx();
    vel = -dy / itemPx() / dt;
    lastY = e.clientY;
    lastT = now;
    paint();
    settleIndex();
  });

  function release(e) {
    if (!dragging) return;
    dragging = false;
    try { root.releasePointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    // Momentum: carry the flick, then land on whichever stop that reaches.
    const carry = Math.max(-4, Math.min(4, vel * 220));
    const target = Math.round(pos + carry);
    const distance = Math.abs(target - pos);
    glide(target, 260 + distance * 130).then(() => {
      interacting = false;
      scheduleIdle();
    });
  }
  root.addEventListener("pointerup", release);
  root.addEventListener("pointercancel", release);

  // --- Wheel --------------------------------------------------------------
  let wheelTimer = 0;
  root.addEventListener(
    "wheel",
    (e) => {
      if (locked) return;
      e.preventDefault();
      interacting = true;
      stopIdle();
      pos += Math.sign(e.deltaY) * 0.34;
      paint();
      settleIndex();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        glide(Math.round(pos), 280).then(() => {
          interacting = false;
          scheduleIdle();
        });
      }, 90);
    },
    { passive: false }
  );

  // --- Keyboard, including direct addressing ------------------------------
  // Arrows step, Home/End jump, and a letter key goes straight to that noun —
  // every destination is addressable, not merely scrollable.
  root.addEventListener("keydown", (e) => {
    if (locked) return;
    let to = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") to = Math.round(pos) + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") to = Math.round(pos) - 1;
    else if (e.key === "Home") to = Math.round(pos) - current;
    else if (e.key === "End") to = Math.round(pos) - current + nouns.length - 1;
    else if (/^[a-z]$/i.test(e.key)) {
      const hit = nouns.findIndex((n) => n.startsWith(e.key.toLowerCase()));
      if (hit >= 0) to = Math.round(pos) + delta(hit, Math.round(pos), TAU_ITEMS);
    }
    if (to === null) return;
    e.preventDefault();
    interacting = true;
    stopIdle();
    glide(to, 300).then(() => {
      interacting = false;
      scheduleIdle();
    });
  });

  // Hover pauses the roll: the visitor is reading, so stop moving the words.
  root.addEventListener("pointerenter", () => { if (!locked) stopIdle(); });
  root.addEventListener("pointerleave", () => { if (!dragging) scheduleIdle(); });

  // A dial nobody can see should not be burning frames. Only the idle timer is
  // paused — cancelling the animation frame here would kill an in-flight tween
  // and leave the barrel stopped between two stops.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearTimeout(idleTimer);
    else scheduleIdle();
  });

  paint();
  settleIndex();

  return {
    /** Jump to a noun by index, taking the short way round. */
    goTo(idx, ms = 420) {
      stopIdle();
      return glide(Math.round(pos) + delta(idx, Math.round(pos), TAU_ITEMS), ms).then(() => scheduleIdle());
    },

    /**
     * The arrival: two full turns of the whole family, then the destination
     * this hostname belongs to lands in the window and the wheel stops.
     * On a locked domain that stop is permanent — the visitor sees every
     * sibling roll past before their own noun claims the board.
     */
    async arrive(idx, { lock = false } = {}) {
      const land = () => {
        pos = idx;
        paint();
        settleIndex();
        locked = lock;
        root.dataset.locked = String(lock);
        if (lock) {
          // A locked barrel is no longer a control, so it stops advertising
          // itself as one. Dropping tabindex while keeping role="listbox" left
          // an unfocusable listbox on every product domain — the whole set has
          // to go together, or assistive tech is told to operate something it
          // cannot reach.
          root.removeAttribute("tabindex");
          root.removeAttribute("role");
          root.removeAttribute("aria-activedescendant");
          root.setAttribute("aria-label", `Destination: ${nouns[idx]}`);
          for (const el of items) {
            el.removeAttribute("role");
            el.removeAttribute("aria-selected");
          }
        } else {
          scheduleIdle();
        }
      };

      // Reduced motion: no spin, and no apology for it.
      // Background tab: requestAnimationFrame is frozen, so the spin would
      // never tick and the barrel would sit on the wrong noun until the visitor
      // gave up on it. Land immediately instead — someone opening this in a
      // background tab should find the board already correct when they arrive.
      if (reduced.matches || document.hidden) {
        land();
        return;
      }

      stopIdle();
      await glide(idx + TAU_ITEMS * 2, 2100, easeOutQuint);
      land();
    },

    get index() { return current; },
    stop: stopIdle,

    /** Light one noun. Called when the board commits, never during a spin. */
    light(idx) {
      items.forEach((el, i) => (el.dataset.current = i === idx ? "true" : "false"));
    },

    /**
     * Pause and resume the IDLE ROLL only — never an in-flight tween. `stop`
     * also cancels the running animation frame, and calling it from the
     * viewport observer killed the arrival spin before it could land and lock.
     */
    pause() { clearTimeout(idleTimer); },
    resume() { if (!locked && !interacting) scheduleIdle(); },
  };
}
