import {
  emptyEnquiry,
  enquiryReducer,
  type EnquiryAction,
  type EnquiryState,
} from "./reducer";
import type { EnquiryStorage } from "./storage";

/**
 * A framework-agnostic external store for the enquiry list.
 *
 * Deliberately tiny: `subscribe`/`getSnapshot` are all React needs (via
 * `useSyncExternalStore`), which keeps the whole feature testable without React
 * and without a state-management dependency.
 */

export type EnquiryListener = () => void;

export interface EnquiryStore {
  subscribe(listener: EnquiryListener): () => void;
  getSnapshot(): EnquiryState;
  /** Constant empty state: server HTML and the first client render always agree. */
  getServerSnapshot(): EnquiryState;
  dispatch(action: EnquiryAction): void;
  add(slug: string): void;
  remove(slug: string): void;
  setQuantity(slug: string, quantity: number): void;
  clear(): void;
  /** Read persisted items once, on mount. */
  hydrate(): void;
}

export function createEnquiryStore(storage: EnquiryStorage | null = null): EnquiryStore {
  let state: EnquiryState = emptyEnquiry;
  let hydrated = false;
  const listeners = new Set<EnquiryListener>();

  const emit = () => {
    for (const listener of listeners) listener();
  };

  const store: EnquiryStore = {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => state,
    getServerSnapshot: () => emptyEnquiry,
    dispatch(action) {
      const next = enquiryReducer(state, action);
      if (next === state) return;
      state = next;
      storage?.write(next.items);
      emit();
    },
    add(slug) {
      store.dispatch({ type: "add", slug });
    },
    remove(slug) {
      store.dispatch({ type: "remove", slug });
    },
    setQuantity(slug, quantity) {
      store.dispatch({ type: "setQuantity", slug, quantity });
    },
    clear() {
      store.dispatch({ type: "clear" });
    },
    hydrate() {
      if (hydrated) return;
      hydrated = true;
      const items = storage?.read() ?? null;
      if (items && items.length > 0) store.dispatch({ type: "hydrate", items });
    },
  };

  return store;
}
