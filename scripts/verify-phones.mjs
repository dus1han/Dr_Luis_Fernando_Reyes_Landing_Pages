/**
 * Lists every tel: and wa.me link per route, with its number, container and
 * rel — so the two-number split can be checked without trusting a grep.
 *
 *   node scripts/verify-phones.mjs http://127.0.0.1:3000 [page-slug]
 *
 * Raw-HTML grepping overcounts: Next’s RSC payload repeats every string and
 * the JSON-LD adds another. This queries the DOM.
 */
import puppeteer from "puppeteer-core";

const B = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/+$/, "");
const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

/**
 * Digits only, so a display-format change doesn't break the labelling.
 *
 * The clinic runs ONE number now, for calls and WhatsApp alike. The old
 * voice line is still listed so this doubles as a regression check: if
 * "RETIRED 55…" ever appears in the output, a hardcoded number has crept
 * back in somewhere.
 */
const NUMBERS = [
  { digits: "971566636359", label: "CLINIC 56…" },
  { digits: "971555572547", label: "RETIRED 55…" },
];

const b = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--disable-gpu", "--hide-scrollbars", "--no-sandbox"],
});
const SLUG=process.argv[3] || "buccal-fat-removal";
for (const [route,mob] of [[`/${SLUG}`,false],[`/${SLUG}`,true],["/",false],[`/${SLUG}/thank-you`,false],["/nope",false]]) {
  const p=await b.newPage();
  await p.setViewport({width:mob?390:1440,height:mob?844:900,isMobile:mob,hasTouch:mob});
  await p.goto(B+route,{waitUntil:"networkidle2",timeout:60000});
  if(mob){ await p.evaluate(()=>scrollTo(0,900)); await new Promise(r=>setTimeout(r,700)); }
  const out=await p.evaluate(()=>{
    const rows=[...document.querySelectorAll('a[href^="tel:"], a[href*="wa.me"]')].map(a=>{
      const inNav=!!a.closest("header,nav"), inFooter=!!a.closest("footer");
      const fixed=getComputedStyle(a.closest("div")||a).position;
      return { href:a.getAttribute("href").split("?")[0],
        text:(a.textContent||a.getAttribute("aria-label")||"").trim().slice(0,34),
        where: inFooter?"footer":inNav?"nav":(a.closest('[class*="fixed"]')?"sticky":"body"),
        target:a.getAttribute("target")||"-", rel:a.getAttribute("rel")||"-" };
    });
    const jsonld=[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>JSON.parse(s.textContent));
    const tel=jsonld.flatMap(g=>(g["@graph"]||[]).map(n=>n.telephone).filter(Boolean));
    return {rows, schemaTelephone:tel};
  });
  console.log(`\n=== ${route}${mob?"  [mobile]":""} ===`);
  for(const r of out.rows){
    const num = (NUMBERS.find((n) => r.href.includes(n.digits)) || { label: "UNKNOWN" }).label;
    console.log(`  ${r.where.padEnd(7)} ${num.padEnd(9)} ${r.href.padEnd(28)} target=${r.target} rel=${r.rel==="-"?"-":"ok"}  "${r.text}"`);
  }
  if(out.schemaTelephone.length) console.log(`  schema telephone: ${out.schemaTelephone.join(", ")}`);
  await p.close();
}
await b.close();
