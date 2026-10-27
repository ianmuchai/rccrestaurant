"""Encode supplied RCC photos with continuous subpixel zoom and pan (not filmed footage).
Requires Pillow and imageio-ffmpeg for asset preparation only.
"""
import math, subprocess, sys
from pathlib import Path
sys.path.insert(0,str(Path('../qa-tools/python').resolve()))
import imageio_ffmpeg
from PIL import Image,ImageOps
from carousel_motion import render_frame
SIZE=(1440,900)
FPS=60
FRAMES=FPS*8

def encode(name,photo):
 source=ImageOps.exif_transpose(Image.open(f'work/drive/photos/rcc-{photo}.jpg')).convert('RGB')
 target=Path('public/media')/(name+'-smooth.mp4')
 command=[imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{SIZE[0]}x{SIZE[1]}','-framerate',str(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart',str(target)]
 process=subprocess.Popen(command,stdin=subprocess.PIPE)
 try:
  for index in range(FRAMES):
   # Fractional affine sampling avoids zoompan's whole-pixel crop jumps.
   ease=0.5-0.5*math.cos(math.pi*index/(FRAMES-1))
   frame=render_frame(source,SIZE,1.04+0.20*ease,0.18+0.64*ease,0.60-0.22*ease)
   process.stdin.write(frame.tobytes())
  process.stdin.close()
  if process.wait()!=0:raise RuntimeError('Video encoding failed: '+name)
 except BaseException:
  process.kill();process.wait();raise
 print(name,round(target.stat().st_size/1024),'KB',flush=True)

if __name__=='__main__':
 Path('public/media').mkdir(exist_ok=True)
 for name,photo in [('rcc-table','035'),('rcc-grill','025'),('rcc-coffee','012')]:encode(name,photo)
