import Image from "next/image";
import styles from "./hero.module.css";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { copy } from "@/data/content/copy";
import { siteConfig } from "@/config/site";

/**
 * Hero: the supplied interior photography carries the composition, with the
 * brand statement sitting over it.
 *
 * The image is the LCP element and is preloaded eagerly. Text sits on a flat
 * scrim — no gradient — so contrast holds across the whole image without
 * washing it out (DESIGN.md §7, §12).
 */
export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.media}>
        <Image
          src="/editorial/hero.webp"
          alt="A furnished living room with full-length curtains at the windows"
          fill
          sizes="100vw"
          priority
          className={styles.image}
        />
      </div>

      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.inner}>
        <BrandLogo variant="complete" className={styles.logo} />

        <h1 className={styles.headline}>{siteConfig.proposition}</h1>

        <ButtonLink href="/shop" variant="primary" className={styles.cta}>
          {copy.hero.cta}
        </ButtonLink>

        <p className={styles.note}>{copy.hero.note}</p>
      </div>
    </section>
  );
}
