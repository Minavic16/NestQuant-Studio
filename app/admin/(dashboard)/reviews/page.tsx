import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReviewModeration } from "@/components/admin/ReviewModeration";

export const metadata: Metadata = { title: "Reviews" };
export const dynamic = "force-dynamic";

export default function AdminReviewsPage() {
  return (
    <>
      <AdminPageHeader
        title="Reviews"
        intro="Approve visitor reviews to publish them. Everything else stays hidden from the website."
      />
      <ReviewModeration />
    </>
  );
}
