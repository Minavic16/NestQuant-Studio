/**
 * Test stub for `next/image`.
 *
 * Renders a plain `img` with the same src/alt/width/height contract, which is
 * all the components under test need.
 */
import { createElement, type CSSProperties } from "react";

type ImageProps = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  onError?: () => void;
};

export default function Image({
  src,
  alt = "",
  width,
  height,
  className,
  style,
  onError,
}: ImageProps) {
  return createElement("img", { src, alt, width, height, className, style, onError });
}
