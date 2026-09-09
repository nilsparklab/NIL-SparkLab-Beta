
(function(){
"use strict";

/* v6.65 — Exact pin mapping */
var PIN_DB = {
  "555_timer":["1:GND","2:TRIG","3:OUT","4:RESET","5:CTRL","6:THRESH","7:DISCH","8:VCC"],
  "lm358":["1:OUT_A","2:IN-_A","3:IN+_A","4:VCC-","5:IN+_B","6:IN-_B","7:OUT_B","8:VCC+"],
  "lm317":["1:ADJ","2:OUT","3:IN"],
  "7805":["1:IN","2:GND","3:OUT"],
  "l293d":["1:EN1","2:IN1","3:OUT1","4:GND","5:GND","6:OUT2","7:IN2","8:VS",
           "9:EN2","10:IN3","11:OUT3","12:GND","13:GND","14:OUT4","15:IN4","16:VSS"],
  "uln2003":["1:B1","2:B2","3:B3","4:B4","5:B5","6:B6","7:B7","8:E","9:COM",
             "10:C7","11:C6","12:C5","13:C4","14:C3","15:C2","16:C1"]
};
function pinMap(part){ return {version:"6.65",part:part,pins:PIN_DB[String(part||"").toLowerCase()]||[],known:!!PIN_DB[String(part||"").toLowerCase()]}; }

/* v6.66 — verified circuit templates */
var VERIFIED = {
  "led_indicator": {
    status:"verified-template",
    components:["DC source","series resistor","LED","return"],
    checks:["LED current limiting","polarity","closed return path"]
  },
  "voltage_divider": {
    status:"verified-template",
    components:["DC source","R1","R2","return"],
    checks:["series resistance","output node","reference return"]
  },
  "full_wave_bridge": {
    status:"verified-template",
    components:["AC source","4 diodes","load/filter","return"],
    checks:["bridge polarity","source/load path"]
  },
  "rc_low_pass": {
    status:"verified-template",
    components:["source","resistor","capacitor","output node","return"],
    checks:["R-C topology","output node"]
  }
};
function template(name){ return {version:"6.66",name:name,status:VERIFIED[name]?"verified-template":"unknown-template",data:VERIFIED[name]||null}; }

/* v6.67 — component value designer */
function designValues(spec){
  spec=spec||{};
  var out=[], V=Number(spec.voltage), I=Number(spec.current);
  if(V>0 && I>0){
    out.push({purpose:"load resistance",formula:"R = V / I",value:V/I,unit:"ohm"});
    out.push({purpose:"load power",formula:"P = V × I",value:V*I,unit:"W"});
  }
  if(Number(spec.ledForwardVoltage)>0 && I>0 && V>Number(spec.ledForwardVoltage)){
    var r=(V-Number(spec.ledForwardVoltage))/I;
    out.push({purpose:"LED series resistor",formula:"R = (Vs − Vf) / I",value:r,unit:"ohm"});
    out.push({purpose:"LED resistor power",formula:"P = I²R",value:I*I*r,unit:"W"});
  }
  return {version:"6.67",inputs:spec,results:out,status:out.length?"calculated":"needs-inputs"};
}

/* v6.68 — electrical calculation/limits */
function electricalCheck(c){
  if(!c) return {version:"6.68",status:"invalid",issues:["No circuit data."]};
  var issues=[], warnings=[];
  var types=(c.components||[]).map(function(x){return x.type;});
  function has(t){return types.indexOf(t)>=0;}
  if(has("led")&&!has("resistor")) issues.push("LED current limiting resistor not specified.");
  if(has("motor")&&has("mosfet_n")&&!has("diode")) warnings.push("Flyback protection not specified.");
  if(has("transformer")&&has("battery")&&!has("ac_source")) warnings.push("Transformer excitation/source requires review.");
  if(!has("ground")) warnings.push("Reference/return node not explicitly identified.");
  return {version:"6.68",status:issues.length?"INVALID":warnings.length?"NEEDS_REVIEW":"CALCULATION_READY",
          issues:issues,warnings:warnings,rules:["Ohm's law","KCL/KVL","power","component ratings"]};
}

/* v6.69 — simulation verification adapter */
function simulationVerify(c){
  if(window.NilSparkLabSimulation && typeof window.NilSparkLabSimulation.validate==="function"){
    try{
      var result=window.NilSparkLabSimulation.validate(c);
      return {version:"6.69",status:"SIMULATION_CONNECTED",result:result};
    }catch(e){
      return {version:"6.69",status:"SIMULATION_ERROR",message:String(e.message||e)};
    }
  }
  return {version:"6.69",status:"SIMULATION_NOT_CONNECTED",
    message:"No simulation adapter is exposed; simulation verification is not claimed."};
}

/* v9.11 — universal verified design pipeline */
function generate(request,spec){
  var base=(window.NilSparkLabUniversalV664 &&
            typeof window.NilSparkLabUniversalV664.generate==="function")
            ?window.NilSparkLabUniversalV664.generate(request)
            :{components:[],verification:{status:"needs-review"}};

  var values=designValues(spec||{});
  var check=electricalCheck({components:base.components||[]});
  var sim=simulationVerify({components:base.components||[],
    nets:(base.topology&&base.topology.nets)||[]});

  var confidence="best-effort";
  if(check.status==="CALCULATION_READY" && sim.status==="SIMULATION_CONNECTED")
    confidence="simulation-checked";
  else if(check.status==="CALCULATION_READY")
    confidence="rule-checked";

  return {
    version:"9.11",
    request:request,
    confidence:confidence,
    components:base.components||[],
    topology:base.topology||null,
    values:values,
    electricalCheck:check,
    simulation:sim,
    schematic:base.schematic||null,
    alternatives:base.alternatives||[],
    optimization:base.optimization||null,
    verification:base.verification||{status:"needs-review"}
  };
}

window.NilSparkLabUniversalV670={
  version:"9.11",
  pinMap:pinMap,
  template:template,
  designValues:designValues,
  electricalCheck:electricalCheck,
  simulationVerify:simulationVerify,
  generate:generate
};
})();
