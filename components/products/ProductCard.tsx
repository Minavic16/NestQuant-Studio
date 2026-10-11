import Link from "next/link";
import styles from "./product-card.module.css";
import { MediaSlot } from "./MediaSlot";
import { PriceLabel } from "./PriceLabel";
import { ArrowRightIcon } from "@/components/ui/icons";
import { copy } from "@/data/content/copy";
import { getCategoryById } from "@/data/categories";
import type { Product } from "@/data/types";

/** Card sizes: 2 columns on mobile, 3 on tablet, 4 on large desktop. */
export const PRODUCT_CARD_SIZES = "(max-width: 767px) 46vw, (max-width: 1279px) 30vw, 276px";

/**
 * The whole card is a single link: one accessible name, one hit target, and the
 * imagery leads the composition (DESIGN.md §8.5).
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  /** Priority loading for cards that appear above the fold. */
  priority?: boolean;
}) {
  const category = getCategoryById(product.category);
  const image = product.images[0] ?? null;

  return (
    <article className={styles.card}>
      <Link href={`/shop/${product.slug}`} className={styles.link}>
        <MediaSlot
          image={image}
          alt={image?.alt ?? ""}
          sizes={PRODUCT_CARD_SIZES}
          priority={priority}
          className={styles.media}
        />

        <div className={styles.body}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.category}>{category?.name ?? product.category}</p>
          <PriceLabel product={product} className={styles.price} />
          <span className={styles.details}>
            {copy.product.viewDetails}
            <ArrowRightIcon className={styles.arrow} />
          </span>
        </div>
      </Link>
    </article>
  );
}
