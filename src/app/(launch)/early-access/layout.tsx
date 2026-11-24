import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter/index.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import { SmoothScroll } from "@/components/early-access/smooth-scroll";

export const metadata: Metadata = {
  title: "Evo early access · Lumid",
  description: "Get unstuck, one small step at a time. Join Evo early access — for students, exam aspirants and young professionals.",
};

export const viewport: Viewport = { themeColor: "#f6f8f2" };

export default function EarlyAccessLayout({ children }: LayoutProps<"/early-access">) {
  return (
    <>
      <SmoothScroll />
      {children}
    </>
  );
}
