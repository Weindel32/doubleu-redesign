-- Richieste arrivate dal modulo contatti del sito.
-- Applicata al progetto Supabase doubleu-order-app, accanto a orders e
-- raffle_signups.
--
-- Nessun accesso diretto dal browser: scrive solo l'endpoint api/contact.js
-- con la service key. RLS resta attiva e senza policy, cosi' la chiave
-- pubblica del progetto non vede nulla di questa tabella.

create table if not exists public.contact_requests (
  id               bigint generated always as identity primary key,
  created_at       timestamptz not null default now(),
  name             text        not null,
  email            text        not null,
  club             text,
  request_type     text,
  message          text        not null,
  lang             text        not null default 'IT',
  -- nuova -> risposta -> preventivo -> chiusa: lo aggiorna chi segue il lead
  status           text        not null default 'nuova',
  -- solo per il limite di invii: l'indirizzo IP non viene mai salvato in chiaro
  ip_hash          text,
  notified         boolean     not null default false,
  auto_reply_sent  boolean     not null default false
);

create index if not exists contact_requests_created_at
  on public.contact_requests (created_at desc);
create index if not exists contact_requests_ip_recent
  on public.contact_requests (ip_hash, created_at desc);

alter table public.contact_requests enable row level security;
