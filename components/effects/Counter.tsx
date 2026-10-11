"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts up to a value the first time it scrolls into view.
 *
 * Falls back to the final value immediately when the visitor prefers reduced
 * motion, or when the element never becomes visible — a number is never hidden
 * behind an animation (DESIGN.md §6).
 */
export function Counter({
  value,
  duration = 700,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const reference = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const element = reference.current;
    if (!element) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // `display` is initialised to `value`, so there is nothing to reset: the
    // animation simply never runs.
    if (reduced || value === 0) return;

    let frame = 0;
    let start: number | null = null;

    const step = (time: number) => {
      if (start === null) start = time;
      const progress = Math.min(1, (time - start) / duration);
      // Ease-out cubic: fast start, gentle settle.
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <span ref={reference} className={className}>
      {display.toLocaleString("en-NG")}
    </span>
  );
}
