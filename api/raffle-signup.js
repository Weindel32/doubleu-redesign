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

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = 'DOUBLEU <info@doubleutennis.com>';
const NOTIFY = 'info@doubleutennis.com';

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

/* Un avviso solo, alla primissima registrazione di un club.

   Non serve a contare: il numero si guarda in ogni momento dalla pagina
   dell'estrazione. Serve a sapere che la catena regge davvero — QR, app,
   server, database — il giorno in cui il cartello viene esposto. Se questa
   mail non arriva entro la mattina, qualcosa non funziona e c'e' ancora
   tempo per accorgersene.

   Dopo la prima, silenzio: con sessanta soci un avviso per ciascuno
   intaserebbe la casella proprio nei due giorni in cui serve leggere altro. */
async function avvisaPrimaRegistrazione(club, row) {
  if (!RESEND_KEY) return;
  try {
    /* Prima di annunciare 'la prima', contiamo davvero: la riga appena
       inserita deve essere l'unica del club. */
    const r = await sb(
      `${TABLE}?select=seq&club=eq.${encodeURIComponent(club)}`,
      { headers: { Prefer: 'count=exact', Range: '0-0' } });
    const totale = Number((r.headers.get('content-range') || '').split('/')[1] || 0);
    if (totale !== 1) return;

    const quando = new Date().toLocaleString('it-IT', {
      timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'short',
    });
    const numero = entryNumber(club, row.seq);
    const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
       max-width:520px;margin:0 auto;padding:28px 24px;background:#fffdf8;color:#1b2430">
      <div style="font-weight:700;letter-spacing:.13em;font-size:17px;color:#102845">DOUBLEU</div>
      <div style="font-size:8px;letter-spacing:.34em;color:#102845;margin-top:4px">TENNIS CULTURE</div>
      <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#a04f31;
         font-weight:700;margin-top:24px">Verlosung ${esc(CLUBS[club] || club)}</div>
      <h1 style="font-family:Georgia,serif;font-weight:400;font-size:26px;color:#102845;margin:8px 0 0">
        La prima registrazione &egrave; arrivata</h1>
      <p style="font-size:15px;line-height:1.6;color:#2b3542;margin:16px 0 0">
        Il primo socio si &egrave; registrato alle ${esc(quando)} e ha ricevuto il numero
        <b>${esc(numero)}</b>. Il QR, l&rsquo;app e il database funzionano.
      </p>
      <p style="font-size:14px;line-height:1.6;color:#6f6d68;margin:18px 0 0">
        Da qui in avanti nessun altro avviso: il numero di partecipanti lo vedi
        in ogni momento dalla pagina dell&rsquo;estrazione.
      </p>
    </div>`;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM, to: [NOTIFY], reply_to: NOTIFY,
        subject: `Verlosung ${esc(CLUBS[club] || club)}: prima registrazione`,
        html,
      }),
    });
  } catch (e) {
    /* La registrazione del socio e' gia' avvenuta: un avviso mancato non
       deve farla fallire. */
    console.log(JSON.stringify({ event: 'avviso_prima_registrazione_fallito', errore: String(e) }));
  }
}

function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
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
    await avvisaPrimaRegistrazione(club, row);
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
