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
 * Fetches the approved reviews once, shows a rating summary and the reviews
 * themselves, and offers the submission form. `useSearchParams` is not used, so
 * the block needs no Suspense wrapper.
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
      ) : null}

      <div className={styles.form}>
        <h3 className={styles.formTitle}>Write a review</h3>
        <ReviewForm subject={subject} />
      </div>
    </section>
  );
}
