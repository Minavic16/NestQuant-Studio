"use client";

import { useMemo } from "react";
import styles from "./enquiry-view.module.css";
import { EnquiryActions } from "./EnquiryActions";
import { EnquiryRow } from "./EnquiryRow";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { useEnquiry } from "@/lib/enquiry/context";
import { copy } from "@/data/content/copy";
import type { ContactDetails } from "@/lib/whatsapp/whatsapp";
import type { EnquiryEntry, Product } from "@/data/types";

/**
 * The enquiry list. It renders the same markup on the server and on the first
 * client paint (an empty list) and fills in from localStorage immediately after
 * hydration, so there is no mismatch and no flash (ARCHITECTURE.md §5).
 */
export function EnquiryView({
  products,
  contact,
}: {
  products: readonly Product[];
  contact: ContactDetails;
}) {
  const { items, clear } = useEnquiry();

  const entries = useMemo<EnquiryEntry[]>(() => {
    const bySlug = new Map(products.map((product) => [product.slug, product]));

    return items.flatMap((item) => {
      const product = bySlug.get(item.slug);
      return product ? [{ product, quantity: item.quantity }] : [];
    });
  }, [items, products]);

  if (entries.length === 0) {
    return (
      <div className={styles.empty} data-testid="enquiry-empty">
        <h2 className={styles.emptyTitle}>{copy.enquiry.empty.title}</h2>
        <p className={styles.emptyBody}>{copy.enquiry.empty.body}</p>
        <ButtonLink href="/shop" variant="primary" className={styles.emptyCta}>
          {copy.enquiry.empty.cta}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className={styles.view}>
      <ul className={styles.list}>
        {entries.map((entry) => (
          <EnquiryRow key={entry.product.slug} entry={entry} />
        ))}
      </ul>

      <EnquiryActions entries={entries} contact={contact} />

      <div className={styles.clear}>
        <Button variant="quiet" onClick={clear}>
          {copy.enquiry.clear}
        </Button>
      </div>
    </div>
  );
}
