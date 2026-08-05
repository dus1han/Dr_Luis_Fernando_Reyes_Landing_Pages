/**
 * Reviews carousel + modal verification.
 *
 *   node scripts/verify-reviews.mjs http://127.0.0.1:3000 [page-slug]
 *
 * The checks that matter are "does not auto-scroll" and the real-coordinate
 * click on Read more. The section used to auto-scroll, which made every
 * control inside it a moving target — unclickable on touch, where there is
 * no hover to pause it. Both are asserted so that cannot come back quietly.
 */
import puppeteer from "puppeteer-core";
const B=(process.argv[2] || "http://127.0.0.1:3000").replace(/\/+$/,"");
const SLUG=process.argv[3] || "buccal-fat-removal";
const b=await puppeteer.launch({executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",headless:"new",args:["--disable-gpu","--hide-scrollbars","--no-sandbox"]});
const fail=[];
const ok=(n,p,d="")=>{ if(!p) fail.push(n); console.log(`${p?"  PASS":"  FAIL"}  ${n}${d?` — ${d}`:""}`); };

for (const [w,h,mob,tag] of [[1440,900,false,"desktop"],[390,844,true,"mobile"]]) {
  const p=await b.newPage();
  await p.setViewport({width:w,height:h,deviceScaleFactor:1,isMobile:mob,hasTouch:mob});
  await p.goto(`${B}/${SLUG}`,{waitUntil:"networkidle2",timeout:90000});
  const top=await p.evaluate(()=>document.getElementById("reviews").getBoundingClientRect().top+scrollY);
  for(let y=0;y<=top-200;y+=350){await p.evaluate(v=>scrollTo(0,v),y);await new Promise(r=>setTimeout(r,110));}
  await p.evaluate(v=>scrollTo(0,v),Math.max(0,top-200));
  await new Promise(r=>setTimeout(r,1500));
  console.log(`\n=== ${tag} ===`);

  const m=await p.evaluate(()=>{
    const s=document.getElementById("reviews");
    const cards=[...s.querySelectorAll("[data-review-card]")];
    const hs=cards.map(c=>Math.round(c.getBoundingClientRect().height));
    return { section:Math.round(s.getBoundingClientRect().height), n:cards.length,
      heights:hs, allEqual:new Set(hs).size===1,
      readMore:s.querySelectorAll("figure button").length,
      prevDisabled:s.querySelectorAll("button[aria-label='Previous reviews']")[0]?.disabled,
      nextDisabled:s.querySelectorAll("button[aria-label='More reviews']")[0]?.disabled,
      scrollLeft:s.querySelector("[role='group']")?.scrollLeft };
  });
  ok("cards all the same height", m.allEqual, m.heights.join(", "));
  ok("prev disabled at start", m.prevDisabled===true);
  ok("next enabled at start", m.nextDisabled===false);
  console.log(`   section ${m.section}px, ${m.n} cards, ${m.readMore} Read more buttons`);

  // nothing moves on its own
  const before=await p.evaluate(()=>document.querySelector("#reviews [role='group']").scrollLeft);
  await new Promise(r=>setTimeout(r,2500));
  const after=await p.evaluate(()=>document.querySelector("#reviews [role='group']").scrollLeft);
  ok("does not auto-scroll", before===after, `${before} -> ${after}`);

  // next advances, prev returns
  await p.evaluate(()=>document.querySelector("#reviews button[aria-label='More reviews']").click());
  await new Promise(r=>setTimeout(r,900));
  const adv=await p.evaluate(()=>document.querySelector("#reviews [role='group']").scrollLeft);
  ok("next advances the row", adv>before, `${before} -> ${adv}`);
  await p.evaluate(()=>document.querySelector("#reviews button[aria-label='Previous reviews']").click());
  await new Promise(r=>setTimeout(r,900));
  const back=await p.evaluate(()=>document.querySelector("#reviews [role='group']").scrollLeft);
  ok("prev returns", back<adv, `${adv} -> ${back}`);

  // Read more opens the dialog — click it as a user would, at its coordinates
  // The full text of the card we are about to open, so the dialog is
  // compared against its own source rather than a magic number.
  const cardText=await p.evaluate(()=>document.querySelector("#reviews figure blockquote p").textContent.trim());
  const btn=await p.$("#reviews figure button");
  await btn.click();
  await new Promise(r=>setTimeout(r,600));
  const d=await p.evaluate(()=>{
    const dl=document.querySelector("dialog");
    return dl?{open:dl.open, text:dl.querySelector("blockquote p")?.textContent?.trim(), chars:dl.querySelector("blockquote p")?.textContent?.length,
      focusInside:dl.contains(document.activeElement), bodyOverflow:document.body.style.overflow}:null;
  });
  ok("Read more opens the dialog (real click, not dispatched)", d?.open===true);
  ok("dialog shows the full quote, verbatim", d?.text===cardText, `${d?.chars} chars, matches card: ${d?.text===cardText}`);
  ok("focus moved into the dialog", d?.focusInside===true);
  ok("page behind is locked", d?.bodyOverflow==="hidden");

  await p.keyboard.press("Escape");
  await new Promise(r=>setTimeout(r,500));
  const closed=await p.evaluate(()=>({dialog:!!document.querySelector("dialog"), overflow:document.body.style.overflow}));
  ok("Escape closes it", closed.dialog===false);
  ok("scroll lock released", closed.overflow==="");
  await p.close();
}
await b.close();
console.log(fail.length?`\nFAILED: ${fail.join(", ")}`:"\nall checks passed");
process.exit(fail.length?1:0);
