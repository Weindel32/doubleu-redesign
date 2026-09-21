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
  /* Temporaneo: serve a vedere arrivare in casella l'email al vincitore,
     con un finto iscritto. Da togliere appena fatta la prova. */
  prova: { sigla: 'PROVA', nome: 'Prova generale', chiusura: 0 },
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

/* ---- email a chi ha vinto -------------------------------------------------

   Parte da sola nel momento dell'estrazione: se il vincitore e' al club
   mentre il delegato annuncia il numero, il telefono gli vibra in quell'
   istante. E' il motivo per cui non la mandiamo a mano il giorno dopo.

   Le tre lingue nascono dalla stessa struttura, cosi' una modifica
   all'impaginazione non puo' applicarsi a una lingua sola. */

const COPY_VINCITORE = {
  IT: {
    subject: 'Hai vinto \u2014 Verlosung {club}',
    eyebrow: 'Verlosung \u00b7 {club}',
    h1: 'Hai vinto.',
    lead: 'Fra tutti i soci che si sono registrati al club, il numero estratto \u00e8 il tuo.',
    ticketLabel: 'Il tuo numero',
    prize: 'Il premio \u00e8 una <b>t-shirt DOUBLEU cucita a mano in Italia</b>, scelta fra le '
         + 'collezioni <b>CLAY</b> e <b>WFOX</b>, nella taglia che hai indicato quando ti sei '
         + 'registrato: <b>{taglia}</b>.',
    whereLabel: 'Dove te la mandiamo?',
    where: 'Rispondi a questa email con <b>nome, indirizzo, citt\u00e0 e paese</b>. Prepariamo il '
         + 'pacco e lo spediamo al tuo indirizzo <b>entro 8 giorni lavorativi</b>.',
    deadline: 'Hai <b>14 giorni</b> per rispondere: passati quelli, il regolamento prevede che il '
            + 'premio venga riassegnato a un altro partecipante.',
    close: 'Complimenti. Ti diamo il benvenuto in DOUBLEU.',
  },
  DE: {
    subject: 'Du hast gewonnen \u2014 Verlosung {club}',
    eyebrow: 'Verlosung \u00b7 {club}',
    h1: 'Du hast gewonnen.',
    lead: 'Unter allen Mitgliedern, die sich angemeldet haben, wurde deine Nummer gezogen.',
    ticketLabel: 'Deine Nummer',
    prize: 'Der Gewinn ist ein <b>in Italien von Hand gefertigtes DOUBLEU T-Shirt</b>, '
         + 'ausgew\u00e4hlt aus den Kollektionen <b>CLAY</b> und <b>WFOX</b>, in der '
         + 'Gr\u00f6\u00dfe, die du bei der Anmeldung angegeben hast: <b>{taglia}</b>.',
    whereLabel: 'Wohin sollen wir es schicken?',
    where: 'Antworte einfach auf diese E-Mail mit <b>Name, Adresse, Stadt und Land</b>. Wir packen '
         + 'den Gewinn und senden ihn <b>innerhalb von 8 Werktagen</b> an deine Adresse.',
    deadline: 'Du hast <b>14 Tage</b> Zeit zu antworten: danach wird der Gewinn gem\u00e4\u00df den '
            + 'Teilnahmebedingungen unter den \u00fcbrigen Teilnehmenden neu ausgelost.',
    close: 'Herzlichen Gl\u00fcckwunsch. Willkommen bei DOUBLEU.',
  },
  EN: {
    subject: 'You won \u2014 Prize draw {club}',
    eyebrow: 'Prize draw \u00b7 {club}',
    h1: 'You won.',
    lead: 'Among all the members who signed up at the club, yours is the number that was drawn.',
    ticketLabel: 'Your number',
    prize: 'The prize is a <b>DOUBLEU t-shirt, handmade in Italy</b>, chosen from the <b>CLAY</b> '
         + 'and <b>WFOX</b> collections, in the size you gave when you signed up: <b>{taglia}</b>.',
    whereLabel: 'Where should we send it?',
    where: 'Just reply to this email with your <b>name, address, city and country</b>. We pack it '
         + 'and ship it to your address <b>within 8 working days</b>.',
    deadline: 'You have <b>14 days</b> to reply: after that, the terms provide for the prize to be '
            + 'drawn again among the remaining entrants.',
    close: 'Congratulations. Welcome to DOUBLEU.',
  },
};

function paginaVincitore(t, numeroStr) {
  return `<div style="max-width:520px;margin:0 auto;background:#fffdf8;color:#1b2430">
 <div style="padding:34px 30px 30px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="font-weight:700;letter-spacing:.13em;font-size:17px;color:#102845;line-height:1">DOUBLEU</div>
  <div style="font-size:8px;letter-spacing:.34em;color:#102845;margin-top:5px">TENNIS CULTURE</div>
  <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#a04f31;font-weight:700;margin-top:30px">${t.eyebrow}</div>
  <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:40px;
             line-height:1.1;letter-spacing:-.02em;color:#102845;margin:10px 0 0">${t.h1}</h1>
  <p style="font-size:16px;line-height:1.6;color:#2b3542;margin:18px 0 0">${t.lead}</p>
  <div style="margin:26px 0 0;padding:22px;background:#f5efe5;border-radius:4px;text-align:center">
    <div style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#6f6d68">${t.ticketLabel}</div>
    <div style="font-family:Georgia,serif;font-size:38px;line-height:1;color:#102845;margin-top:10px">${numeroStr}</div>
  </div>
  <p style="font-size:16px;line-height:1.65;color:#2b3542;margin:26px 0 0">${t.prize}</p>
  <div style="height:1px;background:#10284522;margin:30px 0"></div>
  <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#a04f31;font-weight:700">${t.whereLabel}</div>
  <p style="font-size:16px;line-height:1.65;color:#2b3542;margin:12px 0 0">${t.where}</p>
  <p style="font-size:14.5px;line-height:1.6;color:#6f6d68;margin:18px 0 0">${t.deadline}</p>
  <p style="font-size:16px;line-height:1.65;color:#2b3542;margin:30px 0 0">${t.close}</p>
  <p style="font-size:16px;line-height:1.5;color:#102845;margin:16px 0 0">Marco Pagnotta<br>
    <span style="font-size:13px;color:#6f6d68">CEO &amp; Founder, DOUBLEU</span></p>
 </div>
 <div style="padding:20px 30px 26px;border-top:1px solid #10284522;font-size:11.5px;line-height:1.6;
      color:#6f6d68;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
   DOUBLEU SRLS \u2014 Via Generale Luigi Parisi 53, 84013 Cava de\u2019 Tirreni (SA)<br>
   info@doubleutennis.com \u00b7 doubleutennis.com
 </div>
</div>`;
}

async function avvisaVincitore(club, vincitore) {
  if (!RESEND_KEY || !vincitore.email) return false;
  const base = COPY_VINCITORE[vincitore.lang] || COPY_VINCITORE.DE;
  const numeroStr = numero(club.sigla, vincitore.seq);
  const riempi = v => v.split('{club}').join(esc(club.nome))
                       .split('{taglia}').join(esc(vincitore.size || ''));
  const t = {};
  for (const k of Object.keys(base)) t[k] = riempi(base[k]);
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [vincitore.email],
        /* Le risposte arrivano dove Marco legge: il vincitore rispondera' a
           questa mail con il suo indirizzo di spedizione. */
        reply_to: NOTIFY,
        subject: t.subject,
        html: paginaVincitore(t, numeroStr),
      }),
    });
    return r.ok;
  } catch (e) {
    /* L'estrazione resta valida: la mail interna porta comunque a Marco
       nome, email e taglia, e puo' scrivere a mano. */
    console.log(JSON.stringify({ event: 'mail_vincitore_fallita', errore: String(e) }));
    return false;
  }
}

async function avvisaDoubleu(club, estrazione, vincitore, totale, avvisato) {
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
    ['Email al vincitore', avvisato ? 'inviata' : 'NON inviata \u2014 scrivigli a mano'],
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
      Al club è stato annunciato soltanto il numero: il nome non è uscito da qui.<br>
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

  const avvisato = await avvisaVincitore(club, vincitore);
  await avvisaDoubleu(club, estrazione, vincitore, totale, avvisato);

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
