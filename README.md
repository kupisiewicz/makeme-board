# makeme.

Twelve addresses, one machine.

```
makeme.website   makeme.codes    makeme.software  makeme.cloud
makeme.email     makeme.team     makeme.club      makeme.expert
makeme.agency    makeme.boutique makeme.support
```

The domain is the first half of a sentence; the visitor writes the second and
the machine makes the thing. One static page serves all twelve hostnames.

- **Product truth** — [PRODUCT.md](PRODUCT.md)
- **Identity** — [brand/BRAND.md](brand/BRAND.md)

## Run it

No build step, no dependencies. It is static files.

```bash
python3 -m http.server 4311
```

Then open <http://localhost:4311>. Add `?d=codes` to preview any destination
without editing `/etc/hosts`; without one, localhost behaves as the hub.

## How one page serves twelve domains

`assets/js/destinations.js` is the single source of truth. `resolveDestination()`
reads the public suffix off `location.hostname` and themes the document with one
attribute — `data-destination` on `<html>` — which repaints the lamp, the dial,
the status strip, the slot, and the specimen.

`makeme.club` is the hub: the wheel keeps turning through all twelve. Every
other hostname locks to its own noun after the arrival spin.

**Anything that differs per domain is a row in that file. A forked page is a
defect.**

## Build for deploy

```bash
node tools/build-domains.mjs
```

Writes `dist/makeme.<tld>/` for each hostname. The body, CSS and JS are
byte-identical across all twelve; only the `<head>` differs, because `<title>`,
the description, Open Graph tags and the canonical URL are read before any
JavaScript runs — by crawlers, by Slack and iMessage unfurls, and by the browser
tab during load. Deploy each directory to its own host as plain static files.

## Languages

Ninety-nine, from a shared translation dictionary service. That service treats
the dictionary as the system of record and language packs as **build
artifacts**, and explicitly rejects fetching translations at runtime. This site
follows that.

Both tools take the service's base URL, or the SQLite artifact it exports:

```bash
node tools/build-locales.mjs --db ../dictionary/i18n.db   # or --api <base url>
node tools/pull-packs.mjs --api <base url>
```

- `assets/i18n/locales.json` — the 99 languages, each with its CLDR plural
  categories and text direction (7 are RTL). Generated; do not hand-edit.
- `assets/i18n/<code>.json` — one pack per language. Generated.
- **English is not a pack.** English is the markup in `index.html`; a pack is an
  overlay on top of it. That is what gives the page real text with JS off, real
  text for crawlers, and no flash of untranslated content.
- Language *names* are never shipped — `Intl.DisplayNames` renders all 99
  endonyms from the platform.

Before `pull-packs` returns anything, `makeme` needs registering in the
service's `i18n_project` table with its target languages. Until then the page
runs on English plus the two packs committed here (`en`, `pl`).

## Before launch

- [ ] `GENERATE_ENDPOINT` in `assets/js/main.js` is empty. The slot currently
      says so out loud rather than faking a result. Point it at the real
      generator to make the form submit.
- [ ] Register the `makeme` project in the i18n dictionary, then run
      `tools/pull-packs.mjs`.
- [ ] Every example on the page is authored and labelled *Authored example — no
      customer, no live run*. Replace them with real runs when there are any.
      The footer's "what this page does not claim" note comes down at the same
      time, not before.
- [ ] `.codes` and `.boutique` are the spellings built here.

## Layout

```
index.html                  the one engine — English source text lives here
assets/css/tokens.css       design tokens + one lamp per destination
assets/css/base.css         reset, the terrazzo hall, typographic law
assets/css/board.css        the board, the dial, rows, sections
assets/js/destinations.js   the twelve, and hostname routing
assets/js/dial.js           the barrel picker — momentum, snap, addressing
assets/js/i18n.js           99-language runtime (packs are build artifacts)
assets/js/board.js          split-flap + section rendering
assets/js/specimens.js      authored demonstration output
assets/js/main.js           boot and wiring
tools/                      locale manifest, pack pull, per-domain build
```
