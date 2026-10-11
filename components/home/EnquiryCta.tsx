import styles from "./enquiry-cta.module.css";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { copy } from "@/data/content/copy";

/** The closing conversion band (DESIGN.md §8.3). */
export function EnquiryCta() {
  return (
    <section className={["on-dark", styles.band].filter(Boolean).join(" ")}>
      <div className={styles.inner}>
        <Eyebrow>{copy.enquiryCta.eyebrow}</Eyebrow>
        <h2 className={styles.heading}>{copy.enquiryCta.heading}</h2>
        <ButtonLink href="/enquiry" variant="primary" className={styles.cta}>
          {copy.enquiryCta.cta}
        </ButtonLink>
      </div>
    </section>
  );
}
