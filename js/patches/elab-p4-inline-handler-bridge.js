
(function(){
  "use strict";
  // Progressive hardening: route data-elab-action clicks without new inline handlers.
  document.addEventListener("click", function(e){
    var t = e.target && e.target.closest && e.target.closest("[data-elab-action]");
    if(!t) return;
    var act = t.getAttribute("data-elab-action");
    if(!act) return;
    e.preventDefault();
    try {
      if(act === "show-home" && window.showSection) showSection("home");
      else if(act === "show-builder" && window.showSection) showSection("builder");
      else if(act === "show-components" && window.showSection) showSection("components");
      else if(act === "show-industrial" && window.showSection) showSection("industrial");
      else if(act === "show-quiz" && window.showSection) showSection("quiz");
      else if(act === "run-sim" && window.runBuilderSim) runBuilderSim();
      else if(act === "toggle-lang" && window.toggleLanguage) toggleLanguage();
      else if(act.indexOf("section:")===0 && window.showSection) showSection(act.slice(8));
    } catch(err){ console.warn("elab-action", err); }
  }, true);

  // Security: neutralize javascript: URLs in anchors at click time
  document.addEventListener("click", function(e){
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if(!a) return;
    var href = (a.getAttribute("href")||"").trim().toLowerCase();
    if(href.indexOf("javascript:")===0 || href.indexOf("data:text/html")===0){
      e.preventDefault();
      e.stopPropagation();
      console.warn("NilSparkLab Security: blocked javascript:/data navigation");
    }
  }, true);
})();
