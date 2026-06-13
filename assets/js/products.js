const WFOX_PRODUCTS = [
  {
    id: 'wfox-crewneck',
    name: 'WFOX Crewneck',
    subtitle: 'WFOX by DOUBLEU – Urban Fox Edition',
    tag: 'Bestseller',
    basePrice: 99,
    description: {
      it: 'Eleganza senza tempo e spirito libero si incontrano in questa esclusiva felpa della collezione WFOX by DOUBLEU.<br><br>Realizzata in 100% cotone <strong>premium</strong> Made in Italy, questa felpa unisce comfort e stile in un capo che non passa inosservato. La grafica raffigura la nostra iconica volpe WFOX in tenuta da tennis old-school: un omaggio raffinato alle radici di questo sport, pensato per chi ama distinguersi con naturalezza.<br><br>Disponibile in blu navy e grigio mélange, è perfetta dentro e fuori dal campo, da abbinare a un pantalone sportivo o a un look più urbano.',
      en: 'Timeless elegance and free spirit come together in this exclusive sweatshirt from the WFOX by DOUBLEU collection.<br><br>Crafted in 100% <strong>premium</strong> cotton Made in Italy, this sweatshirt combines comfort and style in a piece that never goes unnoticed. The graphic features our iconic WFOX fox in an old-school tennis look: a refined tribute to the roots of this sport, designed for those who love to stand out naturally.<br><br>Available in navy blue and grey mélange, it\'s perfect on and off the court, paired with sports trousers or a more urban look.',
      de: 'Zeitlose Eleganz und freier Geist vereinen sich in diesem exklusiven Sweatshirt der Kollektion WFOX by DOUBLEU.<br><br>Gefertigt aus 100% <strong>Premium</strong>-Baumwolle Made in Italy, verbindet dieses Sweatshirt Komfort und Stil in einem Stück, das nicht unbemerkt bleibt. Die Grafik zeigt unseren ikonischen WFOX-Fuchs im Old-School-Tennis-Look: eine raffinierte Hommage an die Wurzeln dieses Sports, für alle, die es lieben, auf natürliche Weise aufzufallen.<br><br>Erhältlich in Marineblau und Grau-Mélange, ist er perfekt auf und neben dem Platz — kombinierbar mit einer Sporthose oder einem urbanen Look.',
    },
    fit: 'Regular Fit',
    material: '100% Cotone / Cotton',
    printSize: '23/25 cm',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Blu Navy', hex: '#0D1B2A', image: 'wfox/img/crew.jpg',      price: 99 },
      { name: 'Grigio',   hex: '#9E9E9E', image: 'wfox/img/crew-grey.png', price: 99 },
    ],
    gridImage: 'wfox/img/crew.jpg',
    i18n: {
      en: {
        description: 'Timeless elegance and free spirit come together in this exclusive sweatshirt from the WFOX by DOUBLEU collection.<br><br>Crafted in 100% <strong>premium</strong> cotton Made in Italy, this sweatshirt combines comfort and style in a piece that never goes unnoticed. The graphic features our iconic WFOX fox in an old-school tennis look: a refined tribute to the roots of this sport, designed for those who love to stand out naturally.<br><br>Available in navy blue and grey — perfect on and off the court.',
        fit: 'Regular Fit',
        material: '100% Cotton',
        printSize: '23/25 cm',
        colors: [
          { name: 'Navy Blue' },
          { name: 'Grey' },
        ],
      },
      de: {
        description: 'Zeitlose Eleganz und freier Geist vereinen sich in diesem exklusiven Sweatshirt der Kollektion WFOX by DOUBLEU.<br><br>Gefertigt aus 100% <strong>Premium</strong>-Baumwolle Made in Italy, verbindet dieses Sweatshirt Komfort und Stil in einem Stück, das nicht unbemerkt bleibt. Die Grafik zeigt unseren ikonischen WFOX-Fuchs im Old-School-Tennis-Look — für alle, die es lieben, auf natürliche Weise aufzufallen.<br><br>Erhältlich in Marineblau und Grau — perfekt auf und neben dem Platz.',
        fit: 'Regular Fit',
        material: '100% Baumwolle / Cotton',
        printSize: '23/25 cm',
        colors: [
          { name: 'Marineblau' },
          { name: 'Grau' },
        ],
      },
    },
  },
  {
    id: 'wfox-tee-white',
    name: 'WFOX Tee Off Court',
    subtitle: 'WFOX by DOUBLEU — Limited',
    tag: 'Limited',
    basePrice: 59,
    description: 'La tee limited edition della capsule WFOX. Costruzione premium, 100% cotone Made in Italy. Produzione limitata, zero riassortimento. Il pezzo che scompare prima di tutti gli altri.',
    fit: 'Regular Fit',
    material: '100% Cotone / Cotton',
    printSize: 'WFOX Off Court',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Bianco', hex: '#E8E0D0', image: 'https://images.squarespace-cdn.com/content/v1/651bc3235f93e804f10fc47f/235cc635-483a-46c5-ad0a-7e95cf1386e3/ChatGPT+Image+13+mag+2026%2C+11_40_55.png?format=500w', price: 59 },
      { name: 'Grigio', hex: '#9E9E9E', image: 'wfox/img/tee-grey.png', price: 59 },
      { name: 'Blu',    hex: '#1A3A5C', image: 'wfox/img/tee-blu.png',  price: 59 },
    ],
    gridImage: 'https://images.squarespace-cdn.com/content/v1/651bc3235f93e804f10fc47f/235cc635-483a-46c5-ad0a-7e95cf1386e3/ChatGPT+Image+13+mag+2026%2C+11_40_55.png?format=500w',
    i18n: {
      en: {
        description: 'The limited edition tee from the WFOX capsule. Premium construction, 100% cotton Made in Italy. Limited production, zero restocking. The piece that disappears before all the others.',
        fit: 'Regular Fit',
        material: '100% Cotton',
        printSize: 'WFOX Off Court',
        colors: [{ name: 'White' }, { name: 'Grey' }, { name: 'Blue' }],
      },
      de: {
        description: 'Das Limited-Edition-T-Shirt der WFOX-Kapsel. Hochwertige Konstruktion, 100% Baumwolle Made in Italy. Limitierte Produktion, keine Nachbestellung. Das Stück, das als erstes verschwindet.',
        fit: 'Regular Fit',
        material: '100% Baumwolle / Cotton',
        printSize: 'WFOX Off Court',
        colors: [{ name: 'Weiß' }, { name: 'Grau' }, { name: 'Blau' }],
      },
    },
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
    i18n: {
      en: {
        description: 'The iconic piece from the WFOX capsule. Deep forest green, bold graphic, direct message. For those who know exactly where to put their feet — and where not to.<br><br>100% cotton Made in Italy. Limited production.',
        fit: 'Regular Fit',
        material: '100% Cotton',
        printSize: 'Keep Off The Grass',
        colors: [{ name: 'Dark Green' }],
      },
      de: {
        description: 'Das ikonische Stück der WFOX-Kapsel. Tiefes Waldgrün, kühne Grafik, direkte Botschaft. Für diejenigen, die genau wissen, wohin sie ihre Füße setzen — und wohin nicht.<br><br>100% Baumwolle Made in Italy. Limitierte Produktion.',
        fit: 'Regular Fit',
        material: '100% Baumwolle / Cotton',
        printSize: 'Keep Off The Grass',
        colors: [{ name: 'Dunkelgrün' }],
      },
    },
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
    i18n: {
      en: {
        description: 'The essential t-shirt from the WFOX capsule. 100% cotton Made in Italy, with WFOX logo printed on the chest. Simple, direct, recognisable. The piece that never goes missing from the wardrobe of those who play seriously.',
        fit: 'Regular Fit',
        material: '100% Cotton',
        printSize: 'WFOX Logo',
        colors: [{ name: 'White' }],
      },
      de: {
        description: 'Das wesentliche T-Shirt der WFOX-Kapsel. 100% Baumwolle Made in Italy, mit WFOX-Logo auf der Brust. Einfach, direkt, wiedererkennbar. Das Stück, das im Kleiderschrank derer nie fehlt, die es ernst meinen.',
        fit: 'Regular Fit',
        material: '100% Baumwolle / Cotton',
        printSize: 'WFOX Logo',
        colors: [{ name: 'Weiß' }],
      },
    },
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
    i18n: {
      en: {
        description: '100% premium cotton Made in Italy. Regular Fit, 100 CLAY print — inspired by the slowest, deepest and most elegant surface in tennis. Off White, a colour that tells the history of the game.',
        fit: 'Regular Fit',
        material: '100% Cotton',
        printSize: '100 CLAY Print',
        colors: [{ name: 'Off White' }],
      },
      de: {
        description: '100% Premium-Baumwolle Made in Italy. Regular Fit, 100-CLAY-Druck — inspiriert von der langsamsten, tiefsten und elegantesten Oberfläche im Tennis. Off White, eine Farbe, die die Geschichte des Spiels erzählt.',
        fit: 'Regular Fit',
        material: '100% Baumwolle / Cotton',
        printSize: '100-CLAY-Druck',
        colors: [{ name: 'Off White' }],
      },
    },
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
    ],
    gridImage: 'surfaces/img/sweatshirt.png',
    i18n: {
      en: {
        description: 'Premium cotton sweatshirt Made in Italy. Post-match comfort meets the identity of tennis\' most technical surface. Artisan production, limited edition.',
        fit: 'Regular Fit',
        material: '100% Cotton',
        printSize: 'CLAY Print',
        colors: [
          { name: 'Off White' },
          { name: 'Clay' },
        ],
      },
      de: {
        description: 'Premium-Baumwoll-Sweatshirt Made in Italy. Post-Match-Komfort trifft die Identität der technischsten Oberfläche im Tennis. Handwerkliche Produktion, limitierte Auflage.',
        fit: 'Regular Fit',
        material: '100% Baumwolle / Cotton',
        printSize: 'CLAY-Druck',
        colors: [
          { name: 'Off White' },
          { name: 'Clay' },
        ],
      },
    },
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
      { name: 'Off White', hex: '#F5F0E8', image: 'surfaces/img/polo.jpg',     price: 99 },
      { name: 'Clay',      hex: '#8B1A1A', image: 'surfaces/img/polo_red.png', price: 99 },
    ],
    gridImage: 'surfaces/img/polo.jpg',
    i18n: {
      en: {
        description: 'Premium Cotton Piqué polo Made in Italy. The technical piece of the capsule — on court and off court. SURFACES embroidery on the chest, artisan internal labels.',
        fit: 'Regular Fit',
        material: 'Premium Cotton Piqué',
        printSize: 'SURFACES Embroidery',
        colors: [
          { name: 'Off White' },
          { name: 'Clay' },
        ],
      },
      de: {
        description: 'Premium-Baumwoll-Piqué-Polo Made in Italy. Das technische Stück der Kapsel — auf und neben dem Platz. SURFACES-Stickerei auf der Brust, handwerkliche Innenaufkleber.',
        fit: 'Regular Fit',
        material: 'Premium-Baumwoll-Piqué',
        printSize: 'SURFACES-Stickerei',
        colors: [
          { name: 'Off White' },
          { name: 'Clay' },
        ],
      },
    },
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
      { name: 'Off White', hex: '#F5F0E8', image: 'surfaces/img/cap.jpg',     price: 59 },
      { name: 'Clay',      hex: '#8B1A1A', image: 'surfaces/img/cap_red.png', price: 59 },
    ],
    gridImage: 'surfaces/img/cap.jpg',
    i18n: {
      en: {
        description: 'Tennis cap Made in Italy. 6-panel construction, adjustable closure, CLAY embroidery on the front. The perfect complement to the SURFACES capsule.',
        fit: 'One Size',
        material: '100% Cotton',
        printSize: 'CLAY Embroidery',
        sizes: ['One Size'],
        colors: [
          { name: 'Off White' },
          { name: 'Clay' },
        ],
      },
      de: {
        description: 'Tennis-Cap Made in Italy. 6-Panel-Konstruktion, verstellbarer Verschluss, CLAY-Stickerei vorne. Die perfekte Ergänzung zur SURFACES-Kapsel.',
        fit: 'Einheitsgröße',
        material: '100% Baumwolle / Cotton',
        printSize: 'CLAY-Stickerei',
        sizes: ['Einheitsgröße'],
        colors: [
          { name: 'Off White' },
          { name: 'Clay' },
        ],
      },
    },
  },
];

const GRASS_PRODUCTS = [
  {
    id: 'grass-tee',
    collection: 'grass',
    name: 'GRASS Tee',
    subtitle: 'SURFACES by DOUBLEU — REF 005',
    tag: 'Grass',
    basePrice: 69,
    description: '100% cotone <strong>premium</strong> Made in Italy. Regular Fit, stampa GRASS — ispirata alla superficie più veloce e imprevedibile del tennis. Verde campo, il colore dell\'erba di Wimbledon.',
    fit: 'Regular Fit',
    material: '100% Cotone / Cotton',
    printSize: 'Stampa GRASS',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Verde Campo', hex: '#2D5A27', image: 'surfaces/img/grass-tee-placeholder.jpg', price: 69 },
    ],
    gridImage: 'surfaces/img/grass-tee-placeholder.jpg',
    i18n: {
      en: {
        description: '100% premium cotton Made in Italy. Regular Fit, GRASS print — inspired by the fastest and most unpredictable surface in tennis. Court green, the colour of Wimbledon grass.',
        fit: 'Regular Fit',
        material: '100% Cotton',
        printSize: 'GRASS Print',
        colors: [{ name: 'Court Green' }],
      },
      de: {
        description: '100% Premium-Baumwolle Made in Italy. Regular Fit, GRASS-Druck — inspiriert von der schnellsten und unberechenbarsten Oberfläche im Tennis. Feldgrün, die Farbe des Wimbledon-Rasens.',
        fit: 'Regular Fit',
        material: '100% Baumwolle / Cotton',
        printSize: 'GRASS-Druck',
        colors: [{ name: 'Feldgrün' }],
      },
    },
  },
  {
    id: 'grass-sweatshirt',
    collection: 'grass',
    name: 'GRASS Sweatshirt',
    subtitle: 'SURFACES by DOUBLEU — REF 006',
    tag: 'Grass',
    basePrice: 159,
    description: 'Felpa in cotone premium Made in Italy. La stagione più breve del tennis, la più elegante. Patch ricamata GRASS sul petto. Produzione artigianale, tiratura limitata.',
    fit: 'Regular Fit',
    material: '100% Cotone / Cotton',
    printSize: 'Patch ricamata GRASS',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Verde Scuro', hex: '#1A3A16', image: 'surfaces/img/grass-sweatshirt-placeholder.jpg', price: 159 },
    ],
    gridImage: 'surfaces/img/grass-sweatshirt-placeholder.jpg',
    i18n: {
      en: {
        description: 'Premium cotton sweatshirt Made in Italy. The shortest season in tennis, the most elegant. Embroidered GRASS patch on the chest. Artisan production, limited edition.',
        fit: 'Regular Fit',
        material: '100% Cotton',
        printSize: 'Embroidered GRASS Patch',
        colors: [{ name: 'Dark Green' }],
      },
      de: {
        description: 'Premium-Baumwoll-Sweatshirt Made in Italy. Die kürzeste Saison im Tennis, die eleganteste. Gestickter GRASS-Patch auf der Brust. Handwerkliche Produktion, limitierte Auflage.',
        fit: 'Regular Fit',
        material: '100% Baumwolle / Cotton',
        printSize: 'Gestickter GRASS-Patch',
        colors: [{ name: 'Dunkelgrün' }],
      },
    },
  },
];

function getProductById(id) {
  return WFOX_PRODUCTS.find(p => p.id === id)
      || SURFACES_PRODUCTS.find(p => p.id === id)
      || GRASS_PRODUCTS.find(p => p.id === id)
      || null;
}

// Returns product with i18n fields merged for the given language
function getProductLocalized(id, lang) {
  const product = getProductById(id);
  if (!product || !lang || lang === 'it') return product;
  const override = product.i18n && product.i18n[lang];
  if (!override) return product;
  const localized = Object.assign({}, product, override);
  // Merge color names, keeping hex/image/price from base
  if (override.colors) {
    localized.colors = product.colors.map((c, i) => {
      const nameOverride = override.colors[i] && override.colors[i].name;
      return nameOverride ? Object.assign({}, c, { name: nameOverride }) : c;
    });
  }
  // Merge sizes if overridden
  if (override.sizes) localized.sizes = override.sizes;
  return localized;
}

function getCollectionProducts(collection) {
  if (collection === 'wfox')     return WFOX_PRODUCTS;
  if (collection === 'surfaces') return SURFACES_PRODUCTS;
  if (collection === 'grass')    return GRASS_PRODUCTS;
  return [];
}
