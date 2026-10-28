import groups from './hero-data.json' with {type:'json'};

export const heroGroups=groups;
export const heroSlides=groups.flatMap(group=>group.photos.map((photo,index)=>({
 group:group.id,label:group.label,title:group.title,detail:group.detail,href:group.href,
 portrait:group.id==='drinks',
 video:`/media/rcc-${group.id}-${index+1}-${group.id==='drinks'?'framed':'smooth'}.mp4`,
 poster:group.id==='drinks'?`/photos/rcc-${String(photo).padStart(3,'0')}.webp`:`/media/rcc-${group.id}-${index+1}-smooth-poster.webp`,
 backdrop:`/media/rcc-${String(photo).padStart(3,'0')}-backdrop.webp`,
})));
export const stepHero=(index:number,direction:number)=>(index+direction+heroSlides.length)%heroSlides.length;
export const firstHeroSlide=(group:string)=>Math.max(0,heroSlides.findIndex(slide=>slide.group===group));
