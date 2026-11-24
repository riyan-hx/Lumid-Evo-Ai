/** Copy and rules from the Evo early-access handoff (docs/early-access-handoff.md). */

export type ExcuseId = "lunch" | "video" | "fail" | "much" | "tomorrow";

export const excuses: { id: ExcuseId; line: string; cause: string; step: string }[] = [
  { id: "lunch", line: "I’ll start after lunch.", cause: "waiting to feel ready", step: "Open the file and write one messy line. Two minutes, then you can stop." },
  { id: "video", line: "Just one more video, then I’ll study.", cause: "escaping a hard start", step: "Phone in another room. Set a 5-minute timer and read just one page." },
  { id: "fail", line: "What if I try and still fail?", cause: "fear of not being good enough", step: "Do a ‘bad on purpose’ draft. Nobody sees it. It only has to exist." },
  { id: "much", line: "There’s too much. Where do I even begin?", cause: "overwhelm", step: "Brain dump for 3 minutes. Then circle the smallest thing on the list." },
  { id: "tomorrow", line: "Tomorrow. I’ll do it properly tomorrow.", cause: "all-or-nothing thinking", step: "Do the ‘improper’ version tonight — 10 minutes counts as starting." },
];

export const CONSENT = "One email when your invite is ready. No spam — unsubscribe anytime.";
export const DISCLAIMER = "Evo is a support tool, not therapy or a diagnosis. In a crisis, contact a professional or helpline.";

export const fieldCopy = {
  invalid: "That email doesn’t look right — check for a missing “.com”?",
  offline: "Couldn’t save just now — your email is kept here. Try again?",
  rate: "Too many tries — give it a minute.",
  already: (email: string) => `You’re already on the list as ${email} — we’ve resent your pass link.`,
};

/** Loader ticker: `01 Check in — Say what you’re avoiding` … (handoff §2). */
export const ticker = [
  { n: "01", title: "Check in", sub: "Say what you’re avoiding" },
  { n: "02", title: "Name it", sub: "Fear, overwhelm, tiredness" },
  { n: "03", title: "One small step", sub: "Five minutes, today" },
];

export const WAVES = [
  { label: "On the list", note: "Wave 3" },
  { label: "Moved up", note: "Wave 2" },
  { label: "Founding member", note: "Wave 1 + badge" },
] as const;

export const waveFor = (invites: number) => (invites >= 3 ? 1 : invites >= 1 ? 2 : 3);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const normalizeEmail = (v: string) => v.trim().toLowerCase();
export const isEmail = (v: string) => v.length <= 254 && EMAIL_RE.test(v);
export const isExcuseId = (v: unknown): v is ExcuseId => excuses.some((e) => e.id === v);
export const REF_RE = /^EVO-[A-Z0-9]{4}$/;

export type Signup = {
  status: "pending_confirmation" | "confirmed";
  spot: number;
  wave: number;
  code: string;
  share_url: string;
  invites: number;
  already?: boolean;
};
