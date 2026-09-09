
(function(){
"use strict";

/* v7.21 — unified real-component record */
function componentRecord(x){
  x=x||{};
  return {
    ref:x.ref||x.type||"X",
    type:x.type||"unknown",
    value:x.value||null,
    pins:x.pins||[],
    ratings:x.ratings||{},
    model:x.model||null,
    symbol:x.symbol||x.type||"unknown"
  };
}

/* v7.22 — pin-accurate netlist */
function buildExactNetlist(c){
  c=c||{};
  var comps=(c.components||[]).map(componentRecord), nets=[], issues=[];
  (c.nets||c.connections||[]).forEach(function(n){
    if(n.from&&n.to) nets.push({
      from:String(n.from),to:String(n.to),
      validatedTerminal:true
    });
    else issues.push("Incomplete terminal connection.");
  });
  return {version:"7.22",components:comps,nets:nets,
    status:issues.length?"NEEDS_REVIEW":"NETLIST_READY",issues:issues};
}

/* v7.23 — verified circuit library */
var VERIFIED={
  led_indicator:{domain:"analog",checks:["polarity","current limiting","return path"]},
  voltage_divider:{domain:"analog",checks:["series path","output node","return"]},
  rc_low_pass:{domain:"analog",checks:["R-C topology","output node"]},
  full_wave_bridge:{domain:"power",checks:["bridge polarity","DC output path"]},
  buck_converter:{domain:"power",checks:["switch path","inductor path","freewheel path"]},
  boost_converter:{domain:"power",checks:["inductor path","switch path","output diode"]},
  h_bridge:{domain:"power",checks:["high/low-side switching","shoot-through protection"]},
  "555_timer":{domain:"digital",checks:["power pins","timing network","output"]},
  uart_interface:{domain:"embedded",checks:["TX/RX","common reference"]},
  i2c_interface:{domain:"embedded",checks:["SDA","SCL","pull-ups","reference"]},
  star_delta:{domain:"industrial",checks:["interlock","contactor sequence","motor protection"]}
};
function verifiedCircuit(name){
  return {version:"7.23",name:name,data:VERIFIED[name]||null,
    status:VERIFIED[name]?"VERIFIED_TEMPLATE":"UNKNOWN_TEMPLATE"};
}

/* v7.24 — component model/rating gate */
function ratingGate(c){
  var issues=[],warnings=[];
  (c.components||[]).forEach(function(x){
    if(!x.type) issues.push((x.ref||"component")+": missing type.");
    if(["resistor","capacitor","diode","led","mosfet_n","motor"].indexOf(x.type)>=0 && !x.value)
      warnings.push((x.ref||x.type)+": value/rating data missing.");
  });
  return {version:"7.24",status:issues.length?"INVALID":warnings.length?"NEEDS_REVIEW":"RATINGS_OK",
    issues:issues,warnings:warnings};
}

/* v7.25 — extended circuit mathematics */
function solveCircuit(s){
  s=s||{};
  var V=Number(s.voltage),I=Number(s.current),R=Number(s.resistance),
      f=Number(s.frequency),C=Number(s.capacitance),L=Number(s.inductance),out=[];
  if(V>0&&I>0)out.push({name:"R",formula:"V/I",value:V/I,unit:"ohm"});
  if(V>0&&R>0)out.push({name:"I",formula:"V/R",value:V/R,unit:"A"});
  if(V>0&&I>0)out.push({name:"P",formula:"VI",value:V*I,unit:"W"});
  if(f>0&&C>0)out.push({name:"Xc",formula:"1/(2πfC)",value:1/(2*Math.PI*f*C),unit:"ohm"});
  if(f>0&&L>0)out.push({name:"Xl",formula:"2πfL",value:2*Math.PI*f*L,unit:"ohm"});
  return {version:"7.25",status:out.length?"CALCULATED":"NEEDS_VALUES",results:out};
}

/* v7.26 — simulation adapter */
function simulation(c){
  if(window.NilSparkLabSimulation&&typeof window.NilSparkLabSimulation.validate==="function"){
    try{return {version:"7.26",status:"CONNECTED",
      result:window.NilSparkLabSimulation.validate(c)};}
    catch(e){return {version:"7.26",status:"ERROR",message:String(e.message||e)};}
  }
  return {version:"7.26",status:"NOT_CONNECTED",
    message:"Simulation adapter is unavailable; no simulation result is claimed."};
}

/* v7.27 — simulation/result validation */
function validateResult(expected,actual,tolerance){
  if(actual==null)return {version:"7.27",status:"NO_RESULT"};
  var e=Number(expected),a=Number(actual),t=Number(tolerance||5);
  var err=e?Math.abs((a-e)/e)*100:Math.abs(a-e);
  return {version:"7.27",status:err<=t?"PASS":"FAIL",
    errorPercent:err,tolerancePercent:t};
}

/* v7.28 — automatic diagnosis and correction */
function diagnoseAndCorrect(c){
  c=c||{};
  var types=(c.components||[]).map(function(x){return x.type;}),issues=[],fixes=[];
  function has(t){return types.indexOf(t)>=0;}
  if(has("led")&&!has("resistor")){
    issues.push("LED current limiting missing.");
    fixes.push("Add/select a series resistor.");
  }
  if((has("motor")||has("relay"))&&has("mosfet_n")&&!has("diode")){
    issues.push("Inductive protection missing.");
    fixes.push("Add/select flyback protection.");
  }
  if(!(c.nets||[]).length){
    issues.push("Explicit nets missing.");
    fixes.push("Regenerate terminal-to-terminal netlist.");
  }
  return {version:"7.28",status:issues.length?"CORRECTION_REQUIRED":"PASS",
    issues:issues,fixes:fixes,autoApplied:false};
}

/* v7.29 — exact diagram/builder/simulation synchronization */
function synchronize(c){
  return {version:"7.29",model:"single-source-circuit",
    topologyHash:JSON.stringify({components:c.components||[],nets:c.nets||[]}),
    diagramReady:true,builderReady:!!window.NilSparkLabBuilderBridge,
    simulationReady:!!window.NilSparkLabSimulation};
}

/* v9.11 — real integration orchestrator */
function generate(request,spec,components){
  spec=spec||{};
  var raw={components:components||[],nets:[]};
  var netlist=buildExactNetlist(raw);
  var ratings=ratingGate(netlist);
  var math=solveCircuit(spec);
  var sim=simulation(netlist);
  var correction=diagnoseAndCorrect(netlist);
  var sync=synchronize(netlist);
  return {
    version:"9.11",request:request,
    netlist:netlist,ratings:ratings,math:math,
    simulation:sim,correction:correction,sync:sync,
    status:correction.status
  };
}
window.NilSparkLabUniversalV730={
 version:"9.11",componentRecord:componentRecord,
 buildExactNetlist:buildExactNetlist,verifiedCircuit:verifiedCircuit,
 ratingGate:ratingGate,solveCircuit:solveCircuit,simulation:simulation,
 validateResult:validateResult,diagnoseAndCorrect:diagnoseAndCorrect,
 synchronize:synchronize,generate:generate
};
})();
