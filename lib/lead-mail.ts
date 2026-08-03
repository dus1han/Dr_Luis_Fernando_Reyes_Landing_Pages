import nodemailer, { type Transporter } from "nodemailer";
import { PAGES } from "@/lib/pages";
import { SITE } from "@/lib/site";
import type { LeadInput } from "@/lib/validation";

/**
 * Consultation requests, delivered to the clinic by email.
 *
 * **SMTP rather than a provider SDK, on purpose.** Every credential here is a
 * *runtime* value read from the container's environment, so changing the
 * mailbox, the password or the recipients is an edit to `.env` on the VPS and
 * a `docker compose up -d` — no rebuild, no redeploy, no CI run. A provider
 * SDK would work equally well but locks the clinic to one vendor; SMTP is the
 * one interface Gmail, Zoho, Brevo, Resend and a self-hosted relay all speak,
 * so switching provider later is four lines in `.env`.
 *
 * Contrast with `SITE_URL` in `lib/site-url.ts`, which genuinely *is* baked in
 * at build time because the pages are statically prerendered. Nothing in this
 * file is — the API route is dynamic and reads the environment per request.
 */

/** What the route hands over: the validated lead minus the anti-bot fields. */
export type Lead = Omit<LeadInput, "company" | "elapsedMs">;

export type DeliveryResult =
  | { delivered: true; messageId: string; to: string }
  | { delivered: false; reason: "not_configured" };

/**
 * Where leads go.
 *
 * Not secret — these are the clinic's own published-ish addresses, and keeping
 * them in the repo means the default is reviewable in a diff rather than
 * hidden in an untracked file on one server. `LEAD_TO` overrides at runtime
 * for the day someone needs to add or redirect a recipient in a hurry.
 */
const DEFAULT_RECIPIENTS = [
  "drluisfernandomarketing@gmail.com",
  "luisfernandoreyesmd@yahoo.com",
] as const;

type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  to: string;
};

/**
 * Read per call, not at module load.
 *
 * `next build` evaluates module scope while collecting route metadata, so a
 * config object built at the top level would be assembled from the *build*
 * environment and frozen there — the exact trap `SITE_URL` documents, and the
 * one that would make a correct `.env` on the server appear to do nothing.
 */
function readConfig(): MailConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;

  // Partial configuration is treated as none. Connecting with a host but no
  // credentials fails per-lead at send time, which is a worse place to find
  // out than the startup warning this produces instead.
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT?.trim() || 587);

  return {
    host,
    port,
    /*
     * 465 is implicit TLS — the socket is encrypted before the greeting.
     * 587 and 25 open in plaintext and STARTTLS up, which nodemailer does
     * automatically. Setting `secure: true` on 587 hangs until the socket
     * timeout with no useful error, so it is derived rather than configured.
     */
    secure: port === 465,
    user,
    pass,
    /*
     * Most providers reject, rewrite, or spam-file a From that is not the
     * authenticated mailbox — Gmail silently rewrites it. Defaulting to the
     * SMTP user is the behaviour that works everywhere; MAIL_FROM is there
     * for providers that permit a verified alias.
     */
    from: process.env.MAIL_FROM?.trim() || user,
    to: process.env.LEAD_TO?.trim() || DEFAULT_RECIPIENTS.join(", "),
  };
}

/** True when the environment can actually send. Used by the health check. */
export function isMailConfigured(): boolean {
  return readConfig() !== null;
}

/*
 * One transporter, reused across requests.
 *
 * Rebuilding it per lead reopens the TCP connection and redoes the TLS
 * handshake and SMTP AUTH every time — several hundred milliseconds added to
 * a request the visitor is waiting on, for nothing. Keyed on the config so an
 * edited `.env` and a container restart cannot leave a stale connection
 * pointing at the old host.
 */
let cached: { key: string; transporter: Transporter } | null = null;

function getTransporter(config: MailConfig): Transporter {
  const key = `${config.host}:${config.port}:${config.user}`;
  if (cached?.key === key) return cached.transporter;

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },

    /*
     * Without these, an unreachable SMTP host leaves the request hanging on
     * the OS default connect timeout — well over a minute — while the visitor
     * watches a spinner and, reasonably, leaves. Ten seconds is long enough
     * for a slow relay and short enough that the form's "please call instead"
     * fallback appears while they are still on the page.
     */
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  cached = { key, transporter };
  return transporter;
}

/** Strip CR/LF before anything reaches a header. */
const header = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Lead fields are attacker-controlled and go straight into an HTML body. */
const esc = (value: string) => value.replace(/[&<>"']/g, (c) => ESCAPES[c]);

/**
 * The page's human name, for the subject line.
 *
 * Resolved through the page registry so the clinic reads "Buccal Fat Removal"
 * rather than "buccal-fat-removal", and so pages 2–4 need no change here. An
 * unrecognised slug falls back to the slug itself rather than to a generic
 * label — knowing which page produced an unexpected lead is worth more than a
 * tidy subject.
 */
function pageName(slug: string | undefined): string {
  if (!slug) return "Website";
  return PAGES.find((p) => p.slug === slug)?.title ?? slug;
}

/**
 * A wa.me link for the number the visitor typed, or null.
 *
 * The clinic works WhatsApp-first, so a one-tap link from the notification
 * email removes the retype-the-number step that every lead otherwise costs.
 *
 * Deliberately conservative: `wa.me` needs a full international number, and a
 * link that opens a chat with the *wrong* person is worse than no link. Only
 * two shapes are accepted — an international number, and the local UAE mobile
 * format, which is unambiguous. Anything else and the email shows the number
 * as plain text for the clinic to dial themselves.
 */
export function whatsappLink(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);

  // 05X XXX XXXX — a UAE mobile typed the way people type it locally.
  if (digits.length === 10 && digits.startsWith("05")) {
    digits = `971${digits.slice(1)}`;
  }

  if (digits.length < 10 || digits.length > 15) return null;
  return `https://wa.me/${digits}`;
}

/** Dubai time, because that is the clock the clinic calls back on. */
function stamp(at: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    dateStyle: "full",
    timeStyle: "short",
  }).format(at);
}

/**
 * Google Ads attribution, flattened for display.
 *
 * Included in the email rather than kept only in the API log because the
 * click ID is what an offline-conversion import needs, and the person who
 * eventually runs that import is reading the clinic's inbox, not
 * `docker logs`.
 */
function attributionRows(lead: Lead): Array<[string, string]> {
  const rows: Array<[string, string]> = [];
  if (lead.gclid) rows.push(["gclid", lead.gclid]);
  if (lead.wbraid) rows.push(["wbraid", lead.wbraid]);
  if (lead.gbraid) rows.push(["gbraid", lead.gbraid]);
  for (const [k, v] of Object.entries(lead.utm ?? {})) rows.push([k, v]);
  return rows;
}

export function buildSubject(lead: Lead): string {
  return header(`[${pageName(lead.page)}] New consultation request — ${lead.name}`);
}

function buildText(lead: Lead, at: Date): string {
  const wa = whatsappLink(lead.phone);
  const attribution = attributionRows(lead);

  const lines = [
    `New consultation request from ${pageName(lead.page)}`,
    "",
    `Name:   ${lead.name}`,
    `Phone:  ${lead.phone}${wa ? `  (${wa})` : ""}`,
    `Email:  ${lead.email}`,
    "",
    `Page:      /${lead.page ?? "unknown"}`,
    `Received:  ${stamp(at)} (Dubai)`,
    `Consent:   given on the form`,
  ];

  if (attribution.length) {
    lines.push("", "Ad attribution:");
    for (const [k, v] of attribution) lines.push(`  ${k}: ${v}`);
  }

  lines.push(
    "",
    "Reply to this email to answer the patient directly.",
    `— ${SITE.doctor}, ${SITE.city}`
  );

  return lines.join("\n");
}

function buildHtml(lead: Lead, at: Date): string {
  const wa = whatsappLink(lead.phone);
  const attribution = attributionRows(lead);

  /*
   * Table layout and inline styles, which is not how the rest of this repo is
   * written — but an email client is not a browser. Gmail strips <style>
   * blocks in some contexts, Outlook renders through Word, and neither
   * supports grid or flex reliably. This is the shape that survives both.
   */
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:7px 14px 7px 0;color:#7b6f66;font-size:13px;white-space:nowrap;vertical-align:top;">${esc(label)}</td>
      <td style="padding:7px 0;color:#231b16;font-size:15px;font-weight:600;">${value}</td>
    </tr>`;

  const attributionBlock = attribution.length
    ? `<tr><td colspan="2" style="padding-top:18px;">
         <div style="border-top:1px solid #e6ded4;padding-top:14px;color:#7b6f66;font-size:12px;">
           <strong style="color:#231b16;">Ad attribution</strong><br>
           ${attribution
             .map(([k, v]) => `${esc(k)}: <code>${esc(v)}</code>`)
             .join("<br>")}
         </div>
       </td></tr>`
    : "";

  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f6f1ea;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fffdfa;border:1px solid #e6ded4;border-radius:4px;">
    <tr><td style="padding:26px 28px 8px;">
      <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a87f49;font-weight:700;">New consultation request</div>
      <div style="margin-top:6px;font-size:21px;font-weight:600;color:#231b16;">${esc(pageName(lead.page))}</div>
    </td></tr>
    <tr><td style="padding:10px 28px 26px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
        ${row("Name", esc(lead.name))}
        ${row(
          "Phone",
          `<a href="tel:${esc(lead.phone.replace(/[^\d+]/g, ""))}" style="color:#231b16;text-decoration:none;">${esc(lead.phone)}</a>` +
            (wa
              ? ` &nbsp;<a href="${esc(wa)}" style="color:#a87f49;font-size:13px;font-weight:600;">Open WhatsApp &rarr;</a>`
              : "")
        )}
        ${row("Email", `<a href="mailto:${esc(lead.email)}" style="color:#231b16;">${esc(lead.email)}</a>`)}
        ${row("Received", `<span style="font-weight:400;color:#4a4038;">${esc(stamp(at))} (Dubai)</span>`)}
        ${row("Page", `<span style="font-weight:400;color:#4a4038;">/${esc(lead.page ?? "unknown")}</span>`)}
        ${attributionBlock}
      </table>
      <p style="margin:22px 0 0;font-size:12.5px;line-height:1.6;color:#7b6f66;">
        Replying to this email answers the patient directly. They confirmed on
        the form that the clinic may contact them.
      </p>
    </td></tr>
  </table>
</body></html>`;
}

/**
 * Send one lead notification.
 *
 * Returns `{ delivered: false, reason: "not_configured" }` rather than
 * throwing when SMTP is unset, so a preview deployment and local development
 * both keep working — the route logs the lead and answers the visitor
 * normally. A genuine send failure throws, because that is a fault the
 * visitor should be told about: the form's error state offers the clinic's
 * number, which is a better outcome than a silent black hole.
 */
export async function sendLeadEmail(
  lead: Lead,
  at: Date = new Date()
): Promise<DeliveryResult> {
  const config = readConfig();
  if (!config) return { delivered: false, reason: "not_configured" };

  const info = await getTransporter(config).sendMail({
    from: `"${header(SITE.doctor)} — website" <${config.from}>`,
    to: config.to,
    subject: buildSubject(lead),
    /*
     * The patient's own address, so the clinic can hit Reply and answer them
     * without copying anything out. It is validated as an email by Zod before
     * reaching here, so it cannot carry a header injection.
     */
    replyTo: `"${header(lead.name)}" <${lead.email}>`,
    text: buildText(lead, at),
    html: buildHtml(lead, at),
  });

  return { delivered: true, messageId: info.messageId, to: config.to };
}
