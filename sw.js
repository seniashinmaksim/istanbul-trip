const C="trip-1547b8d3";
const CORE=["./","./index.html","./manifest.webmanifest","./icon-180.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(u.origin===location.origin){
    // network first, but never wait more than 2.5 s: on a weak signal the saved copy opens at once and refreshes in the background
    const net=fetch(e.request).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));}return r;});
    e.waitUntil(net.catch(()=>{}));
    e.respondWith(new Promise(res=>{
      let done=false;const fin=r=>{if(!done&&r){done=true;res(r);}};
      const fromCache=()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match("./index.html"));
      const tm=setTimeout(()=>fromCache().then(r=>{if(r)fin(r);}),2500);
      net.then(r=>{clearTimeout(tm);fin(r);}).catch(()=>{clearTimeout(tm);fromCache().then(r=>fin(r||Response.error()));});
    }));
    return;
  }
  if(u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));return res;})));
  }
});
