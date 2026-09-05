#!/usr/bin/env node
/**
 * Build assets/i18n/locales.json — the language manifest the site ships.
 *
 * SOURCE OF TRUTH is a shared translation dictionary service. Two ways in, both
 * producing the identical shape:
 *
 *   1. Live service (preferred in CI):
 *        node tools/build-locales.mjs --api <dictionary service base url>
 *      hits GET /v1/i18n/languages.
 *
 *   2. The SQLite artifact that service exports:
 *        node tools/build-locales.mjs --db ../dictionary/i18n.db
 *
 * WHY A BUILD STEP AND NOT A RUNTIME FETCH: that service treats the dictionary
 * as the system of record and language packs as *build artifacts*, and
 * explicitly rejects "the app fetches its translations at runtime" — it adds a
 * network dependency to every product and buys nothing. We follow that.
 *
 * Language NAMES are deliberately absent from this file. Intl.DisplayNames in
 * the browser renders every endonym for free; shipping 99 hand-kept names would
 * be 99 strings that go stale. See assets/js/i18n.js.
 */
import { writeFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Scripts written right-to-left. CLDR carries this, but only behind
// Intl.Locale#textInfo, which is not available in Node everywhere yet and is
// still missing in older Safari — so the manifest states it explicitly and the
// browser never has to guess.
const RTL = new Set(["ar", "arz", "fa", "he", "ur", "yi", "shu", "ckb", "ps", "sd", "ug"]);

const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, all) =>
    a.startsWith("--") ? [[a.slice(2), all[i + 1]?.startsWith("--") ? true : all[i + 1]]] : []
  )
);

/** Rows in, normalised manifest out. One shape, whichever source produced it. */
function normalise(rows) {
  return rows
    .map((r) => ({
      code: r.code,
      // CLDR plural categories. Arabic has six, Polish three, English two,
      // Japanese one. A pack that carries English's two into Arabic is not
      // partially translated, it is broken — so this travels with the language.
      plurals: (Array.isArray(r.plurals) ? r.plurals : String(r.plurals ?? "other").split(","))
        .map((s) => s.trim())
        .filter(Boolean),
      dir: RTL.has(r.code) ? "rtl" : "ltr",
      region: r.region ?? null,
      family: r.family ?? null,
      // Speakers, in millions. Arrives as text from SQLite; the sort below is
      // numeric or the manifest orders "9" above "85".
      speakers: r.speakers_m == null ? null : Number(r.speakers_m),
    }))
    .sort((a, b) => (b.speakers ?? -1) - (a.speakers ?? -1) || a.code.localeCompare(b.code));
}

let rows;
if (args.api) {
  const res = await fetch(`${String(args.api).replace(/\/$/, "")}/v1/i18n/languages`);
  if (!res.ok) throw new Error(`GET /v1/i18n/languages → ${res.status}`);
  rows = await res.json();
} else if (args.db) {
  const sql = `SELECT l.code,
       replace(replace(l.plural_categories,'{',''),'}','') AS plurals,
       t.region, t.family, t.speakers_m
FROM i18n_locale l LEFT JOIN i18n_language_taxonomy t ON t.code = l.code;`;
  rows = JSON.parse(execFileSync("sqlite3", ["-json", String(args.db), sql], { encoding: "utf8" }));
} else {
  // Offline fallback: the raw dump checked in beside this script.
  rows = JSON.parse(readFileSync(resolve(ROOT, "assets/i18n/_locales.raw.json"), "utf8"));
}

const locales = normalise(rows);
if (!locales.some((l) => l.code === "en")) throw new Error("manifest has no source language 'en'");

writeFileSync(
  resolve(ROOT, "assets/i18n/locales.json"),
  JSON.stringify({ source: "shared i18n dictionary", count: locales.length, locales }, null, 0) + "\n"
);
console.log(`locales.json → ${locales.length} languages, ${locales.filter((l) => l.dir === "rtl").length} RTL`);
