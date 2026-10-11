import { getContact } from "@/data/store/repositories";
import { contactConfig } from "@/config/contact";
import type { ContactDetails } from "@/lib/whatsapp/whatsapp";

/**
 * Resolves the contact details the site should use right now.
 *
 * The admin dashboard can edit email and WhatsApp number; until it does, the
 * values ship from `config/contact.ts` (ARCHITECTURE.md §7). This is the single
 * place the store is consulted, so every WhatsApp/email link stays consistent.
 */
export async function resolveContact(): Promise<ContactDetails> {
  try {
    const contact = await getContact();
    return {
      email: contact.email,
      whatsappNumber: contact.whatsappNumber,
    };
  } catch {
    return { email: contactConfig.email, whatsappNumber: contactConfig.whatsappNumber };
  }
}
