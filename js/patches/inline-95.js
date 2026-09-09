
(function(){
"use strict";
var toastTimer=0;

function toast(msg){
  var e=document.getElementById("elab-v575-toast");if(!e)return;
  e.textContent=msg;e.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(function(){e.classList.remove("show");},2200);
}
window.elabV575Toast=toast;
function status(msg,kind){
  var box=document.getElementById("elab-v575-status"),t=document.getElementById("elab-v575-status-text");
  if(!box||!t)return;t.textContent=msg;box.className=""; if(kind) box.classList.add(kind); box.id="elab-v575-status";
}
function componentCount(){
  try{return Array.isArray(window.builderCanvasComps)?window.builderCanvasComps.length:0;}catch(e){return 0;}
}
function wireCount(){
  try{return Array.isArray(window.builderWires)?window.builderWires.length:0;}catch(e){return 0;}
}
function refreshStatus(){
  status("Ready · "+componentCount()+" components · "+wireCount()+" wires","ok");
}
function safeCall(fn){
  try{if(typeof fn==="function")return fn();}catch(e){console.warn("NilSparkLab:",e);}
}
function markDirty(){
  document.documentElement.dataset.unsaved="true";
  refreshStatus();
}

/* Lightweight keyboard shortcuts, intentionally non-destructive. */
document.addEventListener("keydown",function(e){
  var tag=(e.target&&e.target.tagName||"").toLowerCase();
  var typing=tag==="input"||tag==="textarea"||tag==="select"||e.target.isContentEditable;
  if(e.key==="Escape"){
    document.querySelectorAll("[id^='elab-v5']").forEach(function(x){
      if(x.classList&&x.classList.contains("open"))x.classList.remove("open");
    });
  }
  if(typing)return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){
    e.preventDefault();
    if(window.NilSparkLabProjectManager2){
      try{
        var pmName=document.getElementById("elab-v570-name");
        var currentName=pmName&&pmName.value?pmName.value:"Untitled Circuit";
        if(typeof window.NilSparkLabProjectManager2.save==="function"){
          window.NilSparkLabProjectManager2.save(currentName);
          toast("Project saved");
        }else{
          window.NilSparkLabProjectManager2.open();
          toast("Project Manager opened");
        }
      }catch(err){
        window.NilSparkLabProjectManager2.open();
        toast("Project Manager opened");
      }
    }else toast("Project Manager unavailable");
  }
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){
    toast("Undo shortcut detected");
  }
});

window.addEventListener("error",function(e){
  status("Runtime warning","warn");
  console.warn("NilSparkLab runtime warning:",e.message);
});
window.addEventListener("unhandledrejection",function(e){
  status("Runtime warning","warn");
  console.warn("NilSparkLab promise warning:",e.reason);
});

/* Public final-release diagnostics. */
window.NilSparkLabFinalAudit={
  run:function(){
    var checks={
      projectManager:!!window.NilSparkLabProjectManager2,
      properties:!!window.NilSparkLabAdvancedProperties,
      solver:!!window.NilSparkLabRealtimeSolver,
      waveform:!!window.NilSparkLabWaveformAnalysis,
      records:!!window.NilSparkLabLabRecords,
      practical:!!window.NilSparkLabPracticalLab
    };
    var passed=Object.keys(checks).filter(function(k){return checks[k];}).length;
    refreshStatus();
    return {passed:passed,total:Object.keys(checks).length,checks:checks};
  }
};

document.addEventListener("DOMContentLoaded",function(){
  refreshStatus();
  var a=window.NilSparkLabFinalAudit.run();
  if(a.passed===a.total)toast("NIL SparkLab — Final systems ready");
  else toast("Final build loaded · "+a.passed+"/"+a.total+" modules detected");
});
})();
