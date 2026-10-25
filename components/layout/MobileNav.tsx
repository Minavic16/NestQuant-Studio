"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import styles from "./mobile-nav.module.css";
import { EnquiryLink } from "@/components/enquiry/EnquiryLink";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { primaryNavigation, secondaryNavigation } from "@/config/navigation";
import { useDialogBehaviour } from "@/lib/hooks/use-dialog-behaviour";
import { formatWhatsAppNumber, whatsappChatUrl } from "@/lib/whatsapp/whatsapp";
import type { ContactDetails } from "@/lib/whatsapp/whatsapp";
import { CloseIcon } from "@/components/ui/icons";

/**
 * Mobile navigation drawer: a real dialog with focus handling, Escape to close,
 * background scroll lock and focus restoration. The wordmark is set in text so
 * the business name stays legible without a raster logo panel.
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
          <Link href="/" className={styles.brand} onClick={onClose}>
            <span className={styles.wordmark}>Desired Homes</span>
            <span className={styles.wordmarkSub}>Interiors</span>
          </Link>
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
            {secondaryNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.secondaryLink} onClick={onClose}>
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
          <ButtonLink href="/contact" variant="primary" fullWidth onClick={onClose}>
            Discuss your space
          </ButtonLink>
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
