"use client";

import { useState } from "react";
import styles from "./product-gallery.module.css";
import { MediaSlot } from "./MediaSlot";
import type { Product } from "@/data/types";

/** Gallery sizes: single column above 1024px, full width below. */
export const PRODUCT_GALLERY_SIZES = "(max-width: 1023px) 88vw, 46vw";

/**
 * Product image gallery. The first image is eager and priority-loaded; the rest
 * are lazy. Aspect ratios are reserved, so nothing shifts (ARCHITECTURE.md §8).
 */
export function ProductGallery({ product }: { product: Product }) {
  const images = product.images;
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <MediaSlot
        ratio="4 / 5"
        fit="contain"
        sizes={PRODUCT_GALLERY_SIZES}
        priority
        className={styles.main}
      />
    );
  }

  const active = images[activeIndex] ?? images[0];
  if (!active) return null;

  return (
    <div className={styles.gallery}>
      <MediaSlot
        key={active.src}
        image={active}
        alt={active.alt}
        ratio="4 / 5"
        fit="contain"
        sizes={PRODUCT_GALLERY_SIZES}
        priority
        className={styles.main}
      />

      {images.length > 1 && (
        <ul className={styles.thumbs}>
          {images.map((image, index) => (
            <li key={image.src}>
              <button
                type="button"
                className={[styles.thumb, index === activeIndex ? styles.active : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActiveIndex(index)}
                aria-pressed={index === activeIndex}
                aria-label={`Image ${index + 1} of ${images.length}`}
              >
                <MediaSlot image={image} alt="" ratio="1 / 1" sizes="5.5rem" fit="cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
