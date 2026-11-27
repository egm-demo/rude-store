# чистые вырезки через rembg (isnet-general-use / birefnet), контуры сумок, светлые обложки с тенями
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from rembg import remove, new_session
V = os.path.dirname(os.path.abspath(__file__))
T = os.environ.get('TMPDIR', '.') + '/tryon'
MODEL = sys.argv[1] if len(sys.argv) > 1 else 'isnet-general-use'
ses = new_session(MODEL)
os.makedirs(V + '/cut', exist_ok=True)

Z = {1:'z01',0:'z02',7:'z03',4:'z04',3:'z05',5:'z06',2:'z07',20:'z08',9:'z09',13:'z10',15:'z11',14:'z12',11:'z13',17:'z14',12:'z15',10:'z16',16:'z17',18:'z18',22:'z19',26:'z20',25:'z21',24:'z22',21:'z23',19:'z24',23:'z25',6:'z26'}
SRC = {i: f'{T}/pz/{k:02d}.jpg' for k, i in Z.items()}
for f in sorted(os.listdir(V + '/imgp')):
    if f.endswith('_0.jpg'):
        i = f[:3]; SRC[i] = V + '/imgw/' + f if os.path.exists(V + '/imgw/' + f) else V + '/imgp/' + f

def cut(path):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    if max(w, h) < 1100:  # апскейл до модели — ровнее край
        k = 1100 / max(w, h); im = im.resize((int(w * k), int(h * k)), Image.LANCZOS)
    out = remove(im, session=ses, post_process_mask=True)
    a = out.split()[-1]
    # снимаем светлую кайму: альфу чуть сжать по краю
    a = a.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    out.putalpha(a)
    bb = a.point(lambda v: 255 if v > 30 else 0).getbbox()
    return out.crop(bb)

def contour(img, rows=44):
    a = np.asarray(img.split()[-1]) > 110
    h, w = a.shape; L, R = [], []
    for k in range(rows + 1):
        y = min(h - 1, int(k * (h - 1) / rows)); xs = np.nonzero(a[y])[0]
        if len(xs) < 2: continue
        yy = 1 - y / (h - 1)
        L.append([round(xs[0] / (w - 1), 4), round(yy, 4)]); R.append([round(xs[-1] / (w - 1), 4), round(yy, 4)])
    return L + R[::-1], round(w / h, 4)

only = set(sys.argv[2:])
meta = json.load(open(V + '/bags.json')) if os.path.exists(V + '/bags.json') else {}
for i, p in SRC.items():
    if only and i not in only: continue
    c = cut(p); c.thumbnail((900, 900), Image.LANCZOS); c.save(f'{V}/cut/{i}.webp', quality=90)
    if i[0] == 't' or i in ('z20', 'z21', 'z22'):
        poly, ar = contour(c); meta[i] = dict(poly=poly, ar=ar)
    print(i, c.size, flush=True)
json.dump(meta, open(V + '/bags.json', 'w'), separators=(',', ':'))
