"use client";

import { useCallback, useEffect, useState } from "react";

/** What the person chose to send before one session. Kept on this device only. */
export type SharedRecord = {
  /** Invite code of the psychologist it was shared with. */
  with: string;
  at: string;
  topics: string[];
  shares: { mood: boolean; steps: boolean; summary: boolean };
  /** Private chats, for this session only. Always an explicit choice. */
  privateChats: boolean;
};

const KEY = "evo.bridge.lastShared";

function read(): SharedRecord | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SharedRecord) : null;
  } catch {
    return null;
  }
}

/** Last thing shared through the session bridge, with save + take-back. */
export function useLastShared() {
  const [record, setRecord] = useState<SharedRecord | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted state after mount
    setRecord(read());
  }, []);

  const save = useCallback((next: Omit<SharedRecord, "at">) => {
    const full = { ...next, at: new Date().toISOString() };
    try {
      localStorage.setItem(KEY, JSON.stringify(full));
    } catch {}
    setRecord(full);
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setRecord(null);
  }, []);

  return { record, save, clear };
}
