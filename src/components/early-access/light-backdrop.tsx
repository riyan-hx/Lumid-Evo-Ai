"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

/**
 * Light "paper" background: a lime wash from the top plus soft glows that drift with scroll and (on
 * desktop) follow the pointer. Pure gradients + transforms — no blur filters, so it stays 60 fps.
 */
export function LightBackdrop() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 40, damping: 18 });
  const sy = useSpring(py, { stiffness: 40, damping: 18 });
  const lowY = useTransform(scrollY, [0, 1200], [0, -90]);
  const topY = useTransform(scrollY, [0, 1200], [0, 60]);
  const gx = useTransform(sx, (v) => v * -26);
  const gy = useTransform(sy, (v) => v * -18);
  const hx = useTransform(sx, (v) => v * 34);

  useEffect(() => {
    if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduce, px, py]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-paper">
      <motion.div
        className="absolute inset-x-0 top-0 h-[520px] will-change-transform"
        style={{ y: reduce ? 0 : topY, background: "linear-gradient(180deg, rgba(155,224,112,0.85) 0%, rgba(201,238,176,0.55) 55%, rgba(246,248,242,0) 100%)" }}
      />
      <motion.div
        className="absolute -top-[120px] -right-[160px] h-[520px] w-[640px] will-change-transform"
        style={{ x: reduce ? 0 : hx, y: reduce ? 0 : topY, background: "radial-gradient(closest-side, rgba(127,227,184,0.55), rgba(127,227,184,0))" }}
      />
      <motion.div
        className="absolute bottom-[-18%] left-1/2 h-[70vh] w-[min(1500px,170vw)] -translate-x-1/2 will-change-transform"
        style={{ x: reduce ? 0 : gx, y: reduce ? 0 : gy, translateY: reduce ? 0 : lowY, background: "radial-gradient(closest-side, rgba(163,226,125,0.6), rgba(201,238,176,0.35) 55%, rgba(246,248,242,0))" }}
      />
      <div className="absolute top-[38%] -left-[220px] hidden h-[520px] w-[520px] desk:block" style={{ background: "radial-gradient(closest-side, rgba(233,227,255,0.7), rgba(233,227,255,0))" }} />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundColor: "#000", WebkitMaskImage: "url(/evo/grain.png)", maskImage: "url(/evo/grain.png)", WebkitMaskSize: "128px 128px", maskSize: "128px 128px" }}
      />
    </div>
  );
}
