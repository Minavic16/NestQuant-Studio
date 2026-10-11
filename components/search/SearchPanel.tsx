"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import styles from "./search-panel.module.css";
import { SearchInput } from "./SearchInput";
import { SearchResults } from "./SearchResults";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { productRepository } from "@/lib/products";
import { filterProducts } from "@/lib/products/filter";
import { trackSearch } from "@/lib/analytics/analytics";
import { useDialogBehaviour } from "@/lib/hooks/use-dialog-behaviour";
import { copy } from "@/data/content/copy";

const MAX_RESULTS = 6;

/**
 * Search view: a dedicated full-screen view on mobile and a compact panel on
 * desktop (DESIGN.md §27). Code-split, so the search index is only downloaded
 * when a visitor actually searches.
 */
export function SearchPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const panelRef = useDialogBehaviour(true, onClose);

  const results = useMemo(
    () => filterProducts(productRepository.getAll(), { query }).slice(0, MAX_RESULTS),
    [query],
  );

  const submit = () => {
    const trimmed = query.trim();
    if (trimmed) trackSearch(trimmed, results.length);
    router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
    onClose();
  };

  const trimmedQuery = query.trim();

  return createPortal(
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />

      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={copy.search.title}
        ref={panelRef}
        tabIndex={-1}
        data-testid="search-panel"
      >
        <div className={styles.head}>
          <span className={styles.headIcon} aria-hidden="true">
            <SearchIcon />
          </span>

          <SearchInput
            value={query}
            onValueChange={setQuery}
            onSubmit={submit}
            placeholder={copy.search.placeholder}
            autoFocus
            label={copy.search.placeholder}
            className={styles.searchForm}
          />

          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close search"
            data-testid="search-close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className={styles.body}>
          {trimmedQuery.length === 0 ? (
            <p className={styles.hint}>{copy.search.placeholder}</p>
          ) : results.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>{copy.search.empty}</p>
              <p className={styles.emptyHint}>{copy.search.emptyHint}</p>
            </div>
          ) : (
            <>
              <SearchResults products={results} onNavigate={onClose} />
              <Link
                href={`/shop?q=${encodeURIComponent(trimmedQuery)}`}
                className={styles.all}
                onClick={onClose}
              >
                {copy.search.resultsLabel(results.length)} — see all results
              </Link>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
