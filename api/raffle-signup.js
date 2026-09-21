/* Registrazione di un socio all'estrazione del club.

   Il browser manda quello che l'utente ha scritto; qui non ci si fida di
   niente: club, taglia e consenso vengono confrontati con valori nostri, e
   il numero di partecipazione lo assegna il database, non il client. */

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

/* Club ammessi e loro sigla nel numero di partecipazione. Un club che non
   sta qui non puo' registrare nessuno, anche se qualcuno ne inventa il nome. */
const CLUBS = { mtc: 'MTC' };
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const LANGS = ['IT', 'EN', 'DE'];
const MAX_LEN = 80;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const TABLE = 'raffle_signups';

function clean(v) {
  return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, MAX_LEN) : '';
}
function validEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= MAX_LEN;
}

async function sb(path, options = {}) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/' + path, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  return res;
}

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('raffle-signup: SUPABASE_URL o SUPABASE_SERVICE_KEY mancanti');
    return res.status(503).json({ error: 'Registrazioni non attive' });
  }

  const body = req.body || {};
  const club = clean(body.club).toLowerCase();
  const first = clean(body.first);
  const last = clean(body.last);
  const email = clean(body.email).toLowerCase();
  const size = clean(body.size).toUpperCase();
  const lang = LANGS.includes(clean(body.lang).toUpperCase()) ? clean(body.lang).toUpperCase() : 'IT';
  const news = body.news === true;

  if (!CLUBS[club]) return res.status(400).json({ error: 'Club non valido' });
  if (!first || !last) return res.status(400).json({ error: 'Dati mancanti' });
  if (!validEmail(email)) return res.status(400).json({ error: 'Email non valida' });
  if (!SIZES.includes(size)) return res.status(400).json({ error: 'Taglia non valida' });

  try {
    /* Una partecipazione per indirizzo: chi riapre il modulo dopo aver
       cancellato i dati del telefono ritrova il suo numero invece di
       riceverne un secondo. */
    const found = await sb(
      `${TABLE}?select=seq,first_name,last_name,size&club=eq.${encodeURIComponent(club)}&email=eq.${encodeURIComponent(email)}&limit=1`
    );
    if (found.ok) {
      const rows = await found.json();
      if (Array.isArray(rows) && rows.length) {
        return res.status(200).json({ number: entryNumber(club, rows[0].seq), existing: true });
      }
    }

    const ins = await sb(TABLE, {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        club,
        first_name: first,
        last_name: last,
        email,
        size,
        lang,
        news_consent: news,
        /* il consenso al regolamento e' la condizione per essere qui:
           lo registriamo con la data, non come semplice vero/falso */
        rules_accepted_at: new Date().toISOString(),
      }),
    });

    if (ins.status === 409) {
      const again = await sb(
        `${TABLE}?select=seq&club=eq.${encodeURIComponent(club)}&email=eq.${encodeURIComponent(email)}&limit=1`
      );
      const rows = again.ok ? await again.json() : [];
      if (Array.isArray(rows) && rows.length) {
        return res.status(200).json({ number: entryNumber(club, rows[0].seq), existing: true });
      }
      return res.status(409).json({ error: 'Gia registrato' });
    }
    if (!ins.ok) {
      console.error('raffle-signup: insert fallito', ins.status, await ins.text());
      return res.status(502).json({ error: 'Registrazione non riuscita' });
    }

    const rows = await ins.json();
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row || typeof row.seq === 'undefined') {
      console.error('raffle-signup: risposta senza seq', JSON.stringify(rows).slice(0, 200));
      return res.status(502).json({ error: 'Registrazione non riuscita' });
    }
    return res.status(200).json({ number: entryNumber(club, row.seq) });
  } catch (err) {
    console.error('raffle-signup:', err && err.message);
    return res.status(502).json({ error: 'Registrazione non riuscita' });
  }
};

/* Il numero che il socio si ritrova sul telefono e che verra' letto ad alta
   voce la sera dell'estrazione: sigla del club e progressivo a tre cifre. */
function entryNumber(club, seq) {
  return CLUBS[club] + ' · ' + String(seq).padStart(3, '0');
}

module.exports.entryNumber = entryNumber;
