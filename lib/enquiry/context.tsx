"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { EnquiryItem } from "@/data/types";
import { createEnquiryStore, type EnquiryStore } from "./store";
import { createBrowserEnquiryStorage } from "./storage";

/**
 * React bindings for the enquiry store.
 *
 * `getServerSnapshot` returns a constant empty state so the server HTML and the
 * first client render always match, no hydration mismatch, and the header
 * renders identically for every visitor until the list is restored from
 * localStorage after mount.
 */

export interface EnquiryContextValue {
  items: readonly EnquiryItem[];
  /** Total number of pieces across all items. */
  count: number;
  has: (slug: string) => boolean;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
}

const EnquiryContext = createContext<EnquiryContextValue | null>(null);

const fallbackContextValue: EnquiryContextValue = {
  items: [],
  count: 0,
  has: () => false,
  add: () => {},
  remove: () => {},
  setQuantity: () => {},
  clear: () => {},
};

export function EnquiryProvider({
  children,
  store,
}: {
  children: ReactNode;
  /** Injectable for tests; defaults to the browser-persisted singleton. */
  store?: EnquiryStore;
}) {
  const activeStore = useMemo(() => store ?? defaultStore, [store]);

  useEffect(() => {
    activeStore.hydrate();
  }, [activeStore]);

  const items = useSyncExternalStore(
    activeStore.subscribe,
    activeStore.getSnapshot,
    activeStore.getServerSnapshot,
  ).items;

  const value = useMemo<EnquiryContextValue>(() => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    return {
      items,
      count,
      has: (slug) => items.some((item) => item.slug === slug),
      add: (slug) => activeStore.add(slug),
      remove: (slug) => activeStore.remove(slug),
      setQuantity: (slug, quantity) => activeStore.setQuantity(slug, quantity),
      clear: () => activeStore.clear(),
    };
  }, [items, activeStore]);

  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>;
}

const defaultStore: EnquiryStore = createEnquiryStore(
  typeof window === "undefined" ? null : createBrowserEnquiryStorage(),
);

export function useEnquiry(): EnquiryContextValue {
  return useContext(EnquiryContext) ?? fallbackContextValue;
}
