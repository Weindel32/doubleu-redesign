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

/* Codici promozionali per la spedizione.
   Oggi nessuno e' attivo: la soglia di gratuita' scatta da sola, e DELY26
   era un codice pubblico e senza scadenza che regalava spedizioni anche
   dove costano piu' del margine.

   Per attivarne uno basta aggiungerlo qui, delimitato a zone e periodo:
     'MTC27': { zones: ['IT','EU'], until: '2026-10-31' }
   Cosi' una promozione italiana non regala piu' spedizioni in Germania. */
const PROMO_CODES = {};

function promoAllows(code, zone) {
  if (!code) return false;
  const rule = PROMO_CODES[String(code).toUpperCase()];
  if (!rule) return false;
  if (rule.until && new Date() > new Date(rule.until + 'T23:59:59Z')) return false;
  return !rule.zones || rule.zones.includes(zone);
}

function shippingCents(country, subtotalCents, promoCode) {
  const zone = zoneOf(country);
  const rules = ZONES[zone];
  if (rules.freeFrom !== null && subtotalCents >= rules.freeFrom) return 0;
  if (promoAllows(promoCode, zone)) return 0;
  return rules.shipping;
}

module.exports = { shippingCents, zoneOf, ZONES, PROMO_CODES };
