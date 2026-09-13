const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
      ...(shipping && {
        shipping: {
          name: shipping.name,
          address: {
            line1:       shipping.address,
            city:        shipping.city,
            postal_code: shipping.postalCode,
            country:     shipping.country || 'IT',
          },
        },
      }),
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      subtotal: subtotalCents / 100,
      shippingCost: shippingCents / 100,
      total: totalCents / 100,
    });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Errore nel creare il pagamento. Riprova.' });
  }
};
