import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/layout/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { WhatsAppChatButton } from "@/components/contact/WhatsAppChatButton";
import { resolveContact } from "@/lib/contact/resolve";
import { copy } from "@/data/content/copy";
import styles from "./page.module.css";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Enquire about curtains, accessories and window solutions on WhatsApp or by email.",
  path: "/contact",
});

export default async function ContactPage() {
  const contact = await resolveContact();

  return (
    <Section tone="paper">
      <PageHeader eyebrow={copy.contact.eyebrow} title={copy.contact.heading} />

      <dl className={styles.rows}>
        <div className={styles.row}>
          <dt className={styles.label}>{copy.contact.emailLabel}</dt>
          <dd className={styles.value}>
            <a href={`mailto:${contact.email}`} className={styles.link}>
              {contact.email}
            </a>
          </dd>
        </div>

        <div className={styles.row}>
          <dt className={styles.label}>{copy.contact.whatsappLabel}</dt>
          <dd className={styles.value}>
            <span className={styles.link}>{contact.whatsappNumber}</span>
          </dd>
        </div>
      </dl>

      <WhatsAppChatButton className={styles.cta} />

      <p className={styles.enquiryLink}>
        <Link href="/enquiry" className="link-underline">
          {copy.contact.enquiryLink}
        </Link>
      </p>
    </Section>
  );
}
