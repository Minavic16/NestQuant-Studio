import type { PortfolioItem } from "./schema";

/**
 * The business's past work, as supplied by the client.
 *
 * Photography is committed under `public/portfolio/` and optimised to WebP, so
 * these entries have no external dependency and work on any host, including
 * those with a read-only filesystem. Drive remains available for additions
 * made later through the dashboard (see lib/media/drive.ts).
 */
export const seedPortfolioItems: readonly PortfolioItem[] = [
  {
    id: "p1",
    slug: "bedroom-gold-curtains",
    title: "Bedroom, full-height gold curtains",
    summary:
      "Floor-to-ceiling gold curtains in a bedroom, hung from a discreet track and finished with a matching tieback.",
    services: ["Curtains"],
    image: "/portfolio/bedroom-gold-curtains.webp",
    order: 1,
    published: true,
  },
  {
    id: "p2",
    slug: "living-room-tan-curtains",
    title: "Living room, tan curtain pair",
    summary:
      "A pair of tan curtains framing the window, with sheer panels behind them for daylight without exposure.",
    services: ["Curtains", "Window Solutions"],
    image: "/portfolio/living-room-tan-curtains.webp",
    order: 2,
    published: true,
  },
  {
    id: "p3",
    slug: "living-room-blue-velvet",
    title: "Living room, blue velvet and grey drapes",
    summary:
      "Grey drapes with tiebacks against a blue velvet sofa, with concealed cove lighting along the ceiling.",
    services: ["Curtains", "Window Solutions"],
    image: "/portfolio/living-room-blue-velvet.webp",
    order: 3,
    published: true,
  },
  {
    id: "p4",
    slug: "living-room-gold-pelmets",
    title: "Living room, gold pelmets and drapes",
    summary:
      "Gold pelmet boxes above the window with matching gold drapes, giving the room a formal, finished edge.",
    services: ["Curtains", "Window Solutions"],
    image: "/portfolio/living-room-gold-pelmets.webp",
    order: 4,
    published: true,
  },
  {
    id: "p5",
    slug: "reception-royal-gold",
    title: "Reception, royal gold and crystal",
    summary:
      "Heavy gold drapes with a crystal chandelier over a tufted royal-purple suite, a formal reception in gold tones.",
    services: ["Curtains", "Accessories"],
    image: "/portfolio/living-room-royal-gold.webp",
    order: 5,
    published: true,
  },
];
