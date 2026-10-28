import {test} from 'node:test';
import assert from 'node:assert/strict';
import {heroGroups,heroSlides,stepHero,firstHeroSlide} from '../lib/hero.ts';

test('all food groups have two distinct clips and category selection reaches the correct group',()=>{
 assert.deepEqual(heroGroups.map(g=>g.label),['Breakfast','Lunch','Platters','Drinks','Coffee','Desserts']);
 assert.equal(heroSlides.length,12);
 assert.equal(new Set(heroSlides.map(s=>s.video)).size,12);
 assert.equal(new Set(heroSlides.map(s=>s.poster)).size,12);
 for(const group of heroGroups){
  assert.equal(heroSlides.filter(s=>s.group===group.id).length,2);
  assert.equal(heroSlides[firstHeroSlide(group.id)].group,group.id);
 }
});

test('next and previous reach every clip and wrap at either boundary',()=>{
 assert.equal(stepHero(0,-1),11);
 assert.equal(stepHero(11,1),0);
 assert.equal(stepHero(2,1),3);
 assert.equal(stepHero(6,-1),5);
});

test('drinks preserve portrait framing and other video posters match the first frame',()=>{
 for(const slide of heroSlides){
  if(slide.group==='drinks'){
   assert.equal(slide.portrait,true);
   assert.match(slide.video,/-framed\.mp4$/);
   assert.match(slide.poster,/\/photos\/rcc-/);
  }else{
   assert.equal(slide.portrait,false);
   assert.equal(slide.poster,slide.video.replace('.mp4','-poster.webp'));
  }
 }
});
