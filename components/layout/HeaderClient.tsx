"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./header.module.css";
import { PrimaryNav } from "@/components/navigation/PrimaryNav";
import { EnquiryLink } from "@/components/enquiry/EnquiryLink";
import { SearchLauncher } from "@/components/search/SearchLauncher";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { MobileNav } from "./MobileNav";
import type { ContactDetails } from "@/lib/whatsapp/whatsapp";
import { MenuIcon } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";

/**
 * Header chrome (client): opens the mobile drawer and hosts the search
 * launcher. The supplied lockup carries the brand name in its own letterforms,
 * so the header does not depend on a typed approximation.
 */
export function HeaderClient({ contact }: { contact: ContactDetails }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link
            href="/"
            className={styles.brand}
            aria-label={`${siteConfig.name}, home`}
          >
            <Image
              src="/brand/desired-homes-logo.svg"
              alt=""
              width={1764}
              height={789}
              className={styles.logo}
              priority
              aria-hidden="true"
            />
          </Link>

          <PrimaryNav className={styles.desktopNav} />

          <div className={styles.actions}>
            <SearchLauncher />
            <EnquiryLink className={styles.enquiryLink} />
            <ButtonLink href="/contact" variant="primary" className={styles.contactCta}>
              Discuss your space
            </ButtonLink>
          </div>

          <div className={styles.mobileActions}>
            <SearchLauncher />
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              data-testid="menu-open"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && <MobileNav onClose={() => setMenuOpen(false)} contact={contact} />}
    </>
  );
}
