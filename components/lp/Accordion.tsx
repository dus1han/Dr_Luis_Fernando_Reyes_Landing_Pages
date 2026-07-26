"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { EASE_OUT_SOFT } from "@/lib/motion";
import { track } from "@/lib/analytics";

export type QA = { q: string; a: string };

/**
 * Single-open accordion. Height animates from `auto`, and the panel
 * stays in the DOM only while open so long answers never bloat the
 * initial paint.
 *
 * Everything starts collapsed. An answer expanded on arrival pushes the
 * rest of the list down the page and makes the section look longer than
 * it is — the point of the list is that a visitor can scan the questions
 * and open only what applies to them.
 *
 * Search engines are unaffected: the page emits its FAQ answers as
 * `FAQPage` structured data from the same source array, independent of
 * what's open.
 */
export function Accordion({
  items,
  /** Index to start expanded. Leave unset for all collapsed. */
  defaultOpen = null,
}: {
  items: QA[];
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const baseId = useId();

  return (
    <div className="mx-auto max-w-[850px] border-t border-ink/12">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;

        return (
          <div key={item.q} className="border-b border-ink/12">
            <h3 className="m-0">
              <button
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => {
                  const next = isOpen ? null : i;
                  setOpen(next);
                  if (next !== null) track("faq_open", { label: item.q });
                }}
                className="flex w-full cursor-pointer items-start justify-between gap-6 bg-transparent px-0 py-[22px] text-left font-display text-[19px] leading-[1.45] font-semibold text-ink transition-colors duration-250 hover:text-gold sm:text-[20.5px]"
              >
                <span>{item.q}</span>
                <span
                  aria-hidden
                  className={`relative mt-[9px] block h-[13px] w-[13px] flex-none text-gold transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? "rotate-135" : ""
                  }`}
                >
                  <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-current" />
                  <span className="absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 bg-current" />
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.42, ease: EASE_OUT_SOFT }}
                  className="overflow-hidden"
                >
                  <p className="m-0 max-w-[70ch] pb-[26px] pr-8 text-[16.5px] leading-[1.78] text-body">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
