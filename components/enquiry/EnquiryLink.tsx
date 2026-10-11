"use client";

import Link from "next/link";
import { useEnquiry } from "@/lib/enquiry/context";
import styles from "./enquiry-link.module.css";

/** Header entry point to the enquiry list, with the current piece count. */
export function EnquiryLink({ className }: { className?: string }) {
  const { count } = useEnquiry();

  return (
    <Link
      href="/enquiry"
      className={[styles.link, className ?? ""].filter(Boolean).join(" ")}
      aria-label={count > 0 ? `Enquiry, ${count} items` : "Enquiry"}
    >
      <span>Enquiry</span>
      {count > 0 && (
        <span className={styles.count} data-testid="enquiry-count">
          {count}
        </span>
      )}
    </Link>
  );
}
