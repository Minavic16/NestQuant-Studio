/**
 * Google Drive image resolution.
 *
 * The business keeps its past work in Drive and wants it served from there, so
 * the site never stores a copy of its portfolio. A Drive reference can be:
 *
 *   • a file id                      1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
 *   • a share link                   https://drive.google.com/file/d/<id>/view
 *   • a direct image URL             https://lh3.googleusercontent.com/d/<id>
 *
 * All three resolve to the same `lh3.googleusercontent.com` URL, which is the
 * only host actually served in an `<img>`. Google requires the file to be
 * shared as "anyone with the link", that is the business's decision, not the
 * site's, and the admin UI says so.
 *
 * The resolved URL is always validated against an allow-list of hosts before it
 * is used, so a hand-edited store can never point an image at an arbitrary
 * origin (ARCHITECTURE.md §10, §36).
 */

const ALLOWED_HOSTS = ["lh3.googleusercontent.com", "drive.google.com"] as const;

const FILE_ID_PATTERN = /^[A-Za-z0-9_-]{10,}$/;

/** Pulls a file id out of any of the accepted Drive reference formats. */
export function extractDriveFileId(reference: string): string | null {
  const value = reference.trim();
  if (value.length === 0) return null;

  // /file/d/<id>/view, /open?id=<id>, /uc?id=<id>
  const patterns = [
    /\/file\/d\/([A-Za-z0-9_-]+)/,
    /[?&]id=([A-Za-z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(value);
    if (match?.[1]) return match[1];
  }

  // A bare id, or a direct lh3 URL that carries one.
  if (FILE_ID_PATTERN.test(value)) return value;

  const direct = /lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/.exec(value);
  if (direct?.[1]) return direct[1];

  return null;
}

/** The URL that renders the Drive file as an image. */
export function driveImageUrl(fileId: string, width = 1600): string {
  return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
}

/** Human-facing link to the file in Drive, for the "view in Drive" affordance. */
export function driveFileUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/**
 * Resolves a Drive reference into an image URL, or returns null when the
 * reference is not something we can serve.
 */
export function resolveDriveImage(reference: string, width?: number): string | null {
  const fileId = extractDriveFileId(reference);
  if (!fileId) return null;
  return driveImageUrl(fileId, width);
}

/** True when a URL points at a host we allow images to come from. */
export function isAllowedImageHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (ALLOWED_HOSTS as readonly string[]).includes(hostname);
  } catch {
    return false;
  }
}

/**
 * Normalises an image source for storage: accepts a Drive reference or a local
 * path, and rejects anything that is neither.
 */
export function normaliseImageSource(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  // Local media stays local. `portfolio/` holds the committed past-work
  // photography, so it is allowed alongside the dashboard's uploads. Each
  // segment must be a plain filename, no `..`, no `%`, no spaces, so a path
  // can be nested (`/products/<slug>/01.jpg`) but can never climb out.
  if (
    trimmed.startsWith("/uploads/") ||
    trimmed.startsWith("/products/") ||
    trimmed.startsWith("/portfolio/")
  ) {
    const path = trimmed.split("?")[0] ?? "";
    // `filter(Boolean)` rejects empty segments (`//`), and the per-segment
    // check rejects `.`, `..`, `%`, spaces and anything else that is not a
    // plain filename.
    const segments = path.split("/").filter((segment) => segment.length > 0);
    const isPlainSegment = (segment: string) =>
      segment !== "." && segment !== ".." && /^[A-Za-z0-9._-]+$/.test(segment);
    const isLocalMedia =
      segments.length > 1 &&
      ["uploads", "products", "portfolio"].includes(segments[0] ?? "") &&
      segments.every(isPlainSegment) &&
      path === `/${segments.join("/")}`;

    return isLocalMedia ? path : null;
  }

  // A Drive reference resolves to its image URL.
  const drive = resolveDriveImage(trimmed);
  if (drive && isAllowedImageHost(drive)) return drive;

  // A direct https URL is allowed only on an approved image host.
  if (trimmed.startsWith("https://") && isAllowedImageHost(trimmed)) return trimmed;

  return null;
}
