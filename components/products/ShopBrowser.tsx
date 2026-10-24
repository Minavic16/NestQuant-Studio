"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./shop-browser.module.css";
import { ProductGrid } from "@/components/products/ProductGrid";
import { SearchInput } from "@/components/search/SearchInput";
import { filterProducts, productTypes } from "@/lib/products/filter";
import { CATEGORY_IDS } from "@/data/types";
import { categories } from "@/data/categories";
import { copy } from "@/data/content/copy";
import type { CategoryId, Product } from "@/data/types";

/**
 * Shop view: search, category and product-type filtering over the catalogue.
 *
 * State lives in the URL (`?q=`, `?category=` and `?type=`) so a filtered view is
 * shareable and the back button behaves; the filtering itself is local and
 * instant, and goes through the same pure helpers the search service uses.
 */
export function ShopBrowser({ products }: { products: readonly Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("category");
  const activeCategory: CategoryId | "all" =
    categoryParam === "all" || (categoryParam && (CATEGORY_IDS as readonly string[]).includes(categoryParam))
      ? (categoryParam as CategoryId | "all")
      : "all";

  const types = useMemo(() => productTypes(products), [products]);
  const typeParam = searchParams.get("type");
  const activeType = typeParam && types.includes(typeParam) ? typeParam : "all";

  const results = useMemo(
    () => filterProducts(products, { query, category: activeCategory, type: activeType }),
    [products, query, activeCategory, activeType],
  );

  const updateParams = (updates: {
    q?: string | null;
    category?: string | null;
    type?: string | null;
  }) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }

    const search = params.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  };

  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>{copy.shop.noProducts}</p>
        <p className={styles.emptyHint}>{copy.shop.noProductsHint}</p>
      </div>
    );
  }

  return (
    <div className={styles.browser}>
      <div className={styles.controls}>
        <SearchInput
          value={query}
          onValueChange={(value) => updateParams({ q: value })}
          placeholder={copy.shop.searchPlaceholder}
          className={styles.search}
        />

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Category</span>
          <div className={styles.chips} role="group" aria-label="Filter by category">
            <button
              type="button"
              className={[styles.chip, activeCategory === "all" ? styles.chipActive : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => updateParams({ category: null })}
              aria-pressed={activeCategory === "all"}
            >
              {copy.shop.filterAll}
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={[styles.chip, activeCategory === category.id ? styles.chipActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => updateParams({ category: category.id })}
                aria-pressed={activeCategory === category.id}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {types.length > 1 ? (
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Type</span>
            <div className={styles.chips} role="group" aria-label="Filter by product type">
              <button
                type="button"
                className={[styles.chip, activeType === "all" ? styles.chipActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => updateParams({ type: null })}
                aria-pressed={activeType === "all"}
              >
                {copy.shop.filterAllTypes}
              </button>

              {types.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={[styles.chip, activeType === type ? styles.chipActive : ""]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => updateParams({ type })}
                  aria-pressed={activeType === type}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {results.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{copy.shop.empty}</p>
          <p className={styles.emptyHint}>{copy.shop.emptyHint}</p>
        </div>
      ) : (
        <ProductGrid products={results} priorityCount={4} />
      )}
    </div>
  );
}
