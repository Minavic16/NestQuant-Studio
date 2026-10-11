import styles from "./product-details.module.css";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PriceLabel } from "./PriceLabel";
import { ProductActions } from "./ProductActions";
import type { ContactDetails } from "@/lib/whatsapp/whatsapp";
import { copy } from "@/data/content/copy";
import { getCategoryById } from "@/data/categories";
import type { Product } from "@/data/types";

/**
 * The details column of the product page. Presentation only: no fetching, no
 * state, no WhatsApp construction (that lives in ProductActions / lib).
 */
export function ProductDetails({
  product,
  contact,
}: {
  product: Product;
  contact: ContactDetails;
}) {
  const category = getCategoryById(product.category);

  return (
    <div className={styles.details}>
      <Eyebrow>{category?.name ?? product.category}</Eyebrow>

      <h1 className={styles.name}>{product.name}</h1>

      <PriceLabel product={product} className={styles.price} />

      {product.description ? (
        <p className={styles.description}>{product.description}</p>
      ) : null}

      {product.attributes && product.attributes.length > 0 ? (
        <section className={styles.specs} aria-label={copy.product.specifications}>
          <h2 className={styles.specsTitle}>{copy.product.specifications}</h2>
          <dl className={styles.specList}>
            {product.attributes.map((attribute) => (
              <div key={attribute.label} className={styles.specRow}>
                <dt className={styles.specLabel}>{attribute.label}</dt>
                <dd className={styles.specValue}>{attribute.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <div className={styles.meta}>
        {product.sku ? (
          <p className={styles.metaItem}>
            {copy.product.sku}: <span className={styles.metaValue}>{product.sku}</span>
          </p>
        ) : null}
        {typeof product.available === "boolean" ? (
          <p className={styles.metaItem}>
            {product.available
              ? copy.product.availability.available
              : copy.product.availability.unavailable}
          </p>
        ) : null}
      </div>

      <ProductActions product={product} contact={contact} />
    </div>
  );
}
