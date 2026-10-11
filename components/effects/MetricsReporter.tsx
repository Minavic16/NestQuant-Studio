"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reports a page view to the first-party collector (`/api/metrics`).
 *
 * Uses `navigator.sendBeacon` when available so the request survives a page
 * unload, and falls back to a plain fetch. Nothing is sent until after the page
 * has painted (ARCHITECTURE.md §11).
 */

const SESSION_KEY = "dhi:session";

function sessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return "anonymous";
  }
}

export function MetricsReporter() {
  const pathname = usePathname();

  useEffect(() => {
    const payload = JSON.stringify({
      path: `${pathname}${window.location.search}`,
      referrer: document.referrer,
      viewportWidth: window.innerWidth,
      sessionId: sessionId(),
    });

    const timer = window.setTimeout(() => {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/metrics", new Blob([payload], { type: "application/json" }));
        return;
      }
      void fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
