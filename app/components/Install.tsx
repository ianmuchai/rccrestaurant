'use client';
import { useEffect,useState } from 'react';
import Icon from './Icon';
import Modal from './Modal';
export default function Install({compact=false}:{compact?:boolean}){
 const [prompt,setPrompt]=useState<any>(null),[help,setHelp]=useState(false),[installed,setInstalled]=useState(false);
 useEffect(()=>{if('serviceWorker'in navigator&&process.env.NODE_ENV==='production')navigator.serviceWorker.register('/sw.js').catch(()=>{});const receive=(e:Event)=>{e.preventDefault();setPrompt(e);};const done=()=>{setInstalled(true);setPrompt(null);};window.addEventListener('beforeinstallprompt',receive);window.addEventListener('appinstalled',done);setInstalled(window.matchMedia('(display-mode: standalone)').matches);return()=>{window.removeEventListener('beforeinstallprompt',receive);window.removeEventListener('appinstalled',done);};},[]);
 async function install(){if(prompt){await prompt.prompt();const result=await prompt.userChoice;if(result.outcome==='accepted')setInstalled(true);setPrompt(null);}else setHelp(true);}
 return <><button className={compact?'text-button':'button cream'} onClick={install} disabled={installed}><Icon name="download" size={18}/>{installed?'App installed':compact?'Get the app':'Keep RCC close'}</button>{help&&<Modal title="RCC. A tap away." onClose={()=>setHelp(false)}><div className="install-help"><Icon name="phone" size={40}/><h3>On iPhone</h3><p>Open in Safari. Tap Share, then Add to Home Screen.</p><h3>On Android</h3><p>Open in Chrome. Tap the menu, then Install app or Add to Home screen.</p><p className="field-hint">Installation options depend on your browser. Your menu stays close, even offline.</p></div></Modal>}</>
}
