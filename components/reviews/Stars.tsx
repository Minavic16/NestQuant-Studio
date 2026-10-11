import styles from "./stars.module.css";

/**
 * Star rating, decorative. The numeric value is exposed to assistive
 * technology through the label, so the glyphs themselves can be hidden.
 */
export function Stars({ rating, size = "small" }: { rating: number; size?: "small" | "large" }) {
  const clamped = Math.min(5, Math.max(0, Math.round(rating)));

  return (
    <span
      className={[styles.stars, styles[size]].filter(Boolean).join(" ")}
      role="img"
      aria-label={`${rating} out of 5`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} aria-hidden="true" data-filled={index < clamped}>
          ★
        </span>
      ))}
    </span>
  );
}
