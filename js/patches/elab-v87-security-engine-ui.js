
(() => {
"use strict";
const panel=document.getElementById("elab-v86-security-card");
if(!panel || document.getElementById("elab-v87-test-engine")) return;

const box=document.createElement("section");
box.id="elab-v87-test-engine";
box.innerHTML=`
  <strong>Security Test & Regression Engine</strong>
  <div style="font-size:11px;opacity:.68;margin-top:3px">Owner view • local static checks only</div>
  <div class="elab-v87-toolbar">
    <button type="button" id="elab-v87-run">Run all tests</button>
    <button type="button" id="elab-v87-export">Export test report</button>
  </div>
  <div id="elab-v87-summary" style="font-size:12px;margin-bottom:8px"></div>
  <div id="elab-v87-results"></div>`;
panel.appendChild(box);

function render(){
 const r=window.NilSparkLabSecurityTestEngine?.run?.(); if(!r)return;
 document.getElementById("elab-v87-summary").textContent=
   `Score ${r.score}% • PASS ${r.passed} • WARN ${r.warned} • FAIL ${r.failed}`;
 const list=document.getElementById("elab-v87-results"); list.textContent="";
 r.results.forEach(x=>{
   const row=document.createElement("div");
   row.className="elab-v87-row elab-v87-"+x.severity.toLowerCase();
   const b=document.createElement("strong"); b.textContent=`${x.severity} • ${x.id} • ${x.name}`;
   const d=document.createElement("div"); d.textContent=x.detail; d.style.opacity=".72";
   row.append(b,d); list.appendChild(row);
 });
}
document.getElementById("elab-v87-run")?.addEventListener("click",render);
document.getElementById("elab-v87-export")?.addEventListener("click",()=>{
 const r=window.__ELAB_V87_SECURITY_REPORT__||window.NilSparkLabSecurityTestEngine?.run?.(); if(!r)return;
 const a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob([JSON.stringify(r,null,2)],{type:"application/json"}));
 a.download="nilsparklab-v87-security-test-report.json"; a.click();
 setTimeout(()=>URL.revokeObjectURL(a.href),1000);
});
})();
