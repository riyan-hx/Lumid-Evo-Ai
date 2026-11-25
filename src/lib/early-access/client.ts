"use client";

import type { ExcuseId, Signup } from "./content";

/* ---------- Analytics (no PII — never pass the email) ---------- */

type EventName =
  | "line_selected"
  | "email_submitted"
  | "email_invalid"
  | "signup_success"
  | "signup_failed"
  | "share_clicked";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: EventName, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer?.push({ event, ...props });
  if (process.env.NODE_ENV !== "production") console.debug("[analytics]", event, props);
}

/* ---------- sessionStorage (always guarded: private mode throws) ---------- */

export const store = {
  get(key: string) {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      sessionStorage.setItem(key, value);
    } catch {}
  },
};

const REF_KEY = "evo-ref";

/** Keep `?ref=` (and UTMs) for the whole session so they survive step changes. */
export function captureAttribution() {
  const q = new URLSearchParams(window.location.search);
  const ref = q.get("ref")?.toUpperCase();
  if (ref) store.set(REF_KEY, ref);
  const utm = { source: q.get("utm_source"), campaign: q.get("utm_campaign") };
  if (utm.source || utm.campaign) store.set("evo-utm", JSON.stringify(utm));
}

function attribution() {
  let utm: { source?: string | null; campaign?: string | null } = {};
  try {
    utm = JSON.parse(store.get("evo-utm") ?? "{}");
  } catch {}
  return { ref: store.get(REF_KEY), utm };
}

/* ---------- API ---------- */

export type SignupResult =
  | { kind: "ok"; data: Signup }
  | { kind: "invalid" | "rate" | "error" };

const MIN_SAVING_MS = 300;

export async function postSignup(email: string, excuseId: ExcuseId | null): Promise<SignupResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10_000);
  const hold = new Promise((r) => setTimeout(r, MIN_SAVING_MS)); // avoid a flash of the loading state
  try {
    const res = await fetch("/api/early-access", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, excuse_id: excuseId, source: "web", consent_version: "2026-11", ...attribution() }),
      signal: ctrl.signal,
    });
    await hold;
    if (res.status === 422) return { kind: "invalid" };
    if (res.status === 429) return { kind: "rate" };
    if (!res.ok) return { kind: "error" };
    const body = (await res.json()) as Signup;
    return { kind: "ok", data: body };
  } catch {
    await hold;
    return { kind: "error" };
  } finally {
    clearTimeout(timer);
  }
}


export const hasRef = () => !!store.get(REF_KEY);
