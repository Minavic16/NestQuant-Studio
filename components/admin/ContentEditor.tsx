"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./content-editor.module.css";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImagePicker } from "@/components/admin/ImagePicker";

/**
 * The single editor behind the dashboard: products, categories, contact details
 * and site copy are edited as one document and saved together, because they are
 * one document in the store (ARCHITECTURE.md §4).
 */

type EditableProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  type: string;
  shortDescription: string;
  description: string;
  images: Array<{ src: string; alt: string }>;
  price: string;
  compareAtPrice: string;
  priceLabel: string;
  sku: string;
  available: "" | "true" | "false";
  featured: boolean;
  attributes: Array<{ label: string; value: string }>;
};

export type EditorState = {
  products: EditableProduct[];
  categories: Array<{ id: string; name: string; slug: string; image?: string }>;
  contact: { email: string; whatsappNumber: string };
  about: {
    statement: string;
    description: string;
    directorName: string;
    directorRole: string;
    image?: string;
  };
};

const CATEGORY_OPTIONS = [
  { id: "curtains", name: "Curtains" },
  { id: "accessories", name: "Accessories" },
  { id: "window-solutions", name: "Window Solutions" },
] as const;

/** Takes the first uploaded image for single-image fields. */
function firstImage(value: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function emptyProduct(): EditableProduct {
  return {
    id: "",
    slug: "",
    name: "",
    category: "curtains",
    type: "",
    shortDescription: "",
    description: "",
    images: [],
    price: "",
    compareAtPrice: "",
    priceLabel: "",
    sku: "",
    available: "",
    featured: false,
    attributes: [],
  };
}

export function ContentEditor({
  initialState,
}: {
  initialState: EditorState;
}) {
  const router = useRouter();
  const [state, setState] = useState<EditorState>(initialState);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const sortedProducts = useMemo(
    () => [...state.products].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
    [state.products],
  );

  function updateProduct(slug: string, changes: Partial<EditableProduct>) {
    setState((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.slug === slug ? { ...product, ...changes } : product,
      ),
    }));
  }

  function addProduct() {
    const product = emptyProduct();
    setState((current) => ({ ...current, products: [...current.products, product] }));
    setOpenSlug(product.slug || "__new__");
  }

  function removeProduct(slug: string) {
    setState((current) => ({
      ...current,
      products: current.products.filter((product) => product.slug !== slug),
    }));
  }

  async function save() {
    setSaving(true);
    setStatus(null);

    const payload = {
      catalogue: {
        products: state.products.map((product) => ({
          id: product.id || product.slug,
          slug: product.slug,
          name: product.name,
          category: product.category,
          type: product.type || undefined,
          shortDescription: product.shortDescription || undefined,
          description: product.description || undefined,
          images: product.images,
          price: product.price ? Number(product.price) : undefined,
          compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
          priceLabel: product.priceLabel || undefined,
          sku: product.sku || undefined,
          available:
            product.available === "" ? undefined : product.available === "true",
          featured: product.featured,
          attributes: product.attributes.filter((entry) => entry.label && entry.value),
        })),
        categories: state.categories,
      },
      site: {
        contact: state.contact,
        about: state.about,
      },
    };

    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Could not save. Please try again.");
      return;
    }

    setStatus("Saved. The website has been updated.");
    router.refresh();
  }

  return (
    <>
      <AdminPageHeader
        title="Products & content"
        intro="Add, edit or remove products and categories, and update the contact details shown on the site."
        actions={
          <button type="button" className={styles.save} onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        }
      />

      <div aria-live="polite" className={styles.status}>
        {status ? <p className={styles.statusText}>{status}</p> : null}
      </div>

      {/* ---- Contact details ---- */}
      <section className={styles.block} aria-label="Contact details">
        <h2 className={styles.blockTitle}>Contact details</h2>
        <p className={styles.blockHint}>
          These appear on the site, in the footer, and inside every WhatsApp and email enquiry.
        </p>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              type="email"
              className={styles.input}
              value={state.contact.email}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  contact: { ...current.contact, email: event.target.value },
                }))
              }
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>WhatsApp number</span>
            <input
              type="tel"
              className={styles.input}
              value={state.contact.whatsappNumber}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  contact: { ...current.contact, whatsappNumber: event.target.value.replace(/[^\d]/g, "") },
                }))
              }
            />
            <span className={styles.hint}>Digits only, including the country code — e.g. 2349138797980.</span>
          </label>
        </div>
      </section>

      {/* ---- About ---- */}
      <section className={styles.block} aria-label="About the business">
        <h2 className={styles.blockTitle}>About</h2>

        <label className={styles.field}>
          <span className={styles.label}>Statement</span>
          <input
            className={styles.input}
            value={state.about.statement}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                about: { ...current.about, statement: event.target.value },
              }))
            }
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Description</span>
          <textarea
            className={styles.textarea}
            rows={4}
            value={state.about.description}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                about: { ...current.about, description: event.target.value },
              }))
            }
          />
        </label>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.label}>Director name</span>
            <input
              className={styles.input}
              value={state.about.directorName}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  about: { ...current.about, directorName: event.target.value },
                }))
              }
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Director role</span>
            <input
              className={styles.input}
              value={state.about.directorRole}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  about: { ...current.about, directorRole: event.target.value },
                }))
              }
            />
          </label>
        </div>

        <ImagePicker
          label="About image"
          value={state.about.image}
          onChange={(value) =>
            setState((current) => ({
              ...current,
              about: { ...current.about, image: firstImage(value) },
            }))
          }
        />
      </section>

      {/* ---- Categories ---- */}
      <section className={styles.block} aria-label="Categories">
        <h2 className={styles.blockTitle}>Categories</h2>

        <ul className={styles.categoryList}>
          {state.categories.map((category) => (
            <li key={category.id} className={styles.categoryRow}>
              <div className={styles.grid}>
                <label className={styles.field}>
                  <span className={styles.label}>Name</span>
                  <input
                    className={styles.input}
                    value={category.name}
                    onChange={(event) =>
                      setState((current) => ({
                        ...current,
                        categories: current.categories.map((entry) =>
                          entry.id === category.id ? { ...entry, name: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Slug</span>
                  <input
                    className={styles.input}
                    value={category.slug}
                    onChange={(event) =>
                      setState((current) => ({
                        ...current,
                        categories: current.categories.map((entry) =>
                          entry.id === category.id
                            ? { ...entry, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }
                            : entry,
                        ),
                      }))
                    }
                  />
                </label>
              </div>

              <ImagePicker
                label="Category image"
                value={category.image}
                onChange={(value) =>
                  setState((current) => ({
                    ...current,
                    categories: current.categories.map((entry) =>
                      entry.id === category.id ? { ...entry, image: firstImage(value) } : entry,
                    ),
                  }))
                }
              />
            </li>
          ))}
        </ul>
      </section>

      {/* ---- Products ---- */}
      <section className={styles.block} aria-label="Products">
        <div className={styles.blockHead}>
          <h2 className={styles.blockTitle}>Products</h2>
          <button type="button" className={styles.add} onClick={addProduct}>
            Add product
          </button>
        </div>

        <ul className={styles.productList}>
          {sortedProducts.map((product) => {
            const key = product.slug || product.id || "__new__";
            const open = openSlug === key;

            return (
              <li key={key} className={styles.productRow}>
                <div className={styles.productHead}>
                  <button
                    type="button"
                    className={styles.productToggle}
                    aria-expanded={open}
                    onClick={() => setOpenSlug(open ? null : key)}
                  >
                    <span className={styles.productName}>
                      {product.name || "Untitled product"}
                    </span>
                    <span className={styles.productMeta}>
                      {CATEGORY_OPTIONS.find((option) => option.id === product.category)?.name ??
                        product.category}
                      {product.featured ? " · featured" : ""}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => {
                      removeProduct(product.slug);
                      if (open) setOpenSlug(null);
                    }}
                  >
                    Remove
                  </button>
                </div>

                {open ? (
                  <ProductFields
                    product={product}
                    onChange={(changes) => updateProduct(product.slug, changes)}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

function ProductFields({
  product,
  onChange,
}: {
  product: EditableProduct;
  onChange: (changes: Partial<EditableProduct>) => void;
}) {
  return (
    <div className={styles.productFields}>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Name</span>
          <input
            className={styles.input}
            value={product.name}
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Slug</span>
          <input
            className={styles.input}
            value={product.slug}
            onChange={(event) =>
              onChange({ slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
            }
          />
          <span className={styles.hint}>The product page address: /shop/your-slug</span>
        </label>
      </div>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Category</span>
          <select
            className={styles.input}
            value={product.category}
            onChange={(event) => onChange({ category: event.target.value })}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Price (₦, optional)</span>
          <input
            className={styles.input}
            inputMode="numeric"
            value={product.price}
            placeholder="Leave empty to show “Price on request”"
            onChange={(event) => onChange({ price: event.target.value.replace(/[^\d]/g, "") })}
          />
        </label>
      </div>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Type (optional)</span>
          <input
            className={styles.input}
            value={product.type}
            placeholder="e.g. Brackets, Rods, Rings"
            onChange={(event) => onChange({ type: event.target.value })}
          />
          <span className={styles.hint}>Groups the product with its family in the shop filter.</span>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Was price (₦, optional)</span>
          <input
            className={styles.input}
            inputMode="numeric"
            value={product.compareAtPrice}
            placeholder="Pre-discount price"
            onChange={(event) =>
              onChange({ compareAtPrice: event.target.value.replace(/[^\d]/g, "") })
            }
          />
          <span className={styles.hint}>
            Shown struck through, with the percentage saved. Must be above the price.
          </span>
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Short description</span>
        <input
          className={styles.input}
          value={product.shortDescription}
          onChange={(event) => onChange({ shortDescription: event.target.value })}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Description</span>
        <textarea
          className={styles.textarea}
          rows={4}
          value={product.description}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </label>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>SKU (optional)</span>
          <input
            className={styles.input}
            value={product.sku}
            onChange={(event) => onChange({ sku: event.target.value })}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Availability</span>
          <select
            className={styles.input}
            value={product.available}
            onChange={(event) => onChange({ available: event.target.value as "" | "true" | "false" })}
          >
            <option value="">Not stated</option>
            <option value="true">Available now</option>
            <option value="false">Currently unavailable</option>
          </select>
        </label>
      </div>

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={product.featured}
          onChange={(event) => onChange({ featured: event.target.checked })}
        />
        <span>Show on the home page (featured)</span>
      </label>

      <ImagePicker
        label="Product images"
        multiple
        value={product.images.map((image) => image.src)}
        onChange={(value) => {
          const sources = Array.isArray(value) ? value : [value];
          onChange({
            images: sources.map((src, index) => ({
              src,
                alt: product.images[index]?.alt || `${product.name || "Product"} — image ${index + 1}`,
              })),
          });
        }}
        altTexts={product.images.map((image) => image.alt)}
        onAltChange={(index, alt) =>
          onChange({
            images: product.images.map((image, position) =>
              position === index ? { ...image, alt } : image,
            ),
          })
        }
      />

      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Specifications</legend>
        {product.attributes.map((attribute, index) => (
          <div key={`${attribute.label}-${index}`} className={styles.attributeRow}>
            <input
              className={styles.input}
              placeholder="Label (e.g. Material)"
              value={attribute.label}
              onChange={(event) =>
                onChange({
                  attributes: product.attributes.map((entry, position) =>
                    position === index ? { ...entry, label: event.target.value } : entry,
                  ),
                })
              }
            />
            <input
              className={styles.input}
              placeholder="Value (e.g. Linen)"
              value={attribute.value}
              onChange={(event) =>
                onChange({
                  attributes: product.attributes.map((entry, position) =>
                    position === index ? { ...entry, value: event.target.value } : entry,
                  ),
                })
              }
            />
            <button
              type="button"
              className={styles.remove}
              onClick={() =>
                onChange({ attributes: product.attributes.filter((_, position) => position !== index) })
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className={styles.add}
          onClick={() =>
            onChange({ attributes: [...product.attributes, { label: "", value: "" }] })
          }
        >
          Add specification
        </button>
      </fieldset>
    </div>
  );
}
