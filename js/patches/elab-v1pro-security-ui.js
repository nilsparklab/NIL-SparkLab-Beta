
(() => {
"use strict";
const panel=document.getElementById("elab-v86-security-card");
if(!panel || document.getElementById("elab-v1pro-security")) return;

const box=document.createElement("section");
box.id="elab-v1pro-security";
box.innerHTML=`
<strong>NIL SparkLab v11.0 — Security Foundation</strong>
<div style="font-size:11px;opacity:.68;margin-top:3px">Consolidated owner view • architecture → implementation gate</div>
<div class="elab-v1pro-grid" id="elab-v1pro-grid"></div>
<div class="elab-v1pro-note">
v1 PRO consolidates the existing security architecture. It does not claim that
backend authentication is already implemented. Normal users remain anonymous;
Admin Login is exposed only after an explicit assistant request.
</div>`;
panel.appendChild(box);

const items=[
 ["PRO-01","User access","PASS","Anonymous use remains the default."],
 ["PRO-02","Admin trigger","PASS","Admin Login requires an explicit assistant request."],
 ["PRO-03","Client password handling","PASS","No production password storage/comparison in the frontend."],
 ["PRO-04","Server authorization","REQUIRED","Admin privileges must be enforced server-side."],
 ["PRO-05","Password hashing","REQUIRED","Implement secure password hashing in the backend."],
 ["PRO-06","Sessions","REQUIRED","Implement secure, expiring and revocable sessions."],
 ["PRO-07","RBAC","REQUIRED","Protect every privileged operation with server-side role checks."],
 ["PRO-08","Abuse protection","REQUIRED","Add login/API rate limiting and cooldowns."],
 ["PRO-09","Audit logging","REQUIRED","Record security-relevant events with privacy-aware retention."],
 ["PRO-10","Security testing","REQUIRED","Run automated auth, authorization and regression tests."]
];

const grid=box.querySelector("#elab-v1pro-grid");
items.forEach(x=>{
 const el=document.createElement("div"); el.className="elab-v1pro-item";
 const b=document.createElement("b"); b.textContent=`${x[0]} • ${x[1]}`;
 const s=document.createElement("div"); s.className="elab-v1pro-state"; s.textContent=x[2];
 const d=document.createElement("div"); d.textContent=x[3]; d.style.marginTop="4px"; d.style.opacity=".7";
 el.append(b,s,d); grid.appendChild(el);
});
})();
