import {business} from './business.ts';
export type Option = {id:string;label:string;price:number};
export type MenuItem = {id:string;name:string;category:string;description:string;price:number;options:Option[];page:number;available:boolean;needsReview:boolean};
export type CartLine = {itemId:string;optionId:string;quantity:number};
export type Point = {lat:number;lng:number};
export type Settings = {pickupEnabled:boolean;deliveryEnabled:boolean;zones:{id:string;name:string;fee:number}[];restaurantPoint:Point|null;address:string;phone:string;hours:string;pickupInstructions:string};
export const defaultSettings:Settings={pickupEnabled:false,deliveryEnabled:false,zones:[],restaurantPoint:null,address:business.address,phone:business.phone,hours:business.hours,pickupInstructions:''};
export function priceOrder(lines:CartLine[], catalog:MenuItem[]) {
 if(!Array.isArray(lines)||lines.length<1||lines.length>50)throw new Error('Choose between 1 and 50 items.');
 let count=0;
 const result=lines.map(line=>{
  if(!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>50)throw new Error('Quantity must be between 1 and 50.');
  count+=line.quantity;
  const item=catalog.find(i=>i.id===line.itemId);
  if(!item||!item.available||item.needsReview)throw new Error('An item is unavailable or awaiting price confirmation.');
  const option=item.options.find(o=>o.id===line.optionId);
  if(!option||!Number.isSafeInteger(option.price)||option.price<1)throw new Error('Choose a valid food option.');
  return {itemId:item.id,name:item.name,optionId:option.id,option:option.label,price:option.price,quantity:line.quantity,total:option.price*line.quantity};
 });
 if(count>100)throw new Error('For larger orders, please contact the restaurant.');
 return {lines:result,subtotal:result.reduce((s,l)=>s+l.total,0)};
}
export function normalizePhone(input:string) {
 if(typeof input!=='string')throw new Error('Enter a Kenyan M-Pesa phone number.');
 const p=input.replace(/[\s+()-]/g,'').replace(/^0/,'254');
 if(!/^254[17]\d{8}$/.test(p))throw new Error('Enter a Kenyan M-Pesa phone number.');
 return p;
}
export function validPoint(p:unknown):p is Point {
 const v=p as Point;
 return !!v&&typeof v.lat==='number'&&typeof v.lng==='number'&&Number.isFinite(v.lat)&&Number.isFinite(v.lng)&&Math.abs(v.lat)<=90&&Math.abs(v.lng)<=180;
}
export function mapsLink(point:Point) {
 if(!validPoint(point))throw new Error('Choose a valid location.');
 return 'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(point.lat+','+point.lng)+'&travelmode=driving';
}
export function reconcilePayment(expected:{checkoutId:string;amount:number;phone:string},event:{checkoutId:string;amount:number;phone:string;receipt:string;resultCode:number},query:{ResultCode?:string|number;ResponseCode?:string|number}) {
 return event.resultCode===0&&String(query.ResponseCode)==='0'&&String(query.ResultCode)==='0'&&event.checkoutId===expected.checkoutId&&event.amount===expected.amount&&event.phone===expected.phone&&/^[A-Z0-9]{5,30}$/.test(event.receipt);
}
export function canStaff(userId:string|null,allowlist:string) {
 return !!userId&&allowlist.split(',').map(s=>s.trim()).filter(Boolean).includes(userId);
}
export function validateSettings(input:Partial<Settings>):Settings {
 const s={...defaultSettings,...input};
 if(typeof s.pickupEnabled!=='boolean'||typeof s.deliveryEnabled!=='boolean'||!Array.isArray(s.zones)||s.zones.length>30)throw new Error('Invalid restaurant settings.');
 const seen=new Set();
 s.zones=s.zones.map(z=>{
  if(!z||typeof z.id!=='string'||!/^[a-z0-9-]{1,60}$/.test(z.id)||typeof z.name!=='string'||!z.name.trim()||z.name.length>80||!Number.isSafeInteger(z.fee)||z.fee<0||z.fee>10000||seen.has(z.id))throw new Error('Delivery zones need unique IDs, names and non-negative whole-shilling fees.');
  seen.add(z.id);return {id:z.id,name:z.name.trim(),fee:z.fee};
 });
 if(s.restaurantPoint!==null&&!validPoint(s.restaurantPoint))throw new Error('Invalid restaurant location.');
 for(const k of ['address','phone','hours','pickupInstructions'] as const)if(typeof s[k]!=='string'||s[k].length>500)throw new Error('Invalid restaurant details.');
 return s;
}
export const money=(n:number)=>'KSh '+n.toLocaleString('en-KE');
