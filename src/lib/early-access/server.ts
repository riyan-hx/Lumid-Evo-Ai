import "server-only";
import { randomBytes } from "node:crypto";
import { after } from "next/server";
import { REF_RE, isEmail, isExcuseId, normalizeEmail, waveFor, type Signup } from "./content";
import { mirrorToSheet, sendConfirmEmail } from "./notify";
import { getStore, memoryAllowed, type Row } from "./store";

/** Early-access rules (handoff §5): validation, rate limits, double opt-in, wave credit. */

type Hits = Map<string, number[]>;
const g = globalThis as unknown as { __evoHits?: Hits };
const hits: Hits = (g.__evoHits ??= new Map());
const MIN = 60_000;
const DAY = 24 * 60 * MIN;

/** Sliding window (per server instance): true when over the limit, otherwise records the hit. */
function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  const over = list.length >= max;
  if (!over) list.push(now);
  hits.set(key, list);
  return over;
}

const newCode = () => `EVO-${randomBytes(3).toString("hex").slice(0, 4).toUpperCase()}`;

const view = (r: Row, origin: string, already?: boolean): Signup => ({
  status: r.confirmed ? "confirmed" : "pending_confirmation",
  spot: r.spot,
  wave: waveFor(r.invites),
  code: r.code,
  share_url: `${origin}/?ref=${r.code}`,
  invites: r.invites,
  ...(already ? { already: true } : {}),
});

export type SignupInput = { email?: unknown; excuse_id?: unknown; ref?: unknown; utm?: unknown; consent_version?: unknown };
export type SignupOutcome = { status: 201 | 200 | 422 | 429 | 503; body: Signup | { error: string } };

export async function signup(input: SignupInput, ip: string, origin: string): Promise<SignupOutcome> {
  const store = getStore();
  if (store.kind === "memory" && !memoryAllowed()) {
    console.error("[early-access] no storage configured (SUPABASE_* or BLOB_READ_WRITE_TOKEN) — refusing to store signups in memory in production");
    return { status: 503, body: { error: "storage_not_configured" } };
  }

  const email = typeof input.email === "string" ? normalizeEmail(input.email) : "";
  if (!isEmail(email)) return { status: 422, body: { error: "invalid_email" } };
  // 5 submits / IP / 10 min · 3 / email / day
  if (limited(`ip:${ip}`, 5, 10 * MIN) || limited(`email:${email}`, 3, DAY)) return { status: 429, body: { error: "rate_limited" } };

  const utm = (input.utm && typeof input.utm === "object" ? input.utm : {}) as Record<string, unknown>;
  const str = (v: unknown, n: number) => (typeof v === "string" && v ? v.slice(0, n) : undefined);
  const ref = typeof input.ref === "string" && REF_RE.test(input.ref) ? input.ref : null;

  try {
    const { created, row } = await store.create({
      email,
      code: newCode(),
      token: randomBytes(16).toString("base64url"),
      excuseId: isExcuseId(input.excuse_id) ? input.excuse_id : null,
      ref,
      utm: { source: str(utm.source, 64), campaign: str(utm.campaign, 64) },
      consentVersion: str(input.consent_version, 16) ?? "",
    });
    // Mirror + email after the response is sent (works on serverless via after()).
    after(async () => {
      if (created) await mirrorToSheet("signup", row, origin);
      if (!row.confirmed) await sendConfirmEmail(row, origin);
    });
    return { status: created ? 201 : 200, body: view(row, origin, !created) };
  } catch (e) {
    console.error("[early-access] signup failed:", e instanceof Error ? e.message : e);
    throw e; // route turns this into a 500 → the page shows “Couldn’t save just now”
  }
}

/** Confirm by email token. Returns the code to show on the confirmed page, or null for an unknown token. */
export async function confirm(token: string, origin: string): Promise<string | null> {
  if (!token || token.length > 64) return null;
  const store = getStore();
  const code = await store.confirm(token);
  if (code) {
    const row = await store.byCode(code);
    if (row) after(() => mirrorToSheet("confirm", row, origin));
  }
  return code;
}

export async function findByCode(code: string, origin: string): Promise<Signup | null> {
  const r = await getStore().byCode(code);
  return r?.confirmed ? view(r, origin) : null;
}
