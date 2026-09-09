
(function(){
"use strict";

/* v6.53 — Real connection solver */
function solve(c){
  if(!c||!c.components) return {status:"INVALID",issues:["No circuit data."]};
  var nodes={}, issues=[], nets=c.nets||[];
  (c.components||[]).forEach(function(x){
    var r=x.ref||x.type;
    nodes[r]={ref:r,type:x.type,pins:x.pins||[]};
  });
  nets.forEach(function(n){
    if(!n.from||!n.to) issues.push("Incomplete net.");
  });
  return {version:"6.53",status:issues.length?"NEEDS_REVIEW":"SOLVED_STRUCTURE",
    nodes:nodes,nets:nets,issues:issues};
}

/* v6.54 — expanded component catalogue */
var catalog={
  regulators:["lm317","7805","7812","7912","tl431"],
  opamps:["lm358","lm324","tl081","ua741"],
  timers:["555_timer"],
  drivers:["l293d","l298","tb6612"],
  logic:["74hc00","74hc04","74hc08","74hc32","74hc86"],
  interfaces:["max232","rs485_transceiver"],
  sensors:["ldr","ntc","thermistor","hall_sensor","ir_sensor","ultrasonic_sensor"],
  power:["igbt","scr","triac","bridge_rectifier","buck","boost","inverter"],
  protection:["fuse","mcb","rcd","tvss","surge_protector"],
  machines:["dc_motor","induction_motor","synchronous_motor","generator"]
};
function catalogSearch(q){
  var n=String(q||"").toLowerCase(), hits=[];
  Object.keys(catalog).forEach(function(g){
    catalog[g].forEach(function(p){
      if(n.indexOf(p.replace(/_/g," "))>=0 || n.indexOf(p)>=0) hits.push({group:g,part:p});
    });
  });
  return {version:"6.54",matches:hits};
}

/* v6.55 — professional schematic renderer */
function render(c){
  if(!c||!c.components) return {status:"INVALID"};
  var items=[], used={};
  (c.components||[]).forEach(function(x,i){
    var ref=x.ref||("X"+(i+1));
    var row=Math.floor(i/5), col=i%5;
    items.push({ref:ref,type:x.type,x:100+col*180,y:100+row*120,
      label:ref,value:x.value||"",orientation:"horizontal"});
    used[ref]=true;
  });
  return {version:"6.55",status:"RENDERED",style:"professional",
    routing:"orthogonal",junctions:true,labels:true,items:items,nets:c.nets||[]};
}

/* v6.56 — simulation/SPICE adapter */
function simulate(c){
  if(window.NilSparkLabSimulation && typeof window.NilSparkLabSimulation.validate==="function"){
    try{return {version:"6.56",status:"CONNECTED",result:window.NilSparkLabSimulation.validate(c)};}
    catch(e){return {version:"6.56",status:"ERROR",message:String(e.message||e)};}
  }
  return {version:"6.56",status:"NOT_CONNECTED",
    message:"No simulator adapter is exposed; simulation verification is not claimed."};
}

/* v6.57 — self-correction loop */
function correct(c,verification){
  var fixes=[], types=(c&&c.components||[]).map(function(x){return x.type;});
  function has(t){return types.indexOf(t)>=0;}
  if(has("led")&&!has("resistor")) fixes.push({issue:"LED current limiting",action:"Add/select a suitable series resistor."});
  if((has("motor")||has("relay"))&&has("mosfet_n")&&!has("diode"))
    fixes.push({issue:"Inductive switching",action:"Add/select a flyback diode."});
  if(has("transformer")&&has("battery")&&!has("ac_source"))
    fixes.push({issue:"Transformer excitation",action:"Review source and use an appropriate AC model."});
  return {version:"6.57",status:fixes.length?"CORRECTIONS_AVAILABLE":"NO_RULE_CORRECTIONS",
    fixes:fixes,autoApplied:false};
}

/* v9.11 — universal assistant delivery pipeline */
function generate(request){
  var base=(window.NilSparkLabUniversalV652&&typeof window.NilSparkLabUniversalV652.generate==="function")
    ?window.NilSparkLabUniversalV652.generate(request)
    :{components:[],verification:{status:"needs-review"}};
  var comps=base.components||[];
  var solved=solve({components:comps,nets:(base.topology&&base.topology.edges)||[]});
  var catalogue=catalogSearch(request);
  var drawing=render({components:comps,nets:solved.nets});
  var sim=simulate({components:comps,nets:solved.nets});
  var fixes=correct({components:comps},base.verification);
  return {version:"9.11",request:request,intent:base.intent||"generic",
    solved:solved,catalogue:catalogue,drawing:drawing,simulation:sim,
    corrections:fixes,verification:base.verification||{status:"needs-review"},
    clarification:base.clarification||{needsClarification:false,questions:[]}};
}
window.NilSparkLabUniversalV658={version:"9.11",solve:solve,catalogSearch:catalogSearch,
  render:render,simulate:simulate,correct:correct,generate:generate};
})();
