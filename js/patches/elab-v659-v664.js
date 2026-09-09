
(function(){
"use strict";

/* v6.59 — True terminal topology */
function solve(c){
  if(!c||!c.components) return {status:"INVALID",issues:["No circuit data."]};
  var issues=[], nets=c.nets||[], terminalMap={};
  (c.components||[]).forEach(function(x){
    var ref=x.ref||x.type, pins=x.pins||[];
    terminalMap[ref]={type:x.type,pins:pins};
  });
  nets.forEach(function(n){
    if(!n.from||!n.to) issues.push("Incomplete terminal connection.");
  });
  return {version:"6.59",status:issues.length?"NEEDS_REVIEW":"TOPOLOGY_READY",
          terminalMap:terminalMap,nets:nets,issues:issues};
}

/* v6.60 — expanded real-part database */
var parts={
  regulators:["lm317","7805","7812","7912","tl431","lm2596"],
  opamps:["lm358","lm324","ua741","tl081"],
  timers:["555_timer"],
  drivers:["l293d","l298","tb6612","uln2003"],
  logic:["74hc00","74hc02","74hc04","74hc08","74hc32","74hc86"],
  interfaces:["max232","max485","rs485_transceiver"],
  sensors:["ldr","ntc","pt100","thermistor","hall_sensor","ir_sensor","ultrasonic_sensor"],
  power:["igbt","scr","triac","bridge_rectifier","buck","boost","inverter"],
  protection:["fuse","mcb","rcd","surge_protector","tvss"],
  machines:["dc_motor","induction_motor","synchronous_motor","generator"]
};
function searchParts(q){
  var n=String(q||"").toLowerCase(), hits=[];
  Object.keys(parts).forEach(function(g){
    parts[g].forEach(function(p){
      if(n.indexOf(p.replace(/_/g," "))>=0 || n.indexOf(p)>=0)
        hits.push({group:g,part:p});
    });
  });
  return {version:"6.60",matches:hits};
}

/* v6.61 — intelligent circuit-family search */
var families=[
  ["led","LED indicator"],["rectifier","Rectifier"],["wheatstone","Wheatstone bridge"],
  ["555","555 timer"],["low pass","RC low-pass filter"],["high pass","RC high-pass filter"],
  ["rlc","Series RLC"],["zener","Zener regulator"],["buck","Buck converter"],
  ["boost","Boost converter"],["h bridge","H-bridge"],["motor","Motor control"],
  ["relay","Relay control"],["common emitter","Common-emitter amplifier"],
  ["voltage divider","Voltage divider"],["star delta","Star-delta starter"]
];
function findFamily(q){
  var n=String(q||"").toLowerCase(), matches=[];
  families.forEach(function(f){if(n.indexOf(f[0])>=0)matches.push({key:f[0],name:f[1]});});
  return {version:"6.61",matches:matches,confidence:matches.length?"KNOWN":"BEST_EFFORT"};
}

/* v6.62 — multi-circuit alternatives */
function alternatives(q){
  var n=String(q||"").toLowerCase(), opts=[];
  if(n.indexOf("motor")>=0){
    opts.push({name:"Direct switch",benefit:"simple on/off"});
    opts.push({name:"MOSFET driver",benefit:"electronic switching"});
    opts.push({name:"Relay driver",benefit:"isolated switching"});
  }
  if(n.indexOf("regulator")>=0||n.indexOf("voltage")>=0){
    opts.push({name:"Linear regulator",benefit:"simple regulated output"});
    opts.push({name:"Buck converter",benefit:"higher efficiency step-down"});
  }
  if(n.indexOf("led")>=0){
    opts.push({name:"Resistor-limited LED",benefit:"simple indicator"});
    opts.push({name:"Transistor/MOSFET driver",benefit:"higher-current control"});
  }
  return {version:"6.62",options:opts};
}

/* v6.63 — design optimization */
function optimize(options,criteria){
  criteria=criteria||"balanced";
  if(!options||!options.length)return {version:"6.63",selected:null,reason:"No alternatives."};
  var priority={simple:0,efficiency:1,safety:2,cost:3,balanced:4};
  var selected=options[0];
  if(criteria==="efficiency"){
    selected=options.find(function(x){return /buck|mosfet|driver/i.test(x.name);})||options[0];
  }else if(criteria==="simple"){
    selected=options[0];
  }else if(criteria==="safety"){
    selected=options.find(function(x){return /relay|isolated/i.test(x.name);})||options[0];
  }
  return {version:"6.63",criteria:criteria,selected:selected,alternatives:options};
}

/* v9.11 — final universal design pipeline */
function generate(request,criteria){
  var base=(window.NilSparkLabUniversalV658&&typeof window.NilSparkLabUniversalV658.generate==="function")
    ?window.NilSparkLabUniversalV658.generate(request)
    :{components:[],solved:{},verification:{status:"needs-review"}};
  var solved=solve({components:base.components||[],nets:(base.solved&&base.solved.nets)||[]});
  var catalog=searchParts(request);
  var family=findFamily(request);
  var opts=alternatives(request);
  var selected=optimize(opts,criteria||"balanced");
  return {
    version:"9.11",request:request,criteria:criteria||"balanced",
    family:family,catalog:catalog,topology:solved,
    alternatives:opts,optimization:selected,
    schematic:base.drawing||base.schematic||null,
    simulation:base.simulation||null,
    corrections:base.corrections||null,
    verification:base.verification||{status:"needs-review"}
  };
}
window.NilSparkLabUniversalV664={
  version:"9.11",solve:solve,searchParts:searchParts,findFamily:findFamily,
  alternatives:alternatives,optimize:optimize,generate:generate
};
})();
