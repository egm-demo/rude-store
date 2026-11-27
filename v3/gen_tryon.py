# генератор примерочной tryon.html (данные Rude Store + Poizon, 10+10 образов)
import json, os
from PIL import Image
import numpy as np
V = os.path.dirname(os.path.abspath(__file__))
P = {p['id']: p for p in json.loads(open(os.path.join(V, 'data.js'), encoding='utf-8').read()[9:-1])}
Z = {p['id']: p for p in json.load(open(os.path.join(V, 'pz.json'), encoding='utf-8'))}

# Rude Store: цвета сняты с фото, вид кроя для 3D
RK = {
 'm00': ('outer', 'puffer', '#8a8076', 1), 'm01': ('outer', 'puffer', '#4a3a31', 1), 'm02': ('outer', 'puffer', '#8f9a86', 0),
 'm03': ('outer', 'puffer', '#8d8b88', 0), 'm04': ('outer', 'puffer', '#8a412f', 1), 'm05': ('outer', 'quilt', '#323336', 0),
 'm06': ('outer', 'puffer', '#4d3c60', 0), 'm07': ('outer', 'fleece', '#6f7d7a', 1), 'm08': ('outer', 'puffer', '#a9b8c8', 1),
 'm09': ('outer', 'quilt', '#2c2d30', 1), 'm10': ('top', 'fleece', '#cbcbc7', 0), 'm11': ('top', 'fleece', '#3c3d40', 1),
 'm12': ('top', 'ls', '#a5a5a3', 0), 'm14': ('bottom', 'cargo', '#b9b7b1', 0), 'm15': ('bottom', 'pant', '#4c2c2e', 0),
}
TK = {'t00': 'cross', 't01': 'cross', 't02': 'tote', 't03': 'cross', 't04': 'tote', 't05': 'tote', 't06': 'cross', 't07': 'duffle',
      't08': 'bucket', 't09': 'tote', 't10': 'tote', 't11': 'cross', 't12': 'backpack', 't13': 'cross', 't15': 'tote', 't17': 'tote'}
TCOL = {'t00': '#7d8064', 't01': '#848668', 't02': '#4f6b4c', 't03': '#2d5fb0', 't04': '#2e3f6b', 't05': '#56694f', 't06': '#3b6fc0',
        't07': '#6b4f3a', 't08': '#2f3a30', 't09': '#1d1d1d', 't10': '#2f4433', 't11': '#4c6a4a', 't12': '#6d513b', 't13': '#38507e',
        't15': '#2f62c8', 't17': '#1b1b1b'}
PK = {'z01': 'sneaker', 'z02': 'sneaker', 'z03': 'chunky', 'z04': 'chunky', 'z05': 'low', 'z06': 'chunky', 'z07': 'boot',
      'z08': 'puffer', 'z09': 'puffer', 'z10': 'jacket', 'z11': 'shell', 'z12': 'hoodie', 'z13': 'crew', 'z14': 'hoodie',
      'z15': 'hoodie', 'z16': 'tee', 'z17': 'jogger', 'z18': 'jogger', 'z19': 'pant', 'z20': 'backpack', 'z21': 'cross',
      'z22': 'backpack', 'z23': 'tee', 'z24': 'parka', 'z25': 'hoodie', 'z26': 'chunky'}
HOOD = {'z09', 'z11', 'z12', 'z14', 'z15', 'z24', 'z25'}
ZIP = {'z09', 'z10', 'z11', 'z12', 'z15', 'z24', 'z25', 'z08', 'm00', 'm01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10'}
PRINT = {'z08': 'mirror', 'z24': 'mirror'}

items = {}
for i, (slot, kind, col, hood) in RK.items():
    p = P[i]
    items[i] = dict(id=i, b=p['b'], n=p['n'], c=p['c'], p=p['p'], slot=slot, kind=kind, col=col, hood=bool(hood), zip=i in ZIP,
                    th=p['img'], tex=f'cut/{i}.webp' if os.path.exists(os.path.join(V, 'cut', i + '.webp')) else None, src=p['src'], logo='MONTEREST')
for i, kind in TK.items():
    p = P[i]
    items[i] = dict(id=i, b=p['b'], n=p['n'], c=p['c'], p=p['p'], slot='bag', kind=kind, col=TCOL[i], th=f'cut/{i}.webp', tex=f'cut/{i}.webp', src=p['src'])
for i, p in Z.items():
    kind = PK[i]
    slot = 'bag' if kind in ('backpack', 'cross') else p['slot']
    items[i] = dict(id=i, b=p['b'], n=p['n'], c=p['c'], p=p['p'], slot=slot, kind=kind, col=p['col'], hood=i in HOOD, zip=i in ZIP,
                    th=f'cut/{i}.webp', tex=f'cut/{i}.webp', src=p['src'], sold=p.get('sold', ''), back=PRINT.get(i))

for i, it in items.items():
    if it.get('tex') and it['slot'] != 'bag':
        a = np.asarray(Image.open(os.path.join(V, it['tex'])).convert('RGBA'))
        px = a[a[..., 3] > 200][:, :3]
        lum = px.mean(axis=1); core = px[(lum > np.percentile(lum, 20)) & (lum < np.percentile(lum, 70))]
        it['col'] = '#%02x%02x%02x' % tuple(int(v) for v in np.median(core, axis=0))

S = lambda code, name, ids: dict(code=code, name=name, ids=ids)
sets = {
 'rude': [
  S('R01', 'Sage', ['m02', 'm10', 'm14', 't00']), S('R02', 'Concrete', ['m03', 'm11', 'm15', 't09']),
  S('R03', 'Carbon', ['m05', 'm12', 'm15', 't17']), S('R04', 'Violet', ['m06', 'm10', 'm14', 't13']),
  S('R05', 'Mist', ['m07', 'm12', 'm14', 't10']), S('R06', 'Glacier', ['m08', 'm11', 'm14', 't04']),
  S('R07', 'Wave', ['m09', 'm10', 'm15', 't02']), S('R08', 'Polar', ['m10', 'm15', 't07']),
  S('R09', 'Shell', ['m11', 'm14', 't12']), S('R10', 'Merino', ['m12', 'm14', 't08'])],
 'pz': [
  S('P01', 'Panda', ['z08', 'z15', 'z17', 'z01', 'z20']), S('P02', 'Workwear', ['z10', 'z16', 'z19', 'z07']),
  S('P03', 'All Black', ['z09', 'z12', 'z18', 'z03', 'z22']), S('P04', 'Gorpcore', ['z11', 'z13', 'z17', 'z26', 'z20']),
  S('P05', 'Skate', ['z14', 'z19', 'z05', 'z21']), S('P06', 'Summit', ['z24', 'z23', 'z18', 'z04', 'z22']),
  S('P07', 'Tech', ['z25', 'z17', 'z02', 'z21']), S('P08', 'Stone', ['z13', 'z19', 'z06', 'z21']),
  S('P09', 'Cactus', ['z12', 'z19', 'z07']), S('P10', 'Heather', ['z15', 'z18', 'z04', 'z20'])],
}
HOODS = {'m07', 'm08', 'm09', 'm11', 'z09', 'z11', 'z12', 'z14', 'z24', 'z25'}
for i, it in list(items.items()):
    if not it.get('tex'): continue
    w, h = Image.open(os.path.join(V, it['tex'])).size
    it['ar'] = round(w / h, 4); it['hood'] = i in HOODS
    it.pop('poly', None)
for c, L in sets.items():
    for s in L:
        for i in s['ids']: assert i in items, i
items = {k: v for k, v in items.items() if v.get('tex')}
cat = {'rude': [i for i in items if i[0] in 'mt'], 'pz': [i for i in items if i[0] == 'z']}
DATA = json.dumps(dict(items=items, sets=sets, cat=cat), ensure_ascii=False, separators=(',', ':'))

CSS = r'''
body{height:100vh;overflow:hidden}
.hd{height:58px}
.app{display:grid;grid-template-columns:minmax(0,1fr) 452px;height:calc(100vh - 58px)}
#stage{position:relative;overflow:hidden;background:#f5f5f7}
#stage:before{content:"";position:absolute;left:50%;bottom:6.4%;width:min(52%,480px);aspect-ratio:5/1;transform:translateX(-50%);border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.09),rgba(0,0,0,0));z-index:0}
.man{position:absolute;left:47%;top:13%;bottom:8%;transform:translateX(-50%);aspect-ratio:10/19;z-index:1}
.man .L{position:absolute;transition:opacity .45s cubic-bezier(.2,.7,.2,1),transform .55s cubic-bezier(.2,.7,.2,1);filter:drop-shadow(0 14px 18px rgba(0,0,0,.14)) drop-shadow(0 2px 3px rgba(0,0,0,.08))}
.man .L img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}
.man .L.in{animation:put .6s cubic-bezier(.2,.7,.2,1) both}
.man .L.out{opacity:0;transform:translateY(-14px) scale(.97)}
@keyframes put{from{opacity:0;transform:translateY(-18px) scale(.97)}}
.man .ghost{position:absolute;border:1px dashed rgba(11,11,11,.16);display:grid;place-items:center;font:600 9px/1 var(--ui);letter-spacing:.14em;text-transform:uppercase;color:#b3b3b3;transition:opacity .3s;cursor:pointer}
.man .ghost:hover{border-color:var(--fg);color:var(--fg)}
.man .L{cursor:pointer}
.man .L:hover{filter:drop-shadow(0 14px 18px rgba(0,0,0,.18)) drop-shadow(0 0 0 #000) brightness(1.02)}
.man .tagx{position:absolute;font:600 9px/1 var(--ui);letter-spacing:.1em;text-transform:uppercase;white-space:nowrap;display:flex;align-items:center;gap:8px;opacity:0;transition:opacity .3s;pointer-events:none}
.man .tagx:before{content:"";width:22px;height:1px;background:var(--fg)}
.man .L:hover+.tagx,.man.lbl .tagx{opacity:1}
.ov{position:absolute;z-index:2;pointer-events:none}
.ov>*{pointer-events:auto}
.tl{left:28px;top:24px;right:28px;display:flex;justify-content:space-between;align-items:flex-start}
.kick{font:600 10px/1 var(--ui);letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}
.look h1{font:600 clamp(44px,5.4vw,84px)/.9 var(--ui);letter-spacing:-.055em;margin:22px 0 10px;text-transform:uppercase}
.look .nm{display:flex;gap:14px;align-items:center;font:500 12px/1 var(--ui);letter-spacing:.04em;text-transform:uppercase}
.look .nm b{font-weight:600}
.seg{display:flex;border:1px solid var(--fg);background:rgba(255,255,255,.55);backdrop-filter:blur(8px)}
.seg button{all:unset;cursor:pointer;padding:11px 16px;font:600 10.5px/1 var(--ui);letter-spacing:.09em;text-transform:uppercase;transition:background .25s,color .25s}
.seg button.on{background:var(--fg);color:#fff}
.bl{left:28px;bottom:24px;right:28px;display:flex;justify-content:space-between;align-items:flex-end}
.vw{display:flex;gap:2px}
.vw button,.ar button{all:unset;cursor:pointer;height:34px;padding:0 13px;display:grid;place-items:center;border:1px solid rgba(11,11,11,.14);background:rgba(255,255,255,.6);backdrop-filter:blur(8px);font:600 10px/1 var(--ui);letter-spacing:.09em;text-transform:uppercase;transition:border-color .2s,background .2s}
.vw button:hover,.ar button:hover{border-color:var(--fg)}
.vw button.on{background:var(--fg);color:#fff;border-color:var(--fg)}
.ar{display:flex;gap:2px;align-items:center}
.ar span{font:600 11px/1 var(--ui);letter-spacing:.08em;min-width:74px;text-align:center}
.hint{font:500 10px/1 var(--ui);letter-spacing:.12em;text-transform:uppercase;color:var(--mut)}
.pn{border-left:1px solid var(--line);display:flex;flex-direction:column;min-height:0;background:#fff}
.pn .sc{flex:1;overflow:auto;scrollbar-width:thin}
.hint{color:#6f6f6f}
.row .k,.row .x{color:#767676}
.sec{padding:20px 22px 6px}
.sec .ttl{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px}
.sets{mask-image:linear-gradient(90deg,#000 85%,transparent);display:grid;grid-auto-flow:column;grid-auto-columns:98px;gap:6px;overflow-x:auto;padding:0 22px 4px;scrollbar-width:none}
.st{all:unset;cursor:pointer;display:block}
.st .tm{position:relative;height:118px;background:#f5f5f7;overflow:hidden;outline:1px solid transparent;outline-offset:-1px;transition:outline-color .2s}
.st .tm img{position:absolute;object-fit:contain;filter:drop-shadow(0 4px 5px rgba(0,0,0,.12))}
.st b{display:flex;flex-direction:column;gap:4px;margin-top:8px;font:600 9.5px/1 var(--ui);letter-spacing:.08em;text-transform:uppercase}
.st b i{font-style:normal;color:var(--mut);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st.on .tm{outline-color:var(--fg)}
.st:hover .tm{outline-color:#bbb}
.rows{border-top:1px solid var(--line)}
.row{display:grid;grid-template-columns:64px 1fr auto;gap:14px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line);animation:in .45s cubic-bezier(.2,.7,.2,1) both}
@keyframes in{from{opacity:0;transform:translateY(6px)}}
.row .th{width:64px;height:72px;background:#f5f5f7;display:grid;place-items:center;overflow:hidden}
.row .th img{width:84%;height:84%;object-fit:contain}
.row .tx{display:flex;flex-direction:column;gap:4px;min-width:0}
.row .b{font:600 10px/1 var(--ui);letter-spacing:.09em;text-transform:uppercase}
.row .n{font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row .k{color:var(--mut);font-size:11px}
.row .rt{display:flex;flex-direction:column;align-items:flex-end;gap:8px}
.row .p{font:500 12px/1 var(--ui);white-space:nowrap}
.row .x{all:unset;cursor:pointer;font:600 9.5px/1 var(--ui);letter-spacing:.09em;text-transform:uppercase;color:var(--mut);border-bottom:1px solid transparent}
.row .x:hover{color:var(--fg);border-color:currentColor}
.row.empty{grid-template-columns:64px 1fr;color:var(--mut);cursor:pointer}
.row.empty .th{background:none;border:1px dashed #d4d4d4;font-size:16px;color:#aaa}
.row.empty:hover .th{border-color:var(--fg);color:var(--fg)}
.ft{display:flex;gap:16px;overflow-x:auto;scrollbar-width:none;margin-bottom:12px}
.ft button{all:unset;cursor:pointer;font:600 10px/1 var(--ui);letter-spacing:.09em;text-transform:uppercase;color:var(--mut);padding:4px 0;border-bottom:1px solid transparent;white-space:nowrap}
.ft button.on{color:var(--fg);border-color:var(--fg)}
.ft button sup{font-size:8px;margin-left:2px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px 4px;padding-bottom:22px}
.it{all:unset;cursor:pointer;display:block;min-width:0}
.it .tm{aspect-ratio:4/5;background:#f5f5f7;display:grid;place-items:center;position:relative;outline:1px solid transparent;outline-offset:-1px;transition:outline-color .2s}
.it .tm img{width:78%;height:78%;object-fit:contain;transition:transform .5s cubic-bezier(.2,.7,.2,1);filter:drop-shadow(0 6px 8px rgba(0,0,0,.1))}
.it:hover .tm img{transform:scale(1.05)}
.it .tm em{position:absolute;left:6px;top:6px;font:600 8.5px/1 var(--ui);letter-spacing:.08em;text-transform:uppercase;font-style:normal;background:var(--fg);color:#fff;padding:4px 5px;opacity:0;transform:translateY(-3px);transition:.25s}
.it .tm i{position:absolute;right:6px;bottom:6px;width:22px;height:22px;border-radius:50%;background:#fff;display:grid;place-items:center;font:500 14px/1 var(--ui);font-style:normal;opacity:0;transition:.25s;box-shadow:0 1px 3px rgba(0,0,0,.12)}
.it:hover .tm i{opacity:1}
.it.on .tm{outline-color:var(--fg)}
.it.on .tm em{opacity:1;transform:none}
.it.on .tm i{opacity:0}
.it .b{display:block;margin-top:7px;font:600 9.5px/1.2 var(--ui);letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.it .n{display:block;margin-top:3px;font-size:11px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.it .p{display:block;margin-top:3px;font:500 11px/1 var(--ui)}
.buy{border-top:1px solid var(--line);padding:14px 22px 16px;display:flex;align-items:center;gap:16px;background:#fff}
.buy .tt{display:flex;flex-direction:column;gap:5px}
.buy .tt span:last-child{font:600 18px/1 var(--ui);letter-spacing:-.02em}
.buy .btn{all:unset;cursor:pointer;margin-left:auto;background:var(--fg);color:#fff;padding:15px 22px;font:600 11px/1 var(--ui);letter-spacing:.09em;text-transform:uppercase;transition:opacity .2s}
.buy .btn:hover{opacity:.85}
.toast{position:absolute;left:50%;bottom:76px;transform:translate(-50%,10px);background:var(--fg);color:#fff;padding:10px 14px;font:600 10px/1 var(--ui);letter-spacing:.09em;text-transform:uppercase;opacity:0;transition:.3s;pointer-events:none;z-index:4;white-space:nowrap}
.toast.on{opacity:1;transform:translate(-50%,0)}
@media(max-width:900px){
 body{height:auto;overflow:auto}
 .app{grid-template-columns:minmax(0,1fr);height:auto}
 .pn{min-width:0}
 .hd .burger{margin-right:6px}
 .seg button{padding:13px 14px}
 .vw button,.ar button{height:40px}
 #stage{height:auto;min-height:0;aspect-ratio:auto;padding:0}
 #stage{height:680px}
 .man{top:170px;bottom:70px;left:46%}
 .tl{left:16px;right:16px;top:16px;flex-direction:column;gap:14px}
 .bl{left:16px;right:16px;bottom:14px}
 .look h1{font-size:44px;margin:10px 0 8px}
 .seg{align-self:flex-start}
 .seg button{padding:9px 12px}
 .hint{display:none}
 .pn{border-left:0;border-top:1px solid var(--line)}
 .pn .sc{overflow:visible}
 .sets{padding:0 16px 4px}.sec{padding:18px 16px 6px}
 .buy{position:sticky;bottom:0;padding:12px 16px;z-index:5}
 .hd .r span:not(:last-child),.hd nav{display:none}
}
'''

HTML = f'''<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Примерочная — The Rude Store</title><link rel="stylesheet" href="base.css"><style>{CSS}</style>
</head>
<body><header class="hd"><div style="display:flex;gap:18px;align-items:center"><span class="burger"></span><nav><a href="index.html">Rude Store</a><a href="pz.html">Poizon</a><a class="on" href="tryon.html">Примерочная</a></nav></div><a href="index.html"><span class="lg one" style="font-size:22px">Rudestore</span></a><div class="r"><span class="hide-m">Поиск</span><span class="hide-m">Аккаунт</span><span id="cartn">Корзина (0)</span></div></header>
<main class="app"><section id="stage">
<div class="man" id="man"></div>
<div class="ov tl"><div class="look"><div class="kick" id="kick">Примерочная</div><h1 id="code">R01</h1><div class="nm"><b id="lname">Taupe</b><span class="mut" id="lsum"></span></div></div>
<div class="seg" id="seg"><button data-c="rude">Rude Store</button><button data-c="pz">Poizon</button></div></div>
<div class="ov bl"><div class="vw" id="vw"><button data-v="all" class="on">Образ</button><button data-v="up">Верх</button><button data-v="low">Низ</button></div>
<span class="hint">Клик по вещи справа — надеть / снять</span>
<div class="ar"><button id="prev"><svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M13 5H1M5 1L1 5l4 4"/></svg></button><span id="cnt">01 / 10</span><button id="next"><svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M1 5h12M9 1l4 4-4 4"/></svg></button></div></div>
<div class="toast" id="toast"></div>
</section>
<aside class="pn"><div class="sc">
<div class="sec"><div class="ttl"><span class="h">Образы</span><span class="kick" id="setsn">10 готовых</span></div></div>
<div class="sets" id="sets"></div>
<div class="sec"><div class="ttl"><span class="h">На манекене</span><span class="kick" id="wn"></span></div><div class="rows" id="rows"></div></div>
<div class="sec"><div class="ttl"><span class="h">Добавить вещь</span><span class="kick" id="catn"></span></div><div class="ft" id="ft"></div><div class="grid3" id="grid"></div></div>
</div><div class="buy"><div class="tt"><span class="kick">Образ целиком</span><span id="tot">0 ₽</span></div><button class="btn" id="buy">Образ в корзину</button></div></aside></main>
<script>window.TRY={DATA};if(location.hash=="#shot")document.body.classList.add("shot")</script>
<script src="tryon.js"></script></body></html>'''
open(os.path.join(V, 'tryon.html'), 'w', encoding='utf-8').write(HTML)
print('tryon.html', len(HTML), 'items', len(items))
