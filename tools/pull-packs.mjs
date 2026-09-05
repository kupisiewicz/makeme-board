#!/usr/bin/env node
/**
 * Pull language packs from a shared translation dictionary service.
 *
 *     node tools/pull-packs.mjs --api <base url>                  # all languages
 *     node tools/pull-packs.mjs --api <base url> --langs pl,de,ar
 *
 * DOCTRINE. That service treats the dictionary as the system of record and
 * language packs as BUILD ARTIFACTS, and explicitly rejects the app fetching
 * translations at runtime: it adds a network dependency to every product and
 * buys nothing. So this runs at build time and commits its output.
 *
 * English is never pulled. English is the markup in index.html — that is what
 * makes the page work with JS off, gives crawlers real text, and removes any
 * flash of untranslated content. A pack is an overlay on top of it.
 *
 * ENDPOINTS USED
 *   GET /v1/i18n/languages           the language list + CLDR plural categories
 *   GET /v1/i18n/pack/:project/:lang the whole pack, ETag'd
 *   GET /v1/i18n/coverage/:project   per-language counts
 *
 * REGISTER THE PROJECT FIRST. The dictionary keys packs by project slug; until
 * `makeme` exists in i18n_project with its target_langs, every pack comes back
 * empty. That is a one-time write on the service side, not something this
 * script should do behind your back.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT = "makeme";
const I18N = resolve(ROOT, "assets/i18n");

const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, all) =>
    a.startsWith("--") ? [[a.slice(2), all[i + 1]?.startsWith("--") ? true : all[i + 1]]] : []
  )
);

const api = String(args.api ?? "").replace(/\/$/, "");
if (!api) {
  console.error("Need --api <base url> of the dictionary service.");
  process.exit(1);
}

const manifestPath = resolve(I18N, "locales.json");
if (!existsSync(manifestPath)) {
  console.error("assets/i18n/locales.json is missing. Run tools/build-locales.mjs first.");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const wanted = args.langs
  ? String(args.langs).split(",").map((s) => s.trim())
  : manifest.locales.map((l) => l.code).filter((c) => c !== "en");

// The English pack is the key inventory: a target pack missing any of these
// keys falls back to the English in the DOM, which is correct but silent, so
// the coverage line below makes the gap visible.
const keys = Object.keys(JSON.parse(readFileSync(resolve(I18N, "en.json"), "utf8")));

let written = 0;
let skipped = 0;

for (const lang of wanted) {
  if (lang === "en") continue;
  let pack;
  try {
    const res = await fetch(`${api}/v1/i18n/pack/${PROJECT}/${lang}`);
    if (res.status === 404) { skipped++; continue; }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    pack = await res.json();
  } catch (err) {
    console.warn(`  ${lang}: ${err.message} — left as is`);
    skipped++;
    continue;
  }

  // Keep only keys this site actually uses, and drop empties so the runtime
  // falls through to English rather than rendering a blank element.
  const trimmed = {};
  for (const k of keys) if (pack[k]) trimmed[k] = pack[k];

  const have = Object.keys(trimmed).length;
  if (!have) { skipped++; continue; }

  writeFileSync(resolve(I18N, `${lang}.json`), JSON.stringify(trimmed, null, 2) + "\n");
  written++;
  const pct = Math.round((have / keys.length) * 100);
  console.log(`  ${lang.padEnd(8)} ${String(have).padStart(3)}/${keys.length} keys  ${pct}%${pct < 100 ? "  (rest falls back to English)" : ""}`);
}

console.log(`\n${written} packs written, ${skipped} skipped, ${keys.length} keys per pack.`);
