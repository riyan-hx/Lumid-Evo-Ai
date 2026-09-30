"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { glows } from "@/components/ui/backdrop";
import { BackButton, Toggle } from "@/components/ui/controls";
import { Icon } from "@/components/ui/icons";
import { Screen } from "@/components/ui/screen";
import { Sheet } from "@/components/ui/sheet";
import { ease, haptic, spring } from "@/lib/motion";
import { useApp, type Memory } from "@/lib/store";

/** 26 · What Evo remembers — edit, forget (5 s undo), forget everything. */
export default function MemoryScreen() {
  const app = useApp();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [undo, setUndo] = useState<{ item: Memory; index: number } | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const forget = (m: Memory) => {
    haptic("warning");
    const index = app.memories.findIndex((x) => x.id === m.id);
    app.update({ memories: app.memories.filter((x) => x.id !== m.id) });
    setUndo({ item: m, index });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setUndo(null), 5000);
  };

  const restore = () => {
    if (!undo) return;
    const next = [...app.memories];
    next.splice(undo.index, 0, undo.item);
    app.update({ memories: next });
    setUndo(null);
  };

  const save = (id: string) => {
    app.update({ memories: app.memories.map((m) => (m.id === id ? { ...m, text: draft.trim() || m.text } : m)) });
    setEditing(null);
  };

  return (
    <Screen glows={glows.onboarding} app>
      <div className="flex flex-col gap-3 px-6 pt-[50px] pb-8">
        <BackButton href="/settings" />
        <h1 className="text-[30px] leading-[1.08] font-medium tracking-[-0.9px] text-ink">What Evo remembers</h1>
        <p className="type-body-m text-t2">Evo uses these to understand you. Edit or forget anything — forgetting deletes it for good.</p>

        <div className="glass flex h-[100px] items-center gap-3 rounded-[22px] px-4 py-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-lavender-subtle text-lavender-text">
            <Icon name="brain" size={18} />
          </span>
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="type-label-m text-t1">Remember patterns across chats</span>
            <span className="type-caption text-t3">
              {app.consents.patterns ? "Off = Evo starts fresh every chat" : "Off — existing memories stay until you forget them"}
            </span>
          </div>
          <Toggle
            label="Remember patterns across chats"
            on={app.consents.patterns}
            onChange={(v) => app.update({ consents: { ...app.consents, patterns: v } })}
          />
        </div>

        <div className="flex justify-between type-label-s text-t3">
          <span>Things Evo has learned</span>
          <span>{app.memories.length}</span>
        </div>

        <AnimatePresence initial={false}>
          {app.memories.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0, marginTop: -12 }}
              transition={{ ...ease.out, layout: spring.default }}
              className="overflow-hidden"
            >
              <div className="glass flex flex-col gap-2 rounded-[22px] px-4 pt-3 pb-2.5">
                {editing === m.id ? (
                  <textarea
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), save(m.id))}
                    rows={2}
                    className="w-full resize-none rounded-xl border-[1.5px] border-lime bg-white px-3 py-2 type-body-l text-t1 outline-none"
                  />
                ) : (
                  <p className="type-body-l text-t1">{m.text}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="flex-1 type-caption text-t3">
                    {m.source}
                    {m.date && ` · ${m.date}`}
                  </span>
                  {editing === m.id ? (
                    <button type="button" onClick={() => save(m.id)} className="h-[30px] cursor-pointer rounded-full bg-forest px-3.5 type-label-s text-white">
                      Save
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(m.id);
                        setDraft(m.text);
                      }}
                      className="h-[30px] cursor-pointer rounded-full border border-line bg-white px-3.5 type-label-s text-t1"
                    >
                      Edit
                    </button>
                  )}
                  <button type="button" onClick={() => forget(m)} className="h-[30px] cursor-pointer rounded-full bg-danger-subtle px-3.5 type-label-s text-t-danger">
                    Forget
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {app.memories.length === 0 && <p className="py-6 text-center type-body-m text-t3">Evo isn’t holding on to anything right now.</p>}

        <div className="flex flex-col items-center gap-2 pt-1">
          {app.memories.length > 0 && (
            <button type="button" onClick={() => setConfirmAll(true)} className="cursor-pointer type-label-m text-t-danger">
              Forget everything
            </button>
          )}
          <span className="flex items-center gap-1.5 type-caption text-t3">
            <Icon name="lock" size={12} />
            Never shared with a psychologist unless you choose, per session.
          </span>
        </div>
      </div>

      <AnimatePresence>
        {undo && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={spring.snappy}
            className="fixed inset-x-0 bottom-6 z-40 mx-auto flex w-[min(345px,calc(100%-32px))] items-center justify-between rounded-2xl bg-forest px-4 py-3 text-white shadow-[0_14px_28px_-10px_rgba(20,26,18,0.4)]"
            role="status"
          >
            <span className="type-body-s">Forgotten.</span>
            <button type="button" onClick={restore} className="cursor-pointer type-label-m text-lime">
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={confirmAll} onClose={() => setConfirmAll(false)} label="Forget everything">
        <div className="flex flex-col gap-3.5 px-1 pb-2">
          <h2 className="text-[26px] leading-[1.1] font-medium tracking-[-0.65px] text-ink">Forget everything?</h2>
          <p className="type-body-m text-t2">Evo will delete all {app.memories.length} memories for good. Your chats and check-ins stay.</p>
          <button
            type="button"
            onClick={() => {
              haptic("warning");
              app.update({ memories: [] });
              setConfirmAll(false);
            }}
            className="flex h-[54px] cursor-pointer items-center justify-center rounded-full bg-t-danger type-label-m text-white"
          >
            Forget everything
          </button>
          <button type="button" onClick={() => setConfirmAll(false)} className="cursor-pointer type-label-m text-t1">
            Keep them
          </button>
        </div>
      </Sheet>
    </Screen>
  );
}
