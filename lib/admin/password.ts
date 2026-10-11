import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Password hashing for the single admin account.
 *
 * Node-only: `scrypt` from the standard library, so there is no native
 * dependency. Used by the sign-in route and by the `admin:hash` script.
 *
 *   ADMIN_PASSWORD_HASH=scrypt:<salt>:<derived>
 *
 * The separator is `:` and never `$`, because `.env` parsing expands `$NAME`
 * references: a `$` inside the value would silently eat the salt and the hash
 * (base64url uses only A–Z, a–z, 0–9, `-` and `_`, so it can never contain `:`).
 */

const SEPARATOR = ":";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const derived = scryptSync(password, salt, 64).toString("base64url");
  return ["scrypt", salt, derived].join(SEPARATOR);
}

export function verifyPassword(password: string, stored: string | undefined): boolean {
  if (!stored) return false;

  const [scheme, salt, expected] = stored.split(SEPARATOR);
  if (scheme !== "scrypt" || !salt || !expected) return false;

  let derived: Buffer;
  let expectedBuffer: Buffer;
  try {
    derived = scryptSync(password, salt, 64);
    expectedBuffer = Buffer.from(expected, "base64url");
  } catch {
    return false;
  }

  if (derived.length !== expectedBuffer.length) return false;
  return timingSafeEqual(derived, expectedBuffer);
}
