import type { CategoryId, Product } from "@/data/types";

/**
 * Search abstraction (ARCHITECTURE.md §6).
 *
 * The UI talks to this interface only, so V1's in-memory search can be replaced
 * by a server route, a database query or a search engine without any component
 * change.
 */
export interface SearchOptions {
  category?: CategoryId | "all";
  limit?: number;
}

export interface SearchService {
  search(query: string, options?: SearchOptions): readonly Product[];
}

/** Normalise for matching: lowercase, accent-stripped, whitespace-collapsed. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Local, synchronous search over a product list. */
export function createLocalSearchService(source: readonly Product[]): SearchService {
  const index = source.map((product) => ({
    product,
    haystack: normalizeText(
      [
        product.name,
        product.category.replace(/-/g, " "),
        product.sku ?? "",
        product.shortDescription ?? "",
        product.description ?? "",
      ].join(" "),
    ),
  }));

  return {
    search(query, options = {}) {
      const terms = normalizeText(query)
        .split(" ")
        .filter(Boolean);
      const { category, limit } = options;

      const matches = index
        .filter(({ product, haystack }) => {
          if (category && category !== "all" && product.category !== category) return false;
          return terms.every((term) => haystack.includes(term));
        })
        .map((entry) => entry.product)
        .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

      return typeof limit === "number" ? matches.slice(0, limit) : matches;
    },
  };
}
