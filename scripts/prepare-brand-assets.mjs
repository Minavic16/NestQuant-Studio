/**
 * Brand asset pipeline — Desired Homes Interiors
 * ------------------------------------------------
 * Derives the required logo crops from the ORIGINAL supplied JPG. Nothing is
 * redrawn, re-typeset or approximated: every output is a pixel-faithful crop of
 * `source/desired-homes-logo-original.jpg`.
 *
 * Two kinds of derivative are produced:
 *
 *   • crops    — pixel-exact regions of the original, opaque
 *   • knocked  — the same crops with the black field made transparent, so the
 *                mark can sit on photography without showing a box
 *
 * The knock-out is a luminance key, not a redraw. The original's own pixel
 * values are preserved for every visible point; only the pure-black field
 * becomes transparent. The original logo's own measurements confirmed the
 * field is 85% of the frame at luminance 0–15 and the letterforms are 96–255,
 * so the two are cleanly separable (see scripts/_notes/logo-analysis.md).
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

/** Crop boxes measured on the 1254x1254 original (see logo-analysis.md). */
const CROPS = {
  // "DH" monogram — used in the header and as the favicon source.
  "logo-monogram.jpg": {
    left: 166,
    top: 164,
    width: 900,
    height: 633,
    output: { width: 288, height: 202 },
  },
  // Monogram + DESIRED HOMES + INTERIORS (tagline omitted).
  "logo-lockup.jpg": {
    left: 45,
    top: 160,
    width: 1170,
    height: 878,
    output: { width: 720, height: 540 },
  },
  // Complete lockup including the tagline.
  "logo-complete.jpg": {
    left: 45,
    top: 160,
    width: 1170,
    height: 943,
    output: { width: 840, height: 677 },
  },
};

/**
 * Crops that are also produced with the black field knocked out, for use over
 * photography. Keyed by the crop name above.
 *
 * These are WebP rather than PNG: the letterforms carry photographic metallic
 * noise, which PNG compresses badly (289 kB against 51 kB for the same image).
 */
const KNOCK_OUTS = {
  "logo-complete.webp": "logo-complete.jpg",
  "logo-lockup.webp": "logo-lockup.jpg",
};

const KNOCK_OUT_QUALITY = 88;

const JPEG = { quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" };

/**
 * Luminance key. Below `black` the pixel is treated as field and dropped;
 * between `black` and `white` the alpha ramps in, which preserves the
 * original's own anti-aliasing instead of aliasing it away.
 */
const BLACK_POINT = 18;
const WHITE_POINT = 108;

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

/** Removes the pure-black field, keeping every visible pixel as the client supplied it. */
async function knockOutBlack(source, box, output, destination) {
  const { data, info } = await sharp(source).extract(box).resize(output).raw().toBuffer({
    resolveWithObject: true,
  });
  const { width, height, channels } = info;
  const pixels = new Uint8Array(width * height * 4);

  for (let index = 0; index < width * height; index += 1) {
    const r = data[index * channels];
    const g = data[index * channels + 1];
    const b = data[index * channels + 2];

    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const ramp = Math.min(1, Math.max(0, (luminance - BLACK_POINT) / (WHITE_POINT - BLACK_POINT)));

    const target = index * 4;
    pixels[target] = r;
    pixels[target + 1] = g;
    pixels[target + 2] = b;
    pixels[target + 3] = Math.round(ramp * 255);
  }

  await sharp(pixels, { raw: { width, height, channels: 4 } })
    .webp({ quality: KNOCK_OUT_QUALITY })
    .toFile(destination);
}

async function main() {
  await mkdir(BRAND, { recursive: true });
  const source = await resolveSource();
  console.log(`source: ${source}`);

  // The original file is the brand source of truth: keep an untouched copy.
  await copyFile(source, ORIGINAL);
  console.log("  -> public/brand/desired-homes-logo.jpg (original, untouched)");

  const image = sharp(ORIGINAL);
  const meta = await image.metadata();
  console.log(`  original: ${meta.width}x${meta.height} ${meta.format}`);

  for (const [file, box] of Object.entries(CROPS)) {
    if (box.left + box.width > meta.width || box.top + box.height > meta.height) {
      throw new Error(`${file}: crop box exceeds image bounds`);
    }
    const target = join(BRAND, file);
    await sharp(ORIGINAL).extract(box).resize(box.output.width, box.output.height).jpeg(JPEG).toFile(target);
    const kb = (await stat(target)).size / 1024;
    console.log(`  -> public/brand/${file} (${box.output.width}x${box.output.height}, ${kb.toFixed(1)} kB)`);
  }

  for (const [file, cropName] of Object.entries(KNOCK_OUTS)) {
    const box = CROPS[cropName];
    const target = join(BRAND, file);
    await knockOutBlack(ORIGINAL, box, box.output, target);
    const kb = (await stat(target)).size / 1024;
    console.log(`  -> public/brand/${file} (black field removed, ${kb.toFixed(1)} kB)`);
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
