"use client";

import { useRouter } from "next/navigation";
import { glows } from "@/components/ui/backdrop";
import { BackButton, SoftChip } from "@/components/ui/controls";
import { Icon } from "@/components/ui/icons";
import { Screen } from "@/components/ui/screen";

/** 23 · Crisis support — tel: links, no network needed. */
export default function Crisis() {
  const router = useRouter();
  return (
    <Screen glows={glows.crisis}>
      <div className="flex flex-1 flex-col pt-[54px]">
        <div className="px-5">
          <BackButton />
        </div>
        <div className="mt-[18px] flex flex-col gap-3.5 px-6">
          <h1 className="type-screen-title text-forest">
            You don’t have to go
            <br />
            through this alone.
          </h1>
          <p className="type-body-m text-t2">If you might hurt yourself or you’re not safe, please reach out now.</p>

          <div className="flex w-full flex-col gap-3 rounded-[26px] bg-white px-5 py-[18px] shadow-[0_16px_34px_-12px_rgba(77,38,26,0.12)]">
            <p className="type-label-s text-lime-deep">Tele-MANAS · Govt. of India</p>
            <p className="text-[44px] leading-[1.06] font-medium tracking-[-1.32px] text-forest">14416</p>
            <p className="type-body-s text-t2">Free, confidential, 24×7 — in Malayalam and many other languages.</p>
            <a
              href="tel:14416"
              className="flex h-[52px] w-full items-center justify-center rounded-full type-label-m text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] drop-shadow-[0_14px_14px_rgba(20,26,18,0.28)] transition-transform active:scale-[0.97]"
              style={{ background: "var(--gradient-forest)" }}
            >
              Call 14416
            </a>
          </div>

          <a
            href="tel:112"
            className="flex w-full items-center gap-3 rounded-[22px] border border-peach-soft bg-peach-subtle py-3.5 pr-4 pl-3.5 transition-transform active:scale-[0.98]"
          >
            <span className="flex size-10 items-center justify-center rounded-[13.33px] bg-peach-soft text-peach-text">
              <Icon name="lifebuoy" size={20} />
            </span>
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="type-label-m text-ink">In immediate danger</span>
              <span className="type-caption text-t3">Call emergency services</span>
            </span>
            <span className="text-[24px] leading-[1.06] font-medium tracking-[-0.72px] text-peach-text">112</span>
          </a>

          <button type="button" className="glass flex w-full cursor-pointer items-center gap-3 rounded-[22px] py-3.5 pr-4 pl-3.5 text-left">
            <span className="flex size-10 items-center justify-center rounded-[13.33px] bg-lime-soft text-lime-deep">
              <Icon name="user" size={20} />
            </span>
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="type-label-m text-ink">Talk to a psychologist</span>
              <span className="type-caption text-t3">Message or book your psychologist</span>
            </span>
            <Icon name="chevron-right" size={16} className="text-t3" />
          </button>

          <p className="type-label-s text-t3">Right now, you could</p>
          <div className="flex flex-wrap gap-2">
            <SoftChip label="Breathe with Evo" onClick={() => router.push("/calm")} />
            <SoftChip label="Text someone you trust" onClick={() => (window.location.href = "sms:")} />
          </div>
        </div>
        <p className="mt-auto pt-8 pb-7 text-center type-caption text-t3">Evo will pause suggestions and stay with you.</p>
      </div>
    </Screen>
  );
}
