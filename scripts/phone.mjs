// Build and serve the app on your Wi-Fi so you can open it on your phone.
// Usage: npm run phone
import { execSync, spawn } from "node:child_process";
import { networkInterfaces } from "node:os";

const PORT = process.env.PORT ?? "3000";
const ips = Object.values(networkInterfaces())
  .flat()
  .filter((n) => n && n.family === "IPv4" && !n.internal)
  .map((n) => n.address);

execSync("npx next build", { stdio: "inherit" });

console.log("\n  Open one of these on your phone (same Wi-Fi):");
for (const ip of ips) console.log(`   → http://${ip}:${PORT}`);
console.log("\n  Tip: Share → Add to Home Screen for a full-screen app.\n");

spawn("npx", ["next", "start", "-H", "0.0.0.0", "-p", PORT], { stdio: "inherit" });
