"use client";

import { useState } from "react";
import { glows } from "@/components/ui/backdrop";
import { BackButton } from "@/components/ui/controls";
import { Icon } from "@/components/ui/icons";
import { PlusBadge } from "@/components/ui/list";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/motion";
import { useApp } from "@/lib/store";

const PLAY_SUBSCRIPTIONS = "https://play.google.com/store/account/subscriptions";
const INCLUDES = ["Unlimited recovery plans & Unstuck ladders", "Avoidance forecast & monthly report", "Voice chat in Malayalam & English"];
const PLANS = [
  { interval: "yearly", price: "₹1,499", per: "/ year", note: "Early member price · save 37%" },
  { interval: "monthly", price: "₹199", per: "/ month", note: "Cancel anytime" },
] as const;

/** 28 · Plan & billing */
export default function Billing() {
  const app = useApp();
  const plan = app.plan;
  const plus = plan.tier === "plus";
  const [sheet, setSheet] = useState<null | "change" | "receipts" | "cancel">(null);
  const close = () => setSheet(null);

  return (
    <Screen glows={glows.onboarding} app>
      <div className="flex flex-col gap-3.5 px-6 pt-[50px] pb-8">
        <BackButton href="/settings" />
        <h1 className="text-[30px] leading-[1.08] font-medium tracking-[-0.9px] text-ink">Plan &amp; billing</h1>

        <div className="flex flex-col items-start gap-2 rounded-3xl p-[18px]" style={{ background: "linear-gradient(154deg, #33412e 0%, #151a13 71.43%)" }}>
          <div className="flex items-center gap-2">
            {plus ? <PlusBadge /> : <span className="rounded-full bg-white/12 px-2.5 py-1 type-label-s text-white">FREE</span>}
            {plus && <span className="type-label-s text-white capitalize">{plan.interval}</span>}
          </div>
          <p className="text-[30px] leading-[1.08] font-medium tracking-[-0.9px] text-white">
            {plus ? `${plan.price} / ${plan.interval === "yearly" ? "year" : "month"}` : "Evo Free"}
          </p>
          <p className="type-body-s text-lime">
            {!plus ? "Everything you need to start — upgrade anytime" : plan.cancelled ? `Cancelled · Plus stays on until ${plan.renews}` : `Early member price · renews ${plan.renews}`}
          </p>
          <button
            type="button"
            onClick={() => setSheet("change")}
            className="mt-1 flex h-9 cursor-pointer items-center rounded-full bg-lime px-4 type-label-s text-forest transition-transform active:scale-95"
          >
            {plus ? "Change plan" : "See Plus"}
          </button>
        </div>

        <div className="glass flex flex-col gap-2.5 rounded-[22px] px-4 py-3.5">
          <p className="type-label-s text-t3">{plus ? "Your Plus includes" : "Plus adds"}</p>
          {INCLUDES.map((t) => (
            <div key={t} className="flex items-center gap-2.5">
              <Icon name="check" size={16} className="shrink-0 text-lime-deep" />
              <span className="type-body-m text-t1">{t}</span>
            </div>
          ))}
        </div>

        {plus && (
          <div className="glass flex flex-col rounded-[22px] px-4 py-1">
            <a href={PLAY_SUBSCRIPTIONS} target="_blank" rel="noreferrer" className="flex items-center gap-3 border-b border-line py-2.5">
              <span className="flex size-8 items-center justify-center rounded-[10px] bg-mint-subtle text-mint-text">
                <Icon name="check" size={16} />
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="type-label-m text-t1">Payment method</span>
                <span className="type-caption text-t3">UPI · managed by Google Play</span>
              </span>
              <Icon name="chevron-right" size={16} className="text-t3" />
            </a>
            <button type="button" onClick={() => setSheet("receipts")} className="flex cursor-pointer items-center gap-3 py-2.5 text-left">
              <span className="flex size-8 items-center justify-center rounded-[10px] bg-sky-subtle text-sky-text">
                <Icon name="book" size={16} />
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="type-label-m text-t1">Receipts</span>
                <span className="type-caption text-t3">Last: {plan.lastReceipt}</span>
              </span>
              <span className="type-label-s text-t3">{plan.price}</span>
              <Icon name="chevron-right" size={16} className="text-t3" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 rounded-[18px] bg-brand-subtle px-3.5 py-3">
          <Icon name="lifebuoy" size={18} className="shrink-0 text-lime-deep" />
          <p className="type-body-s text-t2">Crisis support, breathing, check-ins and your data stay free — always.</p>
        </div>

        {plus && !plan.cancelled && (
          <div className="flex flex-col items-center gap-1 pt-2">
            <button type="button" onClick={() => setSheet("cancel")} className="cursor-pointer type-label-m text-t2">
              Cancel subscription
            </button>
            <p className="type-caption text-t3">You keep Plus until {plan.renews}. Nothing is deleted.</p>
          </div>
        )}
        {plus && plan.cancelled && (
          <button type="button" onClick={() => app.update({ plan: { ...plan, cancelled: false } })} className="cursor-pointer self-center pt-2 type-label-m text-lime-deep">
            Keep Plus after {plan.renews}
          </button>
        )}
      </div>

      <Sheet open={sheet === "change"} onClose={close} label="Change plan">
        <div className="flex flex-col gap-3 px-1 pb-2">
          <h2 className="text-[24px] leading-[1.1] font-medium tracking-[-0.6px] text-ink">Choose your plan</h2>
          {PLANS.map((p) => {
            const on = plus && plan.interval === p.interval;
            return (
              <button
                key={p.interval}
                type="button"
                onClick={() => {
                  haptic("selection");
                  app.update({ plan: { ...plan, tier: "plus", interval: p.interval, price: p.price, cancelled: false } });
                  close();
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-[20px] border px-4 py-3.5 text-left transition-colors",
                  on ? "border-[1.5px] border-lime bg-lime-soft" : "border-line bg-white",
                )}
              >
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="type-label-m text-t1 capitalize">{p.interval}</span>
                  <span className="type-caption text-t3">{p.note}</span>
                </span>
                <span className="type-title-m text-ink">
                  {p.price} <span className="type-caption text-t3">{p.per}</span>
                </span>
                {on && <Icon name="check" size={18} className="text-lime-deep" />}
              </button>
            );
          })}
          {plus && (
            <button
              type="button"
              onClick={() => {
                app.update({ plan: { ...plan, tier: "free" } });
                close();
              }}
              className="cursor-pointer py-1 type-label-m text-t2"
            >
              Switch to Free at the end of this period
            </button>
          )}
          <p className="type-caption text-t3">Billing is handled by Google Play. Changes apply from your next renewal.</p>
        </div>
      </Sheet>

      <Sheet open={sheet === "receipts"} onClose={close} label="Receipts">
        <div className="flex flex-col gap-3 px-1 pb-2">
          <h2 className="text-[24px] leading-[1.1] font-medium tracking-[-0.6px] text-ink">Receipts</h2>
          <div className="glass flex items-center gap-3 rounded-[20px] px-4 py-3">
            <Icon name="book" size={18} className="text-sky-text" />
            <span className="flex flex-1 flex-col">
              <span className="type-label-m text-t1">Evo Plus · {plan.interval}</span>
              <span className="type-caption text-t3">{plan.lastReceipt}</span>
            </span>
            <span className="type-label-m text-t1">{plan.price}</span>
          </div>
          <Pill label="Open in Google Play" variant="glass" height={48} className="w-full" onClick={() => window.open(PLAY_SUBSCRIPTIONS, "_blank")} />
        </div>
      </Sheet>

      <Sheet open={sheet === "cancel"} onClose={close} label="Cancel subscription">
        <div className="flex flex-col gap-3.5 px-1 pb-2">
          <h2 className="text-[24px] leading-[1.1] font-medium tracking-[-0.6px] text-ink">Cancel Evo Plus?</h2>
          <p className="type-body-m text-t2">
            You keep Plus until {plan.renews}. After that you move to Free — your chats, plans and memories all stay.
          </p>
          <button
            type="button"
            onClick={() => {
              app.update({ plan: { ...plan, cancelled: true } });
              haptic("light");
              close();
            }}
            className="flex h-[54px] cursor-pointer items-center justify-center rounded-full border border-line bg-white type-label-m text-t-danger"
          >
            Cancel subscription
          </button>
          <button type="button" onClick={close} className="cursor-pointer type-label-m text-t1">
            Keep Plus
          </button>
        </div>
      </Sheet>
    </Screen>
  );
}
