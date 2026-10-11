import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createLocalProductRepository, byName } from "./repository";
import type { Product } from "@/data/types";

const products: Product[] = [
  { id: "3", slug: "zebra-panel", name: "Zebra Panel", category: "curtains", images: [] },
  {
    id: "1",
    slug: "linen-sheer-curtain",
    name: "Linen Sheer Curtain",
    category: "curtains",
    images: [],
    featured: true,
  },
  {
    id: "2",
    slug: "decorative-tieback",
    name: "Decorative Tieback",
    category: "accessories",
    images: [],
    featured: true,
  },
];

const repository = createLocalProductRepository(products);

describe("createLocalProductRepository", () => {
  it("returns products ordered by name", () => {
    assert.deepEqual(
      repository.getAll().map((product) => product.slug),
      ["decorative-tieback", "linen-sheer-curtain", "zebra-panel"],
    );
  });

  it("finds a product by slug", () => {
    assert.equal(repository.getBySlug("decorative-tieback")?.name, "Decorative Tieback");
    assert.equal(repository.getBySlug("missing"), undefined);
  });

  it("filters by category", () => {
    assert.equal(repository.getByCategory("accessories").length, 1);
    assert.equal(repository.getByCategory("window-solutions").length, 0);
  });

  it("limits featured products", () => {
    assert.equal(repository.getFeatured(1).length, 1);
    assert.equal(repository.getFeatured().length, 2);
    assert.deepEqual(createLocalProductRepository([]).getFeatured(), []);
  });

  it("does not mutate the source list", () => {
    const source = [...products];
    createLocalProductRepository(source).getAll();

    assert.deepEqual(source, products);
  });

  it("sorts by name using base sensitivity", () => {
    assert.ok(byName(products[0]!, products[1]!) > 0);
  });
});
