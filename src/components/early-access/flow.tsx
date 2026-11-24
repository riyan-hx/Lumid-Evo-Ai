"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PosterBackground } from "@/components/launch/poster";
import { isEmail, normalizeEmail, type ExcuseId, type Signup } from "@/lib/early-access/content";
import { INTRO_KEY, captureAttribution, hasRef, postSignup, store, track } from "@/lib/early-access/client";
import { EASE_OUT } from "@/lib/motion";
import { Footer, Header } from "./chrome";
import { EmailField, type FieldStatus } from "./email-field";
import { IntroLoader } from "./intro-loader";
import { PickView } from "./pick-view";
import { SuccessView } from "./success-view";

type HistoryState = { step: "a" | "b" | "c"; excuse?: ExcuseId };
type View = "pick" | "success";
type Loader = "pending" | "running" | "done";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * The whole early-access page (handoff §1). Loader overlay → A pick a line → B Evo answers (same view,
 * a line is selected) → C confirm & pass. Steps are client state mirrored to history (`?step=`) so Back works.
 * Pass `confirmed` on the email-link landing page to start on C with “You’re in.”.
 */
export function EarlyAccessFlow({ confirmed }: { confirmed?: Signup }) {
  const reduced = useReducedMotion();
  const [loader, setLoader] = useState<Loader>(confirmed ? "done" : "pending");
  const [revealed, setRevealed] = useState(!!confirmed);
  const [view, setView] = useState<View>(confirmed ? "success" : "pick");
  const [excuse, setExcuse] = useState<ExcuseId | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FieldStatus>("idle");
  const [signup, setSignup] = useState<Signup | null>(confirmed ?? null);
  const signupRef = useRef(signup);
  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // First paint is server-rendered (loader overlay over step A); decide here whether to play the intro.
  useEffect(() => {
    captureAttribution();
    if (confirmed) return;
    history.replaceState({ step: "a" } satisfies HistoryState, "");
    // sessionStorage is only readable after mount, so the intro decision is made here.
    const seen = !!store.get(INTRO_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from sessionStorage
    setLoader(seen ? "done" : "running");
    if (seen) setRevealed(true);
  }, [confirmed]);

  // Browser Back / Forward between steps.
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const st = e.state as HistoryState | null;
      if (st?.step === "c" && signupRef.current) setView("success");
      else {
        setView("pick");
        setExcuse(st?.step === "b" ? (st.excuse ?? null) : null);
        requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const url = (step: string) => {
    const q = new URLSearchParams(window.location.search);
    q.set("step", step);
    return `?${q}`;
  };

  const select = (id: ExcuseId) => {
    track("line_selected", { excuse_id: id, order: ["lunch", "video", "fail", "much", "tomorrow"].indexOf(id) + 1 });
    const st: HistoryState = { step: "b", excuse: id };
    if (excuse) history.replaceState(st, "", url("b"));
    else history.pushState(st, "", url("b"));
    setExcuse(id);
  };
  const deselect = () => (history.state?.step === "b" ? history.back() : setExcuse(null));

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

  const onReveal = useCallback(() => {
    setRevealed(true);
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  }, []);
  const onDone = useCallback(() => setLoader("done"), []);
  const locked = loader !== "done";

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
      align="center"
    />
  );

  return (
    <div className="relative isolate min-h-dvh overflow-x-clip bg-[#0b0d0a] text-white">
      <noscript>
        <style>{`.ea-loader{display:none!important}.ea-stage{opacity:1!important;transform:none!important}`}</style>
      </noscript>
      <PosterBackground tone="night" />

      <motion.div
        className="ea-stage relative z-10 mx-auto flex min-h-dvh w-full max-w-[560px] flex-col px-5 pt-10 pb-8 desk:max-w-[1200px] desk:px-0 desk:pb-10"
        initial={false}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 8 }}
        transition={{ duration: reduced ? 0.2 : 0.4, ease: EASE_OUT }}
        inert={locked}
      >
        <Header right={view === "success" ? (signup?.status === "confirmed" || confirmed ? "You’re on the list" : "One last step") : "For students, exam aspirants & young pros"} tagOnMobile={view === "success"} />
        <main className="flex flex-1 flex-col justify-center py-8 desk:py-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
            >
              {view === "pick" || !signup ? (
                <PickView excuseId={excuse} onSelect={select} onDeselect={deselect} headingRef={headingRef} form={form} />
              ) : (
                <SuccessView signup={signup} email={email || undefined} confirmed={signup.status === "confirmed"} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </motion.div>

      {loader !== "done" && <IntroLoader run={loader === "running"} onReveal={onReveal} onDone={onDone} />}
    </div>
  );
}
