"use client";

import Image from "next/image";
import { Eyebrow } from "@/components/lp/Eyebrow";
import { ImageReveal } from "@/components/lp/ImageReveal";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { Reveal } from "@/components/lp/Reveal";
import { Section } from "@/components/lp/Section";
import { SHARED } from "@/lib/generated/images";
import { PROCEDURE } from "../content";

const surgery = SHARED["dr-surgery.jpg"];

export function Procedure() {
  return (
    <Section id="procedure" tone="ivory" padding="tight">
      <div className="shell grid items-center gap-[46px] lg:grid-cols-[1fr_0.86fr] lg:gap-[70px]">
        <div>
          <Eyebrow>{PROCEDURE.eyebrow}</Eyebrow>

          <MaskedHeading
            lines={[
              PROCEDURE.headline[0],
              <em key="a" className="accent">
                {PROCEDURE.headline[1]}
              </em>,
            ]}
            className="mb-9 font-display text-[clamp(32px,4.4vw,46px)] font-semibold leading-[1.12] tracking-[-0.01em] text-ink"
          />

          {PROCEDURE.body.map((p, i) => (
            <Reveal key={i} as="p" delay={0.08 * i} className="max-w-[54ch] text-body">
              {p}
            </Reveal>
          ))}

          <Reveal delay={0.2}>
            <blockquote className="m-0 mt-8 border-l-2 border-gold pl-6">
              <p className="m-0 font-display text-[21px] italic leading-[1.5] text-ink sm:text-[23px]">
                {PROCEDURE.quote}
              </p>
            </blockquote>
          </Reveal>
        </div>

        {/* The source photo is a tall 2:3 portrait. Left at its natural
            ratio it renders ~270px taller than the text beside it, which
            is what pushed this section past a single screen. Cropping to
            9:10 with object-cover keeps the surgeon centred and lets the
            two columns finish at roughly the same height. */}
        <ImageReveal
          curtain="bg-ivory"
          className="rounded-[3px] shadow-[0_40px_70px_-46px_rgb(35_27_22/0.6)]"
        >
          <div className="relative aspect-9/10 w-full">
            <Image
              src={surgery.src}
              alt="Dr. Luis Fernando Reyes operating under theatre lights"
              fill
              sizes="(max-width: 1024px) 92vw, 40vw"
              placeholder="blur"
              blurDataURL={surgery.blurDataURL}
              className="object-cover"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-espresso-deep/55 via-transparent to-transparent"
            />
            <p className="absolute inset-x-0 bottom-0 m-0 p-6 text-[13px] font-medium uppercase tracking-[0.14em] text-white/85">
              Every procedure performed by Dr. Luis personally
            </p>
          </div>
        </ImageReveal>
      </div>
    </Section>
  );
}
