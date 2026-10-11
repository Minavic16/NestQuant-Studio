import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { h, render, screen, userEvent } from "@/test/component";
import { MobileNav } from "./MobileNav";
import type { ContactDetails } from "@/lib/whatsapp/whatsapp";

const contact: ContactDetails = { email: "desirenwakor@gmail.com", whatsappNumber: "2349138797980" };

afterEach(() => {
  document.body.innerHTML = "";
});

describe("MobileNav", () => {
  it("renders an accessible dialog with the primary navigation", () => {
    render(h(MobileNav, { onClose: () => {}, contact }));

    const dialog = screen.getByRole("dialog", { name: "Menu" });
    assert.equal(dialog.getAttribute("aria-modal"), "true");

    for (const label of ["Shop", "Categories", "About", "Contact"]) {
      assert.ok(screen.getByRole("link", { name: label }));
    }
    assert.equal(screen.getByRole("link", { name: /Enquiry/ }).getAttribute("href"), "/enquiry");
  });

  it("shows the supplied logo and the business contact details", () => {
    render(h(MobileNav, { onClose: () => {}, contact }));

    assert.ok(screen.getByAltText("Desired Homes Interiors"));
    assert.equal(
      screen.getByRole("link", { name: "desirenwakor@gmail.com" }).getAttribute("href"),
      "mailto:desirenwakor@gmail.com",
    );
    assert.equal(
      screen.getByRole("link", { name: /WhatsApp \+234 913 879 7980/ }).getAttribute("href"),
      "https://wa.me/2349138797980",
    );
  });

  it("closes on the close button", async () => {
    const user = userEvent.setup();
    const onClose = mock.fn();
    render(h(MobileNav, { onClose, contact }));

    await user.click(screen.getByRole("button", { name: "Close menu" }));

    assert.equal(onClose.mock.callCount(), 1);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = mock.fn();
    render(h(MobileNav, { onClose, contact }));

    await user.keyboard("{Escape}");

    assert.equal(onClose.mock.callCount(), 1);
  });

  it("locks background scrolling while open", () => {
    render(h(MobileNav, { onClose: () => {}, contact }));

    assert.equal(document.body.style.overflow, "hidden");
  });
});
