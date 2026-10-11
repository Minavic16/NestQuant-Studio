/**
 * Test stub for `next/link`.
 *
 * The real Link requires the Next.js runtime; component tests only need an
 * anchor with the right href and semantics.
 */
import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children?: ReactNode;
};

export default function Link({ href, children, ...rest }: LinkProps) {
  return createElement("a", { href, ...rest }, children);
}
