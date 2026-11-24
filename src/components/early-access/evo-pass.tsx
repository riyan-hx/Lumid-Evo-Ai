"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { Orb } from "@/components/ui/orb";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

const RAYS = Array.from({ length: 48 }, (_, i) => {
  const a = (i / 48) * Math.PI * 2;
  return `M${(Math.cos(a) * 40).toFixed(1)} ${(Math.sin(a) * 40).toFixed(1)}L${(Math.cos(a) * 100).toFixed(1)} ${(Math.sin(a) * 100).toFixed(1)}`;
}).join("");

type Props = {
  number: string;
  persona: string;
  code: string;
  badge: string;
  className?: string;
};

/**
 * The Evo Pass card. Sized with container-query units so it scales from a 280 px phone to a 560 px desktop
 * stage. Flips in once, then tilts toward the pointer (mouse only; off for reduced motion).
 */
export function EvoPass({ number, persona, code, badge, className }: Props) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-14, 14]), { stiffness: 200, damping: 20 });
  const sheen = useTransform(mx, [0, 1], ["0%", "100%"]);

  return (
    <div className={cn("[perspective:1000px]", className)} style={{ containerType: "inline-size" }}>
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, rotateY: -90 }}
        animate={{ opacity: 1, rotateY: 0 }}
        transition={reduce ? { duration: 0.2 } : { ...spring.gentle, delay: 0.1 }}
        style={{ rotate: reduce ? 0 : 4 }}
      >
        <motion.div
          onPointerMove={(e) => {
            if (reduce || e.pointerType !== "mouse") return;
            const r = e.currentTarget.getBoundingClientRect();
            mx.set((e.clientX - r.left) / r.width);
            my.set((e.clientY - r.top) / r.height);
          }}
          onPointerLeave={() => {
            mx.set(0.5);
            my.set(0.5);
          }}
          style={{ rotateX: reduce ? 0 : rx, rotateY: reduce ? 0 : ry, transformStyle: "preserve-3d", padding: "5.7cqw", borderRadius: "7.9cqw" }}
          className="relative aspect-[1.6/1] w-full overflow-hidden border border-white/60 text-left text-forest shadow-[0_40px_80px_rgba(98,191,59,0.38),inset_0_1px_0_rgba(255,255,255,0.8)]"
        >
          <div className="absolute inset-0" style={{ background: "linear-gradient(140deg,#f3fbec 0%,#c9eeb0 45%,#88d95f 100%)" }} />
          <motion.div aria-hidden className="absolute inset-y-0 w-[60%] -skew-x-12 opacity-50 mix-blend-overlay" style={{ left: sheen, x: "-50%", background: "linear-gradient(90deg,transparent,#fff,transparent)" }} />
          <svg aria-hidden viewBox="-100 -100 200 200" className="absolute -right-[12%] -bottom-[28%] w-[74%] opacity-45">
            <path d={RAYS} stroke="white" strokeWidth={1} fill="none" />
          </svg>
          <div aria-hidden className="absolute" style={{ right: "7%", bottom: "9%" }}>
            <Orb size={72} state="breathing" className="!size-[20.4cqw]" />
          </div>
          <div className="relative flex h-full flex-col">
            <div className="flex items-center justify-between">
              <span className="font-medium tracking-[0.04em] text-lime-deep" style={{ fontSize: "4.2cqw" }}>
                LUMID EVO
              </span>
              <span className="rounded-full bg-forest font-mono tracking-[0.12em] text-lime uppercase" style={{ fontSize: "2.8cqw", padding: "1.4cqw 2.8cqw" }}>
                {badge}
              </span>
            </div>
            <p className="mt-auto font-mono tracking-[0.14em] uppercase opacity-60" style={{ fontSize: "2.8cqw" }}>
              Pass no.
            </p>
            <p className="font-medium tracking-[-0.04em] tabular-nums" style={{ fontSize: "13cqw", lineHeight: 1 }}>
              {number}
            </p>
            <p className="font-mono tracking-[0.1em] whitespace-pre uppercase opacity-70" style={{ fontSize: "2.8cqw", marginTop: "3cqw" }}>
              {persona}
              {"     "}
              {code}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
