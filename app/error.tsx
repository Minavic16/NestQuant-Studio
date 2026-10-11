"use client";

import { Button } from "@/components/ui/Button";
import { copy } from "@/data/content/copy";
import styles from "./error.module.css";

/**
 * Route-level error boundary. Never shows a stack trace — only a recovery
 * action (DESIGN.md §40).
 */
export default function Error({ reset }: { reset: () => void }) {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{copy.error.title}</h1>
        <p className={styles.body}>{copy.error.body}</p>
        <Button variant="primary" onClick={reset}>
          {copy.error.cta}
        </Button>
      </div>
    </section>
  );
}
