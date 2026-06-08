const CLUB_CATALOG = {
  mtc: {
    id: 'mtc',
    name: 'MTC',
    fullName: 'MTC Ausstellungspark',
    accentColor: '#1A3A5C',
    products: [
      {
        id: 'mtc-tshirt-uomo',
        clubId: 'mtc',
        name: 'T-Shirt Uomo',
        subtitle: 'MTC Ausstellungspark — Club Edition',
        tag: 'T-Shirt',
        basePrice: 0,
        description: 'T-shirt ufficiale MTC. Produzione artigianale Made in Italy. Disponibile in esclusiva per i soci del club.',
        fit: 'Regular Fit',
        material: '100% Cotone / Cotton',
        printSize: null,
        sizes: ['6', '8', '10', '12', '14', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Bianco', hex: '#FFFFFF', image: 'assets/images/club/mtc/tshirt-uomo.png', price: 0 },
        ],
        gridImage: 'assets/images/club/mtc/tshirt-uomo.png',
        images: ['assets/images/club/mtc/tshirt-uomo.png'],
      },
      {
        id: 'mtc-tshirt-donna',
        clubId: 'mtc',
        name: 'T-Shirt Donna',
        subtitle: 'MTC Ausstellungspark — Club Edition',
        tag: 'T-Shirt',
        basePrice: 0,
        description: 'T-shirt donna ufficiale MTC. Produzione artigianale Made in Italy. Disponibile in esclusiva per le socie del club.',
        fit: 'Slim Fit',
        material: '100% Cotone / Cotton',
        printSize: null,
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Bianco', hex: '#FFFFFF', image: 'assets/images/club/mtc/tshirt-donna-front.jpg', price: 0 },
        ],
        gridImage: 'assets/images/club/mtc/tshirt-donna-front.jpg',
        images: [
          'assets/images/club/mtc/tshirt-donna-front.jpg',
          'assets/images/club/mtc/tshirt-donna-back.png',
        ],
      },
      {
        id: 'mtc-cap',
        clubId: 'mtc',
        name: 'Cap',
        subtitle: 'MTC Ausstellungspark — Club Edition',
        tag: 'Accessori',
        basePrice: 0,
        description: 'Cap ufficiale MTC. Disponibile in due colori. Produzione artigianale Made in Italy. Disponibile in esclusiva per i soci del club.',
        fit: 'Taglia Unica',
        material: '100% Cotone / Cotton',
        printSize: null,
        sizes: ['Unica'],
        colors: [
          { name: 'Blu', hex: '#1A3A5C', image: 'assets/images/club/mtc/cap-blu.png', price: 0 },
          { name: 'White', hex: '#FFFFFF', image: 'assets/images/club/mtc/cap-white.png', price: 0 },
        ],
        gridImage: 'assets/images/club/mtc/cap-blu.png',
        images: [
          'assets/images/club/mtc/cap-blu.png',
          'assets/images/club/mtc/cap-white.png',
        ],
      },
      {
        id: 'mtc-slit-short',
        clubId: 'mtc',
        name: 'Slit Short',
        subtitle: 'MTC Ausstellungspark — Club Edition',
        tag: 'Short',
        basePrice: 0,
        description: 'Slit short ufficiale MTC. Produzione artigianale Made in Italy. Disponibile in esclusiva per i soci del club.',
        fit: 'Regular Fit',
        material: '100% Cotone / Cotton',
        printSize: null,
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Bianco', hex: '#FFFFFF', image: 'assets/images/club/mtc/slit-short.png', price: 0 },
        ],
        gridImage: 'assets/images/club/mtc/slit-short.png',
        images: ['assets/images/club/mtc/slit-short.png'],
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
