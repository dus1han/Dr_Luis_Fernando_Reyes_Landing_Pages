"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { track } from "@/lib/analytics";

type ImageAsset = {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
};

type Props = {
  before: ImageAsset;
  after: ImageAsset;
  beforeAlt: string;
  afterAlt: string;
  /** Load eagerly when the slider is above the fold. */
  priority?: boolean;
  /** Must match the rendered container width, or the browser over-fetches. */
  sizes?: string;
  className?: string;
};

const START = 55;

/**
 * Drag-to-compare before/after.
 *
 * On first view it performs a single slow sweep so users understand it
 * is interactive without needing a caption — the sweep aborts the
 * instant a real pointer or key arrives so it never fights the user.
 */
export function BeforeAfterSlider({
  before,
  after,
  beforeAlt,
  afterAlt,
  priority = false,
  sizes = "(max-width: 1000px) 92vw, 46vw",
  className = "",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(START);
  const [dragging, setDragging] = useState(false);
  const [demoed, setDemoed] = useState(false);

  const visible = useInView(wrapRef, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();

  // Refs so the rAF loop can bail without being re-created each render.
  const userTookOver = useRef(false);
  const reported = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, next)));
  }, []);

  const claim = useCallback(() => {
    userTookOver.current = true;
    if (!reported.current) {
      reported.current = true;
      track("slider_interact", { label: "results_before_after" });
    }
  }, []);

  /** Teaching sweep: right → left → rest, once, on first view. */
  useEffect(() => {
    if (!visible || demoed || reduced) return;
    setDemoed(true);

    const KEYFRAMES = [
      { to: 88, ms: 900 },
      { to: 18, ms: 1400 },
      { to: START, ms: 800 },
    ];

    let frame = 0;
    let leg = 0;
    let from = START;
    let legStart = 0;
    const hold = 620; // let the hero settle before moving

    const run = (now: number) => {
      if (userTookOver.current) return;
      if (!legStart) legStart = now + hold;
      if (now < legStart) {
        frame = requestAnimationFrame(run);
        return;
      }

      const { to, ms } = KEYFRAMES[leg];
      const t = Math.min(1, (now - legStart) / ms);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setPos(from + (to - from) * eased);

      if (t >= 1) {
        from = to;
        leg += 1;
        legStart = now;
        if (leg >= KEYFRAMES.length) return;
      }
      frame = requestAnimationFrame(run);
    };

    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [visible, demoed, reduced]);

  /** Pointer drag, tracked on window so it survives leaving the frame. */
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => setFromClientX(e.clientX);
    const up = () => setDragging(false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, setFromClientX]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 3;
    if (e.key === "ArrowLeft") {
      claim();
      setPos((p) => Math.max(0, p - step));
    } else if (e.key === "ArrowRight") {
      claim();
      setPos((p) => Math.min(100, p + step));
    } else if (e.key === "Home") {
      claim();
      setPos(0);
    } else if (e.key === "End") {
      claim();
      setPos(100);
    } else {
      return;
    }
    e.preventDefault();
  };

  return (
    <div className={className}>
      <div
        ref={wrapRef}
        role="slider"
        tabIndex={0}
        aria-label="Before and after comparison. Use the arrow keys to reveal more of each image."
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-valuetext={`${Math.round(pos)}% before, ${100 - Math.round(pos)}% after`}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          claim();
          setDragging(true);
          setFromClientX(e.clientX);
        }}
        className="relative w-full cursor-ew-resize touch-none select-none overflow-hidden rounded-[3px] bg-greige shadow-[0_30px_60px_-38px_rgb(35_27_22/0.55)]"
        style={{ aspectRatio: `${before.width} / ${before.height}` }}
      >
        {/* AFTER sits underneath, fully painted. */}
        <Image
          src={after.src}
          alt={afterAlt}
          fill
          sizes={sizes}
          placeholder="blur"
          blurDataURL={after.blurDataURL}
          priority={priority}
          className="object-cover"
          draggable={false}
        />

        {/* BEFORE is clipped to the handle position. */}
        <div
          className="absolute inset-0 will-change-[clip-path]"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <Image
            src={before.src}
            alt={beforeAlt}
            fill
            sizes={sizes}
            placeholder="blur"
            blurDataURL={before.blurDataURL}
            priority={priority}
            className="object-cover"
            draggable={false}
          />
        </div>

        {/* Corner captions fade out as the divider passes over them. */}
        <span
          className="pointer-events-none absolute left-4 top-4 rounded-[2px] bg-espresso-deep/62 px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/92 backdrop-blur-[2px] transition-opacity duration-300"
          style={{ opacity: pos < 22 ? 0 : 1 }}
        >
          Before
        </span>
        <span
          className="pointer-events-none absolute right-4 top-4 rounded-[2px] bg-espresso-deep/62 px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/92 backdrop-blur-[2px] transition-opacity duration-300"
          style={{ opacity: pos > 78 ? 0 : 1 }}
        >
          After
        </span>

        {/* Divider + handle. */}
        <div
          className="pointer-events-none absolute inset-y-0 z-2 w-px bg-white/85 shadow-[0_0_14px_rgb(0_0_0/0.35)] will-change-transform"
          style={{ left: `${pos}%` }}
        >
          <span
            className={`absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/92 text-espresso shadow-[0_6px_20px_rgb(0_0_0/0.28)] transition-transform duration-200 ${
              dragging ? "scale-[1.12]" : ""
            }`}
          >
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden>
              <path d="M6 1 1 6l5 5M14 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>

      <p className="m-0 mt-3.5 text-center text-[12.5px] font-medium uppercase tracking-[0.14em] text-muted">
        Drag to compare
      </p>
    </div>
  );
}
