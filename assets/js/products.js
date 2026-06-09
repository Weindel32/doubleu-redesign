const WFOX_PRODUCTS = [
  {
    id: 'wfox-crewneck',
    name: 'WFOX Crewneck',
    subtitle: 'WFOX by DOUBLEU – Urban Fox Edition',
    tag: 'Bestseller',
    basePrice: 99,
    description: 'Eleganza senza tempo e spirito libero si incontrano in questa esclusiva t-shirt della collezione WFOX by DOUBLEU.<br><br>Realizzata in 100% cotone <strong>premium</strong> Made in Italy, questa maglietta unisce comfort e stile in un capo che non passa inosservato. La grafica raffigura la nostra iconica volpe WFOX in tenuta da tennis old-school: un omaggio raffinato alle radici di questo sport, pensato per chi ama distinguersi con naturalezza.<br><br>Disponibile in blu navy e grigio mélange, è perfetta dentro e fuori dal campo, da abbinare a un pantalone sportivo o a un look più urbano.',
    fit: 'Regular Fit',
    material: '100% Cotone / Cotton',
    printSize: '23/25 cm',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Blu Navy', hex: '#0D1B2A', image: 'wfox/img/crew.jpg',      price: 99 },
      { name: 'Grigio',   hex: '#9E9E9E', image: 'wfox/img/crew-grey.png', price: 99 },
    ],
    gridImage: 'wfox/img/crew.jpg',
  },
  {
    id: 'wfox-tee-white',
    name: 'WFOX Tee — White',
    subtitle: 'WFOX by DOUBLEU — Limited',
    tag: 'Limited',
    basePrice: 59,
    description: 'La tee limited edition della capsule WFOX. Bianco puro, costruzione premium, 100% cotone Made in Italy. Produzione limitata, zero riassortimento. Il pezzo che scompare prima di tutti gli altri.',
    fit: 'Regular Fit',
    material: '100% Cotone / Cotton',
    printSize: 'WFOX Off Court',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Bianco', hex: '#E8E0D0', image: 'https://images.squarespace-cdn.com/content/v1/651bc3235f93e804f10fc47f/235cc635-483a-46c5-ad0a-7e95cf1386e3/ChatGPT+Image+13+mag+2026%2C+11_40_55.png?format=500w', price: 59 },
    ],
    gridImage: 'https://images.squarespace-cdn.com/content/v1/651bc3235f93e804f10fc47f/235cc635-483a-46c5-ad0a-7e95cf1386e3/ChatGPT+Image+13+mag+2026%2C+11_40_55.png?format=500w',
  },
  {
    id: 'wfox-keep-off',
    name: '"Keep Off The Grass"',
    subtitle: 'WFOX by DOUBLEU — Iconic',
    tag: 'Iconic',
    basePrice: 59,
    description: 'Il pezzo iconico della capsule WFOX. Verde bosco profondo, grafica audace, messaggio diretto. Per chi sa esattamente dove mettere i piedi — e dove no.<br><br>100% cotone Made in Italy. Produzione limitata.',
    fit: 'Regular Fit',
    material: '100% Cotone / Cotton',
    printSize: 'Keep Off The Grass',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Verde Scuro', hex: '#1B3A2D', image: 'https://images.squarespace-cdn.com/content/v1/651bc3235f93e804f10fc47f/bee44570-7383-4eb1-82d3-6e94e267a918/ChatGPT+Image+12+mag+2026%2C+23_12_12.png?format=2500w', price: 59 },
    ],
    gridImage: 'https://images.squarespace-cdn.com/content/v1/651bc3235f93e804f10fc47f/bee44570-7383-4eb1-82d3-6e94e267a918/ChatGPT+Image+12+mag+2026%2C+23_12_12.png?format=2500w',
  },
  {
    id: 'wfox-logo-tee',
    name: 'WFOX Logo Tee',
    subtitle: 'WFOX by DOUBLEU — Essential',
    tag: 'Essential',
    basePrice: 59,
    description: 'La t-shirt essenziale della capsule WFOX. 100% cotone Made in Italy, con logo WFOX stampato sul petto. Semplice, diretta, riconoscibile. Il pezzo che non manca mai nel guardaroba di chi gioca sul serio.',
    fit: 'Regular Fit',
    material: '100% Cotone / Cotton',
    printSize: 'WFOX Logo',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Bianco', hex: '#E8E0D0', image: 'https://images.squarespace-cdn.com/content/v1/651bc3235f93e804f10fc47f/dae7cda0-07e2-4e55-ad1b-30e2b6f8ca8c/ChatGPT+Image+12+mag+2026%2C+23_55_44.png?format=500w', price: 59 },
    ],
    gridImage: 'https://images.squarespace-cdn.com/content/v1/651bc3235f93e804f10fc47f/dae7cda0-07e2-4e55-ad1b-30e2b6f8ca8c/ChatGPT+Image+12+mag+2026%2C+23_55_44.png?format=500w',
  },
];

const SURFACES_PRODUCTS = [
  {
    id: 'surfaces-tshirt-clay',
    collection: 'surfaces',
    name: 'T-Shirt CLAY',
    subtitle: 'SURFACES by DOUBLEU — REF 001',
    tag: 'Clay',
    basePrice: 69,
    description: '100% cotone <strong>premium</strong> Made in Italy. Regular Fit, stampa 100 CLAY — ispirata alla superficie più lenta, profonda ed elegante del tennis. Off White, colore che racconta la storia del gioco.',
    fit: 'Regular Fit',
    material: '100% Cotone / Cotton',
    printSize: 'Stampa 100 CLAY',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Off White', hex: '#F5F0E8', image: 'surfaces/img/tshirt.png', price: 69 },
    ],
    gridImage: 'surfaces/img/tshirt.png',
  },
  {
    id: 'surfaces-sweatshirt-clay',
    collection: 'surfaces',
    name: 'Sweatshirt CLAY',
    subtitle: 'SURFACES by DOUBLEU — REF 002',
    tag: 'Clay',
    basePrice: 159,
    description: 'Felpa in cotone premium Made in Italy. Il comfort del post-partita incontra l\'identità della superficie più tecnica del tennis. Produzione artigianale, tiratura limitata.',
    fit: 'Regular Fit',
    material: '100% Cotone / Cotton',
    printSize: 'Stampa CLAY',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Off White', hex: '#F5F0E8', image: 'surfaces/img/sweatshirt.png', price: 159 },
      { name: 'Clay',      hex: '#8B1A1A', image: null,                           price: 159 },
    ],
    gridImage: 'surfaces/img/sweatshirt.png',
  },
  {
    id: 'surfaces-polo-clay',
    collection: 'surfaces',
    name: 'Polo CLAY',
    subtitle: 'SURFACES by DOUBLEU — REF 003',
    tag: 'Clay',
    basePrice: 99,
    description: 'Polo in Piqué di cotone premium Made in Italy. Il capo tecnico della capsule — on court e off court. Ricamo SURFACES sul petto, etichette interne artigianali.',
    fit: 'Regular Fit',
    material: 'Piqué di Cotone Premium / Cotton Piqué',
    printSize: 'Ricamo SURFACES',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Off White', hex: '#F5F0E8', image: 'surfaces/img/polo.jpg', price: 99 },
      { name: 'Clay',      hex: '#8B1A1A', image: null,                     price: 99 },
    ],
    gridImage: 'surfaces/img/polo.jpg',
  },
  {
    id: 'surfaces-cap-clay',
    collection: 'surfaces',
    name: 'Cap CLAY',
    subtitle: 'SURFACES by DOUBLEU — REF 004',
    tag: 'Clay',
    basePrice: 59,
    description: 'Cappellino da tennis Made in Italy. Struttura a 6 pannelli, chiusura regolabile, ricamo CLAY sul fronte. Il complemento perfetto alla capsule SURFACES.',
    fit: 'Taglia Unica',
    material: '100% Cotone / Cotton',
    printSize: 'Ricamo CLAY',
    sizes: ['Taglia Unica'],
    colors: [
      { name: 'Off White', hex: '#F5F0E8', image: 'surfaces/img/cap.jpg', price: 59 },
      { name: 'Clay',      hex: '#8B1A1A', image: null,                    price: 59 },
    ],
    gridImage: 'surfaces/img/cap.jpg',
  },
];

function getProductById(id) {
  return WFOX_PRODUCTS.find(p => p.id === id)
      || SURFACES_PRODUCTS.find(p => p.id === id)
      || null;
}

function getCollectionProducts(collection) {
  if (collection === 'wfox')     return WFOX_PRODUCTS;
  if (collection === 'surfaces') return SURFACES_PRODUCTS;
  return [];
}
