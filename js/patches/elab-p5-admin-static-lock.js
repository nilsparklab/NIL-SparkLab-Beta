
(function(){
  "use strict";
  function isStaticHost(){
    try {
      var h = location.hostname || "";
      if(/github\.io$|pages\.dev$|netlify\.app$|localhost|127\.0\.0\.1/.test(h)) return true;
      if(location.protocol === "file:") return true;
    } catch(_){}
    return false;
  }
  function lockAdmin(){
    if(!isStaticHost()) return;
    var ids = []; // elab-v538/v540 admin-gate elements removed 2026 (were confirmed dead/unreachable); legacy fetch interception is retained only as a defensive compatibility guard
    ids.forEach(function(id){
      var el = document.getElementById(id);
      if(!el) return;
      el.style.display = "none";
      el.setAttribute("data-elab-locked","static-host");
      el.querySelectorAll("input,button").forEach(function(n){ n.disabled = true; });
    });
    // Block recovery network calls from succeeding silently
    var origFetch = window.fetch;
    if(typeof origFetch === "function" && !window.fetch.__elabP5){
      window.fetch = function(input, init){
        var url = String(input && input.url ? input.url : input);
        if(/\/api\/admin\//.test(url) && isStaticHost()){
          return Promise.resolve(new Response(JSON.stringify({ok:false,error:"Admin API unavailable on static host"}), {status:503, headers:{"Content-Type":"application/json"}}));
        }
        return origFetch.apply(this, arguments);
      };
      window.fetch.__elabP5 = true;
    }
    console.info("NilSparkLab: admin UI locked on static host");
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", lockAdmin);
  else lockAdmin();
})();
