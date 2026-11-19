/* THE RUDE STORE — общий движок макетов */
(function(){
const P = window.P || [];
const IMG = window.IMG || 'img/';
const rub = n => n.toLocaleString('ru-RU').replace(/\u00a0/g,' ') + ' ₽';
const off = p => p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
const ICON = {
  heart:'<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-8.6-8.6C2.2 8.2 4.3 5 7.4 5c2 0 3.4 1.2 4.6 2.8C13.2 6.2 14.6 5 16.6 5c3.1 0 5.2 3.2 4 6.4C19 15.6 12 20 12 20z"/></svg>',
  bag:'<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
  search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5"/></svg>',
  arrow:'<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};
const ico = n => `<span class="ico">${ICON[n]}</span>`;
function logo(kind='stack', cls=''){
  if(kind==='stack') return `<span class="lg stack ${cls}"><span>The</span><span>Rude</span><span>Store</span></span>`;
  if(kind==='one') return `<span class="lg one ${cls}">Rudestore</span>`;
  if(kind==='line') return `<span class="lg ${cls}">The Rude Store</span>`;
  if(kind==='trs') return `<span class="lg mono ${cls}">TRS</span>`;
  if(kind==='trd') return `<span class="lg mono ${cls}">T.R.D</span>`;
  if(kind==='badge') return `<span class="lg badge ${cls}">TRS</span>`;
  return '';
}
function card(p, o={}){
  const d = off(p);
  const badge = o.badge ? o.badge(p) : (d>=25 ? `<span class="badge">−${d}%</span>` : '');
  const price = o.friend
    ? (p.old ? `<span class="old">${rub(p.old)}</span><span class="now">${rub(p.price)}</span><span class="off">-${d}%</span>`
             : `<span class="ph">—</span><span class="now">${rub(p.price)}</span>`)
    : `<span class="now">${rub(p.price)}</span>${p.old?`<span class="old">${rub(p.old)}</span>`:''}${p.old && o.pct!==false?`<span class="off">−${d}%</span>`:''}`;
  return `<article class="c" data-id="${p.id}" data-cat="${p.cat}">
    <div class="ci"><img loading="lazy" src="${IMG}${p.img}" alt="${p.name.replace(/"/g,'&quot;')}">${o.nobadge?'':badge}${o.like?`<button class="like" aria-label="В избранное">${ICON.heart}</button>`:''}</div>
    <div class="cb">${o.brand===false?'':`<div class="cbr">${p.brand}</div>`}<div class="cn">${p.name}</div><div class="cp">${price}</div>${o.stock?`<div class="st ${p.id%3?'in':'po'}">${p.id%3?'В наличии':'Под заказ · 10–14 дней'}</div>`:''}</div>
  </article>`;
}
function grid(el, list, o={}){
  if(typeof el==='string') el=document.querySelector(el);
  if(!el) return;
  el.innerHTML = list.map(p=>card(p,o)).join('');
}
function filterCats(list, cat){
  if(!cat || cat==='Всё') return list;
  if(cat==='Аксессуары') return [];
  if(cat==='Одежда') return list.filter(p=>p.cat==='Одежда'||p.cat==='Куртки');
  return list.filter(p=>p.cat===cat);
}
function pill(target, o={}){
  const cats=o.cats||['Всё','Обувь','Одежда','Аксессуары'];
  const el=document.createElement('div'); el.className='pill '+(o.cls||'');
  el.innerHTML=cats.map((c,i)=>`<button class="${i?'':'on'}">${c}</button>`).join('');
  document.body.appendChild(el);
  el.addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return;
    el.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
    let l=filterCats(P,b.textContent); const g=document.querySelector(target);
    if(!l.length){ g.innerHTML=`<p style="grid-column:1/-1;color:var(--muted);padding:40px 0;text-align:center">Аксессуары скоро. Напишите, что привезти.</p>`; return; }
    grid(g,l,o.card||{});
  });
}
function chips(sel, target, o={}){
  const el=document.querySelector(sel); if(!el) return;
  const cats=o.cats||['Всё','Обувь','Одежда','Куртки'];
  el.innerHTML=cats.map((c,i)=>`<button class="${i?'':'on'}">${c}</button>`).join('');
  el.addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return;
    el.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
    const c=b.textContent; const l = c==='Всё'?P : (c==='Одежда'?P.filter(p=>p.cat==='Одежда'): P.filter(p=>p.cat===c || p.brand===c));
    grid(target,l,o.card||{});
  });
}
/* шторка товара */
function drawer(){
  const d=document.createElement('div'); d.className='pd';
  d.innerHTML='<div class="bg"></div><div class="box"><button class="x" aria-label="Закрыть">×</button><div class="pdin"></div></div>';
  document.body.appendChild(d);
  d.addEventListener('click',e=>{ if(e.target.classList.contains('bg')||e.target.classList.contains('x')) d.classList.remove('on'); });
  document.addEventListener('click',e=>{
    const c=e.target.closest('.c'); if(!c || e.target.closest('.like') || c.closest('.pd')) return;
    const p=P.find(x=>x.id==c.dataset.id); if(!p) return;
    const sz = p.cat==='Обувь' ? ['40','41','42','43','44'] : ['S','M','L','XL','XXL'];
    d.querySelector('.pdin').innerHTML=`<div class="eyebrow">${p.brand}</div>
      <div class="ci" style="--ratio:1/1"><img src="${IMG}${p.img}" alt=""></div>
      <h3>${p.name}</h3><div class="cp"><span class="now">${rub(p.price)}</span>${p.old?`<span class="old">${rub(p.old)}</span><span class="off">−${off(p)}%</span>`:''}</div>
      <div class="sizes">${sz.map(s=>`<span>${s}</span>`).join('')}</div>
      <a class="btn" style="width:100%" href="${p.vk}" target="_blank" rel="noopener">Заказать во ВКонтакте</a>
      <p class="note">Оригинал. Цена с доставкой до Москвы. Размер уточним в сообщениях.</p>`;
    d.classList.add('on');
  });
}
/* метка макета и переход между ними */
function mark(n,title){
  const m=document.createElement('div'); m.className='mkbar';
  const f=k=>String(k).padStart(2,'0')+'.html';
  m.innerHTML=`<b>Макет №${n} из 30</b><span>${title}</span>${n>1?`<a href="${f(n-1)}">← №${n-1}</a>`:''}<a href="../">все макеты</a>${n<30?`<a href="${f(n+1)}">№${n+1} →</a>`:''}`;
  document.body.appendChild(m);
}
function collapse(sel,y=60){const h=document.querySelector(sel); if(!h) return; const f=()=>h.classList.toggle('mini',scrollY>y); addEventListener('scroll',f,{passive:true}); f();}
window.TRS={collapse,P,rub,off,ico,ICON,logo,card,grid,pill,chips,drawer,mark,filterCats};
})();
