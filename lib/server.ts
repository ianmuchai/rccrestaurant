import { env } from 'cloudflare:workers';
import baseCatalog from './catalog.json';
import { defaultSettings,canStaff, type MenuItem,type Settings } from './order';
export const secrets=()=>env as unknown as Record<string,any>;
export function database():D1Database {
 const db=secrets().DB;if(!db)throw new Error('Order storage is not connected yet.');return db;
}
export async function catalog():Promise<MenuItem[]> {
 const {results}=await database().prepare('SELECT id,value FROM menu_overrides').all<{id:string;value:string}>();
 const changes=new Map(results.map(r=>[r.id,JSON.parse(r.value)]));
 return (baseCatalog as MenuItem[]).map(i=>({...i,...changes.get(i.id)}));
}
export async function settings():Promise<Settings> {
 const row=await database().prepare("SELECT value FROM settings WHERE key='restaurant'").first<{value:string}>();
 return row?{...defaultSettings,...JSON.parse(row.value)}:defaultSettings;
}
export function requireStaff(request:Request) {
 const id=request.headers.get('oai-authenticated-user-id');
 if(!canStaff(id,secrets().STAFF_USER_IDS||''))throw new HttpError(403,'Staff access is not configured for this account.');
 return id!;
}
export class HttpError extends Error {status:number;constructor(status:number,message:string){super(message);this.status=status;}}
export const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'}});
export async function hash(v:string) {
 return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))).map(b=>b.toString(16).padStart(2,'0')).join('');
}
export async function limited(request:Request,scope:string,max=12) {
 const bucket=Math.floor(Date.now()/60000);const ip=request.headers.get('cf-connecting-ip')||request.headers.get('oai-authenticated-user-id')||'anonymous';
 const key=scope+':'+await hash(ip)+':'+bucket;
 const row=await database().prepare('INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,bucket+2).first<{count:number}>();
 if(Math.random()<.02)await database().prepare('DELETE FROM rate_limits WHERE expires < ?').bind(bucket).run();
 if(!row||row.count>max)throw new HttpError(429,'Please wait a minute before trying again.');
}
export async function readBody(request:Request) {
 if(!request.headers.get('content-type')?.includes('application/json'))throw new HttpError(415,'Use JSON request data.');
 if(Number(request.headers.get('content-length')||0)>32768)throw new HttpError(413,'Request is too large.');
 const reader=request.body?.getReader();if(!reader)throw new HttpError(400,'Request data is missing.');
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>32768){await reader.cancel();throw new HttpError(413,'Request is too large.');}chunks.push(value);}
 const bytes=new Uint8Array(size);let pos=0;for(const c of chunks){bytes.set(c,pos);pos+=c.length;}
 try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new HttpError(400,'Invalid request data.');}
}
export function sameOrigin(request:Request) {
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)throw new HttpError(403,'Request origin is not allowed.');
}
export async function authorizedOrder(request:Request,id:string) {
 const token=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 if(!/^[a-f0-9-]{60,80}$/i.test(token))throw new HttpError(404,'Order not found.');
 const row=await database().prepare('SELECT * FROM orders WHERE id=? AND token_hash=?').bind(id,await hash(token)).first<any>();
 if(!row)throw new HttpError(404,'Order not found.');return row;
}
