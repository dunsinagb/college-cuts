create table if not exists public.alert_subscriptions (
  id bigserial primary key,
  email text not null,
  institution_slug text not null,
  institution_name text,
  state text,
  created_at timestamptz not null default now(),
  unique (email, institution_slug)
);

alter table public.alert_subscriptions enable row level security;

create policy if not exists "service role full access" on public.alert_subscriptions
for all
using (true)
with check (true);

create index if not exists alert_subscriptions_institution_slug_idx on public.alert_subscriptions (institution_slug);
create index if not exists alert_subscriptions_email_idx on public.alert_subscriptions (email);
