import Image from "next/image";
import type { CSSProperties } from "react";
import styles from "./brand-logo.module.css";

/**
 * Brand assets for Desired Homes Interiors.
 *
 * The SVG lockup and monogram are traced from the supplied artwork, so the
 * letterforms are the client's own. The complete square is the same lockup on
 * the brand's dark field, used for structured data.
 */

export type LogoVariant = "monogram" | "lockup" | "complete";

const LOGO_VARIANTS: Record<
  LogoVariant,
  { src: string; width: number; height: number; sizes: string }
> = {
  // Small ivory brand chip for the dark dashboard header.
  monogram: {
    src: "/brand/desired-homes-monogram-light.svg",
    width: 825,
    height: 789,
    sizes: "44px",
  },
  // Full horizontal lockup, ink on light surfaces.
  lockup: {
    src: "/brand/desired-homes-logo.svg",
    width: 1764,
    height: 789,
    sizes: "(max-width: 767px) 62vw, 360px",
  },
  // Square lockup on the dark field, for structured data and social surfaces.
  complete: {
    src: "/brand/logo-complete.png",
    width: 1200,
    height: 1200,
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
