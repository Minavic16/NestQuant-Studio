import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/layout/Section";
import { MediaSlot } from "@/components/products/MediaSlot";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowRightIcon } from "@/components/ui/icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalogue, getPublishedPortfolio, toProduct } from "@/data/store/repositories";
import { getCategoryProfile } from "@/data/categories";
import { breadcrumbData } from "@/lib/seo/json-ld";
import styles from "./page.module.css";

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
      title: "Collection not found",
      description: "This collection could not be found.",
      path: `/categories/${slug}`,
    });
  }

  const profile = getCategoryProfile(category.id);

  return buildMetadata({
    title: category.name,
    description: profile.intro,
    path: `/categories/${category.slug}`,
  });
}

export const revalidate = 60;

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const { categories, products } = await getCatalogue();
  const category = categories.find((entry) => entry.slug === slug);

  if (!category) notFound();

  const profile = getCategoryProfile(category.id);
  const categoryProducts = products.filter((product) => product.category === category.id).map(toProduct);
  const hasProducts = categoryProducts.length > 0;
  const portfolio =
    category.id === "curtains"
      ? (await getPublishedPortfolio()).filter((item) =>
          item.services.some((service) => service.toLowerCase().includes("curtain")),
        )
      : [];

  return (
    <>
      <JsonLd
        data={breadcrumbData([
          { name: "Categories", path: "/categories" },
          { name: category.name, path: `/categories/${category.slug}` },
        ])}
      />

      <Section tone="paper" className={styles.page}>
        <Link href="/categories" className={styles.back}>
          <span className={styles.backArrow} aria-hidden="true">
            ←
          </span>
          All collections
        </Link>

        <header className={styles.head}>
          <div className={styles.headText}>
            <p className={styles.eyebrow}>Collection</p>
            <h1 className={styles.heading}>{category.name}</h1>
            <p className={styles.intro}>{profile.intro}</p>

            <div className={styles.actions}>
              <ButtonLink href="/contact" variant="primary">
                {profile.actionLabel}
              </ButtonLink>
              {hasProducts ? (
                <ButtonLink href={`/shop?category=${category.id}`} variant="secondary">
                  See all {categoryProducts.length} in the shop
                </ButtonLink>
              ) : (
                <Link href="#curtain-work" className={styles.textLink}>
                  See curtain projects
                  <ArrowRightIcon className={styles.arrow} />
                </Link>
              )}
            </div>
          </div>

          <MediaSlot
            image={{ src: profile.image, alt: profile.alt }}
            alt={profile.alt}
            ratio="4 / 5"
            sizes="(max-width: 1023px) 100vw, 44vw"
            priority
            className={styles.heroMedia}
          />
        </header>

        {hasProducts ? (
          <section className={styles.products} aria-labelledby="collection-heading">
            <div className={styles.sectionHead}>
              <div>
                <h2 id="collection-heading" className={styles.sectionHeading}>
                  In this collection
                </h2>
                <p className={styles.sectionNote}>
                  Listed prices are shown for each piece. Add anything you would like to compare
                  to your enquiry list, or ask if you need to check compatibility.
                </p>
              </div>
              <p className={styles.count}>
                {categoryProducts.length} {categoryProducts.length === 1 ? "piece" : "pieces"}
              </p>
            </div>

            <ProductGrid products={categoryProducts} priorityCount={4} />
          </section>
        ) : (
          <section className={styles.enquiryPanel} aria-labelledby="curtains-heading">
            <div className={styles.enquiryText}>
              <p className={styles.eyebrow}>Curtain enquiries</p>
              <h2 id="curtains-heading" className={styles.enquiryHeading}>
                Curtains begin with the room, not a product grid.
              </h2>
              <p className={styles.enquiryBody}>
                There are no ready-made curtains listed online. The curtain work shown on this site
                is project work, so the useful next step is a conversation about the window you
                have in mind.
              </p>

              <ul className={styles.guide}>
                <li>A photo of the window and the surrounding wall.</li>
                <li>The approximate width and drop, if you know them.</li>
                <li>A project or finish you have seen on this site and like.</li>
              </ul>
            </div>

            <div className={styles.enquiryActions}>
              <ButtonLink href="/contact" variant="primary">
                Discuss curtains
              </ButtonLink>
              <ButtonLink href="/work" variant="secondary">
                View curtain projects
              </ButtonLink>
              <p className={styles.enquiryNote}>
                You will review and send your message in WhatsApp or email. Nothing is submitted
                automatically.
              </p>
            </div>
          </section>
        )}

        {!hasProducts && portfolio.length > 0 ? (
          <section className={styles.work} id="curtain-work" aria-labelledby="curtain-work-heading">
            <div className={styles.sectionHead}>
              <div>
                <h2 id="curtain-work-heading" className={styles.sectionHeading}>
                  Curtain work
                </h2>
                <p className={styles.sectionNote}>
                  Completed projects where curtains were part of the recorded scope.
                </p>
              </div>
              <Link href="/work" className={styles.textLink}>
                All work
                <ArrowRightIcon className={styles.arrow} />
              </Link>
            </div>

            <ul className={styles.workGrid}>
              {portfolio.slice(0, 3).map((item) => (
                <li key={item.slug}>
                  <Link href={`/work/${item.slug}`} className={styles.workCard}>
                    <MediaSlot
                      image={{ src: item.image, alt: item.title }}
                      alt={item.title}
                      ratio="4 / 5"
                      sizes="(max-width: 767px) 100vw, 30vw"
                      className={styles.workMedia}
                    />
                    <span className={styles.workTitle}>{item.title}</span>
                    <span className={styles.workCta}>View project</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Section>
    </>
  );
}
