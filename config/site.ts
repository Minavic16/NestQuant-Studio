/**
 * Site identity and defaults.
 *
 * `NEXT_PUBLIC_SITE_URL` must be set to the production origin before launch: it drives
 * canonical URLs, sitemap.xml and Open Graph tags. Until then a clearly-marked
 * placeholder is used (ARCHITECTURE.md §15). It is the only configuration value in the
 * project.
 */

const PLACEHOLDER_ORIGIN = "https://replace-me-before-launch.example";

export const siteConfig = {
  name: "Desired Homes Interiors",
  shortName: "Desired Homes",
  /** The proposition stated on the home page. */
  proposition: "Curtains, accessories and window solutions.",
  /** Footer / lockup line, matching the supplied logo's own tagline. */
  servicesLine: "Curtains • Accessories • Window Solutions",
  locale: "en_NG",
  currency: "NGN",
  /** CEO & Creative Director — supplied by the business. */
  ceo: {
    name: "Desire Nwakor",
    role: "CEO & Creative Director",
  },
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? PLACEHOLDER_ORIGIN).replace(/\/+$/, ""),
  description:
    "Desired Homes Interiors — curtains, interior decoration accessories and window solutions. Browse the collection and enquire directly on WhatsApp or by email.",
} as const;
