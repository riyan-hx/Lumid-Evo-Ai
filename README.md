# Lumid Evo — web app

Responsive Next.js build of the **Evo V3 FINAL UI** Figma file (Phase 0 + P0 screens), with the motion spec from the design handoff.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

### Try it on your phone (no hosting)

1. Laptop and phone on the **same Wi-Fi**.
2. On the laptop: `npm run phone` — builds, starts the server and prints a link like `http://192.168.1.23:3000`.
3. Open that link on your phone. For a full-screen app: **Share → Add to Home Screen** (iPhone) or **⋮ → Add to Home screen** (Android).

If the phone can’t connect, allow Node through the laptop firewall (macOS asks the first time; on Windows choose “Private networks”).
Away from your Wi-Fi? Run `npm run phone`, then in a second terminal `npx cloudflared tunnel --url http://localhost:3000` and open the `trycloudflare.com` link it prints (temporary, no account needed).

`node scripts/e2e.mjs http://localhost:3000` walks every flow on an emulated phone, then the desktop workspace (needs a Chromium path in `CHROME`).

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

### Responsive layouts (Figma “Desktop & tablet”)

- **< 768 px** — phone design (393), floating bottom nav.
- **768–1279 px** — 76 px nav rail. Chats: list panel (330) + conversation. Home: chat-first grid.
- **≥ 1280 px** — 248 px sidebar. Chat: thread (max 620) + “Your plan” panel (388); insight card goes two-column. Home: composer, continue card, previous chats, this week / forecast / note, shortcuts.
- Onboarding, check-in, focus, calm and safety screens stay a centred column; sheets become centred modals.
- **⌘K / Ctrl+K** opens a quick check-in; Enter sends; Esc closes sheets.

`scripts/shot.mjs` screenshots a route; `scripts/grid.mjs` screenshots several routes side by side (e.g. at 1194 × 834 or 1440 × 900).
