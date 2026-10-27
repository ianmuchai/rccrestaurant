"""Encode photo-motion video slides from supplied RCC photographs, not invented footage."""
import sys,subprocess
from pathlib import Path
sys.path.insert(0,str(Path('../qa-tools/python').resolve()))
import imageio_ffmpeg
encoder=imageio_ffmpeg.get_ffmpeg_exe();Path('public/media').mkdir(exist_ok=True)
frames=350
ease=f'(0.5-0.5*cos(PI*on/{frames-1}))'
# Higher spatial sampling and 50 fps prevent the stepped movement of a low-rate crop.
# A stronger eased zoom and diagonal pan make the motion clear without abrupt starts.
motion=(f"scale=2880:1800:force_original_aspect_ratio=increase,crop=2880:1800,"
        f"zoompan=z='1.04+0.20*{ease}':"
        f"x='(iw-iw/zoom)*(0.18+0.64*{ease})':"
        f"y='(ih-ih/zoom)*(0.60-0.22*{ease})':"
        f"d={frames}:s=1440x900:fps=50")
for name,photo in [('rcc-table','035'),('rcc-grill','025'),('rcc-coffee','012')]:
 target=Path('public/media')/(name+'.mp4')
 subprocess.run([encoder,'-hide_banner','-loglevel','error','-y','-loop','1','-i',f'work/drive/photos/rcc-{photo}.jpg','-vf',motion,'-t','7','-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart','-an',str(target)],check=True)
 print(name,round(target.stat().st_size/1024),'KB')
