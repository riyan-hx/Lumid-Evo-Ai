"use client";

import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { initSmoothScroll } from "@/lib/early-access/scroll";

/** Mounts Lenis for the whole early-access route. Renders nothing. */
export function SmoothScroll() {
  useEffect(() => initSmoothScroll(), []);
  return null;
}
