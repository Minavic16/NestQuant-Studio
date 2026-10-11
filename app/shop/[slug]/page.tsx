import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/layout/Section";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductDetails } from "@/components/products/ProductDetails";
import { ProductViewTracker } from "@/components/products/ProductViewTracker";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProducts } from "@/data/store/repositories";
import { toProduct } from "@/data/store/repositories";
import { resolveContact } from "@/lib/contact/resolve";
import { getCategoryById } from "@/data/categories";
import { breadcrumbData, productData } from "@/lib/seo/json-ld";
import { copy } from "@/data/content/copy";
import { siteConfig } from "@/config/site";
import styles from "./page.module.css";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((entry) => entry.slug === slug);

  if (!product) {
    return buildMetadata({
      title: copy.product.notFound.title,
      description: copy.product.notFound.body,
      path: `/shop/${slug}`,
    });
  }

  return buildMetadata({
    title: product.name,
    description:
      product.shortDescription ??
      product.description ??
      `${product.name} — ${getCategoryById(product.category)?.name ?? ""} from ${siteConfig.name}.`,
    path: `/shop/${slug}`,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const contact = await resolveContact();
  const products = await getProducts();
  const product = products.find((entry) => entry.slug === slug);

  if (!product) notFound();

  const category = getCategoryById(product.category);

  return (
    <Section tone="paper">
      <ProductViewTracker slug={product.slug} />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            productData(product),
            breadcrumbData([
              { name: "Shop", path: "/shop" },
              ...(category ? [{ name: category.name, path: `/categories/${category.slug}` }] : []),
              { name: product.name, path: `/shop/${product.slug}` },
            ]),
          ],
        }}
      />

      <div className={styles.layout}>
        <ProductGallery product={toProduct(product)} />
        <ProductDetails product={toProduct(product)} contact={contact} />
      </div>

      <Suspense fallback={null}>
        <ReviewSection product={product} />
      </Suspense>

      <Link href="/shop" className={styles.back}>
        <span className={styles.backArrow} aria-hidden="true">
          →
        </span>
        {copy.product.backToShop}
      </Link>
    </Section>
  );
}
