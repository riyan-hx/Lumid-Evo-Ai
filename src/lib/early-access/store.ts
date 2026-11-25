import "server-only";
import type { ExcuseId } from "./content";

/**
 * Persistence for early-access registrations.
 *  - Supabase (REST, no SDK) when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set — use this in production.
 *  - In-memory otherwise (local dev only; resets on restart and isn't shared across serverless instances).
 */

export type Row = {
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
};

export type NewRow = Omit<Row, "spot" | "confirmed" | "invites">;

export interface Store {
  readonly kind: "supabase" | "memory";
  /** Insert; resolves `{ created: false, row }` with the existing row if the email is already registered. */
  create(row: NewRow): Promise<{ created: boolean; row: Row }>;
  byCode(code: string): Promise<Row | null>;
  /** Confirm by token (and credit the referrer). Returns the confirmed row's code, or null. */
  confirm(token: string): Promise<string | null>;
  /** Cheap reachability check for the health endpoint. */
  ping(): Promise<void>;
}

/* ---------------- in-memory ---------------- */

type Mem = { byEmail: Map<string, Row>; byCode: Map<string, Row>; byToken: Map<string, Row>; next: number };
const g = globalThis as unknown as { __evoMem?: Mem };
const mem: Mem = (g.__evoMem ??= { byEmail: new Map(), byCode: new Map(), byToken: new Map(), next: 1537 });

const memoryStore: Store = {
  kind: "memory",
  async create(n) {
    const existing = mem.byEmail.get(n.email);
    if (existing) return { created: false, row: existing };
    const row: Row = { ...n, spot: mem.next++, confirmed: false, invites: 0 };
    mem.byEmail.set(row.email, row);
    mem.byCode.set(row.code, row);
    mem.byToken.set(row.token, row);
    return { created: true, row };
  },
  async byCode(code) {
    return mem.byCode.get(code) ?? null;
  },
  async confirm(token) {
    const r = mem.byToken.get(token);
    if (!r) return null;
    if (!r.confirmed) {
      r.confirmed = true;
      const ref = r.ref ? mem.byCode.get(r.ref) : undefined;
      if (ref) ref.invites += 1;
    }
    return r.code;
  },
  async ping() {},
};

/* ---------------- Supabase (PostgREST) ---------------- */

type DbRow = {
  email: string;
  spot: number;
  code: string;
  token: string;
  confirmed: boolean;
  invites: number;
  excuse_id: string | null;
  ref: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  consent_version: string | null;
};

const fromDb = (d: DbRow): Row => ({
  email: d.email,
  spot: Number(d.spot),
  code: d.code,
  token: d.token,
  confirmed: d.confirmed,
  invites: d.invites,
  excuseId: (d.excuse_id as ExcuseId | null) ?? null,
  ref: d.ref,
  utm: { source: d.utm_source ?? undefined, campaign: d.utm_campaign ?? undefined },
  consentVersion: d.consent_version ?? "",
});

function supabase(url: string, key: string): Store {
  const base = `${url.replace(/\/+$/, "")}/rest/v1`;
  const headers = { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" };
  const call = (path: string, init: RequestInit = {}) =>
    fetch(`${base}${path}`, { ...init, headers: { ...headers, ...(init.headers as Record<string, string>) }, cache: "no-store", signal: AbortSignal.timeout(8000) });

  const one = async (query: string): Promise<Row | null> => {
    const res = await call(`/early_access?${query}&limit=1`);
    if (!res.ok) throw new Error(`supabase select ${res.status}`);
    const rows = (await res.json()) as DbRow[];
    return rows[0] ? fromDb(rows[0]) : null;
  };

  return {
    kind: "supabase",
    async create(n) {
      const res = await call("/early_access", {
        method: "POST",
        headers: { prefer: "return=representation" },
        body: JSON.stringify({ email: n.email, code: n.code, token: n.token, excuse_id: n.excuseId, ref: n.ref, utm_source: n.utm.source ?? null, utm_campaign: n.utm.campaign ?? null, consent_version: n.consentVersion }),
      });
      if (res.status === 409) {
        const existing = await one(`email=ilike.${encodeURIComponent(n.email.replace(/([%_\\])/g, "\\$1"))}`);
        if (existing) return { created: false, row: existing };
        throw new Error("supabase conflict without a matching row (code/token collision)");
      }
      if (!res.ok) throw new Error(`supabase insert ${res.status}: ${await res.text()}`);
      const rows = (await res.json()) as DbRow[];
      return { created: true, row: fromDb(rows[0]) };
    },
    async byCode(code) {
      return one(`code=eq.${encodeURIComponent(code)}`);
    },
    async confirm(token) {
      const res = await call("/rpc/evo_confirm", { method: "POST", body: JSON.stringify({ p_token: token }) });
      if (!res.ok) throw new Error(`supabase confirm ${res.status}`);
      return ((await res.json()) as string | null) ?? null;
    },
    async ping() {
      const res = await call("/early_access?select=id&limit=1");
      if (!res.ok) throw new Error(`supabase ping ${res.status}`);
    },
  };
}

export function getStore(): Store {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) return supabase(url, key);
  return memoryStore;
}

/** In production, silently keeping signups in memory would lose them — refuse unless explicitly allowed. */
export const memoryAllowed = () => process.env.NODE_ENV !== "production" || process.env.EARLY_ACCESS_ALLOW_MEMORY === "1";
