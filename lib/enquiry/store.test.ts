import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { createEnquiryStore } from "./store";
import { createLocalStorageAdapter } from "./storage";
import type { EnquiryItem } from "@/data/types";

function createMemoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
  } as Storage;
}

describe("createEnquiryStore", () => {
  it("notifies subscribers when state changes", () => {
    const store = createEnquiryStore();
    const listener = mock.fn();
    const unsubscribe = store.subscribe(listener);

    store.add("linen-sheer-curtain");

    assert.equal(listener.mock.callCount(), 1);
    assert.deepEqual(store.getSnapshot().items, [{ slug: "linen-sheer-curtain", quantity: 1 }]);

    unsubscribe();
    store.add("decorative-tieback");
    assert.equal(listener.mock.callCount(), 1);
  });

  it("does not notify when an action changes nothing", () => {
    const store = createEnquiryStore();
    const listener = mock.fn();
    store.subscribe(listener);

    store.add("linen-sheer-curtain");
    store.add("linen-sheer-curtain");

    assert.equal(listener.mock.callCount(), 1);
  });

  it("always returns the same empty server snapshot", () => {
    const store = createEnquiryStore();

    assert.equal(store.getServerSnapshot(), store.getServerSnapshot());
  });

  it("persists to storage and hydrates from it", () => {
    const storage = createLocalStorageAdapter(createMemoryStorage());
    const store = createEnquiryStore(storage);

    store.add("linen-sheer-curtain");
    store.setQuantity("linen-sheer-curtain", 3);

    const restored = createEnquiryStore(storage);
    restored.hydrate();

    assert.deepEqual(restored.getSnapshot().items, [{ slug: "linen-sheer-curtain", quantity: 3 }]);
  });

  it("hydrates only once", () => {
    const storage = createLocalStorageAdapter(createMemoryStorage());
    const store = createEnquiryStore(storage);
    const persisted: EnquiryItem[] = [{ slug: "decorative-tieback", quantity: 2 }];
    storage.write(persisted);

    store.hydrate();
    store.clear();
    store.hydrate();

    assert.deepEqual(store.getSnapshot().items, []);
  });

  it("clears storage as well as state", () => {
    const memory = createMemoryStorage();
    const storage = createLocalStorageAdapter(memory);
    const store = createEnquiryStore(storage);

    store.add("linen-sheer-curtain");
    assert.match(memory.getItem("desired-homes:enquiry:v1") ?? "", /linen-sheer-curtain/);

    store.clear();
    assert.deepEqual(store.getSnapshot().items, []);
    assert.equal(memory.getItem("desired-homes:enquiry:v1"), "[]");
  });
});
