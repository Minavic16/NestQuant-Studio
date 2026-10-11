import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ENQUIRY_EMAIL_SUBJECT, buildEnquiryMailtoUrl } from "./mailto";
import { buildEnquiryMessage } from "@/lib/whatsapp/whatsapp";
import type { EnquiryEntry } from "@/data/types";
import type { ContactDetails } from "@/lib/whatsapp/whatsapp";

const contact: ContactDetails = {
  email: "desirenwakor@gmail.com",
  whatsappNumber: "2349138797980",
};

const entries: EnquiryEntry[] = [
  {
    product: {
      id: "dhs-c-01",
      slug: "linen-sheer-curtain",
      name: "Linen Sheer Curtain",
      category: "curtains",
      images: [],
    },
    quantity: 2,
  },
];

describe("buildEnquiryMailtoUrl", () => {
  it("targets the supplied address with a subject and body", () => {
    const url = buildEnquiryMailtoUrl(entries, contact);

    assert.ok(url.startsWith(`mailto:${contact.email}?`));
    assert.ok(url.includes(`subject=${encodeURIComponent(ENQUIRY_EMAIL_SUBJECT)}`));
    assert.equal(ENQUIRY_EMAIL_SUBJECT, "Product Enquiry - Desired Homes Interiors");
  });

  it("encodes line breaks and spaces for mail clients", () => {
    const url = buildEnquiryMailtoUrl(entries, contact);
    const query = new URLSearchParams(url.split("?")[1] ?? "");

    assert.equal(query.get("body"), buildEnquiryMessage(entries).replace(/\n/g, "\r\n"));
    assert.doesNotMatch(url, / /);
  });

  it("follows an admin-edited address", () => {
    const url = buildEnquiryMailtoUrl(entries, { ...contact, email: "new@example.com" });
    assert.ok(url.startsWith("mailto:new@example.com?"));
  });
});
