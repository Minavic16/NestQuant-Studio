import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { filterByCategory, filterProducts, matchesQuery, normalizeQuery } from "./filter";
import type { Product } from "@/data/types";

const products: Product[] = [
  { id: "1", slug: "linen-sheer-curtain", name: "Linen Sheer Curtain", category: "curtains", images: [] },
  { id: "2", slug: "modern-panel-curtain", name: "Modern Panel Curtain", category: "curtains", images: [] },
  {
    id: "3",
    slug: "decorative-tieback",
    name: "Decorative Tieback",
    category: "accessories",
    images: [],
    sku: "DHS-003",
  },
];

describe("normalizeQuery", () => {
  it("splits on whitespace and drops empty terms", () => {
    assert.deepEqual(normalizeQuery("  linen   curtain "), ["linen", "curtain"]);
  });
});

describe("matchesQuery", () => {
  it("matches every term against the name, category and SKU", () => {
    assert.equal(matchesQuery(products[0]!, ["linen"]), true);
    assert.equal(matchesQuery(products[0]!, ["sheer", "curtains"]), true);
    assert.equal(matchesQuery(products[0]!, ["tieback"]), false);
    assert.equal(matchesQuery(products[0]!, []), true);
  });

  it("matches hyphenated category names and SKUs", () => {
    assert.equal(matchesQuery(products[0]!, ["window solutions"]), false);
    assert.equal(matchesQuery(products[2]!, ["accessories"]), true);
    assert.equal(matchesQuery(products[2]!, ["dhs-003"]), true);
  });
});

describe("filterByCategory", () => {
  it("passes everything through for 'all' or undefined", () => {
    assert.equal(filterByCategory(products, "all"), products);
    assert.equal(filterByCategory(products, undefined), products);
  });

  it("filters to one category", () => {
    assert.deepEqual(
      filterByCategory(products, "accessories").map((product) => product.slug),
      ["decorative-tieback"],
    );
  });
});

describe("filterProducts", () => {
  it("combines query and category and sorts by name", () => {
    assert.deepEqual(
      filterProducts(products, {}).map((product) => product.name),
      ["Decorative Tieback", "Linen Sheer Curtain", "Modern Panel Curtain"],
    );
    assert.deepEqual(
      filterProducts(products, { category: "curtains" }).map((product) => product.name),
      ["Linen Sheer Curtain", "Modern Panel Curtain"],
    );
    assert.deepEqual(
      filterProducts(products, { query: "panel" }).map((product) => product.name),
      ["Modern Panel Curtain"],
    );
    assert.deepEqual(filterProducts(products, { query: "panel", category: "accessories" }), []);
  });
});
