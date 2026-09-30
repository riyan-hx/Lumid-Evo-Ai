"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ChatHeader,
  DatePill,
  EvoText,
  GhostAction,
  MoodTile,
  OptionRow,
  PrivacyNote,
  TypingDots,
  UserBubble,
  WideChatHeader,
  type Choice,
} from "@/components/evo/chat-bits";
import { Composer } from "@/components/evo/composer";
import { OfflineBanner } from "@/components/evo/offline-banner";
import { InsightCard, type Insight } from "@/components/evo/insight-card";
import { PlanCard } from "@/components/evo/plan-card";
import { PlanPanel } from "@/components/evo/plan-panel";
import { ChatList } from "@/components/evo/chat-list";
import { glows, wideGlows } from "@/components/ui/backdrop";
import { SoftChip } from "@/components/ui/controls";
import { Icon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { arriving, help, insight as baseInsight, insightTired, plan, weighing } from "@/lib/mock";
import { spring } from "@/lib/motion";
import { riskCheck } from "@/lib/safety";
import { cn } from "@/lib/cn";
import { useApp } from "@/lib/store";
import { clock, inMinutes } from "@/lib/time";

type Block =
  | { t: "date"; label: string }
  | { t: "evo"; text: string; headline?: boolean }
  | { t: "label"; text: string }
  | { t: "user"; text: string }
  | { t: "tiles"; choices: Choice[]; picked?: string }
  | { t: "rows"; choices: Choice[]; picked?: string; primary?: boolean; ghost?: "type" | "later" }
  | { t: "insight"; insight: Insight; confirmed?: boolean }
  | { t: "confirm"; picked?: string }
  | { t: "chips"; options: string[]; picked?: string; tag: string }
  | { t: "plan" };

type Keyed = Block & { id: number };

let nextId = 0;
const withId = (b: Block): Keyed => ({ ...b, id: nextId++ });

export function GuidedChat({ checkedIn, q, venting }: { checkedIn: boolean; q?: string; venting?: boolean }) {
  const router = useRouter();
  const { name } = useApp();
  const [blocks, setBlocks] = useState<Keyed[]>([]);
  const [typing, setTyping] = useState(false);
  const [notQuiteUsed, setNotQuiteUsed] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLDivElement>(null);
  const alive = useRef(true);

  const push = useCallback((...b: Block[]) => setBlocks((prev) => [...prev, ...b.map(withId)]), []);

  /** Typing indicator, then Evo's blocks. */
  const evo = useCallback(
    (...b: Block[]) => {
      setTyping(true);
      setTimeout(() => {
        if (!alive.current) return;
        setTyping(false);
        push(...b);
      }, 700);
    },
    [push],
  );

  const mark = (id: number, patch: Partial<Block>) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? ({ ...b, ...patch } as Keyed) : b)));

  const opened = useRef(false);

  // Opening turn. If the user checked in today, skip the “arriving” card (handoff §6).
  /* eslint-disable react-hooks/set-state-in-effect -- scripted opening turn, runs once on mount */
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    const date = { t: "date", label: `Today, ${clock(new Date())}` } as const;
    if (venting) {
      push(date);
      if (q) push({ t: "user", text: q });
      evo({ t: "evo", text: "Thank you for telling me. I’m here — no plans, no pressure. What’s making today feel so low?" });
    } else if (q) {
      push(date, { t: "user", text: q });
      if (riskCheck(q) === "high") {
        router.replace(`/safety?m=${encodeURIComponent(q)}`);
        return;
      }
      evo({ t: "evo", text: "Thanks for telling me. What’s weighing on you most right now?" }, { t: "rows", choices: weighing, ghost: "type" });
    } else if (checkedIn) {
      push(date);
      evo(
        { t: "evo", text: `Thanks for checking in, ${name}. What’s weighing on you most right now?` },
        { t: "rows", choices: weighing, ghost: "type" },
      );
    } else {
      push(date, { t: "evo", headline: true, text: `Hi ${name}. Yesterday felt heavy. How are you arriving today?` }, { t: "tiles", choices: arriving });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- opening turn runs once
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Survives StrictMode's simulated remount; drops replies only after a real unmount.
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [blocks.length, typing]);

  /* ---------- handlers ---------- */

  const onArrive = (id: number, c: Choice) => {
    mark(id, { picked: c.label });
    push({ t: "user", text: c.label });
    if (c.label === "Just want to talk") {
      evo({ t: "evo", text: "Got it — no fixing. I’m listening. What happened?" });
      return;
    }
    evo({ t: "evo", text: "Thanks for telling me. What’s weighing on you most right now?" }, { t: "rows", choices: weighing, ghost: "type" });
  };

  const showInsight = (i: Insight, intro: string) =>
    evo({ t: "evo", text: intro }, { t: "insight", insight: i }, { t: "label", text: "Does this feel right?" }, { t: "confirm" });

  const onWeigh = (id: number, c: Choice) => {
    mark(id, { picked: c.label });
    push({ t: "user", text: c.label });
    showInsight(baseInsight, "That makes a lot of sense — and it’s really common. Here’s what I’m noticing:");
  };

  const onConfirm = (id: number, yes: boolean) => {
    mark(id, { picked: yes ? "yes" : "no" });
    if (yes) {
      setBlocks((prev) => {
        const idx = prev.findLastIndex((b) => b.t === "insight");
        return prev.map((b, i) => (i === idx ? ({ ...b, confirmed: true } as Keyed) : b));
      });
      evo({ t: "evo", text: "Is there anything I can help you with right now?" }, { t: "rows", choices: help, primary: true, ghost: "later" });
      return;
    }
    push({ t: "user", text: "Not quite" });
    if (notQuiteUsed) {
      evo({ t: "evo", text: "Thanks for being honest. Let’s not force it — is there anything I can help with right now?" }, { t: "rows", choices: help, primary: true, ghost: "later" });
      return;
    }
    setNotQuiteUsed(true);
    evo(
      { t: "evo", text: "Thanks — help me get closer. What feels most true?" },
      { t: "chips", tag: "refine", options: ["It’s the subject", "I’m just tired", "Something else"] },
    );
  };

  const onHelp = (id: number, c: Choice) => {
    mark(id, { picked: c.label });
    if (c.label.startsWith("Breathe")) return router.push("/calm");
    push({ t: "user", text: c.label });
    if (c.label.startsWith("Make")) {
      evo(
        { t: "evo", text: "Here’s a gentle plan. We’ll start with the easiest step, and I’ll be here after each one." },
        { t: "plan" },
        { t: "chips", tag: "plan", options: ["Make it smaller", "Remind me in 30 min", "Change a step"] },
      );
    } else if (c.label.startsWith("I just")) {
      evo({ t: "evo", text: "Got it — no fixing. I’m listening. What happened?" });
    } else {
      evo(
        { t: "evo", text: "You haven’t connected a psychologist yet. You can do that from Settings whenever you’re ready — nothing is shared without your OK." },
        { t: "chips", tag: "psych", options: ["Open Settings", "Not now"] },
      );
    }
  };

  const onChip = (id: number, tag: string, option: string) => {
    mark(id, { picked: option });
    if (tag === "psych" && option === "Open Settings") return router.push("/settings");
    push({ t: "user", text: option });
    if (tag === "refine") {
      showInsight(option === "I’m just tired" ? insightTired : baseInsight, "Okay, that changes things. Here’s another way to see it:");
    } else if (tag === "plan") {
      const reply =
        option === "Make it smaller"
          ? "Let’s shrink step 1: open a blank page and write one worry. That’s it — under a minute."
          : option.startsWith("Remind")
            ? `Done — I’ll nudge you at ${clock(inMinutes(30))}. No pressure.`
            : "Sure. Which step would you like to change? Tell me in your own words.";
      evo({ t: "evo", text: reply });
    } else {
      evo({ t: "evo", text: "That’s okay. I’ll be here when you’re ready." });
    }
  };

  const onType = (text: string) => {
    if (riskCheck(text) === "high") {
      router.push(`/safety?m=${encodeURIComponent(text)}`);
      return;
    }
    push({ t: "user", text });
    evo({ t: "evo", text: "Thank you for putting that into words. What feels hardest about it right now?" }, { t: "rows", choices: weighing, ghost: "type" });
  };

  const focusComposer = () => composer.current?.querySelector("textarea")?.focus();

  /* ---------- render ---------- */

  const render = (b: Keyed): ReactNode => {
    switch (b.t) {
      case "date":
        return <DatePill>{b.label}</DatePill>;
      case "evo":
        return <EvoText text={b.text} size={b.headline ? "headline" : "body"} />;
      case "label":
        return <p className="type-label-m text-ink">{b.text}</p>;
      case "user":
        return <UserBubble>{b.text}</UserBubble>;
      case "tiles":
        return (
          <div className="grid w-full grid-cols-2 gap-[9px]">
            {b.choices.map((c, i) => (
              <MoodTile
                key={c.label}
                choice={c}
                index={i}
                selected={b.picked === c.label}
                dimmed={!!b.picked && b.picked !== c.label}
                onPick={() => onArrive(b.id, c)}
              />
            ))}
          </div>
        );
      case "rows": {
        const onPick = b.primary ? onHelp : onWeigh;
        return (
          <div className="flex w-full flex-col gap-2">
            <div className={cn("flex w-full flex-col gap-2", b.primary && "md:hidden")}>
              {b.choices.map((c, i) => (
                <OptionRow
                  key={c.label}
                  choice={c}
                  index={i}
                  primary={b.primary && i === 0 && !b.picked}
                  selected={b.picked === c.label}
                  dimmed={!!b.picked && b.picked !== c.label}
                  onPick={() => onPick(b.id, c)}
                />
              ))}
            </div>
            {b.primary && <HelpChips choices={b.choices} picked={b.picked} onPick={(c) => onPick(b.id, c)} />}
            {!b.picked &&
              (b.ghost === "later" ? (
                <GhostAction
                  icon="moon"
                  label="Not right now"
                  onClick={() => {
                    mark(b.id, { picked: "later" });
                    push({ t: "user", text: "Not right now" });
                    evo({ t: "evo", text: "That’s okay. I’ll be here when you’re ready." });
                  }}
                />
              ) : (
                <GhostAction icon="pencil" label="Type it myself" onClick={focusComposer} />
              ))}
          </div>
        );
      }
      case "insight":
        return <InsightCard insight={b.insight} confirmed={b.confirmed} />;
      case "confirm":
        return (
          <div className="flex gap-2.5">
            <Pill
              label="Yes, that’s me"
              icon={null}
              height={48}
              disabled={!!b.picked && b.picked !== "yes"}
              onClick={() => !b.picked && onConfirm(b.id, true)}
            />
            <Pill
              label="Not quite"
              variant="glass"
              icon={null}
              height={48}
              disabled={!!b.picked && b.picked !== "no"}
              onClick={() => !b.picked && onConfirm(b.id, false)}
            />
          </div>
        );
      case "chips":
        return (
          <div className="flex w-full flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {b.options
                .filter((o) => !b.picked || o === b.picked)
                .map((o, i) => (
                  <motion.div
                    key={o}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ ...spring.snappy, delay: b.picked ? 0 : i * 0.04 }}
                  >
                    <SoftChip label={o} selected={b.picked === o} onClick={() => !b.picked && onChip(b.id, b.tag, o)} />
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        );
      case "plan":
        return <PlanCard plan={plan} onStart={() => router.push("/step-booked")} />;
    }
  };

  return (
    <Screen glows={glows.chat} wide={wideGlows.chat} app full>
      <div className="flex flex-1 md:gap-4 md:pr-4">
        <ChatList active="Exam stress" className="hidden md:flex xl:hidden" />

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-20 bg-gradient-to-b from-paper via-paper/85 via-60% to-paper/0 pt-[54px] pb-5 md:bg-none md:bg-paper/70 md:px-4 md:pt-4 md:pb-6 md:backdrop-blur-[18px] md:[mask-image:linear-gradient(to_bottom,black_78%,transparent)]">
            <div className="md:hidden">
              <ChatHeader />
            </div>
            <div className="mx-auto hidden max-w-[740px] md:block">
              <WideChatHeader />
            </div>
            <div className="mx-auto mt-3 px-6 empty:hidden md:max-w-[648px] md:px-0 xl:max-w-[620px]">
              <OfflineBanner />
            </div>
          </div>

          <div className="mx-auto flex w-full flex-col gap-[18px] px-6 pt-1 pb-6 md:max-w-[696px] xl:max-w-[668px]" aria-live="polite">
            {blocks.map((b) => (
              <motion.div key={b.id} layout="position" transition={spring.default} className="w-full">
                {render(b)}
              </motion.div>
            ))}
            <AnimatePresence>{typing && <TypingDots key="typing" />}</AnimatePresence>
            <div ref={end} className="h-px" />
          </div>

          <div
            ref={composer}
            className="sticky bottom-0 z-20 mt-auto flex flex-col items-center gap-2.5 bg-gradient-to-b from-paper/0 via-paper/95 via-35% to-paper px-5 pt-7 pb-6 md:from-paper/0 md:via-paper/80 md:to-paper/95 md:pb-4"
          >
            <div className="w-full md:max-w-[680px]">
              <Composer placeholder="Reply to Evo…" onSend={onType} />
            </div>
            <PrivacyNote />
          </div>
        </section>

        <PlanPanel className="my-4 hidden xl:flex" />
      </div>
    </Screen>
  );
}

/** Tablet/desktop help options: forest chip for the recommended one, soft chips for the rest. */
function HelpChips({ choices, picked, onPick }: { choices: Choice[]; picked?: string; onPick: (c: Choice) => void }) {
  return (
    <div className="hidden flex-wrap gap-2 md:flex">
      <AnimatePresence initial={false}>
        {choices
          .filter((c) => !picked || c.label === picked)
          .map((c, i) =>
            i === 0 && !picked ? (
              <motion.button
                key={c.label}
                layout
                type="button"
                onClick={() => onPick(c)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={spring.snappy}
                className="group flex h-[46px] cursor-pointer items-center gap-2 rounded-full px-5 type-label-m text-white shadow-[0_14px_28px_-10px_rgba(20,26,18,0.35)]"
                style={{ background: "var(--gradient-forest)" }}
              >
                {c.label}
                <Icon name="arrow-right" size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </motion.button>
            ) : (
              <motion.div
                key={c.label}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ ...spring.snappy, delay: picked ? 0 : i * 0.04 }}
              >
                <SoftChip label={c.label} height={44} selected={picked === c.label} onClick={() => !picked && onPick(c)} />
              </motion.div>
            ),
          )}
      </AnimatePresence>
    </div>
  );
}
