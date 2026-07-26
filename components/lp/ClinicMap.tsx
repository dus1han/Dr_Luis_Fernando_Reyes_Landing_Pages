import { MAPS, SITE } from "@/lib/site";

/**
 * Google's embed paints an "Open in Maps" chip in its top-left corner.
 * There is no parameter to suppress it, so the iframe is grown and pushed
 * up by this much and the container clips it — the chip ends up above the
 * visible area.
 *
 * Only the top is cropped. Google's logo and "Map data" credit sit along
 * the bottom edge and their embed terms require both to stay visible.
 */
const CHIP_CROP = 54;

/** Height of Google's attribution strip, left clickable at the bottom. */
const ATTRIBUTION = 26;

/**
 * Embedded clinic map, pinned by coordinates and labelled with the clinic
 * name.
 *
 * The whole map surface is a link to directions — clicking the pin, or
 * anywhere around it, opens Google Maps directions and hands off to the
 * native app on mobile. That replaces a separate "Get directions" link
 * below the map: one target instead of two, and a far bigger one on
 * touch.
 *
 * The trade-off is that the map can't be panned or zoomed in place. For a
 * footer map whose job is "where is this, and take me there", that's the
 * right way round — anyone wanting to explore taps through to Maps
 * proper.
 *
 * The overlay stops short of the bottom strip so Google's logo and "Map
 * data" links stay clickable, as their embed terms require.
 *
 * Keyless `output=embed` endpoint: no API key, no billing, no consent
 * banner. Lazy-loaded, so it costs nothing until the footer is reached.
 * Their tiles are cool blue-grey, so a CSS filter shifts them into the
 * warm palette — filters are the only way to restyle a third-party frame.
 */
export function ClinicMap({ className = "" }: { className?: string }) {
  const src = MAPS.embedSrc;
  const name = SITE.clinicName || SITE.doctor;

  return (
    <div
      className={`group relative overflow-hidden rounded-[3px] border border-champagne/20 bg-espresso transition-colors duration-300 hover:border-champagne/45 ${className}`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {src ? (
          <iframe
            src={src}
            title={`Map showing ${name} in ${SITE.city}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            /* Explicit intrinsic size matters: Google's embed reads its
               dimensions once at load, and a lazy iframe is 0x0 until it
               scrolls in — without these it renders the map into a tiny
               corner box and never reflows. CSS still stretches it. */
            width={800}
            height={500}
            style={{ top: -CHIP_CROP, height: `calc(100% + ${CHIP_CROP}px)` }}
            className="absolute inset-x-0 w-full border-0 [filter:sepia(0.28)_saturate(0.85)_contrast(0.92)_brightness(1.04)_hue-rotate(-8deg)]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-espresso">
            <span className="text-[12px] font-medium uppercase tracking-[0.16em] text-champagne/45">
              {SITE.city}, {SITE.country}
            </span>
          </div>
        )}

        {/* Faint warm wash to tie the tiles to the palette. No blend modes:
            a cross-origin iframe composites in its own process, and a
            `mix-blend-*` layer over it makes the map fail to paint at all —
            it loads, reports the right size, and renders nothing. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgb(168 127 73 / 0.12) 0%, transparent 55%)",
          }}
        />

        <a
          href={MAPS.directions}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Get directions to ${name}`}
          className="absolute inset-x-0 top-0"
          style={{ bottom: ATTRIBUTION }}
        >
          {/* A gold wash on hover, so it's clear the map is clickable. */}
          <span
            aria-hidden
            className="absolute inset-0 bg-gold/0 transition-colors duration-300 group-hover:bg-gold/10"
          />
        </a>
      </div>
    </div>
  );
}
