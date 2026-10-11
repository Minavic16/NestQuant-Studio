import Image from "next/image";
import type { CSSProperties } from "react";
import styles from "./brand-logo.module.css";

/**
 * The supplied logo, served as an image — never recreated (DESIGN.md §1).
 *
 * Variants are pre-generated crops of the original file by
 * `scripts/prepare-brand-assets.mjs`. Intrinsic dimensions come from the crop;
 * the display size is set by the consumer's CSS so nothing shifts.
 */

export type LogoVariant = "monogram" | "lockup" | "complete";

const LOGO_VARIANTS: Record<
  LogoVariant,
  { src: string; width: number; height: number; sizes: string }
> = {
  // Used as a small brand chip in the header and footer.
  monogram: { src: "/brand/logo-monogram.jpg", width: 288, height: 202, sizes: "44px" },
  // Hero: full-bleed on mobile, 360px wide from tablet up.
  lockup: {
    src: "/brand/logo-lockup.jpg",
    width: 720,
    height: 540,
    sizes: "(max-width: 767px) 62vw, 360px",
  },
  // About band: 384px wide on desktop, 72vw on mobile.
  complete: {
    src: "/brand/logo-complete.jpg",
    width: 840,
    height: 677,
    sizes: "(max-width: 767px) 72vw, 384px",
  },
};

export type BrandLogoProps = {
  variant: LogoVariant;
  /** Override the default responsive `sizes` for this variant. */
  sizes?: string;
  className?: string;
  priority?: boolean;
  /** Optional inline size, e.g. `{ "--logo-width": "12rem" }`. */
  style?: CSSProperties;
};

export function BrandLogo({
  variant,
  sizes,
  className,
  priority = false,
  style,
}: BrandLogoProps) {
  const logo = LOGO_VARIANTS[variant];

  return (
    <Image
      src={logo.src}
      alt="Desired Homes Interiors"
      width={logo.width}
      height={logo.height}
      sizes={sizes ?? logo.sizes}
      priority={priority}
      style={style}
      className={[styles.logo, className ?? ""].filter(Boolean).join(" ")}
    />
  );
}
