import type { MetadataRoute } from "next";
import { getCatalogue } from "@/data/store/repositories";
import { siteConfig } from "@/config/site";

/** sitemap.xml: every static route plus every product and category slug. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories } = await getCatalogue();
  const lastModified = new Date();

  const staticRoutes = [
    { path: "/", changeFrequency: "monthly" as const, priority: 1 },
    { path: "/shop", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/categories", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/work", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/about", changeFrequency: "yearly" as const, priority: 0.5 },
    { path: "/contact", changeFrequency: "yearly" as const, priority: 0.6 },
    { path: "/enquiry", changeFrequency: "yearly" as const, priority: 0.4 },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteConfig.url}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...categories.map((category) => ({
      url: `${siteConfig.url}/categories/${category.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...products.map((product) => ({
      url: `${siteConfig.url}/shop/${product.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
