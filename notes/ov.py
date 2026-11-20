import glob
from PIL import Image,ImageDraw,ImageFont,ImageOps
import numpy as np
exec(open('fontscore.py').read().split("fonts=glob")[0])
T='C:/Users/maya/AppData/Local/Temp/trsfont'
C=[('Marcellus','Marcellus-Regular.ttf',4,0.08),('GilliusNo2','GilliusADFNo2-Regular.otf',2,0.08),('Tenor','TenorSans-Regular.ttf',4,0.0),('Classico','URWClassico-Regular.otf',4,0.04),('Alegreya','AlegreyaSans-Regular.ttf',2,0.06)]
tiles=[]
for n,f,st,ls in C:
    fp=glob.glob(T+'/**/'+f,recursive=True)[0]; row=[]
    for i,w in enumerate(words):
        ref=refs[i]; ren=render(fp,w,ls,st); h=ref.shape[0]; ww=int(ren.shape[1]*h/ren.shape[0])
        r=np.array(Image.fromarray(ren.astype(np.uint8)*255).resize((ww,h)))>128
        W=max(ww,ref.shape[1]); img=np.full((h,W,3),255,np.uint8)
        A=np.zeros((h,W),bool);B=np.zeros((h,W),bool);A[:,:ref.shape[1]]=ref;B[:,:ww]=r
        img[A&~B]=(230,0,0); img[B&~A]=(0,90,255); img[A&B]=(0,0,0); row.append(Image.fromarray(img))
    H=sum(x.size[1]+10 for x in row)+40; Wt=max(x.size[0] for x in row)+10
    t=Image.new('RGB',(Wt,H),'white'); d=ImageDraw.Draw(t); d.text((5,5),n,fill=0,font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',26)); y=40
    for x in row: t.paste(x,(5,y)); y+=x.size[1]+10
    tiles.append(t)
W=sum(t.size[0]+15 for t in tiles); H=max(t.size[1] for t in tiles); o=Image.new('RGB',(W,H),'white'); x=0
for t in tiles: o.paste(t,(x,0)); x+=t.size[0]+15
o.save('overlay.png'); print(o.size)
