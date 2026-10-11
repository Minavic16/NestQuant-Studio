"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import styles from "./mobile-nav.module.css";
import { BrandLogo } from "./BrandLogo";
import { EnquiryLink } from "@/components/enquiry/EnquiryLink";
import { primaryNavigation } from "@/config/navigation";
import { useDialogBehaviour } from "@/lib/hooks/use-dialog-behaviour";
import { formatWhatsAppNumber, whatsappChatUrl } from "@/lib/whatsapp/whatsapp";
import type { ContactDetails } from "@/lib/whatsapp/whatsapp";
import { CloseIcon } from "@/components/ui/icons";

/**
 * Mobile navigation drawer. Black so the supplied lockup sits on its own field
 * (DESIGN.md §8.2); a real dialog with focus handling and Escape to close.
 */
export function MobileNav({
  onClose,
  contact,
}: {
  onClose: () => void;
  contact: ContactDetails;
}) {
  const panelRef = useDialogBehaviour(true, onClose);

  return createPortal(
    <div className={styles.root}>
      <div className={styles.scrim} onClick={onClose} aria-hidden="true" />
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        ref={panelRef}
        tabIndex={-1}
        data-testid="mobile-nav"
      >
        <div className={styles.head}>
          <BrandLogo variant="complete" className={styles.logo} />
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close menu"
            data-testid="menu-close"
          >
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Mobile" className={styles.nav}>
          <ul className={styles.list}>
            {primaryNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.link} onClick={onClose}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <EnquiryLink className={styles.enquiryLink} />
            </li>
          </ul>
        </nav>

        <div className={styles.foot}>
          <a href={`mailto:${contact.email}`} className={styles.contact} onClick={onClose}>
            {contact.email}
          </a>
          <a
            href={whatsappChatUrl(contact)}
            className={styles.contact}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
          >
            WhatsApp {formatWhatsAppNumber(contact.whatsappNumber)}
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}
