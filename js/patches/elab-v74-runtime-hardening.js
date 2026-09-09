
(()=>{
"use strict"; const V="7.4", MAX=100, events=[];
const record=(type,severity,detail)=>{const e=Object.freeze({time:Date.now(),type,severity,detail,version:V});events.push(e);if(events.length>MAX)events.shift();try{window.dispatchEvent(new CustomEvent("nilsparklab:security-event",{detail:e}))}catch(_){}return e};
window.addEventListener("securitypolicyviolation",e=>record("csp-violation","high",`${e.effectiveDirective||"unknown-directive"}: ${e.blockedURI||"unknown-resource"}`));
const baseline={alert:window.alert,confirm:window.confirm,prompt:window.prompt};
const check=()=>{const changed=Object.keys(baseline).filter(k=>window[k]!==baseline[k]);if(changed.length)record("runtime-api-change","medium",changed.join(", "));return Object.freeze({version:V,changedApis:Object.freeze(changed.slice()),timestamp:Date.now()})};
const report=()=>Object.freeze({version:V,eventCount:events.length,cspViolationCount:events.filter(e=>e.type==="csp-violation").length,runtimeApiChangeCount:events.filter(e=>e.type==="runtime-api-change").length});
window.NilSparkLabRuntimeSecurity=Object.freeze({version:V,check,report,events:()=>Object.freeze(events.slice())});
window.addEventListener("load",()=>{try{check();record("runtime-hardening-ready","info","v7.4 runtime security layer initialized")}catch(e){record("runtime-hardening-failed","high",e?.message||"Unknown failure")}}, {once:true});
})();
