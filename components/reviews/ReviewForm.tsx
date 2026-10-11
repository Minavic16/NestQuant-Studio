"use client";

import { useState } from "react";
import styles from "./review-form.module.css";

/**
 * Visitor review form. Submissions are held for approval before they appear on
 * the site, so the form says so plainly rather than promising instant
 * publication (DESIGN.md §11).
 */

const RATINGS = [
  { value: 5, label: "Excellent" },
  { value: 4, label: "Good" },
  { value: 3, label: "Average" },
  { value: 2, label: "Poor" },
  { value: 1, label: "Very poor" },
] as const;

export function ReviewForm({ subject }: { subject: string }) {
  const [rating, setRating] = useState(0);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, rating, author, body }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setState("error");
        setMessage(payload?.error ?? "Could not send your review. Please try again.");
        return;
      }

      setState("sent");
      setMessage("Thank you. Your review has been received and will appear here once approved.");
      setRating(0);
      setAuthor("");
      setBody("");
    } catch {
      setState("error");
      setMessage("Could not send your review. Please check your connection and try again.");
    }
  }

  if (state === "sent") {
    return (
      <div className={styles.panel}>
        <p className={styles.sent} role="status">
          {message}
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Your rating</legend>
        <div className={styles.ratings}>
          {RATINGS.map((option) => (
            <label key={option.value} className={styles.rating}>
              <input
                type="radio"
                name="rating"
                value={option.value}
                checked={rating === option.value}
                onChange={() => setRating(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className={styles.field}>
        <span className={styles.label}>Your name</span>
        <input
          className={styles.input}
          value={author}
          maxLength={60}
          autoComplete="name"
          required
          onChange={(event) => setAuthor(event.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Your review</span>
        <textarea
          className={styles.textarea}
          rows={4}
          value={body}
          maxLength={1200}
          required
          onChange={(event) => setBody(event.target.value)}
        />
      </label>

      {message ? (
        <p className={styles.error} role="alert">
          {message}
        </p>
      ) : null}

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Submit review"}
        </button>
        <p className={styles.note}>Reviews are approved by the business before they appear.</p>
      </div>
    </form>
  );
}
