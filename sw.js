const CACHE='my-ot-tracker-v19';
const ASSETS=['./','./index.html','./app.mjs','./core.mjs','./style-v19.css','./firebase-config.mjs','./cloud-backup.mjs','./manifest.webmanifest','./icon.svg','./contoh-roster.csv'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const c=await caches.open(CACHE);
 await Promise.all(ASSETS.map(async url=>{try{const r=await fetch(new Request(url,{cache:'reload'}));if(r.ok)await c.put(url,r)}catch{}}));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('my-ot-tracker-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const req=event.request; const url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   try{const response=await Promise.race([fetch(new Request(req,{cache:'no-store'})),new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),2200))]);
    if(response.ok){event.waitUntil(cache.put('./',response.clone()));return response}
   }catch{}
   return await cache.match('./')||await cache.match('./index.html')||Response.error();
  })());return;
 }
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{const network=await fetch(new Request(req,{cache:'no-cache'}));if(network.ok){event.waitUntil(cache.put(req,network.clone()));return network}}catch{}
  return await caches.match(req,{ignoreSearch:true})||Response.error();
 })());
});
