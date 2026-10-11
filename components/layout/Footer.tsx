import Link from "next/link";
import styles from "./footer.module.css";
import { BrandLogo } from "./BrandLogo";
import { resolveContact } from "@/lib/contact/resolve";
import { formatWhatsAppNumber, whatsappChatUrl } from "@/lib/whatsapp/whatsapp";
import { footerNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";

/** Small, quiet footer — not a corporate sitemap (DESIGN.md §8.11). */
export async function Footer() {
  const contact = await resolveContact();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <BrandLogo variant="monogram" className={styles.logo} />
            <p className={styles.services}>{siteConfig.servicesLine}</p>
          </div>

          <nav aria-label="Footer" className={styles.nav}>
            <ul className={styles.list}>
              {footerNavigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.contact}>
            <a href={`mailto:${contact.email}`} className={styles.link}>
              {contact.email}
            </a>
            <a
              href={whatsappChatUrl(contact)}
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp {formatWhatsAppNumber(contact.whatsappNumber)}
            </a>
          </div>
        </div>

        <p className={styles.copyright}>
          © {year} {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
