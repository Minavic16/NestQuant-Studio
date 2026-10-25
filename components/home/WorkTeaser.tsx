import Link from "next/link";
import styles from "./work-teaser.module.css";
import { Section } from "@/components/layout/Section";
import { MediaSlot } from "@/components/products/MediaSlot";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { PortfolioItem } from "@/data/store/schema";

/** The landscape pelmet project carries the feature crop best. */
const FEATURE_SLUG = "living-room-gold-pelmets";
const SUPPORTING_SLUGS = ["living-room-blue-velvet", "bedroom-gold-curtains"];

function roomLabel(item: PortfolioItem): string {
  return item.title.split(",")[0] ?? item.title;
}

function WorkCard({
  item,
  feature = false,
  priority = false,
}: {
  item: PortfolioItem;
  feature?: boolean;
  priority?: boolean;
}) {
  return (
    <article className={feature ? styles.feature : styles.card}>
      <Link href={`/work/${item.slug}`} className={styles.link}>
        <MediaSlot
          image={{ src: item.image, alt: item.title }}
          alt={item.title}
          ratio={feature ? "4 / 3" : "3 / 2"}
          sizes={
            feature
              ? "(max-width: 767px) 100vw, (max-width: 1023px) 100vw, 54vw"
              : "(max-width: 767px) 100vw, (max-width: 1023px) 46vw, 34vw"
          }
          priority={priority}
          className={styles.frame}
        />

        <div className={styles.caption}>
          <p className={styles.meta}>
            <span>{roomLabel(item)}</span>
            {item.services.length > 0 ? <span>{item.services.join(" · ")}</span> : null}
          </p>
          <h3 className={styles.title}>{item.title}</h3>
          <p className={styles.summary}>{item.summary}</p>
          <span className={styles.cta}>
            View project
            <ArrowRightIcon className={styles.arrow} />
          </span>
        </div>
      </Link>
    </article>
  );
}

/**
 * Selected work, immediately after the hero. One genuine feature project and
 * two supporting projects; the feature is not hidden in a swipe-only rail.
 */
export function WorkTeaser({ items }: { items: readonly PortfolioItem[] }) {
  if (items.length === 0) return null;

  const feature = items.find((item) => item.slug === FEATURE_SLUG) ?? items[0];
  const supporting = [
    ...SUPPORTING_SLUGS.map((slug) => items.find((item) => item.slug === slug)).filter(
      (item): item is PortfolioItem => Boolean(item) && item !== feature,
    ),
    ...items.filter((item) => item !== feature && !SUPPORTING_SLUGS.includes(item.slug)),
  ].slice(0, 2);

  return (
    <Section tone="paper" className={styles.section}>
      <div className={styles.head}>
        <div className={styles.headText}>
          <p className={styles.eyebrow}>Selected work</p>
          <h2 className={styles.heading}>Details that shape a room.</h2>
          <p className={styles.intro}>
            Curtains, pelmets and window treatments from completed projects — photographed in the
            rooms where they were fitted.
          </p>
        </div>
        <Link href="/work" className={styles.allLink}>
          See all {items.length} projects
          <ArrowRightIcon className={styles.arrow} />
        </Link>
      </div>

      <div className={styles.grid}>
        {feature ? <WorkCard item={feature} feature priority /> : null}
        <div className={styles.supporting}>
          {supporting.map((item) => (
            <WorkCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    </Section>
  );
}
