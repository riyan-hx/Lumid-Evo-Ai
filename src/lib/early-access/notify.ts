import "server-only";
import type { Row } from "./store";

/**
 * Side effects after a signup / confirmation. Both are best-effort: a failure is logged and never blocks
 * the visitor (the row is already saved in the store).
 *
 *  - Google Sheet mirror: POST to an Apps Script web app (see google/apps-script.gs).
 *  - Confirmation email: Resend (RESEND_API_KEY + EMAIL_FROM). If unset, the Apps Script can send it
 *    (SEND_CONFIRM_EMAIL = true). If neither is set, the confirm link is only logged.
 */

const sheetUrl = () => process.env.GOOGLE_SHEET_WEBHOOK_URL;

async function post(url: string, body: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000), redirect: "follow" });
  if (!res.ok) throw new Error(`${new URL(url).host} ${res.status}`);
  return res;
}

const confirmUrl = (origin: string, r: Row) => `${origin}/api/early-access/confirm?token=${r.token}`;

export async function mirrorToSheet(action: "signup" | "confirm", r: Row, origin: string) {
  const url = sheetUrl();
  if (!url) return;
  try {
    const res = await post(url, {
      secret: process.env.GOOGLE_SHEET_SECRET ?? "",
      action,
      email: r.email,
      spot: r.spot,
      code: r.code,
      excuse_id: r.excuseId,
      ref: r.ref,
      utm_source: r.utm.source,
      utm_campaign: r.utm.campaign,
      confirm_url: action === "signup" ? confirmUrl(origin, r) : undefined,
    });
    const out = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (out.ok === false) throw new Error(`sheet: ${out.error}`);
  } catch (e) {
    console.error("[early-access] sheet mirror failed:", e instanceof Error ? e.message : e);
  }
}

export async function sendConfirmEmail(r: Row, origin: string) {
  const link = confirmUrl(origin, r);
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.info(`[early-access] confirm link for ${r.email}: ${link}`);
    return;
  }
  try {
    await post(
      `${process.env.RESEND_API_URL ?? "https://api.resend.com"}/emails`,
      {
        from,
        to: r.email,
        subject: "Confirm your spot on the Evo early-access list",
        html: `<div style="font-family:Inter,Arial,sans-serif;color:#242e21"><p style="font-size:20px;margin:0 0 12px">You’re almost in.</p><p>Tap below to lock in spot <b>#${r.spot}</b>.</p><p><a href="${link}" style="display:inline-block;background:#62bf3b;color:#242e21;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">Confirm your email</a></p><p style="color:#6b7571;font-size:12px">Evo is a support tool, not therapy or a diagnosis. If you didn’t sign up, ignore this email.</p></div>`,
      },
      { authorization: `Bearer ${key}` },
    );
  } catch (e) {
    console.error("[early-access] confirm email failed:", e instanceof Error ? e.message : e);
  }
}

export const config = () => ({
  sheet: !!sheetUrl(),
  email: !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
});
