import styles from "./review-summary.module.css";
import { Stars } from "./Stars";

/**
 * Rating summary for a product (or the business), shown above the review list.
 * Nothing is rendered when there are no approved reviews — the site never
 * implies social proof that does not exist (DESIGN.md §11).
 */

export function ReviewSummary({
  average,
  count,
  label = "review",
}: {
  average: number;
  count: number;
  label?: string;
}) {
  if (count === 0) return null;

  return (
    <div className={styles.summary}>
      <Stars rating={average} />

      <p className={styles.text}>
        <strong>{average.toFixed(1)}</strong> out of 5 · {count}{" "}
        {count === 1 ? label : `${label}s`}
      </p>
    </div>
  );
}
