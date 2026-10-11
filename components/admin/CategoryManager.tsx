"use client";

import { useEffect, useState } from "react";
import styles from "./category-manager.module.css";
import { ImagePicker } from "@/components/admin/ImagePicker";

/**
 * Category manager. Reads the catalogue through the admin API and writes it
 * back, so the public navigation and the category pages follow immediately.
 */

type Category = { id: string; name: string; slug: string; image?: string };

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetch("/api/admin/content")
      .then((response) => response.json() as Promise<{ catalogue: { categories: Category[] } }>)
      .then((data) => setCategories(data.catalogue.categories))
      .catch(() => setStatus("Could not load categories."));
  }, []);

  function update(id: string, changes: Partial<Category>) {
    setCategories((current) =>
      (current ?? []).map((category) => (category.id === id ? { ...category, ...changes } : category)),
    );
  }

  async function save() {
    setSaving(true);
    setStatus(null);

    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ catalogue: { categories } }),
    });

    setSaving(false);
    setStatus(response.ok ? "Saved." : "Could not save.");
  }

  if (categories === null) {
    return <p className={styles.state}>Loading categories…</p>;
  }

  return (
    <div className={styles.manager}>
      <ul className={styles.list}>
        {categories.map((category) => (
          <li key={category.id} className={styles.row}>
            <div className={styles.fields}>
              <label className={styles.field}>
                <span className={styles.label}>Name</span>
                <input
                  className={styles.input}
                  value={category.name}
                  onChange={(event) => update(category.id, { name: event.target.value })}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Slug</span>
                <input
                  className={styles.input}
                  value={category.slug}
                  onChange={(event) =>
                    update(category.id, { slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
                  }
                />
                <span className={styles.hint}>/categories/{category.slug}</span>
              </label>
            </div>

            <ImagePicker
              label="Image"
              value={category.image}
              onChange={(value) =>
                update(category.id, { image: Array.isArray(value) ? value[0] : value })
              }
            />
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <button type="button" className={styles.save} onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save categories"}
        </button>
        <span aria-live="polite" className={styles.status}>
          {status}
        </span>
      </div>
    </div>
  );
}
