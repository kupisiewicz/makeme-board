#!/usr/bin/env node
/**
 * Emit one deployable directory per hostname.
 *
 *     node tools/build-domains.mjs            # → dist/makeme.website, dist/makeme.codes, …
 *     node tools/build-domains.mjs --only website,codes
 *
 * WHY THIS EXISTS AT ALL, given the page already themes itself from
 * `location.hostname`: the runtime switch handles everything a visitor sees,
 * but it cannot help the things that are read before any JavaScript runs —
 * <title>, the meta description, Open Graph tags, the theme colour, and the
 * canonical URL. Crawlers, link unfurls in Slack and iMessage, and the browser
 * tab during load all read the served HTML. So the ONE engine gets its head
 * rewritten per host, and nothing else is duplicated.
 *
 * The body, the CSS, and the JS are byte-identical across all of them. If you
 * find yourself adding a second per-domain difference here, it belongs in
 * assets/js/destinations.js instead.
 */
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { DESTINATIONS } = await import(pathToFileURL(resolve(ROOT, "assets/js/destinations.js")));

const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, all) =>
    a.startsWith("--") ? [[a.slice(2), all[i + 1]?.startsWith("--") ? true : all[i + 1]]] : []
  )
);

const only = args.only ? String(args.only).split(",").map((s) => s.trim()) : null;
const targets = DESTINATIONS.filter((d) => !only || only.includes(d.id));

const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
const dist = resolve(ROOT, "dist");
rmSync(dist, { recursive: true, force: true });

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

for (const d of targets) {
  const host = `makeme.${d.tld}`;
  const title = `${host} — ${d.makes}, made`;
  // The line already reads as a sentence about this destination, so it doubles
  // as the description rather than inventing a second piece of marketing copy.
  const description = d.line;

  const out = html
    .replace(/<html lang="en" dir="ltr" data-destination="[^"]*">/, `<html lang="en" dir="ltr" data-destination="${d.id}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(description)}">`)
    .replace(
      /<meta property="og:type" content="website">/,
      `<meta property="og:type" content="website">\n<meta property="og:url" content="https://${host}/">\n<link rel="canonical" href="https://${host}/">`
    );

  const dir = resolve(dist, host);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "index.html"), out);
  cpSync(resolve(ROOT, "assets"), resolve(dir, "assets"), { recursive: true });
  console.log(`  ${host.padEnd(20)} ${title}`);
}

console.log(`\n${targets.length} hostname${targets.length === 1 ? "" : "s"} written to dist/.`);
