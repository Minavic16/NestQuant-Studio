import type { ElementType } from "react";
import Link from "next/link";
import styles from "./page-header.module.css";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { copy } from "@/data/content/copy";

/**
 * Route header: tracked eyebrow label, headline, optional standfirst.
 *
 * Interior pages carry a quiet way back — the header logo alone was felt to be
 * too easy to miss, so every page header leads with an explicit link home
 * unless the page supplies its own destination (DESIGN.md §8).
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
  as: Tag = "h1",
  backHref = "/",
  backLabel = copy.nav.backToHome,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  as?: ElementType;
  /** Override the back destination; pass `null` to omit the link. */
  backHref?: string | null;
  backLabel?: string;
}) {
  return (
    <header className={styles.header}>
      {backHref ? (
        <Link href={backHref} className={styles.back}>
          <span className={styles.backArrow} aria-hidden="true">
            ←
          </span>
          {backLabel}
        </Link>
      ) : null}
      <Eyebrow>{eyebrow}</Eyebrow>
      <Tag className={styles.title}>{title}</Tag>
      {intro ? <p className={styles.intro}>{intro}</p> : null}
    </header>
  );
}
