import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageLibrary } from "@/components/admin/ImageLibrary";

export const metadata: Metadata = { title: "Images" };
export const dynamic = "force-dynamic";

export default function AdminMediaPage() {
  return (
    <>
      <AdminPageHeader
        title="Images"
        intro="Upload photography here, then attach it to a product from the products page."
      />
      <ImageLibrary />
    </>
  );
}
