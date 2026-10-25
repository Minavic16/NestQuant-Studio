import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Hero } from "@/components/home/Hero";
import { WorkTeaser } from "@/components/home/WorkTeaser";
import { HelpOffers } from "@/components/home/HelpOffers";
import { GettingStarted } from "@/components/home/GettingStarted";
import { ShopPreview } from "@/components/home/ShopPreview";
import { BrandStatement } from "@/components/home/BrandStatement";
import { EnquiryCta } from "@/components/home/EnquiryCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalogue, getPublishedPortfolio } from "@/data/store/repositories";
import { toProduct } from "@/data/store/repositories";
import { organizationData } from "@/lib/seo/json-ld";

export const metadata: Metadata = buildMetadata({
  description:
    "Desired Homes Interiors — curtains, interior decoration accessories and window solutions. See completed work, browse the collection, and start a conversation on WhatsApp or by email.",
  path: "/",
});

/** The public catalogue is revalidated frequently and immediately on admin edits. */
export const revalidate = 60;

export default async function HomePage() {
  const [catalogue, portfolio] = await Promise.all([getCatalogue(), getPublishedPortfolio()]);
  const products = catalogue.products.map(toProduct);
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const preview = featured.length > 0 ? featured : products.slice(0, 4);

  return (
    <>
      <JsonLd data={organizationData()} />

      <Hero />

      <WorkTeaser items={portfolio} />

      <HelpOffers />

      <GettingStarted />

      {preview.length > 0 ? <ShopPreview products={preview} total={products.length} /> : null}

      <BrandStatement />

      <EnquiryCta />
    </>
  );
}
