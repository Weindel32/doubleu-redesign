-- Richieste arrivate dal modulo contatti del sito.
-- Applicata al progetto Supabase doubleu-order-app, accanto a orders e
-- raffle_signups.
--
-- La chiave pubblica (anon) non vede nulla di questa tabella.

create table if not exists public.contact_requests (
  id               bigint generated always as identity primary key,
  created_at       timestamptz not null default now(),
  name             text        not null,
  email            text        not null,
  club             text,
  request_type     text,
  message          text        not null,
  lang             text        not null default 'IT',
  -- nuova -> convertita (diventa un prospect) | archiviata: lo smistamento
  -- si fa dalla sezione Richieste dal sito della pagina Prospect dell'Order App
  status           text        not null default 'nuova'
                   check (status in ('nuova','convertita','archiviata')),
  -- solo per il limite di invii: l'indirizzo IP non viene mai salvato in chiaro
  ip_hash          text,
  notified         boolean     not null default false,
  auto_reply_sent  boolean     not null default false,
  -- 'form' = api/contact.js; 'web3forms' = richieste importate dal vecchio modulo
  source           text        not null default 'form',
  prospect_id      uuid        references public.prospects(id) on delete set null,
  handled_at       timestamptz
);

create index if not exists contact_requests_created_at
  on public.contact_requests (created_at desc);
create index if not exists contact_requests_ip_recent
  on public.contact_requests (ip_hash, created_at desc);

-- RLS attiva. Scrive solo l'endpoint con la service key; l'Order App
-- (utenti autenticati, come per prospects) legge e smista.
alter table public.contact_requests enable row level security;

create policy contact_requests_read_authenticated on public.contact_requests
  for select to authenticated using (true);
create policy contact_requests_update_authenticated on public.contact_requests
  for update to authenticated using (true) with check (true);
