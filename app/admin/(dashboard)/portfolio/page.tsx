import type { Metadata } from "next";
import { getPortfolio } from "@/data/store/repositories";
import { PortfolioEditor, type Item } from "@/components/admin/PortfolioEditor";

export const metadata: Metadata = { title: "Our work" };
export const dynamic = "force-dynamic";

/** Maps a stored portfolio item onto the editor's flat shape. */
function toEditable(item: {
  id: string;
  slug: string;
  title: string;
  summary: string;
  location?: string;
  year?: string;
  services: string[];
  image: string;
  driveUrl?: string;
  order: number;
  published: boolean;
}): Item {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    location: item.location ?? "",
    year: item.year ?? "",
    services: item.services.join(", "),
    image: item.image,
    driveUrl: item.driveUrl ?? "",
    order: String(item.order),
    published: item.published,
  };
}

export default async function AdminPortfolioPage() {
  const items = await getPortfolio();

  return (
    <PortfolioEditor
      initialItems={[...items]
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
        .map(toEditable)}
    />
  );
}
