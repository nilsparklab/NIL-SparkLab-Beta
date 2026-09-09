
(() => {
"use strict";

/*
 * v1 PRO.2 adds a feature-side intelligence contract.
 * It intentionally does not replace the existing simulator; it provides
 * validated inputs/outputs for assistant and waveform-aware features.
 */
const INTELLIGENCE = Object.freeze({
  version:"1 PRO.2",
  assistant:Object.freeze({
    compactMode:true,
    mobileFirst:true,
    adminLoginTrigger:"explicit_assistant_request"
  }),
  circuit:Object.freeze({
    sourceModes:["DC","AC"],
    waveformPolicy:"SOURCE_AWARE",
    validationBeforeRun:true,
    assistantExplanation:true
  }),
  simulation:Object.freeze({
    runValidation:true,
    resetSupported:true,
    invalidCircuitFeedback:true
  }),
  security:Object.freeze({
    anonymousUsers:true,
    adminServerAuthorizationRequired:true
  })
});

function normalizeSource(source){
  const s=String(source||"").trim().toUpperCase();
  return s==="AC" ? "AC" : "DC";
}

function waveformPolicy(source){
  return normalizeSource(source)==="AC"
    ? {mode:"AC",type:"time-varying",assistantHint:"AC source: waveform should be time-varying and follow source frequency/amplitude."}
    : {mode:"DC",type:"constant",assistantHint:"DC source: steady-state waveform should be a constant level after transient behavior is considered."};
}

function validateCircuit(circuit){
  const c=circuit && typeof circuit==="object" ? circuit : {};
  const issues=[];
  if(!Array.isArray(c.components)) issues.push("components must be an array");
  if(!Array.isArray(c.connections)) issues.push("connections must be an array");
  if(!c.source) issues.push("source is required");
  return {valid:issues.length===0,issues};
}

window.NilSparkLabV1PRO2Intelligence = Object.freeze({
  version:"1 PRO.2",
  config:INTELLIGENCE,
  normalizeSource,
  waveformPolicy,
  validateCircuit,
  status(){
    return {
      version:"1 PRO.2",
      assistantReady:true,
      sourceAwareWaveform:true,
      circuitValidation:true,
      simulationValidation:true,
      anonymousUsage:true,
      adminServerAuthorizationRequired:true
    };
  }
});
})();
