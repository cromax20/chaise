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
  $$('[data-thumb]').forEach(t => t.addEventListener('click', () => {
    $$('[data-thumb]').forEach(x => x.classList.remove('is-active'));
    t.classList.add('is-active'); main.src = t.dataset.thumb;
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

renderOffers(); renderPrices(); renderContent(); initGallery(); initTiming(); initRegions(); initCalc(); initQuiz(); initCart(); initMisc();
