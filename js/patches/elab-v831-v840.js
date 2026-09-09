
(function(){
"use strict";

/* v8.31 — nodal-analysis foundation */
function nodalAnalysis(spec){
  spec=spec||{};
  var nodes=Array.isArray(spec.nodes)?spec.nodes:[], equations=[];
  nodes.forEach(function(n){
    equations.push({node:n.id||n.name||("N"+(equations.length+1)),
      rule:"ΣI=0",status:"EQUATION_REQUIRED"});
  });
  return {version:"8.31",status:equations.length?"NODAL_MODEL_READY":"NEEDS_NODES",
          equations:equations};
}

/* v8.32 — mesh/KVL foundation */
function meshAnalysis(spec){
  spec=spec||{};
  var meshes=Array.isArray(spec.meshes)?spec.meshes:[], equations=[];
  meshes.forEach(function(m){
    equations.push({mesh:m.id||("M"+(equations.length+1)),
      rule:"ΣV=0",status:"EQUATION_REQUIRED"});
  });
  return {version:"8.32",status:equations.length?"MESH_MODEL_READY":"NEEDS_MESHES",
          equations:equations};
}

/* v8.33 — series/parallel reduction */
function reduceNetwork(spec){
  spec=spec||{};
  var series=Array.isArray(spec.series)?spec.series:[],
      parallel=Array.isArray(spec.parallel)?spec.parallel:[],out=[];
  if(series.length)out.push({type:"series",count:series.length,
    rule:"Rtotal=R1+R2+..."});
  if(parallel.length)out.push({type:"parallel",count:parallel.length,
    rule:"1/Rtotal=Σ(1/Ri)"});
  return {version:"8.33",status:out.length?"REDUCTION_RULES_READY":"NO_REDUCIBLE_GROUPS",
          reductions:out};
}

/* v8.34 — nonlinear device rule registry */
var NONLINEAR_RULES={
 diode:{rule:"piecewise/forward-drop model",checks:["polarity","current","reverse voltage"]},
 zener:{rule:"breakdown-region model",checks:["zener voltage","power","current"]},
 led:{rule:"forward-drop/current model",checks:["forward current","forward voltage"]},
 bjt_npn:{rule:"operating-region model",checks:["VCE","IC","base drive"]},
 mosfet_n:{rule:"operating-region model",checks:["VDS","ID","gate drive","RDS_ON"]}
};
function nonlinearCheck(c){
  var found=[];
  (c&&c.components||[]).forEach(function(x){
    var d=NONLINEAR_RULES[String(x.type||"").toLowerCase()];
    if(d)found.push({ref:x.ref||x.type,model:d});
  });
  return {version:"8.34",status:found.length?"NONLINEAR_MODELS_FOUND":"NO_NONLINEAR_PARTS",
          models:found};
}

/* v8.35 — transient RC/RL/RLC framework */
function transientAnalysis(spec){
  spec=spec||{};
  var R=Number(spec.resistance),C=Number(spec.capacitance),L=Number(spec.inductance),out=[];
  if(R>0&&C>0)out.push({type:"RC",tau:R*C,unit:"s",formula:"τ=RC"});
  if(R>0&&L>0)out.push({type:"RL",tau:L/R,unit:"s",formula:"τ=L/R"});
  if(L>0&&C>0)out.push({type:"LC",omega0:1/Math.sqrt(L*C),unit:"rad/s",formula:"ω0=1/√LC"});
  return {version:"8.35",status:out.length?"TRANSIENT_MODEL_READY":"NEEDS_VALUES",models:out};
}

/* v8.36 — power electronics operating checks */
function powerCheck(spec,c){
  spec=spec||{}; c=c||{};
  var warnings=[],V=Number(spec.voltage),I=Number(spec.current);
  if(V>0&&I>0){
    var P=V*I;
    if(P>100)warnings.push("High-power operating point requires thermal/protection verification.");
  }
  (c.components||[]).forEach(function(x){
    if(/mosfet|igbt|diode|transformer|motor/i.test(x.type||""))
      warnings.push((x.ref||x.type)+": verify switching, voltage, current and thermal margins.");
  });
  return {version:"8.36",status:warnings.length?"REVIEW_REQUIRED":"BASIC_CHECKS_CLEAR",
          warnings:warnings};
}

/* v8.37 — thermal/loss framework */
function thermalAnalysis(spec,c){
  spec=spec||{}; c=c||{};
  var out=[],I=Number(spec.current),R=Number(spec.resistance);
  if(I>0&&R>0)out.push({type:"resistive_loss",power:I*I*R,unit:"W",formula:"P=I²R"});
  (c.components||[]).forEach(function(x){
    if(x.lossWatts!=null)out.push({ref:x.ref||x.type,power:Number(x.lossWatts),unit:"W"});
  });
  return {version:"8.37",status:out.length?"LOSS_MODEL_READY":"NEEDS_LOSS_DATA",losses:out};
}

/* v8.38 — simulation vs analytical comparison */
function compareResults(analytical,simulated,tolerance){
  if(simulated==null)return {version:"8.38",status:"NO_SIMULATION_RESULT"};
  var a=Number(analytical),s=Number(simulated),t=Number(tolerance||5);
  var err=a?Math.abs((s-a)/a)*100:Math.abs(s-a);
  return {version:"8.38",status:err<=t?"MATCH":"MISMATCH",
          errorPercent:err,tolerancePercent:t};
}

/* v8.39 — correction + re-verification */
function reverifyLoop(report){
  var issues=report&&report.issues||[],fixes=[];
  issues.forEach(function(x){
    if(/topology/i.test(x))fixes.push("Regenerate exact terminal topology.");
    else if(/thermal|power/i.test(x))fixes.push("Recalculate ratings and thermal margin.");
    else if(/simulation/i.test(x))fixes.push("Regenerate netlist and rerun simulation.");
    else fixes.push("Review affected circuit rule and regenerate.");
  });
  return {version:"8.39",status:fixes.length?"REVERIFY_REQUIRED":"PASS",
          fixes:fixes,maxIterations:3,autoExecution:false};
}

/* v9.11 — real electrical verification orchestrator */
function generate(request,spec,components,nets){
  spec=spec||{};
  var c={components:components||[],nets:nets||[]};
  var nodal=nodalAnalysis(spec),mesh=meshAnalysis(spec),
      reduction=reduceNetwork(spec),nonlinear=nonlinearCheck(c),
      transient=transientAnalysis(spec),power=powerCheck(spec,c),
      thermal=thermalAnalysis(spec,c);
  var issues=[];
  if(!c.nets.length)issues.push("Topology/netlist is not populated.");
  if(power.status==="REVIEW_REQUIRED")issues.push("Power operating point requires review.");
  if(thermal.status==="NEEDS_LOSS_DATA")issues.push("Thermal loss data is incomplete.");
  var reverify=reverifyLoop({issues:issues});
  return {version:"9.11",request:request,nodal:nodal,mesh:mesh,
    reduction:reduction,nonlinear:nonlinear,transient:transient,
    power:power,thermal:thermal,reverification:reverify,
    status:issues.length?"REVIEW_REQUIRED":"VERIFICATION_FRAMEWORK_PASS"};
}
window.NilSparkLabSecureV840={
  version:"9.11",nodalAnalysis:nodalAnalysis,meshAnalysis:meshAnalysis,
  reduceNetwork:reduceNetwork,nonlinearCheck:nonlinearCheck,
  transientAnalysis:transientAnalysis,powerCheck:powerCheck,
  thermalAnalysis:thermalAnalysis,compareResults:compareResults,
  reverifyLoop:reverifyLoop,generate:generate
};
})();
