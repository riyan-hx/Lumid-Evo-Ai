// Usage: node scripts/shot.mjs <route> <out.png> [width] [height] [fullPage]
import { chromium } from "playwright-core";
const [route = "/", out = "shot.png", w = "393", h = "852", full = "0"] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto("http://localhost:3000" + route, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: out, fullPage: full === "1" });
if (errors.length) console.log("ERRORS:\n" + errors.join("\n"));
await browser.close();
