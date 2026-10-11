import type { EnquiryItem } from "@/data/types";
import { MAX_ENQUIRY_ITEMS, clampQuantity, isValidSlug } from "@/lib/validation/validation";

/**
 * The enquiry list is a client-side selection of products, not a cart: no
 * checkout, no payments, no server state (ARCHITECTURE.md §5).
 */

export type EnquiryState = {
  readonly items: readonly EnquiryItem[];
};

export type EnquiryAction =
  | { type: "hydrate"; items: readonly EnquiryItem[] }
  | { type: "add"; slug: string }
  | { type: "remove"; slug: string }
  | { type: "setQuantity"; slug: string; quantity: number }
  | { type: "clear" };

export const emptyEnquiry: EnquiryState = { items: [] };

/** Keep a list trusted: valid slugs, valid quantities, no duplicates, capped length. */
export function normalizeEnquiryItems(items: readonly EnquiryItem[]): EnquiryState {
  const seen = new Set<string>();
  const next: EnquiryItem[] = [];

  for (const item of items) {
    if (next.length >= MAX_ENQUIRY_ITEMS) break;
    if (!isValidSlug(item?.slug)) continue;
    if (seen.has(item.slug)) continue;

    seen.add(item.slug);
    next.push({ slug: item.slug, quantity: clampQuantity(item.quantity) });
  }

  return { items: next };
}

export function enquiryReducer(state: EnquiryState, action: EnquiryAction): EnquiryState {
  switch (action.type) {
    case "hydrate":
      return normalizeEnquiryItems(action.items);

    case "add": {
      if (!isValidSlug(action.slug)) return state;
      if (state.items.some((item) => item.slug === action.slug)) return state;
      if (state.items.length >= MAX_ENQUIRY_ITEMS) return state;

      return { items: [...state.items, { slug: action.slug, quantity: 1 }] };
    }

    case "remove":
      return { items: state.items.filter((item) => item.slug !== action.slug) };

    case "setQuantity": {
      if (!isValidSlug(action.slug)) return state;
      if (!Number.isFinite(action.quantity)) return state;
      if (action.quantity < 1) {
        return { items: state.items.filter((item) => item.slug !== action.slug) };
      }

      const quantity = clampQuantity(action.quantity);
      return {
        items: state.items.map((item) =>
          item.slug === action.slug ? { ...item, quantity } : item,
        ),
      };
    }

    case "clear":
      return emptyEnquiry;

    default:
      return state;
  }
}
