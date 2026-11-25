# Early access — backend setup

Registrations are stored in **Supabase** (you can see and export them in its Table Editor), optionally mirrored
live into a **Google Sheet**, and the confirmation email is sent from **info@lumid.in**.

Check everything any time: `GET https://evo.lumidai.in/api/early-access/health` → `{ ok: true, storage: "supabase", db: "ok", sheet_mirror, confirm_email }`.
Without `SUPABASE_*` the production API refuses signups (503) instead of silently losing them.

## 1 · Supabase (5 min)
1. supabase.com → New project (any region; note the DB password).
2. SQL Editor → paste `supabase/early_access.sql` → Run.
3. Project Settings → API → copy **Project URL** and the **service_role** key → Vercel env `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
   The service key bypasses RLS — it is only ever used on the server.
4. Registrations appear in Table Editor → `early_access` (columns: email, spot, code, confirmed, excuse_id, ref, utm_*, created_at).

## 2 · Email from info@lumid.in — choose one
**A. Resend (recommended, best deliverability)**
1. resend.com → Domains → Add `lumid.in` → add the DNS records it shows (SPF/DKIM — TXT/MX/CNAME) in GoDaddy DNS for lumid.in.
   If lumid.in already has mail (Google Workspace / Zoho), Resend's records don't replace the existing MX — add only the ones it lists for the `send` subdomain.
2. API Keys → create → Vercel env `RESEND_API_KEY`, and `EMAIL_FROM="Evo by Lumid <info@lumid.in>"`.
3. Wait for the domain to show **Verified**, then test with `/api/early-access/health` and a real signup.

**B. Google Workspace (no DNS work)** — only if info@lumid.in is a Google account.
Create the Sheet **while signed in as info@lumid.in**, deploy the Apps Script there with `SEND_CONFIRM_EMAIL = true`.
Mail is sent as info@lumid.in using that account's quota (≈1,500/day on Workspace). Leave `RESEND_API_KEY` unset.

## 3 · Google Sheet mirror (optional)
1. New Sheet → Extensions → Apps Script → paste `google/apps-script.gs`, set `SECRET`.
2. Deploy → New deployment → Web app → Execute as **Me**, access **Anyone** → copy the `/exec` URL.
3. Vercel env `GOOGLE_SHEET_WEBHOOK_URL` (the URL) and `GOOGLE_SHEET_SECRET` (same secret).
A tab "Registrations" is created automatically; rows turn from `pending` to `confirmed` when people click the email link.
The Sheet is a live view — Supabase stays the source of truth, and a Sheet outage never blocks a signup.

## 4 · Go live on evo.lumidai.in
1. Vercel → Project → Settings → Domains → add `evo.lumidai.in`; at GoDaddy (DNS for lumidai.in) add the CNAME Vercel shows (`evo` → `cname.vercel-dns.com`).
2. Settings → Environment Variables → add the vars above for **Production** (and Preview if you want previews to accept signups) → redeploy.
3. Deploy the branch to Production (merge to `main`, or promote the deployment).
4. Verify: `/api/early-access/health` is `ok`, register with a real address, receive the email, click it → "You’re in, for real.", check the row in Supabase/Sheet.
