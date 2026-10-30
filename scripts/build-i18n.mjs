#!/usr/bin/env node
// Genera le versioni EN, DE ed ES (URL dedicati /en/, /de/ e /es/) delle pagine pubbliche
// a partire dalle pagine italiane e dalle traduzioni di assets/js/i18n.js.
//
// Le pagine italiane restano la fonte: dopo ogni modifica a una pagina tradotta
// o a i18n.js, rilanciare dalla radice del repository:
//
//   node scripts/build-i18n.mjs
//
// Lo script aggiorna anche, nelle pagine italiane, i tag hreflang e i link del
// selettore lingua, e rigenera le voci multilingua di sitemap.xml.
// Nessuna dipendenza esterna.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE = 'https://www.doubleutennis.com';
const LANGS = ['en', 'de', 'es'];
const OG_LOCALE = { it: 'it_IT', en: 'en_GB', de: 'de_DE', es: 'es_ES' };
const IN_LANGUAGE = { it: 'it-IT', en: 'en', de: 'de-DE', es: 'es-ES' };

// Pagine con versione tradotta, con title e meta description per lingua.
// Il title/description italiano resta quello scritto nella pagina sorgente.
const PAGES = {
  'index.html': {
    en: ['DOUBLEU | Custom Tennis Club Apparel — Made in Italy',
         'DOUBLEU designs and manufactures custom sportswear in Italy for tennis, padel and pickleball clubs: school kits, staff apparel, off-court collections and member shops.'],
    de: ['DOUBLEU | Individuelle Tennisbekleidung für Vereine — Made in Italy',
         'DOUBLEU entwirft und produziert in Italien individuelle Sportbekleidung für Tennis-, Padel- und Pickleball-Vereine: Schulkits, Trainerbekleidung, Off-Court-Kollektionen und Mitgliedershops.'],
    es: ['DOUBLEU | Ropa de tenis personalizada para clubes — Made in Italy',
         'DOUBLEU diseña y fabrica en Italia ropa deportiva personalizada para clubes de tenis, pádel y pickleball: kits de escuela, ropa para el staff, colecciones off-court y tiendas para socios.'],
  },
  'club.html': {
    en: ['DOUBLEU | Custom Sportswear for Tennis and Padel Clubs — Made in Italy',
         'Premium custom tennis apparel for tennis, padel and pickleball clubs, designed and made in Italy: school kits, staff, off-court wear, club shops and members-only areas.'],
    de: ['DOUBLEU | Individuelle Sportbekleidung für Tennis- und Padelvereine — Made in Italy',
         'Hochwertige individuelle Tennisbekleidung für Tennis-, Padel- und Pickleball-Vereine, in Italien entworfen und gefertigt: Schulkits, Trainerteam, Off-Court, Vereinsshops und Mitgliederbereiche.'],
    es: ['DOUBLEU | Ropa deportiva personalizada para clubes de tenis y pádel — Made in Italy',
         'Ropa de tenis personalizada premium para clubes de tenis, pádel y pickleball, diseñada y fabricada en Italia: kits de escuela, staff, ropa off-court, tiendas del club y áreas reservadas para socios.'],
  },
  'capsule.html': {
    en: ['DOUBLEU | Capsule Collections — Limited-Edition Italian Tennis Apparel',
         'Explore the limited DOUBLEU capsules WFOX, GRASS and SURFACES: high-quality tennis apparel inspired by the culture of the game. Limited edition, made in Italy.'],
    de: ['DOUBLEU | Capsule Collections — Italienische Tennisbekleidung in limitierter Auflage',
         'Entdecken Sie die limitierten DOUBLEU-Capsules WFOX, GRASS und SURFACES: hochwertige Tennisbekleidung, inspiriert von der Kultur des Spiels. Limitierte Auflage, Made in Italy.'],
    es: ['DOUBLEU | Capsule Collections — Ropa de tenis italiana de edición limitada',
         'Descubre las cápsulas limitadas de DOUBLEU WFOX, GRASS y SURFACES: ropa de tenis de alta calidad inspirada en la cultura del juego. Edición limitada, Made in Italy.'],
  },
  'casestudies.html': {
    en: ['DOUBLEU | Case Studies — Custom Apparel for Tennis Clubs',
         'DOUBLEU custom tennis apparel projects: MTC Ausstellungspark (Munich), All Round Sport & Wellness (Rome) and SNAUWAERT. Club collections, dedicated shops and Made in Italy production.'],
    de: ['DOUBLEU | Case Studies — Individuelle Bekleidung für Tennisvereine',
         'DOUBLEU-Projekte für individuelle Tennisbekleidung: MTC Ausstellungspark (München), All Round Sport & Wellness (Rom) und SNAUWAERT. Vereinskollektionen, eigene Shops und Produktion Made in Italy.'],
    es: ['DOUBLEU | Case Studies — Ropa personalizada para clubes de tenis',
         'Proyectos DOUBLEU de ropa de tenis personalizada: MTC Ausstellungspark (Múnich), All Round Sport & Wellness (Roma) y SNAUWAERT. Colecciones de club, tiendas propias y producción Made in Italy.'],
  },
  'casestudies/mtc-ausstellungspark.html': {
    en: ['DOUBLEU × MTC Ausstellungspark (Munich) — Custom Tennis Club Apparel',
         'Bespoke club line and first online Club Shop for MTC Ausstellungspark, a historic Munich tennis club: Made in Italy match shirts, shorts and caps, with collective ordering.'],
    de: ['DOUBLEU × MTC Ausstellungspark (München) — Individuelle Bekleidung für Tennisvereine',
         'Maßgeschneiderte Vereinslinie und erster Online-Clubshop für den MTC Ausstellungspark, einen traditionsreichen Münchner Tennisverein: Spieltrikots, Shorts und Caps Made in Italy, mit Sammelbestellung.'],
    es: ['DOUBLEU × MTC Ausstellungspark (Múnich) — Ropa personalizada para clubes de tenis',
         'Línea de club a medida y primera Club Shop online para el MTC Ausstellungspark, histórico club de tenis de Múnich: camisetas de juego, pantalones cortos y gorras Made in Italy, con pedido colectivo.'],
  },
  'casestudies/all-round.html': {
    en: ['DOUBLEU × All Round Sport & Wellness (Rome) — Custom Tennis and Padel Apparel',
         'Bespoke collection for the tennis and padel schools of All Round Sport & Wellness in Rome: Essential Line, Premium Line for staff and competition, members-only area and in-club display.'],
    de: ['DOUBLEU × All Round Sport & Wellness (Rom) — Individuelle Tennis- und Padelbekleidung',
         'Maßgeschneiderte Kollektion für die Tennis- und Padelschulen von All Round Sport & Wellness in Rom: Essential Line, Premium Line für Trainerteam und Wettkampf, Mitgliederbereich und Ausstellungsfläche im Club.'],
    es: ['DOUBLEU × All Round Sport & Wellness (Roma) — Ropa personalizada de tenis y pádel',
         'Colección a medida para las escuelas de tenis y pádel de All Round Sport & Wellness en Roma: Essential Line, Línea Premium para staff y competición, área reservada para socios y espacio expositivo en el club.'],
  },
  'casestudies/snauwaert.html': {
    en: ['DOUBLEU × SNAUWAERT — Made in Italy Tennis Apparel Development and Production',
         "Since 2019 DOUBLEU has partnered with SNAUWAERT, the historic tennis brand founded in 1928, on the design, prototyping and Made in Italy production of men's and women's apparel collections."],
    de: ['DOUBLEU × SNAUWAERT — Entwicklung und Produktion von Tennisbekleidung Made in Italy',
         'Seit 2019 begleitet DOUBLEU die 1928 gegründete Traditionsmarke SNAUWAERT bei Design, Prototyping und Produktion Made in Italy von Herren- und Damenkollektionen.'],
    es: ['DOUBLEU × SNAUWAERT — Desarrollo y producción de ropa de tenis Made in Italy',
         'Desde 2019 DOUBLEU colabora con SNAUWAERT, la histórica marca de tenis fundada en 1928, en el diseño, el prototipado y la producción Made in Italy de sus colecciones de hombre y mujer.'],
  },
  'contatti.html': {
    en: ['DOUBLEU | Contact — Custom Tennis Apparel, Made in Italy',
         "Contact DOUBLEU about club projects, orders, shipping and capsule collections. Based in Cava de' Tirreni (SA), Italy — info@doubleutennis.com"],
    de: ['DOUBLEU | Kontakt — Individuelle Tennisbekleidung Made in Italy',
         "Kontaktieren Sie DOUBLEU für Vereinsprojekte, Bestellungen, Versand und Capsule Collections. Sitz in Cava de' Tirreni (SA), Italien — info@doubleutennis.com"],
    es: ['DOUBLEU | Contacto — Ropa de tenis personalizada, Made in Italy',
         "Contacta con DOUBLEU para proyectos de club, pedidos, envíos y capsule collections. Sede en Cava de' Tirreni (SA), Italia — info@doubleutennis.com"],
  },
  'lookbook.html': {
    en: ['DOUBLEU | Lookbook — Made in Italy Tennis Apparel Capsules',
         'Browse the DOUBLEU lookbook: photography of the WFOX, GRASS and SURFACES capsules. Limited-edition tennis apparel made in Italy.'],
    de: ['DOUBLEU | Lookbook — Tennisbekleidung Made in Italy',
         'Das DOUBLEU-Lookbook: Fotografien der Capsules WFOX, GRASS und SURFACES. Tennisbekleidung in limitierter Auflage, Made in Italy.'],
    es: ['DOUBLEU | Lookbook — Cápsulas de ropa de tenis Made in Italy',
         'Descubre el lookbook de DOUBLEU: fotografías de las cápsulas WFOX, GRASS y SURFACES. Ropa de tenis de edición limitada, Made in Italy.'],
  },
  'wfox.html': {
    en: ['DOUBLEU | WFOX — Be Your Nature | Made in Italy Tennis Capsule',
         "WFOX is DOUBLEU's first capsule: limited-edition tennis apparel in premium technical materials. Discover the Be Your Nature collection, made in Italy."],
    de: ['DOUBLEU | WFOX — Be Your Nature | Tennis-Capsule Made in Italy',
         'WFOX ist die erste DOUBLEU-Capsule: Tennisbekleidung in limitierter Auflage aus hochwertigen technischen Materialien. Entdecken Sie die Kollektion Be Your Nature, Made in Italy.'],
    es: ['DOUBLEU | WFOX — Be Your Nature | Cápsula de tenis Made in Italy',
         'WFOX es la primera cápsula de DOUBLEU: ropa de tenis de edición limitada en materiales técnicos premium. Descubre la colección Be Your Nature, Made in Italy.'],
  },
  'grass.html': {
    en: ['DOUBLEU | GRASS — Grass Court Tennis Capsule | Made in Italy',
         'GRASS is the DOUBLEU capsule dedicated to grass courts: limited-edition technical tennis apparel inspired by the tradition of grass-court tennis. Made in Italy.'],
    de: ['DOUBLEU | GRASS — Tennis-Capsule für Rasenplätze | Made in Italy',
         'GRASS ist die DOUBLEU-Capsule für den Rasen: technische Tennisbekleidung in limitierter Auflage, inspiriert von der Tradition des Rasentennis. Made in Italy.'],
    es: ['DOUBLEU | GRASS — Cápsula de tenis para pista de hierba | Made in Italy',
         'GRASS es la cápsula de DOUBLEU dedicada a la hierba: ropa técnica de tenis de edición limitada inspirada en la tradición del tenis sobre hierba. Made in Italy.'],
  },
  'surfaces.html': {
    en: ['DOUBLEU | SURFACES — A Decade On Court | Made in Italy Tennis Capsule',
         'SURFACES is the DOUBLEU capsule celebrating a decade on court. Three surfaces, three colours, one vision of Italian tennis. Limited edition, made in Italy.'],
    de: ['DOUBLEU | SURFACES — A Decade On Court | Tennis-Capsule Made in Italy',
         'SURFACES ist die DOUBLEU-Capsule, die ein Jahrzehnt auf dem Platz feiert. Drei Beläge, drei Farben, eine Vision des italienischen Tennis. Limitierte Auflage, Made in Italy.'],
    es: ['DOUBLEU | SURFACES — A Decade On Court | Cápsula de tenis Made in Italy',
         'SURFACES es la cápsula de DOUBLEU que celebra una década en la pista. Tres superficies, tres colores, una visión del tenis italiano. Edición limitada, Made in Italy.'],
  },
  'clay.html': {
    en: ['DOUBLEU | CLAY — Clay Court Tennis Capsule | Made in Italy',
         'CLAY is the SURFACES variant dedicated to clay courts: limited-edition technical tennis apparel made in Italy, in warm colours and premium materials.'],
    de: ['DOUBLEU | CLAY — Tennis-Capsule für Sandplätze | Made in Italy',
         'CLAY ist die SURFACES-Variante für Sandplätze: technische Tennisbekleidung in limitierter Auflage, Made in Italy, in warmen Farben und hochwertigen Materialien.'],
    es: ['DOUBLEU | CLAY — Cápsula de tenis para tierra batida | Made in Italy',
         'CLAY es la variante de SURFACES dedicada a la tierra batida: ropa técnica de tenis de edición limitada, Made in Italy, en colores cálidos y materiales premium.'],
  },
};

// Testi dei dati strutturati (JSON-LD) che non sono in i18n.js né nei title/description.
const JSONLD_TEXT = {
  'DOUBLEU è un brand italiano che progetta e produce in Italia abbigliamento sportivo personalizzato premium per club di tennis, padel e pickleball: kit scuola, abbigliamento staff, collezioni off-court, shop club e aree riservate ai soci. Realizza inoltre capsule collection in edizione limitata.': {
    en: 'DOUBLEU is an Italian brand that designs and manufactures premium custom sportswear in Italy for tennis, padel and pickleball clubs: school kits, staff apparel, off-court collections, club shops and members-only areas. It also creates limited-edition capsule collections.',
    de: 'DOUBLEU ist eine italienische Marke, die in Italien hochwertige individuelle Sportbekleidung für Tennis-, Padel- und Pickleball-Vereine entwirft und produziert: Schulkits, Trainerbekleidung, Off-Court-Kollektionen, Vereinsshops und Mitgliederbereiche. Dazu kommen Capsule Collections in limitierter Auflage.',
    es: 'DOUBLEU es una marca italiana que diseña y fabrica en Italia ropa deportiva personalizada premium para clubes de tenis, pádel y pickleball: kits de escuela, ropa para el staff, colecciones off-court, tiendas del club y áreas reservadas para socios. Además, crea capsule collections de edición limitada.',
  },
  'Abbigliamento sportivo personalizzato': { en: 'Custom sportswear', de: 'Individuelle Sportbekleidung', es: 'Ropa deportiva personalizada' },
  'Abbigliamento tennis personalizzato per club': { en: 'Custom tennis club apparel', de: 'Individuelle Tennisbekleidung für Vereine', es: 'Ropa de tenis personalizada para clubes' },
  'Abbigliamento padel personalizzato': { en: 'Custom padel apparel', de: 'Individuelle Padelbekleidung', es: 'Ropa de pádel personalizada' },
  'Abbigliamento pickleball personalizzato': { en: 'Custom pickleball apparel', de: 'Individuelle Pickleballbekleidung', es: 'Ropa de pickleball personalizada' },
  'Abbigliamento sportivo personalizzato per club di tennis, padel e pickleball': {
    en: 'Custom sportswear for tennis, padel and pickleball clubs',
    de: 'Individuelle Sportbekleidung für Tennis-, Padel- und Pickleball-Vereine',
    es: 'Ropa deportiva personalizada para clubes de tenis, pádel y pickleball',
  },
  'Progettazione e produzione di abbigliamento sportivo personalizzato': {
    en: 'Design and manufacturing of custom sportswear',
    de: 'Design und Produktion individueller Sportbekleidung',
    es: 'Diseño y fabricación de ropa deportiva personalizada',
  },
  "DOUBLEU sviluppa collezioni su misura attorno all'identità del club: kit scuola tennis e padel, abbigliamento staff, abbigliamento off-court, soluzioni shop club e aree riservate ai soci. Produzione in Italia.": {
    en: "DOUBLEU develops bespoke collections around the club's identity: tennis and padel school kits, staff apparel, off-court apparel, club shop solutions and members-only areas. Made in Italy.",
    de: 'DOUBLEU entwickelt maßgeschneiderte Kollektionen rund um die Identität des Vereins: Tennis- und Padel-Schulkits, Trainerbekleidung, Off-Court-Bekleidung, Vereinsshop-Lösungen und Mitgliederbereiche. Produktion in Italien.',
    es: 'DOUBLEU desarrolla colecciones a medida en torno a la identidad del club: kits de escuela de tenis y pádel, ropa para el staff, ropa off-court, soluciones de tienda del club y áreas reservadas para socios. Producción en Italia.',
  },
  'Club di tennis, padel e pickleball, scuole tennis e accademie': {
    en: 'Tennis, padel and pickleball clubs, tennis schools and academies',
    de: 'Tennis-, Padel- und Pickleball-Vereine, Tennisschulen und Akademien',
    es: 'Clubes de tenis, pádel y pickleball, escuelas de tenis y academias',
  },
  'Case Studies DOUBLEU': { en: 'DOUBLEU Case Studies', de: 'DOUBLEU Case Studies', es: 'Case Studies DOUBLEU' },
  'Tennis club di Monaco di Baviera, Germania': { en: 'Tennis club in Munich, Germany', de: 'Tennisverein in München, Deutschland', es: 'Club de tenis en Múnich, Alemania' },
  'Centro sportivo con scuola tennis e scuola padel a Roma, Italia': {
    en: 'Sports centre with a tennis school and a padel school in Rome, Italy',
    de: 'Sportzentrum mit Tennis- und Padelschule in Rom, Italien',
    es: 'Centro deportivo con escuela de tenis y escuela de pádel en Roma, Italia',
  },
  'Marchio storico del tennis internazionale': { en: 'Historic international tennis brand', de: 'Traditionsmarke des internationalen Tennis', es: 'Marca histórica del tenis internacional' },
};

// Testi alternativi delle immagini (alt) che non coincidono con un testo di i18n.js.
// Nomi propri e nomi di prodotto restano invariati (ALT_KEEP).
const ALT_TEXT = {
  'Atleti in campo con abbigliamento DOUBLEU': { en: 'Players on court wearing DOUBLEU apparel', de: 'Spieler auf dem Platz in DOUBLEU-Bekleidung', es: 'Jugadores en la pista con ropa DOUBLEU' },
  'Abbigliamento tennis personalizzato DOUBLEU per club': { en: 'DOUBLEU custom tennis apparel for clubs', de: 'Individuelle DOUBLEU-Tennisbekleidung für Vereine', es: 'Ropa de tenis personalizada DOUBLEU para clubes' },
  'Capsule Limitate DOUBLEU': { en: 'DOUBLEU limited capsules', de: 'Limitierte DOUBLEU-Capsules', es: 'Cápsulas limitadas DOUBLEU' },
  'Collezioni Club': { en: 'Club collections', de: 'Vereinskollektionen', es: 'Colecciones Club' },
  'Cultura Tennis': { en: 'Tennis culture', de: 'Tenniskultur', es: 'Cultura del tenis' },
  'Artigianale': { en: 'Craftsmanship', de: 'Handwerk', es: 'Artesanía' },
  'Italia': { en: 'Italy', de: 'Italien', es: 'Italia' },
  'Materiali': { en: 'Materials', de: 'Materialien', es: 'Materiales' },
  'Materiali selezionati': { en: 'Selected materials', de: 'Ausgewählte Materialien', es: 'Materiales seleccionados' },
  'Materiali Premium': { en: 'Premium materials', de: 'Premium-Materialien', es: 'Materiales premium' },
  'Produzione': { en: 'Production', de: 'Produktion', es: 'Producción' },
  'Produzione artigianale': { en: 'Artisanal production', de: 'Handwerkliche Produktion', es: 'Producción artesanal' },
  'Produzione Made in Italy': { en: 'Made in Italy production', de: 'Produktion Made in Italy', es: 'Producción Made in Italy' },
  'Personalizzazione': { en: 'Customisation', de: 'Personalisierung', es: 'Personalización' },
  'Tempi chiari': { en: 'Clear timelines', de: 'Klare Zeitpläne', es: 'Plazos claros' },
  'Tirature Limitate': { en: 'Limited runs', de: 'Limitierte Auflagen', es: 'Tiradas limitadas' },
  'Lucchetto': { en: 'Padlock', de: 'Vorhängeschloss', es: 'Candado' },
  'Gruccia': { en: 'Hanger', de: 'Kleiderbügel', es: 'Percha' },
  'Staff': { en: 'Staff', de: 'Trainerteam', es: 'Staff' },
  'Conferma': { en: 'Confirmation', de: 'Freigabe', es: 'Aprobación' },
  'Distinta Taglie': { en: 'Size list', de: 'Größenliste', es: 'Lista de tallas' },
  'Consegna': { en: 'Delivery', de: 'Lieferung', es: 'Entrega' },
  'T-Shirt Uomo': { en: "Men's T-shirt", de: 'Herren-T-Shirt', es: 'Camiseta de hombre' },
  'T-Shirt Donna': { en: "Women's T-shirt", de: 'Damen-T-Shirt', es: 'Camiseta de mujer' },
  'Collezione Club MTC': { en: 'MTC club collection', de: 'MTC-Vereinskollektion', es: 'Colección club MTC' },
  'Ordine Collettivo MTC': { en: 'MTC collective order', de: 'MTC-Sammelbestellung', es: 'Pedido colectivo MTC' },
  'Festa di Natale MTC': { en: 'MTC Christmas party', de: 'MTC-Weihnachtsfeier', es: 'Fiesta de Navidad MTC' },
  'Linea Premium All Round': { en: 'All Round Premium Line', de: 'All Round Premium Line', es: 'Línea Premium All Round' },
  'Area Soci All Round': { en: 'All Round members area', de: 'All Round Mitgliederbereich', es: 'Área de socios All Round' },
  'Design e Sviluppo Collezione': { en: 'Collection design and development', de: 'Kollektionsdesign und -entwicklung', es: 'Diseño y desarrollo de la colección' },
  'WFOX — coppia al tennis club': { en: 'WFOX — couple at the tennis club', de: 'WFOX — Paar im Tennisclub', es: 'WFOX — pareja en el club de tenis' },
  'WFOX — Lifestyle fuori dal campo': { en: 'WFOX — off-court lifestyle', de: 'WFOX — Lifestyle abseits des Platzes', es: 'WFOX — lifestyle fuera de la pista' },
  'WFOX indossato': { en: 'WFOX worn', de: 'WFOX getragen', es: 'WFOX puesto' },
  'T-shirt verde WFOX': { en: 'WFOX green T-shirt', de: 'Grünes WFOX-T-Shirt', es: 'Camiseta verde WFOX' },
  'Felpa WFOX': { en: 'WFOX sweatshirt', de: 'WFOX-Sweatshirt', es: 'Sudadera WFOX' },
  'Felpa SURFACES Clay': { en: 'SURFACES Clay sweatshirt', de: 'SURFACES Clay Sweatshirt', es: 'Sudadera SURFACES Clay' },
  'SURFACES — Attrezzatura sul campo in terra': { en: 'SURFACES — gear on a clay court', de: 'SURFACES — Ausrüstung auf dem Sandplatz', es: 'SURFACES — equipamiento en una pista de tierra batida' },
  'SURFACES Collection — CLAY e GRASS': { en: 'SURFACES Collection — CLAY and GRASS', de: 'SURFACES Collection — CLAY und GRASS', es: 'SURFACES Collection — CLAY y GRASS' },
  'Il progetto SURFACES': { en: 'The SURFACES project', de: 'Das Projekt SURFACES', es: 'El proyecto SURFACES' },
  'GRASS — Patch ricamata': { en: 'GRASS — embroidered patch', de: 'GRASS — gestickter Aufnäher', es: 'GRASS — parche bordado' },
};
const ALT_KEEP = new Set([
  '', 'Snauwaert', 'MTC Ausstellungspark', 'All Round', 'All Round Sport & Wellness', 'WFOX', 'WFOX — Be Your Nature', 'WFOX Logo', 'WFOX Logo Tee',
  'WFOX Tee flat lay', 'WFOX Tee White', 'WFOX Crewneck White', 'WFOX Crewneck Navy', 'WFOX Capsule', 'WFOX Capsule Hero',
  'Visual Collection', 'Brief', 'Short', 'Polo', 'Shopping bag', 'Club-Shop MTC', 'Essential Line All Round', 'Keep Off The Grass',
  'T-shirt SURFACES Clay', 'T-Shirt CLAY SURFACES', 'Sweatshirt CLAY SURFACES', 'Polo CLAY SURFACES', 'Cap SURFACES Clay', 'Cap CLAY SURFACES',
  'SURFACES — A Decade On Court', 'GRASS Tee — SURFACES by DOUBLEU', 'GRASS Sweatshirt — SURFACES by DOUBLEU',
  'GRASS Collection — A Surfaces Capsule by DOUBLEU', 'CLAY — A Surfaces Capsule',
  ...Array.from({ length: 9 }, (_, i) => `DOUBLEU Lookbook 0${i + 1}`),
]);

// Titoli italiani dei case study usati come headline nei dati strutturati
const CASE_HEADLINES = {
  'casestudies/mtc-ausstellungspark.html': 'DOUBLEU × MTC Ausstellungspark (Monaco di Baviera) — Abbigliamento Personalizzato per Tennis Club',
  'casestudies/all-round.html': 'DOUBLEU × All Round Sport & Wellness (Roma) — Abbigliamento Personalizzato Tennis e Padel',
  'casestudies/snauwaert.html': 'DOUBLEU × SNAUWAERT — Sviluppo e Produzione Apparel Tennis Made in Italy',
};

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

// ---------------------------------------------------------------- utilità

const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true }); fs.writeFileSync(path.join(ROOT, p), s); };
const escText = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = s => escText(s).replace(/"/g, '&quot;');
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function loadTranslations() {
  const src = read('assets/js/i18n.js');
  const m = src.match(/const TRANSLATIONS\s*=\s*(\{[\s\S]*?\n\});/);
  if (!m) throw new Error('TRANSLATIONS non trovato in assets/js/i18n.js');
  return vm.runInNewContext('(' + m[1] + ')');
}

// Stessa logica di t() in i18n.js
const tr = (T, key, lang) => (T[lang] && T[lang][key]) || T.it[key] || key;

// URL pubblico di una pagina in una lingua
function publicPath(page, lang) {
  const p = page === 'index.html' ? '' : page;
  return '/' + (lang === 'it' ? '' : lang + '/') + p;
}
const publicUrl = (page, lang) => SITE + publicPath(page, lang);

// ------------------------------------------------- traduzione del markup

// Trova gli elementi con data-i18n / data-i18n-html e l'intervallo del loro contenuto.
function findI18nElements(html) {
  const found = [];
  const stack = [];
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt === -1) break;
    if (html.startsWith('<!--', lt)) { i = html.indexOf('-->', lt) + 3; continue; }
    if (html[lt + 1] === '!') { i = html.indexOf('>', lt) + 1; continue; }
    // fine del tag, rispettando le virgolette degli attributi
    let j = lt + 1, quote = null;
    while (j < html.length) {
      const c = html[j];
      if (quote) { if (c === quote) quote = null; }
      else if (c === '"' || c === "'") quote = c;
      else if (c === '>') break;
      j++;
    }
    const tag = html.slice(lt, j + 1);
    i = j + 1;
    const close = tag.match(/^<\/([a-zA-Z0-9-]+)/);
    if (close) {
      const name = close[1].toLowerCase();
      const idx = stack.map(e => e.name).lastIndexOf(name);
      if (idx !== -1) {
        const el = stack[idx];
        stack.length = idx;
        if (el.key) found.push({ ...el, innerEnd: lt });
      }
      continue;
    }
    const open = tag.match(/^<([a-zA-Z0-9-]+)/);
    if (!open) continue;
    const name = open[1].toLowerCase();
    if (name === 'script' || name === 'style') {
      i = html.toLowerCase().indexOf('</' + name, i);
      continue;
    }
    if (VOID.has(name) || tag.endsWith('/>')) continue;
    const text = tag.match(/\sdata-i18n="([^"]+)"/);
    const rich = tag.match(/\sdata-i18n-html="([^"]+)"/);
    // come in applyTranslations: data-i18n-html viene applicato dopo, quindi prevale
    const key = rich ? rich[1] : text ? text[1] : null;
    stack.push({ name, key, html: !!rich, innerStart: i });
  }
  return found;
}

function translateMarkup(html, T, lang) {
  // contenuti: si applicano dal fondo, saltando gli elementi annidati in uno già tradotto
  const els = findI18nElements(html).sort((a, b) => a.innerStart - b.innerStart);
  const outer = [];
  for (const el of els) {
    const parent = outer[outer.length - 1];
    if (parent && el.innerStart >= parent.innerStart && el.innerEnd <= parent.innerEnd) continue;
    outer.push(el);
  }
  for (const el of outer.reverse()) {
    const val = tr(T, el.key, lang);
    if (!val) continue;
    html = html.slice(0, el.innerStart) + (el.html ? val : escText(val)) + html.slice(el.innerEnd);
  }
  // placeholder
  html = html.replace(/(<[^>]*\sdata-i18n-placeholder="([^"]+)"[^>]*>)/g, (tag, _t, key) =>
    tag.replace(/\splaceholder="[^"]*"/, ` placeholder="${escAttr(tr(T, key, lang))}"`));
  return html;
}

// Testi alternativi delle immagini: da i18n.js se coincidono con un testo italiano, altrimenti da ALT_TEXT
function translateAlts(html, page, lang, T) {
  const fromI18n = new Map();
  for (const [key, it] of Object.entries(T.it)) if (T[lang][key] && !fromI18n.has(it)) fromI18n.set(it, T[lang][key]);
  return html.replace(/(<img\b[^>]*?\salt=")([^"]*)(")/g, (m, pre, raw, post) => {
    const alt = decode(raw);
    const val = ALT_TEXT[alt]?.[lang] ?? fromI18n.get(alt);
    if (val !== undefined) return pre + escAttr(val) + post;
    if (!ALT_KEEP.has(alt)) console.warn(`  ! ${lang}/${page}: alt non tradotto: "${alt}"`);
    return m;
  });
}

// ---------------------------------------------------------- head e link

function alternatesBlock(page) {
  const links = ['it', ...LANGS].map(l => `  <link rel="alternate" hreflang="${l}" href="${publicUrl(page, l)}" />`);
  links.push(`  <link rel="alternate" hreflang="x-default" href="${publicUrl(page, 'it')}" />`);
  return '<!-- i18n:alternates -->\n' + links.join('\n') + '\n  <!-- /i18n:alternates -->';
}

function setAlternates(html, page) {
  html = html.replace(/\n[ \t]*<!-- i18n:alternates -->[\s\S]*?<!-- \/i18n:alternates -->/, '');
  return html.replace(/(<link rel="canonical"[^>]*>)/, `$1\n  ${alternatesBlock(page)}`);
}

// Link del selettore lingua verso le versioni della pagina (utili anche ai crawler)
const setLangSwitchLinks = (html, page) =>
  html.replace(/<a href="[^"]*" data-lang="(it|en|de|es)">/g, (_m, l) => `<a href="${publicPath(page, l)}" data-lang="${l}">`);

function setMeta(html, attr, name, value) {
  const re = new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`);
  if (!re.test(html)) return html;
  return html.replace(re, `$1${escAttr(value)}$2`);
}

// Link interni (href) verso pagine tradotte: puntano alla versione nella stessa lingua
function rewriteLinks(html, page, lang) {
  const base = new URL(page, SITE + '/');
  return html.replace(/(<a\b[^>]*?\shref=")([^"]*)(")/g, (m, pre, href, post) => {
    if (/\sdata-lang="/.test(m)) return m;
    if (href.startsWith('#')) return pre + publicPath(page, lang) + href + post;
    if (/^(?:[a-z]+:|\/\/)/i.test(href) && !href.startsWith(SITE)) return m;
    const u = new URL(href, base);
    if (u.origin !== SITE) return m;
    let target = u.pathname.replace(/^\//, '');
    if (target === '') target = 'index.html';
    if (!PAGES[target]) return m;
    return pre + publicPath(target, lang) + u.search + u.hash + post;
  });
}

// ------------------------------------------------------ dati strutturati

function translateJsonLd(html, page, lang, textMap) {
  const urlMap = new Map(Object.keys(PAGES).map(p => [publicUrl(p, 'it'), publicUrl(p, lang)]));
  const walk = (v, inOrg) => {
    if (Array.isArray(v)) return v.map(x => walk(x, inOrg));
    if (v && typeof v === 'object') {
      const org = inOrg || v['@type'] === 'Organization' || v['@type'] === 'WebSite' || /#organization$/.test(v['@id'] || '');
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, org)]));
    }
    if (typeof v !== 'string') return v;
    if (v === IN_LANGUAGE.it) return IN_LANGUAGE[lang];
    if (textMap.has(v)) return textMap.get(v);
    if (!inOrg && urlMap.has(v)) return urlMap.get(v);
    if (!inOrg && v.startsWith(publicUrl('club.html', 'it') + '#')) return v.replace(publicUrl('club.html', 'it'), publicUrl('club.html', lang));
    return v;
  };
  const untranslated = new Set();
  const out = html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (m, a, body, c) => {
    if (body.includes('${')) return m;
    const source = JSON.parse(body);
    const data = walk(source, false);
    // segnala i testi italiani rimasti uguali all'originale (lunghi e con spazi: non nomi propri o URL);
    // il confronto con l'originale evita falsi allarmi su parole comuni ad altre lingue (es. "la", "con")
    const itStrings = new Set();
    JSON.stringify(source, (k, v) => { if (typeof v === 'string') itStrings.add(v); return v; });
    JSON.stringify(data, (k, v) => {
      if (typeof v === 'string' && itStrings.has(v) && v.includes(' ') && !v.startsWith('http') && /[àèìòù]|\b(di|per|e|il|la|con)\b/.test(v)) untranslated.add(v);
      return v;
    });
    return a + '\n' + JSON.stringify(data, null, 2).replace(/^/gm, '  ') + '\n  ' + c;
  });
  return { html: out, untranslated };
}

// --------------------------------------------------------------- pagine

function buildPage(page, lang, T) {
  const src = read(page);
  const [title, desc] = PAGES[page][lang];
  const dir = path.posix.dirname(page);

  const itTitle = decode(src.match(/<title>([^<]*)<\/title>/)[1]);
  const itDesc = decode(src.match(/<meta name="description" content="([^"]*)"/)[1]);

  // mappa testi italiani -> lingua, per i dati strutturati
  const textMap = new Map();
  for (const [key, it] of Object.entries(T.it)) {
    const v = T[lang][key];
    if (v && !textMap.has(it)) textMap.set(it, v);
  }
  for (const [it, byLang] of Object.entries(JSONLD_TEXT)) textMap.set(it, byLang[lang]);
  for (const [p, headline] of Object.entries(CASE_HEADLINES)) textMap.set(headline, PAGES[p][lang][0]);
  for (const [p, langs] of Object.entries(PAGES)) {
    const s = read(p);
    textMap.set(decode(s.match(/<meta name="description" content="([^"]*)"/)[1]), langs[lang][1]);
  }
  textMap.set(itTitle, title);
  textMap.set(itDesc, desc);

  let html = translateMarkup(src, T, lang);

  html = html.replace(/<html lang="it">/, `<html lang="${lang}" data-i18n-fixed>`);
  // i percorsi relativi (asset, script, pagine non tradotte) restano quelli della pagina italiana
  html = html.replace(/<head>\n/, `<head>\n  <base href="/${dir === '.' ? '' : dir + '/'}" />\n`);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escText(title)}</title>`);
  html = setMeta(html, 'name', 'description', desc);
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', desc);
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'name', 'twitter:description', desc);
  html = setMeta(html, 'property', 'og:url', publicUrl(page, lang));
  html = setMeta(html, 'property', 'og:locale', OG_LOCALE[lang]);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${publicUrl(page, lang)}$2`);
  html = setAlternates(html, page);
  html = rewriteLinks(html, page, lang);
  html = translateAlts(html, page, lang, T);
  html = setLangSwitchLinks(html, page);

  const res = translateJsonLd(html, page, lang, textMap);
  for (const s of res.untranslated) console.warn(`  ! ${lang}/${page}: testo italiano nei dati strutturati: "${s.slice(0, 80)}"`);

  const banner = `<!-- Generato da scripts/build-i18n.mjs a partire da /${page}: non modificare a mano -->\n`;
  return res.html.replace(/^<!doctype html>\n/i, m => m + banner);
}

// ------------------------------------------------------------- sitemap

function buildSitemap() {
  const xml = read('sitemap.xml');
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => {
    const get = t => (m[1].match(new RegExp(`<${t}>([^<]*)</${t}>`)) || [])[1];
    return { loc: get('loc'), lastmod: get('lastmod'), changefreq: get('changefreq'), priority: get('priority') };
  }).filter(e => !LANGS.some(l => e.loc.startsWith(`${SITE}/${l}/`)));

  const pageOf = loc => {
    const p = loc.slice(SITE.length + 1) || 'index.html';
    return PAGES[p] ? p : null;
  };
  const entry = (loc, e, page) => {
    let s = `  <url>\n    <loc>${loc}</loc>\n`;
    if (page) {
      for (const l of ['it', ...LANGS]) s += `    <xhtml:link rel="alternate" hreflang="${l}" href="${publicUrl(page, l)}"/>\n`;
      s += `    <xhtml:link rel="alternate" hreflang="x-default" href="${publicUrl(page, 'it')}"/>\n`;
    }
    s += `    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>\n`;
    return s;
  };

  let out = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n';
  for (const e of entries) out += entry(e.loc, e, pageOf(e.loc)) + '\n';
  for (const l of LANGS) {
    for (const e of entries) {
      const page = pageOf(e.loc);
      if (page) out += entry(publicUrl(page, l), e, page) + '\n';
    }
  }
  return out + '</urlset>\n';
}

// ---------------------------------------------------------------- main

const T = loadTranslations();
for (const page of Object.keys(PAGES)) {
  // pagina italiana: hreflang e link del selettore lingua
  const it = setLangSwitchLinks(setAlternates(read(page), page), page);
  if (it !== read(page)) write(page, it);
  for (const lang of LANGS) {
    write(path.posix.join(lang, page), buildPage(page, lang, T));
  }
  console.log(`ok  ${page}`);
}
write('sitemap.xml', buildSitemap());
console.log('ok  sitemap.xml');
