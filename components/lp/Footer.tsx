import { SITE } from "@/lib/site";
import { GlowLogo } from "./GlowLogo";
import { ClinicMap } from "./ClinicMap";

const Phone = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z"
      fill="currentColor"
    />
  </svg>
);

const Mail = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="m3.6 6.5 8.4 6 8.4-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const Instagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
  </svg>
);

const Facebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M14.5 8.5h2.2V5.6h-2.6c-2.3 0-3.7 1.4-3.7 3.8v1.7H8.2v3h2.2V21h3.2v-6.9h2.3l.4-3h-2.7v-1.3c0-.9.3-1.3.9-1.3Z"
      fill="currentColor"
    />
  </svg>
);

const WhatsApp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2.1 22l5.35-1.4a9.8 9.8 0 0 0 4.59 1.17h.01c5.43 0 9.84-4.4 9.84-9.84 0-2.63-1.02-5.1-2.88-6.96A9.77 9.77 0 0 0 12.04 2Zm5.75 14.06c-.24.68-1.42 1.3-1.95 1.35-.5.05-1.13.07-1.82-.11a16.6 16.6 0 0 1-1.65-.61c-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.19-1.58-1.19-3.01 0-1.44.75-2.14 1.02-2.43.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2.02.9 2.16.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.16-.31.37-.44.5-.15.14-.3.3-.13.59.17.29.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.35 1.45.29.14.46.12.63-.07.17-.2.73-.85.92-1.14.19-.29.39-.24.65-.15.27.1 1.7.8 1.99.95.29.14.48.22.55.34.07.12.07.7-.17 1.38Z"
      fill="currentColor"
    />
  </svg>
);

const SOCIALS = [
  { href: SITE.instagram, label: "Instagram", Icon: Instagram },
  { href: SITE.facebook, label: "Facebook", Icon: Facebook },
  { href: SITE.whatsappHref, label: "WhatsApp", Icon: WhatsApp },
];

/** Same treatment on every column heading. */
function ColHead({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="m-0 mb-5 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne">
      {children}
    </h3>
  );
}

/**
 * Three columns: logo, contact + socials, map.
 *
 * The logo leads at the left because it's the mark people carry away, and
 * the glow gives it the weight to hold that position on its own.
 */
export function Footer() {
  return (
    /* No `grain` here: its ::after uses mix-blend-overlay, and a blend
       layer spanning a cross-origin iframe stops the map painting. The
       bloom below gives this band its depth instead. */
    /* No top padding here and no border on the element itself — the
       divider lives inside .shell below so it matches every other rule on
       the page, which all sit within the content column rather than
       running edge to edge. */
    <footer className="relative overflow-hidden bg-espresso-deep pb-[26px] text-white/62">
      {/* Matches the warm bloom on the booking band directly above, so the
          two dark sections read as one continuous close. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[6%] top-[10%] h-[38vw] max-h-[440px] w-[38vw] max-w-[440px] rounded-full opacity-30 blur-[90px]"
        style={{
          background: "radial-gradient(circle, rgb(168 127 73 / 0.5) 0%, transparent 70%)",
        }}
      />

      <div className="shell relative z-2">
        {/* Divider + top padding sit here rather than on the <footer> so
            the rule spans the content column, matching the disclaimer rule
            below and every other separator on the page. The booking band
            above is the same espresso-deep, so this line is what marks the
            boundary — without it the two just merge. */}
        <div className="border-t border-white/12 pt-[30px] sm:pt-[44px]">
          {/* Three columns, not four. A column holding only three social
              icons left a large hole beside the map — socials now sit under
              contact, and the map gets a full column to itself.

              items-center so the logo sits level with the middle of the two
              columns beside it rather than pinned to the top. */}
          <div className="grid items-center gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-[1.05fr_0.85fr_1.1fr]">
          {/* ---------- brand ---------- */}
          <div className="flex justify-center lg:justify-start">
            <GlowLogo width={288} />
          </div>

          {/* ---------- contact + socials ---------- */}
          <div>
            <ColHead>Contact</ColHead>

            <a
              href={SITE.phoneHref}
              className="group flex items-center gap-3 no-underline"
            >
              <span className="flex-none text-gold">
                <Phone />
              </span>
              <span className="font-display text-[20px] leading-[1.3] text-white transition-colors duration-300 group-hover:text-champagne">
                {SITE.phoneDisplay}
              </span>
            </a>

            <a
              href={SITE.emailHref}
              className="group mt-3 flex items-start gap-3 no-underline"
            >
              <span className="mt-0.5 flex-none text-gold">
                <Mail />
              </span>
              <span className="text-[14px] leading-[1.5] text-white/72 [overflow-wrap:anywhere] transition-colors duration-300 group-hover:text-champagne">
                {SITE.email}
              </span>
            </a>

            <div className="mt-9">
              <ColHead>Connect with us</ColHead>

              <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
                {SOCIALS.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="grid h-12 w-12 place-items-center rounded-full border border-champagne/22 text-champagne transition-colors duration-300 hover:border-champagne hover:bg-champagne hover:text-espresso-deep"
                    >
                      <Icon />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ---------- map ---------- */}
          {/* No "Get directions" link under it — the map itself is the
              link now, so there's one target instead of two. */}
          <div>
            <ColHead>Visit the clinic</ColHead>
            <ClinicMap />
          </div>
        </div>

          <div className="mt-10 border-t border-white/12 pt-6 text-center text-[12px] leading-[1.65] text-white/40">
            <p className="m-0">
              &copy; {new Date().getFullYear()} {SITE.doctor}
              <span className="mx-2 opacity-50">|</span>
              Designed and Developed by HolistiQ Digital
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
