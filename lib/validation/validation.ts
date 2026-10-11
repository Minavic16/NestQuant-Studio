import type { EnquiryItem } from "@/data/types";

/**
 * Validation helpers. Everything that enters the application from outside
 * (browser storage, URL params) is checked here before it is trusted.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 80;

export const MAX_ITEM_QUANTITY = 99;
export const MAX_ENQUIRY_ITEMS = 50;

export function isValidSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= MAX_SLUG_LENGTH && SLUG_PATTERN.test(value);
}

export function isValidQuantity(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= MAX_ITEM_QUANTITY
  );
}

/**
 * Validate and de-duplicate a persisted enquiry list. Any untrustworthy value
 * results in an empty list rather than a partially-trusted one — the worst case
 * is an empty enquiry, never corrupt state.
 */
export function parseEnquiryItems(value: unknown): EnquiryItem[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const items: EnquiryItem[] = [];

  for (const entry of value) {
    if (items.length >= MAX_ENQUIRY_ITEMS) break;
    if (typeof entry !== "object" || entry === null) continue;

    const { slug, quantity } = entry as { slug?: unknown; quantity?: unknown };
    if (!isValidSlug(slug) || !isValidQuantity(quantity)) continue;
    if (seen.has(slug)) continue;

    seen.add(slug);
    items.push({ slug, quantity });
  }

  return items;
}

/** Clamp a user-supplied quantity into the supported range. */
export function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(Math.floor(value), 1), MAX_ITEM_QUANTITY);
}
