import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/layout/Section";
import { MediaSlot } from "@/components/products/MediaSlot";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getPublishedPortfolio } from "@/data/store/repositories";
import styles from "./page.module.css";
import type { PortfolioItem } from "@/data/store/schema";

export const metadata: Metadata = buildMetadata({
  title: "Our work",
  description:
    "Completed interiors by Desired Homes Interiors, including curtains, pelmets, accessories and window treatments photographed in real rooms.",
  path: "/work",
});

export const revalidate = 60;

function roomLabel(item: PortfolioItem): string {
  return item.title.split(",")[0] ?? item.title;
}

export default async function WorkPage() {
  const items = await getPublishedPortfolio();
  const [feature, ...rest] = items;

  return (
    <>
      <Section tone="paper" className={styles.page}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Our work</p>
          <h1 className={styles.heading}>Rooms finished from the window in.</h1>
          <p className={styles.intro}>
            Curtains, pelmets and window treatments from completed projects. Each project below is
            shown with the scope the business has recorded, with no invented briefs or before-and-after
            claims.
          </p>
        </header>

        {items.length === 0 ? (
          <p className={styles.empty}>No projects have been published yet.</p>
        ) : feature ? (
          <>
            <article className={styles.feature}>
              <Link href={`/work/${feature.slug}`} className={styles.featureLink}>
                <MediaSlot
                  image={{ src: feature.image, alt: feature.title }}
                  alt={feature.title}
                  ratio="4 / 3"
                  sizes="(max-width: 1023px) 100vw, 58vw"
                  priority
                  className={styles.featureMedia}
                />
                <div className={styles.featureBody}>
                  <p className={styles.meta}>
                    {roomLabel(feature)}
                    {feature.services.length > 0 ? ` · ${feature.services.join(" · ")}` : ""}
                  </p>
                  <h2 className={styles.featureTitle}>{feature.title}</h2>
                  <p className={styles.featureSummary}>{feature.summary}</p>
                  <span className={styles.linkCta}>
                    View project
                    <ArrowRightIcon className={styles.arrow} />
                  </span>
                </div>
              </Link>
            </article>

            {rest.length > 0 ? (
              <ul className={styles.grid}>
                {rest.map((item) => (
                  <li key={item.slug}>
                    <article className={styles.card}>
                      <Link href={`/work/${item.slug}`} className={styles.cardLink}>
                        <MediaSlot
                          image={{ src: item.image, alt: item.title }}
                          alt={item.title}
                          ratio="3 / 2"
                          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 46vw, 44vw"
                          className={styles.cardMedia}
                        />
                        <div className={styles.cardBody}>
                          <p className={styles.meta}>
                            {roomLabel(item)}
                            {item.services.length > 0
                              ? ` · ${item.services.join(" · ")}`
                              : ""}
                          </p>
                          <h2 className={styles.cardTitle}>{item.title}</h2>
                          <p className={styles.cardSummary}>{item.summary}</p>
                          <span className={styles.linkCta}>
                            View project
                            <ArrowRightIcon className={styles.arrow} />
                          </span>
                        </div>
                      </Link>
                    </article>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
      </Section>

      <section className={styles.contactBand}>
        <div className={styles.contactInner}>
          <div>
            <p className={styles.contactEyebrow}>Planning a room?</p>
            <h2 className={styles.contactHeading}>Tell us what you are working on.</h2>
            <p className={styles.contactBody}>
              You do not need a complete brief. A photo of the window and a rough idea of the
              finish you like is enough to begin a conversation.
            </p>
          </div>
          <div className={styles.contactActions}>
            <ButtonLink href="/contact" variant="primary">
              Discuss your space
            </ButtonLink>
            <Link href="/shop" className={styles.secondaryLink}>
              Browse the collection
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
