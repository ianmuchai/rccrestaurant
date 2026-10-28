'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {heroGroups,heroSlides as slides,firstHeroSlide,stepHero} from '../../lib/hero';
import Icon from './Icon';

export default function HeroCarousel(){
 const [position,setPosition]=useState({active:0,previous:-1}),[still,setStill]=useState(true);
 const active=position.active;
 const current=useRef(position),busy=useRef(false),queued=useRef<number|null>(null),motionStill=useRef(true);
 const mediaRequest=useRef(0);
 const transitionTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const setActive:(index:number)=>void=useCallback((index:number)=>{
  const request=++mediaRequest.current;
  if(motionStill.current){clearTimeout(transitionTimer.current);busy.current=false;queued.current=null;current.current={active:index,previous:-1};setPosition(current.current);return;}
  if(busy.current){queued.current=index;return;}
  if(index===current.current.active)return;
  const show=()=>{
   if(request!==mediaRequest.current)return;
   busy.current=true;current.current={active:index,previous:current.current.active};setPosition(current.current);
   transitionTimer.current=setTimeout(()=>{
    current.current={active:current.current.active,previous:-1};setPosition(current.current);
    // Commit the hidden outgoing layer before it can become incoming again.
    transitionTimer.current=setTimeout(()=>{busy.current=false;const pending=queued.current;queued.current=null;if(pending!==null)setActive(pending);},40);
   },1300);
  };
  const poster=new Image();poster.src=slides[index].poster;
  // Keep the current slide visible until the next photograph can be painted.
  poster.decode().then(show).catch(()=>{});
 },[]);
 useEffect(()=>()=>{clearTimeout(transitionTimer.current);mediaRequest.current++;},[]);
 const categories=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{const value=preference.matches||!!(navigator as Navigator & {connection?:{saveData:boolean}}).connection?.saveData;motionStill.current=value;setStill(value);};
  update();preference.addEventListener('change',update);
  return()=>preference.removeEventListener('change',update);
 },[]);
 useEffect(()=>{
  if(still)return;
  const id=setInterval(()=>{if(!document.hidden)setActive(stepHero(current.current.active,1));},6000);
  return()=>clearInterval(id);
 },[active,still,setActive]);
 const slide=slides[active];
 useEffect(()=>{
  // Scroll only the category strip, never the page or the full hero.
  const strip=categories.current,button=strip?.querySelector<HTMLElement>('[aria-pressed="true"]');
  if(strip&&button)strip.scrollTo({left:button.offsetLeft-(strip.clientWidth-button.offsetWidth)/2,behavior:still?'instant':'smooth'});
 },[slide.group,still]);
 return <section className={'hero video-carousel'+(slide.portrait?' hero--drinks':'')} aria-label="RCC food video carousel">
  {slides.map((s,i)=><SlideMedia key={s.video} slide={s} active={i===active} next={i===stepHero(active,1)} outgoing={i===position.previous} still={still}/>)}
  <div className="hero-shade"/>
  <div className="hero-topline"><span><i/>RCC RESTAURANT</span><span>KITENGELA, KENYA</span></div>
  <div className="hero-content" key={slide.group}><span className="eyebrow">{slide.label}</span><h1>{slide.title}</h1><a className="button cream" href={slide.href}>ORDER NOW <Icon name="arrowUp" size={18}/></a></div>
  <div className="hero-glass glass"><Icon name="spark" size={25}/><div><span className="eyebrow">A TASTE OF RCC</span><p key={slide.group} className="hero-detail">{slide.detail}</p></div><a href={slide.href} aria-label={'Order '+slide.label.toLowerCase()}><Icon name="arrowUp" size={19}/></a></div>
  <div className="hero-bottom hero-category-bottom">
   <div ref={categories} className="hero-categories glass" role="group" aria-label="Choose food category">{heroGroups.map(group=><button key={group.id} aria-pressed={slide.group===group.id} onClick={()=>setActive(firstHeroSlide(group.id))}>{group.label}</button>)}</div>
   <div className="carousel-nav"><span className="hero-slide-count" aria-label={'Slide '+(active+1)+' of '+slides.length}>{String(active+1).padStart(2,'0')}<span> / {slides.length}</span></span><button className="icon-button glass" aria-label="Previous slide" onClick={()=>setActive(stepHero(active,-1))}><Icon name="chevron" size={16} style={{transform:'rotate(180deg)'}}/></button><button className="icon-button glass" aria-label="Next slide" onClick={()=>setActive(stepHero(active,1))}><Icon name="chevron" size={16}/></button></div>
  </div>
 </section>;
}

function SlideMedia({slide,active,next,outgoing,still}:{slide:typeof slides[number];active:boolean;next:boolean;outgoing:boolean;still:boolean}){
 const video=useRef<HTMLVideoElement>(null);
 const [playing,setPlaying]=useState(false);
 useEffect(()=>{
  const element=video.current;if(!element){setPlaying(false);return;}
  let cancelled=false;
  if(still){element.pause();return;}
  if(active){element.currentTime=0;element.play().catch(()=>{if(!cancelled)setPlaying(false);});}
  // Let the outgoing clip keep moving throughout the crossfade.
  const pause=active?undefined:setTimeout(()=>{element.pause();element.currentTime=0;setPlaying(false);},1400);
  return()=>{cancelled=true;clearTimeout(pause);};
 },[active,next,outgoing,still]);
 return <div className={'hero-slide'+(active?' active':outgoing?' outgoing':'')} aria-hidden="true">
  {slide.portrait&&<img className="hero-drink-backdrop" src={slide.backdrop} alt=""/>}
  <div className={slide.portrait?'hero-drink-frame':'hero-media-frame'}>
  <img className="hero-image" src={slide.poster} alt="" fetchPriority={active?'high':'auto'}/>
  {!still&&(active||next||(outgoing&&playing))&&<video ref={video} className={playing?'hero-video playing':'hero-video'} src={slide.video} poster={slide.poster} muted playsInline loop preload="auto" onPlaying={()=>setPlaying(true)} onError={()=>setPlaying(false)}/>}
  </div>
 </div>;
}
