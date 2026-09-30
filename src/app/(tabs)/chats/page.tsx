"use client";

import { motion } from "motion/react";
import { ChatList } from "@/components/evo/chat-list";
import { glows, wideGlows } from "@/components/ui/backdrop";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { riseIn } from "@/lib/motion";

/** 21 · Chats. Tablet/desktop: list panel + an empty conversation pane. */
export default function Chats() {
  return (
    <Screen glows={glows.onboarding} wide={wideGlows.chat} nav full>
      <div className="flex flex-1 md:gap-4 md:py-4 md:pr-4">
        <ChatList />
        <motion.div
          variants={riseIn}
          initial="hidden"
          animate="show"
          custom={2}
          className="hidden flex-1 flex-col items-center justify-center gap-4 text-center md:flex"
        >
          <Orb size={120} state="breathing" />
          <h2 className="type-screen-title text-forest">Pick up a chat, or start fresh</h2>
          <p className="max-w-[340px] type-body-m text-t2">Everything you’ve talked through with Evo lives here. Nothing is shared without your OK.</p>
          <Pill label="New chat" height={50} href="/chat" className="mt-2" />
        </motion.div>
      </div>
    </Screen>
  );
}
