/**
 * Brand asset pipeline — Desired Homes Interiors
 * ------------------------------------------------
 * Derives the required logo crops from the ORIGINAL supplied JPG. Nothing is
 * redrawn, re-typeset or approximated: every output is a pixel-faithful crop of
 * `source/desired-homes-logo-original.jpg`.
 *
 * Crop boxes below were computed by analysing the source image (see
 * `scripts/_notes/logo-analysis.md`). They are symmetric-padded so the metallic
 * mark keeps its original optical margins.
 *
 * Usage:
 *   npm run brand:prepare            # derives from source/ if the Android path is absent
 *   SOURCE_LOGO=/path/to.jpg npm run brand:prepare
 */
import { copyFile, mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAND = join(ROOT, "public", "brand");
const SOURCE_DIR = join(BRAND, "source");
const ORIGINAL = join(BRAND, "desired-homes-logo.jpg");

/** Crop boxes measured on the 1254x1254 original (see logo-analysis.md). */const CROPS = {
  // "DH" monogram — used in the header and as the favicon source.
  "logo-monogram.jpg": {
    left: 166,
    top: 164,
    width: 900,
    height: 633,
    output: { width: 288, height: 202 },
  },
  // Monogram + DESIRED HOMES + INTERIORS (tagline omitted) — the hero, where
  // the proposition already names the services, and the mobile drawer.
  "logo-lockup.jpg": {
    left: 45,
    top: 160,
    width: 1170,
    height: 878,
    output: { width: 720, height: 540 },
  },
  // Complete lockup including the tagline — About, Open Graph, print.
  "logo-complete.jpg": {
    left: 45,
    top: 160,
    width: 1170,
    height: 943,
    output: { width: 840, height: 677 },
  },
};

const JPEG = { quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" };

async function resolveSource() {
  const override = process.env.SOURCE_LOGO;
  const candidates = [
    override,
    "/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Images/IMG-20261003-WA0011.jpg",
    join(SOURCE_DIR, "desired-homes-logo-original.jpg"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await stat(candidate);
      return candidate;
    } catch {
      /* try next */
    }
  }
  throw new Error("Source logo not found. Set SOURCE_LOGO=/path/to/logo.jpg");
}

async function main() {
  await mkdir(BRAND, { recursive: true });
  const source = await resolveSource();
  console.log(`source: ${source}`);

  // The original file is the brand source of truth: keep an untouched copy.
  await copyFile(source, ORIGINAL);
  console.log(`  → public/brand/desired-homes-logo.jpg (original, untouched)`);

  const image = sharp(ORIGINAL);
  const meta = await image.metadata();
  console.log(`  original: ${meta.width}x${meta.height} ${meta.format}`);

  for (const [file, box] of Object.entries(CROPS)) {
    if (box.left + box.width > meta.width || box.top + box.height > meta.height) {
      throw new Error(`${file}: crop box exceeds image bounds`);
    }
    const target = join(BRAND, file);
    await sharp(ORIGINAL).extract(box).resize(box.output.width, box.output.height).jpeg(JPEG).toFile(target);
    const out = await sharp(target).metadata();
    const kb = (await stat(target)).size / 1024;
    console.log(
      `  → public/brand/${file} (${out.width}x${out.height}, ${kb.toFixed(1)} kB)`,
    );
  }

  // Square favicon: monogram padded with its own background colour.
  await sharp(ORIGINAL)
    .resize(256, 256, { fit: "contain", background: "#000000" })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(join(ROOT, "app", "icon.png"));
  const iconKb = (await stat(join(ROOT, "app", "icon.png"))).size / 1024;
  console.log(`  -> app/icon.png (256x256, ${iconKb.toFixed(1)} kB)`);

  // Social card: black field with the complete lockup, centred.
  const cardWidth = 1200;
  const cardHeight = 630;
  const lockupHeight = 380;
  const lockupWidth = Math.round((lockupHeight * 1170) / 943);

  const lockup = await sharp(ORIGINAL)
    .extract(CROPS["logo-complete.jpg"])
    .resize(lockupWidth, lockupHeight)
    .jpeg(JPEG)
    .toBuffer();

  const card = join(ROOT, "app", "opengraph-image.jpg");
  await sharp({
    create: { width: cardWidth, height: cardHeight, channels: 3, background: "#000000" },
  })
    .composite([
      {
        input: lockup,
        top: Math.round((cardHeight - lockupHeight) / 2),
        left: Math.round((cardWidth - lockupWidth) / 2),
      },
    ])
    .jpeg(JPEG)
    .toFile(card);
  const cardKb = (await stat(card)).size / 1024;
  console.log(`  -> app/opengraph-image.jpg (${cardWidth}x${cardHeight}, ${cardKb.toFixed(1)} kB)`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
