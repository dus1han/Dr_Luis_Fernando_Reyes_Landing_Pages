"use client";

import { CountUp } from "@/components/lp/CountUp";
import { RevealGroup, RevealItem } from "@/components/lp/Reveal";
import { STATS } from "../content";

/** Credibility band directly under the hero — the first proof point. */
export function Stats() {
  return (
    <section className="grain bg-espresso">
      <RevealGroup
        step={0.11}
        className="shell grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        {STATS.map((s, i) => (
          <RevealItem
            key={s.label}
            className={`px-2 py-[30px] text-center sm:py-[38px] ${
              // Hairlines between cells, matched to how many columns show.
              i > 0 ? "border-t border-champagne/18 sm:border-t-0" : ""
            } ${i % 2 === 1 ? "sm:border-l sm:border-champagne/18" : ""} ${
              i >= 2 ? "sm:border-t sm:border-champagne/18 lg:border-t-0" : ""
            } ${i > 0 ? "lg:border-l lg:border-champagne/18" : ""}`}
          >
            <b className="block font-display text-[38px] font-semibold leading-none text-champagne sm:text-[44px]">
              {s.display ? (
                s.display
              ) : (
                <CountUp value={s.value} prefix={s.prefix ?? ""} suffix={s.suffix ?? ""} />
              )}
            </b>
            <span className="mt-2.5 block text-[12.5px] font-medium uppercase tracking-[0.16em] text-white/62">
              {s.label}
            </span>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
