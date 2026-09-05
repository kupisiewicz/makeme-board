/**
 * NINETY-NINE LANGUAGES — runtime side.
 *
 * DOCTRINE: the shared translation dictionary is the system of record and
 * language packs are BUILD ARTIFACTS. That service explicitly rejects "the app
 * fetches its translations at runtime" — it adds a network dependency to every
 * product and buys nothing. So:
 *
 *   dictionary ──(tools/pull-packs.mjs, build time)──> assets/i18n/<code>.json
 *
 * English is not a pack. English is the markup: every translatable node ships
 * its English text in index.html, and a pack is an OVERLAY applied on top. That
 * means no flash of untranslated content, a working page with JS off, and real
 * English in the HTML for crawlers — none of which a fetch-first design gets.
 *
 * Language NAMES are never shipped. Intl.DisplayNames renders all 99 endonyms
 * from the platform, so there are no 99 strings here to go stale.
 */

const STORE_KEY = "makeme.lang";

/** Keys are `section.name`; `data-i18n-attr` carries `attribute:key` pairs. */
const NODE_SEL = "[data-i18n], [data-i18n-attr]";

export async function createI18n({ base = "assets/i18n" } = {}) {
  const manifest = await fetch(`${base}/locales.json`).then((r) => r.json());
  const byCode = new Map(manifest.locales.map((l) => [l.code, l]));

  // English lives in the DOM. Snapshot it before any pack overwrites it, so
  // switching back to English is a restore rather than another fetch.
  const source = new Map();
  for (const el of document.querySelectorAll(NODE_SEL)) {
    if (el.dataset.i18n) source.set(`${el.dataset.i18n}`, el.textContent);
    for (const pair of (el.dataset.i18nAttr ?? "").split(/\s+/).filter(Boolean)) {
      const [attr, key] = pair.split(":");
      source.set(`@${attr}:${key}`, el.getAttribute(attr) ?? "");
    }
  }

  const packs = new Map([["en", null]]); // null pack = use the DOM source
  let code = "en";
  let strings = null;

  /**
   * Pick a language: explicit ?lang= beats a remembered choice beats the
   * browser's own list. `navigator.languages` arrives as BCP-47 tags, so a
   * `pt-BR` visitor resolves to the `pt` pack rather than falling to English.
   */
  function detect() {
    const asked = new URLSearchParams(location.search).get("lang");
    if (asked && byCode.has(asked)) return asked;
    let saved = null;
    try { saved = localStorage.getItem(STORE_KEY); } catch { /* private mode */ }
    if (saved && byCode.has(saved)) return saved;
    for (const tag of navigator.languages ?? []) {
      if (byCode.has(tag)) return tag;
      const bare = tag.split("-")[0];
      if (byCode.has(bare)) return bare;
    }
    return "en";
  }

  async function load(next) {
    if (packs.has(next)) return packs.get(next);
    try {
      const res = await fetch(`${base}/${next}.json`);
      if (!res.ok) throw new Error(String(res.status));
      const pack = await res.json();
      packs.set(next, pack);
      return pack;
    } catch {
      // A language in the manifest with no pack on disk yet is an expected
      // state, not an error: coverage grows as the dictionary fills. Fall back
      // to the English already in the document.
      packs.set(next, null);
      return null;
    }
  }

  function apply() {
    for (const el of document.querySelectorAll(NODE_SEL)) {
      const key = el.dataset.i18n;
      if (key) el.textContent = strings?.[key] ?? source.get(key) ?? el.textContent;
      for (const pair of (el.dataset.i18nAttr ?? "").split(/\s+/).filter(Boolean)) {
        const [attr, k] = pair.split(":");
        const value = strings?.[k] ?? source.get(`@${attr}:${k}`);
        if (value != null) el.setAttribute(attr, value);
      }
    }
    const meta = byCode.get(code);
    document.documentElement.lang = code;
    document.documentElement.dir = meta?.dir ?? "ltr";
    document.dispatchEvent(new CustomEvent("i18n:change", { detail: { code, meta } }));
  }

  const api = {
    manifest,
    get code() { return code; },
    get locales() { return manifest.locales; },
    meta: (c = code) => byCode.get(c),

    /** Endonym, from the platform. `of()` returns the tag itself if unknown. */
    name(c) {
      try {
        return new Intl.DisplayNames([c], { type: "language" }).of(c) ?? c;
      } catch {
        return c;
      }
    },

    /** One string by key, with the DOM's English as the standing fallback. */
    t(key, fallback = "") {
      return strings?.[key] ?? source.get(key) ?? fallback;
    },

    /**
     * Plural-correct string. The pack stores one value per CLDR category
     * (`key.one`, `key.few`, `key.other`, …) and the category set travels with
     * the language in the manifest, because Arabic has six and Japanese has
     * one — carrying English's two into either is not a partial translation,
     * it is a broken one.
     */
    plural(key, n) {
      const cats = byCode.get(code)?.plurals ?? ["other"];
      let cat = "other";
      try {
        const picked = new Intl.PluralRules(code).select(n);
        if (cats.includes(picked)) cat = picked;
      } catch { /* unknown locale: `other` is always present */ }
      const raw = api.t(`${key}.${cat}`, api.t(`${key}.other`, ""));
      return raw.replace("{n}", new Intl.NumberFormat(code).format(n));
    },

    async set(next) {
      if (!byCode.has(next)) return;
      strings = await load(next);
      code = next;
      try { localStorage.setItem(STORE_KEY, next); } catch { /* private mode */ }
      apply();
    },
  };

  await api.set(detect());
  return api;
}
