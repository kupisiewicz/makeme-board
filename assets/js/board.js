/**
 * BOARD — the split-flap mechanics and everything the board renders.
 *
 * Motion grammar: parts index into position. Nothing cross-fades. A value that
 * changes on this page flips through glyphs and lands, because that is what the
 * object does in life.
 */

import { SPECIMENS } from "./specimens.js";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.·-/";
const reduced = matchMedia("(prefers-reduced-motion: reduce)");

/**
 * Split-flap a text value into place. Each character rolls through a few
 * glyphs, staggered left to right, exactly like a Solari row settling.
 * Under reduced motion the value simply changes — the information is identical.
 */
export function flapTo(el, next) {
  const target = String(next ?? "");
  if (reduced.matches || el.textContent === target) {
    el.textContent = target;
    return;
  }
  clearInterval(el._flap);
  const chars = [...target];
  let frame = 0;
  const perChar = 4; // frames a character spends spinning before it lands
  const total = chars.length * 1.5 + perChar;

  el._flap = setInterval(() => {
    frame++;
    el.textContent = chars
      .map((c, i) => {
        const landed = frame >= i * 1.5 + perChar;
        if (landed || c === " ") return c;
        if (frame < i * 1.5) return " ";
        return GLYPHS[(Math.random() * GLYPHS.length) | 0];
      })
      .join("");
    if (frame >= total) {
      clearInterval(el._flap);
      el.textContent = target;
    }
  }, 34);
}

/* ---------------------------------------------------------------------------
   DEPARTURES — the board's own recent traffic.
   Authored demonstration material. The section header says so, out loud.
   --------------------------------------------------------------------------- */

const DEPARTURES = [
  { m: 2, dest: "codes", ask: "a Python script that renames photos by EXIF date", state: "building", status: "Building" },
  { m: 6, dest: "website", ask: "a one-page site for a ceramics studio in Kraków", state: "done", status: "Shipped" },
  { m: 11, dest: "email", ask: "a launch note to 400 beta users, no hype", state: "done", status: "Shipped" },
  { m: 17, dest: "support", ask: "a help desk that answers in 12 languages", state: "done", status: "Shipped" },
  { m: 24, dest: "boutique", ask: "a shop for 31 pieces of hand-thrown stoneware", state: "done", status: "Shipped" },
  { m: 31, dest: "cloud", ask: "Postgres and object storage that survives a region", state: "done", status: "Shipped" },
  { m: 38, dest: "agency", ask: "an identity for a natural wine bar opening in six weeks", state: "done", status: "Shipped" },
  { m: 44, dest: "services", ask: "booking and quotes for a two-van plumbing business", state: "done", status: "Shipped" },
];

const pad = (n) => String(n).padStart(2, "0");

export function renderDepartures(root, byId) {
  const now = Date.now();
  root.replaceChildren(
    ...DEPARTURES.map(({ m, dest, ask, state, status }) => {
      const d = byId[dest];
      const at = new Date(now - m * 60_000);
      const row = document.createElement("div");
      row.className = "row row--departure";
      // No per-destination lamp here on purpose: this is a list of seven runs
      // at once, and the page is allowed one lit lamp. The dot encodes state.
      row.innerHTML = `
        <span class="row__time">${pad(at.getHours())}:${pad(at.getMinutes())}</span>
        <span class="row__ask">${ask}<span class="row__dest">makeme.${d.tld}</span></span>
        <span class="status" data-state="${state}">${status}</span>`;
      return row;
    })
  );
}

/* ---------------------------------------------------------------------------
   DESTINATIONS — the whole family on one board. Clicking a row retimes the
   entire page to that destination: lamp, dial, strip, slot, specimen.
   --------------------------------------------------------------------------- */

export function renderDestinations(root, destinations, onPick) {
  root.replaceChildren(
    ...destinations.map((d) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "row row--dest";
      row.dataset.dest = d.id;
      row.style.setProperty("--row-lamp", d.accent);
      row.innerHTML = `
        <span>
          <span class="row__name"><span class="fixed">makeme.</span><span class="noun">${d.noun}</span></span>
          <span class="row__makes">${d.line}</span>
        </span>
        <span class="status">Makes ${d.makes}</span>`;
      row.addEventListener("click", () => onPick(d.id));
      return row;
    })
  );
}

export function markDestination(root, id) {
  for (const row of root.querySelectorAll(".row--dest")) {
    row.setAttribute("aria-current", String(row.dataset.dest === id));
  }
}

/* ---------------------------------------------------------------------------
   SPECIMEN — the manifest of one run, plus a real excerpt.
   --------------------------------------------------------------------------- */

export function renderSpecimen(root, dest) {
  const s = SPECIMENS[dest.id];
  // The specimen carries its OWN lamp rather than inheriting the document's.
  // The wheel keeps turning while this section is rebuilt on a settle delay, so
  // a shared lamp would leave the header burning one destination's colour over
  // another destination's output.
  root.style.setProperty("--lamp", dest.accent);
  const rows = s.manifest
    .map(([name, note]) => `<div class="man__row"><code>${name}</code><span>${note}</span></div>`)
    .join("");

  root.innerHTML = `
    <div class="specimen__bar">
      <span class="specimen__title legend">${dest.specimen.title}</span>
      <span class="legend">${dest.specimen.meta}</span>
    </div>
    <div class="specimen__body">
      <p class="legend" style="color:var(--ink-faint)">Asked for</p>
      <p style="font-size:var(--step-1);max-width:52ch">“${s.ask}”</p>
      <p class="legend" style="color:var(--ink-faint);margin-top:.6rem">What came out</p>
      <div class="manifest">${rows}</div>
      <p class="legend" style="color:var(--ink-faint);margin-top:.6rem">${s.excerptLabel}</p>
      <pre class="specimen__pre">${s.excerpt}</pre>
    </div>
    <div class="specimen__foot">
      <span class="synthetic legend">Authored example · no customer, no live run</span>
      <span class="legend" style="color:var(--ink-faint)">makeme.${dest.tld}</span>
    </div>`;
}

/* ---------------------------------------------------------------------------
   TONGUES — the noun in the languages the dictionary actually carries.
   --------------------------------------------------------------------------- */

/**
 * The nouns, hand-checked, in the twelve most-spoken languages the dictionary
 * holds. Kept small and correct on purpose: a machine-filled grid of 99 would
 * be a coverage claim, and the honest claim is that the *dictionary* holds 99
 * and this page ships the packs that exist.
 */
const NOUN_IN = {
  website: { pl: "stronę", de: "Website", es: "una web", fr: "un site", pt: "um site", it: "un sito", tr: "site", ru: "сайт", ar: "موقعًا", hi: "वेबसाइट", ja: "ウェブサイト", zh: "网站" },
  codes: { pl: "kod", de: "Code", es: "código", fr: "du code", pt: "código", it: "codice", tr: "kod", ru: "код", ar: "كودًا", hi: "कोड", ja: "コード", zh: "代码" },
  software: { pl: "program", de: "Software", es: "software", fr: "un logiciel", pt: "software", it: "software", tr: "yazılım", ru: "программу", ar: "برنامجًا", hi: "सॉफ़्टवेयर", ja: "ソフトウェア", zh: "软件" },
  cloud: { pl: "chmurę", de: "Cloud", es: "una nube", fr: "un cloud", pt: "uma nuvem", it: "un cloud", tr: "bulut", ru: "облако", ar: "سحابة", hi: "क्लाउड", ja: "クラウド", zh: "云" },
  email: { pl: "e-mail", de: "E-Mail", es: "un correo", fr: "un e-mail", pt: "um e-mail", it: "un'email", tr: "e-posta", ru: "письмо", ar: "بريدًا", hi: "ईमेल", ja: "メール", zh: "邮件" },
  team: { pl: "zespół", de: "Team", es: "un equipo", fr: "une équipe", pt: "uma equipa", it: "un team", tr: "ekip", ru: "команду", ar: "فريقًا", hi: "टीम", ja: "チーム", zh: "团队" },
  club: { pl: "klub", de: "Klub", es: "un club", fr: "un club", pt: "um clube", it: "un club", tr: "kulüp", ru: "клуб", ar: "ناديًا", hi: "क्लब", ja: "クラブ", zh: "俱乐部" },
  expert: { pl: "eksperta", de: "Experten", es: "un experto", fr: "un expert", pt: "um perito", it: "un esperto", tr: "uzman", ru: "эксперта", ar: "خبيرًا", hi: "विशेषज्ञ", ja: "専門家", zh: "专家" },
  agency: { pl: "agencję", de: "Agentur", es: "una agencia", fr: "une agence", pt: "uma agência", it: "un'agenzia", tr: "ajans", ru: "агентство", ar: "وكالة", hi: "एजेंसी", ja: "代理店", zh: "代理" },
  boutique: { pl: "butik", de: "Boutique", es: "una tienda", fr: "une boutique", pt: "uma loja", it: "una boutique", tr: "butik", ru: "бутик", ar: "متجرًا", hi: "बुटीक", ja: "ブティック", zh: "精品店" },
  services: { pl: "usługi", de: "Dienste", es: "servicios", fr: "des services", pt: "serviços", it: "servizi", tr: "hizmet", ru: "услуги", ar: "خدمات", hi: "सेवाएँ", ja: "サービス", zh: "服务" },
  support: { pl: "wsparcie", de: "Support", es: "soporte", fr: "un support", pt: "suporte", it: "supporto", tr: "destek", ru: "поддержку", ar: "دعمًا", hi: "सहायता", ja: "サポート", zh: "支持" },
};

export function renderTongues(root, i18n, destId) {
  const words = NOUN_IN[destId] ?? NOUN_IN.website;
  const order = ["pl", "de", "es", "fr", "pt", "it", "tr", "ru", "ar", "hi", "ja", "zh"];
  root.replaceChildren(
    ...order
      .filter((c) => i18n.meta(c))
      .map((c) => {
        const meta = i18n.meta(c);
        const n = meta.plurals.length;
        const el = document.createElement("div");
        el.className = "row row--tongue";
        // The lockup NEVER flips. Setting dir on the whole word reversed the
        // Latin wordmark too, so Arabic rendered as ".makeme" with the full
        // stop — the one character that is the brand — on the wrong side.
        // `<bdi>` isolates the translated noun so it lays out right-to-left
        // inside a row that stays left-to-right.
        el.innerHTML = `
          <span class="tongue__code legend">${c}</span>
          <span class="tongue__word" dir="ltr"><span class="fixed">makeme.</span> <bdi dir="${meta.dir}">${words[c]}</bdi></span>
          <span class="tongue__name legend" dir="ltr"><span>${i18n.name(c)}</span><span>${n} plural form${n === 1 ? "" : "s"}</span></span>`;
        return el;
      })
  );
}

/* ---------------------------------------------------------------------------
   THE LANGUAGE BOARD — all 99, addressable.
   --------------------------------------------------------------------------- */

export function mountLangBoard(dialog, list, i18n) {
  list.replaceChildren(
    ...i18n.locales.map((l) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "lang";
      b.dataset.code = l.code;
      b.setAttribute("aria-current", String(l.code === i18n.code));
      b.innerHTML = `<span class="lang__code">${l.code}</span><span class="lang__name">${i18n.name(l.code)}</span>`;
      b.addEventListener("click", async () => {
        await i18n.set(l.code);
        for (const other of list.children) other.setAttribute("aria-current", String(other.dataset.code === l.code));
        dialog.close();
      });
      return b;
    })
  );
}
