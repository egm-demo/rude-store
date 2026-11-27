# Monterest: вырезка одежды с фото на модели (u2net_cloth_seg) + удаление лица/рук (кожа в зонах) -> cut/mXX.webp
import sys, os
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from rembg import new_session, remove
V = 'C:/Users/maya/TheRudeStore/v3'
O = 'C:/Users/maya/AppData/Local/Temp/tryon/mseg'
os.makedirs(O, exist_ok=True)
cs = new_session('u2net_cloth_seg'); hs = new_session('isnet-general-use')

def skin(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    y = 0.299 * r + 0.587 * g + 0.114 * b
    cr = 128 + 0.713 * (r - y); cb = 128 + 0.564 * (b - y)
    return (cr > 136) & (cr < 175) & (cb > 85) & (cb < 128) & (y > 70) & (r > g) & (g > b * 0.9)

def run(f, part):
    im = Image.open(f'{V}/img/{f}.jpg').convert('RGB')
    m = cs.predict(im)[0 if part == 'up' else 1].convert('L').resize(im.size)
    person = remove(im, session=hs, only_mask=True).resize(im.size)
    a = np.asarray(im); M = (np.asarray(m) > 100) & (np.asarray(person) > 100)
    h, w = M.shape
    ys = np.nonzero(M.any(axis=1))[0]
    if len(ys) == 0: return None
    y0, y1 = ys[0], ys[-1]; H = y1 - y0
    sk = skin(a)
    zone = np.zeros_like(M)
    zone[y0:int(y0 + H * 0.38)] = True  # лицо в капюшоне/воротнике
    zone[int(y1 - H * 0.3):] = True      # кисти
    M = M & ~(sk & zone)
    if part == 'low':  # обрезать обувь: ниже самой узкой «щиколотки»
        rows = M.sum(axis=1)
        lo = int(y0 + H * 0.8)
        seg = rows[lo:y1 + 1]
        if len(seg) > 5:
            k = lo + int(np.argmin(seg[:max(1, int(len(seg) * 0.85))]))
            M[k + 2:] = False
    al = Image.fromarray((M * 255).astype('uint8')).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    out = im.convert('RGBA'); out.putalpha(al)
    bb = al.point(lambda v: 255 if v > 40 else 0).getbbox()
    return out.crop(bb)

for spec in sys.argv[1:]:
    f, part = spec.split(':')
    c = run(f, part)
    if c is None: print(spec, 'EMPTY'); continue
    c.save(f'{O}/{f}_{part}.png')
    print(spec, c.size, flush=True)
