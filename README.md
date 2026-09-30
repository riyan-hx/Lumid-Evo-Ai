# Lumid Evo — web app

Mobile-first Next.js build of the **Evo V3 FINAL UI** Figma file (Phase 0 + P0 screens), with the motion spec from the design handoff.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

**Fonts:** Helvetica Now Display is licensed and not committed. Put `HelveticaNowDisplay-Regular.ttf` and
`HelveticaNowDisplay-Medium.ttf` in `public/fonts/` (git-ignored). Without them the UI falls back to Inter / system sans.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Motion (Framer Motion). All data is mock (`src/lib/mock.ts`, `src/lib/store.tsx`, persisted to localStorage).

## Structure

| Path | What |
| --- | --- |
| `src/app/globals.css` | Figma variables as Tailwind tokens, type styles (`type-label-m`, …), glass utility |
| `src/lib/motion.ts` | Motion tokens: `spring.snappy/default/gentle`, `ease`, stagger, breath, haptics |
| `src/components/ui/` | Orb, Pill, Soft chip, Ask Evo, icon buttons, Toggle, Sheet, Bottom nav, Screen + backdrop (glows, rays, grain), icons (Hugeicons exported from Figma) |
| `src/components/evo/` | Chat pieces (bubbles, streaming text, typing), Insight card, Plan card, Composer, Ask Evo sheet |
| `src/lib/safety.ts` | Client-side first pass of the safety gate (routes to screen 30) |

## Screens

| Route | Figma |
| --- | --- |
| `/` | 01 Welcome |
| `/sign-in` · `/verify` | 16 Sign in · 17 Verify code |
| `/goals` · `/privacy` · `/reminders` | 18 · 19 · 20 |
| `/first-day` | 24 First day |
| `/check-in` | 02 Check-in |
| `/home` | 03 Home (+ 11b Ask Evo sheet) |
| `/chat` | 06 Guided chat (tap-first, insight → plan) |
| `/insight` · `/step-booked` · `/focus` | 04 · 05 · 10 |
| `/wins` · `/calm` | 08 · 07 |
| `/chats` · `/settings` · `/settings/memory` | 21 · 22 (+ 29 delete sheet) · 26 |
| `/crisis` · `/safety` · `/offline` | 23 · 30 · 31 |

Phones get full-bleed screens; wider viewports show the 393 × 852 frame. Dedicated tablet/desktop layouts are Phase 2.

`scripts/shot.mjs` takes Playwright screenshots of a route for visual checks against Figma.
