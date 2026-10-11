import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/layout/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { MediaSlot } from "@/components/products/MediaSlot";
import { getPublishedPortfolio } from "@/data/store/repositories";
import { driveFileUrl } from "@/lib/media/drive";
import { copy } from "@/data/content/copy";
import styles from "./page.module.css";

export const metadata: Metadata = buildMetadata({
  title: "Our work",
  description:
    "Interiors completed by Desired Homes Interiors — curtains, accessories and window solutions in real homes and spaces.",
  path: "/work",
});

export const revalidate = 60;

export default async function WorkPage() {
  const items = await getPublishedPortfolio();

  return (
    <Section tone="paper">
      <PageHeader
        eyebrow={copy.work.eyebrow}
        title={copy.work.heading}
        intro={items.length > 0 ? copy.work.intro(items.length) : undefined}
      />

      {items.length === 0 ? (
        <p className={styles.empty}>{copy.work.empty}</p>
      ) : (
        <ul className={styles.grid}>
          {items.map((item, index) => (
            <li key={item.slug} className={styles.item}>
              <figure className={styles.figure}>
                <MediaSlot
                  image={{ src: item.image, alt: item.title }}
                  alt={item.title}
                  ratio="4 / 5"
                  sizes="(max-width: 767px) 92vw, (max-width: 1279px) 46vw, 30vw"
                  priority={index < 2}
                  className={styles.frame}
                />

                <figcaption className={styles.caption}>
                  <h2 className={styles.title}>{item.title}</h2>

                  {item.summary ? <p className={styles.summary}>{item.summary}</p> : null}

                  <p className={styles.meta}>
                    {item.location ? <span>{item.location}</span> : null}
                    {item.year ? <span>{item.year}</span> : null}
                    {item.services.length > 0 ? <span>{item.services.join(" · ")}</span> : null}
                  </p>

                  {item.driveUrl ? (
                    <a
                      href={driveFileUrl(item.driveUrl)}
                      className={styles.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View in Drive
                    </a>
                  ) : null}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
