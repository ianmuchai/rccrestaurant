import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight,BookOpen,MapPin,Star} from 'lucide-react';
import {business} from '../../lib/business';
import './google-landing.css';

export const metadata:Metadata={
 title:'Your RCC visit starts here | RCC Restaurant',
 description:'Browse the RCC menu, find us in Kitengela, or leave a Google review.',
 robots:{index:false,follow:true},
};

const choices=[
 {label:'Explore the menu',detail:'Find something you’ll love.',href:'/menu',icon:BookOpen,external:false,kind:'menu'},
 {label:'Get directions',detail:'We’re on Namanga Road, Kitengela.',href:business.maps,icon:MapPin,external:true,kind:'maps'},
 {label:'Review us on Google',detail:'Open our profile and choose Write a review.',href:business.maps,icon:Star,external:true,kind:'review'},
] as const;

export default function GoogleLandingPage(){
 return <main className="google-landing">
  <div className="google-landing__glow" aria-hidden="true"/>
  <div className="google-landing__wrap">
   <header className="google-landing__header">
    <Link href="/" aria-label="RCC Restaurant home"><Image src="/brand/logo-red.png" alt="RCC Restaurant" width={82} height={64} priority/></Link>
    <span className="google-landing__location">KITENGELA, KENYA</span>
   </header>
   <section className="google-landing__hero" aria-labelledby="google-landing-title">
    <div className="google-landing__copy">
     <span className="google-landing__eyebrow"><i/>GOOD FOOD. GREAT COMPANY.</span>
     <h1 id="google-landing-title">Your next<br/>good moment<br/><em>starts here.</em></h1>
     <p>Welcome to RCC. What would you like to do?</p>
    </div>
    <div className="google-landing__photo" role="img" aria-label="A table set for a meal at RCC Restaurant"/>
   </section>
   <nav className="google-landing__choices" aria-label="Choose what to do next">
    {choices.map(({label,detail,href,icon:Icon,external,kind})=><a className={'google-choice google-choice--'+kind} href={href} key={kind} {...(external?{target:'_blank',rel:'noopener noreferrer'}:{})}>
     <span className="google-choice__icon"><Icon size={21} strokeWidth={1.7} aria-hidden="true"/></span>
     <span className="google-choice__text"><strong>{label}</strong><small>{detail}</small></span>
     <ArrowUpRight size={19} strokeWidth={1.7} aria-hidden="true" className="google-choice__arrow"/>
    </a>)}
   </nav>
   <footer className="google-landing__footer"><span>RCC RESTAURANT</span><i aria-hidden="true">✦</i><span>GOOD FOOD, RIGHT HERE.</span></footer>
  </div>
 </main>;
}
