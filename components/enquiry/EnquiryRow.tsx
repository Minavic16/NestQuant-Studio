"use client";

import Link from "next/link";
import styles from "./enquiry-row.module.css";
import { MediaSlot } from "@/components/products/MediaSlot";
import { PriceLabel } from "@/components/products/PriceLabel";
import { QuantityStepper } from "./QuantityStepper";
import { Button } from "@/components/ui/Button";
import { trackEnquiryRemoved } from "@/lib/analytics/analytics";
import { useEnquiry } from "@/lib/enquiry/context";
import { copy } from "@/data/content/copy";
import { getCategoryById } from "@/data/categories";
import type { EnquiryEntry } from "@/data/types";

/** One line of the enquiry list: media, name, price, quantity, remove. */
export function EnquiryRow({ entry }: { entry: EnquiryEntry }) {
  const { remove, setQuantity } = useEnquiry();
  const { product, quantity } = entry;
  const category = getCategoryById(product.category);

  return (
    <li className={styles.row}>
      <Link href={`/shop/${product.slug}`} className={styles.mediaLink} tabIndex={-1} aria-hidden="true">
        <MediaSlot
          image={product.images[0] ?? null}
          alt=""
          ratio="1 / 1"
          sizes="5.5rem"
          className={styles.media}
        />
      </Link>

      <div className={styles.body}>
        <h3 className={styles.name}>
          <Link href={`/shop/${product.slug}`} className={styles.nameLink}>
            {product.name}
          </Link>
        </h3>
        <p className={styles.category}>{category?.name ?? product.category}</p>
        <PriceLabel product={product} />
      </div>

      <div className={styles.controls}>
        <QuantityStepper
          value={quantity}
          onChange={(next) => setQuantity(product.slug, next)}
          groupLabel={copy.enquiry.quantityLabel(product.name)}
        />
        <Button
          variant="quiet"
          onClick={() => {
            remove(product.slug);
            trackEnquiryRemoved(product.slug);
          }}
          aria-label={copy.enquiry.removeLabel(product.name)}
        >
          {copy.enquiry.remove}
        </Button>
      </div>
    </li>
  );
}
