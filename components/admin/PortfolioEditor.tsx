"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./portfolio-editor.module.css";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { driveImageUrl, extractDriveFileId } from "@/lib/media/drive";

/**
 * Portfolio editor.
 *
 * Each entry points at a Drive reference rather than an uploaded file, so the
 * business keeps its originals where they already are and the site serves them
 * from there (ARCHITECTURE.md §8). Anything that is not a usable Drive
 * reference is rejected on save rather than silently stored.
 */

export type Item = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  location: string;
  year: string;
  services: string;
  image: string;
  driveUrl: string;
  order: string;
  published: boolean;
};

function emptyItem(order: number): Item {
  return {
    id: "",
    slug: "",
    title: "",
    summary: "",
    location: "",
    year: "",
    services: "",
    image: "",
    driveUrl: "",
    order: String(order),
    published: true,
  };
}

const SERVICE_OPTIONS = ["Curtains", "Accessories", "Window Solutions"] as const;

export function PortfolioEditor({ initialItems }: { initialItems: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const previews = useMemo(
    () =>
      items.map((item) => ({
        id: item.id || item.slug || "new",
        src: extractDriveFileId(item.image) ? driveImageUrl(extractDriveFileId(item.image)!, 800) : null,
      })),
    [items],
  );

  function update(index: number, changes: Partial<Item>) {
    setItems((current) =>
      current.map((item, position) => (position === index ? { ...item, ...changes } : item)),
    );
  }

  function slugify(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }

  async function save() {
    setSaving(true);
    setStatus(null);

    const payload = {
      portfolio: {
        items: items.map((item, index) => ({
          id: item.id || slugify(item.slug || item.title) || `item-${index}`,
          slug: slugify(item.slug || item.title),
          title: item.title,
          summary: item.summary,
          location: item.location || undefined,
          year: item.year || undefined,
          services: item.services
            .split(",")
            .map((service) => service.trim())
            .filter(Boolean),
          image: item.image,
          driveUrl: item.driveUrl || undefined,
          order: Number(item.order) || index,
          published: item.published,
        })),
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
      setStatus(body?.error ?? "Could not save. Check every item has a title and a Drive image.");
      return;
    }

    setStatus("Saved. The gallery has been updated.");
    router.refresh();
  }

  return (
    <>
      <AdminPageHeader
        title="Our work"
        intro="Past projects, served straight from your Google Drive."
        actions={
          <>
            <Link href="/work" className={styles.viewLink}>
              View the gallery
            </Link>
            <button type="button" className={styles.save} onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </>
        }
      />

      <div className={styles.notice}>
        <h2 className={styles.noticeTitle}>How Drive images work</h2>
        <ol className={styles.noticeList}>
          <li>
            In Google Drive, right-click a photo and choose <strong>Share</strong>, then set
            access to <strong>“Anyone with the link”</strong>.
          </li>
          <li>
            Copy the link and paste it below — or just paste the file id from the link.
          </li>
        </ol>
        <p className={styles.noticeNote}>
          The site shows your photo from Drive; it does not keep a copy. If sharing is turned off
          later, the image stops appearing.
        </p>
      </div>

      <div aria-live="polite" className={styles.status}>
        {status ? <p className={styles.statusText}>{status}</p> : null}
      </div>

      <ul className={styles.list}>
        {items.map((item, index) => {
          const preview = previews[index];

          return (
            <li key={item.id || item.slug || `new-${index}`} className={styles.card}>
              <div className={styles.cardHead}>
                <h3 className={styles.cardTitle}>{item.title || "Untitled project"}</h3>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => {
                    setItems((current) => current.filter((_, position) => position !== index));
                  }}
                >
                  Remove
                </button>
              </div>

              <div className={styles.grid}>
                <label className={styles.field}>
                  <span className={styles.label}>Title</span>
                  <input
                    className={styles.input}
                    value={item.title}
                    onChange={(event) => update(index, { title: event.target.value })}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Slug</span>
                  <input
                    className={styles.input}
                    value={item.slug}
                    placeholder="generated from the title"
                    onChange={(event) => update(index, { slug: event.target.value })}
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>What the job involved</span>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={item.summary}
                  onChange={(event) => update(index, { summary: event.target.value })}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Drive image</span>
                <input
                  className={styles.input}
                  value={item.image}
                  placeholder="Paste the Drive link or file id"
                  onChange={(event) => update(index, { image: event.target.value })}
                />
                <span className={styles.hint}>
                  {preview?.src
                    ? "Recognised — the preview below is what visitors will see."
                    : "Not recognised yet. Paste a Drive share link, or the file id from one."}
                </span>
              </label>

              {preview?.src ? (
                <div className={styles.previewFrame}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- preview of a Drive file */}
                  <img src={preview.src} alt="" className={styles.preview} />
                </div>
              ) : null}

              <div className={styles.grid}>
                <label className={styles.field}>
                  <span className={styles.label}>Location (optional)</span>
                  <input
                    className={styles.input}
                    value={item.location}
                    onChange={(event) => update(index, { location: event.target.value })}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Year (optional)</span>
                  <input
                    className={styles.input}
                    value={item.year}
                    onChange={(event) => update(index, { year: event.target.value })}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Order</span>
                  <input
                    className={styles.input}
                    inputMode="numeric"
                    value={item.order}
                    onChange={(event) => update(index, { order: event.target.value.replace(/[^\d]/g, "") })}
                  />
                </label>
              </div>

              <fieldset className={styles.fieldset}>
                <legend className={styles.label}>Services</legend>
                <div className={styles.services}>
                  {SERVICE_OPTIONS.map((service) => {
                    const selected = item.services
                      .split(",")
                      .map((entry) => entry.trim())
                      .includes(service);
                    const current = item.services
                      .split(",")
                      .map((entry) => entry.trim())
                      .filter(Boolean);

                    return (
                      <label key={service} className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(event) =>
                            update(index, {
                              services: (
                                event.target.checked
                                  ? [...current, service]
                                  : current.filter((entry) => entry !== service)
                              ).join(", "),
                            })
                          }
                        />
                        <span>{service}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <label className={styles.field}>
                <span className={styles.label}>Drive folder link (optional)</span>
                <input
                  className={styles.input}
                  value={item.driveUrl}
                  placeholder="https://drive.google.com/drive/folders/…"
                  onChange={(event) => update(index, { driveUrl: event.target.value })}
                />
              </label>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={item.published}
                  onChange={(event) => update(index, { published: event.target.checked })}
                />
                <span>Published on the gallery</span>
              </label>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className={styles.add}
        onClick={() => setItems((current) => [...current, emptyItem(current.length + 1)])}
      >
        Add a project
      </button>
    </>
  );
}
