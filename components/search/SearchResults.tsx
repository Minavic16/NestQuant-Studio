import Link from "next/link";
import styles from "./search-results.module.css";
import { MediaSlot } from "@/components/products/MediaSlot";
import { getCategoryById } from "@/data/categories";
import type { Product } from "@/data/types";

/** Result rows shared by the search panel. Media leads, text supports. */
export function SearchResults({
  products,
  onNavigate,
}: {
  products: readonly Product[];
  onNavigate?: () => void;
}) {
  if (products.length === 0) return null;

  return (
    <ul className={styles.list}>
      {products.map((product) => {
        const category = getCategoryById(product.category);

        return (
          <li key={product.slug}>
            <Link href={`/shop/${product.slug}`} className={styles.result} onClick={onNavigate}>
              <MediaSlot
                image={product.images[0] ?? null}
                alt=""
                ratio="1 / 1"
                sizes="3.5rem"
                className={styles.media}
              />
              <span className={styles.body}>
                <span className={styles.name}>{product.name}</span>
                <span className={styles.category}>{category?.name ?? product.category}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
