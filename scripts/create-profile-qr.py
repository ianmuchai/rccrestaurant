"""Create vector, subscription-free RCC QR PDFs. Requires PyMuPDF, qrcode and zxing-cpp.
Local preparation: python -m pip install --target work/qr-tools qrcode zxing-cpp
"""
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'work/qr-tools'))
import pymupdf as fitz
import qrcode,zxingcpp
from PIL import Image
OUT=ROOT/'public/downloads';OUT.mkdir(exist_ok=True)
W,H=148/25.4*72,210/25.4*72
WINE=(100/255,29/255,40/255);GRAY=(115/255,103/255,94/255);CREAM=(.965,.945,.915)
GOOGLE='https://www.google.com/maps?cid=5135303326429331150'

def make(name,payload,display):
 qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q,box_size=12,border=4)
 qr.add_data(payload);qr.make(fit=True);matrix=qr.get_matrix()
 doc=fitz.open();page=doc.new_page(width=W,height=H)
 for key,file in [('RCC','manrope-600.ttf'),('Body','dm-sans-400.ttf')]:page.insert_font(fontname=key,fontfile=str(ROOT/'public/fonts'/file))
 def text(value,y,size=11,font='Body',color=GRAY):page.insert_textbox(fitz.Rect(24,y,W-24,y+size*2),value,fontname=font,fontsize=size,color=color,align=1)
 page.draw_rect(fitz.Rect(0,0,W,5),color=None,fill=WINE)
 page.insert_image(fitz.Rect(W/2-48,29,W/2+48,103),filename=str(ROOT/'public/brand/logo-red.png'),keep_proportion=True)
 text('K I T E N G E L A',111,8)
 text('Find us on Google',141,23,'RCC',WINE)
 text('Directions, hours & more.',179,11)
 side=252;x=(W-side)/2;y=218
 page.draw_rect(fitz.Rect(x-9,y-9,x+side+9,y+side+9),color=CREAM,width=1)
 cell=side/len(matrix);shape=page.new_shape()
 for row,values in enumerate(matrix):
  for col,dark in enumerate(values):
   if dark:shape.draw_rect(fitz.Rect(x+col*cell,y+row*cell,x+(col+1)*cell,y+(row+1)*cell))
 shape.finish(color=None,fill=WINE);shape.commit()
 text(display,489,12,'RCC',WINE)
 text('Open your camera. Scan. Say hello.',517,10)
 text('RCC Restaurant  |  Kitengela',555,8)
 page.insert_link({'kind':fitz.LINK_URI,'from':fitz.Rect(x,y,x+side,y+side),'uri':payload})
 page.insert_link({'kind':fitz.LINK_URI,'from':fitz.Rect(40,486,W-40,510),'uri':payload})
 page.draw_rect(fitz.Rect(0,H-5,W,H),color=None,fill=WINE)
 doc.set_metadata({'title':'RCC Restaurant - Google Business Profile QR','author':'RCC Restaurant','subject':'Static QR code: '+payload,'keywords':'RCC, Kitengela, Google Business Profile, static QR'})
 if hasattr(doc,'subset_fonts'):doc.subset_fonts()
 target=OUT/(name+'.pdf');doc.save(target,garbage=4,deflate=True);doc.close()
 qr.make_image(fill_color='#641d28',back_color='white').save(OUT/(name+'.png'))
 # Independently scan the rendered PDF, not just the original matrix.
 check=fitz.open(target)
 for dpi in [100,200,300]:
  pix=check[0].get_pixmap(dpi=dpi,alpha=False);image=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
  result=zxingcpp.read_barcode(image)
  assert result and result.text==payload,(target,dpi,result)
  if dpi==100:image.save(ROOT/'outputs'/(name+'-preview.png'))
 assert check.page_count==1
 assert all(link['uri']==payload for link in check[0].get_links())
 print(name,': scanned at 100/200/300 dpi;',target.stat().st_size,'bytes; target:',payload)
 check.close()

if __name__=='__main__':
 (ROOT/'outputs').mkdir(exist_ok=True)
 make('RCC-Google-Profile-QR','https://rcc.co.ke/google','rcc.co.ke/google')
 make('RCC-Google-Profile-QR-Direct',GOOGLE,'Google Business Profile')
