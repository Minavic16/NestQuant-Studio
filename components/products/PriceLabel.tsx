import styles from "./price-label.module.css";
import { copy } from "@/data/content/copy";
import type { Product } from "@/data/types";

/**
 * A price is shown only when the business has supplied one. Otherwise the card
 * says "Price on request" — never an invented figure (DESIGN.md §11).
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
    return <p className={classes}>{formatNaira(product.price)}</p>;
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
