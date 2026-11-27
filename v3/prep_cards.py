# карточки Poizon (imgz/zXX.jpg, 4:5 на плитке) и обложки-кампейны (imgz/c_*.jpg) из чистых вырезок cut/
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
V = os.path.dirname(os.path.abspath(__file__))
TILE = (247, 244, 241)
Z = json.load(open(V + '/pz.json', encoding='utf-8'))

def contact(w, h, k=0.5):
    s = Image.new('L', (w, h), 0); d = ImageDraw.Draw(s)
    d.ellipse((w * 0.08, h * 0.3, w * 0.92, h * 0.7), fill=int(255 * k))
    return s.filter(ImageFilter.GaussianBlur(h * 0.22))

def place(can, im, cx, base, maxw, maxh, shadow=0.32, dark=False):
    im = im.copy(); im.thumbnail((int(maxw), int(maxh)), Image.LANCZOS)
    x, y = int(cx - im.width / 2), int(base - im.height)
    sh = contact(int(im.width * 1.1), max(30, int(im.width * 0.16)), shadow * (1.4 if dark else 1))
    col = Image.new('RGBA', sh.size, (0, 0, 0, 255)); col.putalpha(sh)
    can.alpha_composite(col, (int(cx - sh.width / 2), int(base - sh.height * 0.55)))
    a = im.split()[-1].point(lambda v: int(v * 0.18))
    soft = Image.new('RGBA', im.size, (0, 0, 0, 255)); soft.putalpha(a); soft = soft.filter(ImageFilter.GaussianBlur(14))
    can.alpha_composite(soft, (x + 6, y + 14)); can.alpha_composite(im, (x, y))

# карточки
for p in Z:
    im = Image.open(f"{V}/cut/{p['id']}.webp").convert('RGBA')
    W, H = 800, 1000; can = Image.new('RGBA', (W, H), TILE + (255,))
    k = p['kind']
    wide = im.width / im.height > 1.3
    mw, mh = (W * 0.8, H * 0.42) if wide else (W * 0.74, H * 0.7)
    place(can, im, W / 2, H * (0.66 if wide else 0.86), mw, mh, 0.22)
    can.convert('RGB').save(f"{V}/imgz/{p['id']}.jpg", quality=88)

def cover(path, size, items, bg=(26, 26, 28), glow=(64, 64, 68)):
    W, H = size; can = Image.new('RGBA', (W, H), bg + (255,))
    g = Image.new('L', (W, H), 0); d = ImageDraw.Draw(g)
    d.ellipse((W * 0.15, H * 0.05, W * 0.85, H * 1.1), fill=255); g = g.filter(ImageFilter.GaussianBlur(min(W, H) * 0.25))
    can = Image.composite(Image.new('RGBA', (W, H), glow + (255,)), can, g)
    floor = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fd = ImageDraw.Draw(floor)
    for f, cx, base, mw, mh in items:
        place(can, Image.open(f'{V}/cut/{f}.webp').convert('RGBA'), cx * W, base * H, mw * W, mh * H, 0.55, True)
    can.convert('RGB').save(path, quality=90)

# обложки: одна вещь-герой по центру, без «коллажа»; светлая студия #ededef -> #f7f7f8
def hero(path, size, f, cx, base, mw, mh, bg=(20, 20, 22), glow=(58, 58, 62)):
    W, H = size; can = Image.new('RGBA', (W, H), bg + (255,))
    g = Image.new('L', (W, H), 0); d = ImageDraw.Draw(g)
    d.ellipse((cx * W - W * 0.38, H * 0.0, cx * W + W * 0.38, H * 1.0), fill=255); g = g.filter(ImageFilter.GaussianBlur(min(W, H) * 0.2))
    can = Image.composite(Image.new('RGBA', (W, H), glow + (255,)), can, g)
    place(can, Image.open(f'{V}/cut/{f}.webp').convert('RGBA'), cx * W, base * H, mw * W, mh * H, 0.6, True)
    can.convert('RGB').save(path, quality=90)
hero(V + '/imgz/c_sq.jpg', (1400, 1400), 'z08', 0.5, 0.86, 0.72, 0.7)
hero(V + '/imgz/c_wide.jpg', (2400, 1200), 'z10', 0.7, 0.9, 0.34, 0.78)
hero(V + '/imgz/c_tall.jpg', (1000, 1500), 'z24', 0.5, 0.84, 0.8, 0.66)
hero(V + '/imgz/c_shoe.jpg', (1400, 1400), 'z05', 0.5, 0.66, 0.78, 0.4)
print('ok', len(Z))
