'use client';
import {useState} from 'react';
import {foodImage} from '../../lib/media';
import type {MenuItem} from '../../lib/order';

export default function MealPhoto({item,compact=false}:{item?:MenuItem;compact?:boolean}){
 const image=item?foodImage(item):null;
 return <Photo key={image||'unphotographed'} image={image} name={item?.name||'Unavailable item'} compact={compact}/>;
}
function Photo({image,name,compact}:{image:string|null;name:string;compact:boolean}){
 const [failed,setFailed]=useState(false);
 if(image&&!failed)return <img ref={node=>{if(node?.complete&&node.naturalWidth===0)setFailed(true);}} className={compact?'meal-photo compact':'meal-photo'} src={image} alt={name} loading="lazy" onError={()=>setFailed(true)}/>;
 return <div className={compact?'meal-photo-placeholder compact':'meal-photo-placeholder'} role="img" aria-label={'Photo not yet available for '+name}><span className="meal-photo-monogram" aria-hidden="true">RCC</span>{!compact&&<span className="meal-photo-caption">Photo coming soon</span>}</div>;
}
