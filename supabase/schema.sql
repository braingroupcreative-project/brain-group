-- Brain Group — schéma PostgreSQL (Supabase / Neon)
-- À exécuter une fois dans l'éditeur SQL. Toutes les tables sont verrouillées (RLS activé sans politique) :
-- seul le serveur Next.js, avec la clé service, y accède. Le navigateur n'a JAMAIS d'accès direct.

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key,
  email text not null unique,
  name text not null,
  role text not null check (role in ('admin','agent')),
  password_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists requests (
  id uuid primary key,
  ref text not null unique,
  service text not null check (service in ('evenementiel','imprimerie','informatique','digital')),
  details jsonb not null default '{}',
  name text not null,
  phone text not null,
  email text not null,
  company text not null default '',
  city text not null default '',
  message text not null default '',
  consent boolean not null default false,
  status text not null default 'nouvelle',
  assigned_to uuid references users(id),
  attachments jsonb not null default '[]',
  notes jsonb not null default '[]',
  history jsonb not null default '[]',
  taken_at timestamptz,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists requests_status_idx on requests(status, created_at);

create table if not exists quotes (
  id uuid primary key,
  ref text not null unique,
  request_id uuid not null references requests(id) on delete cascade,
  token text not null unique,
  items jsonb not null default '[]',
  validity_days int not null default 15,
  conditions text not null default '',
  delay text not null default '',
  payment_terms text not null default '',
  deposit_mode text not null default 'percent' check (deposit_mode in ('percent','amount')),
  deposit_value numeric not null default 50,
  total numeric not null default 0,
  deposit numeric not null default 0,
  status text not null default 'brouillon' check (status in ('brouillon','envoye','accepte','refuse')),
  sent_at timestamptz,
  decided_at timestamptz,
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key,
  ref text not null unique,
  quote_id uuid not null references quotes(id) on delete cascade,
  request_id uuid not null references requests(id) on delete cascade,
  status text not null default 'confirmee' check (status in ('confirmee','production','terminee','annulee')),
  history jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key,
  quote_id uuid not null references quotes(id) on delete cascade,
  kind text not null check (kind in ('acompte','solde','autre')),
  amount numeric not null,
  method text not null default 'wave',
  tx_ref text not null default '',
  proof_path text,
  status text not null default 'a_verifier' check (status in ('a_verifier','confirme','rejete')),
  paid_at timestamptz not null default now(),
  confirmed_by text,
  history jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- Journal des actions sensibles (devis, paiements, suppressions, utilisateurs)
create table if not exists audit (
  id uuid primary key,
  at timestamptz not null default now(),
  "user" text not null,
  action text not null,
  target text not null,
  created_at timestamptz not null default now()
);

-- Compteurs atomiques pour les références (BG-2026-0001, DV-..., CMD-...)
create table if not exists counters (
  key text primary key,
  value bigint not null default 0
);

create or replace function next_counter(counter_key text) returns bigint
language plpgsql security definer as $$
declare v bigint;
begin
  insert into counters(key, value) values (counter_key, 1)
  on conflict (key) do update set value = counters.value + 1
  returning value into v;
  return v;
end $$;

-- Verrouillage : RLS actif, aucune politique => aucun accès via la clé publique (anon).
alter table users enable row level security;
alter table requests enable row level security;
alter table quotes enable row level security;
alter table orders enable row level security;
alter table payments enable row level security;
alter table audit enable row level security;
alter table counters enable row level security;
revoke all on function next_counter(text) from public, anon, authenticated;

-- Stockage privé des pièces jointes / preuves de paiement :
-- Supabase > Storage > New bucket "brain-private" > Public = OFF.
insert into storage.buckets (id, name, public)
values ('brain-private', 'brain-private', false)
on conflict (id) do nothing;

-- ---- Mise à jour v1.1 : réalisations gérées depuis l'administration ----
-- (à exécuter aussi sur une base déjà créée)
create table if not exists realisations (
  id uuid primary key,
  service text not null check (service in ('evenementiel','imprimerie','informatique','digital')),
  title text not null,
  caption text not null default '',
  image text not null,
  fit text not null default 'cover' check (fit in ('cover','contain')),
  featured boolean not null default false,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);
alter table realisations enable row level security;

-- ---- Mise à jour v1.2 : nouveau pôle « Solutions digitales & IA » ----
-- À exécuter sur une base déjà créée (sans danger si déjà appliqué).
alter table requests drop constraint if exists requests_service_check;
alter table requests add constraint requests_service_check
  check (service in ('evenementiel','imprimerie','informatique','digital'));
alter table realisations drop constraint if exists realisations_service_check;
alter table realisations add constraint realisations_service_check
  check (service in ('evenementiel','imprimerie','informatique','digital'));
notify pgrst, 'reload schema';

-- ---- Mise à jour v1.3 : nouveau pôle « Communication & visibilité » ----
-- À exécuter sur une base déjà créée (sans danger si déjà appliqué).
alter table requests drop constraint if exists requests_service_check;
alter table requests add constraint requests_service_check
  check (service in ('evenementiel','imprimerie','informatique','digital','communication'));
alter table realisations drop constraint if exists realisations_service_check;
alter table realisations add constraint realisations_service_check
  check (service in ('evenementiel','imprimerie','informatique','digital','communication'));
notify pgrst, 'reload schema';
