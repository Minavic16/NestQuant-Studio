"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import styles from "./button.module.css";

export type ButtonVariant = "primary" | "secondary" | "quiet";

type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children" | "className">;

/** A control that navigates: identical styling to `Button`, correct semantics. */
export function ButtonLink({
  href,
  variant = "primary",
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = [styles.button, styles[variant], fullWidth ? styles.full : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
