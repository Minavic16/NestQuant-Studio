import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildEnquiryMessage,
  buildEnquiryWhatsAppUrl,
  buildProductMessage,
  buildProductWhatsAppUrl,
  buildWhatsAppUrl,
  formatWhatsAppNumber,
  whatsappChatUrl,
  type ContactDetails,
} from "./whatsapp";
import { contactConfig } from "@/config/contact";
import type { EnquiryEntry, Product } from "@/data/types";

const contact: ContactDetails = {
  email: "desirenwakor@gmail.com",
  whatsappNumber: contactConfig.whatsappNumber,
};

const curtain: Product = {
  id: "dhs-c-01",
  slug: "linen-sheer-curtain",
  name: "Linen Sheer Curtain",
  category: "curtains",
  images: [],
  sku: "DHS-001",
};

const tieback: Product = {
  id: "dhs-a-01",
  slug: "decorative-tieback",
  name: "Decorative Tieback",
  category: "accessories",
  images: [],
};

const entries: EnquiryEntry[] = [
  { product: curtain, quantity: 1 },
  { product: tieback, quantity: 2 },
];

describe("buildEnquiryMessage", () => {
  it("formats a numbered list with SKU and quantity", () => {
    assert.equal(
      buildEnquiryMessage(entries),
      [
        "Hello Desired Homes Interiors,",
        "",
        "I would like to enquire about:",
        "",
        "1. Linen Sheer Curtain (SKU: DHS-001)",
        "2. Decorative Tieback × 2",
        "",
        "Please provide availability, pricing and further details.",
        "",
        "Thank you.",
      ].join("\n"),
    );
  });

  it("omits the SKU when a product has none", () => {
    assert.match(buildEnquiryMessage([{ product: tieback, quantity: 1 }]), /1\. Decorative Tieback/);
  });

  it("handles an empty enquiry", () => {
    assert.match(buildEnquiryMessage([]), /I would like to enquire about:/);
  });
});

describe("buildProductMessage", () => {
  it("mentions the product and its SKU", () => {
    assert.equal(
      buildProductMessage(curtain),
      [
        "Hello Desired Homes Interiors,",
        "",
        "I would like to enquire about:",
        "",
        "Product: Linen Sheer Curtain",
        "SKU: DHS-001",
        "",
        "Please provide pricing and availability.",
        "",
        "Thank you.",
      ].join("\n"),
    );
  });

  it("omits the SKU line when there is none", () => {
    assert.doesNotMatch(buildProductMessage(tieback), /SKU/);
  });
});

describe("WhatsApp URLs", () => {
  it("uses the supplied number and encodes the message", () => {
    const url = buildEnquiryWhatsAppUrl(entries, contact);

    assert.ok(url.startsWith(`https://wa.me/${contact.whatsappNumber}?text=`));
    assert.doesNotMatch(url, / /);
    assert.doesNotMatch(url, /\n/);
    assert.equal(decodeURIComponent(url.split("?text=")[1] ?? ""), buildEnquiryMessage(entries));
  });

  it("uses an admin-edited number when given one", () => {
    const edited: ContactDetails = { email: "a@b.com", whatsappNumber: "2348000000000" };
    assert.ok(buildWhatsAppUrl("Hello", edited).startsWith("https://wa.me/2348000000000?text="));
  });

  it("keeps the number in configuration by default", () => {
    assert.equal(contactConfig.whatsappNumber, "2349138797980");
    assert.equal(whatsappChatUrl(contact), `https://wa.me/${contactConfig.whatsappNumber}`);
  });

  it("builds a bare chat link and a product link", () => {
    assert.equal(buildWhatsAppUrl("Hello", contact), `https://wa.me/${contact.whatsappNumber}?text=Hello`);
    assert.match(buildProductWhatsAppUrl(curtain, contact), /Product%3A%20Linen%20Sheer%20Curtain/);
  });
});

describe("formatWhatsAppNumber", () => {
  it("groups digits for display without changing them", () => {
    assert.equal(formatWhatsAppNumber("2349138797980"), "+234 913 879 7980");
    assert.equal(formatWhatsAppNumber("2348000000000"), "+234 800 000 0000");
  });

  it("never loses or adds a digit", () => {
    const digits = "2349138797980";
    const rendered = formatWhatsAppNumber(digits).replace(/[^0-9]/g, "");
    assert.equal(rendered, digits);
  });
});
