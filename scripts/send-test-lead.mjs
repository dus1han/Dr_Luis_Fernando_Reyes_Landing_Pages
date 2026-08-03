/**
 * Post one clearly-marked test lead at a running site and report what the API
 * did with it.
 *
 *   node scripts/send-test-lead.mjs                          # localhost:3000
 *   node scripts/send-test-lead.mjs https://surgery.luisfernandoreyesmd.com
 *   node scripts/send-test-lead.mjs <url> buccal-fat-removal
 *
 * ── POINT LEAD_TO AT YOURSELF FIRST ─────────────────────────────────────────
 * Against a configured deployment this sends a REAL email to whoever LEAD_TO
 * resolves to, which by default is the clinic. Set LEAD_TO to your own address
 * in .env, restart, test, then remove it. The name and email below are written
 * to be unmistakable if one escapes anyway.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Exercises the whole path — schema validation, the honeypot and timing gates,
 * page-name resolution, click-ID capture and the SMTP send — rather than any
 * one piece in isolation, because the parts that break in production are the
 * joins between them.
 */

const base = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/+$/, "");
const page = process.argv[3] || "buccal-fat-removal";

const lead = {
  name: "TEST LEAD — please ignore",
  phone: "+971 50 123 4567",
  email: "test-lead@example.com",
  consent: true,
  company: "",
  // Above MIN_HUMAN_MS in the route, or the lead is silently dropped as a bot
  // and the run reports a misleading success.
  elapsedMs: 5000,
  page,
  gclid: "TEST_GCLID_ignore_me",
  utm: { utm_source: "verification-script", utm_campaign: "smoke-test" },
};

const res = await fetch(`${base}/api/lead`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(lead),
});

const text = await res.text();
console.log(`POST ${base}/api/lead -> ${res.status}`);
console.log(text);

if (res.status === 200) {
  console.log(
    "\nAccepted. Note that a 200 does NOT prove an email was sent: with SMTP\n" +
      "unset the route logs the lead and answers normally by design. Confirm\n" +
      "which happened in the server log —\n" +
      "  docker compose logs web | grep '\\[lead\\]'\n" +
      "'emailed <recipients>' means it went out; 'SMTP is not configured'\n" +
      "means it did not."
  );
  process.exit(0);
}

if (res.status === 502) {
  console.error(
    "\nSMTP is configured but the send failed. The lead is still in the log.\n" +
      "The server log carries the underlying SMTP error; the usual causes are\n" +
      "a wrong app password, port 465 with secure disabled (or 587 with it\n" +
      "enabled), or the provider blocking the sender address."
  );
}

process.exit(1);
