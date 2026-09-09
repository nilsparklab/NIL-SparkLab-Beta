
(function(){
"use strict";
function norm(s){return String(s||"").toLowerCase().replace(/[^a-z0-9\u0900-\u097f\s.+\-\/]/gi," ").replace(/\s+/g," ").trim();}
function has(n,a){return a.some(function(x){return n.indexOf(x)>=0;});}
function analyze(c){
  if(!c || !c.components) return {ok:false,issues:["No compiled circuit found."]};
  var issues=[], warnings=[];
  var types=c.components.map(function(x){return x.type;});
  var refs=c.components.map(function(x){return x.ref;});
  if(types.indexOf("ground")<0) warnings.push("No explicit ground/return reference detected.");
  if(types.indexOf("battery")>=0 && types.indexOf("ac_source")>=0) warnings.push("Both AC and DC sources are present; verify intended topology.");
  if(types.indexOf("led")>=0 && types.indexOf("resistor")<0) issues.push("LED current-limiting resistor is not explicitly present.");
  if((types.indexOf("motor")>=0 || types.indexOf("relay")>=0) &&
     (types.indexOf("mosfet_n")>=0 || types.indexOf("bjt_npn")>=0) &&
     types.indexOf("diode")<0) warnings.push("Inductive load detected without an explicit flyback diode.");
  if(types.indexOf("transformer")>=0 && types.indexOf("battery")>=0) warnings.push("Transformer normally requires an AC excitation model; verify the source.");
  if(c.nets && !c.nets.length) issues.push("No electrical nets were generated.");
  var duplicate={}; refs.forEach(function(r){duplicate[r]=(duplicate[r]||0)+1;});
  Object.keys(duplicate).forEach(function(r){if(duplicate[r]>1) issues.push("Duplicate reference: "+r);});
  return {ok:issues.length===0,issues:issues,warnings:warnings,
    status:issues.length?"invalid":(warnings.length?"needs-review":"validated-structure")};
}
window.NilSparkLabSmartTopology={version:"6.26",analyze:analyze};
})();
