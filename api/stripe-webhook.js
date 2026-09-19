/* Cosa succede dopo un pagamento riuscito.

   Prima di questo, un ordine esisteva solo dentro Stripe: nessun elenco,
   nessuno stato "da spedire", nessuna email se non la ricevuta di Stripe.
   Qui l'ordine viene registrato e vengono scritte due email: una a noi con
   tutto il necessario per preparare il pacco, una al cliente nella sua
   lingua.

   Stripe chiama questo indirizzo quando un pagamento va a buon fine, e lo
   richiama se non riceve risposta: per questo l'ordine e' identificato dal
   pagamento stesso, cosi' il secondo passaggio non fa partire un secondo
   invio. */

const Stripe = require('stripe');
const STRIPE_OPTS = { maxNetworkRetries: 2, timeout: 8000 };
const stripeLive = Stripe(process.env.STRIPE_SECRET_KEY, STRIPE_OPTS);
const stripeTest = process.env.STRIPE_SECRET_KEY_TEST
  ? Stripe(process.env.STRIPE_SECRET_KEY_TEST, STRIPE_OPTS)
  : null;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const TABLE = 'shop_orders';

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.ORDER_FROM_EMAIL || 'DOUBLEU <ordini@doubleutennis.com>';
const NOTIFY = process.env.ORDER_NOTIFY_EMAIL || 'info@doubleutennis.com';

/* ---------------------------------------------------------------- utilita' */

function money(cents) {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €';
}
function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
/* Numero d'ordine mostrato al cliente. L'identificativo di Stripe e' lungo
   e illeggibile: ne teniamo la coda, che basta a distinguere un ordine fra
   tutti gli altri. Lo stesso calcolo vive in shop.js, perche' la schermata
   di conferma la disegna il telefono e questa email il server: devono
   arrivare allo stesso numero senza parlarsi. */
function orderRef(id) {
  const tail = String(id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase();
  return tail ? 'DU-' + tail : '';
}

/* Il riepilogo arriva da Stripe come una riga sola:
   "Nome (Colore, Taglia) x2 | Altro (…) x1". Lo riapriamo per poterlo
   mostrare come elenco leggibile invece che come stringa tecnica. */
function parseItems(summary) {
  return String(summary || '')
    .split('|')
    .map(s => s.trim())
    .filter(Boolean)
    .map(row => {
      const m = row.match(/^(.*?)\s*\(([^)]*)\)\s*x(\d+)$/);
      if (!m) return { name: row, variant: '', qty: 1 };
      return { name: m[1].trim(), variant: m[2].trim().replace(/,\s*/g, ' · '), qty: Number(m[3]) };
    });
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

async function sendMail({ to, subject, html, replyTo }) {
  if (!RESEND_KEY) {
    console.error('stripe-webhook: RESEND_API_KEY mancante, email non inviata a', to);
    return false;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, html, ...(replyTo && { reply_to: replyTo }) }),
  });
  if (!res.ok) {
    console.error('stripe-webhook: invio fallito a', to, res.status, (await res.text()).slice(0, 300));
    return false;
  }
  return true;
}

/* ------------------------------------------------------------------ email */

const COPY = {
  IT: {
    subject: 'Il tuo ordine DOUBLEU',
    hello: 'Grazie per il tuo ordine.',
    lead: 'Lo prepariamo a mano nel nostro laboratorio e ti avvisiamo appena parte.',
    order: 'Ordine', items: 'Cosa hai ordinato', qty: 'Q.tà',
    shipTo: 'Spedizione a', subtotal: 'Totale capi', shippingL: 'Spedizione',
    free: 'Gratuita', total: 'Totale', questions: 'Per qualsiasi cosa, rispondi a questa email.',
  },
  EN: {
    subject: 'Your DOUBLEU order',
    hello: 'Thank you for your order.',
    lead: 'We make it by hand in our workshop and will let you know as soon as it ships.',
    order: 'Order', items: 'What you ordered', qty: 'Qty',
    shipTo: 'Shipping to', subtotal: 'Items total', shippingL: 'Shipping',
    free: 'Free', total: 'Total', questions: 'For anything at all, just reply to this email.',
  },
  DE: {
    subject: 'Deine DOUBLEU Bestellung',
    hello: 'Danke für deine Bestellung.',
    lead: 'Wir fertigen sie von Hand in unserer Werkstatt und melden uns, sobald sie unterwegs ist.',
    order: 'Bestellung', items: 'Deine Bestellung', qty: 'Menge',
    shipTo: 'Lieferung an', subtotal: 'Zwischensumme', shippingL: 'Versand',
    free: 'Kostenlos', total: 'Gesamt', questions: 'Bei Fragen antworte einfach auf diese E-Mail.',
  },
};

/* Le email si leggono in decine di programmi diversi, molti dei quali
   ignorano i fogli di stile: niente classi, niente flex, solo tabelle e
   stili scritti sull'elemento. */
const S = {
  wrap: 'margin:0;padding:24px 0;background:#f5efe5;font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1b2430;',
  card: 'max-width:560px;margin:0 auto;background:#fffdf8;border-radius:12px;overflow:hidden;',
  pad: 'padding:28px 28px 8px;',
  brand: 'font-size:20px;font-weight:700;letter-spacing:.13em;color:#102845;',
  brandSub: 'font-size:7px;letter-spacing:.34em;color:#102845;padding-top:4px;',
  h1: 'font-family:Georgia,serif;font-weight:400;font-size:27px;line-height:1.15;color:#102845;margin:22px 0 10px;',
  p: 'font-size:14px;line-height:1.6;color:#4a5765;margin:0 0 6px;',
  label: 'font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#8a8d90;padding-bottom:6px;',
  ref: 'font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#102845;word-break:break-all;',
  th: 'font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#8a8d90;text-align:left;padding:0 0 8px;border-bottom:1px solid #10284522;',
  td: 'font-size:14px;color:#1b2430;padding:12px 0;border-bottom:1px solid #10284514;vertical-align:top;',
  variant: 'display:block;font-size:12px;color:#6f6d68;padding-top:3px;',
  totRow: 'font-size:14px;color:#4a5765;padding:5px 0;',
  totBig: 'font-size:17px;font-weight:700;color:#102845;padding:12px 0 0;border-top:1px solid #10284522;',
  foot: 'padding:20px 28px 26px;font-size:12px;line-height:1.6;color:#8a8d90;',
};

function itemsTable(items, t) {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:18px 0 0;">
    <tr><th style="${S.th}">${esc(t.items)}</th><th style="${S.th}text-align:right;">${esc(t.qty)}</th></tr>
    ${items.map(i => `<tr>
      <td style="${S.td}"><strong>${esc(i.name)}</strong>${i.variant ? `<span style="${S.variant}">${esc(i.variant)}</span>` : ''}</td>
      <td style="${S.td}text-align:right;">${esc(i.qty)}</td>
    </tr>`).join('')}
  </table>`;
}

function totalsTable(o, t) {
  const sub = o.amount_cents - o.shipping_cents;
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:14px 0 4px;">
    <tr><td style="${S.totRow}">${esc(t.subtotal)}</td><td style="${S.totRow}text-align:right;">${money(sub)}</td></tr>
    <tr><td style="${S.totRow}">${esc(t.shippingL)}</td><td style="${S.totRow}text-align:right;">${o.shipping_cents ? money(o.shipping_cents) : esc(t.free)}</td></tr>
    <tr><td style="${S.totBig}">${esc(t.total)}</td><td style="${S.totBig}text-align:right;">${money(o.amount_cents)}</td></tr>
  </table>`;
}

function addressBlock(o, label) {
  const rows = [o.customer_name, o.ship_line1, o.ship_line2,
    [o.ship_postal, o.ship_city].filter(Boolean).join(' '), o.ship_country]
    .filter(Boolean);
  if (!rows.length) return '';
  return `<div style="${S.label}padding-top:20px;">${esc(label)}</div>
    <div style="font-size:14px;line-height:1.6;color:#1b2430;">${rows.map(esc).join('<br>')}</div>`;
}

function customerEmail(o, items) {
  const t = COPY[o.lang] || COPY.IT;
  return `<div style="${S.wrap}"><div style="${S.card}"><div style="${S.pad}">
    <div style="${S.brand}">DOUBLEU</div><div style="${S.brandSub}">TENNIS CULTURE</div>
    <h1 style="${S.h1}">${esc(t.hello)}</h1>
    <p style="${S.p}">${esc(t.lead)}</p>
    <div style="${S.label}padding-top:18px;">${esc(t.order)}</div>
    <div style="${S.ref}">${esc(orderRef(o.payment_intent))}</div>
    ${itemsTable(items, t)}
    ${totalsTable(o, t)}
    ${addressBlock(o, t.shipTo)}
  </div><div style="${S.foot}">
    ${esc(t.questions)}<br><br>
    DOUBLEU SRLS · Via Generale Luigi Parisi 53, 84013 Cava de' Tirreni (SA) · doubleutennis.com
  </div></div></div>`;
}

/* La nostra copia non deve essere bella: deve far preparare il pacco senza
   aprire nient'altro. Quindi indirizzo e capi in chiaro, subito. */
function internalEmail(o, items) {
  /* La nostra copia usa le etichette di chi prepara il pacco, non quelle
     rivolte al cliente. */
  const t = { ...COPY.IT, items: 'Articoli', subtotal: 'Capi', shippingL: 'Spedizione' };
  const rows = [o.customer_name, o.ship_line1, o.ship_line2,
    [o.ship_postal, o.ship_city].filter(Boolean).join(' '), o.ship_country]
    .filter(Boolean);
  return `<div style="${S.wrap}"><div style="${S.card}"><div style="${S.pad}">
    <div style="${S.label}">Nuovo ordine · ${esc(o.shipping_zone || '')}</div>
    <h1 style="${S.h1}">${money(o.amount_cents)} — ${esc(o.customer_name || o.email || '')}</h1>
    ${itemsTable(items, t)}
    ${totalsTable(o, t)}
    <div style="${S.label}padding-top:20px;">Spedire a</div>
    <div style="font-size:15px;line-height:1.7;color:#1b2430;">${rows.map(esc).join('<br>')}</div>
    <div style="${S.label}padding-top:18px;">Contatti</div>
    <div style="font-size:14px;line-height:1.6;">${esc(o.email || '—')}${o.phone ? '<br>' + esc(o.phone) : ''}</div>
    <div style="${S.label}padding-top:18px;">Numero ordine</div>
    <div style="${S.ref}">${esc(orderRef(o.payment_intent))}</div>
    <div style="${S.label}padding-top:18px;">Riferimento Stripe</div>
    <div style="${S.ref}">${esc(o.payment_intent)}</div>
  </div><div style="${S.foot}">
    Lingua del cliente: ${esc(o.lang)} · La conferma gli è già stata inviata.
  </div></div></div>`;
}

/* ---------------------------------------------------------------- handler */

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('stripe-webhook: variabili Supabase mancanti');
    return res.status(200).json({ received: true });
  }

  const event = req.body || {};
  const id = event && event.data && event.data.object && event.data.object.id;
  if (event.type !== 'payment_intent.succeeded' || !id) {
    return res.status(200).json({ received: true });
  }

  try {
    /* Non ci fidiamo di quello che arriva nella chiamata: il pagamento lo
       rileggiamo da Stripe, che e' l'unica fonte che conta. Un evento
       inventato o riferito a un pagamento non riuscito si ferma qui. */
    const client = (event.livemode === false && stripeTest) ? stripeTest : stripeLive;
    const pi = await client.paymentIntents.retrieve(id, { expand: ['latest_charge'] });
    if (!pi || pi.status !== 'succeeded') {
      console.log(JSON.stringify({ event: 'webhook_ignored', id, status: pi && pi.status }));
      return res.status(200).json({ received: true });
    }

    const md = pi.metadata || {};
    const charge = pi.latest_charge && typeof pi.latest_charge === 'object' ? pi.latest_charge : null;
    const billing = (charge && charge.billing_details) || {};
    const ship = pi.shipping || {};
    const addr = ship.address || billing.address || {};

    const order = {
      payment_intent: pi.id,
      amount_cents: pi.amount,
      currency: pi.currency || 'eur',
      email: pi.receipt_email || billing.email || null,
      customer_name: ship.name || billing.name || null,
      phone: ship.phone || billing.phone || null,
      ship_line1: addr.line1 || null,
      ship_line2: addr.line2 || null,
      ship_postal: addr.postal_code || null,
      ship_city: addr.city || null,
      ship_country: addr.country || null,
      items: md.items || null,
      shipping_cents: Number(md.shipping_cents || 0) || 0,
      shipping_zone: md.shipping_zone || null,
      lang: ['IT', 'EN', 'DE'].includes(md.lang) ? md.lang : 'IT',
      status: 'paid',
    };

    /* L'inserimento e' anche il lucchetto: se l'ordine c'e' gia' perche'
       Stripe ha ripetuto la chiamata, qui fallisce e le email non partono
       una seconda volta. */
    const ins = await sb(TABLE, {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(order),
    });
    if (ins.status === 409) {
      console.log(JSON.stringify({ event: 'webhook_duplicato', id: pi.id }));
      return res.status(200).json({ received: true, duplicate: true });
    }
    if (!ins.ok) {
      console.error('stripe-webhook: ordine non registrato', ins.status, (await ins.text()).slice(0, 300));
      return res.status(500).json({ error: 'not stored' });
    }

    const items = parseItems(order.items);
    const t = COPY[order.lang] || COPY.IT;

    const sent = [];
    sent.push(await sendMail({
      to: NOTIFY,
      subject: `Nuovo ordine ${money(order.amount_cents)} — ${order.customer_name || order.email || pi.id}`,
      html: internalEmail(order, items),
      replyTo: order.email || undefined,
    }));
    if (order.email) {
      sent.push(await sendMail({
        to: order.email,
        subject: t.subject,
        html: customerEmail(order, items),
        replyTo: NOTIFY,
      }));
    }

    if (sent.every(Boolean)) {
      await sb(`${TABLE}?payment_intent=eq.${encodeURIComponent(pi.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ emails_sent_at: new Date().toISOString() }),
      });
    }

    console.log(JSON.stringify({
      event: 'ordine_registrato', id: pi.id, amount: pi.amount,
      zone: order.shipping_zone, emails: sent,
    }));
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('stripe-webhook:', err && err.message);
    /* 500 fa riprovare Stripe piu' tardi: se il guasto e' passeggero
       l'ordine viene registrato al secondo tentativo invece di perdersi. */
    return res.status(500).json({ error: 'webhook error' });
  }
};

module.exports.parseItems = parseItems;
module.exports.money = money;
