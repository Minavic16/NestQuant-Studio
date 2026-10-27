import Link from "next/link";
import Image from "next/image";
import styles from "./brand-statement.module.css";
import { Section } from "@/components/layout/Section";
import { ArrowRightIcon } from "@/components/ui/icons";

/**
 * The business introduction. Only supplied facts are stated: the business name,
 * Desire Nwakor's role, and the categories visible in the catalogue and work.
 * The image is a material study, not a portrait the business has not provided.
 */
export function BrandStatement() {
  return (
    <Section tone="ivory" className={styles.section}>
      <div className={styles.layout}>
        <figure className={styles.figure} data-reveal>
          <div className={styles.media}>
            <Image
              src="/editorial/about-material.webp"
              alt="Close-up of gathered beige curtain fabric"
              fill
              sizes="(max-width: 1023px) 100vw, 46vw"
              className={styles.image}
            />
          </div>
          <figcaption className={styles.caption}>
            Material study of linen and gathered curtain fabric.
          </figcaption>
        </figure>

        <div className={styles.content} data-reveal>
          <p className={styles.eyebrow}>About Desired Homes Interiors</p>
          <h2 className={styles.heading}>A considered eye for the details.</h2>
          <p className={styles.body}>
            Desired Homes Interiors is led by Desire Nwakor, CEO &amp; Creative Director. The work
            shown here centres on curtains and the finishing details around a window: the drape,
            the pelmet, the rod and the tieback.
          </p>
          <p className={styles.body}>
            The collection of brackets, rods, rings and hooks sits alongside that project work, so
            a room can be considered from the window outwards.
          </p>

          <div className={styles.signature}>
            <p className={styles.name}>Desire Nwakor</p>
            <p className={styles.role}>CEO &amp; Creative Director</p>
          </div>

          <Link href="/about" className={styles.link}>
            More about the business
            <ArrowRightIcon className={styles.arrow} />
          </Link>
        </div>
      </div>
    </Section>
  );
}
