# Analytics — DOUBLEU

Gestione centralizzata delle analytics del sito. Tutta la logica vive in un
unico file: **`assets/js/analytics.js`** (incluso in tutte le pagine HTML).

## Strumenti attivi

| Strumento | Cookie | Consenso | Note |
|---|---|---|---|
| **Google Analytics 4** | Sì | Richiesto (opt-in) | Misurazione principale + e-commerce |
| **Vercel Web Analytics** | No (cookieless) | Non richiesto | Traffico di base, sempre attivo |

- **Proprietà GA4:** DOUBLEU Shop
- **Measurement ID:** `G-F44GWBQ30C` (impostato in `assets/js/analytics.js`)
- **URL stream:** https://www.doubleutennis.com

## Privacy / GDPR

GA4 usa cookie, quindi parte **solo dopo il consenso esplicito** dell'utente:

- **Google Consent Mode v2** con default `denied`.
- Banner cookie multilingua (IT/EN/DE) mostrato alla prima visita.
- La scelta è salvata nel cookie `cookie_consent` (1 anno), coerente con `cookie.html`.
- IP anonimizzato (`anonymize_ip: true`).

## Eventi e-commerce tracciati

Eventi standard GA4 (valuta EUR), generati dagli helper di `DWAnalytics`:

| Evento | Dove scatta |
|---|---|
| `view_item` | Pagine prodotto (wfox / club / surfaces / grass) |
| `add_to_cart` | `Cart.add()` in `assets/js/cart.js` (tutte le pagine prodotto) |
| `view_cart` | `carrello.html` (al caricamento) |
| `remove_from_cart` | `Cart.remove()` in `assets/js/cart.js` |
| `begin_checkout` | `checkout.html` |
| `purchase` | `order-success.html` (importo reale del PaymentIntent Stripe, deduplicato per ordine) |

### Tracciare un evento custom

```js
DWAnalytics.track('nome_evento', { chiave: 'valore' });
```

## Manutenzione

- **Cambiare ID GA4:** modifica `GA4_ID` in cima a `assets/js/analytics.js`.
- **Aggiungere un evento del funnel:** usa gli helper `DWAnalytics.*` (un solo punto, niente snippet duplicati nelle pagine).
- **Riaprire il banner consenso:** `DWAnalytics.openConsent()`.

> Nota: su `carrello.html`, `checkout.html`, `order-success.html` e le 4 pagine
> prodotto, `analytics.js` è caricato **prima** dello script inline, così gli
> eventi generati al caricamento (es. `view_item`, `view_cart`) trovano
> `DWAnalytics` già disponibile.

## Verifica (dopo il deploy)

1. Apri il sito e **accetta** i cookie sul banner.
2. GA4 → **DebugView** (usa l'estensione Chrome "Google Analytics Debugger") o
   **Rapporti in tempo reale**.
3. Naviga: prodotto → carrello → checkout → ordine, e controlla gli eventi.
4. GA4 → **Amministrazione → Eventi**: marca `purchase` come evento chiave/conversione.
