
(() => {
"use strict";
const panel=document.getElementById("elab-v86-security-card");
if(!panel || document.getElementById("elab-v1pro3-simulation")) return;

const box=document.createElement("section");
box.id="elab-v1pro3-simulation";
box.innerHTML=`
<strong>v1 PRO.3 — Smart Simulation Engine</strong>
<div style="font-size:11px;opacity:.68;margin-top:3px">Simulation layer • validation + analysis contract</div>
<div class="elab-v1pro3-grid" id="elab-v1pro3-grid"></div>
<div class="elab-v1pro3-note">
The engine adds validation and analysis helpers without silently replacing the existing
simulator. AC/DC behavior is source-aware, and circuit limits help prevent runaway inputs.
</div>`;
panel.appendChild(box);

const items=[
 ["SIM-01","Topology validation","READY","Checks circuit structure before analysis."],
 ["SIM-02","Component validation","READY","Validates supported component types."],
 ["SIM-03","DC analysis","READY","Provides basic voltage/current/power helpers."],
 ["SIM-04","AC waveform","READY","Provides sinusoidal time-domain sampling."],
 ["SIM-05","Safety limits","READY","Limits component and connection counts."],
 ["SIM-06","Error handling","READY","Invalid circuits return structured issues."],
 ["SIM-07","Existing simulator","PRESERVED","Existing simulation behavior is not automatically replaced."],
 ["AI-01","Assistant explanation","READY","Analysis results can be passed to the assistant."],
 ["SEC-01","Anonymous mode","PASS","Normal users remain login-free."],
 ["SEC-02","Admin authorization","SERVER REQUIRED","Privileged access remains server-authoritative."]
];

const grid=box.querySelector("#elab-v1pro3-grid");
items.forEach(x=>{
 const el=document.createElement("div"); el.className="elab-v1pro3-item";
 const b=document.createElement("b"); b.textContent=`${x[0]} • ${x[1]}`;
 const s=document.createElement("div"); s.className="elab-v1pro3-state"; s.textContent=x[2];
 const d=document.createElement("div"); d.textContent=x[3]; d.style.marginTop="4px"; d.style.opacity=".7";
 el.append(b,s,d); grid.appendChild(el);
});
})();
