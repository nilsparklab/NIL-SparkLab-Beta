
(function(){
"use strict";

/* v8.41 — requirement-to-topology synthesis */
function synthesizeFromRequirement(request,spec){
  var q=String(request||"").toLowerCase(), s=spec||{}, topology="unknown", confidence=0;
  if(/buck|step.?down|dc.?dc.*down/.test(q)){topology="buck";confidence=0.9;}
  else if(/boost|step.?up|dc.?dc.*up/.test(q)){topology="boost";confidence=0.9;}
  else if(/rectifier|ac.*dc|bridge/.test(q)){topology="bridge_rectifier";confidence=0.85;}
  else if(/led.*indicator|indicator.*led/.test(q)){topology="led_indicator";confidence=0.9;}
  else if(/voltage divider|divide.*voltage/.test(q)){topology="voltage_divider";confidence=0.95;}
  else if(/low.?pass|rc filter/.test(q)){topology="rc_low_pass";confidence=0.9;}
  else if(/motor.*direction|h.?bridge/.test(q)){topology="h_bridge";confidence=0.85;}
  else if(/555|timer|oscillator/.test(q)){topology="555_timer";confidence=0.85;}
  return {version:"8.41",status:topology==="unknown"?"NEEDS_CLARIFICATION":"TOPOLOGY_SELECTED",
          topology:topology,confidence:confidence,requirements:s};
}

/* v8.42 — component synthesis from topology */
function synthesizeComponents(topology,spec){
  spec=spec||{};
  var V=Number(spec.voltage),I=Number(spec.current),parts=[];
  function add(ref,type,value){parts.push({ref:ref,type:type,value:value||null,source:"synthesized"});}
  if(topology==="led_indicator"){
    add("R1","resistor",V>2&&I>0?((V-2)/I):null); add("D1","led",null);
  } else if(topology==="voltage_divider"){
    add("R1","resistor",10000); add("R2","resistor",10000);
  } else if(topology==="rc_low_pass"){
    add("R1","resistor",10000); add("C1","capacitor",1e-6);
  } else if(topology==="buck"){
    add("Q1","mosfet_n",null); add("L1","inductor",null);
    add("D1","diode",null); add("C1","capacitor",null);
  } else if(topology==="boost"){
    add("L1","inductor",null); add("Q1","mosfet_n",null);
    add("D1","diode",null); add("C1","capacitor",null);
  } else if(topology==="bridge_rectifier"){
    ["D1","D2","D3","D4"].forEach(function(r){add(r,"diode",null);});
    add("C1","capacitor",null);
  } else if(topology==="h_bridge"){
    ["Q1","Q2","Q3","Q4"].forEach(function(r){add(r,"mosfet_n",null);});
    add("M1","motor",null);
  } else if(topology==="555_timer"){
    add("U1","555_timer",null); add("R1","resistor",10000); add("C1","capacitor",1e-6);
  }
  return {version:"8.42",status:parts.length?"COMPONENTS_SYNTHESIZED":"NEEDS_TOPOLOGY",
          components:parts};
}

/* v8.43 — value refinement */
function refineValues(topology,spec,components){
  var s=spec||{}, f=Number(s.frequency),V=Number(s.voltage),I=Number(s.current);
  var out=(components||[]).map(function(x){return Object.assign({},x);});
  if(topology==="rc_low_pass" && f>0){
    var R=10000, C=1/(2*Math.PI*f*R);
    out.forEach(function(x){if(x.ref==="C1")x.value=C;});
  }
  if(topology==="led_indicator" && V>2&&I>0){
    out.forEach(function(x){if(x.ref==="R1")x.value=(V-2)/I;});
  }
  return {version:"8.43",status:"VALUES_REFINED",components:out};
}

/* v8.44 — synthesized netlist */
function synthesizeNets(topology,components){
  var nets=[],has=function(r){return (components||[]).some(function(x){return x.ref===r;});};
  function n(a,b){if(has(a)&&has(b))nets.push({from:a,to:b});}
  if(topology==="led_indicator"){n("R1","D1");}
  if(topology==="voltage_divider"){n("R1","R2");}
  if(topology==="rc_low_pass"){n("R1","C1");}
  if(topology==="buck"){n("Q1","L1");n("L1","D1");n("L1","C1");}
  if(topology==="boost"){n("L1","Q1");n("Q1","D1");n("D1","C1");}
  if(topology==="bridge_rectifier"){n("D1","D2");n("D2","D3");n("D3","D4");n("D4","C1");}
  if(topology==="h_bridge"){n("Q1","M1");n("Q2","M1");n("Q3","M1");n("Q4","M1");}
  if(topology==="555_timer"){n("U1","R1");n("R1","C1");}
  return {version:"8.44",status:nets.length?"NETS_SYNTHESIZED":"NEEDS_TOPOLOGY",nets:nets};
}

/* v8.45 — circuit-level safety gate */
function synthesisSafety(spec,components){
  var warnings=[],s=spec||{};
  if(Number(s.voltage)>60)warnings.push("Voltage above 60 V: enhanced isolation and protection review required.");
  if(Number(s.current)>10)warnings.push("Current above 10 A: conductor, thermal and protection review required.");
  (components||[]).forEach(function(x){
    if(/mosfet|motor|transformer|relay/i.test(x.type||""))
      warnings.push((x.ref||x.type)+": verify device ratings before build/simulation.");
  });
  return {version:"8.45",status:warnings.length?"REVIEW_REQUIRED":"SAFETY_GATE_CLEAR",warnings:warnings};
}

/* v8.46 — simulator execution adapter */
function runSimulator(model){
  if(window.NilSparkLabSimulation && typeof window.NilSparkLabSimulation.run==="function"){
    try{
      return {version:"8.46",status:"EXECUTED",
        result:window.NilSparkLabSimulation.run(model)};
    }catch(e){
      return {version:"8.46",status:"SIMULATION_ERROR",error:String(e.message||e)};
    }
  }
  return {version:"8.46",status:"NOT_CONNECTED",
          result:null,claim:"No simulation result is claimed."};
}

/* v8.47 — result-driven verification */
function verifySimulation(sim){
  if(!sim||sim.status==="NOT_CONNECTED")
    return {version:"8.47",status:"UNVERIFIED",reason:"Simulator not connected."};
  if(sim.status==="SIMULATION_ERROR")
    return {version:"8.47",status:"FAILED",reason:sim.error||"Simulation error."};
  return {version:"8.47",status:"RESULT_AVAILABLE",
          checks:["operating point","node voltages","branch currents","power limits"]};
}

/* v8.48 — correction/regeneration */
function regenerate(verification,safety){
  var fixes=[];
  if(verification.status==="FAILED")fixes.push("Regenerate netlist after resolving simulator error.");
  if(verification.status==="UNVERIFIED")fixes.push("Connect simulator before claiming verified operation.");
  if(safety.status==="REVIEW_REQUIRED")fixes.push("Resolve safety/rating warnings before build.");
  return {version:"8.48",status:fixes.length?"ACTION_REQUIRED":"READY",
          fixes:fixes,maxIterations:3,autoApply:false};
}

/* v8.49 — exact diagram/builder package */
function integrationPackage(c){
  return {version:"8.49",
    circuitModel:{components:c.components||[],nets:c.nets||[]},
    schematic:{ready:true},
    builder:{ready:true,bridgeConnected:!!window.NilSparkLabBuilderBridge},
    simulator:{ready:!!window.NilSparkLabSimulation},
    singleSourceOfTruth:true};
}

/* v9.11 — end-to-end circuit generator */
function generate(request,spec){
  spec=spec||{};
  var synthesis=synthesizeFromRequirement(request,spec);
  var parts=synthesizeComponents(synthesis.topology,spec);
  var refined=refineValues(synthesis.topology,spec,parts.components);
  var nets=synthesizeNets(synthesis.topology,refined.components);
  var c={components:refined.components,nets:nets.nets};
  var safety=synthesisSafety(spec,c.components);
  var sim=runSimulator(c);
  var verification=verifySimulation(sim);
  var correction=regenerate(verification,safety);
  var integration=integrationPackage(c);
  return {version:"9.11",request:request,synthesis:synthesis,
    components:refined,netlist:nets,safety:safety,
    simulation:sim,verification:verification,correction:correction,
    integration:integration,status:verification.status};
}
window.NilSparkLabSecureV850={
 version:"9.11",synthesizeFromRequirement:synthesizeFromRequirement,
 synthesizeComponents:synthesizeComponents,refineValues:refineValues,
 synthesizeNets:synthesizeNets,synthesisSafety:synthesisSafety,
 runSimulator:runSimulator,verifySimulation:verifySimulation,
 regenerate:regenerate,integrationPackage:integrationPackage,generate:generate
};
})();
