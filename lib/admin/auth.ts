/**
 * Admin session tokens.
 *
 * Implemented with the Web Crypto API so the same code runs in the Node.js
 * runtime (API routes, pages) and in the edge runtime (`proxy.ts`), where
 * `node:crypto` is unavailable.
 *
 * A session is a signed `<issuedAt>.<signature>` cookie: no session store and
 * nothing to revoke server-side, which is the right trade-off for a single
 * administrator. Configure:
 *
 *   ADMIN_SESSION_SECRET=<32+ random characters>
 */

import { serverEnv } from "./env";

const COOKIE_NAME = "dhi_admin_session";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours
const ENCODER = new TextEncoder();

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    ENCODER.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, ENCODER.encode(payload));
  return base64Url(new Uint8Array(signature));
}

function requireSecret(): string {
  // Read through `serverEnv` so the value is never frozen into the bundle at
  // build time (lib/admin/env.ts).
  const secret = serverEnv("ADMIN_SESSION_SECRET");
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters");
  }
  return secret;
}

/** Compare two strings without leaking their difference through timing. */
function equalConstantTime(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}

export async function createSessionToken(issuedAt = Date.now()): Promise<string> {
  const payload = String(issuedAt);
  return `${payload}.${await sign(payload, requireSecret())}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;

  let expected: string;
  try {
    expected = await sign(issuedAt, requireSecret());
  } catch {
    // A missing secret must never be treated as "authenticated".
    return false;
  }

  if (!equalConstantTime(expected, signature)) return false;

  const age = Date.now() - Number(issuedAt);
  return Number.isFinite(age) && age >= 0 && age <= SESSION_DURATION_MS;
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE_SECONDS = Math.floor(SESSION_DURATION_MS / 1000);
