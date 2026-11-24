import "server-only";
import { randomBytes } from "node:crypto";
import { REF_RE, isEmail, isExcuseId, normalizeEmail, waveFor, type ExcuseId, type Signup } from "./content";

/**
 * Early-access store + rules (handoff §5).
 * In-memory so the flow works end to end locally; it resets on restart and isn't shared across
 * serverless instances. Swap `db` for a real table (same shape) when the backend exists.
 */

type Record_ = {
  email: string;
  spot: number;
  code: string;
  token: string;
  confirmed: boolean;
  invites: number;
  excuseId: ExcuseId | null;
  ref: string | null;
  utm: { source?: string; campaign?: string };
  consentVersion: string;
  createdAt: number;
};

type Db = { byEmail: Map<string, Record_>; byCode: Map<string, Record_>; byToken: Map<string, Record_>; next: number; hits: Map<string, number[]> };

const g = globalThis as unknown as { __evoEarlyAccess?: Db };
const db: Db = (g.__evoEarlyAccess ??= { byEmail: new Map(), byCode: new Map(), byToken: new Map(), next: 1537, hits: new Map() });

const MIN = 60_000;
const DAY = 24 * 60 * MIN;

/** Sliding window: true when over the limit (otherwise records the hit). */
function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const hits = (db.hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    db.hits.set(key, hits);
    return true;
  }
  hits.push(now);
  db.hits.set(key, hits);
  return false;
}

const newCode = () => {
  for (;;) {
    const code = `EVO-${randomBytes(3).toString("hex").slice(0, 4).toUpperCase()}`;
    if (!db.byCode.has(code)) return code;
  }
};

const view = (r: Record_, origin: string, already?: boolean): Signup => ({
  status: r.confirmed ? "confirmed" : "pending_confirmation",
  spot: r.spot,
  wave: waveFor(r.invites),
  code: r.code,
  share_url: `${origin}/?ref=${r.code}`,
  invites: r.invites,
  ...(already ? { already: true } : {}),
});

/** Stand-in for the mailer: log the confirm link. Replace with the real provider. */
function sendConfirmEmail(r: Record_, origin: string) {
  console.info(`[early-access] confirm ${r.email}: ${origin}/api/early-access/confirm?token=${r.token}`);
}

export type SignupInput = { email?: unknown; excuse_id?: unknown; ref?: unknown; utm?: unknown; consent_version?: unknown };
export type SignupOutcome = { status: 201 | 200 | 422 | 429; body: Signup | { error: string } };

export function signup(input: SignupInput, ip: string, origin: string): SignupOutcome {
  const email = typeof input.email === "string" ? normalizeEmail(input.email) : "";
  if (!isEmail(email)) return { status: 422, body: { error: "invalid_email" } };
  // 5 submits / IP / 10 min · 3 / email / day
  if (limited(`ip:${ip}`, 5, 10 * MIN) || limited(`email:${email}`, 3, DAY)) return { status: 429, body: { error: "rate_limited" } };

  const existing = db.byEmail.get(email);
  if (existing) {
    sendConfirmEmail(existing, origin);
    return { status: 200, body: view(existing, origin, true) };
  }

  const ref = typeof input.ref === "string" && REF_RE.test(input.ref) ? input.ref : null;
  const utm = (input.utm && typeof input.utm === "object" ? input.utm : {}) as Record<string, unknown>;
  const r: Record_ = {
    email,
    spot: db.next++,
    code: newCode(),
    token: randomBytes(16).toString("base64url"),
    confirmed: false,
    invites: 0,
    excuseId: isExcuseId(input.excuse_id) ? input.excuse_id : null,
    ref: ref && db.byCode.has(ref) ? ref : null,
    utm: { source: typeof utm.source === "string" ? utm.source.slice(0, 64) : undefined, campaign: typeof utm.campaign === "string" ? utm.campaign.slice(0, 64) : undefined },
    consentVersion: typeof input.consent_version === "string" ? input.consent_version.slice(0, 16) : "",
    createdAt: Date.now(),
  };
  db.byEmail.set(email, r);
  db.byCode.set(r.code, r);
  db.byToken.set(r.token, r);
  sendConfirmEmail(r, origin);
  return { status: 201, body: view(r, origin) };
}

/** Confirm by email token. A referrer is credited only now, once their friend has confirmed. */
export function confirm(token: string): string | null {
  const r = db.byToken.get(token);
  if (!r) return null;
  if (!r.confirmed) {
    r.confirmed = true;
    const referrer = r.ref ? db.byCode.get(r.ref) : undefined;
    if (referrer) referrer.invites += 1;
  }
  return r.code;
}

export function findByCode(code: string, origin: string): Signup | null {
  const r = db.byCode.get(code);
  return r?.confirmed ? view(r, origin) : null;
}
