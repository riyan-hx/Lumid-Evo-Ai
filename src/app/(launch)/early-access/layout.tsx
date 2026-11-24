import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Evo early access · Lumid",
  description: "Get unstuck, one small step at a time. Join Evo early access — for students, exam aspirants and young professionals.",
};

export const viewport: Viewport = { themeColor: "#0b0d0a" };

export default function EarlyAccessLayout({ children }: LayoutProps<"/early-access">) {
  return children;
}
