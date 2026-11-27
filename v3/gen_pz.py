# 20 экранов The Rude Store × Poizon: тот же каркас gen.py, данные — топ продаж Poizon (pz.json), вывод в pz/
import json, os, re
V = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(V, 'pz'); os.makedirs(OUT, exist_ok=True)
Z = json.load(open(os.path.join(V, 'pz.json'), encoding='utf-8'))
src = open(os.path.join(V, 'gen.py'), encoding='utf-8').read()

# 1) id-подмена: Monterest -> верх/куртки Poizon, Topologie -> обувь/сумки/низ Poizon
MAP = {'m00': 'z08', 'm01': 'z09', 'm02': 'z24', 'm03': 'z15', 'm04': 'z10', 'm05': 'z11', 'm06': 'z14', 'm07': 'z25', 'm08': 'z12',
       'm09': 'z13', 'm10': 'z16', 'm11': 'z23', 'm12': 'z17', 'm14': 'z18', 'm15': 'z19',
       't00': 'z01', 't01': 'z02', 't02': 'z03', 't03': 'z04', 't04': 'z07', 't05': 'z05', 't06': 'z06', 't07': 'z01', 't08': 'z26',
       't09': 'z20', 't10': 'z07', 't11': 'z21', 't12': 'z22', 't13': 'z03', 't15': 'z04', 't17': 'z05'}
# внутри одного экрана не должно быть дублей — t07/t13/t10 у исходника самые частые, разводим
MAP.update({'t07': 'z01', 't13': 'z03', 't10': 'z07', 't04': 'z05', 't02': 'z04', 't12': 'z22', 't09': 'z20', 't01': 'z26'})
for k, v in MAP.items():
    src = re.sub(rf"(['\"]){k}\1", rf"\g<1>{v}\1", src)

# точечные замены, чтобы не было дублей на одном экране
src = src.replace('cards(["z08","z01","z10","z03","z14","z01","z23","z07"])', 'cards(["z08","z01","z10","z03","z14","z02","z23","z07"])')
src = src.replace("['z08','z01','z09','z03','z12','z05','z10','z07','z16','z22','z19','z20']", "['z08','z01','z09','z03','z12','z05','z10','z07','z16','z22','z19','z20']")
src = src.replace('cards(["z08","z01"])}</div></div></section>', 'cards(["z24","z02"])}</div></div></section>')
# 2) тексты
REP = [
 ("P = {p['id']: p for p in json.loads(open(os.path.join(V, 'data.js'), encoding='utf-8').read()[9:-1])}",
  "P = {p['id']: p for p in json.load(open(os.path.join(V, 'pz.json'), encoding='utf-8'))}"),
 ("pk = ' class=\"pk\"' if p['b'] == 'Topologie' else ' style=\"object-position:50% 22%\"'", "pk = ''"),
 ('href="{p["src"]}"', 'href="{p["src"]}"'),
 ("[('Все', 31), ('Monterest', 15), ('Topologie', 16), ('Куртки', 10), ('Флис', 3), ('Брюки', 2), ('Сумки', 16)]",
  "[('Все', 26), ('Обувь', 8), ('Куртки', 6), ('Худи', 4), ('Футболки', 2), ('Брюки', 3), ('Сумки', 3)]"),
 ('New in — Monterest / Topologie', 'Топ продаж Poizon — ноябрь'), ('Смотреть все 31', 'Смотреть все 26'),
 ('Слева кампейн Monterest, справа сетка 2×2. Два бренда в одном кадре.', 'Слева Nuptse крупно, справа 2×2 из топа Poizon.'),
 ('Monterest — FW26', 'The North Face — 1996 Nuptse'),
 ('Стек THE/RUDE/STORE Кирилла как герой, справа три карточки.', 'Стек THE/RUDE/STORE как герой, справа три хита Poizon.'),
 ('Monterest — горы, пух 1000FP.<br>Topologie — сумки и обвесы из Гонконга.', 'Самое продаваемое на Poizon.<br>Оригинал, проверка, доставка из Китая.'),
 ('Monterest × Topologie · Зима 26', 'Poizon · топ продаж · Зима 26'),
 ('Чёрный фон, названия брендов крупно как навигация, 4 карточки.', 'Чёрный фон, бренды-лидеры Poizon крупно, 4 карточки.'),
 ('<a href="#">Monterest<sup>15</sup></a><a href="#">Topologie<sup>16</sup></a>', '<a href="#">Nike<sup>6</sup></a><a href="#">New Balance<sup>3</sup></a>'),
 ('Индекс брендов текстом слева (как на slamjam), справа 2 крупные карточки.', 'Индекс брендов Poizon слева, справа 2 крупные карточки.'),
 ("[('Monterest','15','on'),('Topologie','16','on'),('Arc’teryx','скоро',''),('And Wander','скоро',''),('Gramicci','скоро',''),('Snow Peak','скоро',''),('Goldwin','скоро','')]",
  "[('Nike','6','on'),('New Balance','3','on'),('The North Face','2','on'),('Carhartt WIP','2','on'),('Asics','2','on'),('Jordan','2','on'),('Stone Island','1','on'),('Arc’teryx','1','on')]"),
 ('Экран поделён на два бренда: заголовок + 3 карточки в каждой половине.', 'Экран поделён: одежда и обувь Poizon, по 2 хита.'),
 ("('Monterest', 'Япония · горы', ['z08','z25']), ('Topologie', 'Гонконг · сумки', ['z01','z04'])", "('Одежда', 'топ продаж', ['z08','z25']), ('Обувь', 'топ продаж', ['z01','z04'])"),
 ('31 вещь · Monterest, Topologie', '26 вещей · топ продаж Poizon'),
 ('Пух 800–1000FP от Monterest.<br>Сумки Topologie на каждый день.', 'Nuptse, Dunk, 9060.<br>То, что берут чаще всего.'),
 ('Mountain<br>&amp; Utility', 'Poizon<br>Top 26'),
 ('Один флагман по центру (Twin Peaks 950FP), сбоку характеристики и миниатюры.', 'Один флагман по центру (Nuptse 1996), сбоку характеристики и миниатюры.'),
 ('<span class="h">Monterest</span><h1>Twin Peaks PRO<br>950FP Down</h1>', '<span class="h">The North Face</span><h1>1996 Retro<br>Nuptse</h1>'),
 ('<dt>Пух</dt><dd>950FP гусиный</dd><dt>Ткань</dt><dd>PERTEX® Quantum</dd><dt>Цвет</dt><dd>Grey</dd>', '<dt>Пух</dt><dd>700FP</dd><dt>Продано</dt><dd>26 тыс. на Poizon</dd><dt>Цвет</dt><dd>Print</dd>'),
 ('img/m00_1.jpg', 'imgz/z08.jpg'),
 ("TABS('Monterest')", "TABS('Обувь')"), ('tag="1000FP"', 'tag="Хит"'),
 ("'MONTEREST', 'TOPOLOGIE'", "'NIKE', 'NEW BALANCE', 'THE NORTH FACE'"), ('Новое · 31', 'Топ Poizon · 26'),
 ('Пары: модель Monterest + сумка Topologie. Показывает, как бренды сочетаются.', 'Пары: верх + обувь. Как хиты Poizon сочетаются.'),
 ('Куртка + сумка — уже подобрали', 'Верх + обувь — уже подобрали'),
 ('FW26 — Mountain / Utility', 'Poizon — топ продаж'),
 ('Узкая вертикальная обложка Monterest слева, заголовок и 2×2 сетка справа.', 'Узкая обложка (TNF Challenge) слева, заголовок и 2×2 справа.'),
 ('Monterest и Topologie — теперь в Rude.', 'Топ Poizon — теперь в Rude.'),
 ('Переключатель коллекций (рабочий): Все / Monterest / Topologie, карточки меняются.', 'Переключатель (рабочий): Все / Одежда / Обувь, карточки меняются.'),
 ('<button class="on" data-b="all">Все</button><button data-b="Monterest">Monterest</button><button data-b="Topologie">Topologie</button>',
  '<button class="on" data-b="all">Все</button><button data-b="Wear">Одежда</button><button data-b="Kicks">Обувь</button>'),
 ("card(i).replace('class=\"c ', f'class=\"c {P[i][\"b\"]} ')", "card(i).replace('class=\"c ', f'class=\"c {\"Kicks\" if P[i][\"slot\"] == \"shoes\" else \"Wear\"} ')"),
 ('Кампейн на фоне, белая панель с 3 карточками стоит поверх справа снизу.', 'Кампейн на фоне, белая панель с 3 карточками поверх.'),
 ('Monterest — 1000FP', 'Carhartt WIP — Detroit J97'), ('Все 31', 'Все 26'),
 ("data-img=\"{P[i][\"img\"]}\"", "data-img=\"{P[i][\"img\"]}\""),
 ('i.className=r.dataset.img.includes(\\"imgw\\")?\\"pk\\":\\"\\";', ''),
 ('Мой фаворит: бар, центр-лого, табы брендов, кампейн 50% + 3 карточки. Всё в 1 экран.', 'Мой фаворит: бар, табы, кампейн 50% + 3 хита Poizon. Всё в 1 экран.'),
 ('× Monterest · × Topologie', '× Poizon · топ продаж'),
 ('Кампейн на весь экран, лого белым, снизу полоса из 6 товаров.', 'Кампейн на весь экран, снизу полоса из 6 хитов Poizon.'),
 ('Лого RUDESTORE вертикально по левому краю, справа сетка 4×1 и подпись сезона.', 'Лого RUDESTORE вертикально, справа 4 хита Poizon.'),
 ('Фон #f5f5f7, плитки сливаются с фоном, крупный плотный заголовок по центру.', 'Фон #f5f5f7, плитки сливаются с фоном, крупный заголовок.'),
 ('Зима.<br>Без лишнего.', 'Топ Poizon.<br>Без лишнего.'),
 ('20 первых экранов · Monterest / Topologie<br>референс: slamjam.com', '20 экранов · топ продаж Poizon<br>Цены и «продано» — с poizon.com, 27.11.2026'),
 ('<title>The Rude Store — 20 первых экранов</title>', '<title>The Rude Store × Poizon — 20 экранов</title>'),
 ('Центр-лого, табы брендов, ровная сетка из 4. Ближе всего к slamjam.com.', 'Центр-лого, табы категорий, ровная сетка из 4 хитов Poizon.'),
 ('Список товаров строками (код, бренд, цена), превью фото по наведению + 2 карточки.', 'Список хитов строками (бренд, модель, продано), превью по наведению.'),
 ('Бегущая строка с тоном Rude, плотная сетка 6 колонок, как каталог slamjam.', 'Бегущая строка, плотная сетка 6 колонок — каталог Poizon.'),
 ('Центральный заголовок-сезон, по бокам по 2 товара. Журнальная подача.', 'Центральный заголовок, по бокам хиты. Журнальная подача.'),
 ('Одна большая карточка + 4 малых. Асимметрия, но единый ритм подписей.', 'Одна большая (Dunk Panda) + 4 малых.'),
 ('Заголовок крупным гротеском, под ним горизонтальная лента из 8 карточек.', 'Заголовок крупным гротеском, лента из 8 хитов Poizon.'),
 ('img/c_', 'imgz/c_'),
]
for a, b in REP:
    src = src.replace(a, b)
# цвет в «Line List» -> «продано»
src = src.replace('<span>{P[i]["c"]}</span><span>{rub(P[i]["p"])}</span>', '<span>{P[i]["sold"]}</span><span>{rub(P[i]["p"])}</span>')
src = src.replace('<span>Цвет</span><span>Цена</span>', '<span>Продано</span><span>Цена</span>')
# пути: страницы в pz/, ассеты на уровень выше
src = src.replace("open(os.path.join(V, f'{n:02d}.html'), 'w'", "open(os.path.join(OUT, f'{n:02d}.html'), 'w'")
src = src.replace("open(os.path.join(V, 'index.html'), 'w'", "open(os.path.join(OUT, 'index.html'), 'w'")
src = src.replace('<link rel="stylesheet" href="base.css">', '<link rel="stylesheet" href="../base.css"><link rel="stylesheet" href="pz.css">')
src = src.replace('src="{p["img"]}"', 'src="../{p["img"]}"').replace('src="imgz/', 'src="../imgz/').replace("i.src=r.dataset.img", 'i.src=\\"../\\"+r.dataset.img')
src = src.replace('<a href="index.html">Все</a>', '<a href="index.html">Все</a><a href="../tryon.html?c=pz">Примерочная</a>')
src = src.replace('<span class="b">{p["b"]}</span><span class="p">{rub(p["p"])}</span><span class="n">{p["n"]}</span><span class="k">{p["c"]}</span>',
                  '<span class="b">{p["b"]}</span><span class="p">{rub(p["p"])}</span><span class="n">{p["n"]}</span><span class="k">{p["c"]} · продано {p["sold"]}</span>')
src = src.replace("V = os.path.dirname(os.path.abspath(__file__))", "V = os.path.dirname(os.path.abspath(__file__))\nOUT = os.path.join(V, 'pz')", 1)
src = src.replace('src="shots/', 'src="shots/')
# навигация: ссылка на примерочную в меню
src = src.replace('<a href="#">Sale</a></nav>', '<a href="#">Sale</a><a href="../tryon.html?c=pz">Примерочная</a></nav>')
exec(compile(src, 'gen_pz', 'exec'))
open(os.path.join(OUT, 'pz.css'), 'w', encoding='utf-8').write(
    '.c .im img{object-fit:contain!important;object-position:50% 50%!important}.s02 .cover img,.s04 .cover img,.s15 .cover img,.s20 .cover img,.bgimg{object-fit:cover!important}.c .k{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    '.vlab a+a+a+a{border-left:1px solid rgba(255,255,255,.25);padding-left:10px}')
