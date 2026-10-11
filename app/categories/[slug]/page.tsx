import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/layout/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductGrid } from "@/components/products/ProductGrid";
import { getCatalogue, toProduct } from "@/data/store/repositories";
import { copy } from "@/data/content/copy";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { categories } = await getCatalogue();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await getCatalogue();
  const category = categories.find((entry) => entry.slug === slug);

  if (!category) {
    return buildMetadata({
      title: copy.product.notFound.title,
      description: copy.product.notFound.body,
      path: `/categories/${slug}`,
    });
  }

  return buildMetadata({
    title: category.name,
    description: `${category.name} from Desired Homes Interiors.`,
    path: `/categories/${slug}`,
  });
}

export const revalidate = 60;

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const catalogue = await getCatalogue();
  const category = catalogue.categories.find((entry) => entry.slug === slug);

  if (!category) notFound();

  const products = catalogue.products
    .filter((product) => product.category === category.id)
    .map(toProduct);

  return (
    <Section tone="paper">
      <PageHeader
        eyebrow={copy.categories.eyebrow}
        title={category.name}
        intro={copy.categories.itemCount(products.length)}
      />

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <p>{copy.categories.empty}</p>
      )}
    </Section>
  );
}
