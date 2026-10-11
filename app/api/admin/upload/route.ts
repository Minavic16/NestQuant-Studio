import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";
import { revalidatePath } from "next/cache";

/**
 * Image uploads for products, categories and the hero.
 *
 * Only raster formats are accepted and every file is checked by its magic
 * bytes, not by the extension the client claims. SVG is rejected outright
 * because it can carry script. Names are server-generated, so nothing a client
 * sends is used as a path (ARCHITECTURE.md §10, §36).
 */

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads";

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Magic byte signatures, checked against the file's real content. */
const SIGNATURES: Array<{ type: string; test: (bytes: Uint8Array) => boolean }> = [
  {
    type: "image/jpeg",
    test: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  {
    type: "image/png",
    test: (bytes) =>
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47,
  },
  {
    type: "image/webp",
    test: (bytes) =>
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50,
  },
];

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request): Promise<NextResponse> {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file supplied." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be smaller than 6 MB." }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = SIGNATURES.find((signature) => signature.test(bytes))?.type;
  if (!detected || !ALLOWED_TYPES.has(detected)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG and WebP images can be uploaded." },
      { status: 415 },
    );
  }

  const name = `${randomUUID()}.${EXTENSIONS[detected]}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(join(UPLOAD_DIR, name), bytes);

  revalidatePath("/", "layout");

  return NextResponse.json({ src: `${PUBLIC_PREFIX}/${name}` }, { status: 201 });
}
