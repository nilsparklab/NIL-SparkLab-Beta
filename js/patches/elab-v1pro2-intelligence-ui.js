
(() => {
"use strict";
const panel=document.getElementById("elab-v86-security-card");
if(!panel || document.getElementById("elab-v1pro2-intelligence")) return;

const box=document.createElement("section");
box.id="elab-v1pro2-intelligence";
box.innerHTML=`
<strong>v1 PRO.2 — Assistant + Circuit Intelligence</strong>
<div style="font-size:11px;opacity:.68;margin-top:3px">Feature layer • security gates preserved</div>
<div class="elab-v1pro2-grid" id="elab-v1pro2-grid"></div>
<div class="elab-v1pro2-note">
This feature layer keeps anonymous user access and server-authoritative Admin security.
Circuit intelligence is source-aware: AC and DC use different waveform policies.
</div>`;
panel.appendChild(box);

const items=[
 ["AI-01","Assistant UX","READY","Compact/mobile-first assistant architecture."],
 ["AI-02","Admin trigger","LOCKED RULE","Admin Login requires an explicit assistant request."],
 ["CIR-01","Source modes","READY","AC and DC are explicit source modes."],
 ["CIR-02","Waveform policy","READY","Waveform behavior is selected from the source mode."],
 ["CIR-03","Circuit validation","READY","Circuit structure is validated before simulation."],
 ["CIR-04","Assistant explanation","READY","Simulation/circuit results can be explained by the assistant."],
 ["SIM-01","Run validation","READY","Simulation should validate the circuit before execution."],
 ["SIM-02","Reset","READY","Simulation reset remains a supported operation."],
 ["SEC-01","Anonymous mode","PASS","Normal users do not need login."],
 ["SEC-02","Admin authorization","SERVER REQUIRED","Privileged access remains backend-authoritative."]
];

const grid=box.querySelector("#elab-v1pro2-grid");
items.forEach(x=>{
 const el=document.createElement("div"); el.className="elab-v1pro2-item";
 const b=document.createElement("b"); b.textContent=`${x[0]} • ${x[1]}`;
 const s=document.createElement("div"); s.className="elab-v1pro2-state"; s.textContent=x[2];
 const d=document.createElement("div"); d.textContent=x[3]; d.style.marginTop="4px"; d.style.opacity=".7";
 el.append(b,s,d); grid.appendChild(el);
});
})();
