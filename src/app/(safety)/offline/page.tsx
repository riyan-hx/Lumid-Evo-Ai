"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChatHeader, TypingDots, UserBubble } from "@/components/evo/chat-bits";
import { Composer } from "@/components/evo/composer";
import { OfflineBanner } from "@/components/evo/offline-banner";
import { TopWash, glows } from "@/components/ui/backdrop";
import { Icon } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Screen } from "@/components/ui/screen";
import { spring } from "@/lib/motion";

/** 31 · Offline & errors — reference of every failure state, all interactive. */
export default function Offline() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const retry = () => {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      setSent(true);
    }, 1200);
  };

  return (
    <Screen glows={glows.wash} under={<TopWash />}>
      <div className="flex flex-1 flex-col pt-[54px]">
        <ChatHeader subtitle="Exam stress" status={false} />
        <div className="mt-[18px] flex flex-col gap-3.5 px-6">
          <OfflineBanner forceShow />
          <p className="type-body-l text-t1">Want me to turn this into a small plan?</p>

          <div className="flex flex-col items-end gap-1.5">
            <div className={sent ? "w-full" : "w-full opacity-60"}>
              <UserBubble>yes, make it small please</UserBubble>
            </div>
            {!sent && (
              <button type="button" onClick={retry} className="flex cursor-pointer gap-1 type-caption">
                <span className="text-t3">Not sent · </span>
                <span className="text-t-danger">{retrying ? "Sending…" : "Tap to retry"}</span>
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {retrying ? (
              <TypingDots key="typing" />
            ) : (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring.snappy}
                className="glass flex w-full flex-col gap-2.5 rounded-[22px] px-4 py-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <Orb size={28} state="still" />
                  <p className="flex-1 type-label-m text-t1">Evo couldn’t reply just now. Your message is saved.</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={retry} className="h-9 cursor-pointer rounded-full bg-forest px-4 type-label-s text-white">
                    Try again
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/calm")}
                    className="h-9 cursor-pointer rounded-full border border-line bg-surface px-4 type-label-s text-t1"
                  >
                    Breathe offline
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            <span className="type-caption text-t3">Other states →</span>
            <TypingDots />
            <span className="type-caption text-t2">Evo is thinking…</span>
          </div>

          <a href="tel:14416" className="flex w-full items-center gap-2 rounded-[14px] bg-danger-subtle px-3.5 py-2.5 type-label-s text-t-danger">
            <Icon name="lifebuoy" size={16} />
            Crisis numbers work without internet: 14416 · 112
          </a>
        </div>
        <div className="sticky bottom-0 mt-auto px-5 pt-6 pb-[30px]">
          <Composer href="/chat?checkedIn=1" />
        </div>
      </div>
    </Screen>
  );
}
