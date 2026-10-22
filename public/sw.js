const CACHE='rcc-public-v2';
const SHELL=['/','/manifest.webmanifest','/brand/icon-192.png','/brand/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('rcc-')&&key!==CACHE).map(key=>caches.delete(key)))));});
self.addEventListener('fetch',event=>{
 const r=event.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==self.location.origin||r.headers.has('authorization'))return;
 if(u.pathname.startsWith('/admin')||u.pathname.startsWith('/api/')&&u.pathname!=='/api/catalog'||/signin|signout|callback/.test(u.pathname))return;
 const navigation=r.mode==='navigate'&&u.pathname==='/';
 const catalog=u.pathname==='/api/catalog';
 const staticChunk=u.pathname.startsWith('/_next/static/');
 const asset=/^\/(assets|brand|vendor)\//.test(u.pathname)&&!u.pathname.endsWith('.pdf')&&!/\.(mp4|webm)$/i.test(u.pathname);
 if(!navigation&&!catalog&&!asset&&!staticChunk&&u.pathname!=='/manifest.webmanifest')return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{const response=await fetch(r);if(response.ok&&response.type!=='opaqueredirect'&&new URL(response.url).pathname===u.pathname){await cache.put(r,response.clone());}return response;}
  catch{const saved=await cache.match(r);if(saved)return saved;if(navigation){const home=await cache.match('/');if(home)return home;}return new Response(catalog?'{"error":"Offline"}':'Offline',{status:503,headers:{'Content-Type':catalog?'application/json':'text/plain'}});}
 })());
});
