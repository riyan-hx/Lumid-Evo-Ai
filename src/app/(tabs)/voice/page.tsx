"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { glows } from "@/components/ui/backdrop";
import { SoftChip } from "@/components/ui/controls";
import { Icon } from "@/components/ui/icons";
import { PlusBadge } from "@/components/ui/list";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/cn";
import { ease, haptic, spring } from "@/lib/motion";
import { langFor, useSpeech, type SpeechLang } from "@/lib/speech";
import { useApp } from "@/lib/store";

type Mode = "talk" | "listen";

const ML_FONT = { fontFamily: '"Anek Malayalam", "Noto Sans Malayalam", "Manjari", var(--font-sans)' };
const LANGS: Record<SpeechLang, { label: string; ml?: boolean }> = {
  "en-IN": { label: "English" },
  "ml-IN": { label: "മലയാളം", ml: true },
};

const chatHref = (text?: string) => `/chat?checkedIn=1${text?.trim() ? `&q=${encodeURIComponent(text.trim())}` : ""}`;

const PROBLEMS = {
  denied: {
    title: "Evo can’t hear you yet",
    body: "Microphone access is blocked. Allow it for this site in your browser settings, then tap the mic again.",
  },
  unsupported: {
    title: "Voice isn’t available in this browser",
    body: "Try Chrome or Edge on your phone or laptop — or just type it out.",
  },
  error: {
    title: "Couldn’t catch that",
    body: "Speech recognition didn’t respond. Check your connection or microphone and try again.",
  },
} as const;

/** 15 · Voice with Evo — talk it through in English or Malayalam. Only the text ever leaves this screen. */
export default function Voice() {
  const app = useApp();
  const router = useRouter();

  // Toggle order follows the languages picked in onboarding; both are always offered.
  const order = Array.from(new Set([...(app.languages ?? []).map(langFor), "en-IN", "ml-IN"] as SpeechLang[]));
  const [lang, setLang] = useState<SpeechLang>(order[0]);
  const [mode, setMode] = useState<Mode>("listen");
  const modeRef = useRef<Mode>(mode);
  const handoff = useRef(false);

  const onEnd = useCallback(
    (text: string) => {
      const go = handoff.current && modeRef.current === "talk" && text.trim();
      handoff.current = false;
      if (go) {
        haptic("success");
        router.push(chatHref(text));
      }
    },
    [router],
  );
  const speech = useSpeech({ lang, onEnd });
  const { status, listening, finalText, interim, text, pulse, speaking } = speech;
  const problem = status === "denied" || status === "unsupported" || status === "error" ? PROBLEMS[status] : null;
  const ml = LANGS[lang].ml;

  const toggleMic = () => {
    haptic("light");
    if (listening) {
      handoff.current = true;
      speech.stop();
    } else {
      handoff.current = false;
      speech.start();
    }
  };

  const pickLang = (l: SpeechLang) => {
    if (l === lang) return;
    haptic("selection");
    speech.cancel();
    setLang(l);
  };

  const pickMode = (m: Mode) => {
    modeRef.current = m;
    setMode(m);
  };

  const label = listening
    ? speaking
      ? "Evo is listening…"
      : "Listening — take your time"
    : problem
      ? "Voice is off"
      : text
        ? "Paused — tap the mic to keep going"
        : "Tap the mic and start talking";

  return (
    <Screen glows={glows.focus} nav>
      <div className="flex flex-1 flex-col px-6 pt-[54px]">
        {/* Language + Plus */}
        <div className="relative flex h-11 items-center justify-center">
          <div
            role="radiogroup"
            aria-label="Language"
            className="flex items-center gap-1 rounded-full border border-white bg-white/78 p-1 shadow-[0_10px_13px_rgba(26,64,20,0.07)] backdrop-blur-[12px]"
          >
            {order.map((l) => {
              const on = l === lang;
              return (
                <motion.button
                  key={l}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={l === "ml-IN" ? "Malayalam" : "English"}
                  onClick={() => pickLang(l)}
                  whileTap={{ scale: 0.96 }}
                  transition={spring.snappy}
                  className="relative flex h-7 cursor-pointer items-center rounded-full px-3.5"
                >
                  {on && <motion.span layoutId="voice-lang" className="absolute inset-0 rounded-full" style={{ background: "var(--gradient-forest)" }} transition={spring.snappy} />}
                  <span
                    className={cn("relative whitespace-nowrap transition-colors duration-150", LANGS[l].ml ? "text-[13px] leading-[1.35] font-medium" : "type-label-s", on ? "text-white" : "text-t2")}
                    style={LANGS[l].ml ? ML_FONT : undefined}
                  >
                    {LANGS[l].label}
                  </span>
                </motion.button>
              );
            })}
          </div>
          <span className="absolute right-0">
            <PlusBadge />
          </span>
        </div>

        {/* Mode */}
        <div className="mt-5 flex justify-center gap-2">
          <SoftChip label="Talk it out" height={36} selected={mode === "talk"} onClick={() => pickMode("talk")} />
          <SoftChip label="Just listen" height={36} selected={mode === "listen"} onClick={() => pickMode("listen")} />
        </div>

        {/* Orb + live waves */}
        <motion.button
          type="button"
          onClick={toggleMic}
          whileTap={{ scale: 0.97 }}
          transition={spring.gentle}
          tabIndex={-1}
          aria-hidden
          className="relative mx-auto mt-1 flex size-[276px] max-w-full cursor-pointer items-center justify-center"
        >
          <motion.span
            aria-hidden
            className="absolute inset-0"
            animate={{ rotate: listening ? 360 : 0, opacity: listening ? 1 : 0.45 }}
            transition={listening ? { rotate: { duration: 28, repeat: Infinity, ease: "linear" }, opacity: ease.out } : { duration: 0.6 }}
          >
            <motion.span
              key={pulse}
              className="absolute inset-0"
              initial={{ scale: listening && speaking ? 1.06 : 1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static Figma vector, fixed box */}
              <img src="/evo/voice-waves.svg" alt="" width={275.52} height={275.52} draggable={false} className="block size-full select-none" />
            </motion.span>
          </motion.span>
          <motion.span animate={{ scale: listening ? (speaking ? 1.05 : 1.02) : 1 }} transition={spring.gentle}>
            <Orb size={200} state={listening ? "breathing" : "idle"} />
          </motion.span>
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.p
            key={label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={ease.out}
            aria-live="polite"
            className={cn("mt-1 text-center type-label-m", listening ? "text-lime-deep" : "text-t3")}
          >
            {label}
          </motion.p>
        </AnimatePresence>

        {/* Transcript / problem card */}
        <motion.div layout transition={spring.default} className="mt-3 flex flex-col gap-2.5 rounded-[26px] border border-white bg-white/85 px-5 py-4 shadow-[0_10px_13px_rgba(26,64,20,0.07)] backdrop-blur-[12px]">
          {problem ? (
            <>
              <span className="flex items-center gap-2">
                <Icon name="mic" size={16} className="text-peach-text" />
                <span className="type-label-m text-ink">{problem.title}</span>
              </span>
              <p className="type-body-s text-t2">{problem.body}</p>
              <div className="flex flex-wrap gap-2">
                <Pill label="Type instead" icon="pencil" variant="forest" height={40} href="/chat?checkedIn=1" />
                {status !== "unsupported" && <Pill label="Try again" icon={null} variant="glass" height={40} onClick={toggleMic} />}
              </div>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5 type-label-s text-t3">
                {listening && <motion.span className="size-1.5 rounded-full bg-lime" animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />}
                {listening ? "YOU · LIVE" : text ? "YOU" : "YOU · READY"}
              </span>
              <p className={cn("min-h-[46px] text-[17px] leading-[1.35] break-words", !text && "text-t3")} style={ml ? ML_FONT : undefined}>
                {text ? (
                  <>
                    <span className="text-ink">{finalText}</span>
                    {interim && <span className="text-t3">{finalText ? " " : ""}{interim}</span>}
                  </>
                ) : ml ? (
                  "മനസ്സിലുള്ളത് പറഞ്ഞോളൂ…"
                ) : (
                  "Say what’s on your mind. It doesn’t have to make sense yet."
                )}
              </p>
              <span className="flex items-center gap-1.5 type-caption text-t3">
                <Icon name="sparkle" size={12} className="shrink-0" />
                {mode === "talk" ? "When you stop, Evo picks this up in chat." : "This stays on this screen unless you save it."}
              </span>
              <AnimatePresence>
                {text && !listening && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={ease.out} className="flex flex-wrap gap-2 overflow-hidden">
                    <Pill label={mode === "talk" ? "Talk it out" : "Save as text"} icon="arrow-right" variant="lime" height={40} href={chatHref(text)} />
                    <Pill label="Clear" icon={null} variant="glass" height={40} onClick={speech.reset} />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>

        {/* Controls */}
        <div className="mt-auto flex items-center justify-center gap-[26px] pt-8">
          <motion.button
            type="button"
            aria-label={text ? "Save as text" : "Type instead"}
            onClick={() => {
              haptic("light");
              speech.cancel();
              router.push(chatHref(text));
            }}
            whileTap={{ scale: 0.92 }}
            transition={spring.snappy}
            className="flex size-14 cursor-pointer items-center justify-center rounded-[28px] border border-white bg-white/78 text-ink shadow-[0_10px_13px_rgba(26,64,20,0.07)] backdrop-blur-[12px]"
          >
            <Icon name="pencil" size={20} />
          </motion.button>

          <motion.button
            type="button"
            aria-label={listening ? "Stop listening" : "Start listening"}
            aria-pressed={listening}
            onClick={toggleMic}
            whileTap={{ scale: 0.94 }}
            transition={spring.snappy}
            className="relative flex size-[88px] cursor-pointer items-center justify-center rounded-full"
          >
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full bg-lime/25"
              animate={listening ? { scale: [1, 1.14, 1], opacity: [1, 0.6, 1] } : { scale: 1, opacity: 1 }}
              transition={listening ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : ease.out}
            />
            <span
              className="relative flex size-[72px] items-center justify-center rounded-full text-lime shadow-[0_12px_24px_-6px_rgba(20,26,19,0.3)]"
              style={{ background: "linear-gradient(135deg, #33412e 0%, #151a13 100%)" }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {listening ? (
                  <motion.span key="stop" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={ease.outFast} className="size-[18px] rounded-[5px] bg-lime" />
                ) : (
                  <motion.span key="mic" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={ease.outFast}>
                    <Icon name="mic" size={28} />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </motion.button>

          <motion.button
            type="button"
            aria-label="Stop and clear"
            disabled={!listening && !text}
            onClick={() => {
              haptic("light");
              handoff.current = false;
              speech.reset();
            }}
            whileTap={{ scale: 0.92 }}
            transition={spring.snappy}
            className="flex size-14 cursor-pointer items-center justify-center rounded-[28px] bg-peach-soft text-peach-text transition-opacity duration-200 disabled:cursor-default disabled:opacity-50"
          >
            <Icon name="plus" size={22} className="rotate-45" />
          </motion.button>
        </div>

        <p className="mt-2.5 pb-4 text-center type-caption text-t3">
          <Icon name="lock" size={11} className="mr-1 inline-block align-[-1px]" />
          Evo doesn’t keep your voice — only the text you approve. Your browser turns speech into text.
        </p>
      </div>
    </Screen>
  );
}
