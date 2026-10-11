import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getReviews, saveReviews } from "@/data/store/repositories";
import { badRequest, jsonOk, requireAdmin } from "@/lib/admin/guard";

/**
 * Review moderation. The queue shows pending submissions; an administrator
 * approves, rejects or deletes them (ARCHITECTURE.md §10).
 */

export async function GET(): Promise<NextResponse> {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  return jsonOk({ reviews: await getReviews() });
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  let payload: unknown;
  try {
    payload = (await request.json()) as unknown;
  } catch {
    return badRequest("Invalid request.");
  }

  const body = (typeof payload === "object" && payload !== null ? payload : {}) as Record<
    string,
    unknown
  >;
  const id = typeof body.id === "string" ? body.id : "";
  const status = body.status;

  const reviews = await getReviews();
  const target = reviews.find((review) => review.id === id);
  if (!target) return badRequest("Review not found.");

  if (status === "approved" || status === "rejected" || status === "pending") {
    await saveReviews(
      reviews.map((review) => (review.id === id ? { ...review, status } : review)),
    );
  } else if (body.remove === true) {
    await saveReviews(reviews.filter((review) => review.id !== id));
  } else {
    return badRequest("Unknown action.");
  }

  revalidatePath("/", "layout");

  return jsonOk({ ok: true });
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  const reviews = await getReviews();

  await saveReviews(reviews.filter((review) => review.id !== id));

  revalidatePath("/", "layout");

  return jsonOk({ ok: true });
}
