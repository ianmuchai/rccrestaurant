"""Encode photo-motion video slides from supplied RCC photographs, not invented footage."""
import sys,subprocess
from pathlib import Path
sys.path.insert(0,str(Path('../qa-tools/python').resolve()))
import imageio_ffmpeg
encoder=imageio_ffmpeg.get_ffmpeg_exe();Path('public/media').mkdir(exist_ok=True)
for name,photo in [('rcc-table','035'),('rcc-grill','025'),('rcc-coffee','012')]:
 target=Path('public/media')/(name+'.mp4')
 subprocess.run([encoder,'-hide_banner','-loglevel','error','-y','-loop','1','-i',f'work/drive/photos/rcc-{photo}.jpg','-vf',"scale=1920:1200:force_original_aspect_ratio=increase,crop=1920:1200,zoompan=z='min(zoom+0.00024,1.045)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=175:s=1440x900:fps=25",'-t','7','-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart','-an',str(target)],check=True)
 print(name,round(target.stat().st_size/1024),'KB')
