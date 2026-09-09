
(function(){
"use strict";

/* v7.01 — Exact netlist builder */
function buildNetlist(c){
  c=c||{};
  var nets=[], issues=[];
  (c.connections||c.nets||[]).forEach(function(n){
    if(n.from&&n.to) nets.push({from:String(n.from),to:String(n.to),type:"net"});
    else issues.push("Incomplete connection.");
  });
  return {version:"7.01",status:issues.length?"NEEDS_REVIEW":"NETLIST_READY",nets:nets,issues:issues};
}

/* v7.02 — component rating database */
var RATINGS={
 resistor:{units:["ohm","W"],limits:["resistance","power"]},
 capacitor:{units:["F","V"],limits:["capacitance","voltage"]},
 diode:{units:["A","V"],limits:["forward_current","reverse_voltage"]},
 led:{units:["A","V"],limits:["forward_current","forward_voltage"]},
 mosfet_n:{units:["V","A","W"],limits:["VDS","ID","PD","RDS_ON"]},
 bjt_npn:{units:["V","A","W"],limits:["VCE","IC","PD"]},
 transformer:{units:["V","V","VA"],limits:["primary","secondary","power"]},
 motor:{units:["V","A","W"],limits:["voltage","current","power"]}
};
function ratingInfo(type){return {version:"7.02",type:type,data:RATINGS[type]||null};}

/* v7.03 — circuit library matching */
var LIBRARY=[
 {key:"led_indicator",tags:["led","indicator","light"],domain:"analog"},
 {key:"voltage_divider",tags:["divider","voltage","resistor"],domain:"analog"},
 {key:"rc_low_pass",tags:["low pass","filter","rc"],domain:"analog"},
 {key:"full_wave_bridge",tags:["bridge","rectifier","ac to dc"],domain:"power"},
 {key:"buck_converter",tags:["buck","step down","dc dc"],domain:"power"},
 {key:"boost_converter",tags:["boost","step up","dc dc"],domain:"power"},
 {key:"h_bridge",tags:["h bridge","motor","direction"],domain:"power"},
 {key:"555_timer",tags:["555","timer","oscillator"],domain:"digital"},
 {key:"uart_interface",tags:["uart","serial"],domain:"embedded"},
 {key:"i2c_interface",tags:["i2c","sensor","bus"],domain:"embedded"},
 {key:"star_delta",tags:["star delta","motor starter"],domain:"industrial"}
];
function matchLibrary(q){
 var n=String(q||"").toLowerCase(), out=[];
 LIBRARY.forEach(function(x){
   var score=0;
   x.tags.forEach(function(t){if(n.indexOf(t)>=0)score++;});
   if(score)out.push({key:x.key,domain:x.domain,score:score});
 });
 out.sort(function(a,b){return b.score-a.score;});
 return {version:"7.03",matches:out};
}

/* v7.04 — requirement parser */
function parseRequirements(q){
 var n=String(q||"").toLowerCase(), r={};
 var v=n.match(/(\d+(?:\.\d+)?)\s*v\b/); if(v)r.voltage=parseFloat(v[1]);
 var a=n.match(/(\d+(?:\.\d+)?)\s*(a|amp|amps|ampere)/); if(a)r.current=parseFloat(a[1]);
 var w=n.match(/(\d+(?:\.\d+)?)\s*w\b/); if(w)r.power=parseFloat(w[1]);
 if(/speed control|speed controller/.test(n))r.speedControl=true;
 if(/isolation|isolated/.test(n))r.isolation=true;
 if(/regulated|regulator/.test(n))r.regulated=true;
 if(/ac\b|mains|230v|240v/.test(n))r.sourceType="AC";
 if(/dc\b|battery|12v|5v|9v|24v/.test(n))r.sourceType="DC";
 return {version:"7.04",requirements:r};
}

/* v7.05 — topology selection */
function chooseTopology(requirements,matches){
 var r=requirements||{}, m=matches||[], choice=m.length?m[0].key:null;
 if(r.speedControl)choice="h_bridge";
 else if(r.regulated&&r.voltage)choice="buck_converter";
 else if(r.isolation)choice="isolated_converter";
 return {version:"7.05",selected:choice,alternatives:m.slice(0,4),status:choice?"SELECTED":"NEEDS_CLARIFICATION"};
}

/* v7.06 — value synthesis */
function synthesizeValues(r){
 var out=[],V=Number(r&&r.voltage),I=Number(r&&r.current);
 if(V>0&&I>0){
   out.push({name:"load resistance",formula:"R=V/I",value:V/I,unit:"ohm"});
   out.push({name:"load power",formula:"P=VI",value:V*I,unit:"W"});
 }
 return {version:"7.06",status:out.length?"CALCULATED":"NEEDS_VALUES",results:out};
}

/* v7.07 — safety and rating gate */
function safetyGate(req,components){
 var warnings=[];
 if(req&&req.sourceType==="AC")warnings.push("AC/mains design requires appropriate isolation, creepage, clearance and rated components.");
 if(req&&req.power>0&&req.power>100)warnings.push("High-power requirement detected; component thermal and protection ratings need verification.");
 if((components||[]).some(function(x){return x.type==="motor";}))
   warnings.push("Motor circuits require suitable overcurrent, switching and transient protection.");
 return {version:"7.07",status:warnings.length?"REVIEW_REQUIRED":"BASIC_CHECKS_CLEAR",warnings:warnings};
}

/* v7.08 — diagram specification */
function diagramSpec(c){
 var items=(c&&c.components||[]).map(function(x,i){
   return {ref:x.ref||("X"+(i+1)),type:x.type,x:100+(i%6)*170,y:100+Math.floor(i/6)*120,
           label:x.ref||x.type,value:x.value||"",symbol:x.symbol||x.type};
 });
 return {version:"7.08",status:"DIAGRAM_SPEC_READY",style:"professional-schematic",
         routing:"orthogonal",junctions:true,items:items,nets:(c&&c.nets)||[]};
}

/* v7.09 — verification report */
function verificationReport(c,req){
 var issues=[],warnings=[];
 if(!c||!(c.components||[]).length)issues.push("No generated components.");
 if(!c||!(c.nets||[]).length)warnings.push("No explicit electrical nets available.");
 var gate=safetyGate(req,c&&c.components||[]);
 warnings=warnings.concat(gate.warnings);
 return {version:"7.09",status:issues.length?"INVALID":warnings.length?"NEEDS_REVIEW":"STRUCTURE_VERIFIED",
         issues:issues,warnings:warnings};
}

/* v9.11 — real-world universal design orchestrator */
function generate(request,components){
 var req=parseRequirements(request);
 var match=matchLibrary(request);
 var topology=chooseTopology(req.requirements,match.matches);
 var values=synthesizeValues(req.requirements);
 var comps=components||[];
 var netlist=buildNetlist({components:comps,nets:[]});
 var safety=safetyGate(req.requirements,comps);
 var diagram=diagramSpec({components:comps,nets:netlist.nets});
 var report=verificationReport({components:comps,nets:netlist.nets},req.requirements);
 return {
   version:"9.11",request:request,requirements:req,library:match,
   topology:topology,values:values,netlist:netlist,safety:safety,
   diagram:diagram,verification:report,
   status:report.status
 };
}
window.NilSparkLabUniversalV710={
 version:"9.11",buildNetlist:buildNetlist,ratingInfo:ratingInfo,
 matchLibrary:matchLibrary,parseRequirements:parseRequirements,
 chooseTopology:chooseTopology,synthesizeValues:synthesizeValues,
 safetyGate:safetyGate,diagramSpec:diagramSpec,
 verificationReport:verificationReport,generate:generate
};
})();
