import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductList } from "@/components/admin/ProductList";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  return (
    <>
      <AdminPageHeader
        title="Products"
        intro="Everything in the catalogue. Open a product to edit its details, images and specifications."
        actions={
          <a href="/admin/content" className={styles.action}>
            Add a product
          </a>
        }
      />
      <ProductList />
    </>
  );
}
