const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const SHIPPING_COST_CENTS = 990; // 9,90 €
const FREE_SHIPPING_THRESHOLD_CENTS = 8900; // 89,00 €
const PROMO_CODE = 'DELY26';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { items, promoCode, shipping } = req.body || {};

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Carrello vuoto' });
  }

  // Calculate subtotal in cents
  const subtotalCents = items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.qty, 0);

  // Free shipping if promo applied and over threshold
  const promoValid = promoCode && promoCode.toUpperCase() === PROMO_CODE;
  const shippingCents = (promoValid && subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) ? 0 : SHIPPING_COST_CENTS;

  const totalCents = subtotalCents + shippingCents;

  const itemsSummary = items.map(i => `${i.name} (${i.color}, ${i.size}) x${i.qty}`).join(' | ');

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        items: itemsSummary.slice(0, 500),
        promo_code: promoValid ? PROMO_CODE : '',
        shipping_cents: String(shippingCents),
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
