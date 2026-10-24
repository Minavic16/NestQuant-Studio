/**
 * Editable copy: headlines, section labels and empty states.
 *
 * Keeping wording here means the business can change language without touching a
 * component. Microcopy that belongs to a specific control (e.g. "Add to Enquiry")
 * stays with that control so it can never drift from its behaviour.
 */

export const copy = {
  media: {
    /** Shown inside an image slot until real media is supplied (DESIGN.md §7). */
    pending: "Image to come",
  },

  hero: {
    cta: "Explore Collection",
    note: "Enquiries answered on WhatsApp and by email.",
  },

  nav: {
    /** Quiet way back from interior pages (DESIGN.md §8). */
    backToHome: "Back to Home",
  },

  explore: {
    label: "Explore",
    itemCta: "Explore",
  },

  featured: {
    label: "Featured",
  },

  product: {
    viewDetails: "View details",
    priceOnRequest: "Price on request",
    enquire: "Enquire",
    addToEnquiry: "Add to Enquiry",
    addedToEnquiry: "Added to enquiry",
    askOnWhatsApp: "Ask on WhatsApp",
    backToShop: "Back to Shop",
    specifications: "Specifications",
    sku: "SKU",
    availability: {
      available: "Available now",
      unavailable: "Currently unavailable",
    },
    notFound: {
      title: "Product not found",
      body: "This product may no longer be available.",
    },
  },

  categories: {
    eyebrow: "Collections",
    heading: "Browse by category",
    itemCount: (count: number) => `${count} ${count === 1 ? "piece" : "pieces"}`,
    empty: "No products have been added to this collection yet.",
  },

  shop: {
    eyebrow: "Shop",
    heading: "The collection",
    searchPlaceholder: "Search brackets, rods, rings…",
    filterAll: "All",
    filterAllTypes: "All types",
    empty: "No products found.",
    emptyHint: "Try another search.",
    noProducts: "No products yet.",
    noProductsHint: "The collection is being prepared.",
  },

  search: {
    title: "Search",
    placeholder: "Search brackets, rods, rings…",
    empty: "No products found.",
    emptyHint: "Try another search.",
    resultsLabel: (count: number) => `${count} ${count === 1 ? "result" : "results"}`,
  },

  work: {
    eyebrow: "Our work",
    heading: "Spaces we have finished",
    intro: (count: number) => `${count} completed ${count === 1 ? "project" : "projects"}`,
    empty: "No projects have been published yet.",
    more: "See all our work",
  },

  about: {
    eyebrow: "About",
    heading: "Thoughtful interiors begin with the details.",
    servicesLabel: "What we do",
    contactLink: "Contact us",
  },

  contact: {
    eyebrow: "Contact",
    heading: "Let's discuss your space.",
    emailLabel: "Email",
    whatsappLabel: "WhatsApp",
    chatCta: "Chat on WhatsApp",
    enquiryLink: "Or start an enquiry",
  },

  enquiry: {
    eyebrow: "Enquiry",
    heading: "Your enquiry",
    intro: "Review your selection, then send it to us on WhatsApp or by email.",
    clear: "Clear enquiry",
    whatsappCta: "Send enquiry on WhatsApp",
    emailCta: "Send enquiry by Email",
    quantityLabel: (name: string) => `Quantity for ${name}`,
    remove: "Remove",
    removeLabel: (name: string) => `Remove ${name}`,
    empty: {
      title: "Your enquiry list is empty.",
      body: "Explore the collection and add the pieces you would like to know more about.",
      cta: "Explore the collection",
    },
    countLabel: (count: number) => `${count} ${count === 1 ? "item" : "items"} in enquiry`,
  },

  brandStatement: {
    line: "Thoughtful interiors begin with the details.",
    link: "About us",
  },

  enquiryCta: {
    eyebrow: "Have something in mind?",
    heading: "Tell us what you're looking for.",
    cta: "Start an Enquiry",
  },

  notFound: {
    title: "Page not found",
    body: "The page you were looking for could not be found.",
    cta: "Back to Shop",
  },

  error: {
    title: "Something went wrong",
    body: "This page could not be displayed. Please try again.",
    cta: "Try again",
  },
} as const;
