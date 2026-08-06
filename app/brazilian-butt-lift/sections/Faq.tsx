"use client";

import { Accordion } from "@/components/lp/Accordion";
import { ButtonLink } from "@/components/lp/Button";
import { Eyebrow } from "@/components/lp/Eyebrow";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { Reveal } from "@/components/lp/Reveal";
import { Section, SectionHead } from "@/components/lp/Section";
import { SITE } from "@/lib/site";
import { FAQ } from "../content";

export function Faq() {
  return (
    <Section id="faq" tone="ivory" padding="tight">
      <div className="shell">
        <SectionHead>
          <Eyebrow center>{FAQ.eyebrow}</Eyebrow>
          <MaskedHeading
            lines={[
              FAQ.headline[0],
              <em key="a" className="accent">
                {FAQ.headline[1]}
              </em>,
            ]}
            className="font-display text-[clamp(32px,4.4vw,46px)] font-semibold leading-[1.12] tracking-[-0.01em] text-ink"
          />
        </SectionHead>

        <Reveal>
          <Accordion items={FAQ.items} />
        </Reveal>

        <Reveal delay={0.1} className="mt-12 text-center">
          <p className="m-0 mb-5 text-[16px] text-muted">
            Still have a question? Speak to the clinic directly.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <ButtonLink
              href={SITE.whatsappHref}
              variant="outline"
              event="whatsapp_click"
              eventLabel="faq"
            >
              Message on WhatsApp
            </ButtonLink>
            <ButtonLink href={SITE.phoneHref} event="call_click" eventLabel="faq">
              Call the clinic
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
