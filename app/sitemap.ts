import type { MetadataRoute } from "next";
import { getCatalogue, getPublishedPortfolio } from "@/data/store/repositories";
import { siteConfig } from "@/config/site";

/** sitemap.xml: every static route plus every product, category and project. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ products, categories }, portfolio] = await Promise.all([
    getCatalogue(),
    getPublishedPortfolio(),
  ]);

  const staticRoutes = [
    { path: "/", changeFrequency: "monthly" as const, priority: 1 },
    { path: "/work", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/shop", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/categories", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/about", changeFrequency: "yearly" as const, priority: 0.5 },
    { path: "/contact", changeFrequency: "yearly" as const, priority: 0.6 },
    { path: "/enquiry", changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteConfig.url}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...portfolio.map((item) => ({
      url: `${siteConfig.url}/work/${item.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...categories.map((category) => ({
      url: `${siteConfig.url}/categories/${category.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...products.map((product) => ({
      url: `${siteConfig.url}/shop/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
