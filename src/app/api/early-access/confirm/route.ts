import { confirm } from "@/lib/early-access/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = confirm(url.searchParams.get("token") ?? "");
  const to = code ? `/early-access/confirmed?code=${code}` : "/early-access";
  return Response.redirect(new URL(to, url.origin), 302);
}
