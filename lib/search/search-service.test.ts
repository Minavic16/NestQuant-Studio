import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createLocalSearchService, normalizeText } from "./search-service";
import type { Product } from "@/data/types";

const products: Product[] = [
  {
    id: "dhs-c-01",
    slug: "linen-sheer-curtain",
    name: "Linen Sheer Curtain",
    category: "curtains",
    images: [],
    shortDescription: "Soft filtered daylight",
    sku: "DHS-001",
  },
  {
    id: "dhs-c-02",
    slug: "modern-panel-curtain",
    name: "Modern Panel Curtain",
    category: "curtains",
    images: [],
  },
  {
    id: "dhs-a-01",
    slug: "decorative-tieback",
    name: "Decorative Tieback",
    category: "accessories",
    images: [],
  },
];

const search = createLocalSearchService(products);

describe("normalizeText", () => {
  it("lowercases, collapses whitespace and strips accents", () => {
    assert.equal(normalizeText("  Café   CURTAINS "), "cafe curtains");
  });
});

describe("createLocalSearchService", () => {
  it("matches on name", () => {
    assert.deepEqual(
      search.search("linen").map((product) => product.slug),
      ["linen-sheer-curtain"],
    );
  });

  it("matches on category, SKU and description", () => {
    assert.deepEqual(
      search.search("accessories").map((product) => product.slug),
      ["decorative-tieback"],
    );
    assert.deepEqual(
      search.search("dhs-001").map((product) => product.slug),
      ["linen-sheer-curtain"],
    );
    assert.deepEqual(
      search.search("daylight").map((product) => product.slug),
      ["linen-sheer-curtain"],
    );
  });

  it("requires every term to match", () => {
    assert.equal(search.search("linen curtain").length, 1);
    assert.equal(search.search("linen tieback").length, 0);
  });

  it("returns everything for an empty query", () => {
    assert.equal(search.search("").length, 3);
    assert.equal(search.search("   ").length, 3);
  });

  it("filters by category", () => {
    assert.equal(search.search("", { category: "curtains" }).length, 2);
    assert.equal(search.search("curtain", { category: "curtains" }).length, 2);
    assert.equal(search.search("curtain", { category: "accessories" }).length, 0);
  });

  it("limits results", () => {
    assert.equal(search.search("", { limit: 2 }).length, 2);
  });

  it("returns nothing for an unknown term", () => {
    assert.deepEqual(search.search("zzzz"), []);
  });
});
