"use client";

import { useState } from "react";
import styles from "./enquiry-button.module.css";
import { Button } from "@/components/ui/Button";
import { trackEnquiryAdded } from "@/lib/analytics/analytics";
import { useEnquiry } from "@/lib/enquiry/context";
import { copy } from "@/data/content/copy";
import type { Product } from "@/data/types";

/**
 * Adds a product to the enquiry list. The store keeps the list idempotent, so a
 * second press is answered by disabling the control rather than duplicating.
 */
export function EnquiryButton({
  product,
  fullWidth = false,
}: {
  product: Product;
  fullWidth?: boolean;
}) {
  const { add, has } = useEnquiry();
  const [justAdded, setJustAdded] = useState(false);
  const alreadyAdded = has(product.slug);
  const isAdded = alreadyAdded || justAdded;

  return (
    <>
      <Button
        variant="primary"
        fullWidth={fullWidth}
        className={isAdded ? styles.added : undefined}
        disabled={isAdded}
        onClick={() => {
          if (isAdded) return;
          add(product.slug);
          trackEnquiryAdded(product.slug);
          setJustAdded(true);
        }}
      >
        {isAdded ? copy.product.addedToEnquiry : copy.product.addToEnquiry}
      </Button>

      <span role="status" aria-live="polite" className="visually-hidden">
        {isAdded ? `${product.name} added to your enquiry list.` : ""}
      </span>
    </>
  );
}
