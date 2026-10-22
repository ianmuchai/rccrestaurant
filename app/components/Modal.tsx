'use client';
import { useEffect,useRef } from 'react';
import Icon from './Icon';
export default function Modal({title,onClose,children,wide=false}:{title:string;onClose:()=>void;children:React.ReactNode;wide?:boolean}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=ref.current;d?.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{d?.close();document.body.style.overflow=previous;};},[]);
 return <dialog ref={ref} className={'modal '+(wide?'wide':'')} aria-labelledby="dialog-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal-head"><div><span className="eyebrow">RCC RESTAURANT</span><h2 id="dialog-title">{title}</h2></div><button className="icon-button" aria-label="Close" onClick={onClose}><Icon name="close"/></button></div>{children}</dialog>
}
