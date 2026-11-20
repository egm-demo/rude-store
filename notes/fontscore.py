import glob,os,json,sys
from PIL import Image,ImageDraw,ImageFont,ImageOps
import numpy as np
REF=r'C:\Users\maya\Downloads\photo_2026-11-19_03-39-54.jpg'
im=np.array(ImageOps.grayscale(Image.open(REF)))
m=im<128
rows=np.where(m.sum(1)>0)[0]
# segment lines
segs=[];s=rows[0];p=rows[0]
for r in rows[1:]:
    if r-p>3: segs.append((s,p)); s=r
    p=r
segs.append((s,p))
segs=[g for g in segs if g[1]-g[0]>20][:3]
refs=[]
for a,b in segs:
    sub=m[a:b+1]; cols=np.where(sub.sum(0)>0)[0]; refs.append(sub[:,cols[0]:cols[-1]+1])
words=['THE','RUDE','STORE']
def render(fp,w,ls,stroke=0,var=None):
    f=ImageFont.truetype(fp,200)
    if var is not None:
        try: f.set_variation_by_axes([var])
        except Exception: pass
    x=0;img=Image.new('L',(1600,400),0);d=ImageDraw.Draw(img)
    for ch in w:
        d.text((x+10,50),ch,font=f,fill=255,stroke_width=stroke,stroke_fill=255); x+=f.getlength(ch)+ls*200
    a=np.array(img)>128; r=np.where(a.sum(1))[0]; c=np.where(a.sum(0))[0]
    return a[r[0]:r[-1]+1,c[0]:c[-1]+1]
def iou(ref,ren):
    h=ref.shape[0]; s=h/ren.shape[0]
    w=max(1,int(round(ren.shape[1]*s)))
    r=np.array(Image.fromarray(ren.astype(np.uint8)*255).resize((w,h),Image.LANCZOS))>128
    W=max(w,ref.shape[1]); A=np.zeros((h,W),bool);B=np.zeros((h,W),bool)
    A[:,:ref.shape[1]]=ref; B[:,:w]=r
    return (A&B).sum()/max(1,(A|B).sum()), w/ref.shape[1]
fonts=glob.glob(r'C:\Users\maya\AppData\Local\Temp\trsfont\**\*.[ot]tf',recursive=True)+[r'C:\Windows\Fonts\Inter-Variable.ttf']
res=[]
for fp in fonts:
    vars_=[None]
    try:
        f=ImageFont.truetype(fp,200); ax=f.get_variation_axes(); vars_=[ax[0]['minimum']+(ax[0]['maximum']-ax[0]['minimum'])*k for k in (0.15,0.3,0.45,0.6)] if ax else [None]
    except Exception: pass
    for v in vars_:
      for st in (0,2,4):
        best=None
        for ls in (0,0.02,0.04,0.06,0.08,0.1):
            try: sc=[iou(refs[i],render(fp,words[i],ls,st,v)) for i in range(3)]
            except Exception as e: sc=None; break
            mean=sum(x[0] for x in sc)/3
            if not best or mean>best[0]: best=(mean,ls,[round(x[1],3) for x in sc])
        if best: res.append((round(best[0],4),os.path.basename(fp),v,st,best[1],best[2]))
res.sort(reverse=True)
for r in res[:25]: print(r)
json.dump(res,open(r'C:\Users\maya\TheRudeStore\notes\fontscore.json','w'),default=str)
