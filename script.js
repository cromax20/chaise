/* =========================================================
   CONFIGURATION — tout se modifie ici
   ========================================================= */
const CONFIG = {
  brand: 'Aquavéa',
  // Prix à l'unité : servent à calculer la « valeur » (prix barré) des kits.
  unit: { pommeau: 34.9, cartridge: 12.9, strips: 6.9, hose: 9.9 },
  subPrice: 9.9,                 // prix d'une cartouche en abonnement (tous les 3 mois)
  offers: [
    { id: 'essentiel', title: 'Essentiel', sub: 'Pommeau + 1 cartouche', price: 34.9,
      items: { pommeau: 1, cartridge: 0, strips: 0, hose: 0 } },
    { id: 'complet', title: 'Kit Complet', sub: 'Pommeau + 3 cartouches + flexible + test de dureté', price: 49.9,
      items: { pommeau: 1, cartridge: 2, strips: 1, hose: 1 }, tag: 'Le plus choisi · 9 mois de filtration', default: true },
    { id: 'duo', title: 'Duo 2 salles de bain', sub: '2 Kits Complets', price: 89.9,
      items: { pommeau: 2, cartridge: 4, strips: 2, hose: 2 } },
  ],
  kitContents: [
    ['🚿', '<b>1 pommeau haute pression</b> 3 jets avec bouton stop'],
    ['🧩', '<b>3 cartouches 15 étapes</b> (1 installée + 2 de rechange)'],
    ['➰', '<b>1 flexible inox 1,5 m</b> anti-torsion'],
    ['🧪', '<b>Bandelettes de test</b> de dureté de l\'eau'],
    ['🔧', '<b>Ruban téflon + joints</b> pour une installation sans fuite'],
    ['📘', '<b>Guide illustré</b> d\'installation en 2 minutes'],
  ],
  specs: [
    ['Raccord', 'Standard G1/2" (universel BE/FR)'],
    ['Filtration', '15 étapes (PP, charbon actif, KDF-55, résine, vitamine C…)'],
    ['Jets', '3 modes + bouton stop'],
    ['Durée d\'une cartouche', '≈ 2 à 3 mois'],
    ['Matériaux', 'ABS sans BPA, finition chromée'],
    ['Flexible', 'Inox, 1,5 m'],
  ],
  // Dureté de l'eau (°f) — valeurs indicatives sourcées (voir README). min/max = fourchette, avg = valeur typique.
  regions: [
    { name: 'Bruxelles', flag: '🇧🇪', min: 14, max: 40, avg: 35, note: 'Selon la commune, de 14 à plus de 40 °f. Une grande partie de la Région dépasse 30 °f (ex. Etterbeek ≈ 39,5 °f).' },
    { name: 'Wallonie', flag: '🇧🇪', min: 20, max: 40, avg: 30, note: 'Environ 30 °f en moyenne, avec de fortes différences entre communes.' },
    { name: 'Flandre', flag: '🇧🇪', min: 20, max: 40, avg: 32, note: 'Souvent entre 27 et 37 °f selon la localité.' },
    { name: 'Lille / Nord', flag: '🇫🇷', min: 25, max: 45, avg: 35, note: 'Moyenne du département du Nord ≈ 35 °f : eau très dure.' },
    { name: 'Paris', flag: '🇫🇷', min: 19, max: 28, avg: 23, note: 'De 19 à 28 °f selon le réseau, ≈ 23 °f en moyenne.' },
    { name: 'Strasbourg', flag: '🇫🇷', min: 21, max: 32, avg: 26, note: 'De 21 à 32 °f, ≈ 26 °f en moyenne.' },
    { name: 'Marseille', flag: '🇫🇷', min: 17, max: 24, avg: 20, note: 'Entre 17 et 24 °f selon les quartiers.' },
  ],
  // Calculateur d'économies — À ADAPTER au débit réel annoncé par votre fournisseur.
  calc: {
    flowUs: 8,                          // L/min du pommeau Aquavéa
    waterPrice: { BE: 5.5, FR: 4.7 },   // €/m³ (moyennes estimées)
    energyPrice: { BE: 0.25, FR: 0.22 },// €/kWh, moyenne gaz/électricité pour l'eau chaude
    kwhPerM3: 30,                       // chauffer 1 m³ de 12 °C à 38 °C ≈ 30 kWh
  },
  promoEnd: '2026-12-31T23:59:59',   // date réelle de fin de l'offre de lancement
  deliveryDays: [5, 10],
  checkoutUrl: '',                    // lien Shopify / Stripe Payment Link — vide = mode démo
  // AVIS : ajoutez UNIQUEMENT de vrais avis clients. La section reste masquée tant que la liste est vide.
  // Format : { name: 'Julie M.', stars: 5, title: '…', text: '…' }
  reviews: [],
};

/* ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const eur = (n) => n.toLocaleString('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(',00', '') + ' €';
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
// Essentiel inclut 1 cartouche déjà montée dans le pommeau : la valeur du pommeau la comprend.
const offerValue = (o) => Object.entries(o.items).reduce((s, [k, q]) => s + CONFIG.unit[k] * q, 0);
const offerById = (id) => CONFIG.offers.find(o => o.id === id);

const state = {
  offer: (CONFIG.offers.find(o => o.default) || CONFIG.offers[0]).id,
  sub: true,
  cart: store.get('aquavea-cart', []),
};

/* ---------- Offres & prix ---------- */
function renderOffers() {
  $('[data-bundles]').innerHTML = CONFIG.offers.map(o => {
    const v = offerValue(o), save = v - o.price;
    return `<label class="bundle">
      ${o.tag ? `<span class="bundle__tag">${o.tag}</span>` : ''}
      <input type="radio" name="offer" value="${o.id}" ${o.id === state.offer ? 'checked' : ''}>
      <span><span class="bundle__title">${o.title}</span><span class="bundle__sub">${o.sub}</span></span>
      <span class="bundle__price">${eur(o.price)}${save > 0.5 ? `<s>${eur(v)}</s><small>-${eur(save)}</small>` : ''}</span>
    </label>`;
  }).join('');
  $$('[name="offer"]').forEach(r => r.addEventListener('change', () => { state.offer = r.value; renderPrices(); }));
}

function renderPrices() {
  const o = offerById(state.offer), v = offerValue(o), save = v - o.price;
  $('[data-price]').textContent = eur(o.price);
  $('[data-compare]').textContent = save > 0.5 ? eur(v) : '';
  $('[data-save]').textContent = save > 0.5 ? `Économisez ${eur(save)}` : 'Prix de lancement';
  $('[data-save]').hidden = false;
  $('[data-badge]').textContent = save > 0.5 ? `-${Math.round(save / v * 100)}%` : 'Nouveau';
  $('[data-installment]').textContent = eur(Math.round(o.price / 3 * 100) / 100);
  $('[data-cta-price]').textContent = eur(o.price);

  const complet = offerById('complet');
  $$('[data-offer-price="complet"]').forEach(e => e.textContent = eur(complet.price));
  $$('[data-offer-value="complet"]').forEach(e => e.textContent = eur(offerValue(complet)));
  $$('[data-offer-badge]').forEach(e => e.textContent = `-${Math.round((1 - complet.price / offerValue(complet)) * 100)}%`);
  $$('[data-sub-price]').forEach(e => e.textContent = eur(CONFIG.subPrice));
  $$('[data-cartridge-price]').forEach(e => e.textContent = eur(CONFIG.unit.cartridge));
  $('[data-sub-saving]').textContent = `-${Math.round((1 - CONFIG.subPrice / CONFIG.unit.cartridge) * 100)}%`;
}

function renderContent() {
  $('[data-kit-list]').innerHTML = CONFIG.kitContents.map(([i, t]) => `<li><span>${i}</span><span>${t}</span></li>`).join('');
  $('[data-specs]').innerHTML = CONFIG.specs.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');

  if (CONFIG.reviews.length) {
    const avg = CONFIG.reviews.reduce((s, r) => s + r.stars, 0) / CONFIG.reviews.length;
    $('[data-reviews-section]').hidden = false;
    $('[data-rating-link]').hidden = false;
    $('[data-rating]').textContent = avg.toFixed(1).replace('.', ',');
    $('[data-review-count]').textContent = CONFIG.reviews.length;
    $('[data-reviews]').innerHTML = CONFIG.reviews.map(r => `
      <article class="review">
        <div class="review__head"><span class="review__name">${r.name}</span><span class="review__verified">✔ Achat vérifié</span></div>
        <div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
        <h4>${r.title}</h4><p>${r.text}</p>
      </article>`).join('');
  }
}

/* ---------- Galerie ---------- */
function initGallery() {
  const main = $('[data-main-img]');
  const cap = $('[data-gallery-caption]');
  $$('[data-thumb]').forEach(t => t.addEventListener('click', () => {
    $$('[data-thumb]').forEach(x => x.classList.remove('is-active'));
    t.classList.add('is-active'); main.src = t.dataset.thumb;
    main.parentElement.classList.toggle('is-cover', 'cover' in t.dataset);
    cap.innerHTML = (t.dataset.caption || '').split('|').map(s => `<span>${s}</span>`).join('');
  }));
}

/* ---------- Urgence honnête : vraie date de fin + date de livraison ---------- */
function initTiming() {
  const end = new Date(CONFIG.promoEnd).getTime();
  const tick = () => {
    let d = Math.max(0, end - Date.now());
    const days = Math.floor(d / 864e5); d %= 864e5;
    const h = String(Math.floor(d / 36e5)).padStart(2, '0');
    const m = String(Math.floor(d % 36e5 / 6e4)).padStart(2, '0');
    const s = String(Math.floor(d % 6e4 / 1e3)).padStart(2, '0');
    $$('[data-countdown]').forEach(e => e.textContent = (days ? `${days}j ` : '') + `${h}:${m}:${s}`);
    const cd = { d: String(days).padStart(2, '0'), h, m, s };
    Object.entries(cd).forEach(([k, v]) => { const el = $(`[data-cd-${k}]`); if (el) el.textContent = v; });
  };
  tick(); setInterval(tick, 1000);
  const addBD = (n) => { const d = new Date(); while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) n--; } return d; };
  const fmt = (d) => d.toLocaleDateString('fr-BE', { weekday: 'short', day: 'numeric', month: 'short' });
  $('[data-eta]').textContent = `${fmt(addBD(CONFIG.deliveryDays[0]))} et le ${fmt(addBD(CONFIG.deliveryDays[1]))}`;
}

/* ---------- Dureté par région ---------- */
function hardnessLabel(f) {
  if (f < 15) return ['Douce', '#7fc8a9'];
  if (f < 20) return ['Peu calcaire', '#a8d08d'];
  if (f < 30) return ['Moyennement dure', '#f2c94c'];
  if (f < 40) return ['Dure', '#ff9a5c'];
  return ['Très dure', '#e5533c'];
}
function initRegions() {
  const list = $('[data-regions]'), card = $('[data-region-card]');
  list.innerHTML = CONFIG.regions.map((r, i) => {
    const [, c] = hardnessLabel(r.avg);
    return `<button class="region" role="tab" data-region="${i}"><span>${r.flag} ${r.name}</span><b style="--c:${c}">${r.avg} °f</b></button>`;
  }).join('');
  const show = (i) => {
    const r = CONFIG.regions[i], [label, c] = hardnessLabel(r.avg);
    $$('.region', list).forEach((b, j) => b.classList.toggle('is-active', i === j));
    const pos = (v) => Math.min(100, v / 45 * 100);
    card.innerHTML = `
      <p class="hc__place">${r.flag} ${r.name}</p>
      <div class="hc__value" style="--c:${c}"><strong>${r.avg}</strong><span>°f</span></div>
      <p class="hc__label" style="--c:${c}">${label}</p>
      <div class="hc__gauge"><span class="hc__range" style="left:${pos(r.min)}%;width:${pos(r.max) - pos(r.min)}%"></span><span class="hc__pin" style="left:${pos(r.avg)}%"></span></div>
      <p class="hc__note">${r.note}</p>
      <p class="hc__eq">≈ <b>${Math.round(r.avg * 10 * 0.08)} g</b> de calcaire dans l'eau de chaque douche de 8 min*</p>
      <a href="#acheter" class="btn btn--primary">Protéger ma peau et mes cheveux</a>
      <p class="hc__small">*${r.avg} °f = ${r.avg * 10} mg de calcaire par litre, pour ≈ 80 L d'eau.</p>`;
  };
  $$('.region', list).forEach(b => b.addEventListener('click', () => show(+b.dataset.region)));
  show(0);
}

/* ---------- Calculateur d'économies ---------- */
function initCalc() {
  const s = { people: 2, min: 8, flow: 12, country: 'BE' };
  const C = CONFIG.calc;
  const fmtL = (n) => Math.round(n).toLocaleString('fr-BE');
  const update = () => {
    $('[data-out="people"]').textContent = s.people;
    $('[data-out="min"]').textContent = s.min + ' min';
    const showers = s.people * 365;
    const now = showers * s.min * s.flow, us = showers * s.min * C.flowUs;
    const saved = Math.max(0, now - us), m3 = saved / 1000;
    const water = m3 * C.waterPrice[s.country], energy = m3 * C.kwhPerM3 * C.energyPrice[s.country];
    const total = water + energy;
    $('[data-res="liters"]').textContent = fmtL(saved);
    $('[data-res="water"]').textContent = eur(Math.round(water));
    $('[data-res="energy"]').textContent = eur(Math.round(energy));
    $('[data-res="total"]').textContent = eur(Math.round(total));
    const kit = offerById('complet').price;
    $('[data-res="payback"]').textContent = total > 0 ? `Le Kit Complet est rentabilisé en ${Math.max(1, Math.round(kit / total * 12))} mois environ.` : '';
    $('[data-res="now"]').textContent = fmtL(now / 1000) + ' m³';
    $('[data-res="us"]').textContent = fmtL(us / 1000) + ' m³';
    $('[data-bar="now"]').style.width = '100%';
    $('[data-bar="us"]').style.width = (us / now * 100) + '%';
    $('[data-res="flow"]').textContent = C.flowUs;
    $('[data-res="pw"]').textContent = eur(C.waterPrice[s.country]);
    $('[data-res="pe"]').textContent = eur(C.energyPrice[s.country]);
  };
  $$('[data-calc]').forEach(i => i.addEventListener('input', () => { s[i.dataset.calc] = +i.value; update(); }));
  const seg = (sel, key, attr, num) => $$(`${sel} button`).forEach(b => b.addEventListener('click', () => {
    $$(`${sel} button`).forEach(x => x.classList.remove('is-active')); b.classList.add('is-active');
    s[key] = num ? +b.dataset[attr] : b.dataset[attr]; update();
  }));
  seg('[data-calc-flow]', 'flow', 'flow', true);
  seg('[data-calc-country]', 'country', 'country', false);
  update();
}

/* ---------- Quiz « Votre eau est-elle trop dure ? » ---------- */
const QUIZ = [
  { q: 'Voyez-vous des traces blanches sur votre paroi de douche ou vos robinets ?', a: [['Oui, très vite', 3], ['Un peu', 2], ['Rarement', 0]] },
  { q: 'Votre peau tiraille-t-elle en sortant de la douche ?', a: [['Oui, souvent', 3], ['Parfois', 1], ['Jamais', 0]] },
  { q: 'Comment sont vos cheveux après le lavage ?', a: [['Ternes ou rêches', 3], ['Ça dépend', 1], ['Doux et brillants', 0]] },
  { q: 'Sentez-vous une odeur de chlore sous la douche ?', a: [['Oui', 2], ['Légèrement', 1], ['Non', 0]] },
  { q: 'Votre bouilloire ou votre pommeau s\'entartre-t-il ?', a: [['Oui, en quelques semaines', 3], ['Au bout de quelques mois', 1], ['Pas vraiment', 0]] },
];
function initQuiz() {
  const body = $('[data-quiz-body]'), bar = $('[data-quiz-bar]');
  let step = 0, score = 0;
  const max = QUIZ.reduce((s, x) => s + Math.max(...x.a.map(a => a[1])), 0);
  const render = () => {
    bar.style.width = (step / QUIZ.length * 100) + '%';
    if (step < QUIZ.length) {
      const { q, a } = QUIZ[step];
      body.innerHTML = `<p class="quiz__step">Question ${step + 1} sur ${QUIZ.length}</p><p class="quiz__q">${q}</p>
        <div class="quiz__opts">${a.map(([t, p]) => `<button class="quiz__opt" data-p="${p}">${t}</button>`).join('')}</div>`;
      $$('.quiz__opt', body).forEach(b => b.addEventListener('click', () => { score += +b.dataset.p; step++; render(); }));
      return;
    }
    const pct = Math.round(score / max * 100);
    const [title, text] = pct >= 60
      ? ['Votre eau est probablement dure 💧', 'Vos réponses correspondent aux signes typiques d\'une eau calcaire et chlorée. Un pommeau filtrant devrait faire une vraie différence sur votre peau et vos cheveux. Le Kit Complet inclut la bandelette pour confirmer la mesure.']
      : pct >= 30
      ? ['Votre eau est moyennement dure', 'Quelques signes d\'eau calcaire ou chlorée. Un filtre vous apportera surtout plus de douceur et moins de chlore. Vérifiez avec la bandelette du Kit Complet.']
      : ['Votre eau semble plutôt douce 👍', 'Bonne nouvelle : peu de signes d\'eau dure. Un filtre reste utile contre le chlore, mais ce n\'est pas une urgence pour vous.'];
    body.innerHTML = `<div class="quiz__result"><p class="quiz__step">Résultat</p><h3>${title}</h3>
      <div class="meter"><span style="left:0"></span></div><p>${text}</p>
      <a href="#acheter" class="btn btn--primary btn--xl" data-quiz-cta>Voir le Kit Complet</a>
      <button class="quiz__restart" data-quiz-restart>Refaire le test</button></div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => $('.meter span', body).style.left = Math.max(4, Math.min(96, pct)) + '%'));
    $('[data-quiz-cta]').addEventListener('click', () => { state.offer = 'complet'; renderOffers(); renderPrices(); });
    $('[data-quiz-restart]').addEventListener('click', () => { step = 0; score = 0; render(); });
  };
  render();
}

/* ---------- Panier ---------- */
const saveCart = () => { store.set('aquavea-cart', state.cart); renderCart(); };
function addItem(item) {
  const f = state.cart.find(x => x.id === item.id);
  f ? f.qty += item.qty : state.cart.push(item);
  saveCart();
}
function renderCart() {
  $('[data-cart-count]').textContent = state.cart.reduce((s, x) => s + x.qty, 0);
  $('[data-cart-items]').innerHTML = state.cart.length ? state.cart.map((x, i) => `
    <div class="line">
      <img src="assets/pommeau.svg" alt="">
      <div><div class="line__name">${x.name}</div><div class="line__var">${x.variant || ''}</div>
        ${x.recurring ? '' : `<div class="qty"><button data-dec="${i}" aria-label="Moins">−</button><span>${x.qty}</span><button data-inc="${i}" aria-label="Plus">+</button></div>`}
      </div>
      <div class="line__price">${x.recurring ? '0 € aujourd\'hui' : eur(x.unit * x.qty)}<button class="line__remove" data-rm="${i}">Retirer</button></div>
    </div>`).join('') : '<p class="empty">Votre panier est vide.</p>';
  const total = state.cart.filter(x => !x.recurring).reduce((s, x) => s + x.unit * x.qty, 0);
  $('[data-cart-total]').textContent = eur(total);
  const sub = state.cart.find(x => x.recurring);
  $('[data-cart-subnote]').textContent = sub ? `Puis ${eur(sub.unit * sub.qty)} tous les 3 mois pour vos cartouches, sans engagement.` : '';
  $('[data-upsell]').hidden = !state.cart.length || state.cart.some(x => x.id === 'cartridge');
}
const openCart = () => { $('[data-drawer]').classList.add('is-open'); $('[data-overlay]').classList.add('is-open'); };
const closeCart = () => { $('[data-drawer]').classList.remove('is-open'); $('[data-overlay]').classList.remove('is-open'); };
function toast(msg) { const t = $('[data-toast]'); t.textContent = msg; t.classList.add('is-visible'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('is-visible'), 2600); }

function initCart() {
  $('[data-sub-toggle]').addEventListener('change', e => state.sub = e.target.checked);
  $('[data-add-to-cart]').addEventListener('click', () => {
    const o = offerById(state.offer);
    addItem({ id: `offer-${o.id}`, name: `${CONFIG.brand} — ${o.title}`, variant: o.sub, unit: o.price, qty: 1 });
    if (state.sub) {
      const pommeaux = state.cart.filter(x => x.id.startsWith('offer-')).reduce((s, x) => s + offerById(x.id.slice(6)).items.pommeau * x.qty, 0);
      state.cart = state.cart.filter(x => x.id !== 'sub');
      state.cart.push({ id: 'sub', name: 'Abonnement cartouches', variant: `${pommeaux} cartouche(s) tous les 3 mois · 1er envoi dans 3 mois`, unit: CONFIG.subPrice, qty: pommeaux, recurring: true });
      saveCart();
    }
    openCart();
  });
  $('[data-open-cart]').addEventListener('click', openCart);
  $('[data-close-cart]').addEventListener('click', closeCart);
  $('[data-overlay]').addEventListener('click', closeCart);
  document.addEventListener('keydown', e => e.key === 'Escape' && closeCart());
  $('[data-add-upsell]').addEventListener('click', () => addItem({ id: 'cartridge', name: 'Cartouche 15 étapes', variant: 'Recharge', unit: CONFIG.unit.cartridge, qty: 1 }));
  $('[data-cart-items]').addEventListener('click', e => {
    const d = e.target.dataset, i = +(d.inc ?? d.dec ?? d.rm);
    if (Number.isNaN(i)) return;
    if (d.inc) state.cart[i].qty++;
    if (d.dec) state.cart[i].qty--;
    if (d.rm !== undefined || state.cart[i].qty <= 0) state.cart.splice(i, 1);
    if (!state.cart.some(x => x.id.startsWith('offer-'))) state.cart = state.cart.filter(x => x.id !== 'sub');
    saveCart();
  });
  $('[data-checkout]').addEventListener('click', () => {
    if (!state.cart.length) return toast('Votre panier est vide');
    if (CONFIG.checkoutUrl) location.href = CONFIG.checkoutUrl;
    else toast('Mode démo : renseignez checkoutUrl dans script.js');
  });
  renderCart();
}

function initMisc() {
  const sticky = $('[data-sticky]'), anchor = $('[data-add-to-cart]');
  new IntersectionObserver(([e]) => sticky.classList.toggle('is-visible', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(anchor);
  $('[data-year]').textContent = new Date().getFullYear();
  $('[data-newsletter]').addEventListener('submit', e => { e.preventDefault(); e.target.reset(); toast('Merci ! Votre code -10 % arrive par e-mail.'); });
}

/* =========================================================
   SIMULATION DE DOUCHE (canvas par-dessus assets/douche.svg)
   Coordonnées dans le repère 800×600 de l'image.
   ========================================================= */
const SCENE = { w: 800, h: 600, head: { x: 570, y: 180, rx: 46, ry: 18, rot: -38 }, floor: 532, glass: { x: 44, y: 26, w: 232, h: 500 } };
const MODES = {
  classic: { spawn: 15, speed: [6, 8], spread: 15, chlore: 0.1, calc: 0.06, flow: 12 },
  aquavea: { spawn: 10, speed: [9, 11.5], spread: 7, chlore: 0.008, calc: 0.025, flow: 8 },
};
function seeded(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

class ShowerScene {
  constructor(el, opts = {}) {
    this.el = el; this.cv = $('canvas', el); this.ctx = this.cv.getContext('2d');
    this.mode = opts.mode || 'aquavea'; this.weeks = opts.weeks || 0; this.on = true;
    this.parts = []; this.steam = []; this.visible = true;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.glassLayer = document.createElement('canvas');
    new ResizeObserver(() => this.resize()).observe(el);
    new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible) this.loop(); }).observe(el);
    this.resize();
  }
  resize() {
    const dpr = Math.min(2, devicePixelRatio || 1);
    const w = this.el.clientWidth, h = this.el.clientHeight;
    this.cv.width = w * dpr; this.cv.height = h * dpr;
    // l'image est en object-fit: cover → calcule l'échelle et le décalage
    this.k = Math.max(w / SCENE.w, h / SCENE.h) * dpr;
    this.ox = (w * dpr - SCENE.w * this.k) / 2; this.oy = (h * dpr - SCENE.h * this.k) / 2;
    this.glassLayer.width = this.cv.width; this.glassLayer.height = this.cv.height;
    this.drawGlass();
  }
  setMode(m) { this.mode = m; this.drawGlass(); }
  setWeeks(w) { this.weeks = w; this.drawGlass(); }
  drawGlass() {
    const c = this.glassLayer.getContext('2d'), g = SCENE.glass;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.glassLayer.width, this.glassLayer.height);
    c.setTransform(this.k, 0, 0, this.k, this.ox, this.oy);
    const rnd = seeded(42), n = Math.round(this.weeks * 55 * (this.mode === 'classic' ? 1 : 0.35));
    for (let i = 0; i < n; i++) {
      const x = g.x + rnd() * g.w, y = g.y + g.h * (0.25 + 0.75 * Math.sqrt(rnd())), r = 1 + rnd() * 4.5;
      const grd = c.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, 'rgba(255,255,255,.15)'); grd.addColorStop(.7, 'rgba(255,255,255,.55)'); grd.addColorStop(1, 'rgba(170,180,185,.6)');
      c.fillStyle = grd; c.beginPath(); c.ellipse(x, y, r, r * (0.8 + rnd() * 0.3), 0, 0, 7); c.fill();
      if (rnd() < 0.06) { c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - .5) * 3, y + 15 + rnd() * 40); c.stroke(); }
    }
    if (n > 0) { c.fillStyle = `rgba(235,240,240,${Math.min(.22, n / 3000)})`; c.fillRect(g.x, g.y + g.h * .55, g.w, g.h * .45); }
  }
  spawn() {
    const m = MODES[this.mode], h = SCENE.head, a = h.rot * Math.PI / 180;
    for (let i = 0; i < m.spawn; i++) {
      const u = (Math.random() * 2 - 1), v = (Math.random() * 2 - 1) * 0.6;
      const x = h.x + u * h.rx * Math.cos(a) - v * h.ry * Math.sin(a);
      const y = h.y + u * h.rx * Math.sin(a) + v * h.ry * Math.cos(a);
      const ang = (108 + (Math.random() * 2 - 1) * m.spread + u * 6) * Math.PI / 180;
      const sp = m.speed[0] + Math.random() * (m.speed[1] - m.speed[0]);
      const r = Math.random();
      const type = r < m.chlore ? 'chlore' : r < m.chlore + m.calc ? 'calc' : 'water';
      this.parts.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, type, life: 1, splash: false });
    }
  }
  step() {
    if (this.on) this.spawn();
    const fl = SCENE.floor;
    for (const p of this.parts) {
      p.vy += p.splash ? 0.35 : 0.22; p.x += p.vx; p.y += p.vy;
      if (p.splash) p.life -= 0.06;
      else if (p.y > fl) {
        p.life = 0;
        if (Math.random() < 0.35) this.parts.push({ x: p.x, y: fl - 1, vx: (Math.random() - .5) * 4, vy: -1.5 - Math.random() * 2.5, type: 'water', life: 1, splash: true });
        if (this.on && Math.random() < 0.01 && this.steam.length < 26) this.steam.push({ x: p.x + (Math.random() - .5) * 80, y: fl - 10, r: 30 + Math.random() * 40, a: 0 });
      }
    }
    this.parts = this.parts.filter(p => p.life > 0 && p.x > -20 && p.x < SCENE.w + 20);
    for (const s of this.steam) { s.y -= 0.5; s.x += 0.15; s.a = Math.min(0.08, s.a + 0.002); s.r += 0.15; }
    this.steam = this.steam.filter(s => s.y > 60);
  }
  draw() {
    const c = this.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.cv.width, this.cv.height);
    c.drawImage(this.glassLayer, 0, 0);
    c.setTransform(this.k, 0, 0, this.k, this.ox, this.oy);
    for (const s of this.steam) { c.fillStyle = `rgba(255,255,255,${s.a})`; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 7); c.fill(); }
    c.lineCap = 'round';
    for (const p of this.parts) {
      if (p.type === 'water') {
        c.strokeStyle = p.splash ? `rgba(190,230,238,${p.life * .8})` : (this.mode === 'aquavea' ? 'rgba(170,228,240,.75)' : 'rgba(190,215,220,.6)');
        c.lineWidth = p.splash ? 1.4 : 1.6;
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 1.6, p.y - p.vy * 1.6); c.stroke();
      } else {
        c.fillStyle = p.type === 'chlore' ? 'rgba(124,196,72,.95)' : 'rgba(255,255,255,.98)';
        c.strokeStyle = p.type === 'chlore' ? 'rgba(70,130,40,.9)' : 'rgba(120,130,135,.9)';
        c.lineWidth = 1; c.beginPath(); c.arc(p.x, p.y, p.type === 'chlore' ? 3 : 2.6, 0, 7); c.fill(); c.stroke();
      }
    }
  }
  loop() {
    if (this._raf || !this.visible) return;
    const tick = () => {
      this._raf = null;
      if (!this.visible) return;
      this.step(); this.draw();
      if (this.reduced && this.parts.length > 400) return; // une image fixe suffit
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }
}

function initSim() {
  new ShowerScene($('[data-scene="hero"]'), { mode: 'aquavea' });
  const sim = new ShowerScene($('[data-scene="sim"]'), { mode: 'aquavea', weeks: 4 });
  const C = CONFIG.calc, perM3 = C.waterPrice.BE + C.kwhPerM3 * C.energyPrice.BE, hardness = 0.35; // g/L à 35 °f
  MODES.aquavea.flow = C.flowUs;
  $('[data-sim-flow-us]').textContent = C.flowUs; $('[data-sim-flow-classic]').textContent = MODES.classic.flow;
  const max = { liters: 20 * 8, cost: 20 * 8 / 1000 * perM3, calc: 20 * 8 * hardness };
  const set = (k, txt, pct) => { $(`[data-sim="${k}"]`).textContent = txt; const b = $(`[data-simbar="${k}"]`); if (b) b.style.width = Math.min(100, pct) + '%'; };
  const reset = () => { set('liters', '0 L', 0); set('cost', eur(0), 0); set('calc', '0 g', 0); set('chlore', '—', 0); $('[data-sim-clock]').textContent = '0:00'; };
  let run = null;
  $$('[data-sim-mode] button').forEach(b => b.addEventListener('click', () => {
    $$('[data-sim-mode] button').forEach(x => x.classList.remove('is-active')); b.classList.add('is-active');
    sim.setMode(b.dataset.mode); if (run) { cancelAnimationFrame(run); run = null; } reset();
    $('[data-sim-run]').textContent = '▶ Lancer une douche de 8 min';
  }));
  const weeks = $('[data-sim-weeks]');
  weeks.addEventListener('input', () => {
    const w = +weeks.value; sim.setWeeks(w);
    $('[data-sim-weeks-out]').textContent = w === 0 ? 'nettoyage' : `${w} semaine${w > 1 ? 's' : ''}`;
  });
  $('[data-sim-run]').addEventListener('click', (e) => {
    if (run) return;
    const mode = sim.mode, flow = MODES[mode].flow, t0 = performance.now(), btn = e.currentTarget;
    btn.textContent = '⏳ Douche en cours…';
    set('chlore', mode === 'classic' ? 'Élevé' : 'Fortement réduit', mode === 'classic' ? 100 : 12);
    const frame = (now) => {
      const min = Math.min(8, (now - t0) / 1000), L = flow * min;
      set('liters', `${Math.round(L)} L`, L / max.liters * 100);
      set('cost', eur(Math.round(L / 1000 * perM3 * 100) / 100), L / 1000 * perM3 / max.cost * 100);
      set('calc', `${(L * hardness).toFixed(1).replace('.', ',')} g`, L * hardness / max.calc * 100);
      $('[data-sim-clock]').textContent = `${Math.floor(min)}:${String(Math.floor(min % 1 * 60)).padStart(2, '0')}`;
      if (min < 8) { run = requestAnimationFrame(frame); return; }
      run = null; btn.textContent = '↻ Relancer la douche';
      $(`[data-cmp="${mode}-l"]`).textContent = `${Math.round(L)} L`;
      $(`[data-cmp="${mode}-c"]`).textContent = eur(Math.round(L / 1000 * perM3 * 100) / 100);
      const other = mode === 'classic' ? 'aquavea' : 'classic';
      if ($(`[data-cmp="${other}-l"]`).textContent === '—') toast(`Essayez maintenant en mode « ${other === 'classic' ? 'Pommeau classique' : 'Aquavéa'} » pour comparer`);
    };
    run = requestAnimationFrame(frame);
  });
  reset();
}

/* ---------- Avant / Après ---------- */
function baSVG(kind, dirty) {
  const rnd = seeded(dirty ? 7 : 11);
  if (kind === 'glass') {
    let spots = '';
    const n = dirty ? 900 : 160;
    for (let i = 0; i < n; i++) {
      const x = rnd() * 1000, y = 500 * (0.15 + 0.85 * Math.sqrt(rnd())), r = 1.5 + rnd() * (dirty ? 7 : 4);
      spots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#sp)"/>`;
      if (dirty && rnd() < 0.05) spots += `<path d="M${x} ${y} q ${(rnd() - .5) * 6} 30 ${(rnd() - .5) * 4} ${40 + rnd() * 60}" stroke="rgba(255,255,255,.45)" stroke-width="2" fill="none"/>`;
    }
    return `<svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs>
      <pattern id="t${dirty}" width="100" height="50" patternUnits="userSpaceOnUse"><rect width="100" height="50" fill="#e9e6e0"/><rect x="2" y="2" width="96" height="21" rx="2" fill="#f6f4f0"/><rect x="-48" y="27" width="96" height="21" rx="2" fill="#f3f1ec"/><rect x="52" y="27" width="96" height="21" rx="2" fill="#f6f4f0"/></pattern>
      <radialGradient id="sp"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".75" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#9aa5ab" stop-opacity=".7"/></radialGradient>
      <linearGradient id="gl${dirty}" x1="0" x2="1"><stop offset="0" stop-color="#bfe6ec" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#a6dbe3" stop-opacity=".45"/></linearGradient></defs>
      <rect width="1000" height="500" fill="url(#t${dirty})"/><rect width="1000" height="500" fill="url(#gl${dirty})"/>
      ${dirty ? '<rect y="260" width="1000" height="240" fill="#f2f4f4" opacity=".35"/>' : '<path d="M80 0 L220 0 L60 500 L-80 500Z" fill="#fff" opacity=".25"/>'}
      ${spots}</svg>`;
  }
  let nubs = '';
  const rings = [[0, 1], [55, 8], [110, 16], [165, 24], [215, 30]];
  for (const [rr, n] of rings) for (let k = 0; k < n; k++) {
    const a = 2 * Math.PI * k / n + rr, x = 500 + rr * Math.cos(a), y = 250 + rr * Math.sin(a) * 0.95;
    const blocked = dirty && rnd() < 0.45;
    nubs += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="url(#nb)"/>`;
    nubs += blocked ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(9 + rnd() * 9).toFixed(1)}" fill="#f4f1e8" stroke="#d7d0bf" stroke-width="2" opacity=".95"/>` : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#56636c"/>`;
  }
  let crust = '';
  if (dirty) for (let i = 0; i < 70; i++) { const a = rnd() * 7, r = rnd() * 230; crust += `<circle cx="${(500 + Math.cos(a) * r).toFixed(1)}" cy="${(250 + Math.sin(a) * r * .95).toFixed(1)}" r="${(4 + rnd() * 16).toFixed(1)}" fill="#efe9da" opacity="${(.3 + rnd() * .4).toFixed(2)}"/>`; }
  return `<svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs>
    <radialGradient id="fc" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#fff"/><stop offset=".85" stop-color="#e2e8ec"/><stop offset="1" stop-color="#c3ccd2"/></radialGradient>
    <radialGradient id="nb" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#c3ccd3"/><stop offset="1" stop-color="#7c8892"/></radialGradient>
    <linearGradient id="cr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7f9fa"/><stop offset=".3" stop-color="#b9c3cb"/><stop offset=".5" stop-color="#fff"/><stop offset=".8" stop-color="#8f9ba5"/><stop offset="1" stop-color="#dfe5e9"/></linearGradient></defs>
    <rect width="1000" height="500" fill="#dfeef1"/><circle cx="500" cy="250" r="280" fill="url(#cr)"/><circle cx="500" cy="250" r="250" fill="url(#fc)"/>${crust}${nubs}</svg>`;
}
function initBA() {
  const frame = $('[data-ba-frame]'), before = $('[data-ba-before]'), after = $('[data-ba-after]'), range = $('[data-ba-range]'), handle = $('[data-ba-handle]');
  const render = (k) => { before.innerHTML = baSVG(k, true); after.innerHTML = baSVG(k, false); };
  const move = () => { before.style.clipPath = `inset(0 ${100 - range.value}% 0 0)`; handle.style.left = range.value + '%'; };
  range.addEventListener('input', move);
  $$('[data-ba-tabs] button').forEach(b => b.addEventListener('click', () => {
    $$('[data-ba-tabs] button').forEach(x => x.classList.remove('is-active')); b.classList.add('is-active'); render(b.dataset.ba);
  }));
  render('glass'); move();
  // petite animation d'invitation au premier affichage
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return; o.disconnect();
    let t = 0; const id = setInterval(() => { t += 1; range.value = 50 + Math.sin(t / 8) * 22; move(); if (t > 50) { clearInterval(id); range.value = 50; move(); } }, 30);
  }, { threshold: .5 }).observe(frame);
}

renderOffers(); renderPrices(); renderContent(); initGallery(); initTiming(); initRegions(); initCalc(); initSim(); initBA(); initQuiz(); initCart(); initMisc();
