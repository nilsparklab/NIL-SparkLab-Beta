
(function(){
  "use strict";
  var wrap = document.getElementById("elab-sa-suggestions");
  var toggle = document.getElementById("elab-sa-suggestions-toggle");
  var content = document.getElementById("elab-smart-content");
  if(!wrap || !toggle || !content) return;

  function setOpen(open){
    wrap.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if(open){
      var toolsMenu=document.getElementById("elab-sa-tools");
      var toolsToggle=document.getElementById("elab-sa-tools-toggle");
      if(toolsMenu){toolsMenu.classList.remove("open"); toolsMenu.setAttribute("aria-hidden","true");}
      if(toolsToggle) toolsToggle.setAttribute("aria-expanded","false");
    }
  }
  toggle.addEventListener("click", function(){ setOpen(!wrap.classList.contains("open")); });

  // Auto-collapse the suggestions the first time an answer/result actually
  // renders, so the user sees the result immediately instead of scrolling
  // past every quick-action row. The user can still reopen suggestions
  // any time via the toggle above.
  var userToggled = false;
  toggle.addEventListener("click", function(){ userToggled = true; }, { once: true });
  var mo = new MutationObserver(function(){
    if(userToggled) return;
    if(content.childNodes.length > 0) setOpen(false);
  });
  mo.observe(content, { childList: true });
})();
