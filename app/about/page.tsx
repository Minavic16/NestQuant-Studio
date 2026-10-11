import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/layout/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { getCatalogue, getSite } from "@/data/store/repositories";
import { copy } from "@/data/content/copy";
import styles from "./page.module.css";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: `Desired Homes Interiors is an interiors practice led by Desire Nwakor, CEO & Creative Director.`,
  path: "/about",
});

export const revalidate = 60;

export default async function AboutPage() {
  const [site, catalogue] = await Promise.all([getSite(), getCatalogue()]);

  return (
    <>
      <Section tone="ivory">
        <PageHeader eyebrow={copy.about.eyebrow} title={site.about.statement} />

        <div className={styles.person}>
          <p className={styles.name}>{site.about.directorName}</p>
          <p className={styles.role}>{site.about.directorRole}</p>
        </div>

        {site.about.description ? (
          <p className={styles.description}>{site.about.description}</p>
        ) : null}
      </Section>

      {/* Black band: the supplied lockup sits on its own field (DESIGN.md §8.8). */}
      <Section tone="black">
        <div className={styles.lockup}>
          {site.about.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- store-supplied media
            <img src={site.about.image} alt={copy.about.heading} className={styles.image} />
          ) : (
            <BrandLogo variant="complete" className={styles.logo} />
          )}
        </div>
      </Section>

      <Section tone="ivory">
        <h2 className={styles.servicesLabel}>{copy.about.servicesLabel}</h2>
        <ul className={styles.services}>
          {catalogue.categories.map((category) => (
            <li key={category.id} className={styles.service}>
              <span className={styles.serviceName}>{category.name}</span>
            </li>
          ))}
        </ul>

        <Link href="/contact" className={styles.contactLink}>
          {copy.about.contactLink}
        </Link>
      </Section>
    </>
  );
}
