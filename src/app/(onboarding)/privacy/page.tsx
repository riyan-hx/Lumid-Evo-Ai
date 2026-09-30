"use client";

import { useState } from "react";
import { OnboardingHeader } from "@/components/onboarding/header";
import { glows } from "@/components/ui/backdrop";
import { IconTile, Toggle } from "@/components/ui/controls";
import { Icon, type IconName } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { useApp } from "@/lib/store";

type Key = "patterns" | "forecast" | "voice" | "psychologist";

const rows: { key: Key; icon: IconName; title: string; hint: string }[] = [
  { key: "patterns", icon: "brain", title: "Remember patterns across chats", hint: "So Evo doesn’t ask the same things twice" },
  { key: "forecast", icon: "cloud", title: "Use check-ins to forecast hard days", hint: "Private to you — never shared" },
  { key: "voice", icon: "mic", title: "Save voice recordings", hint: "Off — only the text you approve is kept" },
  { key: "psychologist", icon: "user", title: "Share with a psychologist", hint: "Only when you choose, per session" },
];

export default function Privacy() {
  const app = useApp();
  const [consents, setConsents] = useState(app.consents);

  return (
    <Screen glows={glows.onboarding}>
      <div className="flex flex-1 flex-col pt-[54px]">
        <OnboardingHeader step={2} />
        <h1 className="mt-3.5 px-7 text-[28px] leading-[1.06] font-medium tracking-[-0.84px] text-forest">
          What Evo remembers —
          <br />
          and what it doesn’t.
        </h1>
        <p className="mt-3 px-7 type-body-m text-t2">You’re in control. Change any of this in Settings.</p>

        <div className="glass mx-6 mt-[18px] flex flex-col rounded-3xl px-[18px] py-1">
          {rows.map((r, i) => (
            <div
              key={r.key}
              className={`flex items-center gap-3 py-3.5 ${i < rows.length - 1 ? "border-b border-line" : ""}`}
            >
              <IconTile icon={r.icon} bg="bg-lime-wash" color="text-lime-deep" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="type-label-m text-ink">{r.title}</p>
                <p className="type-caption text-t3">{r.hint}</p>
              </div>
              <Toggle
                label={r.title}
                on={consents[r.key]}
                onChange={(v) => setConsents((c) => ({ ...c, [r.key]: v }))}
              />
            </div>
          ))}
        </div>

        <div className="mx-6 mt-4 flex items-start gap-3 rounded-[20px] border border-peach-soft bg-peach-subtle px-4 py-3.5">
          <Icon name="lifebuoy" size={20} className="shrink-0 text-peach-text" />
          <p className="type-body-s text-t2">
            Evo is not a therapist or an emergency service. If you’re in danger, call{" "}
            <a href="tel:112" className="font-medium">
              112
            </a>
            , or Tele-MANAS on{" "}
            <a href="tel:14416" className="font-medium">
              14416
            </a>{" "}
            (free, 24×7).
          </p>
        </div>

        <div className="mt-auto px-6 pt-8 pb-[30px]">
          <Pill
            label="I understand — continue"
            className="w-full"
            confirm
            href="/reminders"
            onClick={() => app.update({ consents, consentedAt: new Date().toISOString(), policyVersion: "2026-09" })}
          />
        </div>
      </div>
    </Screen>
  );
}
