import { confirm } from "@/lib/early-access/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  let to = "/early-access";
  try {
    const code = await confirm(url.searchParams.get("token") ?? "", url.origin);
    if (code) to = `/early-access/confirmed?code=${encodeURIComponent(code)}`;
  } catch {
    /* fall through to the main page; the link can be tapped again */
  }
  return Response.redirect(new URL(to, url.origin), 302);
}
