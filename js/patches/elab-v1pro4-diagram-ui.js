
(() => {
"use strict";
const panel=document.getElementById("elab-v86-security-card");
if(!panel || document.getElementById("elab-v1pro4-diagrams")) return;

const box=document.createElement("section");
box.id="elab-v1pro4-diagrams";
box.innerHTML=`
<strong>v1 PRO.4 — Assistant Diagram Teacher</strong>
<div style="font-size:11px;opacity:.68;margin-top:3px">Natural-language diagram request layer</div>
<div class="elab-v1pro4-grid" id="elab-v1pro4-grid"></div>
<div class="elab-v1pro4-note">
The assistant can detect requests such as “KVL diagram”, “KCL diagram”,
“circuit diagram”, “working diagram” or “transfer diagram” and request a
structured visual. Diagrams are intended to be paired with labels and explanation.
</div>`;
panel.appendChild(box);

const items=[
 ["DIA-01","Circuit diagram","READY","Generate a labeled circuit/schematic visual."],
 ["DIA-02","KVL diagram","READY","Show a loop, voltage polarities and KVL relation."],
 ["DIA-03","KCL diagram","READY","Show a node, current directions and KCL relation."],
 ["DIA-04","Working diagram","READY","Show operating principle step-by-step."],
 ["DIA-05","Transfer diagram","READY","Show input → transfer mechanism → output."],
 ["DIA-06","Waveform diagram","READY","Show source-aware AC/DC waveform concepts."],
 ["DIA-07","Assistant explanation","READY","Pair diagrams with concise working/explanation."],
 ["DIA-08","Safe renderer","READY","Render only sanitized diagram labels/specifications."],
 ["SEC-01","Anonymous mode","PASS","Normal users remain login-free."],
 ["SEC-02","Admin authorization","SERVER REQUIRED","Diagram features do not bypass admin security."]
];

const grid=box.querySelector("#elab-v1pro4-grid");
items.forEach(x=>{
 const el=document.createElement("div"); el.className="elab-v1pro4-item";
 const b=document.createElement("b"); b.textContent=`${x[0]} • ${x[1]}`;
 const s=document.createElement("div"); s.className="elab-v1pro4-state"; s.textContent=x[2];
 const d=document.createElement("div"); d.textContent=x[3]; d.style.marginTop="4px"; d.style.opacity=".7";
 el.append(b,s,d); grid.appendChild(el);
});
})();
