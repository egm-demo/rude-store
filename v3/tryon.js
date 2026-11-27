// Примерочная The Rude Store — сборка образа на «невидимом манекене» (ghost mannequin):
// вырезанные фото вещей ставятся по точкам тела, слои: сумка-рюкзак < верх < куртка; низ < верх; обувь парой.
const D = window.TRY, IT = D.items;
const $ = s => document.querySelector(s);
const rub = x => x.toLocaleString('ru-RU').replace(/\u00a0|,/g, ' ') + '\u00a0₽';
const SLOTS = ['outer', 'top', 'bottom', 'shoes', 'bag'];
const SLOTN = { outer: 'Куртка', top: 'Верх', bottom: 'Низ', shoes: 'Обувь', bag: 'Сумка' };
const A = 1.9; // высота манекена в ширинах (aspect 10/19)

// раскладка: всё в долях ширины контейнера (W=1, H=1.9); сумки — справа от силуэта
function layout(ids) {
  const by = {}; ids.forEach(id => by[IT[id].slot] = IT[id]);
  const L = [];
  const fit = (it, cx, top, bw, bh, align = 'top', flip = false, z = 1, clip = '') => {
    const r = it.ar || 1; let w = bw, h = bw / r; if (h > bh) { h = bh; w = bh * r; }
    const y = align === 'top' ? top : top - h;
    const o = { it, x: cx - w / 2, y, w, h, flip, z, clip }; L.push(o); return o;
  };
  let hem = null, upW = 0.8;
  if (by.outer) {
    const o = fit(by.outer, 0.5, 0.03, 0.8, 0.72, 'top', false, 6);
    hem = o.y + o.h; upW = o.w;
    if (by.top) { // поддева: виден низ (резинка/кромка) шире и ниже куртки
      const t = fit(by.top, 0.5, 0, o.w * 0.86, 0.8, 'top', false, 5, 'inset(55% 0 0 0)');
      t.y = hem + 0.085 - t.h;
      hem += 0.07;
    }
  } else if (by.top) {
    const t = fit(by.top, 0.5, 0.05, 0.78, 0.7, 'top', false, 6); hem = t.y + t.h; upW = t.w;
  }
  const floor = A - 0.02;
  let cuffY = floor, legC = [0.42, 0.58];
  if (by.bottom) {
    const top = hem ? hem - 0.14 : 0.62;
    const bot = by.shoes ? floor - 0.07 : floor;
    const b = fit(by.bottom, 0.5, top, 0.5, bot - top, 'top', false, 3);
    legC = [b.x + b.w * 0.27, b.x + b.w * 0.73]; cuffY = b.y + b.h;
  }
  if (by.shoes) {
    const sw = 0.3;
    fit(by.shoes, legC[0] - 0.035, floor - 0.004, sw, 0.14, 'bottom', true, 4);
    fit(by.shoes, legC[1] + 0.035, floor, sw, 0.14, 'bottom', false, 4.2);
  }
  if (by.bag) { // сумка стоит на полу справа, рюкзак — чуть выше
    const b = by.bag, k = b.kind, edge = 0.5 + Math.max(upW / 2, 0.3);
    const bw = k === 'backpack' ? 0.34 : k === 'cross' ? 0.3 : 0.36, bh = k === 'backpack' ? 0.44 : 0.34;
    fit(b, edge + bw / 2 + 0.02, floor, bw, bh, 'bottom', false, 1);
  }
  return L;
}

function paint(el, ids, opts = {}) {
  const L = layout(ids);
  const keep = new Map([...el.querySelectorAll('.L')].map(n => [n.dataset.k, n]));
  const used = new Set();
  L.forEach((o, n) => {
    const k = o.it.id + (o.flip ? 'f' : '') ;
    let d = keep.get(k);
    if (!d) {
      d = document.createElement('div'); d.className = 'L' + (opts.anim ? ' in' : ''); d.dataset.k = k; d.dataset.id = o.it.id;
      d.innerHTML = `<img src="${o.it.tex}" alt="" draggable="false">`;
      if (opts.anim) d.style.animationDelay = (n * 0.05) + 's';
      el.appendChild(d);
    }
    used.add(k);
    Object.assign(d.style, { left: o.x * 100 + '%', top: o.y / A * 100 + '%', width: o.w * 100 + '%', height: o.h / A * 100 + '%', zIndex: Math.round(o.z * 10) });
    const im = d.querySelector('img'); im.style.transform = o.flip ? 'scaleX(-1)' : ''; im.style.clipPath = o.clip || '';
  });
  keep.forEach((d, k) => { if (!used.has(k)) { d.classList.add('out'); d.classList.remove('in'); setTimeout(() => d.remove(), 420); } });
}

// ---------- состояние ----------
const P = new URLSearchParams(location.search);
let coll = P.get('c') || 'rude', si = +(P.get('s') || 0), filt = 'all';
const worn = {};
const man = $('#man');

function draw(anim = true) { paint(man, SLOTS.filter(s => worn[s]).map(s => worn[s]), { anim }); ui(); }
function equip(id) { worn[IT[id].slot] = id; draw(); }
function unequip(s) { delete worn[s]; draw(); }
function toggle(id) { const s = IT[id].slot; if (worn[s] === id) unequip(s); else equip(id); }

function wearSet(i) {
  si = (i + 10) % 10; const set = D.sets[coll][si];
  SLOTS.forEach(s => delete worn[s]);
  set.ids.forEach(id => worn[IT[id].slot] = id);
  draw();
}
function setColl(c, s = 0) {
  coll = c; filt = 'all';
  document.querySelectorAll('#seg button').forEach(b => b.classList.toggle('on', b.dataset.c === c));
  $('#kick').textContent = c === 'rude' ? 'Примерочная · Monterest × Topologie' : 'Примерочная · топ продаж Poizon';
  renderSets(); renderGrid(); wearSet(s);
}

function renderSets() {
  $('#sets').innerHTML = D.sets[coll].map((s, i) => `<button class="st" data-i="${i}"><div class="tm"><div class="man mini" style="top:7%;bottom:7%;left:42%"></div></div><b>${s.code}<i>${s.name}</i></b></button>`).join('');
  document.querySelectorAll('.st').forEach(b => { paint(b.querySelector('.man'), D.sets[coll][+b.dataset.i].ids); b.onclick = () => wearSet(+b.dataset.i); });
}
const match = (id, f) => f === 'all' || (f === 'up' ? ['outer', 'top'].includes(IT[id].slot) : IT[id].slot === f);
function renderGrid() {
  const ids = D.cat[coll];
  const F = [['all', 'Всё'], ['up', 'Верх'], ['bottom', 'Низ'], ['shoes', 'Обувь'], ['bag', 'Сумки']].filter(([f]) => f === 'all' || ids.some(id => match(id, f)));
  $('#ft').innerHTML = F.map(([f, n]) => `<button data-f="${f}" class="${f === filt ? 'on' : ''}">${n}<sup>${ids.filter(id => match(id, f)).length}</sup></button>`).join('');
  document.querySelectorAll('#ft button').forEach(b => b.onclick = () => { filt = b.dataset.f; renderGrid(); });
  const L = ids.filter(id => match(id, filt));
  $('#catn').textContent = L.length + ' шт';
  $('#grid').innerHTML = L.map(id => { const it = IT[id]; return `<button class="it" data-id="${id}"><div class="tm"><img src="${it.tex}" alt="" loading="lazy"><em>Надето</em><i>+</i></div><span class="b">${it.b}</span><span class="n">${it.n}</span><span class="p">${rub(it.p)}</span></button>`; }).join('');
  document.querySelectorAll('.it').forEach(b => b.onclick = () => toggle(b.dataset.id));
  ui();
}
const plural = n => n + ' вещ' + (n === 1 ? 'ь' : n > 1 && n < 5 ? 'и' : 'ей');
function ui() {
  const set = D.sets[coll][si], ws = SLOTS.filter(s => worn[s]);
  const same = ws.length === set.ids.length && set.ids.every(id => worn[IT[id].slot] === id);
  $('#code').textContent = same ? set.code : 'Свой';
  $('#lname').textContent = same ? set.name : 'собран вручную';
  $('#cnt').textContent = String(si + 1).padStart(2, '0') + ' / 10';
  document.querySelectorAll('.st').forEach(b => b.classList.toggle('on', +b.dataset.i === si && same));
  $('#tot').textContent = rub(ws.reduce((a, s) => a + IT[worn[s]].p, 0));
  $('#lsum').textContent = plural(ws.length);
  $('#wn').textContent = plural(ws.length);
  const avail = SLOTS.filter(s => D.cat[coll].some(id => IT[id].slot === s));
  $('#rows').innerHTML = avail.map(s => {
    const id = worn[s];
    if (!id) return `<div class="row empty" data-s="${s}"><div class="th">+</div><div class="tx"><span class="b">${SLOTN[s]}</span><span class="k">Не выбрано — подобрать</span></div></div>`;
    const it = IT[id];
    return `<div class="row"><div class="th"><img src="${it.tex}" alt=""></div><div class="tx"><span class="b">${it.b}</span><span class="n">${it.n}</span><span class="k">${SLOTN[s]} · ${it.c}${it.sold ? ' · продано ' + it.sold : ''}</span></div><div class="rt"><span class="p">${rub(it.p)}</span><button class="x" data-s="${s}">Снять</button></div></div>`;
  }).join('');
  document.querySelectorAll('.row .x').forEach(b => b.onclick = () => unequip(b.dataset.s));
  document.querySelectorAll('.row.empty').forEach(r => r.onclick = () => { filt = ['outer', 'top'].includes(r.dataset.s) ? 'up' : r.dataset.s; renderGrid(); $('#grid').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
  const on = new Set(Object.values(worn));
  document.querySelectorAll('.it').forEach(b => b.classList.toggle('on', on.has(b.dataset.id)));
}

// клик по вещи на манекене — снять
man.addEventListener('click', e => { const l = e.target.closest('.L'); if (l) unequip(IT[l.dataset.id].slot); });
document.querySelectorAll('#seg button').forEach(b => b.onclick = () => setColl(b.dataset.c));
$('#prev').onclick = () => wearSet(si - 1); $('#next').onclick = () => wearSet(si + 1);
addEventListener('keydown', e => { if (e.key === 'ArrowRight') wearSet(si + 1); if (e.key === 'ArrowLeft') wearSet(si - 1); });
// зум: образ / верх / низ
document.querySelectorAll('#vw button').forEach(b => b.onclick = () => {
  document.querySelectorAll('#vw button').forEach(x => x.classList.toggle('on', x === b));
  const v = b.dataset.v;
  man.style.transition = 'transform .7s cubic-bezier(.2,.7,.2,1)';
  man.style.transform = v === 'up' ? 'translateX(-50%) translateY(18%) scale(1.55)' : v === 'low' ? 'translateX(-50%) translateY(-24%) scale(1.45)' : 'translateX(-50%)';
  man.style.transformOrigin = v === 'up' ? '50% 0%' : v === 'low' ? '50% 100%' : '50% 50%';
});
let cart = 0;
$('#buy').onclick = () => { const n = SLOTS.filter(s => worn[s]).length; cart += n; $('#cartn').textContent = `Корзина (${cart})`; toast('В корзине: ' + plural(n)); };
function toast(t) { const e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(() => e.classList.remove('on'), 1800); }

setColl(coll, si);
window.__try = { worn, equip, unequip, wearSet, setColl };
