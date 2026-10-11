import type { EnquiryEntry } from "@/data/types";
import { buildEnquiryMessage, type ContactDetails } from "@/lib/whatsapp/whatsapp";

/**
 * Email enquiries via `mailto:` — no backend mail server (ARCHITECTURE.md §7).
 */

export const ENQUIRY_EMAIL_SUBJECT = "Product Enquiry - Desired Homes Interiors";

export function buildEnquiryMailtoUrl(
  entries: readonly EnquiryEntry[],
  contact: ContactDetails,
): string {
  const body = buildEnquiryMessage(entries).replace(/\n/g, "\r\n");
  const params = new URLSearchParams({ subject: ENQUIRY_EMAIL_SUBJECT, body });
  return `mailto:${contact.email}?${params.toString().replace(/\+/g, "%20")}`;
}
