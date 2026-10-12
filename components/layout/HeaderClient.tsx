"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./header.module.css";
import { PrimaryNav } from "@/components/navigation/PrimaryNav";
import { EnquiryLink } from "@/components/enquiry/EnquiryLink";
import { SearchLauncher } from "@/components/search/SearchLauncher";
import { MobileNav } from "./MobileNav";
import type { ContactDetails } from "@/lib/whatsapp/whatsapp";
import { MenuIcon } from "@/components/ui/icons";

/**
 * Header chrome (client): opens the mobile drawer and hosts the search
 * launcher. Contact details are resolved on the server and passed down.
 *
 * The brand mark is an inline SVG — a traced silhouette of the logo's
 * monogram — rather than the raster logo. It is a few kilobytes instead of
 * tens, scales to any density, and takes `currentColor`, so it needs no
 * preload and no separate asset request (DESIGN.md §1).
 */
export function HeaderClient({ contact }: { contact: ContactDetails }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href="/" className={styles.brand} aria-label="Desired Homes Interiors — home">
            <Image
              src="/brand/desired-homes-monogram.svg"
              alt=""
              width={288}
              height={202}
              className={styles.mark}
              aria-hidden="true"
            />
          </Link>

          <PrimaryNav className={styles.desktopNav} />

          <div className={styles.actions}>
            <SearchLauncher />
            <EnquiryLink className={styles.enquiryLink} />
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
