import type { EnquiryItem } from "@/data/types";
import { parseEnquiryItems } from "@/lib/validation/validation";

/**
 * The only module that touches `localStorage`. Reads are validated and every
 * write is guarded: private browsing, disabled storage and quota errors must
 * never break the site.
 */

export const ENQUIRY_STORAGE_KEY = "desired-homes:enquiry:v1";

export interface EnquiryStorage {
  read(): readonly EnquiryItem[] | null;
  write(items: readonly EnquiryItem[]): void;
  clear(): void;
}

/** A storage that silently does nothing, used when localStorage is unavailable. */
export function createNullStorage(): EnquiryStorage {
  return { read: () => null, write: () => {}, clear: () => {} };
}

/** Detect a usable, writable localStorage (covers Safari private mode and disabled storage). */
export function resolveBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.localStorage;
    const probe = "__desired_homes_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function createLocalStorageAdapter(storage: Storage | null): EnquiryStorage {
  if (!storage) return createNullStorage();

  return {
    read() {
      try {
        const raw = storage.getItem(ENQUIRY_STORAGE_KEY);
        if (!raw) return null;
        return parseEnquiryItems(JSON.parse(raw) as unknown);
      } catch {
        return null;
      }
    },
    write(items) {
      try {
        storage.setItem(ENQUIRY_STORAGE_KEY, JSON.stringify(items));
      } catch {
        /* Quota or disabled storage: the enquiry stays in memory for this session. */
      }
    },
    clear() {
      try {
        storage.removeItem(ENQUIRY_STORAGE_KEY);
      } catch {
        /* nothing to do */
      }
    },
  };
}

export function createBrowserEnquiryStorage(): EnquiryStorage {
  return createLocalStorageAdapter(resolveBrowserStorage());
}
