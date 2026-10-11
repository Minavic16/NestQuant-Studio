import styles from "./hero.module.css";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { copy } from "@/data/content/copy";
import { siteConfig } from "@/config/site";

/**
 * Hero. A black band so the supplied lockup sits on its own field, with the
 * proposition as the only text (DESIGN.md §8.3).
 *
 * When interior photography is supplied, the lockup becomes an image slot in the
 * same position — the composition does not change.
 */
export function Hero() {
  return (
    <section className={["on-dark", styles.hero].filter(Boolean).join(" ")}>
      <div className={styles.inner}>
        <BrandLogo variant="lockup" className={styles.logo} priority />

        <h1 className={styles.headline}>{siteConfig.proposition}</h1>

        <ButtonLink href="/shop" variant="primary" className={styles.cta}>
          {copy.hero.cta}
        </ButtonLink>

        <p className={styles.note}>{copy.hero.note}</p>
      </div>
    </section>
  );
}
