import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/layout/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { EnquiryView } from "@/components/enquiry/EnquiryView";
import { getProducts } from "@/data/store/repositories";
import { resolveContact } from "@/lib/contact/resolve";
import { copy } from "@/data/content/copy";

export const metadata: Metadata = buildMetadata({
  title: "Enquiry",
  description: "Review your enquiry and send it to Desired Homes Interiors on WhatsApp or by email.",
  path: "/enquiry",
});

export default async function EnquiryPage() {
  const [products, contact] = await Promise.all([getProducts(), resolveContact()]);

  return (
    <Section tone="paper" narrow>
      <PageHeader eyebrow={copy.enquiry.eyebrow} title={copy.enquiry.heading} intro={copy.enquiry.intro} />

      <EnquiryView products={products} contact={contact} />
    </Section>
  );
}
