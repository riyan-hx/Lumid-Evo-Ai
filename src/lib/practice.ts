import type { Psychologist } from "./store";

/**
 * Invite codes issued from Lumid Practice. Until the backend lookup is live, this demo directory
 * resolves the sample code from the design so the flow can be tried end to end.
 */
const DIRECTORY: Record<string, Psychologist> = {
  "MEERA-4K2": { code: "MEERA-4K2", name: "Dr. Meera R.", initials: "MR", role: "Clinical psychologist", city: "Kozhikode" },
};

export const normaliseCode = (raw: string) =>
  raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/^([A-Z]+)([0-9A-Z]{3})$/, "$1-$2");

export async function lookupCode(code: string): Promise<Psychologist | null> {
  await new Promise((r) => setTimeout(r, 450));
  return DIRECTORY[code] ?? null;
}
