
(function(){
  "use strict";
  function run(){
    var el=document.getElementById('elab-v591-audit');
    if(!el)return;
    try{
      var db=(typeof componentsDatabase!=='undefined')?componentsDatabase:[];
      var map=(typeof builderAddMap!=='undefined')?builderAddMap:{};
      var circuitCount=Object.keys(map).length;
      var registry=(window.ComponentRegistry instanceof Map)?window.ComponentRegistry:null;
      if(registry){
        var groups={'fully-functional':0,'builder-partial':0,'dedicated-lab':0,'documentation-only':0};
        var unmapped=[];
        db.forEach(function(c){
          var cap=registry.get(c.id);
          if(!cap){ unmapped.push(c.id); return; }
          if(Object.prototype.hasOwnProperty.call(groups,cap.functionalGroup)) groups[cap.functionalGroup]++;
        });
        if(unmapped.length){
          el.innerHTML='<strong style="color:#fca5a5">⚠ Registry audit:</strong> '+unmapped.length+' component(s) are missing capability metadata.';
        }else{
          el.innerHTML='<strong style="color:#86efac">✓ End-to-end component audit:</strong> '+db.length+' unique components checked · '+circuitCount+' Builder · '+groups['fully-functional']+' fully functional · '+groups['builder-partial']+' partial · '+groups['dedicated-lab']+' dedicated · '+groups['documentation-only']+' documentation-only.';
        }
      }else{
        var missing=db.filter(function(c){return !map[c.id];});
        el.innerHTML=missing.length
          ? '<strong style="color:#fcd34d">⚠ Compatibility audit:</strong> registry unavailable; '+missing.length+' component(s) are not Builder-mapped.'
          : '<strong style="color:#86efac">✓ Compatibility audit:</strong> '+db.length+' directory components checked; '+circuitCount+' can be placed in Circuit Builder.';
      }
    }catch(e){el.innerHTML='<strong style="color:#fca5a5">⚠ Compatibility audit unavailable:</strong> '+String(e.message||e);}
  }
  document.addEventListener('DOMContentLoaded',run);
})();
