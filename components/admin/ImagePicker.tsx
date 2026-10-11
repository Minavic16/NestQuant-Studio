"use client";

import { useRef, useState } from "react";
import styles from "./image-picker.module.css";

/**
 * Image picker used by the dashboard.
 *
 * Uploads go to `/api/admin/upload`, which validates the file's real type by
 * its magic bytes and stores it under a server-generated name, so nothing the
 * administrator types can influence a path (ARCHITECTURE.md §10, §36).
 */

const MAX_BYTES = 6 * 1024 * 1024;

export function ImagePicker({
  label,
  value,
  onChange,
  multiple = false,
  altTexts,
  onAltChange,
}: {
  label: string;
  /** A single src, or a list of srcs when `multiple`. */
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  altTexts?: string[];
  onAltChange?: (index: number, alt: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sources = Array.isArray(value) ? value : value ? [value] : [];

  async function upload(file: File): Promise<string | null> {
    if (file.size > MAX_BYTES) {
      setError("Each image must be smaller than 6 MB.");
      return null;
    }

    const body = new FormData();
    body.append("file", file);

    const response = await fetch("/api/admin/upload", { method: "POST", body });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Upload failed.");
      return null;
    }

    const payload = (await response.json()) as { src?: string };
    return payload.src ?? null;
  }

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setBusy(true);
    setError(null);

    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const src = await upload(file);
      if (src) uploaded.push(src);
    }

    if (uploaded.length > 0) {
      if (multiple) onChange([...sources, ...uploaded]);
      else onChange(uploaded[0]!);
    }

    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(index: number) {
    if (multiple) onChange(sources.filter((_, position) => position !== index));
    else onChange("");
  }

  return (
    <div className={styles.picker}>
      <span className={styles.label}>{label}</span>

      <div className={styles.controls}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          className={styles.file}
          onChange={(event) => void onFiles(event.target.files)}
        />
        <p className={styles.hint}>JPEG, PNG or WebP, up to 6 MB.</p>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {busy ? <p className={styles.busy}>Uploading…</p> : null}

      {sources.length > 0 ? (
        <ul className={styles.list}>
          {sources.map((src, index) => (
            <li key={`${src}-${index}`} className={styles.item}>
              {/* eslint-disable-next-line @next/next/no-img-element -- preview of an uploaded file */}
              <img src={src} alt="" className={styles.thumb} />

              <div className={styles.itemBody}>
                <code className={styles.path}>{src}</code>

                {altTexts && onAltChange ? (
                  <label className={styles.altField}>
                    <span className="visually-hidden">Description for image {index + 1}</span>
                    <input
                      className={styles.input}
                      value={altTexts[index] ?? ""}
                      placeholder="Describe this image for screen readers"
                      onChange={(event) => onAltChange(index, event.target.value)}
                    />
                  </label>
                ) : null}
              </div>

              <button type="button" className={styles.remove} onClick={() => remove(index)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
