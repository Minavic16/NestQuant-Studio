import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { createSessionToken, verifySessionToken } from "./auth";

/**
 * Session tokens use the Web Crypto API so the same code runs in the Node.js
 * runtime and in the edge proxy. The secret is supplied by the environment.
 */

const SECRET = "test-secret-value-that-is-long-enough";

after(() => {
  delete process.env.ADMIN_SESSION_SECRET;
});

describe("session tokens", () => {
  it("issues a token that verifies", async () => {
    process.env.ADMIN_SESSION_SECRET = SECRET;

    const token = await createSessionToken();
    assert.match(token, /^\d+\.[A-Za-z0-9_-]+$/);
    assert.equal(await verifySessionToken(token), true);
  });

  it("rejects a tampered token", async () => {
    process.env.ADMIN_SESSION_SECRET = SECRET;

    const token = await createSessionToken();
    const [issuedAt] = token.split(".");
    const forged = `${issuedAt}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`;

    assert.equal(await verifySessionToken(forged), false);
  });

  it("rejects a token signed with a different secret", async () => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
    const token = await createSessionToken();

    process.env.ADMIN_SESSION_SECRET = "a-completely-different-secret-value";

    assert.equal(await verifySessionToken(token), false);
  });

  it("rejects a missing or malformed token", async () => {
    process.env.ADMIN_SESSION_SECRET = SECRET;

    assert.equal(await verifySessionToken(undefined), false);
    assert.equal(await verifySessionToken(""), false);
    assert.equal(await verifySessionToken("no-signature"), false);
    assert.equal(await verifySessionToken("notanumber.signature"), false);
  });

  it("fails closed when no secret is configured", async () => {
    delete process.env.ADMIN_SESSION_SECRET;

    // Verification must return false rather than throw or, worse, pass.
    assert.equal(await verifySessionToken("1234.abcdef"), false);
  });

  it("rejects an expired token", async () => {
    process.env.ADMIN_SESSION_SECRET = SECRET;

    // 13 hours ago: beyond the 12-hour window.
    const issuedAt = Date.now() - 13 * 60 * 60 * 1000;
    const token = await createSessionToken(issuedAt);

    assert.equal(await verifySessionToken(token), false);
  });

  it("rejects a token issued in the future", async () => {
    process.env.ADMIN_SESSION_SECRET = SECRET;

    const token = await createSessionToken(Date.now() + 60_000);

    assert.equal(await verifySessionToken(token), false);
  });
});
