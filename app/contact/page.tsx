import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/layout/Section";
import { ContactBuilder } from "@/components/contact/ContactBuilder";
import { JsonLd } from "@/components/seo/JsonLd";
import { resolveContact } from "@/lib/contact/resolve";
import { formatWhatsAppNumber, whatsappChatUrl } from "@/lib/whatsapp/whatsapp";
import { breadcrumbData } from "@/lib/seo/json-ld";
import styles from "./page.module.css";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Discuss curtains, accessories or window solutions with Desired Homes Interiors. Prepare a message for WhatsApp or email, with no form submission required.",
  path: "/contact",
});

type ContactPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const [contact, params] = await Promise.all([resolveContact(), searchParams]);
  const reference = firstValue(params.subject).slice(0, 160);
  const message = firstValue(params.message).slice(0, 2000);

  return (
    <Section tone="paper" className={styles.page}>
      <JsonLd data={breadcrumbData([{ name: "Contact", path: "/contact" }])} />

      <div className={styles.layout}>
        <aside className={styles.aside}>
          <p className={styles.eyebrow}>Contact</p>
          <h1 className={styles.heading}>Let&rsquo;s discuss your space.</h1>
          <p className={styles.intro}>
            Tell us about the room, the window or the piece you are considering. A photo and a
            rough idea are enough to start, and you do not need a complete brief.
          </p>

          <div className={styles.channels}>
            <div className={styles.channel}>
              <p className={styles.channelLabel}>Email</p>
              <a href={`mailto:${contact.email}`} className={styles.channelLink}>
                {contact.email}
              </a>
            </div>

            <div className={styles.channel}>
              <p className={styles.channelLabel}>WhatsApp</p>
              <a
                href={whatsappChatUrl(contact)}
                className={styles.channelLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {formatWhatsAppNumber(contact.whatsappNumber)}
              </a>
            </div>
          </div>

          <div className={styles.guidance}>
            <h2 className={styles.guidanceTitle}>Useful to include</h2>
            <ul className={styles.guidanceList}>
              <li>A photo of the room or window.</li>
              <li>Approximate width and drop, if you know them.</li>
              <li>A project or product from this site that you like.</li>
            </ul>
          </div>

          <p className={styles.enquiryNote}>
            Looking for specific pieces?{" "}
            <Link href="/enquiry" className={styles.link}>
              Review your enquiry list
            </Link>{" "}
            or{" "}
            <Link href="/shop" className={styles.link}>
              browse the collection
            </Link>
            .
          </p>
        </aside>

        <ContactBuilder contact={contact} initialReference={reference} initialMessage={message} />
      </div>

      <figure className={styles.editorial}>
        <div className={styles.editorialMedia}>
          <Image
            src="/editorial/contact-room.webp"
            alt="Sheer white curtains drawn across a tall window, with heavier curtains at either edge"
            fill
            sizes="(max-width: 1023px) 100vw, 90vw"
            className={styles.editorialImage}
          />
        </div>
        <figcaption className={styles.editorialCaption}>
          Editorial image of a styled room for reference, not a completed project.
        </figcaption>
      </figure>
    </Section>
  );
}
