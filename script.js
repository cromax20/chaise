/* =========================================================
   CONFIGURATION — modifiez ici prix, stock, specs, avis…
   ========================================================= */
const CONFIG = {
  name: 'Posturo Pro',
  price: 249,              // prix de vente (€)
  compareAt: 399,          // prix barré (€) — doit respecter la directive Omnibus (voir README)
  bundleDiscount: 0.10,    // remise supplémentaire sur le pack de 2
  freeShippingFrom: 0,     // 0 = livraison toujours offerte
  stock: 17,               // stock affiché
  stockMax: 80,
  promoEnd: '2026-12-01T23:59:59', // fin réelle de l'offre de lancement
  deliveryDays: [5, 10],   // délai de livraison (jours ouvrés)
  upsell: { name: 'Repose-pieds ergonomique', price: 29 },
  checkoutUrl: '',         // URL de paiement (Shopify, Stripe Payment Link…) — vide = message de démo
  rating: '4,8',
  reviewCount: '1 200+',
  ratingBars: [82, 12, 4, 1, 1], // % 5★ → 1★
  specs: [
    ['Hauteur totale', '118 – 128 cm'],
    ['Hauteur d\'assise', '46 – 56 cm'],
    ['Largeur d\'assise', '52 cm'],
    ['Inclinaison du dossier', '90° – 135°'],
    ['Charge maximale', '150 kg'],
    ['Vérin', 'Classe 4 certifié SGS'],
    ['Base', 'Aluminium, 5 branches'],
    ['Roulettes', 'PU silencieuses 60 mm'],
    ['Garantie', '3 ans'],
  ],
  // ⚠️ AVIS D'EXEMPLE — à remplacer par de vrais avis avant mise en ligne.
  reviews: [
    { name: 'Exemple · Julie M.', city: 'Bruxelles', stars: 5, title: 'Fini les douleurs le soir', text: 'Je télétravaille 4 jours par semaine et j\'avais mal au bas du dos tous les soirs. Après deux semaines, plus rien. Le support lombaire fait vraiment la différence.' },
    { name: 'Exemple · Thomas D.', city: 'Lille', stars: 5, title: 'Qualité bluffante pour le prix', text: 'J\'hésitais avec une chaise à 900 €. Honnêtement, je ne vois pas ce qui justifierait la différence. Montage en 15 min.' },
    { name: 'Exemple · Sarah K.', city: 'Liège', stars: 5, title: 'Parfait pour les longues sessions', text: 'Je joue et je code des heures, la maille ne tient pas chaud et l\'appui-tête est top en position inclinée.' },
    { name: 'Exemple · Marc V.', city: 'Namur', stars: 4, title: 'Très bonne chaise', text: 'Très confortable et bien finie. Livraison en 7 jours, un peu long mais ça valait le coup.' },
    { name: 'Exemple · Inès B.', city: 'Paris', stars: 5, title: 'Mon kiné l\'a validée', text: 'Je l\'ai montrée à mon kiné qui m\'a dit que les réglages étaient exactement ce qu\'il fallait. On en a pris une deuxième pour mon conjoint.' },
    { name: 'Exemple · Kevin L.', city: 'Anvers', stars: 5, title: 'Accoudoirs géniaux', text: 'Les accoudoirs 4D, c\'est un détail jusqu\'à ce qu\'on y goûte. Les épaules sont enfin détendues.' },
  ],
};

/* ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const eur = (n) => n.toLocaleString('fr-BE', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' €';
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const state = { color: 'Noir minuit', filter: 'none', bundle: 2, cart: store.get('posturo-cart', []) };

/* ---------- Prix ---------- */
function bundleTotal(q) { return q === 2 ? Math.round(CONFIG.price * 2 * (1 - CONFIG.bundleDiscount)) : CONFIG.price; }
function renderPrices() {
  $$('[data-price]').forEach(e => e.textContent = eur(CONFIG.price));
  $$('[data-compare]').forEach(e => e.textContent = eur(CONFIG.compareAt));
  $$('[data-price-cell]').forEach(e => e.textContent = eur(CONFIG.price));
  $('[data-save]').textContent = 'Économisez ' + eur(CONFIG.compareAt - CONFIG.price);
  $('[data-discount-badge]').textContent = '-' + Math.round((1 - CONFIG.price / CONFIG.compareAt) * 100) + '%';
  $('[data-installment]').textContent = eur(Math.round(CONFIG.price / 3 * 100) / 100);
  [1, 2].forEach(q => {
    $(`[data-bundle-price="${q}"]`).innerHTML = `${eur(bundleTotal(q))}<s>${eur(CONFIG.compareAt * q)}</s>`;
  });
  $('[data-cta-price]').textContent = eur(bundleTotal(state.bundle));
  $$('[data-rating]').forEach(e => e.textContent = CONFIG.rating);
  $$('[data-review-count]').forEach(e => e.textContent = CONFIG.reviewCount);
}

/* ---------- Galerie & options ---------- */
function initGallery() {
  const main = $('[data-main-img]');
  $$('[data-thumb]').forEach(t => t.addEventListener('click', () => {
    $$('[data-thumb]').forEach(x => x.classList.remove('is-active'));
    t.classList.add('is-active');
    main.src = t.dataset.thumb;
    main.style.filter = t.querySelector('img').style.filter || 'none';
  }));
  $$('.swatch').forEach(s => s.addEventListener('click', () => {
    $$('.swatch').forEach(x => x.classList.remove('is-active'));
    s.classList.add('is-active');
    state.color = s.dataset.color; state.filter = s.dataset.filter;
    $('[data-color-name]').textContent = state.color;
    main.style.filter = state.filter;
  }));
  $$('[name="bundle"]').forEach(r => r.addEventListener('change', () => {
    state.bundle = +r.value; renderPrices();
  }));
}

/* ---------- Compte à rebours, stock, livraison ---------- */
function initUrgency() {
  const end = new Date(CONFIG.promoEnd).getTime();
  const tick = () => {
    let d = Math.max(0, end - Date.now());
    const days = Math.floor(d / 864e5); d %= 864e5;
    const h = String(Math.floor(d / 36e5)).padStart(2, '0');
    const m = String(Math.floor(d % 36e5 / 6e4)).padStart(2, '0');
    const s = String(Math.floor(d % 6e4 / 1e3)).padStart(2, '0');
    const txt = (days ? days + 'j ' : '') + `${h}:${m}:${s}`;
    $$('[data-countdown]').forEach(e => e.textContent = txt);
  };
  tick(); setInterval(tick, 1000);

  $('[data-stock]').textContent = CONFIG.stock;
  $('[data-stock-bar]').style.width = Math.max(6, CONFIG.stock / CONFIG.stockMax * 100) + '%';

  const addBusinessDays = (n) => { const d = new Date(); while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) n--; } return d; };
  const fmt = (d) => d.toLocaleDateString('fr-BE', { weekday: 'short', day: 'numeric', month: 'short' });
  $('[data-eta]').textContent = `${fmt(addBusinessDays(CONFIG.deliveryDays[0]))} et le ${fmt(addBusinessDays(CONFIG.deliveryDays[1]))}`;
}

/* ---------- Specs, hotspots, avis ---------- */
function renderContent() {
  $('[data-specs]').innerHTML = CONFIG.specs.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');

  const items = $$('[data-spot-list] li'), spots = $$('[data-spot]');
  const activate = (i) => {
    items.forEach((x, j) => x.classList.toggle('is-active', i === j));
    spots.forEach((x, j) => x.classList.toggle('is-active', i === j));
  };
  spots.forEach((s, i) => s.addEventListener('click', () => activate(i)));
  items.forEach((s, i) => s.addEventListener('mouseenter', () => activate(i)));
  items.forEach((s, i) => s.addEventListener('click', () => activate(i)));
  activate(0);

  $('[data-review-bars]').innerHTML = CONFIG.ratingBars.map((p, i) =>
    `<div class="rbar"><span>${5 - i}★</span><div><span style="width:${p}%"></span></div><span>${p}%</span></div>`).join('');
  $('[data-reviews]').innerHTML = CONFIG.reviews.map((r, i) => `
    <article class="review ${i > 5 ? 'is-hidden' : ''}">
      <div class="review__head"><span class="review__name">${r.name}</span><span class="review__verified">✔ Achat vérifié</span></div>
      <div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
      <h4>${r.title}</h4><p>${r.text}</p>
      <div class="review__meta">${r.city}</div>
    </article>`).join('');
  const more = $('[data-more-reviews]');
  if (!$$('.review.is-hidden').length) more.hidden = true;
  more.addEventListener('click', () => { $$('.review.is-hidden').forEach(r => r.classList.remove('is-hidden')); more.hidden = true; });
}

/* ---------- Panier ---------- */
function saveCart() { store.set('posturo-cart', state.cart); renderCart(); }
function addItem(item) {
  const found = state.cart.find(x => x.id === item.id);
  found ? found.qty += item.qty : state.cart.push(item);
  saveCart();
}
function cartTotal() { return state.cart.reduce((s, x) => s + x.unit * x.qty, 0); }
function renderCart() {
  const count = state.cart.reduce((s, x) => s + x.qty, 0);
  $('[data-cart-count]').textContent = count;
  const list = $('[data-cart-items]');
  list.innerHTML = state.cart.length ? state.cart.map((x, i) => `
    <div class="line">
      <img src="assets/chair.svg" alt="" style="filter:${x.filter || 'none'}">
      <div>
        <div class="line__name">${x.name}</div>
        <div class="line__var">${x.variant || ''}</div>
        <div class="qty"><button data-dec="${i}">−</button><span>${x.qty}</span><button data-inc="${i}">+</button></div>
      </div>
      <div class="line__price">${eur(x.unit * x.qty)}<button class="line__remove" data-rm="${i}">Retirer</button></div>
    </div>`).join('') : '<p class="empty">Votre panier est vide.</p>';
  $('[data-cart-total]').textContent = eur(cartTotal());
  const free = CONFIG.freeShippingFrom, left = free - cartTotal();
  $('[data-ship-msg]').textContent = !free || left <= 0 ? '🎉 Vous bénéficiez de la livraison offerte !' : `Plus que ${eur(left)} pour la livraison offerte`;
  $('[data-upsell]').hidden = !state.cart.length || state.cart.some(x => x.id === 'upsell');
  $('[data-upsell-price]').textContent = eur(CONFIG.upsell.price);
}
function openCart() { $('[data-drawer]').classList.add('is-open'); $('[data-overlay]').classList.add('is-open'); }
function closeCart() { $('[data-drawer]').classList.remove('is-open'); $('[data-overlay]').classList.remove('is-open'); }
function toast(msg) { const t = $('[data-toast]'); t.textContent = msg; t.classList.add('is-visible'); setTimeout(() => t.classList.remove('is-visible'), 2400); }

function addMain() {
  const q = state.bundle;
  addItem({
    id: `chair-${state.color}-${q}`, name: q === 2 ? `${CONFIG.name} — Pack de 2` : CONFIG.name,
    variant: state.color, unit: bundleTotal(q), qty: 1, filter: state.filter,
  });
}

function initCart() {
  $$('[data-add-to-cart]').forEach(b => b.addEventListener('click', () => { addMain(); openCart(); }));
  $('[data-buy-now]').addEventListener('click', () => { addMain(); checkout(); });
  $$('[data-open-cart]').forEach(b => b.addEventListener('click', openCart));
  $('[data-close-cart]').addEventListener('click', closeCart);
  $('[data-overlay]').addEventListener('click', closeCart);
  document.addEventListener('keydown', e => e.key === 'Escape' && closeCart());
  $('[data-add-upsell]').addEventListener('click', () => addItem({ id: 'upsell', name: CONFIG.upsell.name, variant: 'Accessoire', unit: CONFIG.upsell.price, qty: 1 }));
  $('[data-cart-items]').addEventListener('click', e => {
    const t = e.target, i = +(t.dataset.inc ?? t.dataset.dec ?? t.dataset.rm);
    if (Number.isNaN(i)) return;
    if (t.dataset.inc) state.cart[i].qty++;
    if (t.dataset.dec) state.cart[i].qty--;
    if (t.dataset.rm || state.cart[i].qty <= 0) state.cart.splice(i, 1);
    saveCart();
  });
  $('[data-checkout]').addEventListener('click', checkout);
  renderCart();
}
function checkout() {
  if (!state.cart.length) return toast('Votre panier est vide');
  if (CONFIG.checkoutUrl) location.href = CONFIG.checkoutUrl;
  else toast('Démo : configurez checkoutUrl dans script.js');
}

/* ---------- Divers ---------- */
function initMisc() {
  const sticky = $('[data-sticky]'), anchor = $('[data-add-to-cart]');
  new IntersectionObserver(([e]) => sticky.classList.toggle('is-visible', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(anchor);
  $('[data-year]').textContent = new Date().getFullYear();
  $('[data-newsletter]').addEventListener('submit', e => { e.preventDefault(); e.target.reset(); toast('Merci ! Votre code -10 % arrive par e-mail.'); });
}

renderPrices(); initGallery(); initUrgency(); renderContent(); initCart(); initMisc();
