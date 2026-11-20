from PIL import Image; import numpy as np
a=np.array(Image.open('logotest.png').convert('L'))<100
def lines(m):
    rows=np.where(m.sum(1)>0)[0]; segs=[];s=p=rows[0]
    for r in rows[1:]:
        if r-p>3: segs.append((s,p)); s=r
        p=r
    segs.append((s,p)); out=[]
    for x,y in segs:
        if y-x<15: continue
        c=np.where(m[x:y+1].sum(0))[0]; out.append((int(x),int(y),int(c[-1]-c[0]+1),round(m[x:y+1].sum()/(y-x+1)/(c[-1]-c[0]+1),3)))
    return out
print('L',lines(a[:,:678])); print('R',lines(a[:,678:]))
