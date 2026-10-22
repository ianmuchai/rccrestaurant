"""Download only images explicitly shared by the user; keep a provenance manifest."""
from pathlib import Path
import urllib.request as u,json,concurrent.futures
root=Path('work/drive');photos=root/'photos';photos.mkdir(parents=True,exist_ok=True)
files=list({x['id']:x for x in json.loads((root/'files.json').read_text() if (root/'files.json').exists() else Path('lib/photo-provenance.json').read_text())}.values())
for i,f in enumerate(files):f['key']=f'rcc-{i+1:03d}';f['local']=str(photos/(f['key']+'.jpg'))
def download(f):
 p=Path(f['local'])
 if p.exists():return True
 try:
  request=u.Request('https://drive.google.com/thumbnail?id='+f['id']+'&sz=w1600',headers={'User-Agent':'Mozilla/5.0'})
  r=u.urlopen(request,timeout=40);data=r.read()
  if not r.headers.get('Content-Type','').startswith('image/'):raise ValueError('Not an image')
  p.write_bytes(data);return True
 except Exception as e:f['error']=str(e);return False
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(download,files))
(root/'manifest.json').write_text(json.dumps(files,indent=2),encoding='utf8')
print(json.dumps({'images':len(files),'downloaded':sum(results),'failures':[{'name':f['name'],'error':f['error']} for f in files if 'error' in f]},indent=2))
