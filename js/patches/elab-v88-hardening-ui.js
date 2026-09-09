
(() => {
"use strict";
const panel=document.getElementById("elab-v86-security-card");
if(!panel || document.getElementById("elab-v88-hardening")) return;

const box=document.createElement("section");
box.id="elab-v88-hardening";
box.innerHTML=`
<strong>Production Security Hardening</strong>
<div style="font-size:11px;opacity:.68;margin-top:3px">Owner view • architecture readiness checks</div>
<div class="elab-v88-grid" id="elab-v88-grid"></div>
<div class="elab-v88-note">
Client-side checks cannot replace server-side security. Anonymous user access remains supported;
owner/admin authorization, rate limiting, validation and audit logging belong behind the API boundary.
</div>`;
panel.appendChild(box);

const grid=box.querySelector("#elab-v88-grid");
const report=window.NilSparkLabProductionHardening?.run?.();
(report?.results||[]).forEach(x=>{
 const item=document.createElement("div"); item.className="elab-v88-item";
 const b=document.createElement("b"); b.textContent=`${x.id} • ${x.name}`;
 const s=document.createElement("div"); s.className="elab-v88-state"; s.textContent=x.state;
 const d=document.createElement("div"); d.textContent=x.detail; d.style.marginTop="4px"; d.style.opacity=".7";
 item.append(b,s,d); grid.appendChild(item);
});
})();
