// Client-side first pass of the safety gate (handoff §10). The server classifier is the real check;
// this keyword list only makes sure the crisis UI appears immediately and offline.
const HIGH_RISK = [
  "kill myself",
  "end my life",
  "want to die",
  "suicide",
  "hurt myself",
  "self harm",
  "self-harm",
  "don't want to wake up",
  "dont want to wake up",
  "better off without me",
  "no reason to live",
  "chaavan",
  "chakanam",
  "marikkanam",
  "ചാകണം",
  "മരിക്കണം",
  "ആത്മഹത്യ",
];

export function riskCheck(text: string): "none" | "high" {
  const t = text.toLowerCase();
  return HIGH_RISK.some((k) => t.includes(k)) ? "high" : "none";
}
