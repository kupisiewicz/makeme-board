# Design system — makeme.

Recorded from the built page, not from intention. Where this and the code
disagree, the code is right and this file is stale.

Identity rationale lives in [brand/BRAND.md](brand/BRAND.md); this is the
implementation record.

## World

A Solari split-flap departure board hanging in a terrazzo station hall.
**The page ground is the hall; the board is the object in it.** Light page, dark
instrument — inverting that lands the page in the generic dark-AI-hero it was
built to refuse.

## Tokens — `assets/css/tokens.css`

### Surfaces

| Token | Value | Used for |
|---|---|---|
| `--hall` | `#D9D6CE` | page ground |
| `--hall-lit` | `#E4E1D9` | top of the gradient; rail background |
| `--hall-deep` | `#C3BFB5` | bottom of the gradient; footer |
| `--hall-line` | `#B3AEA3` | every hairline rule on the hall |
| `--chassis` | `#101418` | board body, rail chip, language board |
| `--chassis-lit` | `#1B2128` | the board's top bevel |
| `--chassis-deep` | `#080B0D` | the recessed well |
| `--card` / `--card-lit` | `#191E24` / `#242B33` | strip cells |

### Marks

| Token | Value | Used for |
|---|---|---|
Every value below clears 4.5:1 on the surface it is used on. The first pass set
`--legend-faint` to `#4E555D` (2.22:1 on `--card`) and `--ink-faint` to
`#8D877B` (2.46:1 on `--hall`); both read as "quiet" and were simply
unreadable. Quiet is a hue and weight decision, not a contrast one.

| Token | Value | Used for |
|---|---|---|
| `--legend` | `#F0EBE0` | type on the board. **Never `#fff`** |
| `--legend-dim` | `#AEB5BD` | secondary type on the board (7.9:1) |
| `--legend-faint` | `#8B939C` | strip keys, slot prefix, placeholder (5.3:1) |
| `--alu` / `--alu-lit` | `#7F858B` / `#C2C8CD` | selection-window rules, mounts |
| `--ink` | `#16130F` | type on the hall |
| `--ink-dim` | `#5A554C` | body prose on the hall (5.1:1) |
| `--ink-faint` | `#55504A` | remarks, legends, synthetic labels (5.5:1) |

### The lamp

`--lamp` is set by `[data-destination]` on `<html>`, one rule per destination.
One per destination, listed in BRAND.md §4. **It is the only colour on the page**, and
appears only on: the lit dial word, the selection-window wash, the strip status
dot, the MAKE IT key, the caret, `::selection`, focus rings, the active row
indicator, and the wordmark's full stop. Never a background field, never a
gradient.

**A list never restates the whole family.** Departure rows, the destination rows and
the footer links all show many destinations at once, so their dots are
`--ink-faint`; colour arrives on the active row and on hover, one at a time.
`--row-lamp` is the per-row value used for exactly that. An earlier pass lit all
all of them simultaneously — including five "shipped" dots in five hues that meant
the same thing — which spends the contract's central rule on decoration.

`--signal` `#B07208` is a STATE colour, not a destination one: the board's
in-progress lamp. Fixed on purpose, so a list of past runs neither restates
every destination colour nor flickers as the wheel turns.

## Type

| Role | Face | Settings |
|---|---|---|
| Wordmark | Archivo | `wdth 84–88`, `wght 760–780`, `-0.03em`…`-0.045em` |
| Dial nouns | Archivo | `wdth` computed per word (64–125), `wght 780` |
| Headings | Archivo | `wdth 92`, `wght 680`, `-0.022em` |
| Body | Archivo | `wdth 100`, `wght 400`, `line-height 1.55` |
| `.legend` | Martian Mono | `wght 500`, `0.14em`, uppercase |

Scale is a fluid `--step--1`…`--step-4`. The lockup has its own token,
`--lockup: clamp(2.4rem, 0.5rem + 7vw, 7.4rem)`, so `makeme.` and the dial can
never drift apart across breakpoints.

**Mono means machine-read.** Codes, statuses, times, step numbers, language
codes, the slot prefix. Everything else is prose. Do not blur this.

## Components

- **`.board`** — chassis plate, `--radius-board` 8px, 1px `#2B333B` border, two
  `.board__mount` posts above it, layered shadow onto the hall. Contains
  `.board__well`, the recessed area.
- **The flap seam** — every character on a Solari board is split across two
  flaps, so a dark cut runs through the middle of every glyph. Drawn by clipping
  a gradient to the letterforms (`background-clip: text` behind `@supports`), so
  it crosses the glyphs only and the words keep floating on the well instead of
  sitting in boxes. `--seam` `#05080A`; `--seam-w` is `max(1.5px, 0.019em)` on
  the dial and a `0.5px` hairline on the strip, where the display floor was ~11%
  of the cap height and visibly chewed 13px mono.
  **The rule it encodes: the seam marks what can CHANGE.** A real board's
  printed header has no seam; only the flapping cards do. So `makeme.` stays
  whole, and the nouns and strip values — the things that flip — carry the cut.
  Scope is the board only: the destination rows sit on the hall and are the
  printed list, not the mechanism.
  Two traps, both hit during the build: the `@supports` block must come **last**
  in the file and restate `.dial__item[data-current]` and `.strip__val--lamp`,
  or later rules of equal specificity re-apply an opaque fill and the seam is
  computed correctly and never seen; and any pseudo-element painted with
  `currentColor` (the status dot) must restate its colour, since `currentColor`
  is now transparent.
- **`.dial`** — the nouns on a 3D barrel. Step and radius are computed from the
  noun count in `dial.js` (`360/n`, `(h/2)/tan(π/n)`) and written onto the
  element as `--dial-step` and `--dial-r-mult`; the values in `board.css` are
  fallbacks only. Hardcoding the count broke the barrel into a cone the first
  time a domain was added.
  `overflow: hidden` is the housing. Fog is `.dial__glass` (one backdrop-filtered
  element, never per-item filters); the window is `.dial__window`.
- **`.strip`** — auto-fit grid of `.strip__cell`, `minmax(150px, 1fr)`. Collapses
  to one column on narrow frames.
- **`.slot`** — the primary action. `.slot__prefix` (mono, the domain) +
  `.slot__input` + `.slot__go`. Stacks vertically under 720px.
- **`.row`** — the shared row grammar. Three variants: `--departure`, `--dest`,
  `--step`. **Every row carries a right-hand legend column** (status / makes /
  remark); dropping it leaves an underlined void on wide screens.
- **`.specimen`** — dark bar, manifest grid, mono excerpt, honest footer label.
  Carries its own `--lamp` inline so it never wears another destination's colour.
- **`.row--tongue`** — the language section. Board rows, like every other
  section; it was a twelve-up grid of identical bordered cards, which is the
  lazy container standing in for structure. The wordmark inside it is `dir="ltr"`
  with the translated noun in a `<bdi>`: setting direction on the whole string
  reversed the Latin mark too, so Arabic rendered `.makeme` with the full stop —
  the one character that is the brand — on the wrong side.
- **`.langboard`** — `<dialog>`, 99 entries, backdrop-click to close.
- **`.synthetic`** — the label on every authored example. Its diamond is a
  rotated bordered box in CSS, not a Unicode glyph.

## Motion

`--index: 380ms cubic-bezier(.18,.92,.24,1.04)` (overshoot then settle),
`--index-fast: 190ms`, `--flap: 58ms`.

**Nothing cross-fades.** Parts index into position. Values change by split-flap
(`flapTo` in `board.js`).

Three rules the build learned the hard way:

1. **The board commits as one.** The lamp, the strip, the slot prefix, the
   placeholder, the specimen and the language grid all change together, 160ms
   after the wheel stops — never live. Updating them live had the strip mid-flap
   on one destination while the prefix already read another.
2. **Pausing the idle roll is not cancelling motion.** `dial.pause()` clears the
   idle timer; `dial.stop()` also cancels the animation frame. Using `stop()`
   from the viewport observer killed the arrival spin before it could land.
3. **A background tab freezes `requestAnimationFrame`.** `arrive()` checks
   `document.hidden` and lands instantly instead of spinning, or the wheel sits
   on the wrong noun until the visitor gives up.
4. **A locked barrel stops advertising itself as a control.** `arrive(lock)`
   drops `tabindex`, `role="listbox"`, `aria-activedescendant` and the options'
   `role`/`aria-selected` together. Dropping only `tabindex` left an
   unfocusable listbox on every product domain. The `aria-live` noun sits
   outside the `<h1>`; nested inside, it joined the heading's accessible name.

Reduced motion: the wheel does not turn, every noun stays readable, the
destination changes with a hard cut.

## Layout

- Page gutter `--rail: clamp(1.1rem, 0.5rem + 2.5vw, 3.5rem)`.
- Content max-width 1240px; prose measured at `62ch`.
- `.section` carries **top padding only** — two adjacent sections each with a
  full block of padding produced double the intended gap.
- `.section__head` is unmeasured so the section rule spans the full width; only
  `h2` and `p` inside it are measured.
- **No eyebrow kickers.** Five `section__kicker` labels sat above the headings
  and drew the section rule with a `::after`. The eyebrow is a banned pattern
  and nobody reads it; the rule was the only part doing work, so a plain
  `border-top` on `.section` does it now. The three footer labels stay — those
  label lists, they are not eyebrows.
- Breakpoints: 900px (step remarks drop), 720px (lockup stacks, slot stacks,
  destination legends move under the name).

## Rules

1. Anything that differs per domain is a row in `assets/js/destinations.js`.
2. One lamp lit at a time, on illuminated edges only. A list of destinations is
   neutral; colour arrives on the active one.
3. `--legend` on the board, `--ink` on the hall. Never `#fff`. Every text token
   clears 4.5:1 on its own surface.
4. Mono is machine-read information.
5. Motion overshoots and settles.
6. Every authored example carries `.synthetic`, and **the board never states a
   capability the machine does not have** — the status reads "Not connected"
   until `GENERATE_ENDPOINT` is set, in the markup as well as at runtime, so it
   is honest with JavaScript off too.
7. No eyebrow kickers above headings.
8. The material is shipped, not declared. `body::after` tiles
   `assets/brand/terrazzo.png` — a real 480px seamless raster at 165px, 0.42
   opacity, multiply. Nine radial-gradient chips were there first and resolved
   to a flat field at every viewport: the tokens claimed a floor the page did
   not have. Judge this in a screenshot, never in the stylesheet.
9. No decorative grid overlays. An earlier pass drew fixed vertical "expansion
   joints" every 25vw; they read as a generated-UI grid, and a joint that stays
   put while the page scrolls is not a floor.
10. The browser's own surfaces are themed too — `::selection` and scrollbars.
