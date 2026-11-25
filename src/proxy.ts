import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * evo.lumidai.in is the early-access site only. On that host:
 *  - `/` serves the early-access page (URL stays `/`, so share links like `/?ref=EVO-1234` just work)
 *  - `/early-access/*` and `/api/early-access/*` pass through
 *  - every other app route (home, chats, settings, …) is sent back to `/`
 * Other hosts (localhost, *.vercel.app previews) keep the full app. Static assets are excluded by the matcher.
 */
const EARLY_ACCESS_HOSTS = new Set(["evo.lumidai.in"]);

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  if (!EARLY_ACCESS_HOSTS.has(host)) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname === "/") return NextResponse.rewrite(new URL("/early-access", request.url));
  if (pathname.startsWith("/early-access") || pathname.startsWith("/api/early-access")) return NextResponse.next();
  return NextResponse.redirect(new URL("/", request.url), 307);
}

export const config = {
  // Skip Next internals and public files (orb, grain, fonts, icons, manifest).
  matcher: ["/((?!_next/|evo/|fonts/|icon|apple-icon|manifest|favicon|robots|sitemap).*)"],
};
