const Cart = {
  KEY: 'dw_cart',

  getAll() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch { return []; }
  },

  _save(items) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
    this.syncBadge();
  },

  add(item) {
    // item: { id, name, color, colorHex, size, price, image }
    const items = this.getAll();
    const idx = items.findIndex(i => i.id === item.id && i.color === item.color && i.size === item.size);
    if (idx > -1) { items[idx].qty += 1; }
    else { items.push({ ...item, qty: 1 }); }
    this._save(items);
  },

  updateQty(idx, qty) {
    const items = this.getAll();
    if (qty < 1) { items.splice(idx, 1); }
    else { items[idx].qty = qty; }
    this._save(items);
  },

  remove(idx) {
    const items = this.getAll();
    items.splice(idx, 1);
    this._save(items);
  },

  count() { return this.getAll().reduce((n, i) => n + i.qty, 0); },

  subtotal() { return this.getAll().reduce((n, i) => n + i.price * i.qty, 0); },

  syncBadge() {
    const n = this.count();
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = n;
      el.style.display = n > 0 ? 'flex' : 'none';
    });
  },
};

document.addEventListener('DOMContentLoaded', () => Cart.syncBadge());
