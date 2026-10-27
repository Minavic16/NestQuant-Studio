import Image from "next/image";
import Link from "next/link";
import styles from "./hero.module.css";
import { ButtonLink } from "@/components/ui/ButtonLink";

/**
 * Editorial hero: the photograph carries the room, the copy explains the
 * business. The image is inspiration, not a claim about completed work, the
 * selected work section immediately below is the portfolio.
 *
 * The image is the LCP element and the only preloaded photograph on the page.
 */
export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.inner}>
        <div className={styles.media} data-page-enter="image">
          <Image
            src="/editorial/hero.webp"
            alt="A furnished bedroom with full-length brown curtains and sheer panels at the window"
            fill
            sizes="(max-width: 1023px) 100vw, 58vw"
            priority
            className={styles.image}
          />
        </div>

        <div className={styles.content}>
          <p className={styles.eyebrow}>Curtains · Accessories · Window solutions</p>

          <h1 id="hero-heading" className={styles.heading} data-page-enter>
            Curtains that bring a room together.
          </h1>

          <p className={styles.lede}>
            Explore curtains, accessories and window solutions, or tell us about the room you
            have in mind.
          </p>

          <div className={styles.actions} data-page-enter>
            <ButtonLink href="/shop" variant="primary">
              Explore the collection
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Discuss your space
            </ButtonLink>
          </div>

          <p className={styles.shopLink}>
            <Link href="/work" className="link-underline">
              View our work
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
