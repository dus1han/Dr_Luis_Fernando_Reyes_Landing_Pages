"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { leadSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { LEAD_FLAG, track } from "@/lib/analytics";
import { readClickId } from "@/lib/click-id";
import { SITE } from "@/lib/site";
import { Button } from "./Button";

/**
 * Label sits inside the field, above the input, so each field is one
 * compact block instead of a label plus a gap plus a box. Saves roughly
 * 22px per field without shrinking the tap target.
 */
const fieldWrap =
  "group rounded-[2px] border-[1.5px] bg-white px-3.5 pb-2 pt-2 " +
  "transition-[border-color,box-shadow] duration-250 " +
  "focus-within:border-gold focus-within:shadow-[0_0_0_3px_rgb(168_127_73/0.14)]";

const inputBase =
  "w-full border-0 bg-transparent p-0 font-sans text-[16px] leading-[1.5] text-ink " +
  "outline-none placeholder:text-[#bdb1a6]";

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2.5">
      <div className={`${fieldWrap} ${error ? "border-danger" : "border-ink/18"}`}>
        <label
          htmlFor={htmlFor}
          className="mb-0.5 block text-[10.5px] font-semibold uppercase tracking-[0.13em] text-muted"
        >
          {label}
        </label>
        {children}
      </div>
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="m-0 mt-1 text-[12.5px] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The page's primary conversion.
 *
 * Three fields and a consent box, nothing else. Preferred time, procedure
 * interest and a free-text message were all cut: the clinic calls back to
 * gather that anyway, so each one was costing completions and buying
 * nothing a two-minute phone call doesn't.
 *
 * Validation runs client-side for instant feedback and again on the
 * server, sharing one Zod schema.
 */
export function LeadForm({ pageSlug }: { pageSlug: string }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  /* No "sent" state: success is a navigation, not a render. The button
     stays disabled on "sending" while the browser tears the page down. */
  const [status, setStatus] = useState<"idle" | "sending" | "failed">("idle");
  const [started, setStarted] = useState(false);

  const mountedAt = useRef(Date.now());
  const attribution = useRef<Record<string, unknown>>({});

  /**
   * Attribution for the submission.
   *
   * The click ID comes from the **store**, not from this page's URL. It is
   * captured on arrival by `<ClickIdCapture>` in the root layout and kept for
   * 90 days, so someone who lands on an ad, leaves, and returns days later to
   * enquire still submits attributably — reading `window.location` here would
   * lose exactly those considered conversions.
   *
   * UTMs stay URL-scoped: they describe this visit, and a stale campaign tag
   * attached to a later direct visit would be worse than none.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    params.forEach((v, k) => {
      if (k.startsWith("utm_")) utm[k] = v.slice(0, 200);
    });

    const clickId = readClickId();

    attribution.current = {
      // Keyed by which parameter it arrived as: gclid, wbraid and gbraid are
      // not interchangeable to an offline-conversion import.
      ...(clickId ? { [clickId.param]: clickId.value } : {}),
      utm: Object.keys(utm).length ? utm : undefined,
    };
  }, []);

  const onFirstInput = () => {
    if (started) return;
    setStarted(true);
    track("form_start", { label: pageSlug });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const parsed = leadSchema.safeParse({
      name: fd.get("name") ?? "",
      phone: fd.get("phone") ?? "",
      email: fd.get("email") ?? "",
      consent: fd.get("consent") === "on",
      company: (fd.get("company") as string) || "",
      elapsedMs: Date.now() - mountedAt.current,
      ...attribution.current,
      page: pageSlug,
    });

    if (!parsed.success) {
      const fieldErrors = toFieldErrors(parsed.error);
      setErrors(fieldErrors);
      setStatus("idle");
      track("form_error", { label: Object.keys(fieldErrors).join(",") });
      // Move focus to the first problem so keyboard/AT users aren't stranded.
      document.getElementById(Object.keys(fieldErrors)[0])?.focus();
      return;
    }

    setErrors({});
    setStatus("sending");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error(String(res.status));

      track("form_submit", { label: pageSlug });

      /*
       * Flag first, then navigate. The thank-you page reads this once,
       * clears it, and only then reports the conversion — so a refresh, a
       * back-navigation or a shared link fires nothing.
       *
       * `assign`, not a client-side router push: a full navigation
       * guarantees a clean document and a single unambiguous page view for
       * the tag to observe. That matters the day someone switches the
       * conversion action to a URL rule and expects it to work.
       */
      try {
        window.sessionStorage.setItem(LEAD_FLAG, "1");
      } catch {
        // Storage blocked. Still navigate — the visitor gets their
        // confirmation; only the conversion report is lost, which is the
        // right way round.
      }
      window.location.assign(`/${pageSlug}/thank-you`);
      // Status stays "sending" so the button remains disabled while the
      // browser tears this page down.
    } catch {
      setStatus("failed");
      track("form_error", { label: "network" });
    }
  }

  return (
    /* Rotating conic gradient clipped to a 1.5px ring: the square spins
       inside an overflow-hidden shell and the opaque card covers the
       middle, leaving a band of gold travelling round the edge. Cheaper
       and smoother than animating a border colour, and it draws the eye
       to the form without moving anything the visitor is reading. */
    <div
      id="formCard"
      className="relative overflow-hidden rounded-[4px] p-[1.5px] shadow-[0_36px_70px_-46px_rgb(0_0_0/0.8)]"
    >
      <motion.span
        aria-hidden
        className="absolute left-1/2 top-1/2 aspect-square w-[145%] -translate-x-1/2 -translate-y-1/2 motion-reduce:hidden"
        style={{
          background:
            "conic-gradient(from 0deg," +
            " rgb(168 127 73 / 0.25) 0deg," +
            " rgb(200 160 99 / 0.95) 30deg," +
            " rgb(237 223 198 / 0.9) 55deg," +
            " rgb(168 127 73 / 0.3) 95deg," +
            " rgb(168 127 73 / 0.22) 360deg)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      />
      {/* Static ring for reduced motion, so the edge never looks unfinished. */}
      <span
        aria-hidden
        className="absolute inset-0 hidden rounded-[4px] bg-gold/40 motion-reduce:block"
      />

      <div className="relative rounded-[3px] bg-ivory p-[26px] sm:p-[30px]">
      {/* No success branch here any more. Submitting navigates to
          /<slug>/thank-you, which is a real page load — a modal gave a
          URL-based conversion rule nothing to hang on, no shareable
          confirmation, and nothing to screenshot for the clinic. */}
        <h3 className="mb-1 font-display text-[23px] leading-[1.25] text-ink sm:text-[26px]">
          Request your consultation
        </h3>
        <p className="mb-5 text-[14px] leading-[1.55] text-muted">
          Three details is all it takes. The clinic will call you back to
          arrange a time that suits you.
        </p>

        <form onSubmit={handleSubmit} onInput={onFirstInput} noValidate>
          {/* Bot trap — off-screen, never focusable, must stay empty. */}
          <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
            <label htmlFor="company">Company</label>
            <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <Field label="Full name" htmlFor="name" error={errors.name}>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={inputBase}
            />
          </Field>

          <Field label="Phone" htmlFor="phone" error={errors.phone}>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+971 __ ___ ____"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className={inputBase}
            />
          </Field>

          <Field label="Email" htmlFor="email" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={inputBase}
            />
          </Field>

          <div className="mb-4 mt-3.5">
            {/* The input is nested, so the association is implicit —
                adding htmlFor as well double-associates it and can
                toggle the box twice on a single click. */}
            <label className="flex items-start gap-2.5 text-[13.5px] leading-[1.55] text-body">
              <input
                id="consent"
                name="consent"
                type="checkbox"
                className="mt-[3px] h-[18px] w-[18px] flex-none accent-gold"
                aria-invalid={!!errors.consent}
                aria-describedby={errors.consent ? "consent-error" : undefined}
              />
              <span>
                I agree to be contacted by the clinic about my consultation
                request.
              </span>
            </label>
            {errors.consent && (
              <p id="consent-error" role="alert" className="m-0 mt-1.5 text-[13px] font-medium text-danger">
                {errors.consent}
              </p>
            )}
          </div>

          <Button type="submit" size="block" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Request my consultation"}
          </Button>

          {status === "failed" && (
            <p role="alert" className="m-0 mt-3 text-center text-[13.5px] font-medium text-danger">
              Something went wrong sending your request. Please{" "}
              <a href={SITE.contactHref} className="underline underline-offset-2">
                call {SITE.contactDisplay}
              </a>{" "}
              or try again.
            </p>
          )}

          <p className="m-0 mt-3 text-center text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
            Private &amp; confidential &middot; No obligation
          </p>
        </form>
      </div>
    </div>
  );
}
