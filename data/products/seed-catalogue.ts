import type { Product, ProductImage } from "@/data/types";

/**
 * The products supplied by the business, grouped by type in display order.
 *
 * Prices are the submitted figures: `compareAtPrice` is the pre-discount price,
 * `price` is what the customer pays. The shop computes the percentage saved.
 *
 * Images live under `public/products/<slug>/`, numbered in the order they were
 * submitted. Crops are copies: the originals stay in the inbox archive.
 */
type CatalogueEntry = Omit<Product, "images"> & {
  /** Describes the product for the generated image alt text. */
  alt: string;
  imageCount: number;
};

const catalogue: readonly CatalogueEntry[] = [
  {
    id: "dhs-22w7",
    slug: "clamp-style-curtain-bracket",
    name: "Clamp-Style Curtain Bracket",
    category: "accessories",
    type: "Brackets",
    shortDescription: "A compact clamp bracket that holds the rod close to the wall.",
    description:
      "A slim metal bracket with a clamp grip, designed to keep the curtain rod tight against the wall.",
    price: 1000,
    compareAtPrice: 1500,
    currency: "NGN",
    featured: true,
    alt: "Black clamp-style curtain bracket",
    imageCount: 4,
  },
  {
    id: "dhs-24pc",
    slug: "ornate-rosette-curtain-bracket",
    name: "Ornate Rosette Curtain Bracket",
    category: "accessories",
    type: "Brackets",
    shortDescription: "A decorative rosette bracket with a carved floral centre.",
    description:
      "An antique-bronze bracket with a carved rosette and fluted ends, for a traditional window treatment.",
    price: 3500,
    compareAtPrice: 4000,
    currency: "NGN",
    alt: "Bronze ornate rosette curtain bracket",
    imageCount: 2,
  },
  {
    id: "dhs-c7lj",
    slug: "decorative-plastic-bracket",
    name: "Decorative Plastic Curtain Bracket",
    category: "accessories",
    type: "Brackets",
    shortDescription: "A moulded bracket with a detailed profile.",
    description:
      "A decorative moulded bracket in a choice of white, bronze and gold finishes.",
    price: 15000,
    compareAtPrice: 17000,
    currency: "NGN",
    alt: "Decorative plastic curtain bracket in white, bronze and gold",
    imageCount: 1,
  },
  {
    id: "dhs-j4mo",
    slug: "double-curtain-rod-bracket",
    name: "Double Curtain Rod Bracket",
    category: "accessories",
    type: "Brackets",
    shortDescription: "Carries two curtain rods on one wall plate.",
    description:
      "A double bracket that supports a pair of rods, so a main curtain and a sheer can hang together.",
    price: 7000,
    compareAtPrice: 9000,
    currency: "NGN",
    alt: "Double curtain rod bracket",
    imageCount: 1,
  },
  {
    id: "dhs-mgey",
    slug: "single-curtain-rod-bracket",
    name: "Single Curtain Rod Bracket",
    category: "accessories",
    type: "Brackets",
    shortDescription: "A straightforward wall bracket for one rod.",
    description: "A single-rod wall bracket with a clean, unobtrusive profile.",
    price: 5000,
    compareAtPrice: 7000,
    currency: "NGN",
    alt: "Single curtain rod bracket",
    imageCount: 1,
  },
  {
    id: "dhs-m1uk",
    slug: "classic-curtain-rod",
    name: "Classic Curtain Rod",
    category: "window-solutions",
    type: "Rods",
    shortDescription: "A clean, plain pole for everyday window treatments.",
    description: "A smooth, plain curtain rod that suits both simple and layered schemes.",
    price: 3000,
    compareAtPrice: 3500,
    currency: "NGN",
    featured: true,
    alt: "Plain classic curtain rod",
    imageCount: 2,
  },
  {
    id: "dhs-exdm",
    slug: "patterned-curtain-rod",
    name: "Patterned Curtain Rod",
    category: "window-solutions",
    type: "Rods",
    shortDescription: "A decorative pole with a gold and black swirl finish.",
    description:
      "A patterned curtain rod that adds movement and warmth to the window without extra dressing.",
    price: 15000,
    compareAtPrice: 17000,
    currency: "NGN",
    alt: "Patterned curtain rod with a gold and black swirl finish",
    imageCount: 2,
  },
  {
    id: "dhs-e3fk",
    slug: "glass-finial-cap",
    name: "Glass Finial End Cap",
    category: "accessories",
    type: "Finials",
    shortDescription: "A faceted glass cap that finishes the end of a rod.",
    description:
      "A decorative glass finial with a swirling coloured core, available in assorted finishes.",
    price: 5500,
    compareAtPrice: 6000,
    currency: "NGN",
    alt: "Faceted glass finial end cap in assorted colours",
    imageCount: 6,
  },
  {
    id: "dhs-gb4q",
    slug: "coloured-curtain-rings",
    name: "Coloured Curtain Rings",
    category: "accessories",
    type: "Rings",
    shortDescription: "Smooth rings in a range of colours.",
    description:
      "Coloured curtain rings for a custom window scheme, with a smooth finish that runs easily on the rod.",
    price: 3000,
    compareAtPrice: 4000,
    currency: "NGN",
    alt: "Coloured curtain rings in a range of finishes",
    imageCount: 1,
  },
  {
    id: "dhs-b795",
    slug: "ornate-curtain-rings",
    name: "Ornate Curtain Rings",
    category: "accessories",
    type: "Rings",
    shortDescription: "Carved rings with a traditional profile.",
    description:
      "Ornate curtain rings with a carved, antique-style finish for period and classic interiors.",
    price: 4500,
    compareAtPrice: 6000,
    currency: "NGN",
    featured: true,
    alt: "Ornate carved curtain rings",
    imageCount: 8,
  },
  {
    id: "dhs-i1fz",
    slug: "tassel-tieback",
    name: "Tassel Tieback",
    category: "accessories",
    type: "Tiebacks",
    shortDescription: "A tasselled tieback that holds curtains neatly open.",
    description:
      "A braided tieback with a tassel and coloured bead, available in assorted colours.",
    price: 3500,
    compareAtPrice: 4000,
    currency: "NGN",
    featured: true,
    alt: "Tassel tieback in assorted colours",
    imageCount: 5,
  },
  {
    id: "dhs-henl",
    slug: "adhesive-wall-hook",
    name: "Adhesive Wall Hook",
    category: "accessories",
    type: "Hooks",
    shortDescription: "A round adhesive hook for light window dressing.",
    description:
      "A disc-shaped adhesive wall hook, supplied with screws and plugs for a secure fixing.",
    price: 3500,
    compareAtPrice: 4000,
    currency: "NGN",
    alt: "Adhesive wall hook with mounting screws and plugs",
    imageCount: 1,
  },
  {
    id: "dhs-fzgs",
    slug: "double-tieback-hook",
    name: "Double Tieback Hook",
    category: "accessories",
    type: "Hooks",
    shortDescription: "Two hooks on one plate for a pair of tiebacks.",
    description:
      "A double tieback hook that keeps both sides of a curtain pair neatly held back.",
    price: 2000,
    compareAtPrice: 2500,
    currency: "NGN",
    alt: "Double tieback hook",
    imageCount: 1,
  },
  {
    id: "dhs-b6m9",
    slug: "crystal-tieback-hook",
    name: "Crystal Tieback Hook",
    category: "accessories",
    type: "Hooks",
    shortDescription: "A curved metal hook topped with a faceted crystal.",
    description:
      "A polished tieback hook with a crystal finial, for holding curtains open in style.",
    price: 2500,
    compareAtPrice: 3000,
    currency: "NGN",
    alt: "Crystal-topped tieback hook",
    imageCount: 1,
  },
  {
    id: "dhs-zro4",
    slug: "curtain-heading-tape",
    name: "Curtain Heading Tape",
    category: "accessories",
    type: "Tape",
    shortDescription: "Pleating tape for a crisp, structured heading.",
    description:
      "Woven heading tape for pleating curtains, sold by the roll for made-to-measure work.",
    price: 3800,
    compareAtPrice: 4500,
    currency: "NGN",
    alt: "Roll of white curtain heading tape",
    imageCount: 3,
  },
];

function imagesFor(entry: CatalogueEntry): ProductImage[] {
  return Array.from({ length: entry.imageCount }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    const view = entry.imageCount > 1 ? `, view ${index + 1} of ${entry.imageCount}` : "";

    return {
      src: `/products/${entry.slug}/${number}.jpg`,
      alt: `${entry.alt}${view}`,
      width: 1000,
      height: 1250,
    };
  });
}

export const seedCatalogue: readonly Product[] = catalogue.map((entry) => ({
  id: entry.id,
  slug: entry.slug,
  name: entry.name,
  category: entry.category,
  type: entry.type,
  shortDescription: entry.shortDescription,
  description: entry.description,
  price: entry.price,
  compareAtPrice: entry.compareAtPrice,
  currency: entry.currency,
  featured: entry.featured,
  images: imagesFor(entry),
}));
