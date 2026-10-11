import styles from "./category-rail.module.css";
import { CategoryCard } from "./CategoryCard";
import type { Category, Product } from "@/data/types";

/**
 * Category discovery: a horizontal rail on mobile (lookbook behaviour) and a
 * three-across grid from tablet up (DESIGN.md §8.13).
 */
export function CategoryRail({
  categories,
  products,
}: {
  categories: readonly Category[];
  products: readonly Product[];
}) {
  return (
    <ul className={styles.rail}>
      {categories.map((category) => (
        <li key={category.id} className={styles.item}>
          <CategoryCard
            category={category}
            count={products.filter((product) => product.category === category.id).length}
          />
        </li>
      ))}
    </ul>
  );
}
