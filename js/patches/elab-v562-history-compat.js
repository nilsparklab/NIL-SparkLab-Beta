
/* v5.62 compatibility facade: canonical Builder-state history owns Undo/Redo. */
(function(){
  "use strict";
  function selectedComponent(){
    return document.querySelector("[data-component].is-selected") || document.querySelector("[data-component][aria-selected='true']");
  }
  function diagnose(){
    if(typeof window.runSmartDiagnostics === "function") return window.runSmartDiagnostics();
    return null;
  }
  window.NilSparkLabV521={
    undo:function(){ if(typeof window.undoAction==='function') window.undoAction(); },
    redo:function(){ if(typeof window.redoAction==='function') window.redoAction(); },
    duplicate:function(){ return null; },
    deleteSelected:function(){ if(typeof window.removeBuilderComp==='function'){ var c=selectedComponent(); if(c) window.removeBuilderComp(c.dataset.componentId||c.id); } },
    diagnose:diagnose,
    commit:function(){ if(typeof window.saveStateForUndo==='function') window.saveStateForUndo(); }
  };
})();
