"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import type { Glow } from "@/components/ui/backdrop";
import { BackButton } from "@/components/ui/controls";
import { Icon } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/cn";
import { useLadder, type Rung } from "@/lib/ladder";
import { ease, haptic, spring } from "@/lib/motion";

/** Peach glow over the task (top right), lime glow under the small steps (bottom left). */
const ladderGlows: Glow[] = [
  { x: 200, y: -100, w: 300, h: 260, color: "#ffd9c2", opacity: 0.6, blur: 100 },
  { x: -140, y: 560, w: 360, h: 300, color: "#a3e27d", opacity: 0.55, blur: 110 },
];

/** Rung colours, whole task → tiniest step (peach → sun → lime). */
const RUNG_COLOR = ["#f08a5d", "#f3a15a", "#f2b233", "#a3e27d", "#88d95f"];

const LINES = {
  intro: "Let’s shrink it until it feels doable. Tap the first rung you could do right now.",
  top: "That’s the whole thing — no need to start there. Pick a rung lower down.",
  picked: "Good pick. You only need to do this one — stopping after it still counts.",
};

/** 09 · Unstuck ladder — shrink the avoided task into rungs until one feels doable. */
export function UnstuckLadder({ task }: { task?: string }) {
  const router = useRouter();
  const { ladder, setTask, cycleDread, select, editRung } = useLadder(task);
  const [line, setLine] = useState<keyof typeof LINES>("intro");
  const [editing, setEditing] = useState<number | null>(null);

  const picked = ladder.selected !== null && ladder.selected > 0 ? ladder.rungs[ladder.selected] : null;
  const startHref = picked ? `/focus?task=${encodeURIComponent(picked.text)}` : undefined;

  const tapRung = (i: number) => {
    if (editing !== null) return;
    if (i === 0) {
      haptic("selection");
      setLine("top");
      return;
    }
    haptic("light");
    select(i);
    setLine("picked");
  };

  return (
    <Screen glows={ladderGlows}>
      <div className="flex flex-1 flex-col pt-[54px] pb-[max(env(safe-area-inset-bottom),26px)]">
        <div className="relative flex h-11 items-center px-5">
          <BackButton />
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white bg-white/78 py-2 pr-3.5 pl-3 shadow-[0_10px_13px_rgba(26,64,20,0.07)] backdrop-blur-[12px]">
            <span className="text-lime-deep">
              <Icon name="path" size={14} />
            </span>
            <span className="type-label-s whitespace-nowrap text-ink">Unstuck ladder</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3.5 px-6">
          <label htmlFor="ladder-task" className="type-label-m text-t3">
            What are you avoiding?
          </label>

          <div className="glass flex flex-col items-start gap-2.5 rounded-3xl px-[18px] py-4">
            <TaskField value={ladder.task} onCommit={setTask} />
            <motion.button
              type="button"
              onClick={() => {
                haptic("selection");
                cycleDread();
              }}
              whileTap={{ scale: 0.95 }}
              transition={spring.snappy}
              aria-label={`Dread ${ladder.dread} out of 10. Tap to change.`}
              className="flex cursor-pointer items-center gap-1.5 rounded-full bg-peach-soft py-[5px] pr-3 pl-2.5 type-label-s text-peach-text"
            >
              <span className="size-[7px] rounded-full bg-peach-solid" />
              <span className="tabular-nums">Dread {ladder.dread}/10</span>
            </motion.button>
          </div>

          <div className="flex items-start gap-2.5">
            <Orb size={28} state="still" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={line}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={ease.out}
                className="min-w-0 flex-1 type-body-m text-ink"
                aria-live="polite"
              >
                {LINES[line]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Ladder: dread rail on the left, rungs from whole task (top) to tiniest step (bottom). */}
          <div className="relative flex flex-col gap-2.5">
            <div
              aria-hidden
              className="absolute top-[30px] bottom-[30px] left-[17px] w-1.5 rounded-[3px]"
              style={{ background: "linear-gradient(to bottom, #f08a5d, #f2b233 50%, #88d95f)" }}
            />
            {ladder.rungs.map((r, i) => (
              <RungRow
                key={r.id}
                rung={r}
                index={i}
                color={RUNG_COLOR[i]}
                selected={ladder.selected === i && i > 0}
                editing={editing === i}
                onTap={() => tapRung(i)}
                onEdit={() => setEditing(i)}
                onCommit={(text) => {
                  if (text) editRung(i, text);
                  setEditing(null);
                }}
              />
            ))}
          </div>
        </div>

        <div className="mt-auto flex flex-col items-center gap-6 px-6 pt-10">
          <Pill
            label={picked ? "Start this rung · 2 min" : "Pick a rung to start"}
            className="w-full"
            href={startHref}
            disabled={!picked}
          />
          <motion.button
            type="button"
            onClick={() => router.push("/chat?checkedIn=1")}
            whileTap={{ scale: 0.96 }}
            transition={spring.snappy}
            className="flex cursor-pointer items-center gap-1.5 type-label-m text-t2"
          >
            <Icon name="pencil" size={14} />
            Make it even smaller
          </motion.button>
        </div>
      </div>
    </Screen>
  );
}

/* ---------- Task field: auto-growing textarea, saved on blur / Enter ---------- */

function TaskField({ value, onCommit }: { value: string; onCommit: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  // Follow the stored value when it hydrates (render-time sync, no effect).
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  const commit = () => {
    const t = draft.trim().replace(/\s+/g, " ");
    if (!t) return setDraft(value);
    if (t !== value) onCommit(t);
  };

  return (
    <textarea
      id="ladder-task"
      ref={ref}
      rows={1}
      value={draft}
      maxLength={140}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className="w-full resize-none overflow-hidden bg-transparent text-[21px] leading-[1.06] font-medium tracking-[-0.63px] text-ink outline-none placeholder:text-t-disabled focus-visible:outline-none"
      placeholder="The thing you keep putting off"
    />
  );
}

/* ---------- One rung ---------- */

type RungRowProps = {
  rung: Rung;
  index: number;
  color: string;
  selected: boolean;
  editing: boolean;
  onTap: () => void;
  onEdit: () => void;
  onCommit: (text: string) => void;
};

function RungRow({ rung, index, color, selected, editing, onTap, onEdit, onCommit }: RungRowProps) {
  const whole = index === 0;
  return (
    <div className="relative flex items-center">
      {/* Rail node */}
      <motion.span
        aria-hidden
        className="absolute top-1/2 left-5 z-[1] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        initial={false}
        animate={{ width: selected ? 22 : 16, height: selected ? 22 : 16, borderWidth: selected ? 6 : 4 }}
        transition={spring.snappy}
        style={{ borderStyle: "solid", borderColor: color }}
      />

      <motion.div
        role="button"
        tabIndex={0}
        aria-pressed={whole ? undefined : selected}
        aria-label={whole ? `Whole task: ${rung.text}` : undefined}
        onClick={onTap}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTap();
          }
        }}
        whileTap={editing ? undefined : { scale: 0.985 }}
        transition={spring.snappy}
        className={cn(
          "ml-[46px] flex min-h-[60px] min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[20px] py-2.5 pr-3.5 pl-4 transition-[background-color,border-color,box-shadow] duration-200 ease-(--ease-out-evo)",
          selected
            ? "border-[1.5px] border-lime bg-lime-soft shadow-[0_12px_26px_-8px_rgba(135,217,94,0.45)]"
            : "glass",
        )}
        style={whole && !selected ? { background: "rgba(255,255,255,0.45)" } : undefined}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {editing ? (
            <RungInput initial={rung.text} onCommit={onCommit} />
          ) : (
            <span className={cn("type-label-m break-words", whole ? "text-t3 line-through" : "text-ink")}>{rung.text}</span>
          )}
          <Meter value={rung.dread} color={color} />
        </div>

        {selected ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring.snappy}
              className="rounded-full bg-forest px-2.5 py-[5px] type-label-s whitespace-nowrap text-white"
            >
              I could do this
            </motion.span>
            {!editing && (
              <motion.button
                type="button"
                aria-label="Edit this rung"
                onClick={(e) => {
                  e.stopPropagation();
                  haptic("selection");
                  onEdit();
                }}
                whileTap={{ scale: 0.9 }}
                transition={spring.snappy}
                className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-white/80 text-forest"
              >
                <Icon name="pencil" size={14} />
              </motion.button>
            )}
          </div>
        ) : (
          <span className="shrink-0 type-label-s text-t3 tabular-nums">{rung.dread}/10</span>
        )}
      </motion.div>
    </div>
  );
}

function RungInput({ initial, onCommit }: { initial: string; onCommit: (text: string) => void }) {
  const [v, setV] = useState(initial);
  const done = useRef(false);
  const finish = (text: string) => {
    if (done.current) return;
    done.current = true;
    onCommit(text.trim().replace(/\s+/g, " "));
  };
  return (
    <input
      autoFocus
      value={v}
      maxLength={60}
      aria-label="Rung text"
      onChange={(e) => setV(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onBlur={() => finish(v)}
      onKeyDown={(e) => {
        if (e.key === "Enter") finish(v);
        if (e.key === "Escape") finish("");
      }}
      className="-mx-1 w-full rounded-lg bg-white/80 px-1 type-label-m text-ink outline-none"
    />
  );
}

function Meter({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex gap-[3px]" aria-label={`Dread ${value} out of 10`} role="img">
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className="h-1 w-2.5 rounded-[2px] transition-colors duration-200"
          style={{ background: i < value ? color : "rgba(36,46,33,0.08)" }}
        />
      ))}
    </div>
  );
}
