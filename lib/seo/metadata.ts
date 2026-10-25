import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/**
 * Shared metadata builders: title, description, canonical URL, Open Graph.
 * Keeps SEO consistent across routes (ARCHITECTURE.md §9).
 */

const DEFAULT_TITLE = `${siteConfig.name} — Curtains, Accessories & Window Solutions`;

export function buildMetadata({
  title,
  description,
  path,
}: {
  /** Omit to inherit the root layout's default title (used on the home page). */
  title?: string;
  description: string;
  /** Route path beginning with "/", used for the canonical URL. */
  path: string;
}): Metadata {
  const url = `${siteConfig.url}${path}`;
  const resolvedTitle = title ? `${title} — ${siteConfig.name}` : DEFAULT_TITLE;

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      title: resolvedTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: [
        {
          url: "/opengraph-image.jpg",
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} — curtains, accessories and window solutions`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: ["/opengraph-image.jpg"],
    },
  };
}
