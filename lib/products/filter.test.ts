import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterByCategory,
  filterByType,
  filterProducts,
  matchesQuery,
  normalizeQuery,
  productTypes,
} from "./filter";
import type { Product } from "@/data/types";

const products: Product[] = [
  {
    id: "1",
    slug: "linen-sheer-curtain",
    name: "Linen Sheer Curtain",
    category: "curtains",
    type: "Rods",
    images: [],
  },
  {
    id: "2",
    slug: "modern-panel-curtain",
    name: "Modern Panel Curtain",
    category: "curtains",
    type: "Rods",
    images: [],
  },
  {
    id: "3",
    slug: "decorative-tieback",
    name: "Decorative Tieback",
    category: "accessories",
    type: "Tiebacks",
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
  it("matches every term against the name, type, category and SKU", () => {
    assert.equal(matchesQuery(products[0]!, ["linen"]), true);
    assert.equal(matchesQuery(products[0]!, ["sheer", "curtains"]), true);
    assert.equal(matchesQuery(products[0]!, ["rods"]), true);
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

describe("filterByType", () => {
  it("passes everything through for 'all' or undefined", () => {
    assert.equal(filterByType(products, "all"), products);
    assert.equal(filterByType(products, undefined), products);
  });

  it("filters to one product type", () => {
    assert.deepEqual(
      filterByType(products, "Tiebacks").map((product) => product.slug),
      ["decorative-tieback"],
    );
    assert.deepEqual(filterByType(products, "Finials"), []);
  });
});

describe("productTypes", () => {
  it("lists each type once, in catalogue order", () => {
    assert.deepEqual(productTypes(products), ["Rods", "Tiebacks"]);
    assert.deepEqual(productTypes([{ id: "1", slug: "p", name: "P", category: "curtains", images: [] }]), []);
  });
});

describe("filterProducts", () => {
  it("combines query and category while preserving catalogue order", () => {
    assert.deepEqual(
      filterProducts(products, {}).map((product) => product.name),
      ["Linen Sheer Curtain", "Modern Panel Curtain", "Decorative Tieback"],
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

  it("filters by type and combines it with the other filters", () => {
    assert.deepEqual(
      filterProducts(products, { type: "Rods" }).map((product) => product.slug),
      ["linen-sheer-curtain", "modern-panel-curtain"],
    );
    assert.deepEqual(
      filterProducts(products, { type: "Rods", category: "accessories" }),
      [],
    );
  });
});
