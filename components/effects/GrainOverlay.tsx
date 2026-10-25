"use client";

import styles from "./grain-overlay.module.css";

/**
 * Surface texture: one fixed, inert overlay for the whole document.
 * Pure CSS (a data-URI SVG tile), no JavaScript, no network request.
 */
export function GrainOverlay() {
  return <div className={styles.grain} aria-hidden="true" data-testid="grain" />;
}
