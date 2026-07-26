"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { IMAGES } from "@/lib/generated/images";
import { SITE } from "@/lib/site";

const logo = IMAGES["logo-white.png"];

/**
 * The clinic logo with a slow gold halo breathing behind it.
 *
 * Two layers: a wide diffuse bloom that swells, and a tighter core that
 * brightens slightly out of phase. Independent cycles stop it reading as
 * a single throbbing blob.
 *
 * Sits behind the mark, never over it — the wordmark is thin white type
 * and anything on top of it costs legibility.
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
        className="pointer-events-none absolute -inset-x-12 -inset-y-10 rounded-full blur-[38px]"
        style={{
          background:
            "radial-gradient(circle, rgb(200 160 99 / 0.42) 0%, rgb(168 127 73 / 0.16) 45%, transparent 72%)",
        }}
        animate={reduced ? undefined : { opacity: [0.45, 0.95, 0.45], scale: [0.92, 1.08, 0.92] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -inset-x-4 -inset-y-3 rounded-full blur-[20px]"
        style={{
          background:
            "radial-gradient(circle, rgb(237 223 198 / 0.34) 0%, transparent 68%)",
        }}
        animate={reduced ? undefined : { opacity: [0.3, 0.75, 0.3] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: -1.6 }}
      />

      <Image
        src={logo.src}
        alt={`${SITE.doctor} — ${SITE.practice}`}
        width={logo.width}
        height={logo.height}
        style={{ width }}
        className="relative h-auto"
      />
    </div>
  );
}
