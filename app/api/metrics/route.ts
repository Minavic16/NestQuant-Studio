import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { readDocument, writeDocument, STORE_FILES } from "@/data/store/store";
import type { MetricsDay, MetricsDocument } from "@/data/store/schema";

/**
 * First-party analytics ingestion.
 *
 * Page views are aggregated into daily buckets, so the file grows by one entry
 * per day rather than one per visit, and the dashboard can compute trends
 * without scanning a raw event log. No third-party service is involved
 * (ARCHITECTURE.md §11).
 */

const MAX_PATH_LENGTH = 80;
const MAX_REFERRER_LENGTH = 120;
const MAX_BODY_BYTES = 2048;

function todayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function normalisePath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) return "/";
  const [path] = value.split(/[?#]/);
  const trimmed = (path ?? "/").slice(0, MAX_PATH_LENGTH);
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function normaliseReferrer(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) return "direct";
  try {
    return new URL(value).hostname.slice(0, MAX_REFERRER_LENGTH) || "direct";
  } catch {
    return "direct";
  }
}

function deviceClass(width: unknown): string {
  if (typeof width !== "number" || !Number.isFinite(width) || width <= 0) return "unknown";
  if (width < 768) return "mobile";
  if (width < 1280) return "tablet";
  return "desktop";
}

/** Rate limiting: one accepted view per session per 2 seconds. */
const recent = new Map<string, number>();
const MIN_INTERVAL_MS = 2000;

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return accepted();
    payload = JSON.parse(raw) as unknown;
  } catch {
    return accepted();
  }

  const body = (typeof payload === "object" && payload !== null ? payload : {}) as Record<
    string,
    unknown
  >;

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 64) : randomUUID();

  const now = Date.now();
  const last = recent.get(sessionId) ?? 0;
  if (now - last < MIN_INTERVAL_MS) return accepted();
  recent.set(sessionId, now);
  if (recent.size > 5000) recent.clear();

  const document = await readDocument<MetricsDocument>(
    STORE_FILES.metrics,
    { version: 1, days: {}, sessions: {} },
    (value) => {
      const source = (typeof value === "object" && value !== null ? value : {}) as Record<
        string,
        unknown
      >;
      const days = (typeof source.days === "object" && source.days !== null ? source.days : {}) as Record<
        string,
        MetricsDay
      >;
      return { version: 1, days, sessions: {} };
    },
  );

  const key = todayKey(new Date());
  const day: MetricsDay = document.days[key] ?? {
    views: 0,
    visitors: 0,
    paths: {},
    referrers: {},
    devices: {},
  };

  const knownSessions = document.sessions[key] ?? [];
  const isNewVisitor = !knownSessions.includes(sessionId);

  const path = normalisePath(body.path);
  const referrer = normaliseReferrer(body.referrer);
  const device = deviceClass(body.viewportWidth);

  const next: MetricsDocument = {
    version: 1,
    days: {
      ...document.days,
      [key]: {
        views: day.views + 1,
        visitors: day.visitors + (isNewVisitor ? 1 : 0),
        paths: { ...day.paths, [path]: (day.paths[path] ?? 0) + 1 },
        referrers: { ...day.referrers, [referrer]: (day.referrers[referrer] ?? 0) + 1 },
        devices: { ...day.devices, [device]: (day.devices[device] ?? 0) + 1 },
      },
    },
    sessions: {
      ...document.sessions,
      [key]: isNewVisitor ? [...knownSessions, sessionId].slice(-20000) : knownSessions,
    },
  };

  // Sessions lists only need to be accurate for recent days.
  if (Object.keys(next.sessions).length > 30) {
    const trimmed = Object.fromEntries(Object.entries(next.sessions).slice(-30));
    next.sessions = trimmed;
  }

  try {
    await writeDocument(STORE_FILES.metrics, next);
  } catch (error) {
    // Analytics are never worth an error the visitor can see.
    console.error("[metrics] write failed", error);
  }

  return accepted();
}

function accepted(): NextResponse {
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
