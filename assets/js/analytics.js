/* =========================================================================
   DOUBLEU – Analytics & Cookie Consent (centralizzato)
   -------------------------------------------------------------------------
   Punto unico di gestione delle analytics del sito.
   - Vercel Web Analytics: cookieless, sempre attivo (caricato in pagina).
   - Google Analytics 4 (GA4): basato su cookie -> caricato SOLO dopo consenso
     esplicito dell'utente (Google Consent Mode v2, default "denied").
   - Banner cookie GDPR coerente con la cookie policy (cookie "cookie_consent").

   PER ATTIVARE GA4: incolla qui sotto il tuo Measurement ID (formato G-XXXXXXXX).
   Lo trovi in Google Analytics > Amministrazione > Flussi di dati > Web.
   Finché resta il placeholder, il banner funziona ma GA4 non viene caricato.
   ========================================================================= */
(function () {
  'use strict';

  // --- CONFIG ---------------------------------------------------------------
  const GA4_ID = 'G-XXXXXXXXXX';            // <-- INSERISCI QUI il tuo ID GA4
  const CONSENT_KEY = 'cookie_consent';     // chiave/cookie come da cookie policy
  const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 1 anno (vedi cookie.html)

  const isPlaceholder = !GA4_ID || GA4_ID.indexOf('XXXX') !== -1;

  // --- i18n del banner (allineato a dw-lang: it | en | de) ------------------
  const I18N = {
    it: {
      text: 'Usiamo cookie tecnici necessari e, previo tuo consenso, cookie analitici per migliorare il sito.',
      accept: 'Accetta',
      reject: 'Rifiuta',
      policy: 'Cookie Policy',
    },
    en: {
      text: 'We use necessary technical cookies and, with your consent, analytics cookies to improve the site.',
      accept: 'Accept',
      reject: 'Decline',
      policy: 'Cookie Policy',
    },
    de: {
      text: 'Wir verwenden notwendige technische Cookies und – mit Ihrer Zustimmung – Analyse-Cookies zur Verbesserung der Website.',
      accept: 'Akzeptieren',
      reject: 'Ablehnen',
      policy: 'Cookie-Richtlinie',
    },
  };

  function lang() {
    const l = (localStorage.getItem('dw-lang') || 'it').slice(0, 2);
    return I18N[l] ? l : 'it';
  }

  // --- Storage del consenso (localStorage + cookie first-party) -------------
  function getConsent() {
    try {
      const v = localStorage.getItem(CONSENT_KEY);
      if (v === 'granted' || v === 'denied') return v;
    } catch (e) {}
    const m = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function storeConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
    document.cookie = CONSENT_KEY + '=' + value + ';path=/;max-age=' +
      CONSENT_MAX_AGE + ';SameSite=Lax';
  }

  // --- Google Consent Mode v2 -----------------------------------------------
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  // Default: tutto negato finché l'utente non accetta (richiesto da GDPR).
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  });

  let ga4Loaded = false;
  function loadGA4() {
    if (ga4Loaded || isPlaceholder) {
      if (isPlaceholder) {
        console.info('[analytics] GA4 non caricato: imposta GA4_ID in assets/js/analytics.js');
      }
      return;
    }
    ga4Loaded = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA4_ID, { anonymize_ip: true }); // IP anonimizzato (vedi cookie policy)
  }

  function grant() {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
    loadGA4();
  }

  /* ---- Helper e-commerce (eventi GA4 standard, valuta EUR) ----------------
     Gli eventi vengono inviati solo se l'utente ha dato il consenso e GA4 è
     caricato; in caso contrario restano inerti (corretto a livello GDPR). */
  const CURRENCY = 'EUR';

  // Converte un articolo del carrello (cart.js) in un item GA4.
  function toItem(ci) {
    return {
      item_id: ci.id,
      item_name: ci.name,
      item_variant: [ci.color, ci.size].filter(Boolean).join(' / '),
      price: ci.price,
      quantity: ci.qty || 1,
    };
  }

  function cartValue(items) {
    return items.reduce(function (n, i) { return n + i.price * (i.qty || 1); }, 0);
  }

  window.DWAnalytics = {
    track: function (name, params) { gtag('event', name, params || {}); },
    openConsent: function () { showBanner(); },

    addToCart: function (cartItem) {
      gtag('event', 'add_to_cart', {
        currency: CURRENCY,
        value: cartItem.price * (cartItem.qty || 1),
        items: [toItem(cartItem)],
      });
    },

    beginCheckout: function (cartItems, value) {
      const items = (cartItems || []).map(toItem);
      gtag('event', 'begin_checkout', {
        currency: CURRENCY,
        value: typeof value === 'number' ? value : cartValue(cartItems || []),
        items: items,
      });
    },

    // Visualizzazione scheda prodotto. Accetta un prodotto (products.js) o un cart item.
    viewItem: function (product, price) {
      const p = typeof price === 'number'
        ? price
        : (product.basePrice || (product.colors && product.colors[0] && product.colors[0].price) || product.price || 0);
      gtag('event', 'view_item', {
        currency: CURRENCY,
        value: p,
        items: [{ item_id: product.id, item_name: product.name, price: p, quantity: 1 }],
      });
    },

    viewCart: function (cartItems) {
      gtag('event', 'view_cart', {
        currency: CURRENCY,
        value: cartValue(cartItems || []),
        items: (cartItems || []).map(toItem),
      });
    },

    removeFromCart: function (cartItem) {
      gtag('event', 'remove_from_cart', {
        currency: CURRENCY,
        value: cartItem.price * (cartItem.qty || 1),
        items: [toItem(cartItem)],
      });
    },

    purchase: function (data) {
      // data: { transactionId, value, currency, shipping, items: [cartItems] }
      gtag('event', 'purchase', {
        transaction_id: data.transactionId,
        currency: data.currency || CURRENCY,
        value: data.value,
        shipping: data.shipping || 0,
        items: (data.items || []).map(toItem),
      });
    },
  };

  // --- Banner ----------------------------------------------------------------
  function showBanner() {
    if (document.getElementById('dw-cookie-banner')) return;
    const tr = I18N[lang()];

    const css = document.createElement('style');
    css.textContent =
      '#dw-cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;' +
      'background:#0d1b2a;color:#f5f0e8;font-family:Montserrat,system-ui,sans-serif;' +
      'padding:18px 24px;display:flex;flex-wrap:wrap;align-items:center;gap:16px 24px;' +
      'box-shadow:0 -2px 24px rgba(0,0,0,.25)}' +
      '#dw-cookie-banner p{margin:0;flex:1 1 320px;font-size:12.5px;line-height:1.6;' +
      'color:rgba(245,240,232,.85)}' +
      '#dw-cookie-banner a{color:#f5f0e8;text-decoration:underline}' +
      '#dw-cookie-banner .dw-cc-actions{display:flex;gap:10px;flex-wrap:wrap}' +
      '#dw-cookie-banner button{font-family:inherit;font-size:10px;font-weight:600;' +
      'letter-spacing:.18em;text-transform:uppercase;padding:11px 22px;cursor:pointer;' +
      'border:1px solid #f5f0e8;background:transparent;color:#f5f0e8;transition:.2s}' +
      '#dw-cookie-banner button.dw-cc-accept{background:#f5f0e8;color:#0d1b2a}' +
      '#dw-cookie-banner button:hover{opacity:.82}';
    document.head.appendChild(css);

    const el = document.createElement('div');
    el.id = 'dw-cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookie consent');
    el.innerHTML =
      '<p>' + tr.text + ' <a href="cookie.html">' + tr.policy + '</a></p>' +
      '<div class="dw-cc-actions">' +
      '<button class="dw-cc-reject">' + tr.reject + '</button>' +
      '<button class="dw-cc-accept">' + tr.accept + '</button>' +
      '</div>';
    document.body.appendChild(el);

    el.querySelector('.dw-cc-accept').addEventListener('click', function () {
      storeConsent('granted');
      grant();
      el.remove();
    });
    el.querySelector('.dw-cc-reject').addEventListener('click', function () {
      storeConsent('denied');
      el.remove();
    });
  }

  // --- Bootstrap -------------------------------------------------------------
  function init() {
    const consent = getConsent();
    if (consent === 'granted') {
      grant();           // l'utente aveva già accettato in una visita precedente
    } else if (consent !== 'denied') {
      showBanner();      // nessuna scelta ancora: mostra il banner
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
