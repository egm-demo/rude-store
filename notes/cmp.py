from PIL import Image,ImageDraw,ImageFont,ImageOps
import numpy as np
T=r'C:\Users\maya\AppData\Local\Temp\trsfont'
import glob
def find(n): return glob.glob(T+'/**/'+n,recursive=True)[0]
cands=[('Marcellus',find('Marcellus-Regular.ttf'),4,0.08),('GilliusNo2',find('GilliusADFNo2-Regular.otf'),2,0.08),('AlegreyaSans',find('AlegreyaSans-Regular.ttf'),2,0.06),('TenorSans',r'x',0,0.04)]
import os
ten=glob.glob(T+r'\**\Tenor*.ttf',recursive=True); cands[3]=('TenorSans',ten[0],2,0.04) if ten else cands[3]
ref=ImageOps.grayscale(Image.open(r'C:\Users\maya\Downloads\photo_2026-11-19_03-39-54.jpg'))
m=np.array(ref)<128; r=np.where(m.sum(1))[0]; c=np.where(m.sum(0))[0]
refc=ref.crop((c[0]-5,r[0]-5,c[-1]+5,r[-1]+5)); H=refc.size[1]
def block(fp,st,ls):
    f=ImageFont.truetype(fp,200); lines=['THE','RUDE','STORE']
    img=Image.new('L',(1400,800),255); d=ImageDraw.Draw(img); y=10
    for w in lines:
        L=sum(f.getlength(ch)+ls*200 for ch in w)-ls*200; x=700-L/2
        for ch in w: d.text((x,y),ch,font=f,fill=0,stroke_width=st,stroke_fill=0); x+=f.getlength(ch)+ls*200
        y+=200*0.95
    a=np.array(img)<128; rr=np.where(a.sum(1))[0]; cc=np.where(a.sum(0))[0]
    b=img.crop((cc[0]-5,rr[0]-5,cc[-1]+5,rr[-1]+5)); return b.resize((int(b.size[0]*H/b.size[1]),H))
cols=[('REF',refc)]+[(n,block(fp,st,ls)) for n,fp,st,ls in cands if os.path.exists(fp)]
W=sum(i.size[0]+20 for _,i in cols); out=Image.new('L',(W,H+40),255); d=ImageDraw.Draw(out); x=0
for n,i in cols: out.paste(i,(x,40)); d.text((x+5,5),n,fill=0,font=ImageFont.truetype(r'C:\Windows\Fonts\arial.ttf',28)); x+=i.size[0]+20
out.save('cmp.png'); print([n for n,_ in cols])
