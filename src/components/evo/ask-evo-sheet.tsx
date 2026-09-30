"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { SoftChip } from "@/components/ui/controls";
import { Sheet } from "@/components/ui/sheet";
import { EvoText, UserBubble } from "./chat-bits";

export type AskContext = { card: string; line: string };

/** 11b · Ask Evo — contextual Q&A on any card, always with “How Evo knows”. */
export function AskEvoSheet({ context, onClose }: { context: AskContext | null; onClose: () => void }) {
  const router = useRouter();
  const [followUp, setFollowUp] = useState("");

  return (
    <Sheet open={!!context} onClose={onClose} label="Ask Evo">
      {context && (
        <>
          <div className="flex items-center gap-2.5">
            <Orb size={36} state="breathing" />
            <div className="flex flex-1 flex-col">
              <span className="type-label-m text-ink">Ask Evo about this</span>
              <span className="flex items-center gap-[5px] type-caption text-peach-text">
                <Icon name="cloud" size={12} />
                {context.card} · {context.line}
              </span>
            </div>
            <button type="button" aria-label="Close" onClick={onClose} className="cursor-pointer text-t3">
              <Icon name="chevron-down" size={18} />
            </button>
          </div>

          <UserBubble>Why is tonight hard?</UserBubble>
          <EvoText text="After dinner you’re usually tired and your phone is close by. That’s when Maths gets pushed." />

          <dl className="flex w-full flex-col rounded-[20px] bg-white px-3.5 py-1 type-label-s">
            {[
              ["Evidence", "Skipped 3 of the last 4 evenings"],
              ["From", "Your check-ins, Sep 24–28"],
              ["Confidence", "Medium — only 2 weeks of data"],
              ["Check yourself", "Is it tiredness, or the subject?"],
            ].map(([k, v], i, a) => (
              <div key={k} className={`flex gap-2.5 py-2.5 ${i < a.length - 1 ? "border-b border-line" : ""}`}>
                <dt className="w-24 shrink-0 text-t3">{k}</dt>
                <dd className="flex-1 text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-2">
            <Pill label="Book 6:45 instead" icon={null} height={40} className="px-[18px]" href="/step-booked" />
            <SoftChip label="It’s the subject" onClick={() => router.push("/chat?checkedIn=1")} height={40} />
            <SoftChip label="Open full chat" onClick={() => router.push("/chat?checkedIn=1")} height={40} />
          </div>

          <form
            className="flex h-[50px] w-full items-center gap-1.5 rounded-[25px] border border-line-strong bg-white pr-1.5 pl-4"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/chat?checkedIn=1${followUp ? `&q=${encodeURIComponent(followUp)}` : ""}`);
            }}
          >
            <input
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              placeholder="Ask a follow-up…"
              aria-label="Ask a follow-up"
              className="min-w-0 flex-1 bg-transparent type-body-m text-ink outline-none placeholder:text-t3"
            />
            <Icon name="mic" size={18} className="text-t2" />
            <button
              type="submit"
              aria-label="Send"
              className="flex size-10 cursor-pointer items-center justify-center rounded-[20px] text-white"
              style={{ background: "linear-gradient(135deg, #33412e 0%, #151a13 71.43%)" }}
            >
              <Icon name="send" size={18} />
            </button>
          </form>
        </>
      )}
    </Sheet>
  );
}
