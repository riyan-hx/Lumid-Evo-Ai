"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CheckIn = { mood: string; energy: number; at: string };
export type Memory = { id: string; text: string; source: string; date: string };

type State = {
  name: string;
  phone: string;
  goals: string[];
  consents: { patterns: boolean; forecast: boolean; voice: boolean; psychologist: boolean };
  reminder: { preset: "morning" | "evening" | "custom"; time: string; days: string[] };
  checkIn: CheckIn | null;
  onboarded: boolean;
  consentedAt?: string;
  policyVersion?: string;
  safetyPauseUntil?: number;
  memories: Memory[];
  languages: string[];
  psychologist: Psychologist | null;
  shares: { mood: boolean; steps: boolean; summary: boolean };
  plan: Plan;
  notificationsSeenAt?: number;
  snoozedUntil?: number;
};

export type Psychologist = { code: string; name: string; initials: string; role: string; city: string };
export type Plan = { tier: "free" | "plus"; interval: "monthly" | "yearly"; price: string; renews: string; lastReceipt: string; cancelled: boolean };

const initial: State = {
  name: "Alex",
  phone: "98765 43210",
  goals: ["avoid", "overwhelmed"],
  consents: { patterns: true, forecast: true, voice: false, psychologist: false },
  reminder: { preset: "evening", time: "8:00 PM", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  checkIn: null,
  onboarded: false,
  memories: [
    { id: "m1", text: "Exams make starting hard — Maths most of all.", source: "From chats", date: "26–28 Sep" },
    { id: "m2", text: "After dinner is your hardest time to start.", source: "From check-ins", date: "this week" },
    { id: "m3", text: "A 3-minute brain dump helps you begin.", source: "From your wins", date: "24 Sep" },
    { id: "m4", text: "Prefers Malayalam for voice chats.", source: "From Settings", date: "" },
  ],
  languages: ["English", "Malayalam"],
  psychologist: null,
  shares: { mood: false, steps: false, summary: false },
  plan: { tier: "plus", interval: "yearly", price: "₹1,499", renews: "12 Sep 2027", lastReceipt: "12 Sep 2026", cancelled: false },
};

const KEY = "evo-state-v1";

type Ctx = State & { update: (patch: Partial<State>) => void; reset: () => void };

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted state after mount
      if (raw) setState({ ...initial, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const update = useCallback((patch: Partial<State>) => {
    setState((s) => {
      const next = { ...s, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setState(initial);
  }, []);

  const value = useMemo(() => ({ ...state, update, reset }), [state, update, reset]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
