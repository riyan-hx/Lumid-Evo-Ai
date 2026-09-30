"use client";

import { useCallback, useEffect, useState } from "react";

/** One rung of the Unstuck ladder. `dread` is 1–10. */
export type Rung = { id: string; text: string; dread: number };

export type Ladder = {
  /** The whole task the person is avoiding. */
  task: string;
  /** How heavy the whole task feels, 1–10. */
  dread: number;
  /** Top (whole task) → bottom (tiniest step). Always 5 rungs. */
  rungs: Rung[];
  /** Index of the rung the person picked, or null. */
  selected: number | null;
};

const KEY = "evo-ladder-v1";

/** The Figma example ladder. */
export const EXAMPLE_LADDER: Ladder = {
  task: "Revise chapters 4–6 for the Maths exam",
  dread: 9,
  rungs: [
    { id: "r0", text: "Revise chapters 4–6", dread: 9 },
    { id: "r1", text: "Revise just chapter 4", dread: 7 },
    { id: "r2", text: "Read the chapter 4 summary", dread: 5 },
    { id: "r3", text: "Open to page 112", dread: 3 },
    { id: "r4", text: "Put the book on your desk", dread: 1 },
  ],
  selected: 3,
};

/** A generic, editable ladder for a task that came from elsewhere (e.g. ?task=). */
export function ladderFor(task: string): Ladder {
  const t = task.trim();
  return {
    task: t,
    dread: 8,
    rungs: [
      { id: "r0", text: t, dread: 8 },
      { id: "r1", text: "Do just the first part", dread: 6 },
      { id: "r2", text: "Spend five minutes on it", dread: 4 },
      { id: "r3", text: "Open what you need for it", dread: 2 },
      { id: "r4", text: "Put it where you can see it", dread: 1 },
    ],
    selected: null,
  };
}

function isLadder(v: unknown): v is Ladder {
  if (!v || typeof v !== "object") return false;
  const l = v as Ladder;
  return typeof l.task === "string" && typeof l.dread === "number" && Array.isArray(l.rungs) && l.rungs.length === 5;
}

function read(): Ladder | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isLadder(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function write(l: Ladder) {
  try {
    localStorage.setItem(KEY, JSON.stringify(l));
  } catch {}
}

/**
 * The person's current ladder, persisted in localStorage.
 * `fromTask` (the ?task= query) starts a fresh ladder unless the saved one is already for that task.
 */
export function useLadder(fromTask?: string) {
  const incoming = fromTask?.trim() || undefined;
  const [ladder, setLadder] = useState<Ladder>(() => (incoming ? ladderFor(incoming) : EXAMPLE_LADDER));

  useEffect(() => {
    const saved = read();
    if (incoming && saved?.task !== incoming) {
      write(ladderFor(incoming));
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted state after mount
    if (saved) setLadder(saved);
  }, [incoming]);

  const change = useCallback((fn: (l: Ladder) => Ladder) => {
    setLadder((l) => {
      const next = fn(l);
      write(next);
      return next;
    });
  }, []);

  /** Editing the task also renames the top rung (the whole task). */
  const setTask = useCallback(
    (task: string) => change((l) => ({ ...l, task, rungs: l.rungs.map((r, i) => (i === 0 ? { ...r, text: task } : r)) })),
    [change],
  );

  /** 1 → 10 → 1. The top rung carries the task's dread. */
  const cycleDread = useCallback(
    () =>
      change((l) => {
        const dread = l.dread >= 10 ? 1 : l.dread + 1;
        return { ...l, dread, rungs: l.rungs.map((r, i) => (i === 0 ? { ...r, dread } : r)) };
      }),
    [change],
  );

  const select = useCallback((i: number) => change((l) => ({ ...l, selected: i })), [change]);

  const editRung = useCallback(
    (i: number, text: string) => change((l) => ({ ...l, rungs: l.rungs.map((r, j) => (j === i ? { ...r, text } : r)) })),
    [change],
  );

  return { ladder, setTask, cycleDread, select, editRung };
}
