import glob
exec(open('fontscore.py').read().split("fonts=glob")[0])
fp=glob.glob('C:/Users/maya/AppData/Local/Temp/trsfont/**/Marcellus-Regular.ttf',recursive=True)[0]
best=[]
for st in (3,4,5,6,7):
  for ls in (0.06,0.07,0.08,0.09,0.1,0.11):
    sc=[iou(refs[i],render(fp,words[i],ls,st)) for i in range(3)]
    best.append((round(sum(x[0] for x in sc)/3,4),st,ls,[round(x[0],3) for x in sc]))
best.sort(reverse=True); print(best[:6])
# geometry of ref: line heights & gaps, widths
print('segs',segs,'widths',[r.shape[1] for r in refs])
import numpy as np
from PIL import Image
a=np.array(Image.open(REF).convert('RGB')); print('ink color',a[m].mean(0).astype(int),'bg',a[~m].mean(0).astype(int))
