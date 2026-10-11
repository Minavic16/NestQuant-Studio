import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { h, render, screen, userEvent } from "@/test/component";
import { EnquiryProvider } from "@/lib/enquiry/context";
import { createEnquiryStore } from "@/lib/enquiry/store";
import { EnquiryView } from "./EnquiryView";
import type { ContactDetails } from "@/lib/whatsapp/whatsapp";

const contact: ContactDetails = { email: "desirenwakor@gmail.com", whatsappNumber: "2349138797980" };
import type { Product } from "@/data/types";

const products: Product[] = [
  { id: "1", slug: "linen-sheer-curtain", name: "Linen Sheer Curtain", category: "curtains", images: [] },
  { id: "2", slug: "decorative-tieback", name: "Decorative Tieback", category: "accessories", images: [] },
];

afterEach(() => {
  document.body.innerHTML = "";
});

function renderView(items: string[] = []) {
  const store = createEnquiryStore(null);
  for (const slug of items) store.add(slug);

  return render(h(EnquiryProvider, { store, children: h(EnquiryView, { products, contact }) }));
}

function quantityText() {
  const group = screen.getByRole("group", { name: "Quantity for Linen Sheer Curtain" });
  return group.textContent ?? "";
}

describe("EnquiryView", () => {
  it("shows the empty state", () => {
    renderView();

    assert.ok(screen.getByRole("heading", { name: "Your enquiry list is empty." }));
    assert.equal(
      screen.getByRole("link", { name: "Explore the collection" }).getAttribute("href"),
      "/shop",
    );
  });

  it("lists the products in the enquiry", () => {
    renderView(["linen-sheer-curtain", "decorative-tieback"]);

    assert.equal(
      screen.getByRole("link", { name: "Linen Sheer Curtain" }).getAttribute("href"),
      "/shop/linen-sheer-curtain",
    );
    assert.ok(screen.getByRole("link", { name: "Decorative Tieback" }));
    assert.equal(screen.queryByText("Your enquiry list is empty."), null);
  });

  it("ignores items whose product no longer exists", () => {
    const store = createEnquiryStore(null);
    store.add("removed-product");

    render(h(EnquiryProvider, { store, children: h(EnquiryView, { products, contact }) }));

    assert.equal(screen.queryByRole("link", { name: "Linen Sheer Curtain" }), null);
    assert.ok(screen.getByRole("heading", { name: "Your enquiry list is empty." }));
  });

  it("increases and decreases the quantity", async () => {
    const user = userEvent.setup();
    renderView(["linen-sheer-curtain"]);

    assert.equal(quantityText(), "1");

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    assert.equal(quantityText(), "2");

    await user.click(screen.getByRole("button", { name: "Decrease quantity" }));
    assert.equal(quantityText(), "1");
  });

  it("disables the decrease control at quantity 1", () => {
    renderView(["linen-sheer-curtain"]);

    const decrease = screen.getByRole("button", { name: "Decrease quantity" }) as HTMLButtonElement;
    const increase = screen.getByRole("button", { name: "Increase quantity" }) as HTMLButtonElement;

    assert.equal(decrease.disabled, true);
    assert.equal(increase.disabled, false);
  });

  it("removes a single product and clears the whole enquiry", async () => {
    const user = userEvent.setup();
    renderView(["linen-sheer-curtain", "decorative-tieback"]);

    await user.click(screen.getByRole("button", { name: "Remove Decorative Tieback" }));
    assert.equal(screen.queryByRole("link", { name: "Decorative Tieback" }), null);
    assert.ok(screen.getByRole("link", { name: "Linen Sheer Curtain" }));

    await user.click(screen.getByRole("button", { name: "Clear enquiry" }));
    assert.ok(screen.getByRole("heading", { name: "Your enquiry list is empty." }));
  });

  it("builds WhatsApp and email links for the current selection", () => {
    renderView(["linen-sheer-curtain"]);

    const whatsapp = screen.getByRole("link", { name: "Send enquiry on WhatsApp" });
    const email = screen.getByRole("link", { name: "Send enquiry by Email" });

    assert.ok((whatsapp.getAttribute("href") ?? "").startsWith("https://wa.me/2349138797980?text="));
    assert.equal(whatsapp.getAttribute("target"), "_blank");
    assert.match(whatsapp.getAttribute("rel") ?? "", /noopener/);
    assert.ok((email.getAttribute("href") ?? "").startsWith("mailto:desirenwakor@gmail.com?"));
    assert.match(decodeURIComponent(email.getAttribute("href") ?? ""), /Linen Sheer Curtain/);
  });
});
