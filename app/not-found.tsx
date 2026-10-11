import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { copy } from "@/data/content/copy";
import styles from "./not-found.module.css";

/** Graceful 404 for unknown routes, including unknown product slugs. */
export default function NotFound() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <p className={styles.label}>404</p>
        <h1 className={styles.title}>{copy.notFound.title}</h1>
        <p className={styles.body}>{copy.notFound.body}</p>
        <ButtonLink href="/shop" variant="primary">
          {copy.notFound.cta}
        </ButtonLink>
        <Link href="/" className={styles.home}>
          Back to home
        </Link>
      </div>
    </section>
  );
}
