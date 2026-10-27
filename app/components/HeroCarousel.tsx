'use client';
import {useEffect,useRef,useState} from 'react';
import Icon from './Icon';
const slides=[{video:'/media/rcc-table.mp4',poster:'/photos/rcc-035.webp',label:'THE RCC TABLE',title:'Good food. Great company.',detail:'Made for sharing.'},{video:'/media/rcc-grill.mp4',poster:'/photos/rcc-025.webp',label:'FRESH FROM THE KITCHEN',title:'Your next favourite.',detail:'Grills, classics & more.'},{video:'/media/rcc-coffee.mp4',poster:'/photos/rcc-012.webp',label:'TAKE A MOMENT',title:'Stay a little longer.',detail:'Coffee, cake & conversation.'}];
export default function HeroCarousel(){
 const [active,setActive]=useState(0),[still,setStill]=useState(true);
 useEffect(()=>{const preference=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setStill(preference.matches||!!(navigator as any).connection?.saveData);update();preference.addEventListener('change',update);return()=>preference.removeEventListener('change',update);},[]);
 useEffect(()=>{if(still)return;const id=setInterval(()=>{if(!document.hidden)setActive(i=>(i+1)%slides.length);},6000);return()=>clearInterval(id);},[active,still]);
 const slide=slides[active];
 return <section className="hero video-carousel" aria-label="RCC video carousel">{slides.map((s,i)=><SlideMedia key={s.video} slide={s} active={i===active} next={i===(active+1)%slides.length} still={still}/>)}<div className="hero-shade"/><div className="hero-topline"><span><i/>RCC RESTAURANT</span><span>KITENGELA, KENYA</span></div><div className="hero-content" key={slide.video}><span className="eyebrow">{slide.label}</span><h1>{slide.title}</h1><a className="button cream" href="/menu">ORDER NOW <Icon name="arrowUp" size={18}/></a></div><div className="hero-glass glass"><Icon name="spark" size={25}/><div><span className="eyebrow">A TASTE OF RCC</span><p key={slide.video} className="hero-detail">{slide.detail}</p></div><a href="/menu" aria-label="Order from the menu"><Icon name="arrowUp" size={19}/></a></div><div className="hero-bottom"><a className="hero-caption" href="/moments">Discover RCC <Icon name="arrowUp" size={12}/></a><div className="carousel-nav"><div className="slide-dots" role="group" aria-label="Choose carousel slide">{slides.map((s,i)=><button key={s.video} aria-label={'Show slide '+(i+1)} aria-pressed={active===i} className={active===i?'active':''} onClick={()=>setActive(i)}/>)}</div><button className="icon-button glass" aria-label="Previous slide" onClick={()=>setActive((active+2)%3)}><Icon name="chevron" size={16} style={{transform:'rotate(180deg)'}}/></button><button className="icon-button glass" aria-label="Next slide" onClick={()=>setActive((active+1)%3)}><Icon name="chevron" size={16}/></button></div></div></section>
}

function SlideMedia({slide,active,next,still}:{slide:typeof slides[number];active:boolean;next:boolean;still:boolean}){
 const video=useRef<HTMLVideoElement>(null);
 const [playing,setPlaying]=useState(false);
 useEffect(()=>{
  const element=video.current;if(!element)return;
  let cancelled=false;
  if(still){element.pause();return;}
  if(active){element.currentTime=0;element.play().catch(()=>{if(!cancelled)setPlaying(false);});}
  // Keep the outgoing clip moving until its opacity reaches zero.
  const pause=active?undefined:setTimeout(()=>{element.pause();element.currentTime=0;setPlaying(false);},900);
  return()=>{cancelled=true;clearTimeout(pause);};
 },[active,still]);
 return <div className={active?'hero-slide active':'hero-slide'} aria-hidden="true"><img className="hero-image" src={slide.poster} alt="" fetchPriority={active?'high':'auto'}/>{!still&&<video ref={video} className={playing?'hero-video playing':'hero-video'} src={slide.video} poster={slide.poster} muted playsInline loop preload={active||next?'auto':'metadata'} onPlaying={()=>setPlaying(true)} onError={()=>setPlaying(false)}/>}</div>;
}
