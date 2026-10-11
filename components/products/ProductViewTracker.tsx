"use client";

import { useEffect } from "react";
import { trackProductView } from "@/lib/analytics/analytics";

/** Fires the product-view event once, behind the analytics abstraction. */
export function ProductViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackProductView(slug);
  }, [slug]);

  return null;
}
