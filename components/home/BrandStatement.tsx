import Link from "next/link";
import styles from "./brand-statement.module.css";
import { Section } from "@/components/layout/Section";
import { copy } from "@/data/content/copy";

/** The brand statement: one sentence and one link (DESIGN.md §8.3). */
export function BrandStatement() {
  return (
    <Section tone="ivory" narrow>
      <div className={styles.inner}>
        <p className={styles.line}>{copy.brandStatement.line}</p>
        <Link href="/about" className={styles.link}>
          {copy.brandStatement.link}
        </Link>
      </div>
    </Section>
  );
}
