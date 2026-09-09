
(() => {
"use strict";

/*
 * v1 PRO.5 defines interactive visual capabilities.
 * It does not silently replace the existing builder or simulator.
 * A diagram can carry safe metadata for later Build/Simulate integration.
 */
const VISUALS = Object.freeze({
  version:"1 PRO.5",
  interactions:Object.freeze([
    "zoom",
    "pan",
    "component_select",
    "voltage_current_arrows",
    "kvl_loop_highlight",
    "kcl_node_highlight",
    "waveform_controls",
    "build_this_circuit",
    "simulate_this_circuit"
  ]),
  limits:Object.freeze({
    maxNodes:100,
    maxLabels:100,
    maxZoom:4,
    minZoom:.5
  })
});

function clampZoom(z){
  const n=Number(z);
  if(!Number.isFinite(n)) return 1;
  return Math.min(VISUALS.limits.maxZoom,Math.max(VISUALS.limits.minZoom,n));
}

function createVisualSpec(type,data={}){
  return Object.freeze({
    version:"1 PRO.5",
    type:String(type||"circuit_diagram"),
    data,
    actions:Object.freeze({
      build:true,
      simulate:true,
      explain:true
    })
  });
}

function waveformConfig({mode="DC",amplitude=1,frequency=50,phase=0}={}){
  const m=String(mode).toUpperCase()==="AC"?"AC":"DC";
  return Object.freeze({
    mode:m,
    amplitude:Number.isFinite(Number(amplitude))?Number(amplitude):1,
    frequency:m==="AC" ? (Number.isFinite(Number(frequency))?Number(frequency):50) : 0,
    phase:m==="AC" ? (Number.isFinite(Number(phase))?Number(phase):0) : 0
  });
}

window.NilSparkLabV1PRO5Visuals = Object.freeze({
  version:"1 PRO.5",
  config:VISUALS,
  clampZoom,
  createVisualSpec,
  waveformConfig,
  status(){
    return {
      version:"1 PRO.5",
      interactiveDiagrams:true,
      buildCircuitAction:true,
      simulateCircuitAction:true,
      waveformControls:true,
      kvlKclHighlighting:true,
      mobileInteraction:true,
      anonymousUsage:true,
      adminServerAuthorizationRequired:true
    };
  }
});
})();
