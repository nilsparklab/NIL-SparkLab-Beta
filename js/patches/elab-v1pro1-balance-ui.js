
(() => {
"use strict";
const panel=document.getElementById("elab-v86-security-card");
if(!panel || document.getElementById("elab-v1pro1-balance")) return;

const box=document.createElement("section");
box.id="elab-v1pro1-balance";
box.innerHTML=`
<strong>v1 PRO.1 — Feature + Security Balance</strong>
<div style="font-size:11px;opacity:.68;margin-top:3px">Owner view • next-phase planning</div>
<div class="elab-v1pro1-grid" id="elab-v1pro1-grid"></div>
<div class="elab-v1pro1-note">
Security foundation is already defined, but real backend authentication and protected APIs
are still required for production. Feature development can proceed in parallel as long as
privileged/admin functions remain protected and security gates are not bypassed.
</div>`;
panel.appendChild(box);

const items=[
 ["SEC-01","Security foundation","DEFINED","Architecture and client-side guardrails are in place."],
 ["SEC-02","Production auth","REQUIRED","Real backend authentication is still needed."],
 ["SEC-03","Protected APIs","REQUIRED","Admin APIs must enforce authorization server-side."],
 ["SEC-04","Security tests","REQUIRED","Automated backend security tests remain a release gate."],
 ["FEAT-01","Assistant UX","NEXT","Make assistant interaction compact and mobile-friendly."],
 ["FEAT-02","Circuit intelligence","NEXT","Improve circuit-aware simulation and waveform behavior."],
 ["FEAT-03","Learning","NEXT","Add guided learning and explanations."],
 ["FEAT-04","Simulation","NEXT","Improve validation and simulation feedback."],
 ["FEAT-05","Mobile","NEXT","Optimize layout and controls for small screens."]
];

const grid=box.querySelector("#elab-v1pro1-grid");
items.forEach(x=>{
 const el=document.createElement("div"); el.className="elab-v1pro1-item";
 const b=document.createElement("b"); b.textContent=`${x[0]} • ${x[1]}`;
 const s=document.createElement("div"); s.className="elab-v1pro1-state"; s.textContent=x[2];
 const d=document.createElement("div"); d.textContent=x[3]; d.style.marginTop="4px"; d.style.opacity=".7";
 el.append(b,s,d); grid.appendChild(el);
});
})();
