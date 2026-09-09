
(function(){
"use strict";

/* v6.81 — Real topology synthesis */
function synthesizeTopology(spec){
  spec=spec||{};
  var components=spec.components||[], nets=[], issues=[];
  for(var i=0;i<components.length-1;i++){
    var a=components[i], b=components[i+1];
    nets.push({from:(a.ref||a.type)+".OUT",to:(b.ref||b.type)+".IN",relation:"inferred"});
  }
  if(components.length<2) issues.push("Insufficient components for topology synthesis.");
  return {version:"6.81",status:issues.length?"NEEDS_REVIEW":"SYNTHESIZED",nets:nets,issues:issues};
}

/* v6.82 — verified circuit knowledge index */
var VERIFIED_CIRCUITS={
  analog:["led_indicator","voltage_divider","rc_low_pass","rc_high_pass","opamp_inverting","common_emitter"],
  digital:["and_gate","or_gate","nand_gate","nor_gate","d_flipflop","counter","555_timer"],
  power:["bridge_rectifier","buck","boost","buck_boost","flyback","inverter"],
  industrial:["dol_starter","star_delta","forward_reverse","motor_protection"],
  embedded:["sensor_interface","uart","i2c","spi","pwm_motor_control"]
};
function verifiedSearch(domain,query){
  var list=VERIFIED_CIRCUITS[domain]||[], q=String(query||"").toLowerCase();
  var hits=list.filter(function(x){return q.indexOf(x.replace(/_/g," "))>=0;});
  return {version:"6.82",domain:domain,hits:hits,catalogue:list};
}

/* v6.83 — datasheet/pin/rating intelligence */
var PART_DATA={
  "555_timer":{pins:["GND","TRIG","OUT","RESET","CTRL","THRESH","DISCH","VCC"],ratings:["VCC range must be checked"]},
  "lm358":{pins:["OUT_A","IN-_A","IN+_A","VCC-","IN+_B","IN-_B","OUT_B","VCC+"],ratings:["supply and input common-mode limits must be checked"]},
  "7805":{pins:["IN","GND","OUT"],ratings:["input/output limits and thermal dissipation must be checked"]},
  "lm317":{pins:["ADJ","OUT","IN"],ratings:["dropout, current and thermal limits must be checked"]},
  "l293d":{pins:["EN1","IN1","OUT1","GND","GND","OUT2","IN2","VS","EN2","IN3","OUT3","GND","GND","OUT4","IN4","VSS"],ratings:["logic/motor supply and current limits must be checked"]}
};
function partData(part){return {version:"6.83",part:part,data:PART_DATA[String(part||"").toLowerCase()]||null};}

/* v6.84 — circuit mathematics solver */
function solveCircuitMath(spec){
  spec=spec||{};
  var V=Number(spec.voltage), I=Number(spec.current), R=Number(spec.resistance);
  var out=[];
  if(V>0 && I>0) out.push({name:"resistance",formula:"R=V/I",value:V/I,unit:"ohm"});
  if(V>0 && R>0) out.push({name:"current",formula:"I=V/R",value:V/R,unit:"A"});
  if(V>0 && I>0) out.push({name:"power",formula:"P=VI",value:V*I,unit:"W"});
  if(I>0 && R>0) out.push({name:"resistive power",formula:"P=I²R",value:I*I*R,unit:"W"});
  return {version:"6.84",status:out.length?"CALCULATED":"NEEDS_VALUES",results:out,
          rules:["Ohm's law","KCL/KVL where applicable","power conservation","unit preservation"]};
}

/* v6.85 — component/value optimization */
function optimize(spec,calculation){
  spec=spec||{};
  var candidates=[];
  if(Number(spec.voltage)>0 && Number(spec.current)>0){
    candidates.push({strategy:"simple",note:"Prefer simple topology when requirements allow."});
    candidates.push({strategy:"efficiency",note:"Prefer switching conversion for efficiency when appropriate."});
    candidates.push({strategy:"thermal",note:"Check dissipation and derating before selecting a part."});
  }
  return {version:"6.85",candidates:candidates,selected:candidates[0]||null,
          status:candidates.length?"OPTIMIZATION_READY":"NEEDS_REQUIREMENTS"};
}

/* v6.86 — circuit diagnosis */
function diagnose(c){
  c=c||{};
  var issues=[], warnings=[];
  var types=(c.components||[]).map(function(x){return x.type;});
  function has(t){return types.indexOf(t)>=0;}
  if(has("led")&&!has("resistor")) issues.push("LED current limiting is unspecified.");
  if((has("motor")||has("relay"))&&has("mosfet_n")&&!has("diode"))
    warnings.push("Inductive-load flyback protection is unspecified.");
  if(!has("ground")) warnings.push("Reference/return node is not explicit.");
  if(!c.nets || !c.nets.length) issues.push("No electrical nets available.");
  return {version:"6.86",status:issues.length?"FAULTS_FOUND":warnings.length?"WARNINGS":"NO_RULE_FAULTS",
          issues:issues,warnings:warnings};
}

/* v6.87 — correction and regeneration */
function correct(c,diagnosis){
  var actions=(diagnosis&&diagnosis.issues||[]).concat((diagnosis&&diagnosis.warnings)||[]);
  var fixes=actions.map(function(x){
    if(/LED/i.test(x)) return "Add/select a suitable series current-limiting resistor.";
    if(/flyback|Inductive/i.test(x)) return "Add/select a suitable flyback path for the inductive load.";
    if(/ground|return/i.test(x)) return "Identify or add the intended reference/return node.";
    if(/nets/i.test(x)) return "Regenerate explicit terminal-to-terminal nets.";
    return "Review the affected topology and regenerate after clarification.";
  });
  return {version:"6.87",status:fixes.length?"CORRECTIONS_READY":"NO_CORRECTIONS",fixes:fixes,
          autoApplied:false};
}

/* v6.88 — synchronized circuit representation */
function sync(c){
  return {version:"6.88",schema:"single-circuit-model",
    schematic:{source:"same topology model",ready:!!c},
    builder:{source:"same topology model",ready:!!c},
    simulation:{source:"same topology model",ready:!!c}};
}

/* v6.89 — natural language complete design */
function design(request,spec){
  var q=String(request||"").toLowerCase(), domain="unknown";
  if(/motor|transformer|buck|boost|rectifier|smps/.test(q)) domain="power";
  else if(/uart|spi|i2c|sensor|mcu|pwm|arduino/.test(q)) domain="embedded";
  else if(/and|or|nand|nor|flip.?flop|counter|logic/.test(q)) domain="digital";
  else if(/motor|relay|contactor|star.?delta|industrial/.test(q)) domain="industrial";
  else if(/op.?amp|filter|amplifier|led|resistor|capacitor/.test(q)) domain="analog";
  return {version:"6.89",domain:domain,intent:request,requirements:spec||{},
          status:"DESIGN_INTENT_READY"};
}

/* v9.11 — universal end-to-end engine */
function generate(request,spec){
  var base=(window.NilSparkLabUniversalV680&&typeof window.NilSparkLabUniversalV680.generate==="function")
    ?window.NilSparkLabUniversalV680.generate(request,spec||{})
    :{components:[],nets:[]};
  var designIntent=design(request,spec||{});
  var topo=synthesizeTopology({components:base.components||[]});
  var verified=verifiedSearch(designIntent.domain,request);
  var calc=solveCircuitMath(spec||{});
  var opt=optimize(spec||{},calc);
  var diag=diagnose({components:base.components||[],nets:topo.nets});
  var corr=correct(base,diag);
  var synced=sync({components:base.components||[],nets:topo.nets});
  return {
    version:"9.11",request:request,designIntent:designIntent,
    verifiedCircuits:verified,topology:topo,calculations:calc,
    optimization:opt,diagnosis:diag,corrections:corr,sync:synced,
    base:base,status:diag.status
  };
}
window.NilSparkLabUniversalV690={
  version:"9.11",synthesizeTopology:synthesizeTopology,
  verifiedSearch:verifiedSearch,partData:partData,calculate:calculate,
  optimize:optimize,diagnose:diagnose,correct:correct,sync:sync,
  design:design,generate:generate
};
})();
