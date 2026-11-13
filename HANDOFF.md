# Handoff: continue Lumid Evo development

Read this first, then only the files the task names. Don't explore the codebase broadly.

## Product in one paragraph
Lumid Evo is a problem-solving companion for students, competitive-exam aspirants and young professionals in Kerala. It is not a timer, a productivity app or a chatbot. Every flow ends in a fix and a small step: problem → cause → fix → book a step (≤5 min to start) → review (“did it help?”). The style is warm, colourful and calm (Evo design style, Hugeicons), gamified only gently, never guilt or streaks. The demo student is **Jacob** (fictional data; use neutral pronouns, never guess pronouns from names).

## Repo and branch
- Repo: `riyan-hx/LUMID-Evo-by-LS` (old name `lumid-evo-by-ls` redirects). Branch: **`claude/problem-solving`**. Push only there. The user merges; don't open PRs unless asked. Never force-push.
- Commit footer (required):
  ```
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```
- Never commit `server/.env` or any secret. `DEV_LOGIN` and demo data are for non-production only.

## Stack
Next.js 16 App Router + React 19 + Tailwind 4 + `motion` (web, `src/`). Read `node_modules/next/dist/docs/` before using unfamiliar Next APIs (see AGENTS.md). NestJS ESM API + Prisma 7 + Postgres + Redis (`server/`). A shared zod contract (`src/lib/api/contract.ts`) is used by both; OpenAPI is generated from it.

## Run locally (cloud container)
```bash
service postgresql start; redis-server --daemonize yes --save ""
# DBs: evo_dev, evo_test (user/pw postgres/postgres). Create if missing:
psql postgresql://postgres:postgres@localhost:5432/postgres -c "create database evo_dev" -c "create database evo_test"
```
`server/.env` (local only, never commit): `NODE_ENV=development DEPLOY_ENV=development PORT=4000 DATABASE_URL=postgresql://postgres:postgres@localhost:5432/evo_dev DIRECT_DATABASE_URL=<same> REDIS_URL=redis://localhost:6379 SUPABASE_URL=https://test.supabase.co SUPABASE_JWT_SECRET=<any 32+ chars> EVO_AI_PROVIDER=scripted CORS_ORIGINS=http://localhost:3000 QUEUE_MODE=cron SEED_DEMO_PRACTITIONER=true DEV_LOGIN=true`

```bash
cd server && npm ci && npx prisma migrate deploy && npm run build && npm start &      # API :4000
cd .. && npm ci && NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=local \
  NEXT_PUBLIC_API_URL=same-origin API_PROXY_URL=http://localhost:4000 npm run build && npm start &   # web :3000
```
Sign in with **“Open the demo student”**. Reset Jacob's demo data:
`psql postgresql://postgres:postgres@localhost:5432/evo_dev -c "delete from users where id='dea10000-0000-4000-8000-000000000001'"`

## Checks (run once per item, at the end)
- Web: `npx tsc --noEmit && npx eslint src --quiet`
- Server: `cd server && TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/evo_test npm test` (97 passing)
- OpenAPI after contract changes: `cd server && SUPABASE_URL=https://ci.supabase.co SUPABASE_JWT_SECRET=ci-secret-ci-secret-ci-secret-ci-secret DATABASE_URL=postgresql://postgres:postgres@localhost:5432/evo_test npm run openapi`
- End to end (web + API running): `node scripts/e2e-live.mjs http://localhost:3000 http://localhost:3000` (17 steps)
- New migration: `cd server && npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script > prisma/migrations/<timestamp>_<name>/migration.sql`, then `migrate deploy` on evo_dev and evo_test. Additive changes only.

## Where things are
- Problem catalog (12 problems, causes, fixes, first steps): `src/lib/evo/problems.ts`. Colour tone per problem: `src/lib/evo/tones.ts`.
- Thinking traps: `src/lib/evo/thinking.ts`. Procrastination blockers: `src/lib/evo/unstuck.ts`.
- Tools: hub `src/app/(loop)/tools/page.tsx`; **templates for a new tool**: `tools/unstuck/page.tsx` (lab + 3-step flow) and `tools/thought/page.tsx` (multi-stage form). Tool entries: `ToolEntry` model, `server/src/tools/*`, contract `toolEntryInput` (add a new `z.literal("<tool>")` branch per tool), client `api.saveToolEntry` / `api.toolEntries`.
- Home: `src/components/evo/live-home.tsx`, Brief `evo-brief.tsx`. Check-in: `src/app/(loop)/check-in/check-in.tsx` (MoodPad, MuchSlider). Problems board: `LivePlans`/`ProblemCard` in `src/components/evo/live-lists.tsx`.
- Chat: `src/components/evo/live-chat.tsx` (chip routing: add `c === "<chip>" ? router.push(...)`), offline coach `server/src/chat/ai/scripted.provider.ts`, engine `server/src/chat/engine/`.
- Calm/grounding: `src/app/(loop)/calm/`. Focus timer: `src/app/(loop)/focus/`.
- Safety: crisis `src/app/(safety)/crisis/`, safety contact `server/src/safety/*` and `src/app/(tabs)/settings/safety/`. Safety contact rules: never asked during a crisis (only the next day), explicit consent, never share chat content, at most one text per 6 hours.
- Demo data: `server/src/demo/demo.service.ts`, `demo-script.ts`.
- UI parts: `src/components/ui/` (Pill, SoftChip, ProgressDots, BackButton, Screen, Icon), `src/components/evo/rating-slider.tsx`. Colour tokens in `src/app/globals.css` (`lime, sky, peach, sun, lavender, blush, mint` with `-subtle/-soft/-text`).
- Malayalam: `src/lib/i18n-ml.ts`. Add `"English": "മലയാളം"` entries (keys sorted, case-insensitive). Wrap user-facing text in `t()`.
- Docs to update per feature: `docs/FLOWS.md` (screen rows), `docs/HOW-EVO-WORKS.md`.

## Conventions
Follow existing style. Small focused changes, no new dependencies. Every tool ends in an action. Show insights only when real data backs them. Keep the crisis link (“Feeling unsafe or overwhelmed? Talk to someone now”) on tool screens. Never diagnose. Screeners route only.

## Remaining checklist
**Before the hackathon (in order):**
1. #22 Steady → Solve: choose the grounding exercise by state (panic → paced breathing / cold water; racing thoughts → name 3 things + label the worry; low energy → stand, stretch, light). After one minute, always ask “Ready to look at what set this off?” → check-in or chat with the problem. Files: `calm/`, `server/src/chat/engine/decide.ts`.
2. #11 Chat uses tools inline: chips for thought record / procrastination lab / worry tree at the right cause, and a next-day follow-up message on booked steps.
3. #5 Worry tree: “Can I do something about this?” → yes: plan a step now; no: park it for a 15-minute worry time and let it go. Copy `tools/unstuck`.
4. #15 Weekly review: what you solved, what helped (from reviews and tool entries), next week's one focus.
5. #2 Warm colour on Solve and Focus screens.
6. Demo check: reset Jacob, run e2e, refresh pitch deck text.
If time remains: #14 What works for you (rank fixes by the person's own “did it help?” results).

**After the hackathon:** #6 behavioural experiment, #7 brain dump & sort, #8 mistake log, #9 conversation script (DESC), #10 courage ladder, #12 three demo journeys, #13 gentle game layer, #16 support plan, #19 iCBT programs, #20 reflect-back labels, #21 consented screeners (PHQ-4/GAD-7, routing only), #23 your words, #24 life patterns map.

## Model guide (Pro plan)
- Sonnet, medium effort: new tool screens that copy the existing pattern (#5, #15, #14, #2).
- Sonnet, high effort: engine/chat work with tests (#22, #11).
- Haiku: Malayalam strings, docs, running checks, commit/push, deck text.
- Opus: only after the hackathon, for screeners (#21) and the support plan (#16).
One checklist item per prompt; skip screenshots until the end; stop and commit at ~80% of the session limit.
