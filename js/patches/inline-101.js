
(function(){
  'use strict';
  window.NilSparkLabComponentAudit=function(){
    try{
      const comps=Array.isArray(window.builderCanvasComps)?window.builderCanvasComps:[];
      const bad=[];
      comps.forEach(c=>{
        if(!c||!c.id||!c.type||!Array.isArray(c.terminals)||!c.terminals.length)bad.push(c?.name||'Unknown component');
      });
      const el=document.getElementById('builder-component-count'); if(el){ const defs=Array.isArray(window.NilSparkLabBuilderDefinitions)?window.NilSparkLabBuilderDefinitions:[]; el.textContent=(defs.length||40)+' Supported'; }
      return {components:comps.length,invalid:bad};
    }catch(e){return {components:0,invalid:['audit error']};}
  };
  document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){try{window.NilSparkLabComponentAudit();}catch(e){}},0);});
})();
