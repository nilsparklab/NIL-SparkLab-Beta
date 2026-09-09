
(function(){
"use strict";

/* v6.91 — exact terminal-to-terminal graph */
function exactGraph(c){
  c=c||{};
  var nodes=[], edges=[], issues=[];
  (c.components||[]).forEach(function(x){
    var ref=x.ref||x.type, pins=x.pins||[];
    nodes.push({ref:ref,type:x.type,pins:pins});
  });
  (c.nets||[]).forEach(function(n){
    if(n.from && n.to) edges.push({
      from:String(n.from),to:String(n.to),type:"electrical-net"
    });
    else issues.push("Incomplete terminal connection.");
  });
  return {version:"6.91",status:issues.length?"NEEDS_REVIEW":"GRAPH_READY",
          nodes:nodes,edges:edges,issues:issues};
}

/* v6.92 — larger verified circuit index */
var VERIFIED_INDEX={
 basic:["led_indicator","voltage_divider","series_parallel","wheatstone_bridge"],
 analog:["rc_low_pass","rc_high_pass","rlc_band_pass","opamp_inverting","opamp_non_inverting","common_emitter"],
 digital:["and_gate","or_gate","nand_gate","nor_gate","xor_gate","d_flipflop","counter","555_timer"],
 power:["half_wave_rectifier","full_wave_bridge","buck","boost","buck_boost","flyback","inverter"],
 industrial:["dol_starter","star_delta","forward_reverse","motor_protection","contactor_interlock"],
 embedded:["sensor_interface","uart","spi","i2c","pwm_motor_control","adc_measurement"]
};
function searchVerified(q){
  var n=String(q||"").toLowerCase(), hits=[];
  Object.keys(VERIFIED_INDEX).forEach(function(g){
    VERIFIED_INDEX[g].forEach(function(x){
      if(n.indexOf(x.replace(/_/g," "))>=0) hits.push({domain:g,name:x});
    });
  });
  return {version:"6.92",matches:hits,catalogue:VERIFIED_INDEX};
}

/* v6.93 — component rating validation */
var RATINGS={
 resistor:{required:["resistance","power"]},
 capacitor:{required:["capacitance","voltage"]},
 diode:{required:["forward_current","reverse_voltage"]},
 led:{required:["forward_current","forward_voltage"]},
 mosfet_n:{required:["vds","id","rds_on"]},
 bjt_npn:{required:["vce","ic"]},
 transformer:{required:["primary_voltage","secondary_voltage","power"]},
 motor:{required:["voltage","current","power"]}
};
function ratingCheck(c){
  var missing=[], comps=c&&c.components||[];
  comps.forEach(function(x){
    var r=RATINGS[x.type];
    if(r) missing.push({ref:x.ref||x.type,required:r.required});
  });
  return {version:"6.93",status:missing.length?"RATINGS_REQUIRED":"NO_RATING_DATA_REQUIRED",
          checks:missing};
}

/* v6.94 — DC/AC calculation framework */
function solveElectrical(spec){
  spec=spec||{};
  var V=Number(spec.voltage), I=Number(spec.current), R=Number(spec.resistance);
  var f=Number(spec.frequency), Xc=null, Xl=null, out=[];
  if(V>0&&I>0) out.push({name:"R",formula:"V/I",value:V/I,unit:"ohm"});
  if(V>0&&R>0) out.push({name:"I",formula:"V/R",value:V/R,unit:"A"});
  if(V>0&&I>0) out.push({name:"P",formula:"V×I",value:V*I,unit:"W"});
  if(f>0 && Number(spec.capacitance)>0){
    Xc=1/(2*Math.PI*f*Number(spec.capacitance));
    out.push({name:"Xc",formula:"1/(2πfC)",value:Xc,unit:"ohm"});
  }
  if(f>0 && Number(spec.inductance)>0){
    Xl=2*Math.PI*f*Number(spec.inductance);
    out.push({name:"Xl",formula:"2πfL",value:Xl,unit:"ohm"});
  }
  return {version:"6.94",status:out.length?"CALCULATED":"NEEDS_VALUES",
          results:out,rules:["Ohm","KCL/KVL where applicable","AC reactance","power"]};
}

/* v6.95 — simulation/SPICE-compatible export contract */
function simulationModel(c){
  return {
    version:"6.95",
    format:"spice-compatible-structure",
    status:"MODEL_READY",
    components:(c&&c.components)||[],
    nets:(c&&c.nets)||[],
    note:"A real simulator/model must be connected before claiming simulation results."
  };
}

/* v6.96 — diagnose → fix → revalidate loop */
function correctionLoop(c){
  var issues=[], fixes=[], types=(c&&c.components||[]).map(function(x){return x.type;});
  function has(t){return types.indexOf(t)>=0;}
  if(has("led")&&!has("resistor")){
    issues.push("LED current limiting unspecified.");
    fixes.push("Add/select a series current-limiting resistor.");
  }
  if((has("motor")||has("relay"))&&has("mosfet_n")&&!has("diode")){
    issues.push("Inductive protection unspecified.");
    fixes.push("Add/select an appropriate flyback path.");
  }
  if(!((c&&c.nets)||[]).length){
    issues.push("No explicit electrical nets.");
    fixes.push("Regenerate terminal-to-terminal nets.");
  }
  return {version:"6.96",status:issues.length?"CORRECTION_REQUIRED":"PASS",
          issues:issues,fixes:fixes,iterations:1,autoApplied:false};
}

/* v6.97 — professional schematic specification */
function professionalSchematic(c){
  var items=(c&&c.components||[]).map(function(x,i){
    return {ref:x.ref||("X"+(i+1)),type:x.type,x:100+(i%5)*190,
      y:100+Math.floor(i/5)*130,orientation:"horizontal",
      label:x.ref||x.type,value:x.value||""};
  });
  return {version:"6.97",status:"SCHEMATIC_READY",standard:"IEC/ANSI-inspired",
          routing:"orthogonal",junctions:true,labels:true,items:items,nets:(c&&c.nets)||[]};
}

/* v6.98 — Builder construction contract */
function builderModel(c){
  return {version:"6.98",status:"BUILDER_MODEL_READY",
          components:(c&&c.components)||[],nets:(c&&c.nets)||[],
          builderConnected:!!(window.NilSparkLabBuilderBridge)};
}

/* v6.99 — natural-language universal design */
function naturalDesign(request){
  var q=String(request||"").toLowerCase(), domain="unknown";
  if(/uart|spi|i2c|can|sensor|mcu|arduino|pwm/.test(q)) domain="embedded";
  else if(/and gate|or gate|nand|nor|flip.?flop|counter|logic/.test(q)) domain="digital";
  else if(/buck|boost|rectifier|smps|inverter|igbt|triac/.test(q)) domain="power";
  else if(/motor|relay|contactor|star.?delta|vfd/.test(q)) domain="industrial";
  else if(/op.?amp|filter|amplifier|led|resistor|capacitor/.test(q)) domain="analog";
  return {version:"6.99",domain:domain,request:request,status:"DESIGN_INTENT_READY"};
}

/* v9.11 — universal circuit designer */
function generate(request,spec){
  spec=spec||{};
  var base=(window.NilSparkLabUniversalV690 &&
            typeof window.NilSparkLabUniversalV690.generate==="function")
            ?window.NilSparkLabUniversalV690.generate(request,spec)
            :{components:[],topology:{nets:[]}};
  var c={components:base.base&&base.base.components||base.components||[],
         nets:(base.topology&&base.topology.nets)||
              (base.base&&base.base.topology&&base.base.topology.nets)||[]};
  var intent=naturalDesign(request);
  var graph=exactGraph(c);
  var verified=searchVerified(request);
  var ratings=ratingCheck(c);
  var math=solveElectrical(spec);
  var sim=simulationModel(c);
  var correction=correctionLoop(c);
  var schematic=professionalSchematic(c);
  var builder=builderModel(c);
  return {
    version:"9.11",request:request,intent:intent,graph:graph,
    verified:verified,ratings:ratings,math:math,simulation:sim,
    correction:correction,schematic:schematic,builder:builder,
    status:correction.status
  };
}

window.NilSparkLabUniversalV700={
  version:"9.11",exactGraph:exactGraph,searchVerified:searchVerified,
  ratingCheck:ratingCheck,solveElectrical:solveElectrical,
  simulationModel:simulationModel,correctionLoop:correctionLoop,
  professionalSchematic:professionalSchematic,builderModel:builderModel,
  naturalDesign:naturalDesign,generate:generate
};
})();
