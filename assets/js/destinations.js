/**
 * THE DESTINATIONS — single source of truth for the whole family.
 *
 * THIS ARRAY'S LENGTH IS THE COUNT. The dial derives its geometry from it and
 * nothing else may hardcode a number; adding a row here is the whole job of
 * adding a domain, apart from its lamp in tokens.css and its specimen.
 *
 * PRODUCT.md principle 2: "One engine, many faces. Anything that differs per
 * domain is a data row. A forked page is a defect." Everything the site knows
 * about a domain lives here and nowhere else: the noun on the dial, the lamp
 * colour, the sentence, the prompt placeholder, and the authored specimen.
 *
 * `accent` is the destination's lamp. It is the ONLY place its colour is
 * allowed to appear on the page — the lit centre band of the dial, the row
 * indicator, the MAKE IT key, and focus rings. Never a page wash, never a
 * gradient hero. (Direction contract, raise from Iridescent Cloud Edge.)
 *
 * `specimen` is authored demonstration material, labelled as such wherever it
 * renders. It is not a customer, a case study, or a claim.
 */

export const DESTINATIONS = [
  {
    id: "website",
    tld: "website",
    noun: "website",
    accent: "#FFB020",
    makes: "a website",
    // The one line under the board. Second person, imperative product, no adjectives about itself.
    line: "Describe the site. Get the site — pages, copy, images, and the code behind them.",
    placeholder: "a one-page site for my ceramics studio — warm, quiet, a shop and a kiln diary",
    specimen: { kind: "site", title: "Studio Warsztat", meta: "6 sections · 1 shop · 11 languages" },
  },
  {
    id: "codes",
    tld: "codes",
    noun: "codes",
    accent: "#5CE07A",
    makes: "code",
    line: "Describe the behaviour. Get working code, its tests, and the reason it is written that way.",
    placeholder: "a Python script that renames photos into folders by EXIF date",
    specimen: { kind: "code", title: "sort_by_exif.py", meta: "94 lines · 7 tests · pillow" },
  },
  {
    id: "software",
    tld: "software",
    noun: "software",
    accent: "#9D8CFF",
    makes: "software",
    line: "Describe what it should do for whom. Get a running application, not a repository to finish yourself.",
    placeholder: "an invoicing app for a two-person studio, with VAT and a client list",
    specimen: { kind: "app", title: "Faktura", meta: "4 screens · auth · Postgres" },
  },
  {
    id: "cloud",
    tld: "cloud",
    noun: "cloud",
    accent: "#4CC3FF",
    makes: "infrastructure",
    line: "Describe the load and the budget. Get infrastructure as code, with the failure modes written down.",
    placeholder: "Postgres and object storage that survives losing a region",
    specimen: { kind: "infra", title: "eu-central + eu-west", meta: "Terraform · 2 regions · RPO 60s" },
  },
  {
    id: "email",
    tld: "email",
    noun: "email",
    accent: "#FF8A3D",
    makes: "an email",
    line: "Describe the news and the reader. Get the email — subject lines, plain text, and the HTML that renders everywhere.",
    placeholder: "a launch note to 400 beta users. No hype, one link.",
    specimen: { kind: "email", title: "We opened the doors", meta: "3 subjects · text + HTML" },
  },
  {
    id: "team",
    tld: "team",
    noun: "team",
    accent: "#FF6FA5",
    makes: "a team",
    line: "Describe the work. Get a set of agents with defined roles that hand work to each other.",
    placeholder: "a researcher, an editor and a fact-checker that publish a weekly brief",
    specimen: { kind: "team", title: "Weekly Brief", meta: "3 roles · 1 handoff loop" },
  },
  {
    id: "club",
    tld: "club",
    noun: "club",
    accent: "#E56BFF",
    makes: "a club",
    line: "Describe who gathers and why. Get the members' space — joining, rooms, roll call, and the rules.",
    placeholder: "a space for 60 urban sketchers in Kraków who meet on Saturdays",
    specimen: { kind: "club", title: "Szkicownik", meta: "60 members · 4 rooms · events" },
  },
  {
    id: "expert",
    tld: "expert",
    noun: "expert",
    accent: "#FFD23F",
    makes: "an expert",
    line: "Describe the question you keep asking. Get an adviser grounded in your own documents.",
    placeholder: "someone who knows Polish B2B contracting and my last two years of invoices",
    specimen: { kind: "expert", title: "Kontrakt", meta: "grounded on 214 documents" },
  },
  {
    id: "agency",
    tld: "agency",
    noun: "agency",
    accent: "#FF5C5C",
    makes: "an agency",
    line: "Describe the client and the deadline. Get the studio — brief, identity, site, and the deck that sells it.",
    placeholder: "a full identity for a natural wine bar opening in six weeks",
    specimen: { kind: "agency", title: "Kwas", meta: "identity · site · deck" },
  },
  {
    id: "boutique",
    tld: "boutique",
    noun: "boutique",
    accent: "#FF9EB5",
    makes: "a boutique",
    line: "Describe the goods. Get the shop — product pages, photography, checkout, and the words that sell them.",
    placeholder: "a shop for hand-thrown stoneware, about 30 pieces, slow and tactile",
    specimen: { kind: "shop", title: "Glina", meta: "31 products · checkout · PL/EN" },
  },
  {
    id: "services",
    tld: "services",
    noun: "services",
    // Lime fills the one real gap in the wheel — there was nothing between
    // gold and the mint green of .codes. It reads as yellow-green next to that
    // green's cyan lean, so the two never trade places on a dark board.
    accent: "#a9e34b",
    makes: "a service business",
    line: "Describe the work and how people book it. Get the booking, the quotes, the schedule, and the site that sells them.",
    placeholder: "booking and quotes for a two-van plumbing business in Gdańsk",
    specimen: { kind: "services", title: "Hydraulik", meta: "booking · quotes · 2 vans" },
  },
  {
    id: "support",
    tld: "support",
    noun: "support",
    accent: "#2FD9C5",
    makes: "support",
    line: "Describe your product and your patience. Get a help desk that answers, escalates, and admits what it does not know.",
    placeholder: "a desk that answers in 12 languages and never invents a refund policy",
    specimen: { kind: "desk", title: "Front Desk", meta: "12 languages · escalation rules" },
  },
];

/** Fast lookup by id — used by hostname routing and by direct addressing on the dial. */
export const BY_ID = Object.fromEntries(DESTINATIONS.map((d) => [d.id, d]));

/**
 * Which destination is this page?
 *
 * The hostname IS the configuration. makeme.website locks to `website`;
 * makeme.club is the family hub and stays unlocked so the dial can roll freely.
 * Anything else — localhost, a preview URL, a staging host — behaves as the hub,
 * and `?d=codes` overrides for previewing one domain without editing hosts.
 */
export const HUB_ID = "club";

export function resolveDestination(hostname = location.hostname, search = location.search) {
  const forced = new URLSearchParams(search).get("d");
  if (forced && BY_ID[forced]) return { destination: BY_ID[forced], locked: forced !== HUB_ID, hub: forced === HUB_ID };

  // Match the public suffix rather than the whole host, so www., preview
  // subdomains and trailing dots all resolve to the same destination.
  const tld = hostname.replace(/\.$/, "").split(".").pop()?.toLowerCase();
  const hit = DESTINATIONS.find((d) => d.tld === tld);

  if (!hit || hit.id === HUB_ID) return { destination: BY_ID[HUB_ID], locked: false, hub: true };
  return { destination: hit, locked: true, hub: false };
}
