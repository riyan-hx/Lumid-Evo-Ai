import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { EarlyAccessFlow } from "@/components/early-access/flow";
import { findByCode } from "@/lib/early-access/server";

export const dynamic = "force-dynamic";

/** Email-link landing: the success screen with “You’re in.” and no confirm toast. */
export default async function Confirmed({ searchParams }: PageProps<"/early-access/confirmed">) {
  const { code } = await searchParams;
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const signup = typeof code === "string" ? await findByCode(code, origin).catch(() => null) : null;
  if (!signup) redirect("/early-access");
  return <EarlyAccessFlow confirmed={signup} />;
}
