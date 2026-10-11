import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ENQUIRY_STORAGE_KEY,
  createLocalStorageAdapter,
  createNullStorage,
} from "./storage";
import { parseEnquiryItems } from "@/lib/validation/validation";

/** Minimal in-memory Storage stand-in, with an injectable failure mode. */
function createMemoryStorage(options: { failWrites?: boolean } = {}) {
  const map = new Map<string, string>();

  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      if (options.failWrites) throw new Error("QuotaExceededError");
      map.set(key, value);
    },
  } as Storage;
}

describe("createLocalStorageAdapter", () => {
  it("writes and reads an enquiry list", () => {
    const storage = createLocalStorageAdapter(createMemoryStorage());

    storage.write([{ slug: "linen-sheer-curtain", quantity: 2 }]);

    assert.deepEqual(storage.read(), [{ slug: "linen-sheer-curtain", quantity: 2 }]);
  });

  it("returns null when nothing is stored", () => {
    const storage = createLocalStorageAdapter(createMemoryStorage());

    assert.equal(storage.read(), null);
  });

  it("discards corrupt JSON instead of throwing", () => {
    const memory = createMemoryStorage();
    memory.setItem(ENQUIRY_STORAGE_KEY, "{not json");

    assert.equal(createLocalStorageAdapter(memory).read(), null);
  });

  it("discards untrustworthy entries", () => {
    const memory = createMemoryStorage();
    memory.setItem(
      ENQUIRY_STORAGE_KEY,
      JSON.stringify([
        { slug: "linen-sheer-curtain", quantity: 2 },
        { slug: "../../etc", quantity: 1 },
      ]),
    );

    assert.deepEqual(createLocalStorageAdapter(memory).read(), [
      { slug: "linen-sheer-curtain", quantity: 2 },
    ]);
  });

  it("survives a storage quota error", () => {
    const storage = createLocalStorageAdapter(createMemoryStorage({ failWrites: true }));

    assert.doesNotThrow(() => storage.write([{ slug: "linen-sheer-curtain", quantity: 1 }]));
  });

  it("clears the stored list", () => {
    const memory = createMemoryStorage();
    const storage = createLocalStorageAdapter(memory);
    storage.write([{ slug: "linen-sheer-curtain", quantity: 1 }]);

    storage.clear();

    assert.equal(memory.getItem(ENQUIRY_STORAGE_KEY), null);
  });

  it("uses a versioned key so a future schema change can migrate", () => {
    assert.equal(ENQUIRY_STORAGE_KEY, "desired-homes:enquiry:v1");
  });
});

describe("createNullStorage", () => {
  it("is inert when localStorage is unavailable", () => {
    const storage = createNullStorage();

    assert.equal(storage.read(), null);
    assert.doesNotThrow(() => storage.write([{ slug: "linen-sheer-curtain", quantity: 1 }]));
    assert.doesNotThrow(() => storage.clear());
  });
});

describe("parseEnquiryItems", () => {
  it("rejects non-arrays and non-objects", () => {
    assert.deepEqual(parseEnquiryItems("nope"), []);
    assert.deepEqual(parseEnquiryItems(null), []);
    assert.deepEqual(parseEnquiryItems([null, 5, "x"]), []);
  });
});
