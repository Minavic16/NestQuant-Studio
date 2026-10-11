import styles from "./product-grid.module.css";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/data/types";

/** Responsive product grid: 2 columns on mobile, 3 on tablet, 4 on desktop. */
export function ProductGrid({
  products,
  priorityCount = 0,
  className,
}: {
  products: readonly Product[];
  /** Number of leading images to load eagerly (above the fold). */
  priorityCount?: number;
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <ul className={[styles.grid, className ?? ""].filter(Boolean).join(" ")}>
      {products.map((product, index) => (
        <li key={product.slug} className={styles.item}>
          <ProductCard product={product} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
