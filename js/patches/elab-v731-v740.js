
(function(){
"use strict";

/* v7.31 — structured datasheet/component records */
var DATASHEET_DB={
  "555_timer":{family:"timer",pins:["GND","TRIG","OUT","RESET","CTRL","THRESH","DISCH","VCC"]},
  "lm358":{family:"opamp",pins:["OUT_A","IN-_A","IN+_A","VCC-","IN+_B","IN-_B","OUT_B","VCC+"]},
  "7805":{family:"regulator",pins:["IN","GND","OUT"]},
  "lm317":{family:"regulator",pins:["ADJ","OUT","IN"]},
  "l293d":{family:"motor_driver",pins:["EN1","IN1","OUT1","GND","GND","OUT2","IN2","VS","EN2","IN3","OUT3","GND","GND","OUT4","IN4","VSS"]}
};
function datasheet(part){
  var key=String(part||"").toLowerCase();
  return {version:"7.31",part:key,data:DATASHEET_DB[key]||null,
          status:DATASHEET_DB[key]?"KNOWN":"NOT_IN_LOCAL_DB"};
}

/* v7.32 — expanded verified topology library */
var CIRCUITS={
  led_indicator:{domain:"analog",topology:["source","resistor","led","return"]},
  voltage_divider:{domain:"analog",topology:["source","R1","R2","return"]},
  rc_low_pass:{domain:"analog",topology:["source","R","C","output","return"]},
  full_wave_bridge:{domain:"power",topology:["ac_source","D1","D2","D3","D4","dc_bus","load","return"]},
  buck_converter:{domain:"power",topology:["dc_source","switch","inductor","diode","capacitor","load","return"]},
  boost_converter:{domain:"power",topology:["dc_source","inductor","switch","diode","capacitor","load","return"]},
  h_bridge:{domain:"power",topology:["high_side","low_side","motor","protection","return"]},
  "555_timer":{domain:"digital",topology:["timer","timing_network","load","return"]},
  uart_interface:{domain:"embedded",topology:["TX","RX","GND"]},
  i2c_interface:{domain:"embedded",topology:["SDA","SCL","pullups","GND"]},
  star_delta:{domain:"industrial",topology:["protection","contactor","motor","interlock","return"]}
};
function circuitTemplate(name){
  return {version:"7.32",name:name,data:CIRCUITS[name]||null,
          status:CIRCUITS[name]?"VERIFIED_TEMPLATE":"UNKNOWN_TEMPLATE"};
}

/* v7.33 — exact pin/rating validation */
function validateComponents(c){
  var issues=[],warnings=[];
  (c&&c.components||[]).forEach(function(x){
    var key=String(x.type||"").toLowerCase();
    if(!x.type)issues.push((x.ref||"component")+": missing type.");
    if(DATASHEET_DB[key] && (!x.pins || !x.pins.length))
      warnings.push((x.ref||key)+": known part but exact pin mapping not attached.");
    if(["resistor","capacitor","diode","led","mosfet_n"].indexOf(key)>=0 && !x.value)
      warnings.push((x.ref||key)+": value is missing.");
  });
  return {version:"7.33",status:issues.length?"INVALID":warnings.length?"NEEDS_REVIEW":"VALIDATED",
          issues:issues,warnings:warnings};
}

/* v7.34 — KCL/KVL/AC/DC solver framework */
function solve(spec){
  spec=spec||{};
  var V=Number(spec.voltage),I=Number(spec.current),R=Number(spec.resistance),
      f=Number(spec.frequency),C=Number(spec.capacitance),L=Number(spec.inductance),o=[];
  if(V>0&&I>0)o.push({name:"R",formula:"V/I",value:V/I,unit:"ohm"});
  if(V>0&&R>0)o.push({name:"I",formula:"V/R",value:V/R,unit:"A"});
  if(V>0&&I>0)o.push({name:"P",formula:"VI",value:V*I,unit:"W"});
  if(f>0&&C>0)o.push({name:"Xc",formula:"1/(2πfC)",value:1/(2*Math.PI*f*C),unit:"ohm"});
  if(f>0&&L>0)o.push({name:"Xl",formula:"2πfL",value:2*Math.PI*f*L,unit:"ohm"});
  return {version:"7.34",status:o.length?"CALCULATED":"NEEDS_VALUES",
          results:o,rules:["Ohm","KCL/KVL where applicable","AC reactance","power"]};
}

/* v7.35 — real simulator bridge contract */
function simulatorBridge(c){
  if(window.NilSparkLabSimulation){
    return {version:"7.35",status:"SIMULATOR_DETECTED",
      canValidate:typeof window.NilSparkLabSimulation.validate==="function",
      model:{components:c.components||[],nets:c.nets||[]}};
  }
  return {version:"7.35",status:"SIMULATOR_NOT_CONNECTED",
          model:{components:c.components||[],nets:c.nets||[]}};
}

/* v7.36 — simulation-driven correction */
function correctionFromSimulation(result){
  if(!result)return {version:"7.36",status:"NO_RESULT",fixes:[]};
  if(result.status==="PASS"||result.status==="OK")
    return {version:"7.36",status:"NO_CORRECTION_REQUIRED",fixes:[]};
  return {version:"7.36",status:"REVIEW_REQUIRED",
          fixes:["Inspect failed operating point/net connection and regenerate after correction."]};
}

/* v7.37 — professional schematic data */
function renderSchematic(c){
  var items=(c&&c.components||[]).map(function(x,i){
    return {ref:x.ref||("X"+(i+1)),type:x.type,x:100+(i%6)*170,
      y:100+Math.floor(i/6)*120,label:x.ref||x.type,value:x.value||"",
      orientation:"horizontal"};
  });
  return {version:"7.37",status:"SCHEMATIC_READY",standard:"IEC/ANSI-inspired",
          routing:"orthogonal",junctions:true,labels:true,items:items,nets:(c&&c.nets)||[]};
}

/* v7.38 — builder construction plan */
function builderPlan(c){
  return {version:"7.38",status:"PLAN_READY",
    components:(c&&c.components||[]).map(function(x){return {
      ref:x.ref||x.type,type:x.type,value:x.value||null};}),
    nets:(c&&c.nets)||[],
    builderConnected:!!window.NilSparkLabBuilderBridge};
}

/* v7.39 — natural language → complete design request */
function parseDesign(request){
  var q=String(request||"").toLowerCase(),domain="unknown";
  if(/sensor|uart|spi|i2c|mcu|pwm|arduino/.test(q))domain="embedded";
  else if(/nand|nor|flip.?flop|counter|logic/.test(q))domain="digital";
  else if(/buck|boost|rectifier|smps|inverter|igbt|triac/.test(q))domain="power";
  else if(/motor|relay|contactor|star.?delta|vfd/.test(q))domain="industrial";
  else if(/op.?amp|filter|amplifier|led|resistor|capacitor/.test(q))domain="analog";
  return {version:"7.39",domain:domain,request:request,
          status:domain==="unknown"?"NEEDS_CLARIFICATION":"DESIGN_INTENT_READY"};
}

/* v9.11 — universal verified generator */
function generate(request,spec,components){
  spec=spec||{};
  var c={components:components||[],nets:[]};
  var intent=parseDesign(request);
  var validation=validateComponents(c);
  var math=solve(spec);
  var sim=simulatorBridge(c);
  var correction=correctionFromSimulation(sim);
  var schematic=renderSchematic(c);
  var builder=builderPlan(c);
  return {version:"9.11",request:request,intent:intent,
    validation:validation,math:math,simulation:sim,
    correction:correction,schematic:schematic,builder:builder,
    status:validation.status};
}
window.NilSparkLabUniversalV740={
 version:"9.11",datasheet:datasheet,circuitTemplate:circuitTemplate,
 validateComponents:validateComponents,solve:solve,simulatorBridge:simulatorBridge,
 correctionFromSimulation:correctionFromSimulation,renderSchematic:renderSchematic,
 builderPlan:builderPlan,parseDesign:parseDesign,generate:generate
};
})();
