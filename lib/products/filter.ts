import type { CategoryId, Product } from "@/data/types";
import { byName } from "./repository";

/** Filters accepted by the shop view. */
export type ProductFilters = {
  /** Free-text query; empty or whitespace-only means "no filter". */
  query?: string;
  /** `"all"` or a specific category id. */
  category?: CategoryId | "all";
};

/** Category filtering shared by the shop view and the category pages. */
export function filterByCategory(
  products: readonly Product[],
  category: CategoryId | "all" | undefined,
): readonly Product[] {
  if (!category || category === "all") return products;
  return products.filter((product) => product.category === category);
}

/** Match search terms against the searchable fields of a product. */
export function matchesQuery(product: Product, terms: readonly string[]): boolean {
  if (terms.length === 0) return true;

  const haystack = [product.name, product.category.replace(/-/g, " "), product.sku ?? ""]
    .join(" ")
    .toLowerCase();

  return terms.every((term) => haystack.includes(term));
}

export function normalizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);
}

/**
 * Pure filter used by the shop view and the search panel. `lib/search` owns the
 * swappable SearchService abstraction; this helper is the local, synchronous
 * implementation behind it.
 */
export function filterProducts(
  products: readonly Product[],
  filters: ProductFilters,
): Product[] {
  const terms = normalizeQuery(filters.query ?? "");

  return filterByCategory(products, filters.category)
    .filter((product) => matchesQuery(product, terms))
    .sort(byName);
}
