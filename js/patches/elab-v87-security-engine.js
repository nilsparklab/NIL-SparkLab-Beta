
(() => {
"use strict";

const TESTS = [
  {
    id:"DOM-XSS-01", name:"Inline event surface",
    run(){
      const nodes=[...document.querySelectorAll("[onerror],[onload],[onclick],[onmouseover],[onfocus],[oninput]")];
      return {status:nodes.length===0, severity:nodes.length?"WARN":"PASS",
        detail:nodes.length?`${nodes.length} inline event handler(s) detected; review them for unsafe input flow.`:"No common inline event handlers detected."};
    }
  },
  {
    id:"DOM-XSS-02", name:"Unsafe HTML sink inventory",
    run(){
      const scripts=[...document.scripts].filter(s=>s.textContent.includes("innerHTML")||s.textContent.includes("insertAdjacentHTML"));
      return {status:scripts.length===0, severity:scripts.length?"WARN":"PASS",
        detail:scripts.length?`${scripts.length} script block(s) contain HTML-writing sinks; verify all values are trusted/sanitized.`:"No obvious HTML-writing sinks found in script text."};
    }
  },
  {
    id:"SECRET-01", name:"Potential hard-coded secret patterns",
    run(){
      const text=document.documentElement.outerHTML;
      const hits=(text.match(/(?:api[_-]?key|secret|password|authorization)\s*[:=]\s*["'][^"']{8,}["']/gi)||[]);
      return {status:hits.length===0, severity:hits.length?"FAIL":"PASS",
        detail:hits.length?`${hits.length} possible hard-coded secret pattern(s) found; inspect before deployment.`:"No obvious hard-coded secret pattern detected."};
    }
  },
  {
    id:"INPUT-01", name:"Form validation surface",
    run(){
      const forms=[...document.forms], invalid=forms.filter(f=>!f.noValidate && f.querySelectorAll("input,textarea,select").length===0);
      return {status:invalid.length===0, severity:invalid.length?"WARN":"PASS",
        detail:`${forms.length} form(s) detected; ${invalid.length} have an unusual validation surface.`};
    }
  },
  {
    id:"CSP-01", name:"Content Security Policy presence",
    run(){
      const meta=document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      return {status:!!meta, severity:meta?"PASS":"WARN",
        detail:meta?"CSP meta policy is present.":"No CSP meta policy found; preferably enforce CSP with an HTTP response header."};
    }
  },
  {
    id:"STORAGE-01", name:"Sensitive localStorage keys",
    run(){
      const suspicious=[];
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i)||"";
        if(/password|token|secret|private[_-]?key|authorization/i.test(k)) suspicious.push(k);
      }
      return {status:suspicious.length===0, severity:suspicious.length?"WARN":"PASS",
        detail:suspicious.length?`Potentially sensitive storage key(s): ${suspicious.join(", ")}`:"No obviously sensitive localStorage key names detected."};
    }
  },
  {
    id:"SEC-REG-01", name:"Security self-check availability",
    run(){
      const ok=typeof window.NilSparkLabSecuritySelfCheck?.run==="function";
      return {status:ok, severity:ok?"PASS":"FAIL",
        detail:ok?"Existing security self-check engine is available.":"Existing security self-check engine is unavailable."};
    }
  },
  {
    id:"SEC-REG-02", name:"Owner dashboard availability",
    run(){
      const ok=!!window.NilSparkLabOwnerSecurityDashboard;
      return {status:ok, severity:ok?"PASS":"FAIL",
        detail:ok?"Owner security dashboard API is available.":"Owner dashboard API is unavailable."};
    }
  },
  {
    id:"REG-03", name:"Core UI presence",
    run(){
      const ids=["builder-canvas","current-trace","led-bulb"];
      const missing=ids.filter(id=>!document.getElementById(id));
      return {status:missing.length===0, severity:missing.length?"WARN":"PASS",
        detail:missing.length?`Expected UI element(s) missing: ${missing.join(", ")}`:"Core circuit UI elements are present."};
    }
  }
];

function runAll(){
  const results=TESTS.map(t=>{
    try{return {...t.run(),id:t.id,name:t.name};}
    catch(e){return {id:t.id,name:t.name,status:false,severity:"FAIL",detail:"Test threw an exception: "+String(e?.message||e)};}
  });
  const passed=results.filter(r=>r.severity==="PASS").length;
  const failed=results.filter(r=>r.severity==="FAIL").length;
  const warned=results.filter(r=>r.severity==="WARN").length;
  const score=Math.max(0,Math.round(((passed+(warned*.5))/results.length)*100));
  const report={version:"8.7",timestamp:new Date().toISOString(),score,passed,failed,warned,total:results.length,results};
  window.__ELAB_V87_SECURITY_REPORT__=report;
  return report;
}

window.NilSparkLabSecurityTestEngine=Object.freeze({run:runAll,tests:TESTS.map(t=>t.id)});
})();
