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
        subtitle: 'DOUBLEU für MTC Ausstellungspark — TeamShirt 25',
        tag: 'T-Shirt',
        basePrice: 39,
        description: 'T-shirt tecnica della linea Premium, sviluppata per comfort, traspirabilità e resistenza. Un capo versatile che unisce performance e stile — perfetto in campo e nel tempo libero.',
        fit: 'Regular Fit, comodo ed ergonomico',
        material: '87% Poliammide – 13% Elastan',
        printSize: null,
        sizes: ['6', '8', '10', '12', '14', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Navy/Bianco', hex: '#1A3A5C', image: 'assets/images/club/mtc/tshirt-uomo.png', price: 0 },
        ],
        gridImage: 'assets/images/club/mtc/tshirt-uomo.png',
        images: ['assets/images/club/mtc/tshirt-uomo.png'],
      },
      {
        id: 'mtc-tshirt-donna',
        clubId: 'mtc',
        name: 'T-Shirt Donna',
        subtitle: 'DOUBLEU für MTC Ausstellungspark — TeamShirt 25',
        tag: 'T-Shirt',
        basePrice: 42,
        description: 'T-shirt tecnica donna della linea Premium, sviluppata per comfort, traspirabilità e resistenza. Un capo versatile che unisce performance e stile — perfetto in campo e nel tempo libero.',
        fit: 'Regular Fit, comodo ed ergonomico',
        material: '87% Poliammide – 13% Elastan',
        printSize: null,
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Bianco/Navy', hex: '#FFFFFF', image: 'assets/images/club/mtc/tshirt-donna-front.jpg', price: 0 },
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
        basePrice: 30,
        description: 'Cappellino idrorepellente in nylon riciclato per il massimo comfort nelle attività outdoor. I fori tagliati al laser lo rendono un accessorio sportivo e altamente traspirante — il perfetto statement piece.',
        fit: 'Taglia Unica',
        material: '100% Nylon riciclato / Recycled Nylon',
        printSize: null,
        sizes: ['Unica'],
        colors: [
          { name: 'Blu Navy', hex: '#1A3A5C', image: 'assets/images/club/mtc/cap-blu.png', price: 0 },
          { name: 'Bianco', hex: '#FFFFFF', image: 'assets/images/club/mtc/cap-white.png', price: 0 },
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
        subtitle: 'DOUBLEU — Premium Line',
        tag: 'Short',
        basePrice: 41,
        description: 'Short tecnico della linea Premium, sviluppato per leggerezza, traspirabilità e piena libertà di movimento. Design funzionale con cintura elastica, tasche laterali e Slit laterali per maggiore mobilità.',
        fit: 'Regular Fit con taglio ergonomico',
        material: '85% Poliammide – 15% Elastan',
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
