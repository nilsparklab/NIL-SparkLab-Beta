
(function(){
"use strict";
window.toggleNilSparkLabLearningTools=function(){
 var p=document.getElementById("elab-learning-tools"),b=document.getElementById("elab-learning-lab-toggle");
 if(!p||!b)return;
 var open=p.classList.contains("hidden");
 p.classList.toggle("hidden",!open);p.setAttribute("aria-hidden",open?"false":"true");
 b.setAttribute("aria-expanded",open?"true":"false");
};
window.elabOpenLearningTool=function(t){
 try{
  switch(t){
   case"multimeter":if(window.NilSparkLabMultimeter)window.NilSparkLabMultimeter.open();break;
   case"oscilloscope":if(window.NilSparkLabScope)window.NilSparkLabScope.open();break;
   case"experiments":if(window.NilSparkLabExperimentLab)window.NilSparkLabExperimentLab.open();break;
   case"challenges":if(window.NilSparkLabChallenge)window.NilSparkLabChallenge.open();break;
   case"wiring":if(window.NilSparkLabWiring)window.NilSparkLabWiring.open();break;
   case"practical":if(window.NilSparkLabPracticalLab)window.NilSparkLabPracticalLab.open();break;
   case"projects":if(window.NilSparkLabProjectManager2)window.NilSparkLabProjectManager2.open();else if(window.NilSparkLabProjectSystem)window.NilSparkLabProjectSystem.open();break;
   case"properties":
    var cs=window.builderCanvasComps;
    if(window.NilSparkLabAdvancedProperties){
     if(Array.isArray(cs)&&cs.length)window.NilSparkLabAdvancedProperties.open(cs[0].id);
     else if(window.elabV575Toast) elabV575Toast("Add a component first, then open Properties."); else NilSparkLabDialog.alert("Add a component first, then open Properties.",{title:"No Component"});
    }break;
   case"solver":if(window.NilSparkLabRealtimeSolver)window.NilSparkLabRealtimeSolver.open();break;
   case"waveform":if(window.NilSparkLabWaveformAnalysis)window.NilSparkLabWaveformAnalysis.open();break;
   case"records":if(window.NilSparkLabLabRecords)window.NilSparkLabLabRecords.open();break;
   case"audit":
    if(window.NilSparkLabFinalAudit){
     var a=window.NilSparkLabFinalAudit.run(),m=[];
     Object.keys(a.checks).forEach(function(k){if(!a.checks[k])m.push(k)});
     if(window.elabV575Toast)window.elabV575Toast("Final audit: "+a.passed+"/"+a.total+" modules"+(m.length?" · Missing: "+m.join(", "):" · All modules ready"));
    }break;
  }
 }catch(e){console.warn("Learning Lab tool error:",t,e)}
};
var old=["elab-v557-dmm-launch","elab-v558-scope-launch","elab-v559-lab-launch","elab-v560-launch","elab-v566-wire-launch","elab-v568-launch","elab-v570-launch","elab-v571-launch","elab-v572-launch","elab-v573-launch","elab-v574-launch","elab-v575-launch"];
function hide(){old.forEach(function(id){var e=document.getElementById(id);if(e)e.style.display="none"})}
document.addEventListener("DOMContentLoaded",function(){hide();setTimeout(hide,100);setTimeout(hide,500);setTimeout(hide,1200)});
})();
