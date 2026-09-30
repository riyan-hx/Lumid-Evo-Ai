// Sample data shaped like the Evo turn contract (handoff §10). Replace with API data later.
import type { Choice } from "@/components/evo/chat-bits";
import type { Insight } from "@/components/evo/insight-card";
import type { Plan } from "@/components/evo/plan-card";

export const insight: Insight = {
  headline: "You’re not lazy. Starting just feels threatening right now.",
  happening: "Three days of scrolling instead of starting. The exams feel like one huge block.",
  why: "Big, vague tasks feel threatening. Avoiding them gives quick relief — then more guilt.",
  need: "A first step so small it feels easy. Not more pressure.",
  short: { happening: "Scrolling instead of starting", why: "Big, vague tasks feel threatening", need: "A first step that feels easy" },
  tags: ["avoidance", "exam stress", "overwhelm"],
  basedOn: "Based on 3 check-ins  ·  just now",
};

export const insightTired: Insight = {
  headline: "It might be tiredness, not the task.",
  happening: "Evenings after dinner are when starting feels hardest.",
  why: "Low energy makes every task look bigger than it is.",
  need: "A shorter step earlier in the evening, before you’re drained.",
  short: { happening: "Evenings feel hardest to start", why: "Low energy makes tasks look bigger", need: "A shorter, earlier step" },
  tags: ["tiredness", "exam stress"],
  basedOn: "Based on today  ·  low confidence",
};

export const plan: Plan = {
  title: "Exam reset",
  steps: [
    { title: "Brain dump", how: "Write every worry about the exams. No order, no fixing.", minutes: 3 },
    { title: "Pick just one subject", how: "The one that feels least scary to begin with.", minutes: 2 },
    { title: "One 25-minute sprint", how: "Phone in another room. Stop when the timer ends.", minutes: 25 },
    { title: "Rest, then check in", how: "Take a real break. Tell Evo how it went.", minutes: 5 },
  ],
};

export const arriving: Choice[] = [
  { label: "Still stressed", hint: "Same weight as yesterday", icon: "cloud", tile: "bg-lime-soft", color: "text-lime-deep" },
  { label: "A bit better", hint: "Lighter than before", icon: "sun", tile: "bg-sun-soft", color: "text-sun-text" },
  { label: "Something new", hint: "Different thing on my mind", icon: "sparkle", tile: "bg-mint-soft", color: "text-mint-text" },
  { label: "Just want to talk", hint: "No fixing, just listen", icon: "chat", tile: "bg-peach-soft", color: "text-peach-text" },
];

export const weighing: Choice[] = [
  { label: "I can’t make myself start", icon: "pause", tile: "bg-lavender-soft", color: "text-lavender-text" },
  { label: "There’s too much to study", icon: "book", tile: "bg-sky-soft", color: "text-sky-text" },
  { label: "I’m scared about the results", icon: "heart", tile: "bg-peach-soft", color: "text-peach-text" },
];

export const help: Choice[] = [
  { label: "Make a recovery plan", hint: "Recommended · 4 small steps", icon: "path", tile: "bg-lime", color: "text-forest" },
  { label: "I just need to vent", icon: "chat", tile: "bg-peach-soft", color: "text-peach-text" },
  { label: "Breathe with me — 1 min", icon: "wind", tile: "bg-sky-soft", color: "text-sky-text" },
  { label: "Talk to a psychologist", hint: "Only if you’ve connected one", icon: "user", tile: "bg-mint-soft", color: "text-mint-text" },
];
