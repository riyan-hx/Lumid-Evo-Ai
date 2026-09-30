"use client";

import { useCallback, useSyncExternalStore } from "react";

/** 11 · Avoidance forecast — per-day "Not today" dismissal of the Get-ahead nudge, kept on this device. */

const KEY = "evo-forecast-dismissed-v1";
const EVENT = "evo-forecast-change";

/** Local calendar day, e.g. 2026-10-01 — the dismissal expires at midnight. */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === today();
  } catch {
    return false;
  }
}

function write(value: string | null) {
  try {
    if (value) localStorage.setItem(KEY, value);
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Whether the Get-ahead card was dismissed today, plus dismiss / undo. */
export function useForecastDismissal() {
  const dismissed = useSyncExternalStore(subscribe, read, () => false);
  const dismiss = useCallback(() => write(today()), []);
  const undo = useCallback(() => write(null), []);
  return { dismissed, dismiss, undo };
}
