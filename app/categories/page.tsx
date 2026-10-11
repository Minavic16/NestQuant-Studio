import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/layout/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { CategoryRail } from "@/components/categories/CategoryRail";
import { getCatalogue } from "@/data/store/repositories";
import { copy } from "@/data/content/copy";

export const metadata: Metadata = buildMetadata({
  title: "Categories",
  description: "Explore curtains, accessories and window solutions by collection.",
  path: "/categories",
});

export const revalidate = 60;

export default async function CategoriesPage() {
  const catalogue = await getCatalogue();

  return (
    <Section tone="paper">
      <PageHeader eyebrow={copy.categories.eyebrow} title={copy.categories.heading} />
      <CategoryRail categories={catalogue.categories} products={catalogue.products} />
    </Section>
  );
}
