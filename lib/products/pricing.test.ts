import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { discountPercent } from "./pricing";

describe("discountPercent", () => {
  it("computes the percentage saved to one decimal place", () => {
    assert.equal(discountPercent(1000, 1500), 33.3);
    assert.equal(discountPercent(3000, 4000), 25);
    assert.equal(discountPercent(5500, 6000), 8.3);
    assert.equal(discountPercent(3800, 4500), 15.6);
  });

  it("returns null when there is no real discount", () => {
    assert.equal(discountPercent(undefined, 1500), null);
    assert.equal(discountPercent(1000, undefined), null);
    assert.equal(discountPercent(1500, 1500), null);
    assert.equal(discountPercent(2000, 1500), null);
    assert.equal(discountPercent(0, 1500), null);
  });
});
