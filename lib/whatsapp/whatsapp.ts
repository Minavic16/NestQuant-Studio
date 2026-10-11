import type { EnquiryEntry, Product } from "@/data/types";

/**
 * Enquiry message building (ARCHITECTURE.md §7).
 *
 * Contact details are passed in rather than read from configuration, so the
 * same functions work with the values the admin edits in the dashboard while
 * staying pure and testable. Defaults match `config/contact.ts`.
 */

export type ContactDetails = {
  email: string;
  /** Normalised for wa.me links: no "+", no spaces, no punctuation. */
  whatsappNumber: string;
};

export const DEFAULT_BUSINESS_NAME = "Desired Homes Interiors";

const GREETING = `Hello ${DEFAULT_BUSINESS_NAME},`;

function formatLine(index: number, entry: EnquiryEntry): string {
  const parts = [`${index}. ${entry.product.name}`];
  if (entry.product.sku) parts.push(`(SKU: ${entry.product.sku})`);
  if (entry.quantity > 1) parts.push(`× ${entry.quantity}`);
  return parts.join(" ");
}

/** Shared body for both WhatsApp and email enquiries. */
export function buildEnquiryMessage(entries: readonly EnquiryEntry[]): string {
  return [
    GREETING,
    "",
    "I would like to enquire about:",
    "",
    ...entries.map((entry, index) => formatLine(index + 1, entry)),
    "",
    "Please provide availability, pricing and further details.",
    "",
    "Thank you.",
  ].join("\n");
}

export function buildProductMessage(product: Product): string {
  return [
    GREETING,
    "",
    "I would like to enquire about:",
    "",
    `Product: ${product.name}`,
    ...(product.sku ? [`SKU: ${product.sku}`] : []),
    "",
    "Please provide pricing and availability.",
    "",
    "Thank you.",
  ].join("\n");
}

/** wa.me deep link with the encoded message. */
export function buildWhatsAppUrl(message: string, contact: ContactDetails): string {
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildEnquiryWhatsAppUrl(
  entries: readonly EnquiryEntry[],
  contact: ContactDetails,
): string {
  return buildWhatsAppUrl(buildEnquiryMessage(entries), contact);
}

export function buildProductWhatsAppUrl(product: Product, contact: ContactDetails): string {
  return buildWhatsAppUrl(buildProductMessage(product), contact);
}

/** Bare chat link, no pre-filled message. */
export function whatsappChatUrl(contact: ContactDetails): string {
  return `https://wa.me/${contact.whatsappNumber}`;
}

/** Human-readable rendering of a normalised number. */
export function formatWhatsAppNumber(digits: string): string {
  const countryCode = digits.slice(0, 3);
  const rest = digits.slice(3);

  const groups: string[] = [];
  for (let index = 0; index < rest.length; index += 3) {
    groups.push(rest.slice(index, index + 3));
  }

  // A trailing single digit belongs with the previous group (913 879 798 0 → 913 879 7980).
  const last = groups.at(-1);
  if (groups.length > 1 && last?.length === 1) {
    groups[groups.length - 2] = `${groups[groups.length - 2]}${last}`;
    groups.pop();
  }

  return [`+${countryCode}`, ...groups].join(" ");
}
