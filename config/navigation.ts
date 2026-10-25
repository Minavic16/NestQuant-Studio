/**
 * Navigation structure. Routes are declared once and referenced by the header,
 * the mobile drawer and the footer.
 */

export const primaryNavigation = [
  { label: "Our work", href: "/work" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/** The enquiry list replaces a cart; it is an action, not a navigation section. */
export const enquiryNavigation = { label: "Enquiry list", href: "/enquiry" } as const;

export const secondaryNavigation = [{ label: "Categories", href: "/categories" }] as const;

export const footerNavigation = [
  { label: "Home", href: "/" },
  { label: "Our work", href: "/work" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;
