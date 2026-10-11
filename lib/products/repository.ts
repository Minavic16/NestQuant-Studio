import type { CategoryId, Product } from "@/data/types";

/**
 * Access to the catalogue. The UI depends on this interface only, never on where
 * products come from (ARCHITECTURE.md §4).
 */
export interface ProductRepository {
  /** Every product, ordered by name. */
  getAll(): readonly Product[];
  getBySlug(slug: string): Product | undefined;
  getByCategory(category: CategoryId): readonly Product[];
  /** Products flagged `featured`, up to `limit` (default 4). */
  getFeatured(limit?: number): readonly Product[];
}

export function byName(a: Product, b: Product): number {
  return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
}

export function createLocalProductRepository(source: readonly Product[]): ProductRepository {
  const all = [...source].sort(byName);

  return {
    getAll: () => all,
    getBySlug: (slug) => all.find((product) => product.slug === slug),
    getByCategory: (category) => all.filter((product) => product.category === category),
    getFeatured: (limit = 4) => all.filter((product) => product.featured).slice(0, limit),
  };
}
