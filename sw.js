const V='jxwl-v2';const STATIC='jxwl-s-v2';
const GAME_IMGS=['LOL.png','CF.png','DNF.png','yjwj.png','heji.png','wzry.png','ys.png','mssj.png','nz.png','mhxy.png','cq.png'];
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    let c=await caches.open(STATIC);
    await c.addAll(['/','/index.html','/admin.html',...GAME_IMGS.map(f=>'/'+f)]);
    self.skipWaiting()
  })())
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    let keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==V&&k!==STATIC).map(k=>caches.delete(k)));
    await clients.claim()
  })())
});
self.addEventListener('fetch',e=>{
  let u=new URL(e.request.url);
  // Don't cache API calls
  if(u.hostname==='api.github.com')return;
  // data.json - network first, cache fallback
  if(u.pathname==='/data.json'||u.href.includes('data.json')){
    e.respondWith((async()=>{
      try{
        let r=await fetch(e.request);
        if(r.ok){let c=await caches.open(V);c.put(e.request,r.clone())}
        return r
      }catch{return(await caches.match(e.request))||new Response('[]',{status:200})}
    })());
    return
  }
  // Other assets - cache first
  e.respondWith((async()=>{
    let cached=await caches.match(e.request);
    if(cached)return cached;
    try{
      let r=await fetch(e.request);
      if(r.ok){let c=await caches.open(V);c.put(e.request,r.clone())}
      return r
    }catch{return new Response('',{status:408})}
  })());
});
