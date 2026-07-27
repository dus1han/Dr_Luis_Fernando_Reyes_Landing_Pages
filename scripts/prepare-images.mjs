/**
 * Asset pipeline for the buccal-fat-removal landing page.
 *
 * Source art is a set of composites (a side-by-side hero, a 4x3 results
 * grid, a flat-white medical illustration). The page needs them as
 * independent, equally-sized pieces so the before/after slider and the
 * results gallery can animate them individually.
 *
 * Crop rectangles below come from scripts/inspect-images.mjs +
 * probe-hero.mjs, which measured the real separator pixels.
 *
 * Run: npm run prepare-images
 */
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "../../buccal-fat-removal/Images");
const OUT = path.resolve(__dirname, "../public/buccal-fat-removal");
const GEN = path.resolve(__dirname, "../lib/generated");

const SOURCES = {
  hero: "hero.png",
  frontFacing: "frontfacing.png",
  heroPair: "ChatGPT Image Jul 19, 2026, 08_19_23 PM.png",
  resultsGrid: "ChatGPT Image Jul 25, 2026, 04_05_19 PM.png",
  anatomy: "Untitled design (12).png",
  portrait: "DRA-NICOLE-Y-DR-LUIS-FERNANDO-5-scaled.jpg",
  surgery: "IMG_9759-scaled.jpg",
  logo: "logo-reyes-blanco-1.png",
};

const src = (k) => path.join(SRC, SOURCES[k]);
const out = (f) => path.join(OUT, f);

/** Records natural size + a tiny inline placeholder for every emitted file. */
const manifest = {};

async function emit(name, pipeline) {
  // WebP for anything needing alpha — the anatomy illustration is 10x
  // smaller than the equivalent PNG with no visible quality loss.
  const encode = name.endsWith(".webp")
    ? pipeline.webp({ quality: 86, alphaQuality: 90, effort: 6 })
    : name.endsWith(".png")
      ? pipeline.png({ compressionLevel: 9, palette: false })
      : pipeline.jpeg({ quality: 82, mozjpeg: true });
  const buf = await encode.toBuffer();

  await fs.writeFile(out(name), buf);

  const meta = await sharp(buf).metadata();
  // 20px-wide LQIP — enough to hint colour, small enough to inline.
  const lqip = await sharp(buf)
    .resize(20, null, { fit: "inside" })
    .blur(1.4)
    .webp({ quality: 32 })
    .toBuffer();

  manifest[name] = {
    src: `/buccal-fat-removal/${name}`,
    width: meta.width,
    height: meta.height,
    blurDataURL: `data:image/webp;base64,${lqip.toString("base64")}`,
  };

  console.log(
    `  ${name.padEnd(22)} ${String(meta.width).padStart(4)}x${String(meta.height).padEnd(4)}  ${(buf.length / 1024).toFixed(0)}kb`
  );
}

/**
 * Makes the illustration's flat white studio background transparent so it
 * can sit on the sand-toned section. Flood-fills inward from the border
 * only, so genuinely white pixels *inside* the artwork (eye highlights,
 * tissue detail) are preserved.
 */
async function knockOutBackground(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  const NEAR_WHITE = 244; // fully background
  const FEATHER = 228; // ramp starts here, kills halo fringing

  const idx = (x, y) => (y * w + x) * 4;
  const brightness = (i) => Math.min(data[i], data[i + 1], data[i + 2]);

  const visited = new Uint8Array(w * h);
  const queue = [];
  const push = (x, y) => {
    const p = y * w + x;
    if (visited[p]) return;
    if (brightness(idx(x, y)) < FEATHER) return;
    visited[p] = 1;
    queue.push(p);
  };

  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  while (queue.length) {
    const p = queue.pop();
    const x = p % w;
    const y = (p / w) | 0;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }

  for (let p = 0; p < w * h; p++) {
    if (!visited[p]) continue;
    const i = p * 4;
    const b = brightness(i);
    // Soft ramp across the feather band instead of a hard 0/255 cut.
    const alpha =
      b >= NEAR_WHITE
        ? 0
        : Math.round(255 * (1 - (b - FEATHER) / (NEAR_WHITE - FEATHER)));
    data[i + 3] = Math.min(data[i + 3], alpha);
  }

  return sharp(data, { raw: { width: w, height: h, channels: 4 } });
}

// ------------------------------------------------------------------
await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(GEN, { recursive: true });

console.log("\nHero background");
/**
 * The hero photograph, used as a full-bleed background behind the
 * headline. One asset serves both layouts — `object-position` moves the
 * crop rather than shipping two files, which would double the bytes on
 * the page's LCP element.
 *
 * Quality is a notch below the gallery images: it always sits behind a
 * scrim, so the detail is never read directly, and this is the one image
 * that blocks first paint.
 */
await emit(
  "hero-bg.jpg",
  sharp(src("hero")).resize({ width: 1000, withoutEnlargement: true })
);

/*
 * Benefits portrait — front-facing, so it shows the cheekbone and jawline
 * definition the section is describing. A 4:5 source; the page crops it
 * per breakpoint rather than shipping two files.
 *
 * 900px wide covers the ~456px column it renders into at 2x. It sits well
 * below the fold and is lazy by default, so it costs nothing at first
 * paint — unlike the hero, which is why that one is capped tighter.
 */
await emit(
  "benefits-portrait.jpg",
  sharp(src("frontFacing")).resize({ width: 900, withoutEnlargement: true })
);

console.log("\nHero before/after — splitting composite at the measured gutter");
// 1536x1024 composite: gutter x766-769, "BEFORE"/"AFTER" labels end y68,
// photo area ends y934 where the caption band begins. We render our own
// labels, so both are cropped away.
const HERO = { top: 74, height: 860, width: 766 };
await emit(
  "hero-before.jpg",
  sharp(src("heroPair")).extract({ left: 0, top: HERO.top, width: HERO.width, height: HERO.height })
);
await emit(
  "hero-after.jpg",
  sharp(src("heroPair")).extract({ left: 770, top: HERO.top, width: HERO.width, height: HERO.height })
);

console.log("\nResults gallery — 6 before/after pairs from the 4x3 grid");
// 1402x1122 grid, gutters measured at x696-700 and y378-381 / y742-745.
// Each pair keeps its own ">" arrow, so pairs stay self-explanatory.
const PAIR_W = 696;
const PAIR_H = 360;
const PAIRS = [
  { left: 0, top: 9 },
  { left: 701, top: 9 },
  { left: 0, top: 382 },
  { left: 701, top: 382 },
  { left: 0, top: 754 },
  { left: 701, top: 754 },
];
for (const [i, p] of PAIRS.entries()) {
  await emit(
    `result-${i + 1}.jpg`,
    sharp(src("resultsGrid")).extract({ ...p, width: PAIR_W, height: PAIR_H })
  );
}

console.log("\nAnatomy illustration — trimmed + background knocked out");
// 1200x630 with all-white margins at y0-94 / y533-629 and x1159-1199.
const anatomyCropped = await sharp(src("anatomy"))
  .extract({ left: 1, top: 95, width: 1157, height: 437 })
  .png()
  .toBuffer();
await emit("anatomy.webp", await knockOutBackground(anatomyCropped));

console.log("\nPortraits + logo");
// The source is a full-length studio shot on black; most of the frame is
// empty. Crop to a 4:5 portrait around the head, shoulders and hands so
// the "meet your surgeon" panel reads as a portrait, not a torso.
await emit(
  "dr-portrait.jpg",
  sharp(src("portrait"))
    .extract({ left: 463, top: 80, width: 1184, height: 1480 })
    .resize({ width: 1100, withoutEnlargement: true })
);
await emit(
  "dr-surgery.jpg",
  sharp(src("surgery")).resize({ width: 1100, withoutEnlargement: true })
);
await emit(
  "logo-white.png",
  sharp(src("logo")).resize({ width: 420, withoutEnlargement: true })
);

/**
 * The supplied logo is white on transparent, so it disappears on the
 * ivory nav. Recolour it by keeping the alpha channel as a mask and
 * repainting every visible pixel in ink — the artwork is untouched,
 * only its colour changes.
 */
{
  const resized = await sharp(src("logo"))
    .resize({ width: 420, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = resized;
  const INK = [0x23, 0x1b, 0x16];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    data[i] = INK[0];
    data[i + 1] = INK[1];
    data[i + 2] = INK[2];
  }

  await emit(
    "logo-ink.png",
    sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  );
}

/**
 * Favicon — just the circular monogram from the logo, not the wordmark.
 *
 * At 16px a full lockup is an illegible smear; the mark alone still reads.
 * Its bounding box (432,34 → 195x195) was found by scanning the source for
 * horizontal bands of opaque pixels: the logo splits into the symbol, then
 * "LUIS FERNANDO REYES", then "CIRUJANO PLÁSTICO", and the first band is
 * the symbol.
 *
 * The artwork is white on transparent, so it's recoloured to ink and left
 * on a transparent canvas — no plate behind it.
 *
 * Trade-off worth knowing: transparent + near-black means low contrast on
 * browsers using a dark tab strip. The mark is scaled to fill 94% of the
 * canvas to claw some of that back; if it ever proves hard to see, put the
 * espresso-deep plate back rather than lightening the mark.
 */
{
  const SIZE = 512;
  const INNER = Math.round(SIZE * 0.94);
  const INK = [0x23, 0x1b, 0x16];

  const mark = await sharp(src("logo"))
    .extract({ left: 432, top: 34, width: 195, height: 195 })
    .resize(INNER, INNER, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < mark.data.length; i += 4) {
    if (mark.data[i + 3] === 0) continue;
    mark.data[i] = INK[0];
    mark.data[i + 1] = INK[1];
    mark.data[i + 2] = INK[2];
  }

  const inked = await sharp(mark.data, {
    raw: { width: mark.info.width, height: mark.info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const icon = await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: inked, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Next.js serves app/icon.png as the favicon automatically.
  await fs.writeFile(path.resolve(__dirname, "../app/icon.png"), icon);
  console.log(`  app/icon.png           ${SIZE}x${SIZE}   ${(icon.length / 1024).toFixed(0)}kb  (ink on transparent)`);
}

// ------------------------------------------------------------------
const banner = `/**
 * AUTO-GENERATED by scripts/prepare-images.mjs — do not edit by hand.
 * Natural dimensions + inline LQIP placeholders for every page asset,
 * so <Image> never causes layout shift and never flashes empty.
 */`;

await fs.writeFile(
  path.join(GEN, "images.ts"),
  `${banner}\nexport const IMAGES = ${JSON.stringify(manifest, null, 2)} as const;\n\nexport type ImageKey = keyof typeof IMAGES;\n`
);

console.log(`\nWrote ${Object.keys(manifest).length} assets + lib/generated/images.ts\n`);
