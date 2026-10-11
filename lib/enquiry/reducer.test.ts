import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emptyEnquiry,
  enquiryReducer,
  normalizeEnquiryItems,
  type EnquiryState,
} from "./reducer";
import { MAX_ENQUIRY_ITEMS, MAX_ITEM_QUANTITY } from "@/lib/validation/validation";

const withItems = (slugs: string[]): EnquiryState => ({
  items: slugs.map((slug) => ({ slug, quantity: 1 })),
});

describe("enquiryReducer", () => {
  it("adds a product with quantity 1", () => {
    const next = enquiryReducer(emptyEnquiry, { type: "add", slug: "linen-sheer-curtain" });

    assert.deepEqual(next.items, [{ slug: "linen-sheer-curtain", quantity: 1 }]);
  });

  it("does not add the same product twice", () => {
    const state = enquiryReducer(emptyEnquiry, { type: "add", slug: "linen-sheer-curtain" });
    const next = enquiryReducer(state, { type: "add", slug: "linen-sheer-curtain" });

    assert.equal(next, state);
    assert.equal(next.items.length, 1);
  });

  it("ignores invalid slugs", () => {
    const next = enquiryReducer(emptyEnquiry, { type: "add", slug: "Not A Slug!" });

    assert.equal(next, emptyEnquiry);
  });

  it("removes a product", () => {
    const state = withItems(["linen-sheer-curtain", "decorative-tieback"]);
    const next = enquiryReducer(state, { type: "remove", slug: "decorative-tieback" });

    assert.deepEqual(next.items, [{ slug: "linen-sheer-curtain", quantity: 1 }]);
  });

  it("sets and clamps quantities", () => {
    const state = withItems(["linen-sheer-curtain"]);

    assert.deepEqual(
      enquiryReducer(state, { type: "setQuantity", slug: "linen-sheer-curtain", quantity: 3 }).items,
      [{ slug: "linen-sheer-curtain", quantity: 3 }],
    );
    assert.deepEqual(
      enquiryReducer(state, {
        type: "setQuantity",
        slug: "linen-sheer-curtain",
        quantity: MAX_ITEM_QUANTITY + 50,
      }).items,
      [{ slug: "linen-sheer-curtain", quantity: MAX_ITEM_QUANTITY }],
    );
    assert.deepEqual(
      enquiryReducer(state, { type: "setQuantity", slug: "linen-sheer-curtain", quantity: 0 }).items,
      [],
    );
  });

  it("ignores non-finite quantities", () => {
    const state = withItems(["linen-sheer-curtain"]);
    const next = enquiryReducer(state, {
      type: "setQuantity",
      slug: "linen-sheer-curtain",
      quantity: Number.NaN,
    });

    assert.equal(next, state);
  });

  it("clears the enquiry", () => {
    const state = withItems(["linen-sheer-curtain", "decorative-tieback"]);

    assert.equal(enquiryReducer(state, { type: "clear" }), emptyEnquiry);
  });

  it("caps the number of items", () => {
    let state = emptyEnquiry;
    for (let index = 0; index < MAX_ENQUIRY_ITEMS + 5; index += 1) {
      state = enquiryReducer(state, { type: "add", slug: `product-${index}` });
    }

    assert.equal(state.items.length, MAX_ENQUIRY_ITEMS);
  });

  it("normalises persisted items: duplicates, invalid slugs and quantities", () => {
    const state = normalizeEnquiryItems([
      { slug: "linen-sheer-curtain", quantity: 2 },
      { slug: "linen-sheer-curtain", quantity: 5 },
      { slug: "bad slug", quantity: 1 },
      { slug: "decorative-tieback", quantity: 0 },
      { slug: "window-roller-blind", quantity: 4 },
    ]);

    assert.deepEqual(state.items, [
      { slug: "linen-sheer-curtain", quantity: 2 },
      { slug: "decorative-tieback", quantity: 1 },
      { slug: "window-roller-blind", quantity: 4 },
    ]);
  });
});
