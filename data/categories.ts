import type { Category } from "@/data/types";

/**
 * The three collections the business sells, in display order.
 * Category ids double as URL slugs (`/categories/curtains`).
 */
export const categories: readonly Category[] = [
  { id: "curtains", name: "Curtains", slug: "curtains" },
  { id: "accessories", name: "Accessories", slug: "accessories" },
  { id: "window-solutions", name: "Window Solutions", slug: "window-solutions" },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
