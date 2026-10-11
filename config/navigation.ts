/**
 * Navigation structure. Routes are declared once and referenced by the header,
 * the mobile drawer and the footer.
 */

export const primaryNavigation = [
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "Our work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/** The enquiry list replaces a cart; it is an action, not a navigation section. */
export const enquiryNavigation = { label: "Enquiry", href: "/enquiry" } as const;

export const footerNavigation = [
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "Our work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;
