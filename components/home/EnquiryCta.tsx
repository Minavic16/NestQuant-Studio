import Link from "next/link";
import styles from "./enquiry-cta.module.css";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { resolveContact } from "@/lib/contact/resolve";
import { buildWhatsAppUrl, formatWhatsAppNumber } from "@/lib/whatsapp/whatsapp";

/**
 * The closing conversion panel. The primary route is the general contact page,
 * which works with no products selected; WhatsApp is the honest direct
 * alternative with a prefilled message.
 */
export async function EnquiryCta() {
  const contact = await resolveContact();
  const whatsappHref = buildWhatsAppUrl(
    [
      "Hello Desired Homes Interiors,",
      "",
      "I would like to discuss a room or a window treatment.",
      "I can share a photo and approximate measurements.",
    ].join("\n"),
    contact,
  );

  return (
    <section className={`on-dark ${styles.band}`} aria-labelledby="closing-heading">
      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>Start a conversation</p>
          <h2 id="closing-heading" className={styles.heading}>
            Let&rsquo;s discuss your space.
          </h2>
          <p className={styles.body}>
            Tell us what you are working on — a window that needs dressing, a room that feels
            unfinished, or a product you would like to compare. A photo and a rough idea are
            enough to begin.
          </p>
        </div>

        <div className={styles.actions}>
          <ButtonLink href="/contact" variant="primary" className={styles.primary}>
            Discuss your space
          </ButtonLink>
          <a
            href={whatsappHref}
            className={styles.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            Or message on WhatsApp
          </a>
          <p className={styles.detail}>{formatWhatsAppNumber(contact.whatsappNumber)}</p>
          <p className={styles.listNote}>
            Looking for a specific piece?{" "}
            <Link href="/enquiry" className={styles.listLink}>
              Review your enquiry list
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
