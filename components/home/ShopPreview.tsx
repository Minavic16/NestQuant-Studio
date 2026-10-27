import Link from "next/link";
import styles from "./shop-preview.module.css";
import { Section } from "@/components/layout/Section";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { Product } from "@/data/types";

/**
 * A deliberately separate product moment: these are components, not completed
 * rooms. It sits after the work and the service explanation.
 */
export function ShopPreview({ products, total }: { products: readonly Product[]; total: number }) {
  return (
    <Section tone="paper" className={styles.section}>
      <div className={styles.head} data-reveal>
        <div className={styles.text}>
          <p className={styles.eyebrow}>Finishing details</p>
          <h2 className={styles.heading}>The components that finish a window.</h2>
          <p className={styles.intro}>
            Brackets, rods, rings, tiebacks and hooks from the collection. These are pieces to
            enquire about, not completed interiors.
          </p>
        </div>
        <Link href="/shop" className={styles.allLink}>
          View all {total} products
          <ArrowRightIcon className={styles.arrow} />
        </Link>
      </div>

      <div data-reveal>
        <ProductGrid products={products} className={styles.grid} />
      </div>
    </Section>
  );
}
