"""Import the supplied RCC PDF as catalog data, keeping page provenance."""
import json, re, shutil
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('C:/Users/Administrator/Downloads')
doc = pymupdf.open(SOURCE / 'RCC FOOD MENU 3 (5).pdf')
headings = {'BREAKFAST','EGGS OF YOUR CHOICE','BREAKFAST EXTRAS','SNACKS AND BITES','HEALTHY SOUPS','WHOLESOME SALAD','SOMALI AND ARAB CUISINE','RCC SPECIALS AND CURRIES','RCC GRILLS','PLATTERS','RICE SIDE DISHES','SIDE DISHES','PASTA CORNER','FRIES','GOURMET BURGERS','GOURMET SANDWICH',"KID’S CORNER",'TEA','COFFEE','ICED COFFEE/TEA','MATCHA','EXTRAS','JUICES','SMOOTHIES','LEMONADES','MOJITO','SHAKES','WATER/SODA','CAKES','DESSERTS','PASTRIES','DESERTS','CAKES SLICES','WRAPS','CHICKEN MEALS'}
items=[]
def title(s):
    return s.title().replace('Rcc','RCC').replace('Bbq','BBQ').replace('Kfc','KFC')
def add(name, price, cat, page, desc='', options=None):
    name = name.strip(' -–\t').replace('�','–' if 'PAX' in name else '½')
    # Main-course portion glyphs were checked against the rendered source PDF.
    if page == 4:
        if name.startswith('CAMEL SUQAAR'): name='CAMEL SUQAAR (¼)'
        if name.startswith('CHICKEN MANDI'): name='CHICKEN MANDI (¼)'
        if name.startswith('BBQ CHICKEN'): name='BBQ CHICKEN (½)'
    key=re.sub('[^a-z0-9]+','-',name.lower()).strip('-')
    ident=f'p{page}-{key}'
    if any(x['id']==ident for x in items): ident+=f'-{len(items)}'
    opts=options or [{'id':'regular','label':'Regular','price':price}]
    if '(chicken or beef)' in name.lower():
        opts=[{'id':s,'label':s.title(),'price':price} for s in ['chicken','beef']]
    if '[chicken|beef|fish]' in name.lower():
        opts=[{'id':s,'label':s.title(),'price':price} for s in ['chicken','beef','fish']]
    if '(beef or chicken)' in name.lower():
        opts=[{'id':s,'label':s.title(),'price':price} for s in ['beef','chicken']]
    if 'BUFFALO OR BBQ' in name:
        opts=[{'id':s.lower(),'label':s,'price':price} for s in ['Buffalo','BBQ']]
    if 'WHOLE FISH' in name:
        opts=[{'id':s.lower().replace(' ','-'),'label':s,'price':price} for s in ['Wet fry','Dry fry']]
    if name=='KABSA RICE' and page==4:
        opts=[{'id':s,'label':s.title(),'price':price} for s in ['chicken','goat']]
    items.append({'id':ident,'name':title(name),'category':title(cat),'description':desc,'price':price,'options':opts,'page':page,'available':True,'needsReview':False})

for pi in range(1,len(doc)):
    page=pi+1
    raw=doc[pi].get_text().replace('�S','’S').replace('�s','’s')
    lines=[re.sub(r'\s+',' ',s).strip() for s in raw.splitlines() if s.strip()]
    if page==7:
        text=' '.join(lines)
        for name,a,b in re.findall(r'([A-Z][A-Z ]+PIZZA)\s+([\d,]+)/-\s+([\d,]+)/-',text):
            prices=[int(x.replace(',','')) for x in [a,b]]
            add(name,prices[0],'Pizzas',page,options=[{'id':'medium','label':'Medium','price':prices[0]},{'id':'large','label':'Large','price':prices[1]}])
        continue
    if page==13:
        size='1 kg'; pending=[]
        for s in lines:
            if '2kgs' in s: size='2 kg'
            if s in ['BLUE BERRY','BLACK FOREST','WHITE FOREST','RED VELVET','CHOCOLATE ORANGE']: pending=[s]
            m=re.search(r'([\d,]+)/-',s)
            if m and pending:
                add(pending[0]+' '+size,int(m[1].replace(',','')),'Occasional Cakes',page);pending=[]
        continue
    category='Breakfast' if page==2 else 'Menu'; pending=[]; desc=[]
    def finish_desc():
        if desc and items and items[-1]['page']==page: items[-1]['description']=' '.join(desc).replace('�','–')
        desc.clear()
    in_desc=False
    for s in lines:
        if s in headings:
            finish_desc();category=s;pending=[];in_desc=False;continue
        if s in ['MAIN COURSE','FAST FOOD MENU']: continue
        if s.startswith('(') and not re.search(r'\d+/-',s):
            in_desc=')' not in s;desc.append(s);continue
        if in_desc:
            desc.append(s)
            if ')' in s: in_desc=False
            continue
        m=re.search(r'([\d,]+)\s*/-?',s)
        if m:
            name=' '.join(pending+[s[:m.start()].strip()]).strip()
            if name:
                finish_desc();add(name,int(m[1].replace(',','')),category,page)
            pending=[]
        elif s=='MOZZARELLA SANDWICH' and items:
            items[-1]['name']+=' Mozzarella Sandwich'
        else:
            finish_desc();pending.append(s)
    finish_desc()

for item in items:
    item['description']=item['description'].replace('�','’')
    if item['page']==5 and 'Dining Inn' in item['name']:
        item['name']='Full Goat Mandi Platter · Dine-in'
        item['available']=False
        item['description']='Dine-in price only. Choose the takeaway platter for online pickup or delivery.'
    if item['page']==5 and item['name']=='Take Away':
        item['name']='Full Goat Mandi Platter · Takeaway'

# Preserve different source categories, but block apparent conflicting offerings.
aliases={'masala chips':'chips masala','poussin chips':'pousin chips','pousin chips':'pousin chips','biscoff caramel slice (per piece)':'biscoff','black forest slice':'black forest','white forest slice':'white forest','chapati roll':'chapati rolls','muffin (per piece)':'muffins','tiramisu (per piece)':'tiramisu'}
groups={}
for item in items:
    key=item['name'].lower()
    key=aliases.get(key,key)
    groups.setdefault(key,[]).append(item)
for group in groups.values():
    if len({x['price'] for x in group})>1:
        for item in group:item['needsReview']=True

(ROOT/'lib').mkdir(exist_ok=True)
(ROOT/'public/brand').mkdir(parents=True,exist_ok=True)
(ROOT/'public/assets').mkdir(exist_ok=True)
(ROOT/'lib/catalog.json').write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf8')
shutil.copy2(SOURCE/'RCC FOOD MENU 3 (5).pdf',ROOT/'public/brand/rcc-menu.pdf')
logo=pymupdf.open(SOURCE/'logo (1).pdf')
lp=logo[0]; w,h=lp.rect.width,lp.rect.height
# Crop provided artwork, not a recreated logo.
lp.get_pixmap(matrix=pymupdf.Matrix(2,2),clip=pymupdf.Rect(w*.163,h*.51,w*.898,h*.92)).save(ROOT/'public/brand/logo-red.png')
lp.get_pixmap(matrix=pymupdf.Matrix(2,2),clip=pymupdf.Rect(w*.163,h*.083,w*.898,h*.497)).save(ROOT/'public/brand/logo-white.png')
for name,pi,rect in [('grill',3,(0,0,.41,.24)),('breakfast',1,(0,0,.41,.31)),('coffee',7,(0,0,.41,.31)),('pizza',6,(0,0,.41,.38)),('juice',8,(0,.45,.41,.75)),('dessert',11,(0,0,.41,.29))]:
    p=doc[pi]; w,h=p.rect.width,p.rect.height
    p.get_pixmap(matrix=pymupdf.Matrix(2,2),clip=pymupdf.Rect(rect[0]*w,rect[1]*h,rect[2]*w,rect[3]*h)).save(ROOT/f'public/assets/{name}.png')
print(json.dumps({'items':len(items),'categories':sorted(set(x['category'] for x in items)),'needsReview':sum(x['needsReview'] for x in items)},indent=2))
