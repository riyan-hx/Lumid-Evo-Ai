"use client";

import { motion, useAnimationControls } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { glows } from "@/components/ui/backdrop";
import { Icon } from "@/components/ui/icons";
import { Screen } from "@/components/ui/screen";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/motion";
import { useApp } from "@/lib/store";
import { SettingsList } from "./settings-list";

/** 22 · Settings (+ 29 · Delete account sheet) */
export default function Settings() {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <Screen glows={glows.onboarding} nav>
      <SettingsList onDelete={() => setConfirmDelete(true)} />
      <DeleteSheet open={confirmDelete} onClose={() => setConfirmDelete(false)} />
    </Screen>
  );
}

function DeleteSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { reset } = useApp();
  const [typed, setTyped] = useState("");
  const shake = useAnimationControls();
  const ready = typed.trim() === "DELETE";

  const confirm = () => {
    if (!ready) {
      haptic("warning");
      shake.start({ x: [0, -4, 4, -4, 4, -4, 0], transition: { duration: 0.3 } });
      return;
    }
    reset();
    router.replace("/");
  };

  return (
    <Sheet open={open} onClose={onClose} label="Delete account">
      <div className="flex flex-col gap-3.5 px-1 pb-2.5">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-danger-subtle text-t-danger">
          <Icon name="lock" size={22} />
        </span>
        <h2 className="text-[26px] leading-[1.1] font-medium tracking-[-0.65px] text-ink">Delete your account?</h2>
        <p className="type-body-m text-t2">
          This permanently deletes your chats, check-ins, memories and plans within 30 days. It can’t be undone. Your Plus
          subscription is cancelled separately in Google Play.
        </p>
        <button type="button" className="flex cursor-pointer items-center gap-3 rounded-[18px] border border-line bg-white px-3.5 py-3 text-left">
          <Icon name="book" size={18} className="text-t1" />
          <span className="flex-1 type-label-m text-t1">Export my data first</span>
          <Icon name="chevron-right" size={16} className="text-t3" />
        </button>
        <label className="flex flex-col gap-1.5">
          <span className="type-label-s text-t2">Type DELETE to confirm</span>
          <motion.input
            animate={shake}
            value={typed}
            onChange={(e) => setTyped(e.target.value.toUpperCase())}
            autoCapitalize="characters"
            autoComplete="off"
            className="h-[50px] rounded-2xl border border-line-strong bg-white pl-4 type-title-m text-t1 outline-none focus:border-t-danger"
          />
        </label>
        <button
          type="button"
          onClick={confirm}
          aria-disabled={!ready}
          className={cn(
            "flex h-[54px] cursor-pointer items-center justify-center rounded-full type-label-m text-white transition-[background-color,opacity] duration-[240ms]",
            ready ? "bg-t-danger" : "bg-t-danger/35",
          )}
        >
          Delete account
        </button>
        <button type="button" onClick={onClose} className="cursor-pointer type-label-m text-t1">
          Keep my account
        </button>
      </div>
    </Sheet>
  );
}
