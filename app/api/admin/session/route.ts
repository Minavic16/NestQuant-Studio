import { NextResponse } from "next/server";
import { endSession, startSession } from "@/lib/admin/session";
import { verifyPassword } from "@/lib/admin/password";
import { serverEnv } from "@/lib/admin/env";

/**
 * Admin sign-in. A single password, verified against the scrypt hash in the
 * environment. No accounts, no password reset, no recovery flow, there is one
 * administrator (ARCHITECTURE.md §10).
 */

const MAX_BODY_BYTES = 1024;

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    payload = JSON.parse(raw) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const body = (typeof payload === "object" && payload !== null ? payload : {}) as Record<
    string,
    unknown
  >;
  const password = typeof body.password === "string" ? body.password : "";

  const stored = serverEnv("ADMIN_PASSWORD_HASH");
  if (!stored) {
    // Fail closed with a message that says what to configure, never a stack trace.
    return NextResponse.json(
      { error: "ADMIN_PASSWORD_HASH is not configured on this deployment." },
      { status: 503 },
    );
  }

  if (!verifyPassword(password, stored)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  await startSession();

  return NextResponse.json({ ok: true });
}

export async function DELETE(): Promise<NextResponse> {
  await endSession();
  return NextResponse.json({ ok: true });
}
