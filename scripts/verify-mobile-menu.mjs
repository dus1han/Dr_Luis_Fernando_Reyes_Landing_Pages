/**
 * Mobile menu behaviour, measured in a real browser at a real phone viewport.
 *
 *   npm run build && npm run start
 *   node scripts/verify-mobile-menu.mjs [url] [page-slug]
 *
 * Needs a Chrome and puppeteer-core. CHROME_PATH overrides the default.
 *
 * The check that matters is #4: selecting an option must close the menu AND
 * land on the section. Every link here is a same-page anchor, so there is no
 * route change to hang a "close on navigate" on — the menu closes because the
 * click handler closes it, and the scroll only works if the body scroll lock
 * is released synchronously rather than in a passive effect. Both halves have
 * to be asserted together, or a menu that closes onto the wrong scroll
 * position still passes.
 */
import puppeteer from "puppeteer-core";

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/+$/, "");
const SLUG = process.argv[3] || "buccal-fat-removal";
const URL = `${BASE}/${SLUG}`;

const TRIGGER = "header button[aria-controls]";
const PANEL = '[role="dialog"][aria-modal="true"]';

let passed = 0;
let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "  ok  " : "FAIL  "}${name}${detail ? ` — ${detail}` : ""}`);
  ok ? passed++ : failed++;
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

const open = async () => {
  await page.$eval(TRIGGER, (el) => el.click());
  await page.waitForSelector(PANEL, { visible: true, timeout: 4000 });
};
const panelGone = () =>
  page.waitForFunction((s) => !document.querySelector(s), { timeout: 4000 }, PANEL);

const state = () =>
  page.evaluate(
    (t, p) => ({
      expanded: document.querySelector(t)?.getAttribute("aria-expanded"),
      panel: !!document.querySelector(p),
      bodyOverflow: getComputedStyle(document.body).overflow,
      scrollY: Math.round(window.scrollY),
    }),
    TRIGGER,
    PANEL
  );

await page.goto(URL, { waitUntil: "networkidle2" });

/* 1 — the trigger exists and is visible on a phone */
check(
  "trigger visible at 390px",
  await page.$eval(TRIGGER, (el) => el.getBoundingClientRect().width > 0)
);
check("starts collapsed", (await state()).expanded === "false");

/* 2 — opening */
await open();
{
  const s = await state();
  check("opens", s.panel && s.expanded === "true");
  check("locks background scroll", s.bodyOverflow === "hidden", s.bodyOverflow);
}

/* 3 — the panel paints above the sticky CTA bar, which is a sibling at z-70 */
check(
  "covers the sticky CTA bar",
  await page.evaluate(() => {
    const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight - 30);
    return !!el?.closest('[role="dialog"], .fixed');
  })
);

/* 4 — THE FIX: selecting an option closes the menu and lands on the section */
{
  const target = await page.$eval(`${PANEL} nav a`, (a) => a.getAttribute("href"));
  await page.$eval(`${PANEL} nav a`, (a) => a.click());
  await panelGone();
  await new Promise((r) => setTimeout(r, 1200)); // smooth scroll settles

  const s = await state();
  check("selecting an option closes the menu", !s.panel && s.expanded === "false");
  check("background scroll released", s.bodyOverflow !== "hidden", s.bodyOverflow);

  const landed = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"));
    return { top: Math.round(el.getBoundingClientRect().top), navH };
  }, target);

  check(
    `page scrolled to ${target}`,
    s.scrollY > 200 && landed && landed.top >= -4 && landed.top <= landed.navH + 40,
    landed ? `section top ${landed.top}px, nav ${landed.navH}px, scrollY ${s.scrollY}` : "target missing"
  );
  check("focus returned to the trigger", await page.evaluate((t) => document.activeElement === document.querySelector(t), TRIGGER));
}

/* 5 — Escape */
await open();
await page.keyboard.press("Escape");
await panelGone();
check("Escape closes", !(await state()).panel);

/* 6 — backdrop */
await open();
await page.$eval('[aria-label="Close menu"][tabindex="-1"]', (el) => el.click());
await panelGone();
check("backdrop tap closes", !(await state()).panel);

/* 7 — back button, which changes the hash with no click at all */
await open();
await page.goBack();
await panelGone();
check("browser back closes", !(await state()).panel);

/* 8 — focus trap: Tab from the last item must not escape the panel */
await open();
{
  const escaped = await page.evaluate(async (p) => {
    const items = [...document.querySelectorAll(`${p} a, ${p} button`)];
    items[items.length - 1]?.focus();
    return !document.activeElement?.closest(p);
  }, PANEL);
  check("focus starts inside the panel", !escaped);
  await page.keyboard.press("Tab");
  check(
    "Tab is trapped in the panel",
    await page.evaluate((p) => !!document.activeElement?.closest(p), PANEL)
  );
}

/* 9 — rotating to a wide viewport must not strand an open panel */
await page.setViewport({ width: 1200, height: 800 });
await panelGone();
{
  const s = await state();
  check("widening past lg closes", !s.panel);
  check("scroll released after widening", s.bodyOverflow !== "hidden", s.bodyOverflow);
}

/* 10 — at desktop width the links are inline and the trigger is gone */
await page.reload({ waitUntil: "networkidle2" });
check(
  "trigger hidden at 1200px",
  await page.$eval(TRIGGER, (el) => el.getBoundingClientRect().width === 0)
);
check(
  "inline nav links visible at 1200px",
  await page.$$eval("header nav a", (as) =>
    as.filter((a) => a.getBoundingClientRect().width > 0).length >= 4
  )
);

await browser.close();
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
