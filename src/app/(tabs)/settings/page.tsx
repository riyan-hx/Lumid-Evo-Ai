"use client";

import { motion, useAnimationControls } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { glows } from "@/components/ui/backdrop";
import { Icon } from "@/components/ui/icons";
import { Screen } from "@/components/ui/screen";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";
import { exportMyData } from "@/lib/export";
import { haptic } from "@/lib/motion";
import { useApp } from "@/lib/store";
import { SettingsList } from "./settings-list";

/** 22 · Settings (+ 29 · Delete account sheet) */
export default function Settings() {
  const [sheet, setSheet] = useState<null | "delete" | "language" | "help">(null);
  const app = useApp();
  const close = () => setSheet(null);
  return (
    <Screen glows={glows.onboarding} nav>
      <SettingsList
        onDelete={() => setSheet("delete")}
        onLanguage={() => setSheet("language")}
        onExport={() => exportMyData(snapshot(app))}
        onHelp={() => setSheet("help")}
      />
      <DeleteSheet open={sheet === "delete"} onClose={close} />
      <LanguageSheet open={sheet === "language"} onClose={close} />
      <HelpSheet open={sheet === "help"} onClose={close} />
    </Screen>
  );
}

/** The stored state without functions — what "Export my data" downloads. */
function snapshot(app: ReturnType<typeof useApp>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { update, reset, ...data } = app;
  return data;
}

const LANGS = [
  { id: "English", hint: "Chat and voice" },
  { id: "Malayalam", hint: "മലയാളം · voice and Manglish chat" },
];

function LanguageSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { languages, update } = useApp();
  const toggle = (id: string) => {
    haptic("selection");
    const next = languages.includes(id) ? languages.filter((l) => l !== id) : [...languages, id];
    if (next.length) update({ languages: next });
  };
  return (
    <Sheet open={open} onClose={onClose} label="Language">
      <div className="flex flex-col gap-3 px-1 pb-2">
        <h2 className="text-[24px] leading-[1.1] font-medium tracking-[-0.6px] text-ink">Language</h2>
        <p className="type-body-m text-t2">Evo replies in the language you write or speak in. Pick at least one.</p>
        {LANGS.map((l) => {
          const on = languages.includes(l.id);
          return (
            <button
              key={l.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(l.id)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-[20px] border px-4 py-3.5 text-left transition-colors duration-200",
                on ? "border-[1.5px] border-lime bg-lime-soft" : "border-line bg-white",
              )}
            >
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="type-label-m text-t1">{l.id}</span>
                <span className="type-caption text-t3">{l.hint}</span>
              </span>
              <span className={cn("flex size-6 items-center justify-center rounded-full transition-colors", on ? "bg-forest text-white" : "border border-line-strong")}>
                {on && <Icon name="check" size={14} />}
              </span>
            </button>
          );
        })}
        <button type="button" onClick={onClose} className="flex h-[52px] cursor-pointer items-center justify-center rounded-full type-label-m text-white" style={{ background: "var(--gradient-forest)" }}>
          Done
        </button>
      </div>
    </Sheet>
  );
}

function HelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const rows = [
    { icon: "chat" as const, title: "Send feedback", hint: "Tell us what’s working and what isn’t", href: "mailto:hello@lumidai.in?subject=Evo%20feedback" },
    { icon: "book" as const, title: "Report a problem", hint: "Something broken or confusing", href: "mailto:hello@lumidai.in?subject=Evo%20problem" },
  ];
  return (
    <Sheet open={open} onClose={onClose} label="Help and feedback">
      <div className="flex flex-col gap-3 px-1 pb-2">
        <h2 className="text-[24px] leading-[1.1] font-medium tracking-[-0.6px] text-ink">Help &amp; feedback</h2>
        {rows.map((r) => (
          <a key={r.title} href={r.href} className="flex items-center gap-3 rounded-[20px] border border-line bg-white px-4 py-3.5">
            <Icon name={r.icon} size={18} className="text-t2" />
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="type-label-m text-t1">{r.title}</span>
              <span className="type-caption text-t3">{r.hint}</span>
            </span>
            <Icon name="chevron-right" size={16} className="text-t3" />
          </a>
        ))}
        <button
          type="button"
          onClick={() => {
            onClose();
            router.push("/crisis");
          }}
          className="flex cursor-pointer items-center gap-3 rounded-[20px] bg-danger-subtle px-4 py-3.5 text-left"
        >
          <Icon name="lifebuoy" size={18} className="text-t-danger" />
          <span className="flex-1 type-label-m text-t-danger">Need help right now? Crisis support</span>
          <Icon name="chevron-right" size={16} className="text-t-danger" />
        </button>
      </div>
    </Sheet>
  );
}

function DeleteSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const app = useApp();
  const { reset } = app;
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
        <button type="button" onClick={() => exportMyData(snapshot(app))} className="flex cursor-pointer items-center gap-3 rounded-[18px] border border-line bg-white px-3.5 py-3 text-left">
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
