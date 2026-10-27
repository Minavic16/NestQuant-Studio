import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isInInitialViewport, REVEAL_SELECTOR } from "./reveal";

describe("isInInitialViewport", () => {
  it("reveals content that starts inside the first viewport", () => {
    assert.equal(isInInitialViewport(0, 800), true);
    assert.equal(isInInitialViewport(400, 800), true);
    assert.equal(isInInitialViewport(735, 800), true);
  });

  it("defers content that starts below the first viewport", () => {
    assert.equal(isInInitialViewport(736, 800), false);
    assert.equal(isInInitialViewport(1200, 800), false);
  });

  it("uses the same data attribute as the stylesheet", () => {
    assert.equal(REVEAL_SELECTOR, "[data-reveal]");
  });
});
