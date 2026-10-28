'use client';
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {flushSync} from 'react-dom';
import Icon from './Icon';
import Modal from './Modal';
type InstallPrompt=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
const InstallContext=createContext<{install:()=>Promise<void>;installed:boolean;busy:boolean}|null>(null);
export function InstallProvider({children}:{children:ReactNode}){
 const [prompt,setPrompt]=useState<InstallPrompt|null>(null),[help,setHelp]=useState(false),[installed,setInstalled]=useState(false),[busy,setBusy]=useState(false);
 const pending=useRef(false);
 useEffect(()=>{if('serviceWorker'in navigator&&process.env.NODE_ENV==='production')navigator.serviceWorker.register('/sw.js').catch(()=>{});const receive=(e:Event)=>{e.preventDefault();setPrompt(e as InstallPrompt);};const done=()=>{pending.current=false;setInstalled(true);setPrompt(null);setBusy(false);setHelp(false);};window.addEventListener('beforeinstallprompt',receive);window.addEventListener('appinstalled',done);setInstalled(window.matchMedia('(display-mode: standalone)').matches||!!(navigator as Navigator&{standalone?:boolean}).standalone);return()=>{window.removeEventListener('beforeinstallprompt',receive);window.removeEventListener('appinstalled',done);};},[]);
 async function install(){
  if(installed)return;
  // Give immediate feedback before calling a browser-controlled prompt.
  // Keep prompt() in this click handler so user activation is preserved.
  flushSync(()=>setHelp(true));
  if(pending.current||!prompt)return;
  pending.current=true;setBusy(true);setPrompt(null);
  try{await prompt.prompt();const result=await prompt.userChoice;if(result.outcome==='accepted'){setInstalled(true);setHelp(false);}}
  catch{/* The open instructions remain usable if the browser refuses. */}
  finally{pending.current=false;setBusy(false);}
 }
 return <InstallContext.Provider value={{install,installed,busy}}>{children}{help&&<Modal title="Install RCC" onClose={()=>setHelp(false)}><div className="install-help"><Icon name="phone" size={40}/>{busy&&<p role="status">Follow your browser’s install prompt, or use the steps below.</p>}<h3>On iPhone</h3><p>Open in Safari. Tap Share, then Add to Home Screen.</p><h3>On Android</h3><p>Open in Chrome. Tap the menu, then Install app or Add to Home screen.</p><p className="field-hint">Installation options depend on your browser. Your menu stays close, even offline.</p></div></Modal>}</InstallContext.Provider>;
}
export default function Install({compact=false,variant='default'}:{compact?:boolean;variant?:'default'|'header'|'footer'}){
 const context=useContext(InstallContext);if(!context)return null;
 return <button className={(compact?'text-button':'button cream')+' install-button install-button--'+variant} onClick={context.install} disabled={context.installed} aria-busy={context.busy} aria-label={context.installed?'RCC app installed':'Download RCC app'} title="Install RCC on your phone"><Icon name="download" size={18}/><span className="install-label">{context.installed?'App installed':compact&&variant==='default'?'Get the app':'Download app'}</span></button>;
}
