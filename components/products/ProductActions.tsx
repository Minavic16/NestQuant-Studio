"use client";

import styles from "./product-actions.module.css";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { trackWhatsAppClick } from "@/lib/analytics/analytics";
import { buildProductWhatsAppUrl } from "@/lib/whatsapp/whatsapp";
import { copy } from "@/data/content/copy";
import type { ContactDetails } from "@/lib/whatsapp/whatsapp";
import type { Product } from "@/data/types";

/** The two product-level conversion actions (DESIGN.md §8.5). */
export function ProductActions({
  product,
  contact,
}: {
  product: Product;
  /** Resolved once per render on the server and handed to the client. */
  contact: ContactDetails;
}) {
  return (
    <div className={styles.actions}>
      <EnquiryButton product={product} fullWidth />

      <a
        href={buildProductWhatsAppUrl(product, contact)}
        className={styles.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick("product")}
      >
        {copy.product.askOnWhatsApp}
      </a>
    </div>
  );
}
