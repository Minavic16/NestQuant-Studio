import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { buildMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getCatalogue } from "@/data/store/repositories";
import { categories, getCategoryProfile } from "@/data/categories";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbData } from "@/lib/seo/json-ld";
import styles from "./page.module.css";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Desired Homes Interiors is an interiors business led by Desire Nwakor, working with curtains, interior decoration accessories and window solutions.",
  path: "/about",
});

export const revalidate = 60;

export default async function AboutPage() {
  const catalogue = await getCatalogue();

  return (
    <>
      <JsonLd data={breadcrumbData([{ name: "About", path: "/about" }])} />

      <Section tone="paper" className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>About</p>
            <h1 className={styles.heading}>Desired Homes Interiors</h1>
            <p className={styles.lede}>
              An interiors business working with curtains, interior decoration accessories and
              window solutions.
            </p>
            <p className={styles.body}>
              The work shown on this site is documented with the photography and scope supplied by
              the business. Alongside it, the collection lists the practical components that finish
              a window, including brackets, rods, rings, tiebacks, hooks and heading tape, so a room
              can be considered from the window outwards.
            </p>
            <p className={styles.body}>
              Desired Homes Interiors is led by Desire Nwakor, CEO &amp; Creative Director.
            </p>

            <div className={styles.actions}>
              <ButtonLink href="/work" variant="primary">
                See our work
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Discuss your space
              </ButtonLink>
            </div>
          </div>

          <figure className={styles.figure}>
            <div className={styles.media}>
              <Image
                src="/editorial/about-material.webp"
                alt="Close-up of gathered beige curtain fabric"
                fill
                sizes="(max-width: 1023px) 100vw, 44vw"
                priority
                className={styles.image}
              />
            </div>
            <figcaption className={styles.caption}>
              Material study of linen and gathered curtain fabric.
            </figcaption>
          </figure>
        </div>

        <section className={styles.services} aria-labelledby="services-heading">
          <div className={styles.servicesIntro}>
            <p className={styles.eyebrow}>What we do</p>
            <h2 id="services-heading" className={styles.servicesHeading}>
              Three parts of the same room.
            </h2>
            <p className={styles.body}>
              Each collection has a different starting point. The category pages explain what is
              listed, what is project work, and how to ask about the rest.
            </p>
          </div>

          <ul className={styles.serviceList}>
            {categories.map((category) => {
              const profile = getCategoryProfile(category.id);
              const count = catalogue.products.filter(
                (product) => product.category === category.id,
              ).length;

              return (
                <li key={category.id}>
                  <Link href={`/categories/${category.slug}`} className={styles.serviceLink}>
                    <span className={styles.serviceName}>{category.name}</span>
                    <span className={styles.serviceMeta}>
                      {count > 0
                        ? `${count} ${count === 1 ? "piece" : "pieces"} listed`
                        : "Project work and enquiries"}
                    </span>
                    <span className={styles.serviceText}>{profile.short}</span>
                    <span className={styles.serviceCta}>
                      {profile.actionLabel}
                      <ArrowRightIcon className={styles.arrow} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <div className={styles.contactBand}>
          <div>
            <h2 className={styles.contactHeading}>Start with a conversation.</h2>
            <p className={styles.contactBody}>
              Send a photo of the room or the piece you are considering, and tell us what you would
              like to change. You will review and send the message in WhatsApp or email.
            </p>
          </div>
          <ButtonLink href="/contact" variant="primary">
            Discuss your space
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
