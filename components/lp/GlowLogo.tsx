"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { SHARED } from "@/lib/generated/images";
import { SITE } from "@/lib/site";

/* The light variant: white type, gold monogram kept. This component only
   ever sits on espresso — the footer and the root index. */
const logo = SHARED["logo-light.png"];

/**
 * The clinic logo with a slow gold halo breathing behind it.
 *
 * Two layers: a wide diffuse bloom that swells, and a tighter core that
 * brightens slightly out of phase. Independent cycles stop it reading as
 * a single throbbing blob.
 *
 * Sits behind the mark, never over it — the wordmark is thin white type
 * and anything on top of it costs legibility.
 *
 * **Both layers are gradients, not blurred shapes, and must stay that way.**
 * They used to be 38px and 20px blur utilities over simpler gradients.
 * (Written out rather than quoted as class names on purpose: Tailwind scans
 * comments too, and naming them here was enough to keep emitting both dead
 * utilities into the stylesheet.)
 * That is the expensive version of the same picture: a filter has to be
 * rasterised, and the outer layer animates `scale` forever, so the browser
 * re-rasterised the blur on every frame of a loop that never ends — in the
 * footer of every page on the site.
 *
 * The extra colour stops below are the blur, baked in. Opacity and scale on
 * a plain gradient are composited and cost essentially nothing.
 */
export function GlowLogo({
  width = 200,
  className = "",
}: {
  width?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -inset-x-12 -inset-y-10 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgb(200 160 99 / 0.42) 0%, rgb(200 160 99 / 0.3) 22%, rgb(168 127 73 / 0.16) 45%, rgb(168 127 73 / 0.06) 62%, transparent 80%)",
        }}
        animate={reduced ? undefined : { opacity: [0.45, 0.95, 0.45], scale: [0.92, 1.08, 0.92] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -inset-x-4 -inset-y-3 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgb(237 223 198 / 0.34) 0%, rgb(237 223 198 / 0.2) 28%, rgb(237 223 198 / 0.08) 50%, transparent 74%)",
        }}
        animate={reduced ? undefined : { opacity: [0.3, 0.75, 0.3] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: -1.6 }}
      />

      <Image
        src={logo.src}
        alt={`${SITE.doctor} — ${SITE.practice}`}
        width={logo.width}
        height={logo.height}
        /* Follows the `width` prop rather than the file, for the reason
           given on the nav lockup. */
        sizes={`${width}px`}
        style={{ width }}
        className="relative h-auto"
      />
    </div>
  );
}
