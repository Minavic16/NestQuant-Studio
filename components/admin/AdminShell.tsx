"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./admin-shell.module.css";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { siteConfig } from "@/config/site";

const SECTIONS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/portfolio", label: "Our work" },
  { href: "/admin/content", label: "Contact & content" },
  { href: "/admin/media", label: "Images" },
] as const;

/** The dashboard frame: a quiet, functional shell for the back office. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.brand} aria-label={`${siteConfig.name} dashboard`}>
          <BrandLogo variant="monogram" className={styles.logo} />
        </Link>

        <nav aria-label="Dashboard sections" className={styles.nav}>
          <ul className={styles.list}>
            {SECTIONS.map((section) => {
              const isActive =
                "exact" in section && section.exact
                  ? pathname === section.href
                  : pathname.startsWith(section.href);

              return (
                <li key={section.href}>
                  <Link
                    href={section.href}
                    className={[styles.link, isActive ? styles.active : ""].filter(Boolean).join(" ")}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {section.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <form
          action="/api/admin/session"
          method="delete"
          className={styles.signOutForm}
          onSubmit={(event) => {
            event.preventDefault();
            void fetch("/api/admin/session", { method: "DELETE" }).then(() => {
              router.replace("/admin/login");
              router.refresh();
            });
          }}
        >
          <button type="submit" className={styles.signOut}>
            Sign out
          </button>
        </form>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
