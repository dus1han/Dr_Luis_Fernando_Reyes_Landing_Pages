/**
 * Conversion-tracking verification.
 *
 * Drives a real browser against a running site and asserts the whole path:
 * click ID captured, form submits, thank-you page reached, `generate_lead`
 * pushed EXACTLY once, and — the two that matter and are normally skipped —
 * that a refresh and a direct visit fire nothing at all.
 *
 * Run it against the deployed URL, not just localhost:
 *   node scripts/verify-conversion.mjs http://127.0.0.1:3000
 *
 * Re-run after any change to the form or the thank-you page. A false
 * conversion is worse than a missing one: Google's bidding optimises toward
 * whatever it is told, so inflated counts spend the clinic's budget in the
 * wrong direction.
 *
 * Needs a Chrome and puppeteer-core. CHROME_PATH overrides the default.
 */
import puppeteer from "puppeteer-core";

const BASE = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/+$/, "");
const SLUG = "buccal-fat-removal";
const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

const LEAD_EVENT = "generate_lead";
const LEAD_FLAG = "reyes:lead-submitted";
const CLICK_ID_KEY = "reyes:click-id";

const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "  PASS" : "  FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

/** Every dataLayer push, captured from before any app code runs. */
async function recordDataLayer(page) {
  await page.evaluateOnNewDocument(() => {
    window.__pushes = [];
    const dl = (window.dataLayer = window.dataLayer || []);
    const push = dl.push.bind(dl);
    dl.push = (...args) => {
      window.__pushes.push(...args);
      return push(...args);
    };
  });
}

const leadEvents = (pushes) =>
  (pushes || []).filter((p) => p && p.event === LEAD_EVENT);

async function fillAndSubmit(page) {
  await page.type("#name", "Verification Test");
  await page.type("#phone", "+971555572547");
  await page.type("#email", "verify@example.com");
  await page.click("#consent");
  // The API drops anything completed in under 2s as automated, and it would
  // still return ok — so the redirect would happen while nothing was
  // delivered. Wait it out rather than testing a path real users never take.
  await new Promise((r) => setTimeout(r, 2400));

  await page.click('button[type="submit"]');

  /*
   * Poll the URL from Node rather than `Promise.all([waitForNavigation,
   * click])`. That pairing is racy: the submit is a `location.assign`, so the
   * navigation can complete before the watcher attaches, and then it waits for
   * a second navigation that never comes and times out on a form that worked
   * perfectly. Polling cannot miss a transition that already happened.
   *
   * `page.url()` is read from the browser, not from a page-context function,
   * so it survives the execution context being torn down mid-navigation.
   */
  const target = `/${SLUG}/thank-you`;
  for (let i = 0; i < 100; i++) {
    if (new URL(page.url()).pathname === target) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`never navigated to ${target} — still at ${page.url()}`);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--disable-gpu", "--no-sandbox"],
});

try {
  // ---------------------------------------------------------------- 1, 2
  console.log("\nClick ID capture");
  for (const [param, value] of [
    ["gclid", "TEST_GCLID_123"],
    ["wbraid", "TEST_WBRAID_456"],
  ]) {
    const page = await browser.newPage();
    await page.goto(`${BASE}/${SLUG}?${param}=${value}`, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });
    const stored = await page.evaluate(
      (k) => window.localStorage.getItem(k),
      CLICK_ID_KEY
    );
    const parsed = stored ? JSON.parse(stored) : null;
    check(
      `${param} captured and stored`,
      parsed?.param === param && parsed?.value === value,
      stored || "nothing stored"
    );
    const days = parsed ? Math.round((parsed.expires - Date.now()) / 86400000) : 0;
    if (param === "gclid") {
      check("stored for ~90 days", days >= 89 && days <= 90, `${days} days`);
    }
    await page.close();
  }

  // ---------------------------------------------------- 3, 4, 5, 6, 7, 10
  console.log("\nSubmission");
  const page = await browser.newPage();
  await recordDataLayer(page);

  const apiPayloads = [];
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (req.url().endsWith("/api/lead") && req.method() === "POST") {
      try {
        apiPayloads.push(JSON.parse(req.postData() || "{}"));
      } catch {
        apiPayloads.push({ unparseable: true });
      }
    }
    req.continue();
  });

  await page.goto(`${BASE}/${SLUG}?gclid=TEST_GCLID_789&utm_source=google`, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await fillAndSubmit(page);

  check(
    "submitting redirects to the thank-you page",
    new URL(page.url()).pathname === `/${SLUG}/thank-you`,
    page.url()
  );
  check(
    "click ID reached the API with the enquiry",
    apiPayloads[0]?.gclid === "TEST_GCLID_789",
    JSON.stringify({ gclid: apiPayloads[0]?.gclid, utm: apiPayloads[0]?.utm })
  );

  await new Promise((r) => setTimeout(r, 900));
  let pushes = await page.evaluate(() => window.__pushes || []);
  let events = leadEvents(pushes);
  check(`${LEAD_EVENT} pushed exactly once`, events.length === 1, `${events.length} time(s)`);
  check(
    "event carries form_name and form_location",
    events[0]?.form_name === "consultation_request" && events[0]?.form_location === SLUG,
    JSON.stringify(events[0] || null)
  );
  check(
    "one-time flag was cleared",
    (await page.evaluate((k) => window.sessionStorage.getItem(k), LEAD_FLAG)) === null
  );

  const metaRobots = await page.evaluate(
    () => document.querySelector('meta[name="robots"]')?.getAttribute("content") || ""
  );
  check(
    "thank-you page is noindex",
    metaRobots.includes("noindex"),
    metaRobots || "no robots meta"
  );

  // ------------------------------------------------------------------- 8
  console.log("\nThe two that matter");
  await page.reload({ waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 900));
  events = leadEvents(await page.evaluate(() => window.__pushes || []));
  check("a refresh fires nothing", events.length === 0, `${events.length} event(s)`);
  await page.close();

  // ------------------------------------------------------------------- 9
  const direct = await browser.newPage();
  await recordDataLayer(direct);
  await direct.goto(`${BASE}/${SLUG}/thank-you`, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await new Promise((r) => setTimeout(r, 900));
  events = leadEvents(await direct.evaluate(() => window.__pushes || []));
  check(
    "a direct visit to the thank-you URL fires nothing",
    events.length === 0,
    `${events.length} event(s)`
  );
  await direct.close();
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.pass);
console.log(
  `\n${results.length - failed.length}/${results.length} passed` +
    (failed.length ? `\nFAILED: ${failed.map((f) => f.name).join(", ")}` : "")
);
process.exit(failed.length ? 1 : 0);
