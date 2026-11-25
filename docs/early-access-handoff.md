# Evo early access — developer handoff

> **Update:** the dark intro loader (§2) was dropped from the build — the page opens directly on the light pick screen. §2 is kept for reference only; the `intro_*` analytics events are not emitted.

Intro loader + email capture flow for `evo.lumidai.in`.
Visual source of truth: Figma **Lumid AI Posts → ◆ Lumid Social Design System** (Row 00 Intro loader, Row 01 Email capture flow, board "EA · Developer handoff").
This file is the behavioural source of truth.

- Stack: Next.js 16 · React 19 · Tailwind 4 · `motion` 13
- Route: `/early-access` — one page, steps are client state (`?step=a|b|c` for back-button support)
- Implemented — see **Implementation map** at the end of this file.

## 1. Flow

```
00 Loader ──(3.4 s or skip)──▶ A Pick your line ──(tap line)──▶ B Evo answers + email
                                     │                                   │
                                     └────────(submit email)─────────────┴──▶ C Confirm & pass ──(email link)──▶ C✓ Confirmed
```

Email is never gated: A and B both accept a signup.

| Case | Trigger | Behaviour |
|---|---|---|
| Skip intro | Tap / click / any key during loader | 300 ms compressed bloom → A. `intro_skipped` |
| Returning visitor | `sessionStorage['evo-intro-seen'] = '1'` | No loader |
| Join without picking | Submit on A | → C with `excuse_id: null` |
| Invalid email | Submit with bad format / 422 | Field → Error (G3), stay, keep focus |
| Already on the list | 200 `{ already: true }` | Notice G5 inline, then → C with existing spot; resend confirm email |
| Network / 5xx / 429 | Request fails | Keep value, show G6 copy, re-enable button |
| `?ref=CODE` | Came from a friend | Persist in sessionStorage, send with signup; referrer credited after this person confirms |
| Back on C | `popstate` → `?step=b` | Return to B with email + line preserved; never resubmit |

## 2. Intro loader — timeline

Total 3.4 s, plus a 300 ms overlap while A fades in. Rendered as a fixed **overlay above A** (A is server-rendered underneath → indexable, instant skip). Unmount at 3.7 s.

Beats: **1 Light on** 0 ms · **2 Introducing** 800 ms · **3 Lumid Evo** 1600 ms · **4 Bloom & out** 2800 ms · **hand-off** 3400 ms.

| Layer | Property | From → To | Start ms | Dur ms | Easing | Notes |
|---|---|---|---|---|---|---|
| Background | opacity | 0 → .12 → .35 → 1 | 0 / 800 / 1400 | 400 / 600 / 600 | out, out, in-out-soft | Topographic image + dot grid |
| Orb | scale, opacity | .6 → 1, 0 → 1 | 0 | 600 | spring-gentle | `orb.webp` 44 px (desktop 75) at 42 % vh |
| Orb | scale (one breath) | 1 → 1.06 → 1 | 600 | 800 | in-out-soft | Grows to 96 px by 800 ms |
| Orb | scale, opacity, blur | 1 → 1.6, 1 → 0, 0 → 12 px | 1400 | 400 | out | Dissolves into glow |
| Rays | dashoffset, opacity | 1 → 0, 0 → .35 | 800 | 600 | out | One SVG, 72 lines (96 desktop), `pathLength=1` |
| Rays | scale, opacity | 1 → 2, .35 → .4 | 1600 | 600 | out | |
| Rays | rotate | −8° → 0° | 800 | 2000 | linear | Camera drift |
| "Introducing" | y, opacity | +12 → 0, 0 → .9 | 900 | 500 | out | Helvetica Now Display Light 34 / 58 |
| "Introducing" | y, scale | → stack slot, 1 → .88 | 1600 | 400 | out | Makes room for LUMID EVO |
| LUMID | letter-spacing, blur, opacity | .3em → .04em, 8 → 0, 0 → 1 | 1600 | 500 | out | Clash Display Semibold, gradient |
| EVO | scale, opacity | .92 → 1, 0 → 1 | 1750 | 550 | spring-gentle | Gradient `#E9FFD0 → #A3E27D → #62BF3B` |
| EVO | glow | 0 → 40 px `#A3E27D` 55 % | 2000 | 600 | out | Animate opacity of a pre-blurred copy |
| Tagline | y, opacity | +8 → 0, 0 → 1 | 2200 | 400 | out | Instrument Serif Italic `#D4F77A` |
| Footer ticker | item cross-fade | 01 → 02 → 03 | 800 / 1600 / 2800 | 200 | out | Progress = `max(elapsed / 3400, assetsLoaded)` |
| Exit · EVO | scale, blur, opacity | 1 → 1.8, 0 → 14 px, 1 → .55 → 0 | 2800 | 600 | in-bloom | Pushes toward camera |
| Exit · bloom | clip-path circle | 0 → 150vmax | 2800 | 500 | in-bloom | `#F3FBEC` core → `#C9EE9F` edge |
| Exit · bloom | opacity | 1 → 0 | 3300 | 300 | out | A already mounted underneath |
| Step A | opacity, y | 0 → 1, 8 → 0 | 3300 | 400 | out | Then unmount loader; focus A `<h1>` |

Desktop scales sizes ×1.7; timings are identical.

Footer ticker copy: `01 Check in — Say what you're avoiding` · `02 Name it — Fear, overwhelm, tiredness` · `03 One small step — Five minutes, today`. Status: `WAKING EVO UP` → `PREPARING A CALM SPACE` → `ALMOST THERE` → `READY`.

### Loader rules

- **Once per session** — set `evo-intro-seen` on start; wrap storage in try/catch.
- **Skip** — tap/click/Space/Enter/Esc → exit beat (300 ms). Visible "Skip intro" button bottom-right, focusable, ≥ 44 px.
- **Asset gating** — preload `orb.webp`, `grain.png`, topographic background. If not ready at 2.8 s, loop the orb breath on beat 3 (max 6 s total), then exit anyway.
- **Reduced motion** — no rays/scale/blur/bloom. Show beat 3 static for 1000 ms, then 300 ms cross-fade. Still skippable.
- **A11y** — overlay `role="status" aria-live="polite"` "Loading Evo"; decorative layers `aria-hidden`; don't trap focus.
- **Performance** — transform/opacity only; blur via cross-fade to pre-blurred copies; rays are one SVG path; target 60 fps on mid-range Android.

```tsx
// src/app/early-access/intro-loader.tsx (sketch)
const [scope, animate] = useAnimate();
useEffect(() => {
  if (seen()) return done();
  if (reduced) return staticBeat();
  markSeen();
  const controls = animate([
    ["[data-l=bg]",    { opacity: [0, 0.12] },                    { at: 0,   duration: 0.4, ease: EVO_OUT }],
    ["[data-l=orb]",   { scale: [0.6, 1], opacity: [0, 1] },       { at: 0,   type: "spring", stiffness: 180, damping: 24 }],
    ["[data-l=rays]",  { pathLength: [0, 1], opacity: [0, 0.35] }, { at: 0.8, duration: 0.6, ease: EVO_OUT }],
    ["[data-l=intro]", { y: [12, 0], opacity: [0, 0.9] },          { at: 0.9, duration: 0.5, ease: EVO_OUT }],
    // …every row of the keyframe table…
    ["[data-l=bloom]", { clipPath: ["circle(0% at 50% 50%)", "circle(150vmax at 50% 50%)"] }, { at: 2.8, duration: 0.5, ease: BLOOM_IN }],
  ]);
  controls.then(done);
  return () => controls.stop();
}, []);
```

## 3. Screens & states

Breakpoints: < 768 px → mobile (393 design, max 480 px centred) · 768–1199 → mobile layout, max 560 px · ≥ 1200 → desktop (1440 design, 1200 px content).

| Step | Figma frame | Components | States | Interaction |
|---|---|---|---|---|
| 00 Loader | `EA 00 · Loader · *` | Background · Night, Evo Orb, rays SVG, LUMID, footer ticker | beats 1–4, held, reduced | Tap/key = skip |
| A Pick your line | `EA 01 · A` / `D` | Eyebrow, Quote Bubble ×5, Email Field, consent | idle, focus, G1–G6 | Tap line → B · submit → C |
| B Evo answers | `EA 01 · B` / `E` | Quote Bubble (Selected/Dim), Evo reply card, Email Field | typing, done, G1–G6 | Other line = swap · selected = back to A · submit → C |
| C Confirm & pass | `EA 01 · C` / `F` | Toast, Eyebrow, Evo Pass, Tag, stats, steps, queue card, Pill | pending, already, confirmed (C✓) | Share → Web Share API, fallback copy |
| G Field states | `EA 01 · G` | Email Field: Default, Focused, Error, Loading, Disabled | empty, typing, invalid, saving, already, offline | Validate on submit only |

C✓ (confirmed, `/early-access/confirmed`) reuses C with headline "You're in.", eyebrow "Spot locked in", no confirm toast.

### Email field

- `type=email inputmode=email autocomplete=email autocapitalize=off spellcheck=false required`, `aria-describedby` = consent + error.
- Trim + lowercase. Client check `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` on submit; server is the authority.
- Loading ≥ 300 ms; button disabled, input stays editable. Enter submits.
- Consent line under every field: "One email when your invite is ready. No spam — unsubscribe anytime."
- Copy — invalid: "That email doesn't look right — check for a missing ".com"?" · offline/5xx: "Couldn't save just now — your email is kept here. Try again?" · 429: "Too many tries — give it a minute." · already: "You're already on the list as {email} — we've resent your pass link."

### Excuse content

| id | Bubble | Cause tag | Small step |
|---|---|---|---|
| `lunch` | "I'll start after lunch." | Waiting to feel ready | Open the file and write one messy line. Two minutes, then you can stop. |
| `video` | "Just one more video, then I'll study." | Escaping a hard start | Phone in another room. Set a 5-minute timer and read just one page. |
| `fail` | "What if I try and still fail?" | Fear of not being good enough | Do a 'bad on purpose' draft. Nobody sees it. |
| `much` | "There's too much. Where do I even begin?" | Overwhelm | Brain dump for 3 minutes. Then circle the smallest thing. |
| `tomorrow` | "Tomorrow. I'll do it properly tomorrow." | All-or-nothing thinking | Do the 'improper' version tonight; 10 minutes counts. |

## 4. Transitions

| From → To | Trigger | Motion | Timing | Focus / a11y |
|---|---|---|---|---|
| Loader → A | end / skip | Bloom fades over A; A fades + rises 8 px | 3300 → 3700 ms | Focus A `<h1>` |
| A → B | tap line | Selected 1 → 1.04 → 1 + glow; others → .35; caption → "EVO HEARD YOU"; reply card y 20 → 0, scale .98 → 1; text types 2 chars / 22 ms | 200 ms · spring-gentle · ≈1.5 s | Reply card `aria-live=polite` (final text once) |
| B → B | other line | Old card out 120 ms, new card in, typing restarts | 120 ms + spring | — |
| A/B → C | 201 / 200 | Field Loading ≥ 300 ms → content fade + scale .98 (200 ms) → toast from −16 px; pass rotateY −90° → 5°; rays −12° → 0; tags stagger 60 ms; stats count up 600 ms | out 200 · spring-gentle · 60 stagger | Focus C heading; toast `role=status` |
| C pass | pointer move | Tilt ±10° X / ±14° Y + sheen; off for touch & reduced motion | spring 200/20 | Decorative |
| Reduced motion | media query | All of the above → 200 ms opacity cross-fades, no typing effect | 200 ms | — |

## 5. API & data (double opt-in)

```http
POST /api/early-access
{ "email": "riya@gmail.com", "excuse_id": "video" | null, "ref": "EVO-1234" | null,
  "source": "web", "utm": { "source": "instagram", "campaign": "evo-launch" }, "consent_version": "2026-11" }

201 { "status": "pending_confirmation", "spot": 1537, "wave": 3, "code": "EVO-4947",
      "share_url": "https://evo.lumidai.in/?ref=EVO-4947", "invites": 0 }
200 { "already": true, ...same body }     → G5 notice, then C
422 { "error": "invalid_email" }          → G3
429 { "error": "rate_limited" }           → G6 (429 copy)
5xx / network                              → G6, keep value

GET /api/early-access/confirm?token=…     → 302 /early-access/confirmed
```

- Spot is server-assigned; format with `en-IN` grouping (`#1,537`).
- Waves: default 3 · 1 confirmed invite → 2 · 3 → 1 + founder badge.
- Emails: confirm (immediately) and invite (when wave opens). Nothing else without new consent.
- Store email, excuse_id, ref, utm, consent_version, timestamps. Hash IP for rate limiting only.
- Rate limit: 5 submits / IP / 10 min; 3 / email / day.

## 6. Analytics (no PII)

| Event | When | Properties |
|---|---|---|
| `intro_started` | loader mounts | `{ reduced_motion }` |
| `intro_skipped` | user skips | `{ at_ms }` |
| `intro_completed` | natural exit | `{ held_ms }` |
| `line_selected` | tap bubble | `{ excuse_id, order }` |
| `email_submitted` | valid submit | `{ step, excuse_id }` |
| `email_invalid` | client/422 | `{ reason }` |
| `signup_success` | 201/200 | `{ already, wave, has_ref }` |
| `signup_failed` | 429/5xx/network | `{ code }` |
| `share_clicked` | share/copy | `{ method: native \| copy }` |

## 7. Tokens & accessibility

Reuse `src/app/globals.css` and `src/lib/motion.ts`.

| Motion token | Value |
|---|---|
| `ease-out-evo` | `cubic-bezier(0.2, 0, 0, 1)` |
| `ease-in-out-soft` | `cubic-bezier(0.65, 0, 0.35, 1)` |
| `ease-in-bloom` | `cubic-bezier(0.7, 0, 0.84, 0)` |
| `spring-gentle` | stiffness 180, damping 24 |
| `spring-snappy` | stiffness 500, damping 38 |
| fast / base | 160 ms / 240 ms |

Colours: night `#0B0D0A` · lime `#88D95F` · lime-deep `#3F8F22` · glow-text `#D4F77A` · error-on-dark `#FF8F7A` · warn-on-dark `#FFCF8A`.
Type: Helvetica Now Display (licensed, self-host `/public/fonts`, fallback Inter) · Instrument Serif Italic (accent) · Clash Display Semibold (wordmark) · Geist Mono Medium (labels).

Accessibility:
- Body text ≥ 4.5:1; consent line ≥ 50 % white on night.
- Targets ≥ 44 × 44; bubbles are `<button aria-pressed>`.
- Tab order: Skip intro → lines → email → submit; focus ring `#3F8F22` 2 px.
- Orb, rays and tags `aria-hidden`; reply card and toast are polite live regions.
- Disclaimer visible on every step: "Evo is a support tool, not therapy or a diagnosis. In a crisis, contact a professional or helpline."

## 8. Implementation map

| Concern | File |
|---|---|
| Page + confirm landing | `src/app/(launch)/early-access/page.tsx`, `confirmed/page.tsx` |
| API | `src/app/api/early-access/route.ts` (POST), `confirm/route.ts` (GET → 302) |
| Server rules + in-memory store | `src/lib/early-access/server.ts` — **swap `db` for a real table; log line stands in for the confirm email** |
| Copy, excuses, validation, waves | `src/lib/early-access/content.ts` |
| Client API, analytics `track()`, session storage | `src/lib/early-access/client.ts` (analytics pushes to `window.dataLayer`) |
| Flow state, history (`?step=`), submit | `src/components/early-access/flow.tsx` |
| Light design (Figma `192:73126`): backdrop · sheet/popover · email field | `light-backdrop.tsx` · `evo-reply.tsx` · `email-field.tsx` |
| Smooth scroll (Lenis), scroll lock | `src/lib/early-access/scroll.ts`, `smooth-scroll.tsx` |
| A/B view · C view | `pick-view.tsx` · `success-view.tsx` |
| Easing tokens | `src/lib/motion.ts` (`EASE_OUT`, `EASE_IN_OUT_SOFT`, `EASE_BLOOM`) |
| Desktop breakpoint | `--breakpoint-desk: 75rem` in `globals.css` (`desk:` variant, ≥ 1200 px) |

Skip keys implemented: pointer, Space, Enter, Esc (Tab is deliberately not a skip key so keyboard users can reach the Skip button).
Fonts: Instrument Serif Italic and Inter are bundled via `@fontsource`. Helvetica Now Display is licensed — drop the files in `/public/fonts` to use it (Inter is the fallback).
