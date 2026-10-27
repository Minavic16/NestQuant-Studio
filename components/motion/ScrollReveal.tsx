"use client";

import { useEffect } from "react";
import { isInInitialViewport, REVEAL_SELECTOR } from "@/lib/motion/reveal";

/**
 * The single scroll-reveal observer for the document.
 *
 * It marks below-fold `[data-reveal]` elements as hidden only after mount,
 * reveals each one once, and disconnects. A MutationObserver registers content
 * added by client-side navigation, so a new route never inherits a stale
 * "hidden" state. With JavaScript disabled, no state is ever written and the
 * stylesheet leaves the content visible.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return;
    }

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = false;
    let observer: IntersectionObserver | null = null;
    let mutations: MutationObserver | null = null;
    let tracked = new WeakSet<Element>();

    const register = (element: HTMLElement) => {
      if (!active || tracked.has(element)) return;
      tracked.add(element);

      if (isInInitialViewport(element.getBoundingClientRect().top, window.innerHeight)) {
        element.dataset.revealState = "visible";
        return;
      }

      element.dataset.revealState = "hidden";
      observer?.observe(element);
    };

    const registerTree = (root: ParentNode) => {
      if (root instanceof HTMLElement && root.matches(REVEAL_SELECTOR)) {
        register(root);
      }
      root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach(register);
    };

    const start = () => {
      if (active) return;
      active = true;

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const element = entry.target as HTMLElement;
            element.dataset.revealState = "visible";
            observer?.unobserve(element);
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
      );

      registerTree(document);

      mutations = new MutationObserver((records) => {
        for (const record of records) {
          record.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) registerTree(node);
          });
        }
      });
      mutations.observe(document.body, { childList: true, subtree: true });
    };

    const stop = () => {
      active = false;
      observer?.disconnect();
      mutations?.disconnect();
      observer = null;
      mutations = null;
      tracked = new WeakSet<Element>();

      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((element) => {
        element.dataset.revealState = "visible";
      });
    };

    const handlePreference = () => {
      if (preference.matches) stop();
      else start();
    };

    if (!preference.matches) start();
    preference.addEventListener("change", handlePreference);

    return () => {
      preference.removeEventListener("change", handlePreference);
      stop();
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((element) => {
        delete element.dataset.revealState;
      });
    };
  }, []);

  return null;
}
