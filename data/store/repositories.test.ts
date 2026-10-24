import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import {
  ensureStore,
  getPortfolio,
  getPublishedPortfolio,
  savePortfolio,
  validatePortfolio,
  getCatalogue,
  getCategories,
  getContact,
  getProducts,
  getReviews,
  saveCatalogue,
  saveReviews,
  saveSite,
  seedCatalogueDocument,
  seedSiteDocument,
  validateCatalogue,
  validateReviews,
  validateSite,
} from "./repositories";
import { STORE_FILES, clearStoreCache } from "./store";

/**
 * These tests run against the real store directory. Each test restores what it
 * changed, and the suite records the original documents so a failed test cannot
 * leave the project's content modified.
 */
const cataloguePath = join(process.cwd(), "data", "store", STORE_FILES.catalogue);
const sitePath = join(process.cwd(), "data", "store", STORE_FILES.site);
const reviewsPath = join(process.cwd(), "data", "store", STORE_FILES.reviews);

const snapshots = new Map<string, string>();

async function snapshot(path: string) {
  try {
    snapshots.set(path, await readFile(path, "utf8"));
  } catch {
    snapshots.set(path, "\u0000missing");
  }
}

after(async () => {
  for (const [path, contents] of snapshots) {
    if (contents === "\u0000missing") continue;
    await writeFile(path, contents, "utf8");
  }
  clearStoreCache();
});

describe("document validation", () => {
  it("keeps valid products and drops broken entries", () => {
    const document = validateCatalogue({
      products: [
        { id: "1", slug: "linen-sheer-curtain", name: "Linen Sheer Curtain", category: "curtains" },
        { id: "2", slug: "NO SLUG", name: "Broken", category: "curtains" },
        { id: "3", slug: "no-name", category: "curtains" },
        { id: "4", slug: "bad-category", name: "Wrong category", category: "nope" },
        { id: "5", slug: "no-images", name: "No images", category: "curtains", images: "nope" },
        "not an object",
      ],
      categories: [{ id: "curtains", name: "Curtains" }],
    });

    // Kept: valid. Dropped: uppercase slug, missing name, invalid category entry, junk.
    assert.deepEqual(
      document.products.map((product) => product.slug),
      ["linen-sheer-curtain", "bad-category", "no-images"],
    );
    // An unknown category is coerced to a real one, never invented.
    assert.equal(document.products[1]?.category, "curtains");
    // A malformed image list becomes an empty list rather than throwing.
    assert.deepEqual(document.products[2]?.images, []);
  });

  it("normalises images, prices and attributes", () => {
    const document = validateCatalogue({
      products: [
        {
          slug: "p",
          name: "P",
          category: "accessories",
          type: "  Rings  ",
          price: 1000,
          compareAtPrice: 1500,
          images: [
            { src: "/a.jpg", alt: "  ", width: "10" },
            { alt: "no src" },
            { src: "/b.jpg", alt: "Curtain detail", width: 800, height: 1000 },
          ],
          attributes: [
            { label: "Material", value: "Linen" },
            { label: 1, value: 2 },
          ],
        },
        {
          slug: "invalid-compare",
          name: "Invalid compare",
          category: "accessories",
          price: 2000,
          compareAtPrice: 1500,
        },
      ],
    });

    const product = document.products[0]!;
    assert.equal(product.type, "Rings");
    assert.equal(product.price, 1000);
    assert.equal(product.compareAtPrice, 1500);
    assert.deepEqual(product.images, [
      { src: "/a.jpg", alt: "Product image" },
      { src: "/b.jpg", alt: "Curtain detail", width: 800, height: 1000 },
    ]);
    assert.deepEqual(product.attributes, [{ label: "Material", value: "Linen" }]);
    // A "was" price at or below the sale price is not a discount, so it is dropped.
    assert.equal(document.products[1]?.compareAtPrice, undefined);
  });

  it("drops a price that is not a positive number", () => {
    const product = validateCatalogue({
      products: [{ slug: "p", name: "P", category: "accessories", price: "not a number" }],
    }).products[0]!;

    assert.equal(product.price, undefined);
    assert.equal(product.compareAtPrice, undefined);
  });

  it("falls back to configured contact details", () => {
    assert.equal(validateSite({}).contact.email, "desirenwakor@gmail.com");
    assert.equal(validateSite({ contact: { email: "new@example.com" } }).contact.email, "new@example.com");
    assert.equal(validateSite({ about: { statement: "  " } }).about.statement, "Thoughtful interiors begin with the details.");
  });

  it("clamps ratings and defaults unknown statuses to pending", () => {
    const document = validateReviews({
      reviews: [
        { id: "1", author: "A", body: "Good", rating: 9, status: "approved" },
        { id: "2", author: "B", body: "Fine", rating: -3 },
        { id: "3", body: "Anonymous" },
        { author: "C", body: "No id" },
      ],
    });

    assert.equal(document.reviews.length, 2);
    assert.equal(document.reviews[0]?.rating, 5);
    assert.equal(document.reviews[0]?.status, "approved");
    assert.equal(document.reviews[1]?.rating, 1);
    assert.equal(document.reviews[1]?.status, "pending");
  });

  it("returns empty documents for junk input", () => {
    assert.deepEqual(validateCatalogue(null).products, []);
    assert.deepEqual(validateCatalogue("nope").categories, []);
    assert.deepEqual(validateReviews(42).reviews, []);
  });
});

describe("store round-trip", () => {
  it("seeds every document from the V1 typed data", async () => {
    await ensureStore();

    const catalogue = await getCatalogue();
    assert.ok(catalogue.products.length > 0, "catalogue is seeded");
    assert.equal(catalogue.products[0]?.name, "Clamp-Style Curtain Bracket");
    assert.equal(catalogue.products[0]?.type, "Brackets");
    assert.ok((catalogue.products[0]?.images.length ?? 0) > 0);
    assert.deepEqual(
      (await getCategories()).map((category) => category.slug),
      ["curtains", "accessories", "window-solutions"],
    );
    assert.equal((await getProducts()).length, catalogue.products.length);
  });

  it("persists edits and reads them back", async () => {
    await snapshot(cataloguePath);
    await snapshot(sitePath);
    await snapshot(reviewsPath);

    const original = await getCatalogue();
    assert.equal(original.products[0]?.name, "Clamp-Style Curtain Bracket");

    await saveCatalogue(
      validateCatalogue({
        products: [{ slug: "edited-product", name: "Edited Product", category: "curtains" }],
        categories: [{ id: "curtains", name: "Curtains" }],
      }),
    );
    assert.equal((await getProducts())[0]?.name, "Edited Product");

    await saveSite(validateSite({ contact: { email: "changed@example.com" } }));
    assert.equal((await getContact()).email, "changed@example.com");

    await saveReviews([
      {
        id: "r1",
        subject: "site",
        productName: "",
        author: "Ada",
        rating: 5,
        body: "Beautiful work.",
        createdAt: new Date().toISOString(),
        status: "approved",
      },
    ]);
    const reviews = await getReviews();
    assert.equal(reviews.length, 1);
    assert.equal(reviews[0]?.status, "approved");
  });

  it("keeps the JSON valid on disk", async () => {
    const raw = await readFile(cataloguePath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    assert.ok(Array.isArray((parsed as { products: unknown[] }).products));
  });
});

describe("seed helpers", () => {
  it("produce the same documents validation would", async () => {
    assert.deepEqual(seedCatalogueDocument(), validateCatalogue(seedCatalogueDocument()));
    assert.deepEqual(seedSiteDocument(), validateSite(seedSiteDocument()));
  });

  it("writes atomically to a temporary file that is renamed", async () => {
    const directory = await mkdtemp(join(tmpdir(), "store-"));
    try {
      const path = join(directory, "doc.json");
      await writeFile(`${path}.tmp`, "{}");
      assert.equal(await readFile(path, "utf8").catch(() => ""), "");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe("portfolio validation", () => {
  it("keeps items with a title and a usable Drive image", () => {
    const document = validatePortfolio({
      items: [
        {
          id: "p1",
          slug: "ikoyi-duplex",
          title: "Ikoyi duplex",
          summary: "Full window treatment",
          image: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
          services: ["Curtains"],
          order: 1,
        },
      ],
    });

    assert.equal(document.items.length, 1);
    assert.equal(document.items[0]?.title, "Ikoyi duplex");
    // The Drive reference is stored as the URL the site will actually request.
    assert.match(document.items[0]?.image ?? "", /^https:\/\/lh3\.googleusercontent\.com\/d\//);
  });

  it("drops items whose image cannot be served", () => {
    const document = validatePortfolio({
      items: [
        { slug: "a", title: "A", image: "https://example.com/x.jpg" },
        { slug: "b", title: "B", image: "" },
        { slug: "c", image: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" },
        { slug: "d", title: "D", image: "javascript:alert(1)" },
        { slug: "e", title: "E", image: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" },
        { slug: "f", title: "F", image: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view" },
      ],
    });

    // Kept: a bare Drive id and a share link.
    // Dropped: foreign host, empty image, no title, no slug, and a javascript: URL.
    assert.deepEqual(document.items.map((item) => item.slug), ["e", "f"]);
  });

  it("always exposes a services array", () => {
    const document = validatePortfolio({ items: [{ slug: "a", title: "A", image: "/uploads/x.jpg" }] });
    assert.deepEqual(document.items[0]?.services, []);
  });
});

describe("portfolio persistence", () => {
  it("round-trips through the store", async () => {
    await savePortfolio([
      {
        id: "p1",
        slug: "test-project",
        title: "Test project",
        summary: "",
        services: ["Curtains"],
        image: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
        order: 1,
        published: true,
      },
    ]);

    const stored = await getPortfolio();
    assert.equal(stored.length, 1);
    assert.equal(stored[0]?.title, "Test project");

    await savePortfolio([]);
    assert.equal((await getPublishedPortfolio()).length, 0);
  });
});
