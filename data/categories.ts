import type { Category, CategoryId } from "@/data/types";

/**
 * The three collections the business sells, in display order.
 * Category ids double as URL slugs (`/categories/curtains`).
 */
export const categories: readonly Category[] = [
  { id: "curtains", name: "Curtains", slug: "curtains" },
  { id: "accessories", name: "Accessories", slug: "accessories" },
  { id: "window-solutions", name: "Window Solutions", slug: "window-solutions" },
];

export type CategoryProfile = {
  id: CategoryId;
  /** Editorial photography that shows the category in context. */
  image: string;
  alt: string;
  /** One or two lines for cards and the homepage. */
  short: string;
  /** A fuller, factual introduction for the category page. */
  intro: string;
  /** Specific next step; the curtain collection has no listed products. */
  actionLabel: string;
  /** Object position for a deliberate crop at card and hero sizes. */
  imagePosition?: string;
};

/**
 * Category presentation, kept separate from the stored catalogue so an admin
 * catalogue edit cannot silently change public marketing copy.
 *
 * The curtains text deliberately describes the work shown and invites a
 * conversation rather than implying a ready-made curtain range.
 */
export const categoryProfiles: Record<CategoryId, CategoryProfile> = {
  curtains: {
    id: "curtains",
    image: "/editorial/curtains.webp",
    alt: "Floor-length beige curtains and sheers in a sunlit room",
    short:
      "Full-height drapes, pelmets and layered window treatments appear throughout the work shown here. Tell us about the room you have in mind.",
    intro:
      "Curtains run through the projects shown on this site — from full-height gold drapes to layered sheers and formal pelmets. The online catalogue does not list ready-made curtains, so a curtain enquiry starts with a conversation about the room, the window and the finish you are considering.",
    actionLabel: "Discuss curtains",
    imagePosition: "center 42%",
  },
  accessories: {
    id: "accessories",
    image: "/editorial/accessories.webp",
    alt: "Close-up of white curtain fabric gathered with a decorative tieback",
    short:
      "Brackets, rods, rings, tiebacks and hooks — the components that finish a window and help curtains hang properly.",
    intro:
      "The accessories collection covers the working details around a window: brackets, rods, rings, tiebacks, hooks and heading tape. Browse the listed pieces, compare prices, and add anything you would like to ask about to your enquiry list.",
    actionLabel: "Shop accessories",
    imagePosition: "center",
  },
  "window-solutions": {
    id: "window-solutions",
    image: "/editorial/window-solutions.webp",
    alt: "A bright living room with tall windows and softly dressed curtains",
    short:
      "Rods, brackets and the fittings that frame a window. Compare the listed components or ask which combination suits your space.",
    intro:
      "Window solutions here are the structural pieces: rods, brackets and the fittings that hold a curtain where it should sit. The listed pieces can be compared directly, and you can send a photo of your window if you would like help identifying what you need.",
    actionLabel: "Shop window solutions",
    imagePosition: "center 55%",
  },
};

export function getCategoryById(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getCategoryProfile(id: CategoryId): CategoryProfile {
  return categoryProfiles[id];
}
