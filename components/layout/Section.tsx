import type { ElementType, ReactNode } from "react";
import styles from "./section.module.css";

export type SectionTone = "paper" | "ivory" | "black";

type SectionProps = {
  /** Surface tone: light / alternate light / black band. */
  tone?: SectionTone;
  /** Section label rendered as a tracked `h2` (keeps the heading hierarchy sound). */
  label?: string;
  /** Constrain the inner content to the container width. */
  contained?: boolean;
  /** Narrower measure for text-led sections. */
  narrow?: boolean;
  as?: ElementType;
  id?: string;
  className?: string;
  children: ReactNode;
};

export function Section({
  tone = "paper",
  label,
  contained = true,
  narrow = false,
  as: Tag = "section",
  id,
  className,
  children,
}: SectionProps) {
  const classes = [styles.section, styles[tone], narrow ? styles.narrow : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {label ? <h2 className={styles.label}>{label}</h2> : null}
      {children}
    </>
  );

  if (!contained) {
    return (
      <Tag id={id} className={classes}>
        {content}
      </Tag>
    );
  }

  return (
    <Tag id={id} className={classes}>
      <div className={narrow ? styles.containerNarrow : styles.container}>{content}</div>
    </Tag>
  );
}
