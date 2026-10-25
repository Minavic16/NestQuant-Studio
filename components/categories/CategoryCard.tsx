import Link from "next/link";
import styles from "./category-card.module.css";
import { MediaSlot } from "@/components/products/MediaSlot";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getCategoryProfile } from "@/data/categories";
import type { Category } from "@/data/types";

const CARD_SIZES = "(max-width: 767px) 92vw, (max-width: 1023px) 30vw, 30vw";

/**
 * Image-led category tile. Counts are shown only when the collection actually
 * contains products, so a conversation-led category never reads as empty stock.
 */
export function CategoryCard({ category, count }: { category: Category; count: number }) {
  const profile = getCategoryProfile(category.id);

  return (
    <Link href={`/categories/${category.slug}`} className={styles.card}>
      <MediaSlot
        image={{ src: profile.image, alt: profile.alt }}
        alt={profile.alt}
        ratio="4 / 5"
        sizes={CARD_SIZES}
        className={styles.media}
      />

      <div className={styles.body}>
        <h3 className={styles.name}>{category.name}</h3>
        <p className={styles.description}>{profile.short}</p>
        <span className={styles.footer}>
          {count > 0 ? (
            <span className={styles.count}>
              {count} {count === 1 ? "piece" : "pieces"}
            </span>
          ) : null}
          <span className={styles.cta}>
            {profile.actionLabel}
            <ArrowRightIcon className={styles.arrow} />
          </span>
        </span>
      </div>
    </Link>
  );
}
