"use client";

import { motion, useAnimationControls } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { haptic, spring } from "@/lib/motion";

type ComposerProps = {
  placeholder?: string;
  /** Where to go on send when no onSend is given (e.g. Home → chat). */
  href?: string;
  onSend?: (text: string) => void;
  variant?: "glass" | "brand";
  micTile?: boolean;
  autoFocus?: boolean;
  className?: string;
};

/** 60 px composer: text, mic, forest send button. Enter sends, Shift+Enter = new line. */
export function Composer({
  placeholder = "Tell Evo anything…",
  href,
  onSend,
  variant = "glass",
  micTile,
  autoFocus,
  className,
}: ComposerProps) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const arrow = useAnimationControls();

  const send = () => {
    const value = text.trim();
    haptic("light");
    arrow.start({ y: [0, -3, 0], transition: { duration: 0.3 } });
    if (onSend) {
      if (!value) return;
      onSend(value);
      setText("");
    } else if (href) {
      router.push(value ? `${href}${href.includes("?") ? "&" : "?"}q=${encodeURIComponent(value)}` : href);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      className={cn(
        "flex h-[60px] w-full items-center gap-1.5 overflow-hidden rounded-[30px] pr-1.5 transition-[border-color,box-shadow] duration-[160ms] ease-(--ease-out-evo)",
        variant === "brand"
          ? "border-[1.5px] border-lime bg-white pl-[18px] shadow-[0_12px_28px_-10px_rgba(97,191,59,0.22)]"
          : cn(
              "border bg-white/75 pl-5 shadow-[0_10px_26px_-8px_rgba(26,64,20,0.08)] backdrop-blur-[12px]",
              focused ? "border-lime" : "border-white",
            ),
        className,
      )}
    >
      <textarea
        rows={1}
        value={text}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        placeholder={placeholder}
        aria-label="Message Evo"
        className="max-h-[44px] min-w-0 flex-1 resize-none bg-transparent py-[19px] type-body-m text-ink outline-none placeholder:text-t3"
      />
      <motion.button
        type="button"
        aria-label="Hold to talk"
        whileTap={{ scale: 0.9 }}
        transition={spring.snappy}
        className={cn(
          "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[22px] text-t2",
          micTile && "bg-subtle",
        )}
      >
        <Icon name="mic" size={20} />
      </motion.button>
      <motion.button
        type="button"
        aria-label="Send"
        onClick={send}
        whileTap={{ scale: 0.92 }}
        transition={spring.snappy}
        className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-3xl text-white"
        style={{ background: "linear-gradient(135deg, #33412e 0%, #151a13 71.43%)" }}
      >
        <motion.span animate={arrow} className="flex">
          <Icon name="send" size={20} />
        </motion.span>
      </motion.button>
    </div>
  );
}
