/* Estrazione del vincitore.

   La pagina che chiama questo endpoint la apre una persona delegata dal
   club, dal suo telefono, la sera dell'evento. Quindi qui dentro non si da'
   per scontato niente di quello che arriva dal browser: la chiave si
   confronta con quella in ambiente, l'ora di apertura la decide il server,
   e il sorteggio lo fa il server — non il telefono, altrimenti il risultato
   dipenderebbe da chi lo tiene in mano.

   Al delegato torna soltanto il numero di partecipazione. Nome, email e
   taglia non escono mai da qui: vanno nella mail a DOUBLEU. */

const ALLOWED_ORIGINS = [
  'https://www.doubleutennis.com',
  'https://doubleutennis.com',
  'https://app.doubleutennis.com',
];
function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  return /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin);
}

/* Un club per riga: sigla nel numero di partecipazione, e il momento in cui
   le registrazioni chiudono. Prima di quell'istante il sorteggio non e'
   possibile, e il controllo sta qui perche' il link girera' in chat: un
   tocco curioso il giorno prima non deve poter bruciare l'estrazione. */
const CLUBS = {
  mtc: {
    sigla: 'MTC',
    nome: 'MTC Ausstellungspark',
    /* 27 settembre 2026, 19:30 in Germania (CEST, UTC+2). */
    chiusura: Date.parse('2026-09-27T17:30:00Z'),
  },
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DRAW_KEY = process.env.RAFFLE_DRAW_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = 'DOUBLEU <ordini@doubleutennis.com>';
const NOTIFY = 'info@doubleutennis.com';

const SIGNUPS = 'raffle_signups';
const DRAWS = 'raffle_draws';

async function sb(path, options = {}) {
  return fetch(SUPABASE_URL + '/rest/v1/' + path, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

/* Confronto a tempo costante: su una chiave segreta un confronto normale
   puo' rivelare quanti caratteri iniziali sono giusti. */
function chiaveValida(fornita) {
  const a = String(fornita || '');
  const b = String(DRAW_KEY || '');
  if (!b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function numero(sigla, seq) {
  return sigla + ' · ' + String(seq).padStart(3, '0');
}

function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/* Sorteggio con crypto invece di Math.random: non perche' qualcuno stia
   attaccando un'estrazione di magliette, ma perche' Math.random non
   garantisce una distribuzione uniforme e qui l'equita' e' il prodotto. */
function sorteggia(n) {
  const limite = Math.floor(0xffffffff / n) * n;
  const buf = new Uint32Array(1);
  let v;
  do { require('crypto').webcrypto.getRandomValues(buf); v = buf[0]; } while (v >= limite);
  return v % n;
}

async function avvisaDoubleu(club, estrazione, vincitore, totale) {
  if (!RESEND_KEY) return;
  const quando = new Date(estrazione.drawn_at).toLocaleString('it-IT', {
    timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'short',
  });
  const righe = [
    ['Numero estratto', numero(club.sigla, vincitore.seq)],
    ['Nome', (vincitore.first_name || '') + ' ' + (vincitore.last_name || '')],
    ['Email', vincitore.email || '—'],
    ['Taglia', vincitore.size || '—'],
    ['Lingua', vincitore.lang || '—'],
    ['Partecipanti', String(totale)],
    ['Estrazione', 'n. ' + estrazione.round + ' del ' + quando],
  ];
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
     max-width:520px;margin:0 auto;padding:28px 24px;background:#fffdf8;color:#1b2430">
    <div style="font-weight:700;letter-spacing:.13em;font-size:17px;color:#102845">DOUBLEU</div>
    <div style="font-size:8px;letter-spacing:.34em;color:#102845;margin-top:4px">TENNIS CULTURE</div>
    <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#a04f31;
       font-weight:700;margin-top:22px">Verlosung ${esc(club.nome)}</div>
    <h1 style="font-family:Georgia,serif;font-weight:400;font-size:26px;color:#102845;margin:8px 0 0">
      Estratto il numero ${esc(numero(club.sigla, vincitore.seq))}</h1>
    <table style="width:100%;border-collapse:collapse;margin-top:22px;font-size:14px">
      ${righe.map(([k, v]) => `<tr>
        <td style="padding:9px 0;border-top:1px solid #10284522;color:#6f6d68;
           text-transform:uppercase;font-size:11px;letter-spacing:.1em;width:42%">${esc(k)}</td>
        <td style="padding:9px 0;border-top:1px solid #10284522;color:#1b2430">${esc(v)}</td>
      </tr>`).join('')}
    </table>
    <p style="font-size:13px;line-height:1.6;color:#6f6d68;margin-top:24px">
      Al club e' stato annunciato soltanto il numero. Il nome non e' uscito da qui.<br>
      Se il vincitore non risponde entro 14 giorni, il premio si riassegna.
    </p>
  </div>`;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM, to: [NOTIFY],
        subject: `Verlosung ${club.sigla}: estratto ${numero(club.sigla, vincitore.seq)}`,
        html,
      }),
    });
  } catch (e) {
    /* L'estrazione e' gia' registrata: se la mail non parte non si annulla
       niente, il risultato resta leggibile dalla pagina e dal database. */
    console.log(JSON.stringify({ event: 'mail_estrazione_fallita', errore: String(e) }));
  }
}

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!SUPABASE_URL || !SUPABASE_KEY || !DRAW_KEY) {
    return res.status(500).json({ error: 'Configurazione mancante' });
  }

  const q = req.query || {};
  const body = req.method === 'POST' ? (req.body || {}) : {};
  const clubKey = String(q.club || body.club || '').toLowerCase();
  const club = CLUBS[clubKey];
  if (!club) return res.status(404).json({ error: 'Club sconosciuto' });

  /* Chiave sbagliata: stessa risposta che daremmo a un indirizzo inesistente,
     per non confermare a chi prova a caso di aver trovato la pagina giusta. */
  if (!chiaveValida(q.key || body.key)) return res.status(404).json({ error: 'Non trovato' });

  const adesso = Date.now();
  const aperta = adesso >= club.chiusura;

  /* Quante registrazioni valide, e cosa e' gia' stato estratto. */
  const rCount = await sb(
    `${SIGNUPS}?select=seq&club=eq.${encodeURIComponent(clubKey)}`,
    { headers: { Prefer: 'count=exact', Range: '0-0' } });
  const totale = Number((rCount.headers.get('content-range') || '').split('/')[1] || 0);

  const rDraws = await sb(
    `${DRAWS}?select=*&club=eq.${encodeURIComponent(clubKey)}&order=round.desc`);
  const estrazioni = rDraws.ok ? await rDraws.json() : [];
  const ultima = estrazioni[0] || null;

  const stato = () => ({
    club: club.nome,
    sigla: club.sigla,
    partecipanti: totale,
    aperta,
    chiusuraISO: new Date(club.chiusura).toISOString(),
    estratto: ultima ? {
      numero: numero(club.sigla, ultima.winner_seq),
      round: ultima.round,
      quando: ultima.drawn_at,
      partecipanti: ultima.entries_count,
    } : null,
    estrazioni: estrazioni.length,
  });

  if (req.method === 'GET') return res.status(200).json(stato());
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  /* ---- da qui in poi si estrae ---- */

  if (!aperta) {
    return res.status(409).json({ error: 'chiuso', ...stato() });
  }
  /* Una seconda estrazione e' prevista dal regolamento se il vincitore non
     risponde, ma dev'essere voluta: il browser deve dichiararlo. */
  const round = (ultima ? ultima.round : 0) + 1;
  if (ultima && body.conferma !== 'nuova-estrazione') {
    return res.status(409).json({ error: 'gia-estratto', ...stato() });
  }
  if (!totale) return res.status(409).json({ error: 'nessun-partecipante', ...stato() });

  const esclusi = estrazioni.map(e => e.winner_seq);
  const rTutti = await sb(
    `${SIGNUPS}?select=seq,first_name,last_name,email,size,lang&club=eq.${encodeURIComponent(clubKey)}`
    + (esclusi.length ? `&seq=not.in.(${esclusi.join(',')})` : ''));
  if (!rTutti.ok) return res.status(502).json({ error: 'Lettura fallita' });
  const candidati = await rTutti.json();
  if (!candidati.length) return res.status(409).json({ error: 'nessun-candidato', ...stato() });

  const vincitore = candidati[sorteggia(candidati.length)];

  /* L'inserimento e' il punto in cui l'estrazione diventa definitiva: il
     vincolo sul numero di giro impedisce che due tocchi ravvicinati sullo
     stesso pulsante producano due sorteggi. */
  const rIns = await sb(DRAWS, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      club: clubKey,
      round,
      winner_seq: vincitore.seq,
      winner_first: vincitore.first_name,
      winner_last: vincitore.last_name,
      winner_email: vincitore.email,
      winner_size: vincitore.size,
      winner_lang: vincitore.lang,
      entries_count: totale,
    }),
  });
  if (rIns.status === 409) {
    /* Qualcuno ha gia' estratto un istante fa: rileggiamo e restituiamo il
       suo esito invece di crearne un secondo. */
    const r = await sb(`${DRAWS}?select=*&club=eq.${encodeURIComponent(clubKey)}&order=round.desc&limit=1`);
    const g = r.ok ? (await r.json())[0] : null;
    return res.status(200).json({
      ...stato(),
      estratto: g ? {
        numero: numero(club.sigla, g.winner_seq), round: g.round,
        quando: g.drawn_at, partecipanti: g.entries_count,
      } : null,
    });
  }
  if (!rIns.ok) return res.status(502).json({ error: 'Registrazione fallita' });
  const estrazione = (await rIns.json())[0];

  await avvisaDoubleu(club, estrazione, vincitore, totale);

  console.log(JSON.stringify({
    event: 'estrazione', club: clubKey, round, seq: vincitore.seq, partecipanti: totale,
  }));

  return res.status(200).json({
    club: club.nome,
    sigla: club.sigla,
    partecipanti: totale,
    aperta: true,
    chiusuraISO: new Date(club.chiusura).toISOString(),
    estratto: {
      numero: numero(club.sigla, estrazione.winner_seq),
      round: estrazione.round,
      quando: estrazione.drawn_at,
      partecipanti: estrazione.entries_count,
    },
    estrazioni: estrazioni.length + 1,
    appenaEstratto: true,
  });
};
