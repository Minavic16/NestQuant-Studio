"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./review-moderation.module.css";
import { Stars } from "@/components/reviews/Stars";

/**
 * Review moderation queue.
 *
 * Submissions arrive as `pending` and stay invisible on the website until they
 * are approved here. Nothing a visitor writes is ever published automatically
 * (DESIGN.md §11).
 */

type Review = {
  id: string;
  subject: string;
  productName: string;
  author: string;
  rating: number;
  body: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
};

const STATUS_LABEL: Record<Review["status"], string> = {
  pending: "Awaiting approval",
  approved: "Published",
  rejected: "Rejected",
};

export function ReviewModeration() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [filter, setFilter] = useState<Review["status"] | "all">("pending");
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/reviews");
      const data = (await response.json()) as { reviews: Review[] };
      setReviews(data.reviews);
    } catch {
      setStatus("Could not load reviews.");
    }
  }, []);

  useEffect(() => {
    // Deferred by a tick so the fetch result never lands synchronously inside
    // the effect itself.
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function moderate(id: string, next: Review["status"] | "delete") {
    setStatus(null);

    const response =
      next === "delete"
        ? await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, { method: "DELETE" })
        : await fetch("/api/admin/reviews", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: next }),
          });

    if (!response.ok) {
      setStatus("That action failed. Please try again.");
      return;
    }

    setStatus(next === "delete" ? "Review deleted." : `Review ${STATUS_LABEL[next].toLowerCase()}.`);
    await load();
  }

  if (reviews === null) {
    return <p className={styles.state}>Loading reviews…</p>;
  }

  const visible = reviews.filter((review) => filter === "all" || review.status === filter);
  const counts = {
    pending: reviews.filter((review) => review.status === "pending").length,
    approved: reviews.filter((review) => review.status === "approved").length,
    rejected: reviews.filter((review) => review.status === "rejected").length,
  };

  return (
    <div className={styles.root}>
      <div className={styles.filters} role="group" aria-label="Filter reviews">
        {(["pending", "approved", "rejected", "all"] as const).map((option) => (
          <button
            key={option}
            type="button"
            className={[styles.filter, filter === option ? styles.filterActive : ""]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={filter === option}
            onClick={() => setFilter(option)}
          >
            {option === "all" ? "All" : STATUS_LABEL[option]}
            <span className={styles.count}>
              {option === "all" ? reviews.length : counts[option]}
            </span>
          </button>
        ))}
      </div>

      <div aria-live="polite" className={styles.status}>
        {status}
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty}>
          {filter === "pending"
            ? "No reviews are waiting. New submissions appear here for your approval."
            : "Nothing to show in this view."}
        </p>
      ) : (
        <ul className={styles.list}>
          {visible.map((review) => (
            <li key={review.id} className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <p className={styles.author}>{review.author}</p>
                  <p className={styles.meta}>
                    <Stars rating={review.rating} />
                    <span>
                      {review.productName ? `on ${review.productName}` : "about the business"}
                    </span>
                    <span>{new Date(review.createdAt).toLocaleDateString("en-GB")}</span>
                  </p>
                </div>
                <span className={styles.badge} data-status={review.status}>
                  {STATUS_LABEL[review.status]}
                </span>
              </div>

              <p className={styles.body}>{review.body}</p>

              <div className={styles.actions}>
                {review.status !== "approved" ? (
                  <button
                    type="button"
                    className={styles.approve}
                    onClick={() => void moderate(review.id, "approved")}
                  >
                    Approve & publish
                  </button>
                ) : null}
                {review.status !== "rejected" ? (
                  <button
                    type="button"
                    className={styles.reject}
                    onClick={() => void moderate(review.id, "rejected")}
                  >
                    Reject
                  </button>
                ) : null}
                <button
                  type="button"
                  className={styles.delete}
                  onClick={() => void moderate(review.id, "delete")}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

