
(function(){
"use strict";

/* v6.71 — Analog Circuit Knowledge */
var ANALOG={
  amplifiers:["common_emitter","common_collector","common_base","inverting_opamp","non_inverting_opamp","differential_amplifier"],
  filters:["rc_low_pass","rc_high_pass","rl_low_pass","rlc_band_pass","active_low_pass","active_high_pass"],
  feedback:["voltage_series_feedback","current_feedback"],
  regulators:["zener_regulator","linear_regulator","current_source","current_sink"],
  oscillators:["rc_oscillator","lc_oscillator","wein_bridge","astable_multivibrator"]
};
function analogSearch(q){
  var n=String(q||"").toLowerCase(), hits=[];
  Object.keys(ANALOG).forEach(function(g){
    ANALOG[g].forEach(function(x){
      if(n.indexOf(x.replace(/_/g," "))>=0) hits.push({family:g,circuit:x});
    });
  });
  return {version:"6.71",domain:"analog",matches:hits};
}

/* v6.72 — Digital, Logic & MCU */
var DIGITAL={
  gates:["and","or","not","nand","nor","xor","xnor"],
  sequential:["sr_latch","d_flipflop","jk_flipflop","t_flipflop","counter","shift_register"],
  timing:["555_timer","clock_divider","monostable","astable"],
  mcu:["gpio","pwm","adc","dac","uart","spi","i2c","interrupt"],
  interfacing:["level_shifter","debounce","pullup","pulldown","open_collector"]
};
function digitalSearch(q){
  var n=String(q||"").toLowerCase(), hits=[];
  Object.keys(DIGITAL).forEach(function(g){
    DIGITAL[g].forEach(function(x){
      if(n.indexOf(x.replace(/_/g," "))>=0) hits.push({family:g,circuit:x});
    });
  });
  return {version:"6.72",domain:"digital_mcu",matches:hits};
}

/* v6.73 — Power Electronics & SMPS */
var POWER={
  rectifiers:["half_wave_rectifier","full_wave_rectifier","bridge_rectifier"],
  converters:["buck","boost","buck_boost","flyback","forward_converter","push_pull_converter","half_bridge","full_bridge"],
  switching:["mosfet_switch","igbt_switch","thyristor_control","triac_control"],
  smps:["isolated_smps","non_isolated_smps","pfc_stage"],
  protection:["snubber","freewheel_diode","overcurrent_protection","overvoltage_protection"]
};
function powerSearch(q){
  var n=String(q||"").toLowerCase(), hits=[];
  Object.keys(POWER).forEach(function(g){
    POWER[g].forEach(function(x){
      if(n.indexOf(x.replace(/_/g," "))>=0) hits.push({family:g,circuit:x});
    });
  });
  return {version:"6.73",domain:"power_smps",matches:hits};
}

/* v6.74 — Electrical Machines & Industrial Control */
var INDUSTRIAL={
  machines:["dc_motor","dc_generator","induction_motor","synchronous_motor","transformer","alternator"],
  starters:["dol_starter","star_delta_starter","soft_starter"],
  control:["contactor_control","relay_control","motor_interlock","forward_reverse_control"],
  protection:["overload_relay","phase_failure","earth_fault","motor_protection"],
  drives:["vfd","servo_drive","dc_drive"]
};
function industrialSearch(q){
  var n=String(q||"").toLowerCase(), hits=[];
  Object.keys(INDUSTRIAL).forEach(function(g){
    INDUSTRIAL[g].forEach(function(x){
      if(n.indexOf(x.replace(/_/g," "))>=0) hits.push({family:g,circuit:x});
    });
  });
  return {version:"6.74",domain:"machines_industrial",matches:hits};
}

/* v9.11 — Sensors, Communication & Embedded */
var EMBEDDED={
  sensors:["ldr","thermistor","ntc","pt100","thermocouple","hall_sensor","ir_sensor","ultrasonic_sensor","pressure_sensor","accelerometer"],
  communication:["uart","spi","i2c","can","rs232","rs485","modbus","ethernet"],
  embedded:["gpio_control","sensor_interface","adc_measurement","pwm_control","motor_control","display_interface"],
  conditioning:["instrumentation_amplifier","anti_alias_filter","signal_clamp","level_shifter"]
};
function embeddedSearch(q){
  var n=String(q||"").toLowerCase(), hits=[];
  Object.keys(EMBEDDED).forEach(function(g){
    EMBEDDED[g].forEach(function(x){
      if(n.indexOf(x.replace(/_/g," "))>=0) hits.push({family:g,circuit:x});
    });
  });
  return {version:"9.11",domain:"sensors_communication_embedded",matches:hits};
}

/* Combined domain router */
function search(request){
  return {
    version:"9.11",
    analog:analogSearch(request),
    digital:digitalSearch(request),
    power:powerSearch(request),
    industrial:industrialSearch(request),
    embedded:embeddedSearch(request)
  };
}

window.NilSparkLabUniversalDomains={
  version:"9.11",
  analog:ANALOG,
  digital:DIGITAL,
  power:POWER,
  industrial:INDUSTRIAL,
  embedded:EMBEDDED,
  search:search
};
})();
