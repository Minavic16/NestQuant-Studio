/**
 * Builds the simplified monogram SVG from the official logo.
 *
 * The letterforms are intricate — a ligature, metallic shading, a colonnade of
 * slats — so instead of approximating them by hand, this reads the actual pixels
 * of the supplied logo and emits its exact silhouette as a set of horizontal
 * bands. Whatever the logo contains is what the SVG contains; nothing is
 * invented.
 *
 * Bands, not per-pixel rectangles: consecutive rows that share the same set of
 * ink runs are merged into one band, which keeps the path small while staying
 * exact. The colonnade gaps and the D's counter appear automatically, because
 * they are simply gaps between runs.
 *
 * Usage: npm run monogram:build
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "public", "brand", "desired-homes-logo.jpg");
const OUTPUT = join(ROOT, "public", "brand", "desired-homes-monogram.svg");
const FAVICON = join(ROOT, "public", "brand", "favicon.svg");

/** Measured on the 1254×1254 original (see scripts/_notes/logo-analysis.md). */
const MONOGRAM_CROP = { left: 206, top: 204, width: 821, height: 554 };
const THRESHOLD = 90;

/**
 * Groups rows into bands of identical run structure.
 *
 * `STEP` is the row granularity: a band covers at least STEP rows, which keeps
 * the path small without visibly changing the letterforms at the sizes the
 * monogram is used (down to 16px).
 */
function bandsFromRuns(rows, width, height) {
  const STEP = 10;
  const bands = [];
  let current = null;

  for (let y = 0; y < height; y += STEP) {
    const rowsInStep = Math.min(STEP, height - y);

    // A pixel counts as ink if it is lit in any row of the step.
    const runs = [];
    let start = -1;
    for (let x = 0; x < width; x += 1) {
      let on = false;
      for (let r = 0; r < rowsInStep && !on; r += 1) {
        if (rows[(y + r) * width + x] === 1) on = true;
      }
      if (on && start === -1) start = x;
      if (!on && start !== -1) {
        runs.push([start, x - 1]);
        start = -1;
      }
    }
    if (start !== -1) runs.push([start, width - 1]);

    // Merge with the previous band when the run structure matches exactly.
    const key = runs.map(([a, b]) => `${a}-${b}`).join(",");
    if (current && current.key === key) {
      current.y2 = y + rowsInStep - 1;
      continue;
    }

    current = { key, y1: y, y2: y + rowsInStep - 1, runs };
    bands.push(current);
  }

  return bands;
}

function toPath(bands) {
  const parts = [];

  for (const band of bands) {
    const top = band.y1;
    const bottom = band.y2 + 1;
    for (const [x1, x2] of band.runs) {
      const left = x1;
      const right = x2 + 1;
      parts.push(`M${left} ${top}H${right}V${bottom}H${left}Z`);
    }
  }

  return parts.join("");
}

async function main() {
  // The raster is read through sharp, which is already a dependency of the
  // image pipeline (next/image). Kept out of the bundle: build-time only.
  const { default: sharp } = await import("sharp");

  const { data, info } = await sharp(SOURCE)
    .extract(MONOGRAM_CROP)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const mask = new Uint8Array(width * height);
  for (let index = 0; index < mask.length; index += 1) {
    mask[index] = data[index * channels] > THRESHOLD ? 1 : 0;
  }

  const bands = bandsFromRuns(mask, width, height);
  const path = toPath(bands);

  if (!path) throw new Error("no letterforms found in the source");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Desired Homes Interiors monogram" fill="currentColor">
  <!--
    ${width}x${height} monogram for Desired Homes Interiors.

    A simplified, single-colour secondary asset traced from the official logo
    (public/brand/desired-homes-logo.jpg, crop x${MONOGRAM_CROP.left} y${MONOGRAM_CROP.top} w${MONOGRAM_CROP.width} h${MONOGRAM_CROP.height}).
    The silhouette is emitted as ${bands.length} horizontal bands of exact ink runs,
    so the D's counter and the H's colonnade gaps appear as they do in the
    original — nothing is redrawn or invented.

    Flat currentColor only: no gradients, no filters, no shading. Crisp at any
    size, on light or dark surfaces.

    Reproduce with: npm run monogram:build
  -->
  <path d="${path}"/>
</svg>
`;

  await writeFile(OUTPUT, svg, "utf8");

  // The favicon is the same traced silhouette on a square canvas, so the mark
  // reads correctly as a tab icon and a home-screen icon.
  const scale = 1 / 1.48;
  const offsetX = (821 - width * scale) / 2;
  const offsetY = (554 - height * scale) / 2;
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 821 821" role="img" aria-label="Desired Homes Interiors" fill="currentColor">
  <!--
    Favicon mark for Desired Homes Interiors.

    The same traced silhouette as desired-homes-monogram.svg, centred on a
    square canvas so it reads at 16-180px as a browser tab icon and a
    home-screen icon. Flat currentColor only: no gradients, no filters.

    Reproduce with: npm run monogram:build
  -->
  <g transform="translate(${offsetX.toFixed(1)} ${offsetY.toFixed(1)}) scale(${scale.toFixed(4)})">
    <path d="${path}"/>
  </g>
</svg>
`;

  await writeFile(FAVICON, iconSvg, "utf8");

  console.log(
    `monogram: ${bands.length} bands, ${path.length} path chars -> public/brand/desired-homes-monogram.svg`,
  );
  console.log("favicon: -> public/brand/favicon.svg");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
