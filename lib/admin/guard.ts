import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin/session";

/**
 * Guard for admin API routes. Every mutation goes through here, so an
 * unauthenticated request never reaches the store — regardless of which host
 * it arrived on (ARCHITECTURE.md §10).
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAuthenticated()) return null;

  return NextResponse.json({ error: "Not authorised." }, { status: 401 });
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function jsonOk<T>(value: T, status = 200): NextResponse {
  return NextResponse.json(value, { status });
}
