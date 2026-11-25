"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { excuses, isEmail, normalizeEmail, type ExcuseId, type Signup } from "@/lib/early-access/content";
import { captureAttribution, hasRef, postSignup, track } from "@/lib/early-access/client";
import { lockScroll, scrollByAmount, scrollToElement } from "@/lib/early-access/scroll";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";
import { Footer, Header } from "./chrome";
import { EmailField, type FieldStatus } from "./email-field";
import { EvoSheet, useIsDesk } from "./evo-reply";
import { LightBackdrop } from "./light-backdrop";
import { PickView } from "./pick-view";

// Step C is only needed after a signup — keep it out of the first load and warm it up on first typing.
const loadSuccess = () => import("./success-view").then((m) => m.SuccessView);
const SuccessView = dynamic(loadSuccess);

type HistoryState = { step: "a" | "c" };
type View = "pick" | "success";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * The whole early-access page (handoff §1, light design). A pick a line → B Evo answers
 * (bottom sheet on phones, popover on desktop) → C. Only the success step is pushed to history (`?step=c`).
 * Pass `confirmed` on the email-link landing page to start on C with “You’re in, for real.”.
 */
export function EarlyAccessFlow({ confirmed }: { confirmed?: Signup }) {
  const reduced = useReducedMotion();
  const desk = useIsDesk();
  const [view, setView] = useState<View>(confirmed ? "success" : "pick");
  const [excuse, setExcuse] = useState<ExcuseId | null>(null);
  const [saved, setSaved] = useState(false); // Evo’s step was handed to the email field
  const [pulse, setPulse] = useState(0);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FieldStatus>("idle");
  const [signup, setSignup] = useState<Signup | null>(confirmed ?? null);
  const signupRef = useRef(signup);
  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sheetEl = useRef<HTMLDivElement | null>(null);
  const restoreY = useRef<number | null>(null);

  const choice = excuses.find((e) => e.id === excuse) ?? null;
  const sheetOpen = !desk && !!choice && !saved && view === "pick";

  useEffect(() => {
    captureAttribution();
    if (!confirmed) history.replaceState({ step: "a" } satisfies HistoryState, "");
  }, [confirmed]);

  // No scrolling behind an open sheet.
  useEffect(() => (sheetOpen ? lockScroll() : undefined), [sheetOpen]);

  // Warm up step C as soon as there’s something to submit.
  useEffect(() => {
    if (email) void loadSuccess();
  }, [email]);

  // Browser Back / Forward: only the success step lives in history (picking a line never touches it,
  // so opening/closing the answer is pure client state — no navigation, no re-render of the route).
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const st = e.state as HistoryState | null;
      if (st?.step === "c" && signupRef.current) setView("success");
      else {
        setView("pick");
        setSaved(true); // keep the picked line attached to the email; don't reopen the sheet
        requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Phone sheet: scroll the page so the picked line sits just above it (smoothly), like the design.
  useEffect(() => {
    if (!sheetOpen) return;
    if (restoreY.current === null) restoreY.current = window.scrollY;
    const id = requestAnimationFrame(() => {
      const bubble = document.querySelector<HTMLElement>('[aria-pressed="true"]');
      const sheet = sheetEl.current;
      if (!bubble || !sheet) return;
      const gap = 24;
      const delta = bubble.getBoundingClientRect().bottom - (window.innerHeight - sheet.offsetHeight - gap);
      scrollByAmount(delta);
    });
    return () => cancelAnimationFrame(id);
  }, [sheetOpen, excuse]);

  const url = (step: string) => {
    const q = new URLSearchParams(window.location.search);
    q.set("step", step);
    return `?${q}`;
  };

  const select = (id: ExcuseId) => {
    track("line_selected", { excuse_id: id, order: excuses.findIndex((e) => e.id === id) + 1 });
    setSaved(false);
    setExcuse(id);
  };

  /** Close the answer. On phones, glide back to where the page was before the sheet scrolled it. */
  const deselect = useCallback(() => {
    setSaved(false);
    setExcuse(null);
    if (restoreY.current !== null) {
      const back = restoreY.current - window.scrollY;
      restoreY.current = null;
      requestAnimationFrame(() => scrollByAmount(back));
    }
  }, []);

  /** “Save this step · join early access”: hand off to the email field. */
  const useStep = useCallback(() => {
    restoreY.current = null;
    setSaved(true);
    setPulse((p) => p + 1);
    requestAnimationFrame(() =>
      scrollToElement(document.getElementById("ea-email-field"), -160, () => {
        inputRef.current?.focus({ preventScroll: true });
        setPulse((p) => p + 1);
      }),
    );
  }, []);

  const goSuccess = useCallback((data: Signup) => {
    signupRef.current = data;
    setSignup(data);
    history.pushState({ step: "c" } satisfies HistoryState, "", url("c"));
    setView("success");
    window.scrollTo({ top: 0 });
  }, []);

  const submit = async () => {
    const clean = normalizeEmail(email);
    if (!isEmail(clean)) {
      setStatus("invalid");
      track("email_invalid", { reason: "format" });
      inputRef.current?.focus();
      return;
    }
    track("email_submitted", { step: excuse ? "b" : "a", excuse_id: excuse });
    setEmail(clean);
    setStatus("loading");
    const r = await postSignup(clean, excuse);
    if (r.kind === "ok") {
      track("signup_success", { already: !!r.data.already, wave: r.data.wave, has_ref: hasRef() });
      if (r.data.already) {
        setStatus("already");
        await sleep(1200);
      }
      setStatus("idle");
      goSuccess(r.data);
    } else if (r.kind === "invalid") {
      setStatus("invalid");
      track("email_invalid", { reason: "server" });
      inputRef.current?.focus();
    } else {
      setStatus(r.kind === "rate" ? "rate" : "offline");
      track("signup_failed", { code: r.kind === "rate" ? 429 : "network" });
    }
  };

  const form = (
    <EmailField
      value={email}
      onChange={(v) => {
        setEmail(v);
        if (status === "invalid" || status === "offline" || status === "rate") setStatus("idle");
      }}
      onSubmit={submit}
      status={status}
      inputRef={inputRef}
      attached={saved && choice ? `${choice.step.slice(0, choice.step.indexOf("."))}…` : null}
      pulse={pulse}
    />
  );

  return (
    <div className="relative isolate min-h-dvh overflow-x-clip bg-paper text-t1">
      <LightBackdrop />

      <motion.div
        className={cn("ea-stage relative z-10 mx-auto flex min-h-dvh w-full max-w-[560px] flex-col px-5 pb-8 desk:max-w-[1200px] desk:px-0 desk:pb-10", sheetOpen && "ea-sheet-open")}
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        inert={sheetOpen}
      >
        <Header right={view === "success" ? "You’re on the list" : "For students, exam aspirants & young pros"} />
        <main className="flex flex-1 flex-col justify-start py-6 desk:justify-center desk:py-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
            >
              {view === "pick" || !signup ? (
                <PickView excuseId={excuse} answerOpen={!saved} onSelect={select} onDeselect={deselect} onUse={useStep} headingRef={headingRef} form={form} />
              ) : (
                <SuccessView signup={signup} email={email || undefined} confirmed={signup.status === "confirmed"} excuseId={excuse} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
        <div className="ea-dimmable">
          <Footer />
        </div>
      </motion.div>

      <AnimatePresence>{sheetOpen && choice && <EvoSheet key="sheet" choice={choice} onClose={deselect} onUse={useStep} onAnother={deselect} sheetRef={(el) => (sheetEl.current = el)} />}</AnimatePresence>
    </div>
  );
}
