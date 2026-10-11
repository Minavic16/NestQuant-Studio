import Link from "next/link";
import styles from "./work-teaser.module.css";
import { Section } from "@/components/layout/Section";
import { MediaSlot } from "@/components/products/MediaSlot";
import type { PortfolioItem } from "@/data/store/schema";
import { copy } from "@/data/content/copy";

/**
 * Home-page teaser for the portfolio. Renders nothing until the business has
 * published something, so an empty gallery never leaves a hole in the page
 * (DESIGN.md §11). Images go through MediaSlot, so a Drive file that is no
 * longer shared degrades to a neutral frame instead of a broken image.
 */
export function WorkTeaser({ items }: { items: readonly PortfolioItem[] }) {
  if (items.length === 0) return null;

  const shown = items.slice(0, 3);

  return (
    <Section tone="paper" label={copy.work.eyebrow}>
      <ul className={styles.grid}>
        {shown.map((item, index) => (
          <li key={item.slug} className={styles.item}>
            <Link href="/work" className={styles.link}>
              <MediaSlot
                image={{ src: item.image, alt: item.title }}
                alt={item.title}
                ratio="4 / 5"
                sizes="(max-width: 767px) 62vw, 30vw"
                priority={index === 0}
                className={styles.frame}
              />
              <span className={styles.title}>{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/work" className={styles.more}>
        {copy.work.more}
      </Link>
    </Section>
  );
}
