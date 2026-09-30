// Walks every P0 flow on a phone-sized touch browser. Usage: node scripts/e2e.mjs http://<host>:<port>
import { chromium, devices } from "playwright-core";

const BASE = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ ...devices["iPhone 13"], defaultBrowserType: undefined });
const page = await ctx.newPage();
// Role names match exactly (e.g. the “Chat” tab, not “Continue chat”).
const byRole = page.getByRole.bind(page);
page.getByRole = (role, opts = {}) => byRole(role, { exact: true, ...opts });
const errors = [];
page.on("pageerror", (e) => errors.push(`${page.url()} :: ${e.message}`));
page.on("console", (m) => m.type() === "error" && !m.text().includes("vibrate") && errors.push(`${page.url()} :: ${m.text()}`));

let step = 0;
const ok = (msg) => console.log(`  ✓ ${String(++step).padStart(2, "0")} ${msg}`);
const path = () => new URL(page.url()).pathname + new URL(page.url()).search;
const tap = async (text, opts = {}) => {
  const el = page.getByText(text, { exact: true, ...opts }).first();
  await el.waitFor({ state: "visible", timeout: 8000 });
  await el.scrollIntoViewIfNeeded();
  await el.tap();
};
const expectPath = async (p) => {
  await page.waitForURL((u) => (u.pathname + u.search).startsWith(p), { timeout: 10000 });
  await page.waitForTimeout(500);
};

console.log("Onboarding → daily loop");
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await tap("Start with Evo"); await expectPath("/sign-in"); ok("Welcome → Sign in");
await tap("Send code"); await expectPath("/verify"); ok("Send code → Verify");
await page.locator("#otp").fill("123456"); await expectPath("/goals"); ok("6-digit code auto-submits → Goals");
await page.locator("#name").fill("Riyan");
await tap("Overthinking");
await tap("Continue"); await expectPath("/privacy"); ok("Goals → Privacy");
await page.getByRole("switch", { name: "Save voice recordings" }).tap();
await tap("I understand — continue"); await expectPath("/reminders"); ok("Privacy consent → Reminders");
await tap("Morning"); await page.getByRole("button", { name: "Sat" }).tap();
await tap("Not now"); await expectPath("/first-day"); ok("Reminders → First day");
if (!(await page.getByText("Riyan.").count())) throw new Error("Name not carried to First day");
ok("Name carried through onboarding");
await tap("Check in"); await expectPath("/check-in"); ok("First day → Check-in");
await tap("Okay");
const slider = page.getByRole("slider", { name: "Energy" });
await slider.scrollIntoViewIfNeeded();
const box = await slider.boundingBox();
await page.touchscreen.tap(box.x + box.width * 0.8, box.y + box.height / 2);
await page.getByText("Okay, some energy").waitFor({ timeout: 4000 }); ok("Mood + energy update the orb label");
await tap("Continue"); await expectPath("/chat?checkedIn=1"); ok("Check-in → Guided chat (skips ‘arriving’)");
await tap("I can’t make myself start"); ok("Picked what’s weighing");
await tap("Yes, that’s me"); ok("Insight confirmed");
await tap("Make a recovery plan"); ok("Recovery plan shown");
await tap("Start step 1"); await expectPath("/step-booked"); ok("Plan → Step booked");
await tap("Start now"); await expectPath("/focus"); ok("Step booked → Focus");
await page.getByRole("button", { name: "Pause" }).tap();
await page.getByText("Paused — take your time").waitFor(); ok("Focus pauses");
await tap("I did a bit — check in"); await expectPath("/wins"); ok("Focus → Your wins");
await tap("Week"); await page.getByText("things you started this week", { exact: false }).waitFor(); ok("Wins range switch");

console.log("Home, Ask Evo, tabs");
await page.goto(BASE + "/home", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Why?" }).tap();
await page.getByRole("dialog", { name: "Ask Evo" }).waitFor(); ok("Ask Evo sheet opens");
await page.getByRole("dialog").getByRole("button", { name: "Close" }).last().tap();
await page.getByRole("dialog").waitFor({ state: "detached" }); ok("Ask Evo sheet closes");
await tap("Tell me more"); await expectPath("/insight"); ok("Brief ‘Tell me more’ → Insight");
await tap("Yes, that’s me"); ok("Insight confirm on 04");
await page.goto(BASE + "/home", { waitUntil: "networkidle" });
await page.getByLabel("Message Evo").fill("exam next week, can’t start");
await page.getByRole("button", { name: "Send" }).tap();
await expectPath("/chat?checkedIn=1&q="); await page.getByText("exam next week, can’t start").waitFor(); ok("Home composer → chat with message");
await page.goto(BASE + "/home", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Chat" }).tap(); await expectPath("/chats"); ok("Tab → Chats");
await page.getByLabel("Search chats").fill("vent"); await page.getByText("Just venting").waitFor(); ok("Chats search");
await page.getByRole("button", { name: "Settings" }).tap(); await expectPath("/settings"); ok("Tab → Settings");
await page.getByRole("button", { name: "Home" }).tap(); await expectPath("/home"); ok("Tab → Home");

console.log("Settings, memory, delete");
await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
await tap("What Evo remembers"); await expectPath("/settings/memory"); ok("Settings → What Evo remembers");
await page.getByRole("button", { name: "Forget" }).first().tap();
await page.getByText("Forgotten.").waitFor(); ok("Forget shows Undo toast");
await tap("Undo"); await page.getByText("Exams make starting hard — Maths most of all.").waitFor(); ok("Undo restores memory");
await page.getByRole("button", { name: "Edit" }).first().tap();
await page.locator("textarea").fill("Maths is the hardest to start.");
await tap("Save"); await page.getByText("Maths is the hardest to start.").waitFor(); ok("Edit memory");
await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
await tap("Delete account"); await page.getByRole("dialog", { name: "Delete account" }).waitFor(); ok("Delete sheet opens");
await page.getByRole("dialog").getByRole("button", { name: "Delete account" }).dispatchEvent("click"); await page.waitForTimeout(400);
if (!path().startsWith("/settings")) throw new Error("Delete fired without typing DELETE");
ok("Delete blocked until DELETE typed");
await page.getByRole("dialog").locator("input").fill("delete");
await page.getByRole("dialog").getByRole("button", { name: "Delete account" }).tap();
await expectPath("/"); ok("Typed DELETE → account reset → Welcome");

console.log("Safety");
await page.goto(BASE + "/chat", { waitUntil: "networkidle" });
await page.getByLabel("Message Evo").fill("i want to die");
await page.getByRole("button", { name: "Send" }).tap();
await expectPath("/safety"); await page.getByText("i want to die").waitFor(); ok("Risky message → Safety moment");
await tap("I’m not sure"); await page.getByText("Breathe with Evo — 1 min").waitFor(); ok("‘I’m not sure’ offers calm");
await tap("I might hurt myself"); await expectPath("/crisis"); ok("‘I might hurt myself’ → Crisis");
if ((await page.locator('a[href="tel:14416"]').count()) < 1 || (await page.locator('a[href="tel:112"]').count()) < 1) throw new Error("Missing tel: links");
ok("Crisis has tel:14416 and tel:112");
await tap("Breathe with Evo"); await expectPath("/calm"); ok("Crisis → Calm space");
await page.getByText("Hold", { exact: true }).last().waitFor(); await page.waitForTimeout(4300);
await page.getByText("Hold", { exact: true }).first().waitFor(); ok("Breathing advances In → Hold");
await tap("Done"); await expectPath("/home"); ok("Calm Done → Home");
await page.goto(BASE + "/safety", { waitUntil: "networkidle" });
await tap("I’m safe — just really low"); await expectPath("/chat?mode=venting");
await page.getByText("no plans, no pressure", { exact: false }).waitFor(); ok("‘I’m safe’ → supportive venting chat");

console.log("Offline");
await page.goto(BASE + "/chat?checkedIn=1", { waitUntil: "networkidle" });
await ctx.setOffline(true);
await page.getByText("You’re offline. Messages send when you’re back.").waitFor(); ok("Offline banner appears");
await ctx.setOffline(false);
await page.getByText("You’re offline. Messages send when you’re back.").waitFor({ state: "detached" }); ok("Banner hides when back online");
await page.goto(BASE + "/offline", { waitUntil: "networkidle" });
await tap("Tap to retry"); await page.waitForTimeout(1500);
if (await page.getByText("Tap to retry").count()) throw new Error("Retry did not send");
ok("Failed message retries");

for (const r of ["/voice", "/notifications", "/manifest.webmanifest", "/icon.png", "/apple-icon.png"]) {
  const res = await page.request.get(BASE + r);
  if (!res.ok()) throw new Error(`${r} → ${res.status()}`);
}
ok("Voice, notifications, manifest and icons resolve");

await browser.close();
if (errors.length) {
  console.log("\nConsole errors:\n" + errors.join("\n"));
  process.exit(1);
}
console.log(`\nAll ${step} checks passed.`);
