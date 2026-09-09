
(function(){
"use strict";

/* v6.41 — Real topology solver */
function solveTopology(c){
  if(!c||!c.components) return {status:"INVALID",issues:["No circuit data."]};
  var issues=[], nets=c.nets||[];
  var refs={};
  c.components.forEach(function(x){refs[x.ref||x.type]=x;});
  var degree={};
  nets.forEach(function(n){
    degree[n.from]=(degree[n.from]||0)+1;
    degree[n.to]=(degree[n.to]||0)+1;
  });
  c.components.forEach(function(x){
    var r=x.ref||x.type;
    if(!degree[r+".1"] && !degree[r+".+"] && !degree[r+".A"] && x.type!=="ground")
      issues.push("Possible unconnected terminal: "+r);
  });
  return {version:"6.41",status:issues.length?"NEEDS_REVIEW":"TOPOLOGY_OK",issues:issues,nets:nets};
}

/* v6.42 — Expanded real-world component metadata */
var parts={
  "555_timer":{family:"timer",pins:["GND","TRIG","OUT","RESET","CTRL","THRESH","DISCH","VCC"]},
  "lm358":{family:"opamp",pins:["1OUT","1-","1+","VCC-","2+","2-","2OUT","VCC+"]},
  "lm317":{family:"regulator",pins:["IN","OUT","ADJ"]},
  "7805":{family:"regulator",pins:["IN","GND","OUT"]},
  "ir_led":{family:"opto",pins:["A","K"]},
  "photodiode":{family:"sensor",pins:["A","K"]},
  "ldr":{family:"sensor",pins:["1","2"]},
  "ntc":{family:"sensor",pins:["1","2"]},
  "hall_sensor":{family:"sensor",pins:["VCC","GND","OUT"]},
  "triac":{family:"power","pins":["MT1","MT2","G"]},
  "scr":{family:"power","pins":["A","K","G"]},
  "igbt":{family:"power","pins":["G","C","E"]}
};
function partLookup(q){
  var n=String(q||"").toLowerCase(), found=[];
  Object.keys(parts).forEach(function(k){
    if(n.indexOf(k.replace(/_/g," "))>=0 || n.indexOf(k)>=0) found.push({id:k,meta:parts[k]});
  });
  return {version:"6.42",matches:found};
}

/* v6.43 — Ambiguity / clarification engine */
function clarify(request,compiled){
  var q=String(request||"").toLowerCase(), questions=[];
  if(!compiled || !compiled.components || compiled.components.length<2)
    questions.push("Which source and load should be used?");
  if(q.indexOf("motor")>=0 && q.indexOf("voltage")<0)
    questions.push("What motor supply voltage should be used?");
  if((q.indexOf("transformer")>=0) && q.indexOf("step")<0 && q.indexOf("turn")<0)
    questions.push("Do you want step-up, step-down, or isolation transformer configuration?");
  if(q.indexOf("amplifier")>=0 && q.indexOf("gain")<0)
    questions.push("What gain or amplifier configuration do you want?");
  return {version:"6.43",needsClarification:questions.length>0,questions:questions};
}

/* v6.44 — schematic quality/routing */
function routeSchematic(layout){
  if(!layout||!layout.items) return {status:"INVALID"};
  var items=layout.items.map(function(x){return {
    ref:x.ref,type:x.type,x:x.x,y:x.y,
    orientation:x.orientation||"horizontal",
    label:x.label||x.ref,
    junctions:[],
    wireStyle:"orthogonal"
  };});
  return {version:"6.44",status:"ROUTED",routing:"orthogonal",items:items,nets:layout.nets||[]};
}

/* v6.45 — simulation validation adapter */
function simulationCheck(c){
  if(!c) return {status:"NO_CIRCUIT"};
  if(window.NilSparkLabSimulation && typeof window.NilSparkLabSimulation.validate==="function"){
    try{return window.NilSparkLabSimulation.validate(c);}
    catch(e){return {status:"SIMULATION_ERROR",message:String(e.message||e)};}
  }
  return {version:"6.45",status:"SIMULATION_NOT_CONNECTED",
    message:"Simulation adapter is not exposed by the current page; do not claim simulation verification."};
}

/* v9.11 — purpose-driven universal circuit mode */
function universalMode(request){
  var q=String(request||"").toLowerCase(), options=[];
  if(q.indexOf("motor")>=0){
    options.push({name:"Direct switch",use:"simple on/off"});
    options.push({name:"MOSFET driver",use:"electronic switching"});
    options.push({name:"Relay driver",use:"isolated/control switching"});
  }
  if(q.indexOf("voltage")>=0 && q.indexOf("regulator")>=0){
    options.push({name:"Linear regulator",use:"simple regulated DC"});
    options.push({name:"Buck converter",use:"efficient step-down"});
  }
  if(q.indexOf("led")>=0){
    options.push({name:"Resistor-limited LED",use:"simple indicator"});
    options.push({name:"Transistor/MOSFET driver",use:"higher-current control"});
  }
  return {version:"9.11",purpose:request,options:options,
    mode:options.length?"purpose-options":"generic-circuit"};
}

window.NilSparkLabUniversalAccuracy={
  version:"9.11",
  solveTopology:solveTopology,
  partLookup:partLookup,
  clarify:clarify,
  routeSchematic:routeSchematic,
  simulationCheck:simulationCheck,
  universalMode:universalMode
};
})();
