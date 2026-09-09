
(function(){
  "use strict";
  function closeToolsPanel(){
    var menu=document.getElementById("elab-sa-tools");
    var toggle=document.getElementById("elab-sa-tools-toggle");
    if(menu){menu.classList.remove("open");menu.setAttribute("aria-hidden","true");}
    if(toggle) toggle.setAttribute("aria-expanded","false");
  }
  function closeSuggestionsPanel(){
    var wrap=document.getElementById("elab-sa-suggestions");
    var toggle=document.getElementById("elab-sa-suggestions-toggle");
    if(wrap) wrap.classList.remove("open");
    if(toggle) toggle.setAttribute("aria-expanded","false");
  }
  /* Registered first (top of body) so it always runs before any later
     capture-phase handler calls stopImmediatePropagation — collapses the
     open Tools / Suggestions panel the instant an action inside it is
     picked, so the answer that follows has a clean, uncluttered view. */
  document.addEventListener("click",function(e){
    var t=e.target;
    if(!t||!t.closest) return;
    if(t.closest("#elab-sa-chips [data-sa-q]") ||
       t.closest("#elab-sa-suggestions [data-nil-v48]") ||
       t.closest("#elab-sa-suggestions [data-nil-v49]") ||
       t.closest("#elab-sa-suggestions [data-nil-v51]") ||
       t.closest("#elab-sa-suggestions [data-nil-v54]") ||
       t.closest("#elab-sa-suggestions [data-nil-v56]") ||
       t.closest("#elab-sa-suggestions [data-nil-v56-action]")){
      closeSuggestionsPanel();
      return;
    }
    if(t.closest("#elab-sa-tools button")){
      closeToolsPanel();
    }
  },true);
})();
