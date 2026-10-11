"use client";

import { useEffect } from "react";
import { GrainOverlay } from "./GrainOverlay";

/**
 * Motion layer: surface texture + scroll-linked reveals.
 *
 * Everything here is progressive enhancement:
 *   • with JavaScript off, every element is visible and the site is unchanged
 *   • with `prefers-reduced-motion: reduce`, Lenis is never started and
 *     reveals resolve instantly
 *   • the animation is set from JavaScript (`gsap.set`), not from CSS, so a
 *     failed script can never leave content invisible
 *
 * Packages: GSAP (ScrollTrigger) for reveals, Lenis for smooth scrolling.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function MotionProvider() {
  useEffect(() => {
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);

    let cleanup = () => {};
    let context: { revert: () => void } | null = null;

    void (async () => {
      if (reduced.matches) return;

      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);

      gsap.registerPlugin(ScrollTrigger);

      // Smooth scrolling, driven by GSAP's ticker so the two stay in step.
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Reveals: content starts wherever it is (visible), and only animates
      // once it has been measured — so a layout shift can never trap it offscreen.
      const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
      if (targets.length > 0) {
        context = gsap.context(() => {
          targets.forEach((element) => {
            gsap.fromTo(
              element,
              { autoAlpha: 0, y: 14 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
                scrollTrigger: { trigger: element, start: "top 92%", once: true },
              },
            );
          });
        });
      }

      cleanup = () => {
        context?.revert();
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    })();

    const onPreferenceChange = () => {
      cleanup();
      cleanup = () => {};
    };
    reduced.addEventListener("change", onPreferenceChange);

    return () => {
      reduced.removeEventListener("change", onPreferenceChange);
      cleanup();
    };
  }, []);

  return <GrainOverlay />;
}
