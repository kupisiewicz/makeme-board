# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Plain static HTML/CSS/JS (user decision, 2026-09-04). No framework, no client
bundler. One `index.html` engine serves all twelve hostnames; a small Node
script in `tools/` generates the per-domain and per-language static artifacts at
build time. Deploy target is static hosting per domain.

## Users

Someone who wants a specific thing made and does not want to learn a tool to get
it. They arrive by typing the thing they want as a domain — `makeme.website`,
`makeme.codes`, `makeme.email` — so they land already halfway through their own
sentence. They are not evaluating a platform; they have one job and expect the
first screen to start it.

## Product Purpose

The visitor states what they want and AI generates the real deliverable live.
Not a brief, not a quote, not a waitlist — the artifact itself. Success is a
visitor who arrives, types one line, and leaves with the thing they came for.

## Positioning

**The domain is the first half of the prompt.** Twelve addresses, each one an
imperative sentence the user completes: `makeme.website` → "make me a website."
No competitor can copy this without owning the same addresses. The family is one
engine, not twelve products: the same page, the same account, the same
generation pipeline, themed and worded by hostname.

## Operating Context

- Twelve live hostnames, one codebase, hostname-driven configuration:
  `makeme.website`, `makeme.codes`, `makeme.software`, `makeme.cloud`,
  `makeme.email`, `makeme.team`, `makeme.club`, `makeme.expert`,
  `makeme.agency`, `makeme.boutique`, `makeme.services`, `makeme.support`.
- `makeme.club` is the family hub: it presents all twelve. Every other hostname
  is a product surface locked to its own noun.
- Visitors arrive from a typed URL as often as from search, so the first
  viewport is frequently the only viewport.

## Capabilities and Constraints

- Live AI generation is the mechanism. The primary action is a prompt input, not
  a contact form.
- One HTML document must render every domain. Domain identity (noun, accent
  colour, copy, examples, OG image) is data, not forked markup.
- **i18n**: translations come from a shared translation dictionary service
  (`GET /v1/i18n/pack/:project/:lang`, `GET /v1/i18n/languages`,
  `GET /v1/i18n/coverage/:project`). That service treats the dictionary as the
  system of record and language packs as **build artifacts** — runtime fetching
  of translations is explicitly rejected policy. The site therefore ships
  generated static packs.
- The dictionary carries CLDR plural categories per language. The language list
  must be read from the service manifest, never hardcoded to a count.
- Right-to-left languages are in scope and must flip document direction.
- Undecided: pricing, account model, generation limits, and which model powers
  each domain. Nothing in the site may state a price or a quota.

## Brand Commitments

- Name is `makeme.` — lowercase, and the full stop is part of the wordmark. It
  is simultaneously a domain separator and the end of a sentence.
- **Required signature interaction**: the nouns after `makeme.` roll on a
  vertical barrel/cylinder the way an iOS picker wheel does, while `makeme.`
  itself stays fixed. The user pinned this; it is not optional and not
  substitutable with a fade or a typewriter effect.
- References the user named: `layla.ai/pl` for page simplicity, `napkin.ai` for
  narrative sequencing. These are calibration for *simplicity and storytelling*,
  not a mandate to reproduce either look.

## Evidence on Hand

Nothing yet. No customers, no usage numbers, no testimonials, no press, no
benchmarks, no launched product. Sample generated outputs shown on the page are
authored demonstration material and must be labelled as such. The site must not
state a customer count, a rating, a price, a funding claim, or a named
testimonial until real ones exist.

## Product Principles

1. **The address is the argument.** Every surface should make the visitor feel
   they already started the sentence by arriving.
2. **One engine, twelve faces.** Anything that differs per domain is a data row.
   A forked page is a defect.
3. **Show the artifact, not the promise.** Demonstrate generated output; never
   describe it in adjectives.
4. **The first viewport is the whole funnel.** Typed-URL visitors may never
   scroll.
5. **Claim nothing that has not happened.** No invented proof, ever.

## Accessibility & Inclusion

The signature motion must honour `prefers-reduced-motion` with a non-moving
equivalent that still communicates every noun. Text stays selectable and
translatable. RTL languages get correct document direction and mirrored layout.
