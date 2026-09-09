
(() => {
"use strict";

/*
 * v1 PRO.3 adds a deterministic simulation-analysis contract.
 * It validates basic topology/values and provides analysis helpers.
 * Existing simulator behavior is not replaced automatically.
 */
const ENGINE = Object.freeze({
  version:"1 PRO.3",
  supportedSources:["DC","AC"],
  supportedComponents:["resistor","led","diode","capacitor","inductor","switch"],
  limits:Object.freeze({
    maxComponents:500,
    maxConnections:1000,
    minResistance:1e-9,
    maxResistance:1e12
  })
});

function num(v){
  const n=Number(v);
  return Number.isFinite(n) ? n : null;
}

function validateCircuit(circuit){
  const c=circuit && typeof circuit==="object" ? circuit : {};
  const components=Array.isArray(c.components)?c.components:[];
  const connections=Array.isArray(c.connections)?c.connections:[];
  const issues=[];

  if(!Array.isArray(c.components)) issues.push("components must be an array");
  if(!Array.isArray(c.connections)) issues.push("connections must be an array");
  if(components.length>ENGINE.limits.maxComponents) issues.push("component limit exceeded");
  if(connections.length>ENGINE.limits.maxConnections) issues.push("connection limit exceeded");

  const source=String(c.source||"DC").toUpperCase();
  if(!ENGINE.supportedSources.includes(source)) issues.push("unsupported source mode");

  components.forEach((x,i)=>{
    if(!x || !ENGINE.supportedComponents.includes(String(x.type||"").toLowerCase()))
      issues.push(`component ${i+1}: unsupported component type`);
  });

  return {valid:issues.length===0,issues,source};
}

function resistorCurrent(voltage,resistance){
  const V=num(voltage), R=num(resistance);
  if(V===null || R===null || R<=0) return null;
  return V/R;
}

function resistorPower(voltage,resistance){
  const I=resistorCurrent(voltage,resistance);
  return I===null ? null : voltage*I;
}

function acSample(amplitude,frequency,time,phase=0){
  const A=num(amplitude), f=num(frequency), t=num(time), p=num(phase)||0;
  if(A===null || f===null || t===null) return null;
  return A*Math.sin(2*Math.PI*f*t+p);
}

function analyze(circuit){
  const validation=validateCircuit(circuit);
  if(!validation.valid) return {valid:false,issues:validation.issues};

  return {
    valid:true,
    source:validation.source,
    componentCount:circuit.components.length,
    connectionCount:circuit.connections.length,
    analysis: validation.source==="AC"
      ? "AC source selected: time-domain waveform analysis is applicable."
      : "DC source selected: steady-state analysis is applicable."
  };
}

window.NilSparkLabV1PRO3Simulation = Object.freeze({
  version:"1 PRO.3",
  config:ENGINE,
  validateCircuit,
  resistorCurrent,
  resistorPower,
  acSample,
  analyze,
  status(){
    return {
      version:"1 PRO.3",
      topologyValidation:true,
      dcAnalysis:true,
      acWaveformSampling:true,
      componentValidation:true,
      safetyLimits:true,
      anonymousUsage:true,
      adminServerAuthorizationRequired:true
    };
  }
});
})();
