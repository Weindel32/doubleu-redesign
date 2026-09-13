/* Spedizione per zona.
   La soglia di gratuita' segue il costo reale: in Italia 9,90 su una
   soglia di 89 e' sostenibile, in Europa una spedizione costa piu' del
   doppio e regalarla su un ordine da 39 euro azzera il margine. */

const ZONES = {
  IT:     { shipping: 990,  freeFrom: 8900 },
  EU:     { shipping: 1490, freeFrom: 9900 },
  WORLD:  { shipping: 2990, freeFrom: null },   // mai gratuita
};

/* Europa continentale servita con tariffa unica. */
const EU_COUNTRIES = new Set([
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE',
  'LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
  'CH','LI','MC','SM','VA','NO','GB',
]);

function zoneOf(country) {
  const c = String(country || 'IT').toUpperCase();
  if (c === 'IT') return 'IT';
  if (EU_COUNTRIES.has(c)) return 'EU';
  return 'WORLD';
}

/* Il codice promo vale solo in Italia: nato per il mercato interno, fuori
   regalava spedizioni che costano piu' del margine dell'ordine. */
function shippingCents(country, subtotalCents, promoValid) {
  const zone = ZONES[zoneOf(country)];
  if (zone.freeFrom !== null && subtotalCents >= zone.freeFrom) return 0;
  if (promoValid && zoneOf(country) === 'IT') return 0;
  return zone.shipping;
}

module.exports = { shippingCents, zoneOf, ZONES };
