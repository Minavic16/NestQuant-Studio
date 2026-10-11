import { cookies } from "next/headers";
import { createSessionToken, verifySessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "./auth";
import { serverEnv } from "./env";

/**
 * Session lifecycle for the Node.js runtime (API routes and server pages).
 * The cookie is httpOnly, strict, and limited to the dashboard path.
 */

export async function startSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: serverEnv("NODE_ENV") === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
