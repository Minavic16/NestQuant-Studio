import { seedCatalogue } from "./seed-catalogue";
import type { Product } from "@/data/types";

/**
 * The catalogue exposed to the application.
 *
 * Swap this single re-export when real products arrive, or replace it with a
 * repository that fetches from a CMS/database — the UI only ever talks to
 * `lib/products/repository.ts` (ARCHITECTURE.md §16).
 */
export const products: readonly Product[] = seedCatalogue;
