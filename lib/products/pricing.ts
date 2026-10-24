/**
 * Discount arithmetic, kept in one place so the card, the product page and any
 * future feed all show the same number.
 */
export function discountPercent(
  price: number | undefined,
  compareAtPrice: number | undefined,
): number | null {
  if (typeof price !== "number" || typeof compareAtPrice !== "number") return null;
  if (price <= 0 || compareAtPrice <= price) return null;

  return Math.round(((compareAtPrice - price) / compareAtPrice) * 1000) / 10;
}
