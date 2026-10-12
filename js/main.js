// СТРУМ — логіка сторінки
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const money = (n) => `${Math.round(n).toLocaleString('uk-UA')} ₴`;

/* ---------- Шапка ---------- */
const header = $('#header');
const burger = $('.burger');
addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 20), { passive: true });
burger.addEventListener('click', () => {
  const open = header.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', open);
});
$$('.nav a').forEach((a) => a.addEventListener('click', () => {
  header.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
}));

// Підсвічування пункту меню поточної секції
const sections = $$('main section[id]');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) $$('.nav a').forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach((s) => navObserver.observe(s));

/* ---------- Hero ---------- */
$('#hero-art').innerHTML = bikeSVG('#d4ff3a', 'offroad');

/* ---------- Моделі ---------- */
let activeType = 'all';
const grid = $('#models-grid');
const filter = $('#type-filter');

filter.innerHTML = Object.entries(TYPES).map(([id, label]) =>
  `<button role="tab" data-type="${id}" class="${id === activeType ? 'is-active' : ''}" aria-selected="${id === activeType}">${label}</button>`).join('');

function renderModels() {
  const list = BIKES.filter((b) => activeType === 'all' || b.type === activeType);
  grid.innerHTML = list.map((b, i) => `
    <article class="model" style="--model-color:${b.color};animation-delay:${i * 60}ms">
      <div class="model__art">${bikeSVG(b.color, b.type)}<span class="model__tag">${b.tag}</span></div>
      <div class="model__body">
        <h3>${b.name}</h3>
        <p>${b.text}</p>
        <dl class="specs">
          <div><dt>Швидкість</dt><dd>${b.speed} км/г</dd></div>
          <div><dt>Запас ходу</dt><dd>${b.range} км</dd></div>
          <div><dt>Мотор</dt><dd>${b.motor}</dd></div>
        </dl>
        <div class="model__foot">
          <div class="model__price"><b>${money(b.price)}</b><span>або оренда від ${money(b.rent)}/доба</span></div>
          <div class="model__actions">
            <a href="#rent" class="btn btn--ghost btn--small" data-rent="${b.id}">Оренда</a>
            <a href="#contact" class="btn btn--small" data-buy="${b.id}">Купити</a>
          </div>
        </div>
      </div>
    </article>`).join('');
}

function setType(type) {
  activeType = type;
  $$('button', filter).forEach((b) => {
    const on = b.dataset.type === type;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-selected', on);
  });
  renderModels();
}

filter.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-type]');
  if (btn) setType(btn.dataset.type);
});
$$('[data-filter-link]').forEach((a) => a.addEventListener('click', () => setType(a.dataset.filterLink)));

grid.addEventListener('click', (e) => {
  const rent = e.target.closest('[data-rent]');
  if (rent) { $('#rent-bike').value = rent.dataset.rent; updateRent(); }
  const buy = e.target.closest('[data-buy]');
  if (buy) {
    const bike = BIKES.find((b) => b.id === buy.dataset.buy);
    prefillBooking('buy', `Покупка: ${bike.name} — ${money(bike.price)}`);
  }
});

/* ---------- Оренда ---------- */
const rentForm = $('#rent-form');
$('#rent-bike').innerHTML = BIKES.map((b) => `<option value="${b.id}">${b.name} — ${money(b.rent)}/доба</option>`).join('');
$('#rent-extras').innerHTML = RENT.extras.map((x) =>
  `<label class="chip"><input type="checkbox" name="extra" value="${x.id}"><span>${x.label} <small>+${x.perDay} ₴/доба</small></span></label>`).join('');

let rentQuote = null;
function updateRent() {
  const bike = BIKES.find((b) => b.id === rentForm.bike.value);
  const days = Number(rentForm.days.value);
  const base = bike.rent * days;
  const disc = RENT.discounts.find((d) => days >= d.from);
  const discount = disc ? base * disc.percent / 100 : 0;
  const extras = $$('input[name="extra"]:checked', rentForm)
    .reduce((s, i) => s + RENT.extras.find((x) => x.id === i.value).perDay * days, 0);
  const total = base - discount + extras;

  $('#days-out').textContent = `${days} ${days === 1 ? 'день' : days < 5 ? 'дні' : 'днів'}`;
  $('#r-base').textContent = `${money(bike.rent)} × ${days} = ${money(base)}`;
  $('#r-discount-row').hidden = !disc;
  if (disc) { $('#r-discount-label').textContent = `Знижка ${disc.label}`; $('#r-discount').textContent = `−${money(discount)}`; }
  $('#r-extras').textContent = extras ? money(extras) : '—';
  $('#r-total').textContent = money(total);
  $('#r-deposit').textContent = `+ застава ${money(RENT.deposit)}, повертається після оренди`;
  rentQuote = { bike, days, total };
}
rentForm.addEventListener('input', updateRent);
updateRent();

/* ---------- Конфігуратор ---------- */
const cfg = { frame: 'street', motor: 1500, battery: 20, color: CONFIG.color[0], extras: new Set() };
const configForm = $('#config-form');

$$('[data-group]', configForm).forEach((group) => {
  const key = group.dataset.group;
  group.innerHTML = CONFIG[key].map((o) => `
    <button type="button" class="tile" data-value="${o.id}" aria-pressed="false">
      <b>${o.label}</b><span>${o.price ? '+' + money(o.price) : 'базово'}</span>
    </button>`).join('');
});
$('#swatches').innerHTML = CONFIG.color.map((c) => `<button type="button" class="swatch" style="background:${c}" data-color="${c}" aria-label="Колір ${c}"></button>`).join('');
$('#config-extras').innerHTML = CONFIG.extras.map((x) =>
  `<label class="chip"><input type="checkbox" value="${x.id}"><span>${x.label} <small>+${money(x.price)}</small></span></label>`).join('');

function pick(key) { return CONFIG[key].find((o) => String(o.id) === String(cfg[key])); }

function cfgTotal() {
  return CONFIG.base + pick('frame').price + pick('motor').price + pick('battery').price
    + [...cfg.extras].reduce((s, id) => s + CONFIG.extras.find((x) => x.id === id).price, 0);
}

function renderConfig() {
  $$('[data-group]', configForm).forEach((group) => {
    $$('.tile', group).forEach((t) => {
      const on = t.dataset.value === String(cfg[group.dataset.group]);
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-pressed', on);
    });
  });
  $$('.swatch').forEach((s) => s.classList.toggle('is-active', s.dataset.color === cfg.color));
  $('#config-art').innerHTML = bikeSVG(cfg.color, cfg.frame === 'enduro' ? 'offroad' : 'city');
  $('.config__preview').style.setProperty('--cfg-color', cfg.color);
  $('#c-speed').textContent = `${pick('motor').speed} км/г`;
  $('#c-range').textContent = `${Math.round(pick('battery').range * (cfg.motor >= 5000 ? 0.85 : 1))} км`;
  $('#c-total').textContent = money(cfgTotal());
}

configForm.addEventListener('click', (e) => {
  const tile = e.target.closest('.tile');
  if (tile) { cfg[tile.parentElement.dataset.group] = tile.dataset.value; renderConfig(); }
  const sw = e.target.closest('.swatch');
  if (sw) { cfg.color = sw.dataset.color; renderConfig(); }
});
$('#config-extras').addEventListener('change', (e) => {
  e.target.checked ? cfg.extras.add(e.target.value) : cfg.extras.delete(e.target.value);
  renderConfig();
});
renderConfig();

/* ---------- Запис ---------- */
const booking = $('#booking');
const DRAFT_KEY = 'strum-booking-draft';

function prefillBooking(topic, summary) {
  booking.topic.value = topic;
  const box = $('#booking-summary');
  box.hidden = false;
  box.textContent = summary;
  booking.comment.value = summary;
}

$$('[data-book]').forEach((btn) => btn.addEventListener('click', () => {
  if (btn.dataset.book === 'rent') {
    prefillBooking('rent', `Оренда: ${rentQuote.bike.name}, ${rentQuote.days} дн. — ${money(rentQuote.total)}`);
  } else {
    const extras = [...cfg.extras].map((id) => CONFIG.extras.find((x) => x.id === id).label);
    prefillBooking('custom', `Збірка: рама ${pick('frame').label}, мотор ${pick('motor').label}, батарея ${pick('battery').label}${extras.length ? ', ' + extras.join(', ') : ''} — ${money(cfgTotal())}`);
  }
  $('#contact').scrollIntoView();
  setTimeout(() => booking.name.focus({ preventScroll: true }), 600);
}));

// Мінімальна дата — сьогодні
booking.date.min = new Date().toISOString().slice(0, 10);

// Чернетка форми в localStorage
try {
  const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
  ['name', 'phone'].forEach((k) => { if (draft[k]) booking[k].value = draft[k]; });
} catch { /* ignore */ }
booking.addEventListener('input', () => {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ name: booking.name.value, phone: booking.phone.value })); } catch { /* ignore */ }
});

function setError(field, message) {
  const error = field.closest('.label')?.querySelector('.error');
  field.classList.toggle('is-invalid', !!message);
  if (error) error.textContent = message || '';
}

booking.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = booking.name.value.trim();
  const phone = booking.phone.value.replace(/[\s()-]/g, '');
  let ok = true;
  if (name.length < 2) { setError(booking.name, 'Вкажіть імʼя'); ok = false; } else setError(booking.name, '');
  if (!/^\+?\d{10,13}$/.test(phone)) { setError(booking.phone, 'Перевірте номер: наприклад +380 67 123 45 67'); ok = false; } else setError(booking.phone, '');
  if (!booking.agree.checked) { toast('Поставте галочку згоди'); ok = false; }
  if (!ok) { booking.querySelector('.is-invalid')?.focus(); return; }

  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  booking.classList.add('is-sent');
  booking.innerHTML = `
    <div>
      <div style="font-size:56px">⚡</div>
      <h3 class="section__title" style="font-size:40px">Заявку прийнято!</h3>
      <p class="muted" style="margin-top:12px">${name.replace(/[<>&"]/g, '')}, ми передзвонимо протягом 15 хвилин у робочий час.<br>(Це демо — насправді заявка нікуди не надсилається.)</p>
    </div>`;
});

function toast(text) {
  const el = $('#toast');
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { el.hidden = true; }, 2500);
}

/* ---------- Анімація появи ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.12 });
$$('.section__head, .format, .calc, .config, .steps li, .service__card, .faq, .contact > *').forEach((el) => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

$('#year').textContent = new Date().getFullYear();
