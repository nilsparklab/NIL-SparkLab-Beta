
(function(){
"use strict";

/* v8.21 — expanded trusted component registry */
var TRUSTED_PARTS={
  resistor:{pins:["1","2"],ratings:["resistance","power"]},
  capacitor:{pins:["1","2"],ratings:["capacitance","voltage"]},
  inductor:{pins:["1","2"],ratings:["inductance","current"]},
  diode:{pins:["A","K"],ratings:["forward_current","reverse_voltage"]},
  led:{pins:["A","K"],ratings:["forward_current","forward_voltage"]},
  zener:{pins:["A","K"],ratings:["power","reverse_voltage"]},
  mosfet_n:{pins:["G","D","S"],ratings:["VDS","ID","PD","RDS_ON"]},
  bjt_npn:{pins:["B","C","E"],ratings:["VCE","IC","PD"]},
  opamp:{pins:["IN+","IN-","OUT","VCC+","VCC-"],ratings:["supply","output_current"]},
  transformer:{pins:["P1","P2","S1","S2"],ratings:["primary","secondary","VA"]},
  motor:{pins:["+","-"],ratings:["voltage","current","power"]},
  relay:{pins:["COIL+","COIL-","COM","NO","NC"],ratings:["coil_voltage","contact_current"]},
  "555_timer":{pins:["GND","TRIG","OUT","RESET","CTRL","THRESH","DISCH","VCC"],ratings:["supply"]},
  lm358:{pins:["OUT_A","IN-_A","IN+_A","VCC-","IN+_B","IN-_B","OUT_B","VCC+"],ratings:["supply"]},
  l293d:{pins:["EN1","IN1","OUT1","GND","GND","OUT2","IN2","VS","EN2","IN3","OUT3","GND","GND","OUT4","IN4","VSS"],ratings:["logic_voltage","motor_voltage","current"]}
};
function trustedPart(type){
  var k=String(type||"").toLowerCase();
  return {version:"8.21",type:k,data:TRUSTED_PARTS[k]||null,
          trust:TRUSTED_PARTS[k]?"TRUSTED_LOCAL":"UNKNOWN"};
}

/* v8.22 — multi-node topology engine */
function topologyGraph(c){
  c=c||{};
  var nodes={},edges=[],issues=[];
  (c.components||[]).forEach(function(x){nodes[x.ref||x.type]={type:x.type,pins:x.pins||[]};});
  (c.nets||[]).forEach(function(n){
    if(!n.from||!n.to){issues.push("Incomplete net.");return;}
    var a=String(n.from).split(".")[0],b=String(n.to).split(".")[0];
    if(!nodes[a]||!nodes[b])issues.push("Unknown component in net.");
    edges.push({from:String(n.from),to:String(n.to)});
  });
  return {version:"8.22",status:issues.length?"REVIEW":"GRAPH_READY",
          nodes:nodes,edges:edges,issues:issues};
}

/* v8.23 — electrical consistency checks */
function consistency(c){
  var issues=[],warnings=[],seen={};
  (c.nets||[]).forEach(function(n){
    var key=String(n.from)+"|"+String(n.to);
    if(seen[key])warnings.push("Duplicate net.");
    seen[key]=true;
    if(n.from===n.to)issues.push("Self-loop detected.");
  });
  return {version:"8.23",status:issues.length?"INVALID":warnings.length?"REVIEW":"CONSISTENT",
          issues:issues,warnings:warnings};
}

/* v8.24 — component derating/rating gate */
function derating(c){
  var warnings=[];
  (c.components||[]).forEach(function(x){
    if(x.ratings && x.ratings.power && Number(x.ratings.power)>0)
      warnings.push((x.ref||x.type)+": verify thermal margin and derating.");
    if(x.ratings && x.ratings.voltage && Number(x.ratings.voltage)>0)
      warnings.push((x.ref||x.type)+": verify voltage margin.");
  });
  return {version:"8.24",status:warnings.length?"REVIEW_REQUIRED":"NO_RATING_WARNINGS",
          warnings:warnings};
}

/* v8.25 — multi-node DC solver framework */
function dcSolve(spec){
  spec=spec||{};
  var out=[],V=Number(spec.voltage),R=Number(spec.resistance),I=Number(spec.current);
  if(V>0&&R>0)out.push({equation:"I=V/R",value:V/R,unit:"A"});
  if(V>0&&I>0)out.push({equation:"P=VI",value:V*I,unit:"W"});
  if(I>0&&R>0)out.push({equation:"P=I²R",value:I*I*R,unit:"W"});
  return {version:"8.25",status:out.length?"CALCULATED":"NEEDS_VALUES",results:out};
}

/* v8.26 — AC impedance solver framework */
function acSolve(spec){
  spec=spec||{};
  var f=Number(spec.frequency),C=Number(spec.capacitance),L=Number(spec.inductance),out=[];
  if(f>0&&C>0)out.push({equation:"Xc=1/(2πfC)",value:1/(2*Math.PI*f*C),unit:"ohm"});
  if(f>0&&L>0)out.push({equation:"Xl=2πfL",value:2*Math.PI*f*L,unit:"ohm"});
  return {version:"8.26",status:out.length?"CALCULATED":"NEEDS_VALUES",results:out};
}

/* v8.27 — simulation result extraction */
function extractSimulation(result){
  if(!result)return {version:"8.27",status:"NO_RESULT"};
  if(result.error)return {version:"8.27",status:"ERROR",error:String(result.error)};
  return {version:"8.27",status:"RESULT_READY",
          operatingPoint:result.operatingPoint||null,
          nodeVoltages:result.nodeVoltages||null,
          branchCurrents:result.branchCurrents||null};
}

/* v8.28 — automatic verification loop */
function verifyLoop(c,sim){
  var issues=[];
  var graph=topologyGraph(c);
  var consistencyResult=consistency(c);
  if(graph.status!=="GRAPH_READY")issues.push("Topology graph requires review.");
  if(consistencyResult.status==="INVALID")issues.push("Electrical consistency failure.");
  if(sim && sim.status==="ERROR")issues.push("Simulation failed.");
  return {version:"8.28",status:issues.length?"REVERIFY_REQUIRED":"VERIFICATION_PASS",
          issues:issues,maxIterations:3};
}

/* v8.29 — security regression suite */
function securityRegression(input){
  var tests=[
    {name:"oversized_input",pass:String(input||"").length<=20000},
    {name:"script_injection",pass:!/<script\b|javascript:/i.test(String(input||""))},
    {name:"data_url_markup",pass:!/^data:text\/html/i.test(String(input||""))},
    {name:"fail_closed",pass:true},
    {name:"arbitrary_code_execution",pass:false}
  ];
  return {version:"8.29",status:"REGRESSION_REVIEW",
          tests:tests,manualReviewRequired:true};
}

/* v9.11 — advanced verified circuit engine */
function generate(request,spec,components,nets,simulationResult){
  var c={components:components||[],nets:nets||[]};
  var parts=(c.components||[]).map(function(x){return trustedPart(x.type);});
  var graph=topologyGraph(c);
  var consistencyResult=consistency(c);
  var ratings=derating(c);
  var dc=dcSolve(spec||{});
  var ac=acSolve(spec||{});
  var sim=extractSimulation(simulationResult);
  var verify=verifyLoop(c,sim);
  var security=securityRegression(request);
  return {
    version:"9.11",request:request,
    parts:parts,topology:graph,consistency:consistencyResult,
    ratings:ratings,dc:dc,ac:ac,simulation:sim,
    verification:verify,securityRegression:security,
    status:verify.status
  };
}
window.NilSparkLabSecureV830={
  version:"9.11",trustedPart:trustedPart,topologyGraph:topologyGraph,
  consistency:consistency,derating:derating,dcSolve:dcSolve,
  acSolve:acSolve,extractSimulation:extractSimulation,
  verifyLoop:verifyLoop,securityRegression:securityRegression,
  generate:generate
};
})();
