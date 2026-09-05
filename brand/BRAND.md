# makeme. — brand

The identity, written down. Everything here is implemented in
`assets/css/tokens.css` and `assets/js/destinations.js`; this document explains
*why*, so the next person does not undo it by accident.

---

## 1. The idea

**The address is the first half of a sentence. The visitor writes the second.**

`makeme.website` is not a brand name with a domain attached. It is an imperative
sentence that happens to be a URL, and the visitor completes it by arriving. No
competitor can copy this without owning the same twelve addresses.

Everything in this identity serves one job: make the visitor feel they already
started the request before they touched anything.

## 2. The wordmark

```
makeme.
```

Lowercase. Always. **The full stop is part of the mark** — it is simultaneously
the domain separator and the end of a sentence, and it is the only piece that
carries colour.

- Set in **Archivo**, `wdth 84–88`, `wght 760–780`, tracking `-0.03em` to
  `-0.045em`. Condensed and heavy: it has to hold its ground beside a noun three
  times its length.
- The word is always the neutral (warm white on the board, near-black on the
  hall). The dot is always the active destination's lamp.
- **The mark never carries the flap seam.** On a real board the printed header
  is whole and only the flapping cards are cut; the seam is how the object says
  *this part changes*. `makeme.` is the part that does not, so it stays solid
  while the noun beside it is cut through. See DESIGN.md for the mechanics.
- Never break the mark across lines. Never capitalise. Never add a tagline
  inside the lockup — the noun *is* the tagline.

### The lockup

`makeme.` + noun, on one line, one continuous sentence:

```
makeme.website     makeme.codes     makeme.boutique
```

The twelve nouns are set at **different width-axis values so they occupy the
same optical slot** (`assets/js/dial.js` computes this from word length —
"codes" widens to ~125, "boutique" condenses to ~64). This is not a styling
flourish: it is what a real destination board does, and it is why Archivo's
variable width axis is in this design at all. A static font cannot do it.

## 3. The world: a departure board in a station hall

The identity is a **Solari split-flap departure board hanging in a terrazzo
hall.** You name a destination, the board commits, and the machine takes you
there. Twelve destinations on one board.

The single most important rule: **the page ground is the hall, not the board.**
The instrument is dark because it is painted steel in a lit room, and it hangs
in daylight. Invert that — make the page dark — and this collapses into the
generic dark-AI-product hero it was built to refuse.

Load-bearing, not decoration:

| Element | Why it cannot be simplified away |
|---|---|
| The flap seam through every changing glyph | It is the single most identifying feature of a split-flap board. Without it the board is only a dark panel |
| Terrazzo aggregate on the ground | Flatten it to a solid grey and the hall stops being a place. It ships as a real raster tile (`assets/brand/terrazzo.png`) because the CSS-gradient version resolved to a flat field — a material you can only see in the stylesheet is not shipped |
| Milled aluminium hairlines | The only thing that makes the chassis read as metal rather than a dark div |
| Two visible mounts above the board | Without them it is pasted on, not hung |
| The recessed well | Depth is what separates a board from a card |

## 4. Colour

### The fixed palette

| Token | Value | Role |
|---|---|---|
| `--hall` | `#D9D6CE` | Terrazzo ground. The page. |
| `--hall-lit` / `--hall-deep` | `#E4E1D9` / `#C3BFB5` | Skylight above, shadow below |
| `--chassis` | `#101418` | Graphite painted steel |
| `--chassis-deep` | `#080B0D` | The recessed well |
| `--card` / `--card-lit` | `#191E24` / `#242B33` | A flap card at rest / in the window |
| `--legend` | `#F0EBE0` | Painted legend. **Never `#fff`** — paint is not paper. |
| `--alu` / `--alu-lit` | `#7F858B` / `#C2C8CD` | Milled hairline and its lit bevel |
| `--ink` | `#16130F` | Type on the hall |

### The twelve lamps

One colour is lit at a time. **The active destination's lamp is the only place
its colour appears on the page** — the lit centre band, the row indicator, the
MAKE IT key, the caret, focus rings. Never a page wash, never a gradient hero,
never a coloured section background.

| Destination | Lamp | Makes |
|---|---|---|
| `makeme.website` | `#FFB020` amber | a website |
| `makeme.codes` | `#5CE07A` signal green | code |
| `makeme.software` | `#9D8CFF` violet | software |
| `makeme.cloud` | `#4CC3FF` sky | infrastructure |
| `makeme.email` | `#FF8A3D` orange | an email |
| `makeme.team` | `#FF6FA5` pink | a team |
| `makeme.club` | `#E56BFF` magenta | a club |
| `makeme.expert` | `#FFD23F` gold | an expert |
| `makeme.agency` | `#FF5C5C` red | an agency |
| `makeme.boutique` | `#FF9EB5` rose | a boutique |
| `makeme.services` | `#A9E34B` lime | a service business |
| `makeme.support` | `#2FD9C5` teal | support |

Amber is the house default and the hub's resting colour — it is what a real
Solari lamp burns when a service is on time.

**One at a time, always.** Where many destinations appear together — the
destination rows, the departures list, the footer — every dot is neutral, and
colour arrives only on the active row or on hover. Lighting the whole family at once
spends the rule that makes any of them mean something. Progress state uses
`--signal` `#B07208`, a fixed state colour that belongs to no destination.

Changing destination is **one attribute**: `data-destination` on `<html>`.
Nothing else in the codebase should know a destination's colour.

## 5. Type

Two families. No third.

- **Archivo** (variable, `wdth 62–125`, `wght 100–900`) — the wordmark, the
  nouns, headings, and body. Chosen for the width axis, which the lockup
  genuinely needs.
- **Martian Mono** (variable) — the board's technical legend and nothing else:
  destination codes, status words, times, step numbers, language codes, the slot
  prefix. Uppercase, `letter-spacing: 0.14em`. If a label is mono, it is
  machine-read information; if it is not, it is prose. Do not blur that line.

Headings set `wdth 92`, `wght 680`, tracking `-0.022em`. Body sets `wdth 100`,
`wght 400`.

## 6. Motion: the machine indexes

Nothing on this page cross-fades. Parts index into position: fast departure,
slight overshoot, settle.

- `--index: 380ms cubic-bezier(.18,.92,.24,1.04)` — the overshoot is in the
  curve. That overshoot is the whole difference between a wheel and an animation
  of a wheel.
- `--flap: 58ms linear` — split-flap character rate.

### The dial (the signature interaction)

The nouns on a 3D barrel, `makeme.` held still beside it. Geometry is derived
from the count in `dial.js` — `360/n` between neighbours, radius
`(h/2)/tan(π/n)` — and written into CSS custom properties. Nothing hardcodes
how many there are.

It behaves like an iOS picker because it is one:

- pointer drag with real momentum, flick carry, and snap
- wheel and touch
- keyboard: arrows step, Home/End jump, **and a letter key goes straight to that
  noun** — every destination is addressable, not merely scrollable
- hover pauses; scrolling the board off screen stops it entirely
- the fog belongs to the **glass in front of the wheel**, one GPU-composited
  element — never a per-item `filter`, which would cost a blur per noun every frame

**The arrival.** On load the barrel spins two full turns and lands on this
hostname's noun. On a product domain it then locks: the visitor watches every
sibling roll past before their own claims the board. On `makeme.club` (the hub)
it keeps idling, one stop every 2.4 s.

**Reduced motion.** The wheel does not turn. Every noun stays present and
readable, and the destination changes with a hard cut. The information survives;
only the movement goes.

## 7. Voice

Plain, exact, and unafraid of saying what the product will not do.

- Second person. Short sentences. No exclamation marks.
- Name the mechanism, never the adjective: "Get working code, its tests, and the
  reason it is written that way" — not "powerful, intelligent code generation".
- **Claim nothing that has not happened.** There are no customers, ratings,
  prices or benchmarks yet, and the site says so in its own footer. Every
  demonstration is authored and carries the `.synthetic` label.
- The specimens deliberately include the machine refusing to answer. A product
  that shows its limits is the one worth trusting.

## 8. The mark in other contexts

- **Favicon** (`assets/brand/favicon.svg`): the board reduced to three flap
  rows, the middle one lit, with the amber dot beside it. Never the letter M.
- **Against photography or an unknown ground:** put the mark on a graphite plate
  rather than knocking it out. The board is the container; that is the point.
- **One-colour reproduction:** the dot may take the ink colour. The dot is never
  omitted.

## 9. Hard rules

1. The full stop is never dropped, never recoloured to match the word, never
   spaced away from it. **The wordmark never flips.** In right-to-left
   languages the mark stays left-to-right and only the translated noun is
   isolated (`<bdi>`), or the dot lands on the wrong side of the brand.
2. The page ground is light. The board is dark. Not the other way round.
3. One lamp lit at a time, and only on illuminated edges.
4. Anything that differs per domain is a row in `destinations.js`. A forked page
   is a defect.
5. Mono means machine-read. Everything else is prose.
6. Motion overshoots and settles. Nothing fades.
7. The seam cuts what changes, and only what changes. Never the wordmark.
8. No invented proof, ever.
