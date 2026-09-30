"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * In-browser speech recognition (Web Speech API). Audio never leaves the browser's own recogniser
 * and nothing is stored here — the caller only ever gets text.
 */

export type SpeechLang = "en-IN" | "ml-IN";

/** Map a store language ("English" / "Malayalam") to a recogniser locale. */
export const langFor = (language: string | undefined): SpeechLang => (language?.toLowerCase().startsWith("mal") ? "ml-IN" : "en-IN");

/** idle · listening · denied (mic blocked) · unsupported (no API) · error (network, no mic…) */
export type SpeechStatus = "idle" | "listening" | "denied" | "unsupported" | "error";

/* Minimal typings — the Web Speech API isn't in lib.dom for every TS target. */
type Alternative = { transcript: string };
type Result = { isFinal: boolean; length: number; [i: number]: Alternative };
type ResultEvent = { resultIndex: number; results: { length: number; [i: number]: Result } };
type ErrorEvent = { error: string };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: ResultEvent) => void) | null;
  onerror: ((e: ErrorEvent) => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const noop = () => () => {};
/** null on the server (unknown), then true/false in the browser. */
export function useSpeechSupported(): boolean | null {
  return useSyncExternalStore(
    noop,
    () => getCtor() !== null,
    () => null,
  );
}

type Options = {
  lang: SpeechLang;
  /** Called once the recogniser has fully stopped, with the final text of the whole take. */
  onEnd?: (text: string) => void;
};

export function useSpeech({ lang, onEnd }: Options) {
  const supported = useSpeechSupported();
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  /** Bumps whenever speech is heard — drives the live waveform. */
  const [pulse, setPulse] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  const rec = useRef<Recognition | null>(null);
  const base = useRef(""); // text from earlier takes
  const latest = useRef(""); // base + this take's finals
  const live = useRef(""); // this take's not-yet-final words
  const errored = useRef(false);
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  const join = (a: string, b: string) => [a.trim(), b.trim()].filter(Boolean).join(" ");

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      setStatus("unsupported");
      return;
    }
    rec.current?.abort();
    const r = new Ctor();
    r.lang = lang;
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;
    base.current = latest.current;
    live.current = "";
    errored.current = false;

    r.onresult = (e) => {
      let finals = "";
      let liveText = "";
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        const text = res[0]?.transcript ?? "";
        if (res.isFinal) finals += text;
        else liveText += text;
      }
      latest.current = join(base.current, finals);
      setFinalText(latest.current);
      live.current = liveText.trim();
      setInterim(live.current);
      setPulse((p) => p + 1);
    };
    r.onspeechstart = () => setSpeaking(true);
    r.onspeechend = () => setSpeaking(false);
    r.onerror = (e) => {
      if (e.error === "aborted") return;
      if (e.error === "no-speech") return; // ends quietly; the caller shows the idle hint
      errored.current = true;
      setStatus(e.error === "not-allowed" || e.error === "service-not-allowed" ? "denied" : "error");
    };
    r.onend = () => {
      if (rec.current !== r) return;
      rec.current = null;
      setSpeaking(false);
      // Keep any trailing words the recogniser never finalised.
      if (live.current) latest.current = join(latest.current, live.current);
      live.current = "";
      setInterim("");
      setFinalText(latest.current);
      if (!errored.current) {
        setStatus("idle");
        onEndRef.current?.(latest.current);
      }
    };

    rec.current = r;
    try {
      r.start();
      setStatus("listening");
    } catch {
      rec.current = null;
      setStatus("error");
    }
  }, [lang]);

  /** Graceful stop: the recogniser flushes its last words, then `onEnd` fires. */
  const stop = useCallback(() => {
    rec.current?.stop();
  }, []);

  /** Stop without handing anything over and clear the text. */
  const reset = useCallback(() => {
    const r = rec.current;
    rec.current = null;
    r?.abort();
    base.current = "";
    latest.current = "";
    live.current = "";
    setFinalText("");
    setInterim("");
    setSpeaking(false);
    setStatus((s) => (s === "listening" ? "idle" : s));
  }, []);

  /** Abort the current take (e.g. language switch) but keep the text so far. */
  const cancel = useCallback(() => {
    const r = rec.current;
    rec.current = null;
    r?.abort();
    if (live.current) latest.current = join(latest.current, live.current);
    live.current = "";
    setInterim("");
    setFinalText(latest.current);
    setSpeaking(false);
    setStatus((s) => (s === "listening" ? "idle" : s));
  }, []);

  // Never leave the mic open after leaving the screen.
  useEffect(
    () => () => {
      const r = rec.current;
      rec.current = null;
      r?.abort();
    },
    [],
  );

  return {
    supported,
    status: supported === false ? ("unsupported" as const) : status,
    listening: status === "listening",
    /** Finalised text plus whatever is still being recognised. */
    text: join(finalText, interim),
    finalText,
    interim,
    pulse,
    speaking,
    start,
    stop,
    reset,
    cancel,
  };
}
