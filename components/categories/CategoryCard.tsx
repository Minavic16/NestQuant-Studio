import Link from "next/link";
import styles from "./category-card.module.css";
import { MediaSlot } from "@/components/products/MediaSlot";
import { ArrowRightIcon } from "@/components/ui/icons";
import { copy } from "@/data/content/copy";
import type { Category } from "@/data/types";

/** Sizes for a category tile: rail card on mobile, third of the grid on desktop. */
const CARD_SIZES = "(max-width: 767px) 62vw, 30vw";

/**
 * Image-led category tile. Photography is added by data; until then the frame is
 * an honest slot (DESIGN.md §7).
 */
export function CategoryCard({ category, count }: { category: Category; count: number }) {
  return (
    <Link href={`/categories/${category.slug}`} className={styles.card}>
      <MediaSlot
        image={null}
        ratio="4 / 5"
        sizes={CARD_SIZES}
        className={styles.media}
        label={`${copy.media.pending} — ${category.name}`}
      />

      <div className={styles.body}>
        <h3 className={styles.name}>{category.name}</h3>
        <p className={styles.count}>{copy.categories.itemCount(count)}</p>
        <span className={styles.cta}>
          {copy.explore.itemCta}
          <ArrowRightIcon className={styles.arrow} />
        </span>
      </div>
    </Link>
  );
}
