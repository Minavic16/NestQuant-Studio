import type { Metadata } from "next";
import { getCatalogue, getReviews } from "@/data/store/repositories";
import { MetricsPanel } from "@/components/admin/MetricsPanel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [catalogue, reviews] = await Promise.all([getCatalogue(), getReviews()]);
  const pending = reviews.filter((review) => review.status === "pending").length;

  return (
    <>
      <AdminPageHeader
        title="Overview"
        intro="How the website is performing, and what needs your attention."
      />

      <MetricsPanel />

      <section className={styles.summary}>
        <h2 className={styles.summaryTitle}>Catalogue</h2>
        <ul className={styles.summaryList}>
          <li>
            <strong>{catalogue.products.length}</strong> products
          </li>
          <li>
            <strong>{catalogue.categories.length}</strong> categories
          </li>
          <li>
            <strong>{pending}</strong> reviews awaiting approval
          </li>
        </ul>
      </section>
    </>
  );
}
