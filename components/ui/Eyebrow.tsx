import type { ReactNode } from "react";
import styles from "./eyebrow.module.css";

/** Letter-spaced small-caps label used above headings (DESIGN.md §3). */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={[styles.eyebrow, className ?? ""].filter(Boolean).join(" ")}>{children}</p>
  );
}
