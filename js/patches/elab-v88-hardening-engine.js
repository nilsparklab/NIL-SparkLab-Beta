
(() => {
"use strict";

const checks = [
  {
    id:"HDR-01", name:"CSP",
    run:()=>({state: document.querySelector('meta[http-equiv="Content-Security-Policy"]') ? "PRESENT" : "SERVER REQUIRED",
      detail:"CSP should ultimately be enforced by the HTTP response header."})
  },
  {
    id:"HDR-02", name:"HSTS",
    run:()=>({state:"SERVER REQUIRED",
      detail:"HSTS cannot be reliably enabled by this static page; configure it at the HTTPS server/CDN."})
  },
  {
    id:"HDR-03", name:"Frame protection",
    run:()=>({state: document.querySelector('meta[http-equiv="X-Frame-Options"]') ? "PRESENT" : "SERVER REQUIRED",
      detail:"Prefer CSP frame-ancestors at the server/CDN."})
  },
  {
    id:"AUTH-01", name:"Owner authorization",
    run:()=>({state:"SERVER REQUIRED",
      detail:"Owner/admin access must be authorized server-side; hiding a client-side panel is not authorization."})
  },
  {
    id:"RATE-01", name:"API rate limiting",
    run:()=>({state:"SERVER REQUIRED",
      detail:"Rate limits must be enforced at the API/server boundary, not only in browser JavaScript."})
  },
  {
    id:"INPUT-02", name:"Server validation",
    run:()=>({state:"SERVER REQUIRED",
      detail:"Treat all client input as untrusted and validate/normalize it on the server."})
  },
  {
    id:"LOG-01", name:"Audit logging",
    run:()=>({state:"SERVER REQUIRED",
      detail:"Security events should be logged server-side with privacy-aware retention."})
  },
  {
    id:"DEP-01", name:"Dependency scanning",
    run:()=>({state:"CI REQUIRED",
      detail:"Run dependency/SCA and secret scanning in CI before release."})
  }
];

window.NilSparkLabProductionHardening = Object.freeze({
  version:"8.8",
  run(){
    const results=checks.map(c=>{try{return {...c.run(),id:c.id,name:c.name}}
      catch(e){return {id:c.id,name:c.name,state:"ERROR",detail:String(e?.message||e)}}});
    return {version:"8.8",timestamp:new Date().toISOString(),results};
  },
  checks:checks.map(c=>c.id)
});
})();
