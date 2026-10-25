import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * File-backed document store.
 *
 * Content lives in JSON documents on disk so the admin dashboard can edit it
 * without a database, and so a container can persist it with a single volume.
 *
 * Properties that matter:
 *   • atomic writes (temp file + rename), a crash never leaves a half document
 *   • mtime-keyed cache, edits are picked up without restarting the process
 *   • typed readers with validation, a hand-edited file fails loudly, not silently
 */

const STORE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "store");
const TMP_SUFFIX = ".tmp";

type CacheEntry = { mtimeMs: number; value: unknown };
const cache = new Map<string, CacheEntry>();

export const STORE_FILES = {
  catalogue: "catalogue.json",
  site: "site.json",
  reviews: "reviews.json",
  portfolio: "portfolio.json",
  metrics: "metrics.json",
  sessions: "sessions.json",
} as const;

export type StoreFileName = (typeof STORE_FILES)[keyof typeof STORE_FILES];

function pathFor(file: StoreFileName): string {
  return join(STORE_DIR, file);
}

/** Absolute path of a store document (also used for existence checks). */
export function storePath(file: StoreFileName): string {
  return pathFor(file);
}

/** Read and validate a document. Missing files return the provided fallback. */
export async function readDocument<T>(
  file: StoreFileName,
  fallback: T,
  validate?: (value: unknown) => T,
): Promise<T> {
  const path = pathFor(file);

  let mtimeMs: number;
  try {
    mtimeMs = (await stat(path)).mtimeMs;
  } catch {
    return fallback;
  }

  const cached = cache.get(path);
  if (cached && cached.mtimeMs === mtimeMs) return cached.value as T;

  try {
    const raw = await readFile(path, "utf8");
    const parsed: unknown = JSON.parse(raw);
    const value = validate ? validate(parsed) : (parsed as T);
    cache.set(path, { mtimeMs, value });
    return value;
  } catch (error) {
    // Never serve a corrupt document as if it were empty: preserve the last
    // known-good value, and surface the problem to the caller's logs.
    if (cached) {
      console.error(`[store] ${file} unreadable (${String(error)}); serving cached copy`);
      return cached.value as T;
    }
    console.error(`[store] ${file} unreadable (${String(error)}); using fallback`);
    return fallback;
  }
}

/** Atomically write a document. */
export async function writeDocument(file: StoreFileName, value: unknown): Promise<void> {
  const path = pathFor(file);
  await mkdir(dirname(path), { recursive: true });

  const temporary = `${path}${TMP_SUFFIX}`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporary, path);

  cache.set(path, { mtimeMs: (await stat(path)).mtimeMs, value });
}

/** Remove the in-process cache (used by tests and after bulk imports). */
export function clearStoreCache(): void {
  cache.clear();
}
