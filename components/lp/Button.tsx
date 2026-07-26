"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { track, type TrackEvent } from "@/lib/analytics";

type Variant = "gold" | "outline" | "light" | "ghost";

const BASE =
  "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden " +
  "rounded-[2px] font-sans text-[13.5px] font-semibold uppercase tracking-[0.09em] " +
  "transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTS: Record<Variant, string> = {
  gold: "bg-gold text-white hover:bg-espresso",
  outline:
    "border-[1.5px] border-ink/30 bg-transparent text-ink hover:border-espresso hover:bg-espresso hover:text-white",
  light:
    "border-[1.5px] border-champagne/45 bg-transparent text-champagne hover:border-champagne hover:bg-champagne hover:text-espresso-deep",
  ghost: "bg-transparent text-ink hover:text-gold",
};

const SIZES = {
  md: "px-[34px] py-[17px]",
  sm: "px-[26px] py-[13px] text-[12.5px]",
  block: "w-full px-[34px] py-[19px] text-[14px]",
} as const;

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: keyof typeof SIZES;
  className?: string;
  /** Fires on click so every CTA is measurable without extra wiring. */
  event?: TrackEvent;
  eventLabel?: string;
};

/** A light sweep that crosses the button on hover. */
function Sheen() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/22 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-full motion-reduce:hidden"
    />
  );
}

export function ButtonLink({
  children,
  variant = "gold",
  size = "md",
  className = "",
  event,
  eventLabel,
  onClick,
  href,
  ...rest
}: Props & ComponentProps<typeof Link>) {
  const external = typeof href === "string" && /^(https?:|tel:|mailto:)/.test(href);

  return (
    <Link
      href={href}
      {...(external ? { target: href.startsWith("http") ? "_blank" : undefined, rel: "noopener noreferrer" } : {})}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      onClick={(e) => {
        if (event) track(event, { label: eventLabel });
        onClick?.(e);
      }}
      {...rest}
    >
      <Sheen />
      <span className="relative z-1 inline-flex items-center gap-2.5">{children}</span>
    </Link>
  );
}

export function Button({
  children,
  variant = "gold",
  size = "md",
  className = "",
  event,
  eventLabel,
  onClick,
  ...rest
}: Props & ComponentProps<"button">) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      onClick={(e) => {
        if (event) track(event, { label: eventLabel });
        onClick?.(e);
      }}
      {...rest}
    >
      <Sheen />
      <span className="relative z-1 inline-flex items-center gap-2.5">{children}</span>
    </button>
  );
}
