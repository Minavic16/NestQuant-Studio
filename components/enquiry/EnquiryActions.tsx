"use client";

import styles from "./enquiry-actions.module.css";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { trackEmailClick, trackWhatsAppClick } from "@/lib/analytics/analytics";
import { buildEnquiryMailtoUrl } from "@/lib/contact/mailto";
import { buildEnquiryWhatsAppUrl } from "@/lib/whatsapp/whatsapp";
import { copy } from "@/data/content/copy";
import type { ContactDetails } from "@/lib/whatsapp/whatsapp";
import type { EnquiryEntry } from "@/data/types";

/** The two ways an enquiry is sent (DESIGN.md §8.10). */
export function EnquiryActions({
  entries,
  contact,
}: {
  entries: readonly EnquiryEntry[];
  contact: ContactDetails;
}) {
  return (
    <div className={styles.actions}>
      <ButtonLink
        href={buildEnquiryWhatsAppUrl(entries, contact)}
        variant="primary"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick("enquiry")}
      >
        {copy.enquiry.whatsappCta}
      </ButtonLink>

      <ButtonLink
        href={buildEnquiryMailtoUrl(entries, contact)}
        variant="secondary"
        onClick={() => trackEmailClick("enquiry")}
      >
        {copy.enquiry.emailCta}
      </ButtonLink>

      <p className={styles.note}>
        Your selection opens in WhatsApp or your email app. You review and send the message
        yourself; this is a request for information, not an order.
      </p>
    </div>
  );
}
