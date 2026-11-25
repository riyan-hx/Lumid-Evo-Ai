-- Evo early access — run once in Supabase → SQL Editor.
create table if not exists public.early_access (
  id              bigint generated always as identity primary key,
  spot            bigint generated always as identity (start with 1537) unique,
  email           text   not null,
  code            text   not null unique,
  token           text   not null unique,
  confirmed       boolean not null default false,
  confirmed_at    timestamptz,
  invites         int    not null default 0,
  excuse_id       text,
  ref             text,
  utm_source      text,
  utm_campaign    text,
  consent_version text,
  created_at      timestamptz not null default now()
);

-- One row per person, case-insensitive.
create unique index if not exists early_access_email_key on public.early_access (lower(email));

-- Only the server (service-role key) touches this table: RLS on, no policies.
alter table public.early_access enable row level security;

-- Atomic confirm + referral credit. Returns the confirmed row's code, or null for an unknown token.
create or replace function public.evo_confirm(p_token text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.early_access;
begin
  select * into r from public.early_access where token = p_token for update;
  if not found then return null; end if;
  if not r.confirmed then
    update public.early_access set confirmed = true, confirmed_at = now() where id = r.id;
    if r.ref is not null then
      update public.early_access set invites = invites + 1 where code = r.ref;
    end if;
  end if;
  return r.code;
end;
$$;

revoke all on function public.evo_confirm(text) from public, anon, authenticated;
