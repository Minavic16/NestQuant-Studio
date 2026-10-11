import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { h, render, screen, userEvent } from "@/test/component";
import { EnquiryProvider } from "@/lib/enquiry/context";
import { createEnquiryStore } from "@/lib/enquiry/store";
import { EnquiryButton } from "./EnquiryButton";
import type { Product } from "@/data/types";

const product: Product = {
  id: "dhs-c-01",
  slug: "linen-sheer-curtain",
  name: "Linen Sheer Curtain",
  category: "curtains",
  images: [],
};

afterEach(() => {
  // Reset the DOM between tests: jsdom is shared within a test process.
  document.body.innerHTML = "";
});

function renderButton() {
  const store = createEnquiryStore(null);
  const utils = render(
    h(EnquiryProvider, { store, children: h(EnquiryButton, { product }) }),
  );

  return { store, ...utils };
}

describe("EnquiryButton", () => {
  it("adds the product to the enquiry and announces it", async () => {
    const user = userEvent.setup();
    const { store } = renderButton();

    await user.click(screen.getByRole("button", { name: "Add to Enquiry" }));

    assert.deepEqual(store.getSnapshot().items, [{ slug: "linen-sheer-curtain", quantity: 1 }]);
    assert.match(screen.getByRole("status").textContent ?? "", /Linen Sheer Curtain added to your enquiry list\./);
  });

  it("disables itself once the product is in the list", async () => {
    const user = userEvent.setup();
    const { store } = renderButton();

    await user.click(screen.getByRole("button", { name: "Add to Enquiry" }));

    const added = screen.getByRole("button", { name: "Added to enquiry" }) as HTMLButtonElement;
    assert.equal(added.disabled, true);

    await user.click(added);

    assert.equal(store.getSnapshot().items.length, 1);
  });

  it("shows the added state for a product already in the list", () => {
    const store = createEnquiryStore(null);
    store.add(product.slug);

    render(h(EnquiryProvider, { store, children: h(EnquiryButton, { product }) }));

    const button = screen.getByRole("button", { name: "Added to enquiry" }) as HTMLButtonElement;
    assert.equal(button.disabled, true);
  });
});
