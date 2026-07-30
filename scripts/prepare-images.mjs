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
const LOGO_SRC = path.resolve(__dirname, "../../buccal-fat-removal/uni logo");
const BA_SRC = path.resolve(__dirname, "../../buccal-fat-removal/Before after");
const OUT = path.resolve(__dirname, "../public/buccal-fat-removal");
const GEN = path.resolve(__dirname, "../lib/generated");

const SOURCES = {
  hero: "hero.png",
  frontFacing: "frontfacing.png",
  heroPair: "ChatGPT Image Jul 19, 2026, 08_19_23 PM.png",
  // The 4x3 results composite is gone: the gallery now uses the clinic's own
  // before/after cards from ../Before after/, which need no cutting.
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

/*
 * Affiliation logos for the surgeon band.
 *
 * They arrive as line art that would be invisible on espresso. Each is
 * trimmed to its ink, recoloured to a flat champagne, and normalised to one
 * height so the row reads as a set rather than six unrelated files.
 *
 * Recolouring institutional marks is the usual treatment for a monochrome
 * accreditation ribbon — the alternative here is illegible. Only the RGB
 * is replaced; the original alpha is kept, so antialiasing and every
 * interior cut in the engraved seals survive.
 *
 * `onWhite: true` marks a source that has NO alpha channel — flattened onto
 * an opaque white background. Feeding one of those through the same path
 * would recolour every pixel and emit a solid champagne rectangle, so its
 * alpha is derived first. See `deriveAlphaFromWhite` below.
 *
 * The source folder also holds IMG_3483, a byte-identical copy of IMG_3478,
 * which is deliberately not emitted.
 */
console.log("\nAffiliation logos — trimmed, tinted champagne for the dark band");
{
  const CHAMPAGNE = [0xed, 0xdf, 0xc6];
  // 3x the tallest height any of these render at, so they stay crisp on
  // retina without shipping the 2560px original.
  const H = 144;

  const LOGOS = [
    ["affil-rosario.png", "IMG_3478.PNG"],
    ["affil-emory.png", "IMG_3482.PNG"],
    ["affil-uba.png", "IMG_3481.PNG"],
    ["affil-asps.png", "IMG_3479.PNG"],
    ["affil-filacp.png", "IMG_3480.PNG"],
    // AASMA — a WebP converted to PNG, so it came flattened on white.
    ["affil-aasma.png", "ezgif.com-webp-to-png-converter (10).png", { onWhite: true }],
  ];

  /*
   * Turn "ink on opaque white" into "ink on transparent".
   *
   * alpha = 255 - min(r, g, b), which asks how far a pixel departs from white
   * in ANY channel. Luminance would be wrong here: this badge's ink is a
   * saturated cyan whose luminance is around 150, so 255 - luminance would
   * render it at 41% opacity — visibly washed out beside the other five.
   * Taking the minimum channel gives that same cyan an alpha of 242 while
   * still resolving pure white to 0 and antialiased edges to a soft ramp.
   */
  function deriveAlphaFromWhite(data) {
    for (let i = 0; i < data.length; i += 4) {
      const min = Math.min(data[i], data[i + 1], data[i + 2]);
      data[i + 3] = 255 - min;
    }
  }

  for (const [name, file, opts = {}] of LOGOS) {
    let pipeline = sharp(path.join(LOGO_SRC, file)).ensureAlpha();

    if (opts.onWhite) {
      // Has to happen before the trim, or there is no transparency for the
      // trim to find and it crops nothing.
      const flat = await pipeline.raw().toBuffer({ resolveWithObject: true });
      deriveAlphaFromWhite(flat.data);
      pipeline = sharp(flat.data, {
        raw: { width: flat.info.width, height: flat.info.height, channels: 4 },
      });
    }

    const raw = await pipeline
      // Drop the transparent margin first: without it the logos normalise
      // to the height of their padding rather than of their artwork, and
      // the row comes out visually ragged.
      .trim({ threshold: 1 })
      .resize({ height: H, fit: "inside", withoutEnlargement: false })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < raw.data.length; i += 4) {
      if (raw.data[i + 3] === 0) continue;
      raw.data[i] = CHAMPAGNE[0];
      raw.data[i + 1] = CHAMPAGNE[1];
      raw.data[i + 2] = CHAMPAGNE[2];
    }

    await emit(
      name,
      sharp(raw.data, {
        raw: { width: raw.info.width, height: raw.info.height, channels: 4 },
      })
    );
  }
}

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

console.log("\nResults gallery — the clinic’s own before/after cards");
/*
 * These arrive already composed, watermarked and — where the clinic chose
 * to — anonymised, so the pipeline only resizes them. No cutting, no
 * cropping: each file IS one complete pair, and cropping one would destroy
 * the comparison it exists to make.
 *
 * Two shapes on purpose, both preserved rather than normalised:
 *   1080x1080  three pairs, before and after stacked or side by side
 *   700x380    three pairs, side by side
 *
 * The page orders squares first so each row of the gallery grid holds one
 * shape and comes out even. Forcing a single aspect with object-cover
 * would crop half of a before or an after off the card.
 *
 * This replaced result-1..6.jpg, which were cut out of a 4x3 composite of
 * reference art. That source and its measured gutters are gone.
 */
const BEFORE_AFTER = [
  "Untitled design (12).png",
  "Untitled design (13).png",
  "Untitled design (14).png",
  "Untitled design (15).png",
  "Untitled design (16).png",
  "Untitled design (17).png",
];
for (const [i, file] of BEFORE_AFTER.entries()) {
  await emit(
    `ba-${i + 1}.jpg`,
    // 1000px covers the ~380px card at 2x without shipping the 1.6MB PNG.
    sharp(path.join(BA_SRC, file)).resize({ width: 1000, withoutEnlargement: true })
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
