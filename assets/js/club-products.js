const CLUB_CATALOG = {
  mtc: {
    id: 'mtc',
    name: 'MTC',
    fullName: 'MTC Ausstellungspark',
    accentColor: '#1A3A5C',
    products: [
      {
        id: 'mtc-polo-001',
        clubId: 'mtc',
        name: 'Polo MTC',
        subtitle: 'MTC Club Edition — REF 001',
        tag: 'Club',
        basePrice: 0,
        description: 'Polo ufficiale MTC. Produzione artigianale Made in Italy. Disponibile in esclusiva per i soci del club.',
        fit: 'Regular Fit',
        material: '100% Cotone / Cotton',
        printSize: 'Ricamo MTC',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Colore Club', hex: '#1A3A5C', image: null, price: 0 },
        ],
        gridImage: null,
      },
      {
        id: 'mtc-tshirt-001',
        clubId: 'mtc',
        name: 'T-Shirt MTC',
        subtitle: 'MTC Club Edition — REF 002',
        tag: 'Club',
        basePrice: 0,
        description: 'T-shirt ufficiale MTC. 100% cotone Made in Italy. Disponibile in esclusiva per i soci.',
        fit: 'Regular Fit',
        material: '100% Cotone / Cotton',
        printSize: 'Stampa MTC',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Colore Club', hex: '#1A3A5C', image: null, price: 0 },
        ],
        gridImage: null,
      },
      {
        id: 'mtc-sweatshirt-001',
        clubId: 'mtc',
        name: 'Felpa MTC',
        subtitle: 'MTC Club Edition — REF 003',
        tag: 'Club',
        basePrice: 0,
        description: 'Felpa ufficiale MTC. Cotone premium Made in Italy. Disponibile in esclusiva per i soci del club.',
        fit: 'Regular Fit',
        material: '100% Cotone / Cotton',
        printSize: 'Ricamo MTC',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Colore Club', hex: '#1A3A5C', image: null, price: 0 },
        ],
        gridImage: null,
      },
    ],
  },

  allround: {
    id: 'allround',
    name: 'All Round',
    fullName: 'All Round Sport & Wellness',
    accentColor: '#1B3A2D',
    products: [
      {
        id: 'allround-polo-001',
        clubId: 'allround',
        name: 'Polo All Round',
        subtitle: 'All Round Club Edition — REF 001',
        tag: 'Club',
        basePrice: 0,
        description: 'Polo ufficiale All Round. Produzione artigianale Made in Italy. Disponibile in esclusiva per i soci del club.',
        fit: 'Regular Fit',
        material: '100% Cotone / Cotton',
        printSize: 'Ricamo All Round',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Colore Club', hex: '#1B3A2D', image: null, price: 0 },
        ],
        gridImage: null,
      },
      {
        id: 'allround-tshirt-001',
        clubId: 'allround',
        name: 'T-Shirt All Round',
        subtitle: 'All Round Club Edition — REF 002',
        tag: 'Club',
        basePrice: 0,
        description: 'T-shirt ufficiale All Round. 100% cotone Made in Italy. Disponibile in esclusiva per i soci.',
        fit: 'Regular Fit',
        material: '100% Cotone / Cotton',
        printSize: 'Stampa All Round',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Colore Club', hex: '#1B3A2D', image: null, price: 0 },
        ],
        gridImage: null,
      },
      {
        id: 'allround-sweatshirt-001',
        clubId: 'allround',
        name: 'Felpa All Round',
        subtitle: 'All Round Club Edition — REF 003',
        tag: 'Club',
        basePrice: 0,
        description: 'Felpa ufficiale All Round. Cotone premium Made in Italy. Disponibile in esclusiva per i soci del club.',
        fit: 'Regular Fit',
        material: '100% Cotone / Cotton',
        printSize: 'Ricamo All Round',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Colore Club', hex: '#1B3A2D', image: null, price: 0 },
        ],
        gridImage: null,
      },
    ],
  },
};

function getClubById(clubId) {
  return CLUB_CATALOG[clubId] || null;
}

function getClubProductById(productId) {
  for (const clubId in CLUB_CATALOG) {
    const p = CLUB_CATALOG[clubId].products.find(p => p.id === productId);
    if (p) return { product: p, club: CLUB_CATALOG[clubId] };
  }
  return null;
}
