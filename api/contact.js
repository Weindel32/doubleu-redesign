/* Richieste dal modulo contatti del sito.

   Prima si salva, poi si scrive: la richiesta finisce nel database anche se
   Resend quel giorno non risponde, e una mail persa non e' piu' un lead
   perso. Poi due mail: una a DOUBLEU con tutti i campi, una al cliente che
   conferma la ricezione nella sua lingua.

   Come in raffle-signup, del browser non ci si fida: lunghezze, email,
   tipo di richiesta e lingua vengono confrontati con valori nostri. */

const crypto = require('crypto');

const ALLOWED_ORIGINS = [
  'https://www.doubleutennis.com',
  'https://doubleutennis.com',
];
function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  return /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin);
}

const TYPES = ['club', 'capsule', 'info', 'altro'];
const LANGS = ['IT', 'EN', 'DE'];
const MAX_SHORT = 120;
const MAX_MESSAGE = 4000;

/* Oltre tre invii in dieci minuti dallo stesso indirizzo non e' un cliente
   che ha sbagliato a scrivere: e' un bot. */
const RATE_WINDOW_MIN = 10;
const RATE_MAX = 3;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const TABLE = 'contact_requests';

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = 'DOUBLEU <info@doubleutennis.com>';
/* Gli avvisi interni vanno dove Marco legge davvero (CONTACT_NOTIFY_EMAIL,
   impostata su Vercel); il cliente invece vede e risponde sempre a info@,
   l'indirizzo del marchio. */
const NOTIFY = process.env.CONTACT_NOTIFY_EMAIL || 'info@doubleutennis.com';
const REPLY_TO = 'info@doubleutennis.com';

function clean(v, max) {
  return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}
/* Il messaggio tiene gli a capo: chi scrive un brief lo scrive a paragrafi. */
function cleanMessage(v) {
  return typeof v === 'string'
    ? v.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, MAX_MESSAGE)
    : '';
}
function validEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= MAX_SHORT;
}
function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function hashIp(req) {
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || (req.socket && req.socket.remoteAddress) || '';
  if (!ip) return null;
  return crypto.createHash('sha256').update('doubleu-contact:' + ip).digest('hex').slice(0, 32);
}

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

async function sendMail(payload) {
  if (!RESEND_KEY) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, ...payload }),
    });
    if (!r.ok) console.log(JSON.stringify({ event: 'contact_mail_fallita', status: r.status, body: (await r.text()).slice(0, 200) }));
    return r.ok;
  } catch (e) {
    console.log(JSON.stringify({ event: 'contact_mail_fallita', errore: String(e) }));
    return false;
  }
}

/* ---- testi ---------------------------------------------------------------

   Le tre lingue nascono dalla stessa struttura, come la mail al vincitore
   della raffle: una modifica all'impaginazione vale per tutte. */

const TYPE_LABEL = {
  IT: { club: 'Collezione Club', capsule: 'Capsule WFOX / SURFACES', info: 'Informazioni generali', altro: 'Altro' },
  EN: { club: 'Club Collection', capsule: 'WFOX / SURFACES Capsule', info: 'General information', altro: 'Other' },
  DE: { club: 'Club-Kollektion', capsule: 'WFOX / SURFACES Capsule', info: 'Allgemeine Informationen', altro: 'Sonstiges' },
};

const COPY_CLIENTE = {
  IT: {
    subject: 'Abbiamo ricevuto la tua richiesta · DOUBLEU',
    eyebrow: 'Richiesta ricevuta',
    h1: 'Grazie, {nome}.',
    lead: 'La tua richiesta è arrivata ed è già nelle mani del nostro team. '
        + 'Ti rispondiamo personalmente <b>entro 24 ore lavorative</b>.',
    recapLabel: 'Il tuo messaggio',
    typeLabel: 'Tipo di richiesta',
    clubLabel: 'Club',
    next: 'Se vuoi aggiungere dettagli, loghi o riferimenti, rispondi pure a questa email: '
        + 'arriva direttamente a noi.',
    close: 'A presto,',
    signature: 'Il team DOUBLEU',
  },
  EN: {
    subject: 'We have received your request · DOUBLEU',
    eyebrow: 'Request received',
    h1: 'Thank you, {nome}.',
    lead: 'Your request has reached us and is already with our team. '
        + 'We will reply personally <b>within 24 working hours</b>.',
    recapLabel: 'Your message',
    typeLabel: 'Type of enquiry',
    clubLabel: 'Club',
    next: 'If you would like to add details, logos or references, just reply to this email: '
        + 'it comes straight to us.',
    close: 'Speak soon,',
    signature: 'The DOUBLEU team',
  },
  DE: {
    subject: 'Wir haben deine Anfrage erhalten · DOUBLEU',
    eyebrow: 'Anfrage erhalten',
    h1: 'Danke, {nome}.',
    lead: 'Deine Anfrage ist bei uns angekommen und liegt bereits bei unserem Team. '
        + 'Wir antworten dir persönlich <b>innerhalb von 24 Arbeitsstunden</b>.',
    recapLabel: 'Deine Nachricht',
    typeLabel: 'Art der Anfrage',
    clubLabel: 'Club',
    next: 'Möchtest du Details, Logos oder Referenzen ergänzen? Antworte einfach auf '
        + 'diese E-Mail: Sie kommt direkt bei uns an.',
    close: 'Bis bald,',
    signature: 'Dein DOUBLEU Team',
  },
};

function paginaCliente(t, r) {
  const righe = [
    r.request_type ? [t.typeLabel, TYPE_LABEL[r.lang][r.request_type]] : null,
    r.club ? [t.clubLabel, r.club] : null,
  ].filter(Boolean).map(([k, v]) =>
    `<tr><td style="padding:4px 14px 4px 0;font-size:12px;letter-spacing:.06em;color:#6f6d68;white-space:nowrap;vertical-align:top">${esc(k)}</td>
         <td style="padding:4px 0;font-size:14.5px;color:#1b2430">${esc(v)}</td></tr>`).join('');
  return `<div style="max-width:520px;margin:0 auto;background:#fffdf8;color:#1b2430">
 <div style="padding:34px 30px 30px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="font-weight:700;letter-spacing:.13em;font-size:17px;color:#102845;line-height:1">DOUBLEU</div>
  <div style="font-size:8px;letter-spacing:.34em;color:#102845;margin-top:5px">TENNIS CULTURE</div>
  <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#a04f31;font-weight:700;margin-top:30px">${t.eyebrow}</div>
  <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:36px;
             line-height:1.1;letter-spacing:-.02em;color:#102845;margin:10px 0 0">${t.h1}</h1>
  <p style="font-size:16px;line-height:1.6;color:#2b3542;margin:18px 0 0">${t.lead}</p>
  <div style="margin:26px 0 0;padding:20px 22px;background:#f5efe5;border-radius:4px">
    <div style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#6f6d68">${t.recapLabel}</div>
    ${righe ? `<table style="border-collapse:collapse;margin-top:12px">${righe}</table>` : ''}
    <p style="font-size:14.5px;line-height:1.6;color:#2b3542;margin:12px 0 0;white-space:pre-line">${esc(r.message)}</p>
  </div>
  <p style="font-size:15px;line-height:1.65;color:#2b3542;margin:26px 0 0">${t.next}</p>
  <p style="font-size:16px;line-height:1.65;color:#2b3542;margin:30px 0 0">${t.close}</p>
  <p style="font-size:16px;line-height:1.5;color:#102845;margin:6px 0 0">${t.signature}</p>
 </div>
 <div style="padding:20px 30px 26px;border-top:1px solid #10284522;font-size:11.5px;line-height:1.6;
      color:#6f6d68;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
   DOUBLEU SRLS — Via Generale Luigi Parisi 53, 84013 Cava de’ Tirreni (SA)<br>
   info@doubleutennis.com · doubleutennis.com
 </div>
</div>`;
}

function paginaDoubleu(r, salvata) {
  const quando = new Date().toLocaleString('it-IT', {
    timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'short',
  });
  const campi = [
    ['Nome', r.name],
    ['Email', r.email],
    ['Club', r.club || '—'],
    ['Tipo', r.request_type ? TYPE_LABEL.IT[r.request_type] : '—'],
    ['Lingua', r.lang],
    ['Ricevuta', quando],
  ].map(([k, v]) =>
    `<tr><td style="padding:6px 16px 6px 0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6f6d68;vertical-align:top">${k}</td>
         <td style="padding:6px 0;font-size:15px;color:#1b2430">${esc(v)}</td></tr>`).join('');
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
     max-width:560px;margin:0 auto;padding:28px 24px;background:#fffdf8;color:#1b2430">
  <div style="font-weight:700;letter-spacing:.13em;font-size:17px;color:#102845">DOUBLEU</div>
  <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#a04f31;font-weight:700;margin-top:22px">Nuova richiesta dal sito</div>
  <h1 style="font-family:Georgia,serif;font-weight:400;font-size:26px;color:#102845;margin:8px 0 18px">${esc(r.name)}${r.club ? ' · ' + esc(r.club) : ''}</h1>
  <table style="border-collapse:collapse">${campi}</table>
  <div style="margin:22px 0 0;padding:18px 20px;background:#f5efe5;border-radius:4px;font-size:15px;line-height:1.6;white-space:pre-line">${esc(r.message)}</div>
  <p style="font-size:13px;line-height:1.6;color:#6f6d68;margin:20px 0 0">
    Rispondi a questa email per scrivere direttamente al cliente.
    Al cliente &egrave; gi&agrave; partita la conferma automatica di ricezione.
    ${salvata ? '' : '<br><b style="color:#a04f31">Attenzione: la richiesta NON &egrave; stata salvata nel database. Questa email &egrave; l&rsquo;unica copia.</b>'}
  </p>
</div>`;
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
  if (origin && !isAllowedOrigin(origin)) return res.status(403).json({ error: 'Origin non ammessa' });

  if (!RESEND_KEY && !(SUPABASE_URL && SUPABASE_KEY)) {
    console.error('contact: Resend e Supabase non configurati');
    return res.status(503).json({ error: 'Modulo non attivo' });
  }

  const body = req.body || {};

  /* Campo trappola: invisibile agli umani, i bot lo spuntano. Rispondiamo
     'ok' cosi' il bot non impara niente. */
  if (body.botcheck) return res.status(200).json({ ok: true });

  const lang = LANGS.includes(clean(body.lang, 2).toUpperCase()) ? clean(body.lang, 2).toUpperCase() : 'IT';
  const r = {
    name: clean(body.nome, MAX_SHORT),
    email: clean(body.email, MAX_SHORT).toLowerCase(),
    club: clean(body.club, MAX_SHORT) || null,
    request_type: TYPES.includes(clean(body.tipo, 20)) ? clean(body.tipo, 20) : null,
    message: cleanMessage(body.messaggio),
    lang,
  };
  if (!r.name || !r.message) return res.status(400).json({ error: 'Dati mancanti' });
  if (!validEmail(r.email)) return res.status(400).json({ error: 'Email non valida' });

  const ipHash = hashIp(req);
  const dbReady = Boolean(SUPABASE_URL && SUPABASE_KEY);
  let saved = null;

  try {
    if (dbReady && ipHash) {
      const since = new Date(Date.now() - RATE_WINDOW_MIN * 60000).toISOString();
      const c = await sb(
        `${TABLE}?select=id&ip_hash=eq.${ipHash}&created_at=gte.${encodeURIComponent(since)}`,
        { headers: { Prefer: 'count=exact', Range: '0-0' } });
      const recenti = Number((c.headers.get('content-range') || '').split('/')[1] || 0);
      if (recenti >= RATE_MAX) return res.status(429).json({ error: 'Troppi invii, riprova più tardi' });
    }

    if (dbReady) {
      const ins = await sb(TABLE, {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ ...r, ip_hash: ipHash }),
      });
      if (ins.ok) {
        const rows = await ins.json();
        saved = Array.isArray(rows) ? rows[0] : rows;
      } else {
        console.error('contact: insert fallito', ins.status, (await ins.text()).slice(0, 200));
      }
    }

    const notified = await sendMail({
      to: [NOTIFY],
      reply_to: r.email,
      subject: `Nuova richiesta — ${r.name}${r.club ? ' (' + r.club + ')' : ''}`,
      html: paginaDoubleu(r, Boolean(saved)),
    });

    /* Senza database e senza mail interna la richiesta non e' arrivata da
       nessuna parte: meglio dirlo al cliente che confermargli il falso. */
    if (!saved && !notified) return res.status(502).json({ error: 'Invio non riuscito' });

    const base = COPY_CLIENTE[lang];
    const t = {};
    for (const k of Object.keys(base)) t[k] = base[k].split('{nome}').join(esc(r.name.split(' ')[0]));
    const autoReply = await sendMail({
      to: [r.email],
      reply_to: REPLY_TO,
      subject: t.subject,
      html: paginaCliente(t, r),
    });

    if (saved && saved.id != null) {
      await sb(`${TABLE}?id=eq.${saved.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ notified, auto_reply_sent: autoReply }),
      }).catch(() => {});
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('contact: errore', String(err));
    return res.status(500).json({ error: 'Errore interno' });
  }
};
