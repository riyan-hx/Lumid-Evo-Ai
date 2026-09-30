"use client";

import { useRouter } from "next/navigation";
import { Group, GroupLabel, PlusBadge, Row } from "@/components/ui/list";
import { Orb } from "@/components/ui/orb";
import { useApp } from "@/lib/store";

/** Shared by 22 Settings and the 29 Delete account backdrop. */
export function SettingsList({ onDelete }: { onDelete: () => void }) {
  const router = useRouter();
  const { name, phone, reminder, consents } = useApp();
  return (
    <div className="flex flex-col gap-2 px-6 pt-14 pb-6">
      <h1 className="text-[34px] leading-[1.06] font-medium tracking-[-1.02px] text-forest">Settings</h1>
      <div className="flex items-center gap-3 rounded-3xl py-3 pr-3.5 pl-3" style={{ background: "linear-gradient(168deg, #33412e 0%, #151a13 71.43%)" }}>
        <Orb size={48} state="breathing" />
        <div className="flex flex-1 flex-col gap-[3px]">
          <span className="type-title-m text-white">{name}</span>
          <span className="type-caption text-lime">+91 {phone}</span>
        </div>
        <PlusBadge />
      </div>

      <GroupLabel>Account</GroupLabel>
      <Group>
        <Row icon="target" tile="bg-lime-soft" color="text-lime-deep" title="Plan & billing" value="Evo Plus" />
        <Row icon="chat" tile="bg-lavender-soft" color="text-lavender-text" title="Language" value="English, Malayalam" />
        <Row icon="bell" tile="bg-sun-soft" color="text-sun-text" title="Check-in reminders" value={reminder.time} last onClick={() => router.push("/reminders")} />
      </Group>

      <GroupLabel>Privacy</GroupLabel>
      <Group>
        <Row icon="brain" tile="bg-mint-soft" color="text-mint-text" title="What Evo remembers" onClick={() => router.push("/settings/memory")} />
        <Row icon="user" tile="bg-sky-soft" color="text-sky-text" title="Psychologist sharing" value={consents.psychologist ? "On" : "Off"} />
        <Row icon="book" tile="bg-subtle" color="text-t2" title="Export my data" />
        <Row icon="plus" iconRotate={45} tile="bg-peach-soft" color="text-peach-text" title="Delete account" danger last onClick={onDelete} />
      </Group>

      <GroupLabel>Support</GroupLabel>
      <Group>
        <Row icon="lifebuoy" tile="bg-peach-soft" color="text-peach-text" title="Crisis support" value="24×7" onClick={() => router.push("/crisis")} />
        <Row icon="chat" tile="bg-subtle" color="text-t2" title="Help & feedback" last />
      </Group>
    </div>
  );
}
