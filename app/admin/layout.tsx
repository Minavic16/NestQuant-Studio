import type { Metadata } from "next";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: {
    default: "Dashboard — Desired Homes Interiors",
    template: "%s — Dashboard",
  },
  robots: { index: false, follow: false },
};

/**
 * Root shell for the dashboard.
 *
 * Authentication deliberately lives in the `(dashboard)` route group below,
 * so the sign-in page can be served without a session without fighting its own
 * layout (ARCHITECTURE.md §10).
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.root}>{children}</div>;
}
