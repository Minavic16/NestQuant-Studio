import Link from "next/link";
import styles from "./help-offers.module.css";
import { Section } from "@/components/layout/Section";
import { MediaSlot } from "@/components/products/MediaSlot";
import { ArrowRightIcon } from "@/components/ui/icons";
import { categories, getCategoryProfile } from "@/data/categories";

/** The three real offers, with editorial photography and a specific next step. */
export function HelpOffers() {
  return (
    <Section tone="ivory" className={styles.section}>
      <div className={styles.head} data-reveal>
        <p className={styles.eyebrow}>What we help with</p>
        <h2 className={styles.heading}>Start with the part of the room that matters.</h2>
        <p className={styles.intro}>
          Browse the listed components, look through completed work, or tell us what you are
          trying to solve. Each route leads to a real next step.
        </p>
      </div>

      <ul className={styles.grid} data-reveal-group>
        {categories.map((category) => {
          const profile = getCategoryProfile(category.id);

          return (
            <li key={category.id} className={styles.item} data-reveal>
              <Link href={`/categories/${category.slug}`} className={styles.card}>
                <MediaSlot
                  image={{ src: profile.image, alt: profile.alt }}
                  alt={profile.alt}
                  ratio="4 / 5"
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 46vw, 30vw"
                  className={styles.frame}
                />
                <div className={styles.body}>
                  <h3 className={styles.title}>{category.name}</h3>
                  <p className={styles.short}>{profile.short}</p>
                  <span className={styles.cta}>
                    {profile.actionLabel}
                    <ArrowRightIcon className={styles.arrow} />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
