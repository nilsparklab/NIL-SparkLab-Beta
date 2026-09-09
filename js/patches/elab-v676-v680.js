
(function(){
"use strict";

/* v6.76 — Domain → topology mapping */
var TOPOLOGY_PATTERNS={
  analog:{
    led_indicator:["source","resistor","led","return"],
    voltage_divider:["source","resistor","resistor","output","return"],
    rc_low_pass:["source","resistor","capacitor","output","return"],
    opamp_inverting:["source","input_resistor","opamp","feedback_resistor","return"]
  },
  digital:{
    logic_gate:["vcc","input_a","input_b","logic_gate","output","gnd"],
    pullup_input:["vcc","pullup_resistor","input","gnd"],
    mcu_gpio:["mcu","gpio","load","gnd"]
  },
  power:{
    bridge_rectifier:["ac_source","four_diodes","dc_bus","load","return"],
    buck:["dc_source","switch","inductor","diode","capacitor","load","return"],
    boost:["dc_source","inductor","switch","diode","capacitor","load","return"]
  },
  industrial:{
    motor_control:["control","driver_or_contactor","motor","protection","return"],
    star_delta:["source","protection","contactor_set","motor","return"]
  },
  embedded:{
    sensor_interface:["sensor","conditioning","mcu_input","return"],
    uart:["mcu_a_tx","mcu_b_rx","ground"],
    i2c:["vcc","pullups","sda","scl","devices","ground"]
  }
};
function topologyFor(domain,name){
  var d=TOPOLOGY_PATTERNS[domain]||{};
  return {version:"6.76",domain:domain,name:name,
          topology:d[name]||null,status:d[name]?"mapped":"not-mapped"};
}

/* v6.77 — verified practical domain circuits */
var VERIFIED_DOMAIN={
  analog:["led_indicator","voltage_divider","rc_low_pass","opamp_inverting"],
  digital:["logic_gate","pullup_input","mcu_gpio"],
  power:["bridge_rectifier","buck","boost"],
  industrial:["motor_control","star_delta"],
  embedded:["sensor_interface","uart","i2c"]
};
function verifiedSearch(domain){
  return {version:"6.77",domain:domain,
          circuits:VERIFIED_DOMAIN[domain]||[]};
}

/* v6.78 — component/value selection */
function selectValues(spec){
  spec=spec||{};
  var result=[], V=Number(spec.voltage), I=Number(spec.current);
  if(V>0 && I>0){
    result.push({name:"load resistance",formula:"R = V/I",value:V/I,unit:"ohm"});
    result.push({name:"load power",formula:"P = V×I",value:V*I,unit:"W"});
  }
  if(Number(spec.ledForwardVoltage)>0 && I>0 && V>Number(spec.ledForwardVoltage)){
    var r=(V-Number(spec.ledForwardVoltage))/I;
    result.push({name:"LED series resistor",formula:"R=(Vs−Vf)/I",value:r,unit:"ohm"});
    result.push({name:"resistor power",formula:"P=I²R",value:I*I*r,unit:"W"});
  }
  return {version:"6.78",status:result.length?"calculated":"needs-inputs",
          inputs:spec,results:result};
}

/* v6.79 — domain-aware electrical rules */
function validate(domain,circuit){
  var issues=[],warnings=[],types=(circuit&&circuit.components||[]).map(function(x){return x.type;});
  function has(t){return types.indexOf(t)>=0;}
  if(!types.length) issues.push("No components available for validation.");
  if(has("led")&&!has("resistor")) issues.push("LED current limiting is unspecified.");
  if((has("motor")||has("relay"))&&has("mosfet_n")&&!has("diode"))
    warnings.push("Inductive-load flyback protection is unspecified.");
  if(domain==="power" && has("ac_source"))
    warnings.push("Power circuit requires voltage/current/rating review before practical use.");
  if(domain==="industrial")
    warnings.push("Industrial control circuits require protection, isolation and standards review.");
  if(domain==="embedded")
    warnings.push("Verify logic voltage levels and interface compatibility.");
  return {version:"6.79",domain:domain,
          status:issues.length?"INVALID":warnings.length?"NEEDS_REVIEW":"DOMAIN_RULES_OK",
          issues:issues,warnings:warnings};
}

/* v9.11 — universal generation + verification pipeline */
function generate(request,spec){
  var base=(window.NilSparkLabUniversalV670 &&
            typeof window.NilSparkLabUniversalV670.generate==="function")
            ?window.NilSparkLabUniversalV670.generate(request,spec||{})
            :{components:[],verification:{status:"needs-review"}};

  var domains=(window.NilSparkLabUniversalDomains &&
               typeof window.NilSparkLabUniversalDomains.search==="function")
               ?window.NilSparkLabUniversalDomains.search(request)
               :null;

  var domain="unknown", family="generic";
  if(domains){
    if(domains.power && domains.power.matches.length) domain="power";
    else if(domains.industrial && domains.industrial.matches.length) domain="industrial";
    else if(domains.embedded && domains.embedded.matches.length) domain="embedded";
    else if(domains.digital && domains.digital.matches.length) domain="digital";
    else if(domains.analog && domains.analog.matches.length) domain="analog";
  }

  var values=selectValues(spec||{});
  var circuit={components:base.components||[],nets:(base.topology&&base.topology.nets)||[]};
  var rules=validate(domain,circuit);
  var mapped=topologyFor(domain,family);
  var verified=verifiedSearch(domain);

  return {
    version:"9.11",request:request,domain:domain,family:family,
    topologyMapping:mapped,verifiedCircuits:verified,
    components:circuit.components,nets:circuit.nets,
    values:values,domainValidation:rules,
    baseVerification:base.verification||null,
    schematic:base.schematic||null,simulation:base.simulation||null,
    status:rules.status
  };
}
window.NilSparkLabUniversalV680={
  version:"9.11",topologyFor:topologyFor,verifiedSearch:verifiedSearch,
  selectValues:selectValues,validate:validate,generate:generate
};
})();
