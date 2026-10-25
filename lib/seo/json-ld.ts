import { siteConfig } from "@/config/site";
import { contactConfig } from "@/config/contact";
import type { Product } from "@/data/types";
import { getCategoryById } from "@/data/categories";

/**
 * Structured-data payloads (ARCHITECTURE.md §9).
 *
 * Built from typed configuration and catalogue data only, so the serialised
 * script tag never contains anything user-controlled.
 */

function absoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${siteConfig.url}${path}`;
}

export function organizationData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    email: contactConfig.email,
    telephone: `+${contactConfig.whatsappNumber}`,
    logo: absoluteUrl("/brand/logo-complete.jpg"),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: contactConfig.email,
      telephone: `+${contactConfig.whatsappNumber}`,
    },
    founder: {
      "@type": "Person",
      name: siteConfig.ceo.name,
      jobTitle: siteConfig.ceo.role,
    },
  };
}

export function productData(product: Product) {
  const category = getCategoryById(product.category);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: absoluteUrl(`/shop/${product.slug}`),
    ...(product.description || product.shortDescription
      ? { description: product.description ?? product.shortDescription }
      : {}),
    ...(category ? { category: category.name } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.images.length > 0
      ? { image: product.images.map((image) => absoluteUrl(image.src)) }
      : {}),
    brand: { "@type": "Brand", name: siteConfig.name },
    ...(typeof product.price === "number" && product.price > 0
      ? {
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: product.currency ?? siteConfig.currency,
            url: absoluteUrl(`/shop/${product.slug}`),
            ...(typeof product.available === "boolean"
              ? {
                  availability: product.available
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                }
              : {}),
          },
        }
      : {}),
  };
}

export function breadcrumbData(items: readonly { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
