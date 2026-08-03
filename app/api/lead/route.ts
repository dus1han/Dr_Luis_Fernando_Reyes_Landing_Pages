import { NextResponse } from "next/server";
import { type Lead, sendLeadEmail } from "@/lib/lead-mail";
import { leadSchema } from "@/lib/validation";

/**
 * Consultation request handler.
 *
 * Validated, spam-filtered, attributed to its Google Ads click, and emailed to
 * the clinic. Delivery lives in `lib/lead-mail.ts`; configuration is the SMTP_*
 * block in the container's `.env` — see `docs/deployment.md`.
 */

/** nodemailer opens a TCP socket, which the edge runtime has no API for. */
export const runtime = "nodejs";

/** Sub-2-second completions are automated, not human. */
const MIN_HUMAN_MS = 2000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_failed" },
      { status: 400 }
    );
  }

  const { company, elapsedMs, ...lead } = parsed.data satisfies Lead & {
    company?: string;
    elapsedMs?: number;
  };

  // Honeypot filled or form completed impossibly fast — accept the
  // request so the bot sees success, but drop it silently.
  if (company || (typeof elapsedMs === "number" && elapsedMs < MIN_HUMAN_MS)) {
    return NextResponse.json({ ok: true });
  }

  const receivedAt = new Date();

  /*
   * Logged BEFORE the send is attempted, and unconditionally.
   *
   * The email is the delivery mechanism, not the record. If the relay is down,
   * the mailbox is full or the credentials expired, this line is the only
   * remaining copy of a lead somebody paid for — and `docker logs` keeps three
   * 10MB files, so it survives a restart. Recovering a lead from a log is
   * unpleasant; not having it at all is worse.
   */
  console.info("[lead]", JSON.stringify({ ...lead, receivedAt: receivedAt.toISOString() }));

  try {
    const result = await sendLeadEmail(lead, receivedAt);

    if (!result.delivered) {
      /*
       * SMTP is not configured on this deployment. Answer the visitor
       * normally: they have done nothing wrong, the lead is in the log above,
       * and showing them an error would cost a conversion for what is an ops
       * gap. It is made visible where ops people actually look — the deploy
       * script warns on every run until SMTP_HOST/USER/PASS are set.
       */
      console.warn(
        "[lead] SMTP is not configured — lead logged only, no email sent."
      );
      return NextResponse.json({ ok: true });
    }

    console.info(`[lead] emailed ${result.to} (${result.messageId})`);
  } catch (error) {
    console.error("[lead] delivery failed", error);
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
