"use client";

import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import styles from "./mobile-nav.module.css";
import { EnquiryLink } from "@/components/enquiry/EnquiryLink";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { primaryNavigation, secondaryNavigation } from "@/config/navigation";
import { useDialogBehaviour } from "@/lib/hooks/use-dialog-behaviour";
import { formatWhatsAppNumber, whatsappChatUrl } from "@/lib/whatsapp/whatsapp";
import type { ContactDetails } from "@/lib/whatsapp/whatsapp";
import { CloseIcon } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";

/**
 * Mobile navigation drawer: a real dialog with focus handling, Escape to close,
 * background scroll lock and focus restoration. The supplied light lockup keeps
 * the brand legible on the dark panel.
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
        className={`${styles.panel} on-dark`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        ref={panelRef}
        tabIndex={-1}
        data-testid="mobile-nav"
      >
        <div className={styles.head}>
          <Link
            href="/"
            className={styles.brand}
            onClick={onClose}
            aria-label={`${siteConfig.name}, home`}
          >
            <Image
              src="/brand/desired-homes-logo-light.svg"
              alt=""
              width={1764}
              height={789}
              className={styles.logo}
              aria-hidden="true"
            />
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
