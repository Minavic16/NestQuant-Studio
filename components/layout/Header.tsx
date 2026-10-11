import styles from "./header.module.css";
import { HeaderClient } from "./HeaderClient";
import { resolveContact } from "@/lib/contact/resolve";

/**
 * Site header: sticky, quiet, 72px on desktop and 56px on mobile.
 *
 * The logo is the only brand element; navigation is deliberately restrained
 * (DESIGN.md §8.1–8.2). This shell is a server component so the contact
 * details — which the admin can edit — are read from the store at render time.
 */
export async function Header() {
  const contact = await resolveContact();

  return <HeaderClient contact={contact} />;
}

export { styles as headerStyles };
