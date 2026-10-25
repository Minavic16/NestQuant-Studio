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

/**
 * Header chrome (client): opens the mobile drawer and hosts the search
 * launcher. The wordmark carries the brand name in text beside the supplied
 * monogram, so the business is legible without relying on a raster logo.
 */
export function HeaderClient({ contact }: { contact: ContactDetails }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href="/" className={styles.brand}>
            <Image
              src="/brand/desired-homes-monogram.svg"
              alt=""
              width={288}
              height={202}
              className={styles.mark}
              aria-hidden="true"
            />
            <span className={styles.wordmark}>
              <span className={styles.wordmarkName}>Desired Homes</span>
              <span className={styles.wordmarkSub}>Interiors</span>
            </span>
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
