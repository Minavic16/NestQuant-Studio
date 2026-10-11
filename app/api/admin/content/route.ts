import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  getCatalogue,
  getPortfolio,
  getSite,
  saveCatalogue,
  savePortfolio,
  saveSite,
  seedCatalogueDocument,
  validateCatalogue,
  validateSite,
} from "@/data/store/repositories";
import { badRequest, jsonOk, requireAdmin } from "@/lib/admin/guard";

/**
 * Admin content API: products, categories, contact details and site copy.
 *
 * Every write validates the incoming document before it is persisted, so a
 * malformed request can never corrupt the store (ARCHITECTURE.md §10).
 */

export async function GET(): Promise<NextResponse> {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const [catalogue, site, portfolio] = await Promise.all([
    getCatalogue(),
    getSite(),
    getPortfolio(),
  ]);

  return jsonOk({ catalogue, site, portfolio });
}

export async function PUT(request: Request): Promise<NextResponse> {
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

  if ("catalogue" in body) {
    await saveCatalogue(validateCatalogue(body.catalogue ?? seedCatalogueDocument()));
  }

  if ("site" in body) {
    await saveSite(validateSite(body.site ?? {}));
  }

  if ("portfolio" in body) {
    const source = (typeof body.portfolio === "object" && body.portfolio !== null
      ? body.portfolio
      : {}) as Record<string, unknown>;
    const items = Array.isArray(source.items) ? source.items : [];
    await savePortfolio(items);
  }

  // Refresh the public pages so an edit is visible immediately.
  revalidatePath("/", "layout");

  return jsonOk({ ok: true });
}
