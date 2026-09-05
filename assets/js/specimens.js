/**
 * SPECIMENS — what comes out of the machine.
 *
 * Every one of these is AUTHORED DEMONSTRATION MATERIAL. There is no launched
 * product behind them, no customer, and no benchmark (PRODUCT.md, Evidence on
 * Hand). Wherever they render, the page says so in plain words.
 *
 * They are shaped as a MANIFEST — the list of artifacts a run produced, plus
 * one real excerpt — rather than as a fake screenshot. A departure board tells
 * you what is on the train; it does not paint a picture of the journey. This
 * also keeps the page honest: a manifest is a description of work, while a
 * mocked-up dashboard would be a picture of a product that does not exist.
 */

export const SPECIMENS = {
  website: {
    ask: "a one-page site for my ceramics studio — warm, quiet, a shop and a kiln diary",
    manifest: [
      ["index.html", "6 sections · hero, kiln diary, shop, about, visit, contact"],
      ["shop/", "12 pieces · stock, variants, checkout"],
      ["assets/", "9 images, cropped and compressed · 214 KB total"],
      ["content.pl.json", "full Polish translation"],
    ],
    excerptLabel: "hero copy, as written",
    excerpt: `Studio Warsztat

We throw stoneware in a back yard in Kazimierz and
fire it twice a month. The kiln decides what survives.

Everything here came out of the last opening.
When a piece sells, it is gone.

        [ See what survived → ]`,
  },

  codes: {
    ask: "a Python script that renames photos into folders by EXIF date",
    manifest: [
      ["sort_by_exif.py", "94 lines · argparse CLI"],
      ["test_sort_by_exif.py", "7 tests · covers missing EXIF, DST, collisions"],
      ["README.md", "install, usage, and why mtime is not trusted"],
    ],
    excerptLabel: "sort_by_exif.py — the part that matters",
    excerpt: `<span class="c"># Files without EXIF are the whole problem: a scanner or a</span>
<span class="c"># screenshot has none, and mtime lies after any copy. Those go</span>
<span class="c"># to _undated/ rather than to a wrong year, which is silent.</span>
<span class="k">def</span> taken_at(path: Path) -> date | <span class="k">None</span>:
    exif = Image.open(path).getexif()
    raw = exif.get(TAG_DATETIME_ORIGINAL) <span class="k">or</span> exif.get(TAG_DATETIME)
    <span class="k">if</span> <span class="k">not</span> raw:
        <span class="k">return</span> <span class="k">None</span>
    <span class="k">return</span> datetime.strptime(raw, <span class="s">"%Y:%m:%d %H:%M:%S"</span>).date()`,
  },

  software: {
    ask: "an invoicing app for a two-person studio, with VAT and a client list",
    manifest: [
      ["4 screens", "invoices, one invoice, clients, settings"],
      ["auth", "email link, two seats"],
      ["schema.sql", "6 tables · invoice numbering is gapless per year"],
      ["export", "PDF and JPK-compatible XML"],
    ],
    excerptLabel: "the decision it wrote down",
    excerpt: `Invoice numbers are allocated in a transaction, not from
a counter in application code.

Polish VAT invoicing requires an unbroken sequence per
year. Two people issuing at once on a naive counter
produces a duplicate or a gap, and both are findings in
an audit. The number is taken with SELECT ... FOR UPDATE
against a per-year row, so concurrency waits instead of
colliding.

Cost: one row lock per issue. Worth it.`,
  },

  cloud: {
    ask: "Postgres and object storage that survives losing a region",
    manifest: [
      ["main.tf", "2 regions · eu-central-1 primary, eu-west-1 standby"],
      ["postgres.tf", "streaming replica · RPO 60s, promotion runbook"],
      ["storage.tf", "cross-region replication, versioning on"],
      ["FAILURE.md", "4 failure modes, each with what breaks first"],
    ],
    excerptLabel: "FAILURE.md — the honest part",
    excerpt: `<span class="k">## What this does NOT survive</span>

<span class="c">A bad migration.</span> Replication is faithful: it copies the
mistake to the standby in under a second. Point-in-time
recovery covers this, failover does not.

<span class="c">A credentials leak.</span> Both regions trust the same IAM
role. Rotating is a separate runbook.

<span class="c">Losing eu-central-1 mid-write.</span> Up to 60s of committed
transactions are gone. That is the RPO you asked for.
Synchronous replication removes it and adds ~14ms to
every write.`,
  },

  email: {
    ask: "a launch note to 400 beta users. No hype, one link.",
    manifest: [
      ["3 subject lines", "tested for length in Gmail and Apple Mail"],
      ["body.txt", "plain text, 96 words"],
      ["body.html", "table layout · renders in Outlook 2016"],
      ["preheader", "set, so it is not the first line of the body"],
    ],
    excerptLabel: "the one that reads best",
    excerpt: `Subject:  We opened the doors

You have had an account for eleven weeks and have not
been able to do very much with it. That is on us.

It works now. Everything you made during the beta is
still there, and the parts that were broken when you
last looked are the parts we spent the eleven weeks on.

There is no launch offer and nothing expires.

  → makeme.email/in

If it is still broken, reply to this. It comes to us.`,
  },

  team: {
    ask: "a researcher, an editor and a fact-checker that publish a weekly brief",
    manifest: [
      ["researcher", "gathers · 40 sources/week, dedupes by claim"],
      ["editor", "drafts · house voice, 700 words hard cap"],
      ["fact-checker", "blocks · every number needs a source or it is cut"],
      ["handoff", "checker can return to researcher, twice, then it ships short"],
    ],
    excerptLabel: "the rule that makes it work",
    excerpt: `The fact-checker can VETO. The editor cannot overrule it.

A team of agents that can all be talked round produces
confident text and no accuracy. So exactly one role holds
a stop, and the loop is bounded: two returns, then the
brief publishes without the unverifiable claim and says
which claim it dropped.

Shipping short beats shipping wrong.`,
  },

  club: {
    ask: "a space for 60 urban sketchers in Kraków who meet on Saturdays",
    manifest: [
      ["joining", "invite link · one approver, no public signup"],
      ["4 rooms", "this week, sketchbooks, spots, kit talk"],
      ["events", "recurring Saturday, weather-aware, RSVP with a cap"],
      ["rules.md", "written by the club, shown before the first post"],
    ],
    excerptLabel: "this week's spot",
    excerpt: `SATURDAY · 09:30 · Podgórze

Meet under the Bernatka footbridge, river side.
Rain plan: the covered market, same time.

Bring: whatever you can carry standing up.

RSVP 14/20 — the cap is real, the cafe only has 20 chairs.

Last week: 17 came, 11 posted pages.`,
  },

  expert: {
    ask: "someone who knows Polish B2B contracting and my last two years of invoices",
    manifest: [
      ["grounding", "214 documents · invoices, contracts, 2 tax rulings"],
      ["scope", "answers from your documents; flags when it is answering from general law"],
      ["citations", "every answer names the document and the clause"],
      ["refusal", "declines to give a number when your documents do not contain one"],
    ],
    excerptLabel: "a real refusal, verbatim",
    excerpt: `You asked whether you can invoice the Berlin client
without German VAT.

Your documents do not answer this. The contract
(UMOWA-2025-03.pdf, §4) sets the fee net of tax and
says nothing about place of supply, and there is no
VAT-UE confirmation in what you have given me.

I am not going to guess at a number that goes on a
filing. What would answer it: their VAT-UE number and
one previous invoice you issued them.`,
  },

  agency: {
    ask: "a full identity for a natural wine bar opening in six weeks",
    manifest: [
      ["identity", "wordmark, 2 lockups, palette, type licence list"],
      ["site", "5 pages · menu that the bar can edit"],
      ["print", "menu, coasters, A2 window bill — press-ready"],
      ["deck", "14 slides · the case for the direction, and one it refuses"],
    ],
    excerptLabel: "from the deck, slide 3",
    excerpt: `WHAT WE ARE NOT DOING

Not a chalkboard. Not kraft paper. Not a hand-drawn
grape. Every natural wine bar in the city has already
done all three, and a customer standing on the street
cannot tell them apart.

The bar has one asset nobody else on the street has:
a 1930s tiled floor nobody has covered up.

The identity is the floor.`,
  },

  boutique: {
    ask: "a shop for hand-thrown stoneware, about 30 pieces, slow and tactile",
    manifest: [
      ["31 products", "each one-of-a-kind · stock of 1, sold state kept visible"],
      ["photography", "31 sets, consistent light, 3 angles each"],
      ["checkout", "card and BLIK · PL and EN"],
      ["copy", "31 descriptions, written from the glaze and firing notes"],
    ],
    excerptLabel: "one product, as written",
    excerpt: `Bowl, wide · shino over iron slip
280 mm · 1.1 kg · fired 4 Feb

Where the slip ran thin at the rim the shino has gone
orange and slightly rough. That edge is not a flaw and
it will not wear smooth.

Holds about a litre. Dishwasher is fine; the glaze is
harder than the machine.

One of one. 340 zł.`,
  },

  services: {
    ask: "booking and quotes for a two-van plumbing business in Gdańsk",
    manifest: [
      ["booking", "live slots · two vans, travel time between jobs"],
      ["quotes", "callout + hourly + parts · sent as PDF, valid 30 days"],
      ["schedule", "day sheet per van, SMS the night before"],
      ["site", "5 pages · what you fix, prices, area covered, book"],
    ],
    excerptLabel: "the booking rule it wrote down",
    excerpt: `Travel time is booked as time.

The obvious version puts a 2-hour job in a 2-hour slot.
Do that across Gdańsk and the second van spends its
afternoon on the ring road, unpaid, and the third job
of the day is always late.

Each slot reserves the job plus the drive from the
previous address. Two jobs on opposite sides of the
city stop being offerable in the same morning —
which is correct, because they were never possible.

You will see fewer bookable slots. They will all happen.`,
  },

  support: {
    ask: "a desk that answers in 12 languages and never invents a refund policy",
    manifest: [
      ["12 languages", "answers in the language it was asked in"],
      ["grounding", "your docs and your policy pages, nothing else"],
      ["escalation", "3 triggers · refunds, security, anything it cannot cite"],
      ["transcript", "every answer keeps the source it used"],
    ],
    excerptLabel: "an escalation, as it happened",
    excerpt: `ES · 14:02 · "Quiero que me devuelvan el dinero."

→ Answered in Spanish: acknowledged, asked for the
  order number, did NOT state a refund window.

→ ESCALATED to a human at 14:02.

  Reason: refund. Your policy pages describe refunds
  in general terms and give no period. Guessing "30
  days" here would be inventing your policy, which is
  the one thing this desk does not do.`,
  },
};
