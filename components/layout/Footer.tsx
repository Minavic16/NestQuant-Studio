import Link from "next/link";
import styles from "./footer.module.css";
import { resolveContact } from "@/lib/contact/resolve";
import { formatWhatsAppNumber, whatsappChatUrl } from "@/lib/whatsapp/whatsapp";
import { footerNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";

/** Warm, quiet footer with the verified business details. */
export async function Footer() {
  const contact = await resolveContact();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <p className={styles.wordmark}>{siteConfig.name}</p>
            <p className={styles.services}>{siteConfig.servicesLine}</p>
            <p className={styles.note}>
              A catalogue and project enquiry service for curtains, accessories and window
              solutions.
            </p>
          </div>

          <nav aria-label="Footer" className={styles.nav}>
            <p className={styles.columnLabel}>Explore</p>
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
            <p className={styles.columnLabel}>Talk to us</p>
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
            <p className={styles.small}>Enquiries are prepared in WhatsApp or email.</p>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {year} {siteConfig.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
