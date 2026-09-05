/**
 * makeme. — boot and wiring.
 *
 * The hostname is the whole configuration. Everything else on this page is a
 * consequence of which destination is active, and switching destination is a
 * single attribute on <html> plus a handful of flapped values.
 */

import { DESTINATIONS, BY_ID, resolveDestination } from "./destinations.js";
import { createDial } from "./dial.js";
import { createI18n } from "./i18n.js";
import { flapTo, renderDepartures, renderDestinations, markDestination, renderSpecimen, renderTongues, mountLangBoard } from "./board.js";

/**
 * REPLACE BEFORE LAUNCH — the generation endpoint.
 * Empty on purpose: there is no live generator behind this build, and the page
 * says so out loud rather than faking a result. Point this at the real endpoint
 * and the slot starts submitting instead of explaining itself.
 */
const GENERATE_ENDPOINT = "";

const $ = (id) => document.getElementById(id);

const { destination: initial, locked } = resolveDestination();

// All module state is declared up here on purpose. createDial paints and
// reports its starting index synchronously, so `retime` — and everything it
// calls — runs once during construction, before any later `let` would have
// left its temporal dead zone.
let active = initial;
let settleTimer = 0;
let settled = null;

const i18n = await createI18n();
const dial = createDial($("dial"), DESTINATIONS.map((d) => d.noun), {
  live: $("nounLive"),
  autoroll: !locked,
  onChange: (_, noun) => retime(noun),
});

/* ---------------------------------------------------------------------------
   RETIME — one destination change, everywhere at once.
   --------------------------------------------------------------------------- */

/** Notes which noun is in the window. The board commits in `settle`, below. */
function retime(noun) {
  const d = DESTINATIONS.find((x) => x.noun === noun) ?? initial;
  active = d;
  settle(d);
}

/**
 * Follows the wheel ONCE IT STOPS. Two reasons, and both matter:
 *
 * A real departure board rolls its flaps *after* the decision, not during it.
 * Updating the words live meant the status strip was mid-flap on one
 * destination while the slot prefix already read another — the same box
 * claiming two destinations at once.
 *
 * And the arrival spin crosses twenty-two stops in two seconds. Rebuilding the
 * specimen and the language grid on each would jank the very animation this
 * page is built around.
 */
function settle(d) {
  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => {
    if (settled === d.id) return;
    settled = d.id;

    // The lamp commits with the words, not with the wheel. Lighting it live
    // meant a teal MAKE IT key sitting above a slot that read makeme.email —
    // the board wearing one destination's colour over another's name.
    document.documentElement.dataset.destination = d.id;

    dial.light(DESTINATIONS.indexOf(d));

    flapTo($("sDest"), `makeme.${d.tld}`);
    flapTo($("sMakes"), i18n.t(`makes.${d.id}`, d.makes));
    $("boardLine").textContent = i18n.t(`line.${d.id}`, d.line);

    for (const id of ["slotPrefix", "slotPrefix2"]) $(id).textContent = `makeme.${d.tld}`;
    for (const id of ["prompt", "prompt2"]) {
      const el = $(id);
      // Never overwrite something the visitor is in the middle of typing.
      if (!el.value) el.placeholder = i18n.t(`placeholder.${d.id}`, d.placeholder);
    }

    markDestination($("destRows"), d.id);
    renderSpecimen($("specimen"), d);
    renderTongues($("tongues"), i18n, d.id);
    // Deliberately NOT document.title: the wheel idles through every destination, and
    // a title changing every two seconds would churn the tab, the history entry
    // and every screen reader listening to it. It is set once, at boot.
  }, 160);
}

/* ---------------------------------------------------------------------------
   Static sections.
   --------------------------------------------------------------------------- */

renderDepartures($("departures"), BY_ID);
renderDestinations($("destRows"), DESTINATIONS, (id) => {
  dial.goTo(DESTINATIONS.findIndex((d) => d.id === id));
  $("dial").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
});

$("footList").replaceChildren(
  ...DESTINATIONS.map((d) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="https://makeme.${d.tld}" style="--row-lamp:${d.accent}">makeme.${d.tld}</a>`;
    return li;
  })
);

/* ---------------------------------------------------------------------------
   The slot.
   --------------------------------------------------------------------------- */

for (const [formId, hintId] of [["slot", "slotHint"], ["slot2", "slotHint2"]]) {
  $(formId).addEventListener("submit", (e) => {
    e.preventDefault();
    const value = new FormData(e.target).get("prompt")?.toString().trim();
    if (!value) {
      e.target.querySelector(".slot__input").focus();
      return;
    }
    if (GENERATE_ENDPOINT) {
      location.href = `${GENERATE_ENDPOINT}?d=${encodeURIComponent(active.id)}&q=${encodeURIComponent(value)}&lang=${i18n.code}`;
      return;
    }
    // No generator wired: say so. A fake "generating…" animation here would be
    // the one thing PRODUCT.md forbids — a claim about something that has not
    // happened. The status strip already reads "Not connected", so it is left
    // alone rather than flapped to a second word for the same fact.
    $(hintId).innerHTML =
      `<span class="synthetic">${i18n.t("slot.unwired", "The generator is not connected to this build. Your request was not sent anywhere.")}</span>`;
  });
}

/* ---------------------------------------------------------------------------
   The language board.
   --------------------------------------------------------------------------- */

const board = $("langBoard");
mountLangBoard(board, $("langList"), i18n);
$("langBtn").addEventListener("click", () => board.showModal());
$("langClose").addEventListener("click", () => board.close());
board.addEventListener("click", (e) => {
  // Clicking the backdrop closes it: the dialog element reports those clicks
  // on itself rather than on any child.
  if (e.target === board) board.close();
});

document.addEventListener("i18n:change", ({ detail }) => {
  $("langLabel").textContent = detail.code.toUpperCase();
  flapTo($("sLang"), i18n.name(detail.code));
  // Re-render everything whose text comes from data rather than from markup.
  // `settled` has to be cleared first: the destination has not changed, so the
  // settle guard would otherwise skip the very re-render the new language needs.
  settled = null;
  retime(active.noun);
});

/* ---------------------------------------------------------------------------
   Arrival.
   --------------------------------------------------------------------------- */

retime(initial.noun);
flapTo($("sLang"), i18n.name(i18n.code));
$("langLabel").textContent = i18n.code.toUpperCase();

// The status is a claim about the machine, so it follows the machine. Wiring
// GENERATE_ENDPOINT is the only thing that makes this board say Ready.
if (GENERATE_ENDPOINT) flapTo($("sStatus"), i18n.t("status.ready", "Ready"));

// The wheel idles only while the board is on screen. Once the visitor has
// scrolled past it they are reading, and a page that kept retiming its lamp,
// specimen and language grid behind them would be changing the article they are
// in the middle of.
new IntersectionObserver(
  ([entry]) => (entry.isIntersecting ? dial.resume() : dial.pause()),
  { threshold: 0.15 }
).observe(document.querySelector(".board"));

// On a product domain the tab says what this address makes. On the hub it says
// what the family is. Either way it is written once and left alone.
document.title = locked
  ? `makeme.${initial.tld} — ${initial.makes}, made`
  : "makeme. — name it, and it is made";

// Two full turns of the whole family, then this hostname's noun lands in the
// window. On a product domain the wheel then stops for good — the visitor has
// watched every sibling roll past before their own claims the board.
dial.arrive(DESTINATIONS.findIndex((d) => d.id === initial.id), { lock: locked });
