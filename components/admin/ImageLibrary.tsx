"use client";

import { useEffect, useState } from "react";
import styles from "./image-library.module.css";
import { ImagePicker } from "@/components/admin/ImagePicker";

/**
 * The media library: everything the dashboard has uploaded, in one place, with
 * its address ready to copy into a product.
 */

type Upload = { src: string; uploadedAt: string };

const STORAGE_KEY = "dhi:uploads";

function readLocal(): Upload[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Upload[]) : [];
  } catch {
    return [];
  }
}

export function ImageLibrary() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  // Read after mount (never during SSR or hydration, where localStorage is
  // unavailable) and outside the effect's synchronous body.
  useEffect(() => {
    const timer = window.setTimeout(() => setUploads(readLocal()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={styles.library}>
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>Upload new images</h2>
        <ImagePicker
          label="Add to the library"
          multiple
          value={[]}
          onChange={(value) => {
            const sources = Array.isArray(value) ? value : [value];
            const next = [
              ...uploads,
              ...sources.map((src) => ({ src, uploadedAt: new Date().toISOString() })),
            ];
            setUploads(next);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
              setStatus("Uploaded. Attach it to a product on the products page.");
            } catch {
              setStatus("Uploaded, but this browser could not remember the list.");
            }
          }}
        />
      </section>

      <section className={styles.block}>
        <h2 className={styles.blockTitle}>
          Uploaded in this browser <span className={styles.hint}>{uploads.length}</span>
        </h2>

        {status ? (
          <p aria-live="polite" className={styles.status}>
            {status}
          </p>
        ) : null}

        {uploads.length === 0 ? (
          <p className={styles.empty}>
            Nothing uploaded from this browser yet. Images you upload are stored on the server and
            remain available to the website even if this list is cleared.
          </p>
        ) : (
          <ul className={styles.grid}>
            {[...uploads].reverse().map((upload) => (
              <li key={upload.src} className={styles.item}>
                {/* eslint-disable-next-line @next/next/no-img-element -- preview of an uploaded file */}
                <img src={upload.src} alt="" className={styles.thumb} />
                <code className={styles.path}>{upload.src}</code>
                <button
                  type="button"
                  className={styles.copy}
                  onClick={() => {
                    void navigator.clipboard
                      ?.writeText(upload.src)
                      .then(() => setStatus("Image address copied."))
                      .catch(() => setStatus("Could not copy — you can select the address instead."));
                  }}
                >
                  Copy address
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
