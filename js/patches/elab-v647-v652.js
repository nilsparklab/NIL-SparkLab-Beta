
(function(){
"use strict";

/* v6.47 — Pin-accurate component registry */
var pinDB={
 "555_timer":{pins:["1:GND","2:TRIG","3:OUT","4:RESET","5:CTRL","6:THRESH","7:DISCH","8:VCC"]},
 "lm358":{pins:["1:OUT_A","2:IN-_A","3:IN+_A","4:VCC-","5:IN+_B","6:IN-_B","7:OUT_B","8:VCC+"]},
 "lm317":{pins:["1:ADJ","2:OUT","3:IN"]},
 "7805":{pins:["1:IN","2:GND","3:OUT"]},
 "ir_sensor":{pins:["VCC","GND","OUT"]},
 "hall_sensor":{pins:["VCC","GND","OUT"]},
 "triac":{pins:["MT1","MT2","G"]},
 "scr":{pins:["A","K","G"]},
 "igbt":{pins:["G","C","E"]}
};
function pinLookup(name){
 var n=String(name||"").toLowerCase().replace(/\s+/g,"_");
 return {version:"6.47",part:n,pins:pinDB[n]?pinDB[n].pins:[],known:!!pinDB[n]};
}

/* v6.48 — topology intelligence */
function buildTopology(request, components){
 var nodes=[], edges=[], issues=[];
 (components||[]).forEach(function(c,i){
   var ref=c.ref||("X"+(i+1));
   var pins=(c.pins||((window.NilSparkLabSymbolLibrary&&
     window.NilSparkLabSymbolLibrary.get(c.type)||{}).terminals)||["1","2"]);
   nodes.push({ref:ref,type:c.type,pins:pins});
 });
 for(var i=0;i<nodes.length-1;i++){
   edges.push({from:nodes[i].ref+".1",to:nodes[i+1].ref+".1",reason:"sequence"});
 }
 if(nodes.length<2) issues.push("At least two components are required to infer a connection.");
 return {version:"6.48",nodes:nodes,edges:edges,issues:issues,confidence:issues.length?"low":"inferred"};
}

/* v6.49 — circuit pattern/template registry */
var templates=[
 ["led","LED indicator circuit"],["voltage divider","Voltage divider"],
 ["full wave","Full-wave bridge rectifier"],["half wave","Half-wave rectifier"],
 ["wheatstone","Wheatstone bridge"],["555","555 timer"],
 ["common emitter","Common-emitter amplifier"],["zener","Zener regulator"],
 ["buck","Buck converter"],["boost","Boost converter"],["h bridge","H-bridge motor driver"],
 ["relay motor","Relay motor control"],["mosfet motor","MOSFET motor control"],
 ["rc low pass","RC low-pass filter"],["rc high pass","RC high-pass filter"],
 ["rlc","Series RLC circuit"],["star delta","Star-delta starter"]
];
function templateSearch(q){
 var n=String(q||"").toLowerCase(), hits=[];
 templates.forEach(function(t){if(n.indexOf(t[0])>=0)hits.push({key:t[0],name:t[1]});});
 return {version:"6.49",matches:hits};
}

/* v6.50 — basic electrical calculation engine */
function detectCalculationInputs(c){
 var values=(c&&c.values)||[], nums=[];
 values.forEach(function(v){
   var m=String(v).match(/([0-9.]+)\s*(v|a|ma|mv|ohm|kohm|hz|khz|uf|nf|pf|mh)/i);
   if(m) nums.push({value:parseFloat(m[1]),unit:m[2].toLowerCase()});
 });
 return {version:"6.50",inputs:nums,
   rules:["Show formula before substitution.","Preserve units.","Do not invent missing values."],
   status:nums.length?"inputs-detected":"needs-values"};
}

/* v6.51 — automatic correction/safety suggestions */
function correct(c,verification){
 var suggestions=[];
 var types=(c&&c.components||[]).map(function(x){return x.type;});
 function has(t){return types.indexOf(t)>=0;}
 if(has("led")&&!has("resistor"))suggestions.push("Add an appropriate LED current-limiting resistor.");
 if((has("motor")||has("relay"))&&has("mosfet_n")&&!has("diode"))
   suggestions.push("Consider a flyback diode for the inductive load.");
 if(has("transformer")&&has("battery")&&!has("ac_source"))
   suggestions.push("Review the source: a transformer requires an appropriate AC excitation model.");
 if(!has("ground"))suggestions.push("Add/identify the intended reference or return node.");
 return {version:"6.51",suggestions:suggestions,
   corrected:false,reason:"Suggestions are generated; no automatic physical change is claimed."};
}

/* v9.11 — final universal circuit pipeline */
function generate(request){
 var base=(window.NilSparkLabUniversalCircuitV640&&
   typeof window.NilSparkLabUniversalCircuitV640.generate==="function")
   ? window.NilSparkLabUniversalCircuitV640.generate(request)
   : {components:[],warnings:[],validation:{status:"needs-review"}};

 var comps=(base.terminalTopology&&base.terminalTopology.components)||
           base.components||[];
 var topo=buildTopology(request,comps);
 var tmpl=templateSearch(request);
 var calc=detectCalculationInputs(base);
 var corr=correct(base,base.verification||{});
 var clarify=(window.NilSparkLabUniversalAccuracy&&
   typeof window.NilSparkLabUniversalAccuracy.clarify==="function")
   ? window.NilSparkLabUniversalAccuracy.clarify(request,base)
   : {needsClarification:false,questions:[]};

 return {
   version:"9.11",request:request,intent:base.intent||"generic circuit",
   components:comps,topology:topo,templates:tmpl,calculation:calc,
   corrections:corr,clarification:clarify,
   verification:base.verification||{status:"needs-review"},
   schematic:base.schematic||base.layout||null,
   builder:base.builder||null
 };
}
window.NilSparkLabUniversalV652={
 version:"9.11",pinLookup:pinLookup,buildTopology:buildTopology,
 templateSearch:templateSearch,calculate:calculate,correct:correct,generate:generate
};
})();
