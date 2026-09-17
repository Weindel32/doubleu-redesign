-- Tabella delle registrazioni all'estrazione dei club.
-- Da applicare al progetto Supabase scelto per l'app pubblica.
--
-- Nessun accesso diretto dal browser: scrive e legge solo l'endpoint
-- api/raffle-signup.js con la service key. RLS resta attiva e senza policy,
-- cosi' la chiave pubblica del progetto non vede nulla di questa tabella.

create table if not exists public.raffle_signups (
  seq               bigint generated always as identity primary key,
  club              text        not null,
  first_name        text        not null,
  last_name         text        not null,
  email             text        not null,
  size              text        not null,
  lang              text        not null default 'IT',
  news_consent      boolean     not null default false,
  rules_accepted_at timestamptz not null,
  created_at        timestamptz not null default now()
);

-- Una partecipazione per indirizzo e per club: il vincolo sta nel database,
-- non nel codice, cosi' due invii simultanei non possono aggirarlo.
create unique index if not exists raffle_signups_club_email
  on public.raffle_signups (club, lower(email));

alter table public.raffle_signups enable row level security;
