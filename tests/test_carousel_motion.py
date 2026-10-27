import sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'qa-tools/python'))
from PIL import Image,ImageDraw
from carousel_motion import render_frame
class MotionTests(unittest.TestCase):
 def test_fractional_camera_moves_without_pixel_snapping(self):
  image=Image.new('RGB',(200,200));ImageDraw.Draw(image).rectangle((98,0,102,199),fill='white')
  centers=[]
  for i in range(11):
   frame=render_frame(image,(100,100),2,0.20+i*0.002,0.5)
   weights=[frame.getpixel((x,50))[0] for x in range(100)]
   centers.append(sum(x*w for x,w in enumerate(weights))/sum(weights))
  steps=[a-b for a,b in zip(centers,centers[1:])]
  self.assertTrue(all(0.14<s<0.26 for s in steps),steps)
 def test_crop_fills_portrait_and_landscape_without_black_borders(self):
  for size in [(900,1600),(1600,900)]:
   frame=render_frame(Image.new('RGB',size,'white'),(144,90),1.04,0.8,0.3)
   self.assertEqual(frame.getextrema(),((255,255),)*3)
if __name__=='__main__':unittest.main()
