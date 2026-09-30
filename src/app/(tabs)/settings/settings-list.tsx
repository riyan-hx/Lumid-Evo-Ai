"use client";

import { useRouter } from "next/navigation";
import { Group, GroupLabel, PlusBadge, Row } from "@/components/ui/list";
import { Orb } from "@/components/ui/orb";
import { useApp } from "@/lib/store";

/** Shared by 22 Settings and the 29 Delete account backdrop. */
export function SettingsList({ onDelete, onLanguage, onExport, onHelp }: { onDelete: () => void; onLanguage?: () => void; onExport?: () => void; onHelp?: () => void }) {
  const router = useRouter();
  const { name, phone, reminder, psychologist, plan, languages } = useApp();
  return (
    <div className="flex flex-col gap-2 px-6 pt-14 pb-6">
      <h1 className="text-[34px] leading-[1.06] font-medium tracking-[-1.02px] text-forest">Settings</h1>
      <div className="flex items-center gap-3 rounded-3xl py-3 pr-3.5 pl-3" style={{ background: "linear-gradient(168deg, #33412e 0%, #151a13 71.43%)" }}>
        <Orb size={48} state="breathing" />
        <div className="flex flex-1 flex-col gap-[3px]">
          <span className="type-title-m text-white">{name}</span>
          <span className="type-caption text-lime">+91 {phone}</span>
        </div>
        {plan.tier === "plus" && <PlusBadge />}
      </div>

      <GroupLabel>Account</GroupLabel>
      <Group>
        <Row icon="target" tile="bg-lime-soft" color="text-lime-deep" title="Plan & billing" value={plan.tier === "plus" ? "Evo Plus" : "Free"} onClick={() => router.push("/settings/billing")} />
        <Row icon="chat" tile="bg-lavender-soft" color="text-lavender-text" title="Language" value={languages.join(", ")} onClick={onLanguage} />
        <Row icon="bell" tile="bg-sun-soft" color="text-sun-text" title="Check-in reminders" value={reminder.time} last onClick={() => router.push("/reminders")} />
      </Group>

      <GroupLabel>Privacy</GroupLabel>
      <Group>
        <Row icon="brain" tile="bg-mint-soft" color="text-mint-text" title="What Evo remembers" onClick={() => router.push("/settings/memory")} />
        <Row icon="user" tile="bg-sky-soft" color="text-sky-text" title="Psychologist sharing" value={psychologist ? psychologist.name : "Off"} onClick={() => router.push("/settings/psychologist")} />
        <Row icon="book" tile="bg-subtle" color="text-t2" title="Export my data" onClick={onExport} />
        <Row icon="plus" iconRotate={45} tile="bg-peach-soft" color="text-peach-text" title="Delete account" danger last onClick={onDelete} />
      </Group>

      <GroupLabel>Support</GroupLabel>
      <Group>
        <Row icon="lifebuoy" tile="bg-peach-soft" color="text-peach-text" title="Crisis support" value="24×7" onClick={() => router.push("/crisis")} />
        <Row icon="chat" tile="bg-subtle" color="text-t2" title="Help & feedback" last onClick={onHelp} />
      </Group>
    </div>
  );
}
