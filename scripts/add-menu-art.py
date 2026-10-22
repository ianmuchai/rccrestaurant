from pathlib import Path
import pymupdf
doc=pymupdf.open('C:/Users/Administrator/Downloads/RCC FOOD MENU 3 (5).pdf')
for name,pi,box in [('suqaar',3,(0,.24,.41,.45)),('curry',3,(0,.45,.41,.70)),('fish',3,(0,.70,.41,1)),('coffee',7,(0,.77,.41,1)),('tea',7,(0,0,.41,.25)),('platter',4,(0,.05,.41,.43))]:
 p=doc[pi];w,h=p.rect.width,p.rect.height
 p.get_pixmap(matrix=pymupdf.Matrix(2,2),clip=pymupdf.Rect(box[0]*w,box[1]*h,box[2]*w,box[3]*h)).save('public/assets/'+name+'.png')
p=Path('app/components/Storefront.tsx');s=p.read_text(encoding='utf8')
s=s.replace("const c=item.category.toLowerCase();if(/pizza/", "const c=item.category.toLowerCase(),n=item.name.toLowerCase();if(/suqaar|alesso|arosto|kostato/.test(n))return '/assets/suqaar.webp';if(/curry|biryani/.test(n))return '/assets/curry.webp';if(/fish|salmon/.test(n))return '/assets/fish.webp';if(/chicken/.test(n)&&!/pizza/.test(c))return '/assets/grill.webp';if(c==='platters')return '/assets/platter.webp';if(/tea/.test(c))return '/assets/tea.webp';if(/pizza/")
p.write_text(s,encoding='utf8')
print('Additional food photography extracted from original PDF.')
