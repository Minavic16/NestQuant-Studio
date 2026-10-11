import { ButtonLink } from "@/components/ui/ButtonLink";
import { resolveContact } from "@/lib/contact/resolve";
import { whatsappChatUrl } from "@/lib/whatsapp/whatsapp";
import { copy } from "@/data/content/copy";

/**
 * Contact page call to action. A server component resolves the contact details
 * from the store, so the admin can change them without a redeploy.
 */
export async function WhatsAppChatButton({ className }: { className?: string }) {
  const contact = await resolveContact();

  return (
    <ButtonLink
      href={whatsappChatUrl(contact)}
      variant="primary"
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {copy.contact.chatCta}
    </ButtonLink>
  );
}
