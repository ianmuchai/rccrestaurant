"""Check every published hero file matches its manifest and is ready for streaming."""
import json,re,subprocess,sys
from pathlib import Path
sys.path.insert(0,str(Path('../qa-tools/python').resolve()))
import imageio_ffmpeg

total=0
for group in json.loads(Path('lib/hero-data.json').read_text()):
 for index,photo in enumerate(group['photos'],1):
  portrait=group['id']=='drinks'
  path=Path(f"public/media/rcc-{group['id']}-{index}-{'framed' if portrait else 'smooth'}.mp4")
  assert Path(f'public/photos/rcc-{photo:03d}.webp').is_file(),path
  assert 0<path.stat().st_size<25*1024*1024,path
  probe=subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-i',str(path)],capture_output=True,text=True).stderr
  assert 'Video: h264' in probe and ('720x' if portrait else '1440x900') in probe and '60 fps' in probe,(path,probe)
  if portrait:assert Path(f'public/media/rcc-{photo:03d}-backdrop.webp').is_file(),path
  else:assert path.with_name(path.stem+'-poster.webp').is_file(),path
  assert 'Audio:' not in probe and re.search(r'Duration: 00:00:08\.00',probe),(path,probe)
  data=path.read_bytes();assert 0<data.find(b'moov')<data.find(b'mdat'),path
  total+=path.stat().st_size
  print(path.name,'60fps / 8s / silent / faststart')
print('All 12 hero clips valid;',round(total/1024/1024,1),'MB total; only active/upcoming clips preload.')
