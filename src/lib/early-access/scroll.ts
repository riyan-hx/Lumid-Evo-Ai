"use client";

import Lenis from "lenis";

/**
 * Smooth scroll for the early-access page (Lenis). A module singleton so any component can lock scrolling
 * (loader, sheet) or scroll to an element without prop-drilling.
 */
let lenis: Lenis | null = null;
let locks = 0;
const root = () => document.documentElement;

function apply() {
  root().classList.toggle("ea-locked", locks > 0);
  if (locks > 0) lenis?.stop();
  else lenis?.start();
}

export function initSmoothScroll(): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 0.9 });
  apply();
  let raf = requestAnimationFrame(function loop(t) {
    lenis?.raf(t);
    raf = requestAnimationFrame(loop);
  });
  return () => {
    cancelAnimationFrame(raf);
    lenis?.destroy();
    lenis = null;
  };
}

/** Lock page scroll; call the returned function to release. Safe before Lenis exists. */
export function lockScroll(): () => void {
  locks += 1;
  apply();
  let done = false;
  return () => {
    if (done) return;
    done = true;
    locks = Math.max(0, locks - 1);
    apply();
  };
}

/** Smooth-scroll to an element (works while locked). `offset` is in px from the element's top. */
export function scrollToElement(el: HTMLElement | null, offset = -120, onComplete?: () => void) {
  if (!el) return onComplete?.();
  if (lenis) lenis.scrollTo(el, { offset, duration: 1, force: true, onComplete });
  else {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
    onComplete?.();
  }
}

/** Smooth-scroll the page by a delta (px). */
export function scrollByAmount(delta: number, onComplete?: () => void) {
  if (Math.abs(delta) < 2) return onComplete?.();
  const to = Math.max(0, window.scrollY + delta);
  if (lenis) lenis.scrollTo(to, { duration: 0.9, force: true, onComplete });
  else {
    window.scrollTo({ top: to, behavior: "smooth" });
    onComplete?.();
  }
}
