import type { ElementType } from "react";
import styles from "./page-header.module.css";
import { Eyebrow } from "@/components/ui/Eyebrow";

/** Route header: tracked eyebrow label, headline, optional standfirst. */
export function PageHeader({
  eyebrow,
  title,
  intro,
  as: Tag = "h1",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  as?: ElementType;
}) {
  return (
    <header className={styles.header}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Tag className={styles.title}>{title}</Tag>
      {intro ? <p className={styles.intro}>{intro}</p> : null}
    </header>
  );
}
