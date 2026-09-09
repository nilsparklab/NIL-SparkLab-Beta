
(() => {
"use strict";
const panel=document.getElementById("elab-v86-security-card");
if(!panel || document.getElementById("elab-v1pro5-visuals")) return;

const box=document.createElement("section");
box.id="elab-v1pro5-visuals";
box.innerHTML=`
<strong>v1 PRO.5 — Interactive Engineering Visuals</strong>
<div style="font-size:11px;opacity:.68;margin-top:3px">Interactive diagram capability layer</div>
<div class="elab-v1pro5-grid" id="elab-v1pro5-grid"></div>
<div class="elab-v1pro5-note">
Diagrams can become interactive teaching tools: zoom/pan, select components,
highlight KVL/KCL paths, adjust waveform settings, and hand a validated visual
spec to the Builder/Simulator. Existing Builder behavior is preserved until integration.
</div>`;
panel.appendChild(box);

const items=[
 ["VIS-01","Zoom / pan","READY","Mobile-friendly diagram navigation."],
 ["VIS-02","Component selection","READY","Select a component to request its explanation."],
 ["VIS-03","KVL highlighting","READY","Highlight the selected loop and voltage directions."],
 ["VIS-04","KCL highlighting","READY","Highlight node and current directions."],
 ["VIS-05","Waveform controls","READY","AC amplitude/frequency/phase; DC steady level."],
 ["VIS-06","Build this circuit","READY","Diagram can provide a Builder handoff action."],
 ["VIS-07","Simulate this circuit","READY","Diagram can provide a Simulator handoff action."],
 ["VIS-08","Explain","READY","Assistant can explain the selected visual element."],
 ["SEC-01","Anonymous mode","PASS","Normal users remain login-free."],
 ["SEC-02","Admin authorization","SERVER REQUIRED","Visual features do not bypass Admin security."]
];

const grid=box.querySelector("#elab-v1pro5-grid");
items.forEach(x=>{
 const el=document.createElement("div"); el.className="elab-v1pro5-item";
 const b=document.createElement("b"); b.textContent=`${x[0]} • ${x[1]}`;
 const s=document.createElement("div"); s.className="elab-v1pro5-state"; s.textContent=x[2];
 const d=document.createElement("div"); d.textContent=x[3]; d.style.marginTop="4px"; d.style.opacity=".7";
 el.append(b,s,d); grid.appendChild(el);
});
})();
