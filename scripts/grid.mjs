// Side-by-side screenshots of several routes. Usage: node scripts/grid.mjs <w> <h> <out.png> <route>...
import { chromium } from "playwright-core";
const [w, h, out, ...routes] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
const shots = [];
for (const r of routes) {
  await p.goto("http://localhost:3000" + r, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  shots.push({ r, img: (await p.screenshot()).toString("base64") });
}
const g = await b.newPage({ viewport: { width: 1600, height: 1000 } });
await g.setContent(`<body style="margin:0;display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#333">${shots.map((s) => `<div style="position:relative"><img style="width:100%;display:block" src="data:image/png;base64,${s.img}"><b style="position:absolute;top:4px;left:50%;background:#000;color:#fff;font:14px sans-serif;padding:2px 6px">${s.r}</b></div>`).join("")}</body>`);
await g.screenshot({ path: out, fullPage: true });
console.log(errors.join("\n"));
await b.close();
