/* THE RUDE STORE — магазин. Без бэкенда: корзина и избранное в localStorage, заявка уходит в мессенджер текстом. */
(function () {
'use strict';
const S = window.SHOP || {}, P = window.P || [];
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NB = '\u00a0';
const rub = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NB) + NB + '₽';
const off = p => p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
const byId = id => P.find(p => p.id === +id);
const plural = (n, a, b, c) => { const m = n % 100, d = n % 10; return (m > 10 && m < 15) ? c : d === 1 ? a : (d > 1 && d < 5) ? b : c; };
const page = document.body.dataset.page || '';
const SHOES = ['39', '40', '41', '42', '43', '44', '45', '46'], WEAR = ['S', 'M', 'L', 'XL', 'XXL'];
const sizesFor = p => p.cat === 'Обувь' ? SHOES : WEAR;
const sizeLabel = (p, s) => p.cat === 'Обувь' ? 'EU ' + s : s;

/* ---------- контакты (из config.js) ---------- */
const TG = (S.tg || '').trim(), WA = (S.wa || '').trim();
const CH = TG ? { url: TG, name: 'Telegram' } : { url: S.vk, name: 'ВКонтакте' };   // «канал» по умолчанию = VK
const MSG_URL = S.vkMsg || S.vk;

/* ---------- хранилище ---------- */
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
};
const cart = {
  all() { return store.get('trs_cart', []).filter(l => byId(l.id)); },
  save(l) { store.set('trs_cart', l); refresh(); },
  add(id, size, q = 1) { const l = this.all(), k = l.find(x => x.id === id && x.size === size); k ? k.qty += q : l.push({ id, size, qty: q }); this.save(l); },
  setQty(id, size, q) { let l = this.all(); const k = l.find(x => x.id === id && x.size === size); if (k) k.qty = Math.max(0, Math.min(9, q)); l = l.filter(x => x.qty > 0); this.save(l); },
  remove(id, size) { this.save(this.all().filter(x => !(x.id === id && x.size === size))); },
  clear() { this.save([]); },
  count() { return this.all().reduce((a, l) => a + l.qty, 0); },
  total() { return this.all().reduce((a, l) => a + byId(l.id).price * l.qty, 0); }
};
const favs = {
  all() { return store.get('trs_fav', []).filter(byId); },
  has(id) { return this.all().includes(+id); },
  toggle(id) { let l = this.all(); id = +id; l = l.includes(id) ? l.filter(x => x !== id) : [...l, id]; store.set('trs_fav', l); refresh(); return l.includes(id); }
};

/* ---------- иконки ---------- */
const I = {
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-8.6-8.6C2.2 8.2 4.3 5 7.4 5c2 0 3.4 1.2 4.6 2.8C13.2 6.2 14.6 5 16.6 5c3.1 0 5.2 3.2 4 6.4C19 15.6 12 20 12 20z"/></svg>',
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};

/* ---------- каркас: шапка, меню, поиск, корзина, футер ---------- */
const NAV = [['Новинки', 'catalog.html?sort=new'], ['Обувь', 'catalog.html?cat=' + encodeURIComponent('Обувь')], ['Одежда', 'catalog.html?cat=' + encodeURIComponent('Одежда')],
['Куртки', 'catalog.html?cat=' + encodeURIComponent('Куртки')], ['Бренды', 'index.html#brands'], ['Sale', 'catalog.html?sale=1', 's']];
const navHtml = cls => NAV.map(([t, h, c]) => `<a href="${h}"${c ? ` class="${c}"` : ''}>${t}</a>`).join('');
const lgStack = '<span class="lg stack"><span>The</span><span>Rude</span><span>Store</span></span>';

function shell() {
  const top = $('#top'), bot = $('#bot');
  if (top) top.outerHTML = `<a class="skip" href="#main">К содержимому</a>
<div class="promo"><a href="club.html">Rude Club: 500 бонусов за регистрацию</a></div>
<header class="hd"><div class="in">
<button class="ib burger" type="button" aria-label="Открыть меню" data-open="menu">${I.menu}</button>
<a class="logo" href="index.html" aria-label="The Rude Store — на главную">${lgStack}<span class="lg mono" aria-hidden="true">TRS</span></a>
<nav aria-label="Основная навигация">${navHtml()}</nav>
<div class="ic">
<button class="ib" type="button" aria-label="Поиск" data-open="search">${I.search}</button>
<a class="ib hid-m" href="club.html" aria-label="Rude Club">${I.user}</a>
<a class="ib hid-m" href="favorites.html" aria-label="Избранное">${I.heart}<span class="n" data-fav></span></a>
<button class="ib" type="button" aria-label="Корзина" data-open="cart">${I.bag}<span class="n" data-cart></span></button>
</div></div></header>`;
  const contacts = [`<a href="${esc(S.vk)}" target="_blank" rel="noopener">ВКонтакте</a>`];
  if (TG) contacts.push(`<a href="${esc(TG)}" target="_blank" rel="noopener">Telegram</a>`);
  if (WA) contacts.push(`<a href="${esc(WA)}" target="_blank" rel="noopener">WhatsApp</a>`);
  if (bot) bot.outerHTML = `<footer class="ft"><div class="cols">
<div class="brandc">${lgStack}<p>Оригинальные кроссовки и одежда из‑за рубежа. Доставка по России.</p></div>
<div><h4>Магазин</h4><a href="catalog.html?sort=new">Новинки</a><a href="catalog.html?cat=${encodeURIComponent('Обувь')}">Обувь</a><a href="catalog.html?cat=${encodeURIComponent('Одежда')}">Одежда</a><a href="catalog.html?cat=${encodeURIComponent('Куртки')}">Куртки</a><a href="catalog.html?sale=1">Sale</a></div>
<div><h4>Помощь</h4><a href="info.html#order">Как заказать</a><a href="info.html#delivery">Доставка и оплата</a><a href="info.html#original">Оригинальность</a><a href="info.html#return">Возврат</a><a href="club.html">Rude Club</a></div>
<div><h4>Связь</h4>${contacts.join('')}</div>
</div><div class="legal"><span class="todo-wrap">${esc(S.legal || '')}</span><span><a href="privacy.html">Политика обработки персональных данных</a></span><span>© ${new Date().getFullYear()} The Rude Store. Цены указаны в рублях.</span></div></footer>
<div class="veil" id="veil"></div>
<aside class="menu" id="menu" aria-label="Меню"><div class="top"><button class="ib" type="button" aria-label="Закрыть меню" data-close>${I.close}</button></div>
<nav>${navHtml()}</nav><div class="sub"><a href="favorites.html">Избранное</a><a href="club.html">Rude Club</a><a href="info.html">Доставка и оплата</a><a href="${esc(S.vk)}" target="_blank" rel="noopener">ВКонтакте</a></div></aside>
<div class="srch" id="search" role="dialog" aria-label="Поиск"><div class="row"><span class="ib" style="pointer-events:none">${I.search}</span>
<input id="q" type="search" enterkeyhint="search" placeholder="Бренд или модель" autocomplete="off" aria-label="Поиск по каталогу"><button class="ib" type="button" aria-label="Закрыть поиск" data-close>${I.close}</button></div>
<div class="res" id="qres"></div></div>
<aside class="drawer" id="cart" role="dialog" aria-label="Корзина"><div class="dr-h"><h2>Корзина</h2><button class="ib" type="button" aria-label="Закрыть корзину" data-close>${I.close}</button></div>
<div class="dr-b" id="drb"></div><div class="dr-f" id="drf"></div></aside>
<div class="toast" id="toast" role="status" aria-live="polite"></div>`;
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]');
    if (o) { e.preventDefault(); open(o.dataset.open); return; }
    if (e.target.closest('[data-close]') || e.target.id === 'veil') closeAll();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  // текущий раздел в меню
  const here = location.pathname.split('/').pop() + location.search;
  $$('.hd nav a').forEach(a => { if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page'); });
  const onScroll = () => document.body.classList.toggle('scrolled', scrollY > 60);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
}

const panels = ['menu', 'search', 'cart', 'flt'];
function open(name) {
  if (name === 'cart' && page === 'cart') { scrollTo({ top: 0 }); return; }
  closeAll(true);
  const el = $('#' + name); if (!el) return;
  if (name === 'cart') renderDrawer();
  el.classList.add('on'); $('#veil').classList.add('on'); document.body.classList.add('lock');
  if (name === 'search') { const q = $('#q'); q.value = ''; searchRes(''); setTimeout(() => q.focus(), 120); }
}
function closeAll(keep) {
  panels.forEach(n => { const el = $('#' + n); el && el.classList.remove('on'); });
  if (!keep) { $('#veil') && $('#veil').classList.remove('on'); document.body.classList.remove('lock'); }
}
let tt;
function toast(msg) { const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 3200); }

/* ---------- карточки ---------- */
function priceHtml(p) {
  return `<div class="pr"><span class="now">${rub(p.price)}</span>${p.old ? `<span class="old">${rub(p.old)}</span><span class="off">−${off(p)}%</span>` : ''}</div>`;
}
function card(p) {
  const f = favs.has(p.id), url = 'product.html?id=' + p.id;
  return `<article class="c"><a class="c-img" href="${url}" tabindex="-1" aria-hidden="true"><img loading="lazy" decoding="async" width="600" height="600" src="img/${p.img}" alt=""></a>
<button class="like" type="button" data-id="${p.id}" aria-pressed="${f}" aria-label="${f ? 'Убрать из избранного' : 'В избранное'}: ${esc(p.name)}">${I.heart}</button>
<a class="c-b" href="${url}"><div class="c-br">${esc(p.brand)}</div><h3 class="c-n">${esc(p.name)}</h3>${priceHtml(p)}</a></article>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('.like, .pdp-like'); if (!b) return;
  e.preventDefault();
  const on = favs.toggle(b.dataset.id);
  $$(`[data-id="${b.dataset.id}"].like, .pdp-like[data-id="${b.dataset.id}"]`).forEach(x => {
    x.setAttribute('aria-pressed', on);
    const nm = (byId(b.dataset.id) || {}).name || '';
    x.setAttribute('aria-label', (on ? 'Убрать из избранного: ' : 'В избранное: ') + nm);
  });
  toast(on ? 'Добавлено в избранное' : 'Убрано из избранного');
  if (page === 'favorites') renderFav();
});

/* ---------- счётчики ---------- */
function refresh() {
  const c = cart.count(), f = favs.all().length;
  $$('[data-cart]').forEach(n => { n.textContent = c; n.classList.toggle('on', c > 0); });
  $$('[data-fav]').forEach(n => { n.textContent = f; n.classList.toggle('on', f > 0); });
  const bag = $('.ib[data-open="cart"]'); if (bag) bag.setAttribute('aria-label', 'Корзина, товаров: ' + c);
  if ($('#cart') && $('#cart').classList.contains('on')) renderDrawer();
  if (page === 'cart') renderCart();
}

/* ---------- корзина-шторка и страница ---------- */
function lineHtml(l, big) {
  const p = byId(l.id);
  return `<div class="ln"><a class="im" href="product.html?id=${p.id}"><img src="img/${p.img}" alt="" width="200" height="200"></a>
<div><a class="nm" href="product.html?id=${p.id}">${esc(p.name)}</a><div class="meta">${esc(p.brand)} · ${esc(sizeLabel(p, l.size))}</div>
<div class="row"><div class="qty" role="group" aria-label="Количество"><button type="button" data-q="-1" data-id="${p.id}" data-s="${esc(l.size)}" aria-label="Меньше">−</button><span aria-live="polite">${l.qty}</span><button type="button" data-q="1" data-id="${p.id}" data-s="${esc(l.size)}" aria-label="Больше">+</button></div>
<span class="lp">${rub(p.price * l.qty)}</span></div>
<button class="rm" type="button" data-rm data-id="${p.id}" data-s="${esc(l.size)}">Удалить</button></div></div>`;
}
document.addEventListener('click', e => {
  const q = e.target.closest('[data-q]'), r = e.target.closest('[data-rm]');
  if (q) { const l = cart.all().find(x => x.id === +q.dataset.id && x.size === q.dataset.s); if (l) cart.setQty(l.id, l.size, l.qty + +q.dataset.q); }
  if (r) cart.remove(+r.dataset.id, r.dataset.s);
});
function renderDrawer() {
  const l = cart.all(), b = $('#drb'), f = $('#drf');
  if (!l.length) { b.innerHTML = `<div class="empty"><b>Корзина пуста</b><span>Добавьте пару или оформите заказ по ссылке.</span><a class="btn ghost" href="catalog.html">В каталог</a></div>`; f.innerHTML = ''; return; }
  b.innerHTML = l.map(x => lineHtml(x)).join('');
  f.innerHTML = `<div class="tot"><span>Итого</span><span>${rub(cart.total())}</span></div><p class="note">Оплаты на сайте нет. Дальше — заявка: менеджер подтвердит размер и срок за 15 минут.</p><a class="btn block" href="cart.html">Оформить заявку</a>`;
}

/* ---------- текст заявки / мессенджер ---------- */
function absUrl(rel) { return new URL(rel, location.href).href; }
function orderText(items, c) {
  const L = ['Заявка с сайта The Rude Store'];
  if (c) {
    L.push('Имя: ' + c.name, 'Телефон: ' + c.phone, 'Город: ' + c.city, 'Как связаться: ' + c.via);
    if (c.comment) L.push('Комментарий: ' + c.comment);
  }
  L.push('', 'Состав:');
  let sum = 0;
  items.forEach((it, i) => { const p = byId(it.id); sum += p.price * it.qty;
    L.push(`${i + 1}. ${p.name}, ${sizeLabel(p, it.size)} × ${it.qty} — ${rub(p.price * it.qty)}`, '   ' + absUrl('product.html?id=' + p.id)); });
  L.push('', 'Итого: ' + rub(sum), 'Прошу подтвердить наличие размера, срок и способ оплаты.');
  return L.join('\n');
}
function copyText(t) {
  const fb = () => { const a = document.createElement('textarea'); a.value = t; a.style.cssText = 'position:fixed;opacity:0;left:-9999px'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (e) { } a.remove(); };
  try { navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(t).catch(fb) : fb(); } catch (e) { fb(); }
}
function sendVia(text, url) {
  copyText(text);
  window.open(url || MSG_URL, '_blank', 'noopener');
  toast('Текст скопирован. Вставьте его в чат и отправьте.');
}

/* ---------- поиск ---------- */
function match(p, q) {
  const hay = (p.name + ' ' + p.brand + ' ' + p.cat).toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every(t => hay.includes(t));
}
function searchRes(q) {
  const r = $('#qres'); q = q.trim();
  if (!q) { r.innerHTML = `<p class="hint">Популярное</p><div class="qs">${['Nike', 'Jordan', 'Puma', 'Куртки', 'Худи'].map(t => `<a href="catalog.html?q=${encodeURIComponent(t)}">${t}</a>`).join('')}<a href="catalog.html?sale=1">Sale</a></div>`; return; }
  const m = P.filter(p => match(p, q));
  r.innerHTML = m.length
    ? `<p class="hint">${m.length} ${plural(m.length, 'товар', 'товара', 'товаров')}</p>` + m.slice(0, 6).map(p => `<a class="sr-i" href="product.html?id=${p.id}"><span class="im"><img src="img/${p.img}" alt="" width="128" height="128"></span><span><b>${esc(p.name)}</b><small>${esc(p.brand)}</small></span><span class="pr">${rub(p.price)}</span></a>`).join('') + `<p class="hint"><a class="lnk" href="catalog.html?q=${encodeURIComponent(q)}">Показать все результаты</a></p>`
    : `<p class="hint">По запросу «${esc(q)}» ничего нет.</p><a class="btn ghost" href="index.html#order" data-close>Найдём под заказ</a>`;
}
function initSearch() {
  const q = $('#q'); if (!q) return;
  q.addEventListener('input', () => searchRes(q.value));
  q.addEventListener('keydown', e => { if (e.key === 'Enter' && q.value.trim()) location.href = 'catalog.html?q=' + encodeURIComponent(q.value.trim()); });
}

/* ---------- главная ---------- */
function initHome() {
  const g = $('#newGrid'), ch = $('#newChips');
  const skip = cat => cat ? [] : [1, 2, 6, 11, 18];
  const draw = cat => { const l = P.filter(p => (!cat || p.cat === cat) && !skip(cat).includes(p.id)).slice(0, 8); g.innerHTML = l.map(card).join(''); $('#newAll').href = 'catalog.html' + (cat ? '?cat=' + encodeURIComponent(cat) : '?sort=new'); };
  draw('');
  ch.innerHTML = ['', 'Обувь', 'Одежда', 'Куртки'].map((c, i) => `<button class="chip${i ? '' : ' on'}" type="button" data-c="${c}" aria-pressed="${!i}">${c || 'Все'}</button>`).join('');
  ch.addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; $$('.chip', ch).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); draw(b.dataset.c); });
  // бренды
  const cnt = {}; P.forEach(p => cnt[p.brand] = (cnt[p.brand] || 0) + 1);
  $('#brandsList').innerHTML = Object.entries(cnt).sort((a, b) => b[1] - a[1]).map(([b, n]) => `<a href="catalog.html?brand=${encodeURIComponent(b)}">${esc(b)}<sup>${n}</sup></a>`).join('');
  // канал
  $$('[data-ch-name]').forEach(n => n.textContent = CH.name);
  $$('[data-ch-url]').forEach(a => { a.href = CH.url; a.target = '_blank'; a.rel = 'noopener'; });
  // под заказ
  const f = $('#ofForm');
  f.addEventListener('submit', e => {
    e.preventDefault();
    const link = f.link.value.trim(), size = f.size.value;
    const t = `Хочу заказать под заказ:\n${link}\nРазмер: ${size || 'не указан'}\nПришлите цену под ключ и срок.`;
    sendVia(t); $('#ofSt').textContent = 'Текст скопирован, чат ВКонтакте открыт. Вставьте и отправьте — ответим за 15 минут.';
  });
  // розыгрыш
  const R = S.raffle, rs = $('#raffle');
  if (!R) { rs && rs.remove(); }
  else {
    $('#rafTitle').textContent = R.title; $('#rafImg').src = 'img/' + R.img;
    const box = $('#rafSizes'); let pick = '';
    box.innerHTML = R.sizes.map(s => `<button class="sz" type="button" aria-pressed="false" data-s="${s}">${s}</button>`).join('');
    box.addEventListener('click', e => { const b = e.target.closest('.sz'); if (!b) return; pick = b.dataset.s; $$('.sz', box).forEach(x => x.setAttribute('aria-pressed', x === b)); $('#rafSt').textContent = ''; });
    const end = new Date(R.end).getTime(), cd = $('#cd');
    const tick = () => { let d = end - Date.now(); if (d <= 0) { cd.innerHTML = '<div><b>—</b><i>завершён</i></div>'; $('#rafBtn').disabled = true; return false; }
      const dd = Math.floor(d / 864e5), hh = Math.floor(d % 864e5 / 36e5), mm = Math.floor(d % 36e5 / 6e4), z = n => String(n).padStart(2, '0');
      cd.innerHTML = `<div><b>${z(dd)}</b><i>${plural(dd, 'день', 'дня', 'дней')}</i></div><div><b>${z(hh)}</b><i>${plural(hh, 'час', 'часа', 'часов')}</i></div><div><b>${z(mm)}</b><i>${plural(mm, 'минута', 'минуты', 'минут')}</i></div>`; return true; };
    if (tick()) setInterval(tick, 20000);
    $('#rafBtn').addEventListener('click', () => {
      if (!pick) { $('#rafSt').textContent = 'Выберите размер.'; return; }
      sendVia(`Участвую в розыгрыше: ${R.title}, размер EU ${pick}.`);
      $('#rafSt').textContent = 'Заявка скопирована — отправьте её в чат. Одна заявка на человека.';
    });
  }
  $('#clubJoin') && $('#clubJoin').addEventListener('click', () => sendVia('Хочу вступить в Rude Club.'));
}

/* ---------- каталог ---------- */
function initCatalog() {
  const u = new URLSearchParams(location.search);
  const st = { cat: u.get('cat') || '', brand: (u.get('brand') || '').split(',').filter(Boolean), sale: u.get('sale') === '1', q: u.get('q') || '', sort: u.get('sort') || 'new' };
  const cats = ['Обувь', 'Одежда', 'Куртки'], brands = [...new Set(P.map(p => p.brand))].sort();
  const sub = (key, val) => P.filter(p => (key === 'cat' ? p.cat === val : p.brand === val)).length;
  $('#flt .fb').innerHTML = `<div class="fg"><h3>Категория</h3>
<label class="fo"><input type="radio" name="cat" value=""><span class="bx"></span>Все<em>${P.length}</em></label>
${cats.map(c => `<label class="fo"><input type="radio" name="cat" value="${c}"><span class="bx"></span>${c}<em>${sub('cat', c)}</em></label>`).join('')}</div>
<div class="fg"><h3>Бренд</h3>${brands.map(b => `<label class="fo"><input type="checkbox" name="brand" value="${esc(b)}"><span class="bx"></span>${esc(b)}<em>${sub('brand', b)}</em></label>`).join('')}</div>
<div class="fg"><h3>Цена</h3><label class="fo"><input type="checkbox" name="sale" value="1"><span class="bx"></span>Только со скидкой</label></div>`;
  const sortSel = $('#sort');
  const apply = () => {
    let l = P.filter(p => (!st.cat || p.cat === st.cat) && (!st.brand.length || st.brand.includes(p.brand)) && (!st.sale || p.old) && (!st.q || match(p, st.q)));
    const s = { new: (a, b) => a.id - b.id, asc: (a, b) => a.price - b.price, desc: (a, b) => b.price - a.price, disc: (a, b) => off(b) - off(a) || a.id - b.id }[st.sort] || ((a, b) => a.id - b.id);
    l.sort(s);
    // форма
    $$('#flt input[name=cat]').forEach(i => i.checked = i.value === st.cat);
    $$('#flt input[name=brand]').forEach(i => i.checked = st.brand.includes(i.value));
    $('#flt input[name=sale]').checked = st.sale; sortSel.value = st.sort;
    // заголовок
    const title = st.q ? `Поиск: «${st.q}»` : st.sale ? 'Sale' : st.cat || (st.brand.length === 1 ? st.brand[0] : st.sort === 'new' && !u.has('sort') ? 'Каталог' : st.sort === 'new' ? 'Новинки' : 'Каталог');
    $('#ct').textContent = title; document.title = title + ' — The Rude Store';
    $('#cc').textContent = `${l.length} ${plural(l.length, 'товар', 'товара', 'товаров')}`;
    const n = (st.cat ? 1 : 0) + st.brand.length + (st.sale ? 1 : 0); const fn = $('#fn'); fn.textContent = n; fn.classList.toggle('on', n > 0);
    $('#fshow').textContent = `Показать ${l.length}`;
    // активные
    const act = [];
    if (st.q) act.push(['q', '', `«${st.q}»`]);
    if (st.cat) act.push(['cat', '', st.cat]);
    st.brand.forEach(b => act.push(['brand', b, b]));
    if (st.sale) act.push(['sale', '', 'Со скидкой']);
    $('#act').innerHTML = act.map(([k, v, t]) => `<button type="button" data-k="${k}" data-v="${esc(v)}" aria-label="Убрать фильтр: ${esc(t)}">${esc(t)}</button>`).join('');
    $('#act').hidden = !act.length;
    const gr = $('#cg');
    gr.innerHTML = l.length ? l.map(card).join('') : '';
    $('#none').hidden = !!l.length; gr.hidden = !l.length;
    // url
    const p = new URLSearchParams();
    if (st.cat) p.set('cat', st.cat); if (st.brand.length) p.set('brand', st.brand.join(',')); if (st.sale) p.set('sale', '1'); if (st.q) p.set('q', st.q); if (st.sort !== 'new' || u.get('sort') === 'new') p.set('sort', st.sort);
    history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
  };
  $('#flt').addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'cat') st.cat = t.value;
    if (t.name === 'brand') st.brand = $$('#flt input[name=brand]:checked').map(i => i.value);
    if (t.name === 'sale') st.sale = t.checked;
    apply();
  });
  sortSel.addEventListener('change', () => { st.sort = sortSel.value; apply(); });
  $('#act').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const k = b.dataset.k;
    if (k === 'brand') st.brand = st.brand.filter(x => x !== b.dataset.v); else if (k === 'sale') st.sale = false; else st[k] = ''; apply(); });
  const reset = () => { st.cat = ''; st.brand = []; st.sale = false; st.q = ''; apply(); };
  $$('[data-reset]').forEach(b => b.addEventListener('click', reset));
  $('#fbtn').addEventListener('click', () => open('flt'));
  apply();
}

/* ---------- товар ---------- */
function initProduct() {
  const id = +new URLSearchParams(location.search).get('id'), p = byId(id), root = $('#pdp');
  if (!p) { root.outerHTML = `<div class="nf"><div><h1 class="h2">Такого товара нет</h1><p class="mute">Возможно, его уже раскупили или ссылка устарела.</p><a class="btn" href="catalog.html">В каталог</a></div></div>`; $('#rel') && $('#rel').remove(); return; }
  document.title = `${p.name} — ${p.brand} — The Rude Store`;
  const setMeta = (sel, v) => { const m = $(sel); m && m.setAttribute('content', v); };
  setMeta('meta[property="og:title"]', document.title); setMeta('meta[property="og:image"]', absUrl('img/' + p.img));
  setMeta('meta[name="description"]', `${p.name}: ${rub(p.price)}. Оригинал, легит‑чек, доставка по России.`);
  $('#crumbs').innerHTML = `<a href="index.html">Главная</a> / <a href="catalog.html?cat=${encodeURIComponent(p.cat)}">${p.cat}</a> / ${esc(p.name)}`;
  const sz = sizesFor(p), shoe = p.cat === 'Обувь'; let pick = '';
  const f = favs.has(p.id);
  root.innerHTML = `<div class="gal" id="gal"><img src="img/${p.img}" alt="${esc(p.name)}" width="1000" height="1000"><span class="hintz">Нажмите, чтобы увеличить</span></div>
<div class="inf"><div><div class="top"><div class="eyebrow">${esc(p.brand)}</div><button class="pdp-like" type="button" data-id="${p.id}" aria-pressed="${f}" aria-label="${f ? 'Убрать из избранного' : 'В избранное'}: ${esc(p.name)}">${I.heart}</button></div>
<h1>${esc(p.name)}</h1></div>${priceHtml(p)}
<div id="szw"><div class="szh"><b>${shoe ? 'Размер EU' : 'Размер'}</b><span class="mute" style="font-size:12px">Оригинал · легит‑чек</span></div>
<div class="szg${shoe ? '' : ' cl'}" id="szg" role="group" aria-label="Размер">${sz.map(s => `<button class="sz" type="button" aria-pressed="false" data-s="${s}">${s}</button>`).join('')}</div>
<p class="szerr" id="szerr" role="alert"></p><p class="note">Наличие размера подтвердим за 15 минут.</p></div>
<div class="btns"><button class="btn block" type="button" id="add">В корзину</button><button class="btn ghost block" type="button" id="one">Купить в 1 клик</button>
<p class="note">«В 1 клик» откроет чат ВКонтакте с готовым текстом заказа. Оплата — после подтверждения.</p></div>
<div class="acc">
<details><summary>Оригинальность</summary><div class="bd"><p>Только оригинал. К заказу прикладываем фото чека из магазина‑донора, пару проверяет независимый эксперт (легит‑чек), на обуви есть код Честного знака.</p><p>Если окажется не оригиналом — вернём все деньги.</p><a href="info.html#original">Подробнее</a></div></details>
<details><summary>Доставка и оплата</summary><div class="bd"><p>Под заказ — 12–18 дней, доставка по России. Предоплата 30%, остальное — перед отправкой. Оплата по СБП или картой.</p><a href="info.html#delivery">Подробнее</a></div></details>
<details><summary>Возврат</summary><div class="bd"><p>Отказаться от заказа можно в течение 7 дней после получения, если сохранены товарный вид, бирки и упаковка.</p><a href="info.html#return">Условия возврата</a></div></details></div>
<p class="vk">Этот товар в сообществе: <a href="${esc(p.vk)}" target="_blank" rel="noopener">карточка ВКонтакте</a></p></div>`;
  document.body.classList.add('has-bar');
  const bar = document.createElement('div'); bar.className = 'bar-m';
  bar.innerHTML = `${priceHtml(p)}<button class="btn" type="button" id="add2">В корзину</button>`; document.body.appendChild(bar);
  if ('IntersectionObserver' in window) { bar.classList.add('off'); new IntersectionObserver(es => es.forEach(e => bar.classList.toggle('off', e.isIntersecting || e.boundingClientRect.top > 0))).observe($('#add')); }
  const szg = $('#szg'), err = $('#szerr');
  szg.addEventListener('click', e => { const b = e.target.closest('.sz'); if (!b) return; pick = b.dataset.s; $$('.sz', szg).forEach(x => x.setAttribute('aria-pressed', x === b)); err.textContent = ''; });
  const need = () => { if (pick) return true; err.textContent = shoe ? 'Выберите размер EU' : 'Выберите размер'; szg.classList.remove('err'); void szg.offsetWidth; szg.classList.add('err'); $('#szw').scrollIntoView({ behavior: 'smooth', block: 'center' }); return false; };
  const add = () => { if (!need()) return; cart.add(p.id, pick); toast('Добавлено в корзину'); open('cart'); };
  $('#add').addEventListener('click', add); $('#add2').addEventListener('click', add);
  $('#one').addEventListener('click', () => { if (!need()) return; sendVia(orderText([{ id: p.id, size: pick, qty: 1 }], null).replace('Заявка с сайта The Rude Store', 'Хочу купить (быстрый заказ с сайта The Rude Store)')); });
  // зум
  const gal = $('#gal'), img = $('img', gal);
  const pan = (x, y) => { const r = gal.getBoundingClientRect(); img.style.transformOrigin = `${(x - r.left) / r.width * 100}% ${(y - r.top) / r.height * 100}%`; };
  gal.addEventListener('click', e => { gal.classList.toggle('z'); pan(e.clientX, e.clientY); });
  gal.addEventListener('mousemove', e => { if (gal.classList.contains('z')) pan(e.clientX, e.clientY); });
  gal.addEventListener('touchmove', e => { if (gal.classList.contains('z')) { e.preventDefault(); pan(e.touches[0].clientX, e.touches[0].clientY); } }, { passive: false });
  gal.addEventListener('mouseleave', () => gal.classList.remove('z'));
  // похожие
  const rel = P.filter(x => x.id !== p.id && x.cat === p.cat).sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price)).slice(0, 4);
  $('#relg').innerHTML = rel.map(card).join('');
  const mq = matchMedia('(min-width:900px)'); const hideBar = () => bar.style.display = mq.matches ? 'none' : ''; hideBar();
}

/* ---------- избранное ---------- */
function renderFav() {
  const l = favs.all().map(byId), g = $('#fg');
  g.innerHTML = l.length ? l.map(card).join('') : '';
  $('#fnone').hidden = !!l.length; g.hidden = !l.length;
  $('#fcnt').textContent = l.length ? `${l.length} ${plural(l.length, 'товар', 'товара', 'товаров')}` : '';
}

/* ---------- страница корзины ---------- */
function renderCart() {
  const l = cart.all(), box = $('#lines'), has = l.length;
  $('#cartFull').hidden = !has; $('#cartEmpty').hidden = !!has;
  if (!has) return;
  box.innerHTML = l.map(x => lineHtml(x)).join('');
  $('#sum').textContent = rub(cart.total());
  $('#pre').textContent = rub(Math.round(cart.total() * 0.3 / 10) * 10);
}
function initCart() {
  renderCart();
  const f = $('#orderForm'); if (!f) return;
  const ph = f.phone;
  ph.addEventListener('input', () => ph.setCustomValidity(''));
  f.addEventListener('submit', e => {
    e.preventDefault();
    const digits = ph.value.replace(/\D/g, '');
    if (digits.length < 10) { ph.setCustomValidity('Введите номер телефона'); ph.reportValidity(); return; }
    if (!f.consent.checked) { f.consent.setCustomValidity('Нужно согласие'); f.consent.reportValidity(); return; }
    const c = { name: f.name.value.trim(), phone: ph.value.trim(), city: f.city.value.trim(), via: f.via.value, comment: f.comment.value.trim() };
    const text = orderText(cart.all(), c);
    $('#orderText').value = text; $('#orderForm').hidden = true; $('#result').hidden = false;
    $('#result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  f.consent.addEventListener('change', () => f.consent.setCustomValidity(''));
  $('#sendVk').addEventListener('click', () => sendVia($('#orderText').value, MSG_URL));
  const tgb = $('#sendTg'); if (TG) { tgb.hidden = false; tgb.addEventListener('click', () => sendVia($('#orderText').value, TG)); }
  const wab = $('#sendWa'); if (WA) { wab.hidden = false; wab.addEventListener('click', () => { window.open(WA + (WA.includes('?') ? '&' : '?') + 'text=' + encodeURIComponent($('#orderText').value), '_blank', 'noopener'); copyText($('#orderText').value); }); }
  $('#copyOnly').addEventListener('click', () => { copyText($('#orderText').value); toast('Текст скопирован'); });
  $('#editOrder').addEventListener('click', () => { $('#result').hidden = true; f.hidden = false; });
  $('#clearCart').addEventListener('click', () => { cart.clear(); $('#result').hidden = true; toast('Корзина очищена'); });
}

/* ---------- reveal ---------- */
function reveal() {
  const els = $$('.rv'); if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
}

/* ---------- старт ---------- */
shell(); initSearch(); refresh(); $$('[data-ch-name]').forEach(n => n.textContent = CH.name);
if (page === 'home') initHome();
if (page === 'catalog') initCatalog();
if (page === 'product') initProduct();
if (page === 'favorites') renderFav();
if (page === 'cart') initCart();
$$('[data-vk]').forEach(a => { a.href = S.vk; a.target = '_blank'; a.rel = 'noopener'; });
$$('[data-legal]').forEach(n => n.textContent = S.legal || '');
$$('[data-msg]').forEach(b => b.addEventListener('click', () => sendVia(b.dataset.msg)));
reveal();
})();
