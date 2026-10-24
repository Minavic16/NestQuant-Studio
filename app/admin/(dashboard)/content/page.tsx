import type { Metadata } from "next";
import { getCatalogue, getSite } from "@/data/store/repositories";
import { ContentEditor, type EditorState } from "@/components/admin/ContentEditor";

export const metadata: Metadata = { title: "Products & content" };
export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [catalogue, site] = await Promise.all([getCatalogue(), getSite()]);

  const initialState: EditorState = {
    products: catalogue.products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      type: product.type ?? "",
      shortDescription: product.shortDescription ?? "",
      description: product.description ?? "",
      images: product.images.map((image) => ({ src: image.src, alt: image.alt })),
      price: typeof product.price === "number" ? String(product.price) : "",
      compareAtPrice:
        typeof product.compareAtPrice === "number" ? String(product.compareAtPrice) : "",
      priceLabel: product.priceLabel ?? "",
      sku: product.sku ?? "",
      available:
        product.available === true ? "true" : product.available === false ? "false" : "",
      featured: product.featured === true,
      attributes: product.attributes ?? [],
    })),
    categories: catalogue.categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      ...(category.image ? { image: category.image } : {}),
    })),
    contact: { email: site.contact.email, whatsappNumber: site.contact.whatsappNumber },
    about: {
      statement: site.about.statement,
      description: site.about.description,
      directorName: site.about.directorName,
      directorRole: site.about.directorRole,
      ...(site.about.image ? { image: site.about.image } : {}),
    },
  };

  return <ContentEditor initialState={initialState} />;
}
