/**
 * Site identity and defaults.
 *
 * `NEXT_PUBLIC_SITE_URL` should be set to the approved production origin in the
 * deployment environment. When it is absent the known production deployment is
 * used rather than a placeholder, so canonicals, sitemap and social metadata
 * never ship an example domain.
 */

const PRODUCTION_ORIGIN = "https://desired-homes-interiors.vercel.app";

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (configured && configured.length > 0 ? configured : PRODUCTION_ORIGIN).replace(/\/+$/, "");
}

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
  url: resolveSiteUrl(),
  description:
    "Desired Homes Interiors — curtains, interior decoration accessories and window solutions. See completed work, browse the collection and enquire directly on WhatsApp or by email.",
} as const;
