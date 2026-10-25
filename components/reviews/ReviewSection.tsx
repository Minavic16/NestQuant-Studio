"use client";

import { useEffect, useState } from "react";
import styles from "./review-section.module.css";
import { ReviewForm } from "./ReviewForm";
import { ReviewSummary } from "./ReviewSummary";
import { Stars } from "./Stars";
import type { Review } from "@/data/store/schema";

/**
 * Reviews block for a product page.
 *
 * Approved reviews are shown when they exist. The submission form is a
 * secondary, collapsed action rather than a large form dominating the page.
 */
export function ReviewSection({ product }: { product: { slug: string; name: string } }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const subject = product.slug;

  useEffect(() => {
    let active = true;

    void fetch(`/api/reviews?subject=${encodeURIComponent(subject)}`)
      .then((response) => response.json() as Promise<{ reviews: Review[] }>)
      .then((data) => {
        if (active) setReviews(data.reviews.filter((review) => review.status === "approved"));
      })
      .catch(() => {
        if (active) setReviews([]);
      });

    return () => {
      active = false;
    };
  }, [subject]);

  const average =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
      : 0;

  return (
    <section className={styles.section} aria-label="Reviews">
      <div className={styles.head}>
        <h2 className={styles.title}>Reviews</h2>
        <ReviewSummary average={average} count={reviews.length} />
      </div>

      {reviews.length > 0 ? (
        <ul className={styles.list}>
          {reviews.map((review) => (
            <li key={review.id} className={styles.item}>
              <div className={styles.itemHead}>
                <Stars rating={review.rating} />
                <p className={styles.author}>{review.author}</p>
              </div>
              <p className={styles.body}>{review.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          No approved reviews yet. Reviews are checked by the business before they appear here.
        </p>
      )}

      <details className={styles.form}>
        <summary className={styles.formSummary}>Write a review</summary>
        <p className={styles.formNote}>
          If you have worked with Desired Homes Interiors, you can share a review. It will be held
          for approval before it appears.
        </p>
        <ReviewForm subject={subject} />
      </details>
    </section>
  );
}
