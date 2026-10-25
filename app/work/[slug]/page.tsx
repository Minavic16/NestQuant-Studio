import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/layout/Section";
import { MediaSlot } from "@/components/products/MediaSlot";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowRightIcon } from "@/components/ui/icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedPortfolio } from "@/data/store/repositories";
import { breadcrumbData } from "@/lib/seo/json-ld";
import { siteConfig } from "@/config/site";
import styles from "./page.module.css";
import type { PortfolioItem } from "@/data/store/schema";

type WorkDetailProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const items = await getPublishedPortfolio();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: WorkDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const items = await getPublishedPortfolio();
  const item = items.find((entry) => entry.slug === slug);

  if (!item) {
    return buildMetadata({
      title: "Project not found",
      description: "This project could not be found.",
      path: `/work/${slug}`,
    });
  }

  return buildMetadata({
    title: item.title,
    description: item.summary || `${item.title}, a completed project by ${siteConfig.name}.`,
    path: `/work/${item.slug}`,
  });
}

function roomLabel(item: PortfolioItem): string {
  return item.title.split(",")[0] ?? item.title;
}

export default async function WorkDetailPage({ params }: WorkDetailProps) {
  const { slug } = await params;
  const items = await getPublishedPortfolio();
  const item = items.find((entry) => entry.slug === slug);

  if (!item) notFound();

  const related = items.filter((entry) => entry.slug !== item.slug).slice(0, 2);
  const message = [
    "Hello Desired Homes Interiors,",
    "",
    `I saw the project “${item.title}” (${siteConfig.url}/work/${item.slug}) and would like to discuss something similar.`,
    "",
  ].join("\n");
  const contactHref = `/contact?subject=${encodeURIComponent(
    `Project: ${item.title}`,
  )}&message=${encodeURIComponent(message)}`;

  return (
    <>
      <JsonLd
        data={breadcrumbData([
          { name: "Our work", path: "/work" },
          { name: item.title, path: `/work/${item.slug}` },
        ])}
      />

      <Section tone="paper" className={styles.page}>
        <Link href="/work" className={styles.back}>
          <span className={styles.backArrow} aria-hidden="true">
            ←
          </span>
          All work
        </Link>

        <header className={styles.head}>
          <p className={styles.eyebrow}>
            {roomLabel(item)}
            {item.services.length > 0 ? ` · ${item.services.join(" · ")}` : ""}
          </p>
          <h1 className={styles.heading}>{item.title}</h1>
          <p className={styles.summary}>{item.summary}</p>
        </header>

        <div className={styles.layout}>
          <figure className={styles.figure}>
            <MediaSlot
              image={{ src: item.image, alt: item.title }}
              alt={item.title}
              ratio="4 / 5"
              sizes="(max-width: 1023px) 100vw, 62vw"
              priority
              className={styles.media}
            />
            <figcaption className={styles.caption}>
              Project photograph supplied by Desired Homes Interiors.
            </figcaption>
          </figure>

          <aside className={styles.aside} aria-label="Project details">
            <div className={styles.detailGroup}>
              <h2 className={styles.detailTitle}>Services recorded</h2>
              {item.services.length > 0 ? (
                <ul className={styles.services}>
                  {item.services.map((service) => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.detailBody}>
                  The service scope for this project has not been recorded separately.
                </p>
              )}
            </div>

            <div className={styles.detailGroup}>
              <h2 className={styles.detailTitle}>About this view</h2>
              <p className={styles.detailBody}>
                This page shows the photograph and summary supplied for the project. Details such
                as the room&rsquo;s location, date and exact materials have not been published
                because they have not been verified.
              </p>
            </div>

            <div className={styles.actionGroup}>
              <ButtonLink href={contactHref} variant="primary">
                Discuss something similar
              </ButtonLink>
              <p className={styles.actionNote}>
                Opens the contact page with this project referenced.
              </p>
            </div>
          </aside>
        </div>
      </Section>

      {related.length > 0 ? (
        <section className={styles.relatedBand} aria-labelledby="related-heading">
          <div className={styles.relatedInner}>
            <div className={styles.relatedHead}>
              <h2 id="related-heading" className={styles.relatedHeading}>
                More work
              </h2>
              <Link href="/work" className={styles.relatedLink}>
                See all projects
                <ArrowRightIcon className={styles.arrow} />
              </Link>
            </div>

            <ul className={styles.relatedGrid}>
              {related.map((entry) => (
                <li key={entry.slug}>
                  <Link href={`/work/${entry.slug}`} className={styles.relatedCard}>
                    <MediaSlot
                      image={{ src: entry.image, alt: entry.title }}
                      alt={entry.title}
                      ratio="3 / 2"
                      sizes="(max-width: 767px) 100vw, 46vw"
                      className={styles.relatedMedia}
                    />
                    <span className={styles.relatedTitle}>{entry.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
