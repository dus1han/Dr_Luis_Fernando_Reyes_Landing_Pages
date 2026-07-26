import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/validation";

/**
 * Consultation request handler.
 *
 * ── TO GO LIVE ──────────────────────────────────────────────────────
 * Validation, spam filtering and Google Ads attribution capture are
 * already done. The only thing left is delivery — implement `deliver()`
 * below with whichever channel you choose (clinic email, WhatsApp
 * handoff, Google Sheet, CRM webhook). Until then every lead is logged
 * to the server console so nothing is silently lost in testing.
 * ────────────────────────────────────────────────────────────────────
 */

/** Sub-2-second completions are automated, not human. */
const MIN_HUMAN_MS = 2000;

async function deliver(lead: Record<string, unknown>) {
  // TODO(delivery): replace this with the chosen destination, e.g.
  //   await fetch(process.env.LEAD_WEBHOOK_URL!, { method: "POST", body: JSON.stringify(lead) })
  console.info("[lead]", JSON.stringify(lead));
}

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

  const { company, elapsedMs, ...lead } = parsed.data;

  // Honeypot filled or form completed impossibly fast — accept the
  // request so the bot sees success, but drop it silently.
  if (company || (typeof elapsedMs === "number" && elapsedMs < MIN_HUMAN_MS)) {
    return NextResponse.json({ ok: true });
  }

  try {
    await deliver({ ...lead, receivedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[lead] delivery failed", error);
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
