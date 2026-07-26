"use client";

import Image from "next/image";
import { BeforeAfterSlider } from "@/components/lp/BeforeAfterSlider";
import { Eyebrow } from "@/components/lp/Eyebrow";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/lp/Reveal";
import { ButtonLink } from "@/components/lp/Button";
import { Section, SectionHead } from "@/components/lp/Section";
import { IMAGES } from "@/lib/generated/images";
import { SHOW_RESULTS_DISCLAIMER } from "@/lib/site";
import { RESULTS } from "../content";

const PAIRS = [1, 2, 3, 4, 5, 6].map((n) => IMAGES[`result-${n}.jpg` as keyof typeof IMAGES]);

const heroBefore = IMAGES["hero-before.jpg"];
const heroAfter = IMAGES["hero-after.jpg"];

const CAPTIONS = [
  "Female · frontal view",
  "Male · frontal view",
  "Female · frontal view",
  "Female · frontal view",
  "Female · profile view",
  "Female · profile view",
];

export function Results() {
  return (
    /* Ivory, because the candidate band ahead of it is now sand. */
    <Section id="results" tone="ivory" padding="tight">
      <div className="shell">
        <SectionHead>
          <Eyebrow center>{RESULTS.eyebrow}</Eyebrow>
          <MaskedHeading
            lines={[
              RESULTS.headline[0],
              <em key="a" className="accent">
                {RESULTS.headline[1]}
              </em>,
            ]}
            className="font-display text-[clamp(32px,4.4vw,46px)] font-semibold leading-[1.12] tracking-[-0.01em] text-ink"
          />
        </SectionHead>

        {/* Featured comparison — the one image on the page the visitor can
            actually operate, so it leads the proof section.
            Paired with the reading guide rather than centred alone: at
            500px in a 1220px shell it left ~360px empty either side. */}
        <div className="mb-14 grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <Reveal>
            <div className="mb-4 flex items-baseline justify-between border-b border-ink/16 pb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
              <span>Actual comparison</span>
              <span>Mid face &amp; jawline</span>
            </div>
            <BeforeAfterSlider
              before={heroBefore}
              after={heroAfter}
              beforeAlt="Front view of a patient's face before buccal fat removal, showing fullness through the mid face"
              afterAlt="The same patient after buccal fat removal, showing a more defined cheekbone and jawline"
              sizes="(max-width: 1024px) 92vw, 460px"
            />
          </Reveal>

          <div>
            <Reveal as="p" className="m-0 max-w-[52ch] text-[17.5px] leading-[1.75] text-body">
              {RESULTS.intro}
            </Reveal>

            <RevealGroup step={0.1} className="mt-9">
              {RESULTS.lookFor.map((l) => (
                <RevealItem
                  key={l.title}
                  className="border-t border-ink/12 py-5 last:border-b"
                >
                  <h3 className="mb-1.5 font-display text-[19px] leading-[1.3] text-ink">
                    {l.title}
                  </h3>
                  <p className="m-0 max-w-[54ch] text-[15.5px] leading-[1.6] text-muted">
                    {l.body}
                  </p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>

        <RevealGroup step={0.07} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PAIRS.map((img, i) => (
            <RevealItem key={img.src}>
              <figure className="group m-0 overflow-hidden rounded-[3px] bg-greige shadow-[0_20px_40px_-32px_rgb(35_27_22/0.5)]">
                <div className="relative overflow-hidden">
                  <Image
                    src={img.src}
                    alt={`Buccal fat removal before and after — ${CAPTIONS[i].toLowerCase()}`}
                    width={img.width}
                    height={img.height}
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                    placeholder="blur"
                    blurDataURL={img.blurDataURL}
                    className="h-auto w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
                  />
                  {/* Centre divider reinforces which half is which. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/55"
                  />
                  <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-[2px] bg-espresso-deep/58 px-2 py-1 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/92">
                    Before
                  </span>
                  <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-[2px] bg-gold/85 px-2 py-1 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white">
                    After
                  </span>
                </div>
                <figcaption className="bg-sand px-4 py-3 text-[12px] font-medium uppercase tracking-[0.13em] text-muted">
                  {CAPTIONS[i]}
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.12} className="mt-11 text-center">
          <ButtonLink href="#book" event="cta_click" eventLabel="results">
            See what&rsquo;s possible for your face
          </ButtonLink>
          {SHOW_RESULTS_DISCLAIMER && (
            <p className="mx-auto m-0 mt-6 max-w-[62ch] text-[13px] leading-[1.7] text-muted">
              {RESULTS.disclaimer}
            </p>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
