import { signup, type SignupInput } from "@/lib/early-access/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let input: SignupInput;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "invalid_email" }, { status: 422 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  try {
    const { status, body } = await signup(input, ip, new URL(request.url).origin);
    return Response.json(body, { status, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "server_error" }, { status: 500, headers: { "cache-control": "no-store" } });
  }
}
