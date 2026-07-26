import type { ReactNode } from "react";

type Tone = "ivory" | "sand" | "espresso" | "espresso-deep";

const TONES: Record<Tone, string> = {
  ivory: "bg-ivory",
  sand: "bg-sand",
  espresso: "bg-espresso text-white/78",
  "espresso-deep": "bg-espresso-deep text-white/72",
};

/**
 * Vertical rhythm is a prop, not something to pass through `className`.
 * A `py-*` class in `className` sits alongside the one below at equal
 * specificity, so the winner is decided by stylesheet order rather than
 * attribute order — it silently does nothing about half the time.
 *
 * Exported so bands that can't use <Section> — ones needing a ref, or a
 * bespoke background stack — still draw from the same scale instead of
 * repeating the literals and drifting out of step.
 */
export const PADDING = {
  /** The page default. Every full band should use this unless it's short. */
  default: "py-[86px] sm:py-[100px]",
  /** For bands with little content, where the default reads as a gap. */
  tight: "py-[58px] sm:py-[68px]",
  none: "",
} as const;

type Props = {
  children: ReactNode;
  id?: string;
  tone?: Tone;
  className?: string;
  padding?: keyof typeof PADDING;
};

/** Consistent vertical rhythm + background tone for every band. */
export function Section({
  children,
  id,
  tone = "ivory",
  className = "",
  padding = "default",
}: Props) {
  return (
    <section id={id} className={`relative ${TONES[tone]} ${PADDING[padding]} ${className}`}>
      {children}
    </section>
  );
}

/** Centred heading block used at the top of most sections. */
export function SectionHead({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto mb-[54px] max-w-[64ch] text-center ${className}`}>
      {children}
    </div>
  );
}
