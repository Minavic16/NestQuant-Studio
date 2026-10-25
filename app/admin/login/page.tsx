import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin/session";
import { LoginForm } from "@/components/admin/LoginForm";
import { siteConfig } from "@/config/site";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Sign in, Dashboard",
  robots: { index: false, follow: false },
};

/**
 * The dashboard sign-in page. It is the only page under /admin that renders
 * without a session, so the layout redirect is bypassed here.
 */
export default async function AdminLoginPage() {
  if (await isAuthenticated()) redirect("/admin");

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>{siteConfig.name}</p>
        <LoginForm />
      </div>
    </div>
  );
}
