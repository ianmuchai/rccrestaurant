"""Encode supplied RCC photos with continuous subpixel zoom and pan (not filmed footage).
Requires Pillow and imageio-ffmpeg for asset preparation only.
"""
import json, math, subprocess, sys
from pathlib import Path
sys.path.insert(0,str(Path('../qa-tools/python').resolve()))
import imageio_ffmpeg
from PIL import Image,ImageOps,ImageFilter
from carousel_motion import render_frame
SIZE=(1440,900)
FPS=60
FRAMES=FPS*8

def encode(name,photo):
 source=ImageOps.exif_transpose(Image.open(f'work/drive/photos/rcc-{photo:03d}.jpg')).convert('RGB')
 target=Path('public/media')/(name+'-smooth.mp4')
 temporary=target.with_suffix('.partial.mp4')
 command=[imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{SIZE[0]}x{SIZE[1]}','-framerate',str(FPS),'-i','pipe:0','-an','-c:v','libx264','-threads','2','-preset','fast','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart',str(temporary)]
 process=subprocess.Popen(command,stdin=subprocess.PIPE)
 try:
  for index in range(FRAMES):
   # Fractional affine sampling avoids zoompan's whole-pixel crop jumps.
   ease=0.5-0.5*math.cos(math.pi*index/(FRAMES-1))
   frame=render_frame(source,SIZE,1.04+0.20*ease,0.18+0.64*ease,0.60-0.22*ease)
   process.stdin.write(frame.tobytes())
  process.stdin.close()
  if process.wait()!=0:raise RuntimeError('Video encoding failed: '+name)
  temporary.replace(target)
 except BaseException:
  process.kill();process.wait();temporary.unlink(missing_ok=True);raise
 print(name,round(target.stat().st_size/1024),'KB',flush=True)

def encode_portrait(name,photo):
 target=Path('public/media',name+'-framed.mp4');temporary=target.with_suffix('.partial.mp4')
 try:
  subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-loglevel','error','-y','-loop','1','-i',f'work/drive/photos/rcc-{photo:03d}.jpg','-vf','scale=720:-2','-t','8','-r','60','-an','-c:v','libx264','-threads','1','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',str(temporary)],check=True)
  temporary.replace(target)
 except BaseException:temporary.unlink(missing_ok=True);raise

if __name__=='__main__':
 Path('public/media').mkdir(exist_ok=True)
 # Keep generation aligned with the category selector and poster mapping.
 for group in json.loads(Path('lib/hero-data.json').read_text()):
  for index,photo in enumerate(group['photos'],1):
   name=f"rcc-{group['id']}-{index}"
   portrait=group['id']=='drinks'
   target=Path('public/media',name+('-framed.mp4' if portrait else '-smooth.mp4'))
   valid=target.exists() and subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-i',str(target),'-t','0','-f','null','-'],capture_output=True).returncode==0
   if not valid:(encode_portrait if portrait else encode)(name,photo)
   if portrait:
    image=ImageOps.exif_transpose(Image.open(f'work/drive/photos/rcc-{photo:03d}.jpg')).convert('RGB')
    image.thumbnail((90,135));image.filter(ImageFilter.GaussianBlur(6)).save(f'public/media/rcc-{photo:03d}-backdrop.webp',quality=70)
   else:
    poster=target.with_name(target.stem+'-poster.webp')
    if not poster.exists():subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-loglevel','error','-y','-i',str(target),'-frames:v','1','-threads','1',str(poster)],check=True)
