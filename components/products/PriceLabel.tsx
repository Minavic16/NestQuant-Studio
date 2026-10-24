import styles from "./price-label.module.css";
import { discountPercent } from "@/lib/products/pricing";
import { copy } from "@/data/content/copy";
import type { Product } from "@/data/types";

/**
 * A price is shown only when the business has supplied one. Otherwise the card
 * says "Price on request" — never an invented figure (DESIGN.md §11).
 *
 * When a higher pre-discount price is supplied, it is shown struck through next
 * to the current price, followed by the computed percentage saved.
 */
export function PriceLabel({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const classes = [styles.label, className ?? ""].filter(Boolean).join(" ");

  if (typeof product.price === "number" && product.price > 0) {
    const discount = discountPercent(product.price, product.compareAtPrice);

    return (
      <p className={classes}>
        <span className={styles.now}>{formatNaira(product.price)}</span>
        {discount !== null && typeof product.compareAtPrice === "number" ? (
          <>
            <span className={styles.was}>
              <span className="visually-hidden">Was </span>
              {formatNaira(product.compareAtPrice)}
            </span>
            <span className={styles.discount}>{discount}% off</span>
          </>
        ) : null}
      </p>
    );
  }

  return (
    <p className={[classes, styles.request].join(" ")}>
      {product.priceLabel ?? copy.product.priceOnRequest}
    </p>
  );
}

export function formatNaira(amount: number): string {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback for environments without full ICU data.
    return `₦${amount.toLocaleString("en-US")}`;
  }
}
