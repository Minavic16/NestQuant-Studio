import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getProducts, getReviews, saveReviews } from "@/data/store/repositories";
import type { Review } from "@/data/store/schema";

/**
 * Visitor-submitted reviews.
 *
 * Every submission lands as `pending` and is invisible on the site until an
 * administrator approves it in the dashboard. The business never publishes
 * anything a visitor wrote without a human having read it first (DESIGN.md §11).
 */

const MAX_NAME_LENGTH = 60;
const MAX_BODY_LENGTH = 1200;
const MIN_BODY_LENGTH = 10;
const MAX_BODY_BYTES = 4096;

/** Simple in-memory throttle: one submission per IP per 30 seconds. */
const recent = new Map<string, number>();
const MIN_INTERVAL_MS = 30_000;

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  return forwarded.split(",")[0]?.trim() || "unknown";
}

function sanitiseText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export async function POST(request: Request): Promise<NextResponse> {
  const key = clientKey(request);
  const now = Date.now();
  if (now - (recent.get(key) ?? 0) < MIN_INTERVAL_MS) {
    return NextResponse.json(
      { error: "Please wait a moment before submitting another review." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Review is too long." }, { status: 413 });
    }
    payload = JSON.parse(raw) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const body = (typeof payload === "object" && payload !== null ? payload : {}) as Record<
    string,
    unknown
  >;

  const author = sanitiseText(body.author, MAX_NAME_LENGTH);
  const text = typeof body.body === "string" ? body.body.trim().slice(0, MAX_BODY_LENGTH) : "";
  const rating = typeof body.rating === "number" ? Math.round(body.rating) : 0;
  const subject = typeof body.subject === "string" ? body.subject.slice(0, 60) : "site";

  if (author.length < 2) {
    return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
  }
  if (text.length < MIN_BODY_LENGTH) {
    return NextResponse.json(
      { error: "Please write at least a sentence about your experience." },
      { status: 400 },
    );
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Please choose a rating from 1 to 5." }, { status: 400 });
  }

  // The product must actually exist, so a review can never be attached to a
  // slug that does not correspond to a real product.
  const products = await getProducts();
  const product = products.find((entry) => entry.slug === subject);

  const review: Review = {
    id: randomUUID(),
    subject: product ? product.slug : "site",
    productName: product?.name ?? "",
    author,
    rating,
    body: text,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  try {
    await saveReviews([review, ...(await getReviews())]);
  } catch (error) {
    console.error("[reviews] write failed", error);
    return NextResponse.json(
      { error: "Your review could not be saved on this deployment. Please try again shortly." },
      { status: 507 },
    );
  }

  recent.set(key, now);

  return NextResponse.json({ ok: true }, { status: 201 });
}

/** Approved reviews for a subject — used by the public review list. */
export async function GET(request: Request): Promise<NextResponse> {
  const subject = new URL(request.url).searchParams.get("subject");
  const reviews = await getReviews();
  const filtered = reviews.filter(
    (review) => review.status === "approved" && (!subject || review.subject === subject),
  );

  return NextResponse.json(
    { reviews: filtered },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}
