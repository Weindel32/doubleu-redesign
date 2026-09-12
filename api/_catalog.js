/* Listino di riferimento del backend.
   I prezzi vengono letti dagli stessi file che alimentano il sito, cosi'
   non esiste un secondo listino da tenere allineato a mano. */

const { WFOX_PRODUCTS, SURFACES_PRODUCTS, GRASS_PRODUCTS } = require('../assets/js/products.js');
const { CLUB_CATALOG } = require('../assets/js/club-products.js');

const catalog = new Map();

function register(product) {
  if (!product || !product.id) return;
  const colors = new Map();
  (product.colors || []).forEach(c => {
    if (c && c.name && typeof c.price === 'number') colors.set(c.name, c.price);
  });
  catalog.set(product.id, {
    name: product.name || product.id,
    basePrice: typeof product.basePrice === 'number' ? product.basePrice : null,
    colors,
  });
}

[...WFOX_PRODUCTS, ...SURFACES_PRODUCTS, ...GRASS_PRODUCTS].forEach(register);
Object.values(CLUB_CATALOG).forEach(club => (club.products || []).forEach(register));

/* Prezzo ufficiale di una riga di carrello, in centesimi.
   Restituisce null se il prodotto non esiste o non e' acquistabile. */
function priceCents(id, color) {
  const entry = catalog.get(id);
  if (!entry) return null;
  const price = entry.colors.has(color) ? entry.colors.get(color) : entry.basePrice;
  if (typeof price !== 'number' || !(price > 0)) return null;
  return Math.round(price * 100);
}

function productName(id) {
  const entry = catalog.get(id);
  return entry ? entry.name : id;
}

module.exports = { priceCents, productName, size: catalog.size };
