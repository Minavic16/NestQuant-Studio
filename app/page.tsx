import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/layout/Section";
import { Hero } from "@/components/home/Hero";
import { BrandStatement } from "@/components/home/BrandStatement";
import { EnquiryCta } from "@/components/home/EnquiryCta";
import { WorkTeaser } from "@/components/home/WorkTeaser";
import { CategoryRail } from "@/components/categories/CategoryRail";
import { ProductGrid } from "@/components/products/ProductGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalogue, getPublishedPortfolio } from "@/data/store/repositories";
import { toProduct } from "@/data/store/repositories";
import { organizationData } from "@/lib/seo/json-ld";
import { copy } from "@/data/content/copy";
import styles from "./page.module.css";

export const metadata: Metadata = buildMetadata({
  description:
    "Desired Homes Interiors — curtains, interior decoration accessories and window solutions. Browse the collection and enquire on WhatsApp or by email.",
  path: "/",
});

/** The public catalogue is revalidated frequently and immediately on admin edits. */
export const revalidate = 60;

export default async function HomePage() {
  const [catalogue, portfolio] = await Promise.all([getCatalogue(), getPublishedPortfolio()]);
  const products = catalogue.products.map(toProduct);
  const featured = products.filter((product) => product.featured).slice(0, 4);

  return (
    <>
      <JsonLd data={organizationData()} />

      <Hero />

      <Section tone="ivory" label={copy.explore.label}>
        <CategoryRail categories={catalogue.categories} products={catalogue.products} />
      </Section>

      <Section tone="paper" label={copy.featured.label}>
        {featured.length > 0 ? (
          <ProductGrid products={featured} />
        ) : (
          <p className={styles.empty}>{copy.shop.noProducts}</p>
        )}
      </Section>

      <WorkTeaser items={portfolio} />

      <BrandStatement />

      <EnquiryCta />
    </>
  );
}
