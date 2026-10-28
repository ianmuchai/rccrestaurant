import Install from './Install';
import Icon from './Icon';
import {business} from '../../lib/business';
export function PhoneApp(){return <div className="footer-app"><div><span className="eyebrow">RCC, ALWAYS CLOSE</span><p>Get the app on your phone.</p><div className="app-platforms"><span><Icon name="android" size={19}/>Android</span><span><Icon name="phone" size={19}/>iPhone</span></div></div><Install variant="footer"/></div>;}
export function WhatsApp({home=false,hasCart=false}:{home?:boolean;hasCart?:boolean}){return <a className={'whatsapp-float'+(home?' whatsapp-float--home':'')+(hasCart?' whatsapp-float--cart':'')} href={business.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat with RCC on WhatsApp"><span className="whatsapp-mark"><Icon name="whatsapp" size={25}/></span><span className="whatsapp-label" aria-hidden="true">Chat with RCC<span>WhatsApp</span></span></a>;}
