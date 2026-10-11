import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isValidQuantity, isValidSlug, clampQuantity, parseEnquiryItems } from "./validation";

describe("isValidSlug", () => {
  it("accepts lowercase hyphenated slugs", () => {
    assert.equal(isValidSlug("linen-sheer-curtain"), true);
    assert.equal(isValidSlug("window-roller-blind"), true);
  });

  it("rejects anything else", () => {
    assert.equal(isValidSlug("Nope"), false);
    assert.equal(isValidSlug("leading-hyphen-"), false);
    assert.equal(isValidSlug("double--hyphen"), false);
    assert.equal(isValidSlug("../etc/passwd"), false);
    assert.equal(isValidSlug(""), false);
    assert.equal(isValidSlug(42), false);
    assert.equal(isValidSlug("a".repeat(81)), false);
  });
});

describe("isValidQuantity", () => {
  it("accepts integers within range", () => {
    assert.equal(isValidQuantity(1), true);
    assert.equal(isValidQuantity(99), true);
  });

  it("rejects everything else", () => {
    assert.equal(isValidQuantity(0), false);
    assert.equal(isValidQuantity(-1), false);
    assert.equal(isValidQuantity(1.5), false);
    assert.equal(isValidQuantity("2"), false);
    assert.equal(isValidQuantity(Number.NaN), false);
  });
});

describe("clampQuantity", () => {
  it("clamps into the supported range", () => {
    assert.equal(clampQuantity(0), 1);
    assert.equal(clampQuantity(-5), 1);
    assert.equal(clampQuantity(4.7), 4);
    assert.equal(clampQuantity(1000), 99);
    assert.equal(clampQuantity(Number.POSITIVE_INFINITY), 1);
  });
});

describe("parseEnquiryItems", () => {
  it("keeps valid entries and drops duplicates", () => {
    assert.deepEqual(
      parseEnquiryItems([
        { slug: "linen-sheer-curtain", quantity: 2 },
        { slug: "linen-sheer-curtain", quantity: 3 },
        { slug: "decorative-tieback", quantity: 1 },
      ]),
      [
        { slug: "linen-sheer-curtain", quantity: 2 },
        { slug: "decorative-tieback", quantity: 1 },
      ],
    );
  });

  it("caps the number of items", () => {
    const many = Array.from({ length: 80 }, (_, index) => ({
      slug: `product-${index}`,
      quantity: 1,
    }));

    assert.equal(parseEnquiryItems(many).length, 50);
  });
});
