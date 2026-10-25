"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/data/types";
import { copy } from "@/data/content/copy";
import styles from "./media-slot.module.css";

/**
 * Media frame with an honest placeholder.
 *
 * When no photography has been supplied the frame renders a labelled ivory slot
 * instead of a fake image (DESIGN.md §7). The aspect ratio is reserved in CSS, so
 * the slot never shifts layout, and a failed image load falls back to the same
 * neutral frame rather than a broken icon.
 */

export type MediaSlotProps = {
  image?: ProductImage | null;
  /** Alt text for a real image; ignored by the placeholder (which is decorative). */
  alt?: string;
  /** CSS aspect ratio, e.g. "4 / 5". */
  ratio?: string;
  /** Responsive `sizes` attribute, required so cards download the right derivative. */
  sizes: string;
  /** Cover fills the frame; contain never crops (used for product detail). */
  fit?: "cover" | "contain";
  /** Priority loading for the first visible image. */
  priority?: boolean;
  className?: string;
  label?: string;
};

export function MediaSlot({
  image,
  alt = "",
  ratio = "4 / 5",
  sizes,
  fit = "cover",
  priority = false,
  className,
  label = copy.media.pending,
}: MediaSlotProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(image) && !failed;

  const classes = [styles.frame, fit === "contain" ? styles.contain : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={{ aspectRatio: ratio }} data-testid="media-slot">
      {showImage && image ? (
        <Image
          src={image.src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className={styles.image}
        />
      ) : (
        <span className={styles.placeholder} aria-hidden="true">
          {label}
        </span>
      )}
    </div>
  );
}
