/**
 * Asset pipeline for every landing page in this app.
 *
 * Source art is a set of composites (a side-by-side hero, a grid of
 * before/after pairs, a flat-white medical illustration). The pages need
 * them as independent, equally-sized pieces so the before/after sliders
 * and the results galleries can animate them individually.
 *
 * Crop rectangles below are measured, never estimated — each is commented
 * with the separator pixels it came from.
 *
 * ── THREE BUCKETS ───────────────────────────────────────────────────────
 * Output is namespaced, because assets fall into two kinds and a single
 * flat manifest could not express the difference once there was a second
 * page:
 *
 *   shared/              the clinic itself — logo, favicon, the surgeon's
 *                        portrait, the affiliation marks. Identical on
 *                        every page, emitted once, referenced by the
 *                        shared kit in components/lp/.
 *   buccal-fat-removal/  page assets
 *   brazilian-butt-lift/ page assets
 *
 * Each bucket becomes one export in lib/generated/images.ts (SHARED,
 * BUCCAL, BBL). Adding page 3 means adding a bucket and a block below —
 * nothing here needs restructuring again.
 * ────────────────────────────────────────────────────────────────────────
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
const BBL_SRC = path.resolve(__dirname, "../../brazilian-butt-lift/Images");
const BBL_BA_SRC = path.resolve(__dirname, "../../brazilian-butt-lift/B A");
const PUBLIC = path.resolve(__dirname, "../public");
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

const BBL_SOURCES = {
  hero: "Hero Image.png",
  profile: "ChatGPT Image Jul 25, 2026, 02_59_52 PM.png",
  interior: "ChatGPT Image Jul 25, 2026, 03_09_16 PM.png",
  /*
   * A 6-pair before/after grid, filed with the photography rather than in
   * the "B A" folder. It is the only source on this page that shows the
   * buttocks themselves before and after, so it carries both the featured
   * comparison and half the gallery. Cut below on measured separators.
   *
   * Not used: "ChatGPT Image Jul 25, 2026, 03_07_02 PM.png" and
   * "…03_09_22 PM.png" are byte-identical to each other and to `interior`'s
   * framing — one image, three files.
   */
  grid: "ChatGPT Image Jul 25, 2026, 04_23_19 PM.png",
};

const src = (k) => path.join(SRC, SOURCES[k]);
const bblSrc = (k) => path.join(BBL_SRC, BBL_SOURCES[k]);

/**
 * One manifest per bucket. `emit` writes into whichever is current, so a
 * block of the script never has to repeat which page it is building for.
 */
const manifests = { shared: {}, buccal: {}, bbl: {} };
const DIRS = {
  shared: "shared",
  buccal: "buccal-fat-removal",
  bbl: "brazilian-butt-lift",
};
let bucket = "buccal";
const into = (b) => {
  bucket = b;
};

async function emit(name, pipeline) {
  // WebP for anything needing alpha — the anatomy illustration is 10x
  // smaller than the equivalent PNG with no visible quality loss.
  const encode = name.endsWith(".webp")
    ? pipeline.webp({ quality: 86, alphaQuality: 90, effort: 6 })
    : name.endsWith(".png")
      ? pipeline.png({ compressionLevel: 9, palette: false })
      : pipeline.jpeg({ quality: 82, mozjpeg: true });
  const buf = await encode.toBuffer();

  const dir = DIRS[bucket];
  await fs.writeFile(path.join(PUBLIC, dir, name), buf);

  const meta = await sharp(buf).metadata();
  // 20px-wide LQIP — enough to hint colour, small enough to inline.
  const lqip = await sharp(buf)
    .resize(20, null, { fit: "inside" })
    .blur(1.4)
    .webp({ quality: 32 })
    .toBuffer();

  manifests[bucket][name] = {
    src: `/${dir}/${name}`,
    width: meta.width,
    height: meta.height,
    blurDataURL: `data:image/webp;base64,${lqip.toString("base64")}`,
  };

  console.log(
    `  ${dir}/${name}`.padEnd(44) +
      `${String(meta.width).padStart(4)}x${String(meta.height).padEnd(4)}  ${(buf.length / 1024).toFixed(0)}kb`
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
for (const dir of Object.values(DIRS)) {
  await fs.mkdir(path.join(PUBLIC, dir), { recursive: true });
}
await fs.mkdir(GEN, { recursive: true });

// ══════════════════════════════════════════════════════════════════
// BUCCAL FAT REMOVAL
// ══════════════════════════════════════════════════════════════════
into("buccal");

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
// Shared: the same ribbon runs in every page's surgeon band.
into("shared");
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

into("buccal");
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

console.log("\nPortraits + logo — shared, one surgeon and one clinic");
/*
 * Shared, not per-page. These are photographs of the surgeon and marks of
 * the clinic: the "meet your surgeon" band and the theatre photo are the
 * same on every landing page, so emitting a copy per page would ship the
 * same bytes twice and let the two drift apart.
 */
into("shared");
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

// ══════════════════════════════════════════════════════════════════
// BRAZILIAN BUTT LIFT
// ══════════════════════════════════════════════════════════════════
into("bbl");

console.log("\nBBL — hero, benefits portrait, procedure photograph");
/*
 * Same treatment as the buccal page's three photographic slots, and for
 * the same reasons: the hero is capped tighter because it is the LCP
 * element, the two below-the-fold images can afford more width.
 */
await emit(
  "hero-bg.jpg",
  sharp(bblSrc("hero")).resize({ width: 1000, withoutEnlargement: true })
);
await emit(
  "benefits-portrait.jpg",
  sharp(bblSrc("profile")).resize({ width: 900, withoutEnlargement: true })
);
/*
 * Stands in for the buccal page's `anatomy.webp` beside the how-it's-
 * performed stepper. There is no medical illustration for this procedure
 * — and inventing one would be inventing anatomy — so the slot holds a
 * photograph instead. Dark and quiet on purpose: it sits on the sand band
 * and must not compete with the four steps beside it.
 */
await emit(
  "steps.jpg",
  sharp(bblSrc("interior")).resize({ width: 900, withoutEnlargement: true })
);

console.log("\nBBL results grid — six pairs, cut on measured separators");
/*
 * A 1536x1024 composite: two rows of three before/after PAIRS.
 *
 * Measured, not estimated. Scanning for columns that are ≥60% near-white
 * gives five vertical separators and one horizontal one:
 *
 *   x 253-256   766-769   1290-1293   ← the "→" glyph, INSIDE a pair
 *   x 512-516   1024-1028              ← plain gutter, BETWEEN pairs
 *   y 510-514                          ← the row split
 *
 * So the pair boundaries are x 0-511 / 517-1023 / 1029-1535, and each
 * pair keeps its own arrow: the cards are cut on the *between-pair*
 * gutters, never the arrow, because the arrow is what tells a visitor
 * which half is which.
 */
const PAIR_X = [
  [0, 512],
  [517, 507],
  [1029, 507],
];
const PAIR_Y = [
  [0, 510],
  [515, 509],
];
{
  let n = 0;
  for (const [top, height] of PAIR_Y) {
    for (const [left, width] of PAIR_X) {
      n += 1;
      await emit(
        `ba-${n}.jpg`,
        sharp(bblSrc("grid")).extract({ left, top, width, height })
      );
    }
  }
}

console.log("\nBBL featured comparison — one pair, split at the arrow");
/*
 * The drag slider needs the two halves as separate, equally-sized files.
 *
 * The arrow does not sit in the white gutter — it bleeds into both
 * photographs, spanning x 239-273 (measured the same way, by white pixels
 * in the y 170-340 band). Splitting on the gutter alone would leave half
 * an arrow pinned to the inside edge of each half, which the slider then
 * drags across the frame. So the halves are taken *outside* the glyph:
 * 0-238 and 274-511, 238px each.
 *
 * Cropped to waist-to-mid-thigh rather than used full height. At full
 * height each half is 238x509, and the slider sizes itself from that
 * aspect — a 0.47 ratio makes it twice as tall as the reading guide
 * beside it. 238x298 is close to the buccal slider's 0.89 and frames the
 * part of the photograph the section is actually discussing.
 *
 * ── The one real compromise on this page ────────────────────────────
 * 238px of source in a ~380px column is a 1.6x upscale. It is the
 * highest-resolution before/after of the buttocks the clinic supplied;
 * anything larger would need new source art, not a different crop. The
 * featured column is narrowed to 0.66fr in Results.tsx to hold the
 * upscale down — see the note there.
 * ────────────────────────────────────────────────────────────────────
 */
const COMPARE = { top: 45, height: 298, width: 238 };
await emit(
  "compare-before.jpg",
  sharp(bblSrc("grid")).extract({ left: 0, ...COMPARE })
);
await emit(
  "compare-after.jpg",
  sharp(bblSrc("grid")).extract({ left: 274, ...COMPARE })
);

console.log("\nBBL gallery — the clinic’s own cards, resized only");
/*
 * Supplied already composed and watermarked, so the pipeline only
 * resizes: each file IS one finished card, and cropping one would either
 * destroy the comparison it exists to make or cut the clinic's watermark
 * in half.
 *
 * All six are 700x380. Three are genuine side-by-side before/after pairs;
 * three are single post-operative photographs with no "before" in them,
 * which is why content.ts labels each card individually rather than the
 * page stamping "Before"/"After" on all of them.
 */
const BBL_CARDS = [
  "Untitled design (20).png",
  "Untitled design (21).png",
  "Untitled design (25).png",
  "Untitled design (26).png",
  "Untitled design (27).png",
  "Untitled design (30).png",
];
for (const [i, file] of BBL_CARDS.entries()) {
  await emit(
    `ba-${i + 7}.jpg`,
    sharp(path.join(BBL_BA_SRC, file)).resize({ width: 1000, withoutEnlargement: true })
  );
}

// ------------------------------------------------------------------
const banner = `/**
 * AUTO-GENERATED by scripts/prepare-images.mjs — do not edit by hand.
 * Natural dimensions + inline LQIP placeholders for every page asset,
 * so <Image> never causes layout shift and never flashes empty.
 *
 * SHARED  the clinic — logo, portrait, affiliation marks. Used by the
 *         shared kit in components/lp/, so every page gets the same file.
 * BUCCAL  /buccal-fat-removal page assets.
 * BBL     /brazilian-butt-lift page assets.
 */`;

const asConst = (name, obj) =>
  `export const ${name} = ${JSON.stringify(obj, null, 2)} as const;\n`;

await fs.writeFile(
  path.join(GEN, "images.ts"),
  [
    banner,
    asConst("SHARED", manifests.shared),
    asConst("BUCCAL", manifests.buccal),
    asConst("BBL", manifests.bbl),
    `/** The shape every entry above has — what <Image> and the slider read. */
export type ImageAsset = {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
};
`,
  ].join("\n")
);

const total = Object.values(manifests).reduce((n, m) => n + Object.keys(m).length, 0);
console.log(`\nWrote ${total} assets + lib/generated/images.ts\n`);
