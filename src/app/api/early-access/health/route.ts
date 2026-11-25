import { config } from "@/lib/early-access/notify";
import { getStore, memoryAllowed } from "@/lib/early-access/store";

export const dynamic = "force-dynamic";

/** Configuration check. Reports which backends are wired and pings the database. Never returns secrets. */
export async function GET() {
  const store = getStore();
  let db: "ok" | "error" = "ok";
  try {
    await store.ping();
  } catch {
    db = "error";
  }
  const { sheet, email } = config();
  const storageReady = store.kind !== "memory" ? db === "ok" : memoryAllowed();
  return Response.json(
    {
      ok: storageReady,
      storage: store.kind,
      db,
      persistent: store.kind !== "memory",
      sheet_mirror: sheet,
      confirm_email: email ? "resend" : sheet ? "apps-script (if SEND_CONFIRM_EMAIL=true)" : "log only",
      warnings: [
        ...(store.kind === "memory" ? ["Using in-memory storage — registrations are lost on restart. Set BLOB_READ_WRITE_TOKEN or SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY."] : []),
        ...(!email && !sheet ? ["No email sender configured — people cannot confirm. Set RESEND_API_KEY + EMAIL_FROM, or enable the Apps Script mailer."] : []),
      ],
    },
    { status: storageReady ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}
