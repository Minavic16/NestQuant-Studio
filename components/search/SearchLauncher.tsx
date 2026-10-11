"use client";

import { lazy, useState } from "react";
import styles from "./search-launcher.module.css";
import { SearchIcon } from "@/components/ui/icons";

/**
 * Search entry point. The search panel (and its index) is code-split and only
 * downloaded when the visitor actually searches (ARCHITECTURE.md §11).
 */
const SearchPanelLazy = lazy(() =>
  import("@/components/search/SearchPanel").then((module) => ({ default: module.SearchPanel })),
);

export function SearchLauncher({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={[styles.trigger, className ?? ""].filter(Boolean).join(" ")}
        onClick={() => setOpen(true)}
        aria-label="Search"
        aria-expanded={open}
        aria-haspopup="dialog"
        data-testid="search-open"
      >
        <SearchIcon />
      </button>
      {open && <SearchPanelLazy onClose={() => setOpen(false)} />}
    </>
  );
}
