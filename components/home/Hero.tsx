"use client";

import Image from "next/image";
import styles from "./hero.module.css";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { copy } from "@/data/content/copy";
import { siteConfig } from "@/config/site";

/**
 * Hero: the supplied interior photography carries the composition.
 *
 * The image is the LCP element and the only preloaded image on the page. The
 * logo sits on it with its black field removed, so no box is visible.
 *
 * The lockup is the variant *without* the tagline: the headline underneath
 * already names the three services, and repeating them twice reads as noise
 * (DESIGN.md §12).
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
        <BrandLogo variant="lockup" transparent className={styles.logo} />

        <h1 className={styles.headline}>{siteConfig.proposition}</h1>

        <ButtonLink href="/shop" variant="primary" className={styles.cta}>
          {copy.hero.cta}
        </ButtonLink>

        <p className={styles.note}>{copy.hero.note}</p>
      </div>
    </section>
  );
}
