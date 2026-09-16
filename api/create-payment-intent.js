/* maxNetworkRetries non e' un dettaglio di robustezza: quando la risposta
   di Stripe si perde per strada, la richiesta e' gia' stata eseguita e il
   PaymentIntent esiste, ma noi rispondiamo errore e il cliente resta a
   guardare un checkout rotto. Con il riprova automatico lo SDK rimanda la
   stessa chiamata con la stessa chiave di idempotenza: Stripe restituisce
   il PaymentIntent gia' creato invece di crearne un altro. */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  maxNetworkRetries: 2,
  timeout: 8000,
});
const { priceCents, productName } = require('./_catalog');
const { shippingCents: shippingFor, zoneOf } = require('./_shipping');

const MAX_QTY_PER_LINE = 20;

/* Il sito, l'app installata dai soci e le anteprime di lavorazione. */
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

  const { items, promoCode, shipping } = req.body || {};

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Carrello vuoto' });
  }

  /* I prezzi vengono dal listino del server: quelli inviati dal browser
     sono solo un'indicazione per l'interfaccia e non vengono usati. */
  let subtotalCents = 0;
  const lines = [];
  for (const item of items) {
    const unitCents = item && item.id ? priceCents(item.id, item.color) : null;
    const qty = Math.floor(Number(item && item.qty));
    if (unitCents === null) {
      return res.status(400).json({ error: 'Prodotto non disponibile. Aggiorna il carrello.' });
    }
    if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
      return res.status(400).json({ error: 'Quantità non valida.' });
    }
    subtotalCents += unitCents * qty;
    lines.push(`${productName(item.id)} (${item.color || '-'}, ${item.size || '-'}) x${qty}`);
  }

  /* Spedizione per zona: costo e soglia di gratuita' dipendono dal paese
     di consegna, non piu' da una tariffa unica valida per tutto il mondo. */
  const country = (shipping && shipping.country) || 'IT';
  const shippingCents = shippingFor(country, subtotalCents, promoCode);

  const totalCents = subtotalCents + shippingCents;

  const itemsSummary = lines.join(' | ');

  /* Il checkout chiama questa API al caricamento della pagina, quando il
     cliente ha scelto solo il paese e non ha ancora scritto nome e via.
     Stripe pero' rifiuta un blocco shipping senza name e senza line1: se
     lo passassimo comunque, ogni ordine morirebbe qui con un 500. Lo
     alleghiamo quindi solo quando l'indirizzo e' davvero compilato. */
  const shipName = shipping && typeof shipping.name === 'string' ? shipping.name.trim() : '';
  const shipLine1 = shipping && typeof shipping.address === 'string' ? shipping.address.trim() : '';
  const shippingDetails = (shipName && shipLine1) ? {
    name: shipName,
    address: {
      line1:       shipLine1,
      city:        (shipping.city || '').trim() || undefined,
      postal_code: (shipping.postalCode || '').trim() || undefined,
      country,
    },
  } : null;

  /* Codice breve mostrato al cliente e scritto nel log: quando qualcuno
     scrive "non riesco a pagare", questo lo riporta alla riga giusta. */
  const ref = Math.random().toString(36).slice(2, 8);
  const startedAt = Date.now();

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        items: itemsSummary.slice(0, 500),
        shipping_cents: String(shippingCents),
        shipping_zone: zoneOf(country),
      },
      ...(shippingDetails && { shipping: shippingDetails }),
    });

    console.log(JSON.stringify({
      event: 'payment_intent_created',
      ref,
      ms: Date.now() - startedAt,
      paymentIntent: paymentIntent.id,
      amount: totalCents,
      zone: zoneOf(country),
    }));

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      subtotal: subtotalCents / 100,
      shippingCost: shippingCents / 100,
      total: totalCents / 100,
    });
  } catch (err) {
    /* Una riga sola non bastava: "Stripe error: <messaggio>" non dice se
       il parametro era sbagliato, se la chiave e' stata rifiutata o se la
       risposta non e' mai arrivata, e sono guasti diversi. Qui finisce
       tutto quello che serve a capirlo senza tirare a indovinare. */
    console.error(JSON.stringify({
      event: 'payment_intent_failed',
      ref,
      ms: Date.now() - startedAt,
      message:     err.message,
      type:        err.type,        // es. StripeInvalidRequestError, StripeConnectionError
      code:        err.code,
      param:       err.param,       // il parametro rifiutato, se e' quello
      statusCode:  err.statusCode,
      stripeReqId: err.requestId,   // apre la richiesta nei log di Stripe
      amount:      totalCents,
      zone:        zoneOf(country),
      shippingAttached: Boolean(shippingDetails),
    }));

    res.status(500).json({ error: 'Errore nel creare il pagamento. Riprova.', ref });
  }
};
