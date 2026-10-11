import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hashPassword, verifyPassword } from "./password";
import { buildWhatsAppUrl, formatWhatsAppNumber, whatsappChatUrl } from "@/lib/whatsapp/whatsapp";

describe("password hashing", () => {
  it("round-trips a password", () => {
    const stored = hashPassword("a-sufficiently-long-password");

    assert.match(stored, /^scrypt:[^:]+:[^:]+$/);
    assert.equal(verifyPassword("a-sufficiently-long-password", stored), true);
  });

  it("rejects the wrong password", () => {
    const stored = hashPassword("a-sufficiently-long-password");

    assert.equal(verifyPassword("a-different-password", stored), false);
  });

  it("rejects a missing or malformed hash", () => {
    assert.equal(verifyPassword("anything", undefined), false);
    assert.equal(verifyPassword("anything", ""), false);
    assert.equal(verifyPassword("anything", "bcrypt-not-our-format"), false);
    assert.equal(verifyPassword("anything", "scrypt:onlysalt"), false);
  });

  it("never stores the plaintext", () => {
    const stored = hashPassword("a-sufficiently-long-password");

    assert.doesNotMatch(stored, /a-sufficiently-long-password/);
  });

  it("uses a different salt for each hash", () => {
    const first = hashPassword("a-sufficiently-long-password");
    const second = hashPassword("a-sufficiently-long-password");

    assert.notEqual(first, second);
    // Both still verify: the salt travels with the hash.
    assert.equal(verifyPassword("a-sufficiently-long-password", second), true);
  });
});

describe("contact details used by the dashboard", () => {
  it("builds links from the configured number only", () => {
    const contact = { email: "a@b.com", whatsappNumber: "2349138797980" };

    assert.equal(whatsappChatUrl(contact), "https://wa.me/2349138797980");
    assert.equal(buildWhatsAppUrl("Hello", contact), "https://wa.me/2349138797980?text=Hello");
  });

  it("keeps the display form in step with the number", () => {
    assert.equal(formatWhatsAppNumber("2349138797980"), "+234 913 879 7980");
    assert.equal(formatWhatsAppNumber("2348000000000").replace(/[^\d]/g, ""), "2348000000000");
  });
});
