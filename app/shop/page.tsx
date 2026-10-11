import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/layout/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ShopBrowser } from "@/components/products/ShopBrowser";
import { getProducts } from "@/data/store/repositories";
import { toProduct } from "@/data/store/repositories";
import { copy } from "@/data/content/copy";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: "Shop",
  description: `Browse curtains, accessories and window solutions from ${siteConfig.name}.`,
  path: "/shop",
});

export const revalidate = 60;

export default async function ShopPage() {
  const products = (await getProducts()).map(toProduct);

  return (
    <Section tone="paper">
      <PageHeader eyebrow={copy.shop.eyebrow} title={copy.shop.heading} />

      {/*
       * `useSearchParams` needs a boundary. The fallback is the full server-rendered
       * grid, so the initial HTML contains every product (SEO, no flash) and the
       * client only takes over the controls: applying ?q= and ?category=.
       */}
      <Suspense fallback={<ProductGrid products={products} priorityCount={4} />}>
        <ShopBrowser products={products} />
      </Suspense>
    </Section>
  );
}
