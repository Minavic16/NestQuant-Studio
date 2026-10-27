/** Shared contract between the scroll-reveal CSS and its client observer. */
export const REVEAL_SELECTOR = "[data-reveal]";

/**
 * Elements already inside the first viewport are shown immediately. They are
 * never hidden and then animated, so the hero and the first section cannot
 * flash or wait for the observer.
 */
export function isInInitialViewport(top: number, viewportHeight: number): boolean {
  return top < viewportHeight * 0.92;
}
