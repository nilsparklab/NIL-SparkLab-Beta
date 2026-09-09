
(() => {
"use strict";
const panel=document.getElementById("elab-v86-security-card");
if(!panel || document.getElementById("elab-v89-architecture")) return;

const box=document.createElement("section");
box.id="elab-v89-architecture";
box.innerHTML=`
<strong>Security Architecture Boundary</strong>
<div style="font-size:11px;opacity:.68;margin-top:3px">Owner view • v8.9 architecture controls</div>
<div class="elab-v89-grid" id="elab-v89-grid"></div>`;
panel.appendChild(box);

const grid=box.querySelector("#elab-v89-grid");
const report=window.NilSparkLabSecurityArchitecture?.run?.();
(report?.controls||[]).forEach(x=>{
 const item=document.createElement("div"); item.className="elab-v89-item";
 const b=document.createElement("b"); b.textContent=`${x.id} • ${x.name}`;
 const s=document.createElement("div"); s.className="elab-v89-state"; s.textContent=x.state;
 const d=document.createElement("div"); d.textContent=x.detail; d.style.marginTop="4px"; d.style.opacity=".7";
 item.append(b,s,d); grid.appendChild(item);
});
})();
