"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { glows } from "@/components/ui/backdrop";
import { BackButton, Toggle } from "@/components/ui/controls";
import { Icon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";
import { ease, haptic, spring } from "@/lib/motion";
import { lookupCode, normaliseCode } from "@/lib/practice";
import { useApp, type Psychologist } from "@/lib/store";

type Status = "idle" | "checking" | "matched" | "missing";

const SHARES = [
  { key: "mood", label: "Mood & energy trend" },
  { key: "steps", label: "Steps and wins" },
  { key: "summary", label: "Evo’s weekly summary" },
] as const;

/** 27 · Connect your psychologist — invite code, match, per-item sharing (all off by default). */
export default function ConnectPsychologist() {
  const app = useApp();
  const router = useRouter();
  const connected = app.psychologist;
  const [code, setCode] = useState(connected?.code ?? "");
  const [status, setStatus] = useState<Status>(connected ? "matched" : "idle");
  const [match, setMatch] = useState<Psychologist | null>(connected);
  const [shares, setShares] = useState(app.shares);
  const [confirmOff, setConfirmOff] = useState(false);

  const req = useRef(0);
  // Look the code up as soon as it has the full shape (e.g. MEERA-4K2).
  const onCode = (raw: string) => {
    const next = normaliseCode(raw);
    setCode(next);
    const id = ++req.current;
    if (!/^[A-Z]{3,}-[0-9A-Z]{3}$/.test(next)) {
      setStatus("idle");
      setMatch(null);
      return;
    }
    setStatus("checking");
    lookupCode(next).then((p) => {
      if (id !== req.current) return;
      setMatch(p);
      setStatus(p ? "matched" : "missing");
      haptic(p ? "success" : "warning");
    });
  };

  const first = match?.name.replace(/^Dr\.\s*/, "").split(" ")[0];
  const dirty = connected && JSON.stringify(shares) !== JSON.stringify(app.shares);

  const connect = () => {
    if (!match) return;
    app.update({ psychologist: match, shares, consents: { ...app.consents, psychologist: true } });
    haptic("success");
    router.push("/settings");
  };

  const disconnect = () => {
    app.update({ psychologist: null, shares: { mood: false, steps: false, summary: false }, consents: { ...app.consents, psychologist: false } });
    setConfirmOff(false);
    setCode("");
    setShares({ mood: false, steps: false, summary: false });
    router.push("/settings");
  };

  return (
    <Screen glows={glows.onboarding} app>
      <div className="flex flex-1 flex-col gap-3 px-6 pt-[50px] pb-6">
        <BackButton href="/settings" />
        <h1 className="text-[30px] leading-[1.08] font-medium tracking-[-0.9px] text-ink">Connect your psychologist</h1>
        <p className="type-body-m text-t2">Only if you already see one. Evo works fully on its own.</p>

        <label className="flex flex-col gap-1.5">
          <span className="type-label-s text-t2">Code from your psychologist</span>
          <span
            className={cn(
              "flex h-[52px] items-center rounded-2xl border-2 bg-white px-4 transition-colors duration-200",
              status === "missing" ? "border-t-danger" : status === "matched" ? "border-lime" : "border-line-strong focus-within:border-lime",
            )}
          >
            <input
              value={code}
              onChange={(e) => onCode(e.target.value)}
              placeholder="e.g. MEERA-4K2"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              disabled={!!connected}
              className="min-w-0 flex-1 bg-transparent type-title-m text-t1 outline-none placeholder:text-t-disabled focus-visible:outline-none disabled:text-t1"
            />
            <AnimatePresence mode="wait" initial={false}>
              {status === "checking" && (
                <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="size-[18px] animate-spin rounded-full border-2 border-lime border-t-transparent" />
              )}
              {status === "matched" && (
                <motion.span key="ok" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={spring.snappy} className="text-lime-deep">
                  <Icon name="check" size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          {status === "missing" && <span className="type-caption text-t-danger">That code didn’t match. Check it with your psychologist — codes look like NAME-4K2.</span>}
        </label>

        <AnimatePresence initial={false}>
          {match && (
            <motion.div
              key="match"
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={ease.out}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 rounded-3xl p-3.5" style={{ background: "var(--gradient-forest)" }}>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-lime-soft type-label-m text-forest">{match.initials}</span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="type-title-m text-white">{match.name}</span>
                  <span className="type-body-s text-lime">
                    {match.role} · {match.city}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-lime/16 px-2.5 py-[5px] type-caption text-lime">{connected ? "Connected" : "Code matched"}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glass flex flex-col gap-1 rounded-[22px] px-4 py-2.5">
          <p className="type-label-s text-t3">What {first ? `Dr. ${first}` : "they"} can see — all off until you choose</p>
          {SHARES.map((s) => (
            <div key={s.key} className="flex items-center gap-2.5 py-2">
              <span className={cn("flex-1 type-label-m", match ? "text-t1" : "text-t-disabled")}>{s.label}</span>
              <Toggle label={s.label} on={shares[s.key]} onChange={(v) => match && setShares({ ...shares, [s.key]: v })} />
            </div>
          ))}
          <div className="flex items-center gap-2.5 py-2">
            <span className="flex-1 type-label-m text-t2">Your private chats</span>
            <span className="flex items-center gap-1 type-caption text-t3">
              <Icon name="lock" size={12} /> Never
            </span>
          </div>
        </div>
        <p className="type-caption text-t3">You choose what to share before each session, and can take it back anytime.</p>

        {connected ? (
          <button type="button" onClick={() => setConfirmOff(true)} className="cursor-pointer self-center py-2 type-label-m text-t-danger">
            Disconnect {connected.name}
          </button>
        ) : (
          <div className="rounded-2xl bg-brand-subtle px-3.5 py-3 type-body-s text-t2">
            No code? Ask your psychologist to invite you from Lumid Practice — or{" "}
            <button type="button" onClick={() => router.push("/settings")} className="cursor-pointer text-lime-deep underline-offset-2 hover:underline">
              skip this for now
            </button>
            .
          </div>
        )}

        <div className="mt-auto pt-6">
          {connected ? (
            <Pill
              label={dirty ? "Save sharing choices" : "Done"}
              icon={dirty ? "check" : "arrow-right"}
              className="w-full"
              onClick={() => {
                if (dirty) app.update({ shares });
                router.push("/settings");
              }}
            />
          ) : (
            <Pill label={match ? `Connect with Dr. ${first}` : "Enter a code to connect"} className="w-full" disabled={!match} onClick={connect} />
          )}
        </div>
      </div>

      <Sheet open={confirmOff} onClose={() => setConfirmOff(false)} label="Disconnect psychologist">
        <div className="flex flex-col gap-3.5 px-1 pb-2">
          <h2 className="text-[24px] leading-[1.1] font-medium tracking-[-0.6px] text-ink">Disconnect {connected?.name}?</h2>
          <p className="type-body-m text-t2">Sharing stops right away and anything you shared is taken back. Evo keeps working exactly the same for you.</p>
          <button type="button" onClick={disconnect} className="flex h-[54px] cursor-pointer items-center justify-center rounded-full bg-t-danger type-label-m text-white">
            Disconnect
          </button>
          <button type="button" onClick={() => setConfirmOff(false)} className="cursor-pointer type-label-m text-t1">
            Keep connected
          </button>
        </div>
      </Sheet>
    </Screen>
  );
}
