import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/layout/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { CategoryRail } from "@/components/categories/CategoryRail";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getCatalogue } from "@/data/store/repositories";
import styles from "./page.module.css";

export const metadata: Metadata = buildMetadata({
  title: "Categories",
  description:
    "Explore curtains, accessories and window solutions from Desired Homes Interiors — project work, listed components and a direct way to ask.",
  path: "/categories",
});

export const revalidate = 60;

export default async function CategoriesPage() {
  const catalogue = await getCatalogue();

  return (
    <Section tone="paper" className={styles.page}>
      <PageHeader
        eyebrow="Collections"
        title="Three ways into the room."
        intro="Start with the part of the window you are thinking about. Project work sits alongside the listed components, so you can look, compare and ask in one place."
      />

      <CategoryRail categories={catalogue.categories} products={catalogue.products} />

      <div className={styles.help}>
        <div>
          <p className={styles.helpEyebrow}>Not sure where to start?</p>
          <h2 className={styles.helpHeading}>Send a photo of the window and we can take it from there.</h2>
          <p className={styles.helpBody}>
            A phone photo, a rough measurement and a note about the finish you like are enough to
            begin. You do not need to choose a product first.
          </p>
        </div>
        <div className={styles.helpActions}>
          <ButtonLink href="/contact" variant="primary">
            Discuss your space
          </ButtonLink>
          <ButtonLink href="/shop" variant="secondary">
            Browse all products
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
