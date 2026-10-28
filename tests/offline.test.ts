import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
function worker(){const listeners:Record<string,Function>={};vm.runInNewContext(readFileSync(new URL('../public/sw.js',import.meta.url),'utf8'),{self:{location:{origin:'https://rcc.test'},addEventListener:(name:string,fn:Function)=>listeners[name]=fn},URL,Response,fetch:async()=>{throw Error('offline');},caches:{open:async()=>({match:async()=>new Response('cached public asset')})}});return listeners.fetch;}
test('offline production JS and CSS can be served from the public cache',async()=>{
 for(const path of ['/_next/static/chunks/framework.js','/_next/static/css/index.css']){const captured:{response?:Promise<Response>}={};worker()({request:new Request('https://rcc.test'+path),respondWith:(p:Promise<Response>)=>captured.response=p});assert.ok(captured.response,'Static assets must be intercepted');assert.equal(await(await captured.response).text(),'cached public asset');}
});
test('never intercepts personal data, staff, or payment requests',()=>{
 for(const path of ['/admin','/api/orders/123','/api/config','/api/mpesa/callback']){let intercepted=false;worker()({request:new Request('https://rcc.test'+path),respondWith:()=>intercepted=true});assert.equal(intercepted,false);}
});
test('separate public pages can reload from cache while offline',async()=>{
 for(const path of ['/menu','/moments','/visit','/menu/coffee','/menu/breakfast']){const captured:{response?:Promise<Response>}={};worker()({request:{method:'GET',url:'https://rcc.test'+path,mode:'navigate',headers:new Headers()},respondWith:(p:Promise<Response>)=>captured.response=p});assert.ok(captured.response,path+' must be available offline');assert.equal(await(await captured.response).text(),'cached public asset');}
});
