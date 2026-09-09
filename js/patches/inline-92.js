
(function(){
"use strict";
var KEY="NilSparkLab_v5_74_lab_records", idx=0;
var experiments=[
  "Ohm's Law","Series Circuit","Parallel Circuit","LED Current-Limited Circuit",
  "Diode Test","RC Charging","DC Motor Drive"
];
var records=load();

function load(){
  try{var x=JSON.parse(localStorage.getItem(KEY)||"{}");return x&&typeof x==="object"?x:{};}catch(e){return{};}
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(records));return true;}catch(e){return false;}}
function current(){return records[experiments[idx]]||(records[experiments[idx]]={status:"not_started",score:0,observation:"",conclusion:"",updatedAt:null});}
function el(id){return document.getElementById(id);}
function renderList(){
  var h=el("elab-v574-list");if(!h)return;
  h.innerHTML=experiments.map(function(n,i){
    var r=records[n], mark=r&&r.status==="completed"?"✓ ":r&&r.status==="in_progress"?"• ":"";
    return '<button class="exp '+(i===idx?"active":"")+'" data-v574-exp="'+i+'">'+mark+n+'</button>';
  }).join("");
}
function renderStats(){
  var done=experiments.filter(function(n){return records[n]&&records[n].status==="completed";}).length;
  var times=experiments.map(function(n){return records[n]&&records[n].updatedAt?new Date(records[n].updatedAt).getTime():0;});
  var last=Math.max.apply(Math,times);
  el("elab-v574-total").textContent=experiments.length;
  el("elab-v574-done").textContent=done;
  el("elab-v574-progress").textContent=Math.round(done/experiments.length*100)+"%";
  el("elab-v574-last").textContent=last?new Date(last).toLocaleDateString():"—";
}
function render(){
  var r=current();
  el("elab-v574-exp-name").textContent=experiments[idx];
  el("elab-v574-status").value=r.status||"not_started";
  el("elab-v574-score").value=Number.isFinite(Number(r.score))?r.score:0;
  el("elab-v574-observation").value=r.observation||"";
  el("elab-v574-conclusion").value=r.conclusion||"";
  renderList();renderStats();
}
function saveCurrent(completed){
  var r=current(), score=Math.max(0,Math.min(100,Number(el("elab-v574-score").value)||0));
  r.status=completed?"completed":el("elab-v574-status").value;
  r.score=score;r.observation=el("elab-v574-observation").value;
  r.conclusion=el("elab-v574-conclusion").value;r.updatedAt=new Date().toISOString();
  if(!save()){el("elab-v574-msg").textContent="Storage unavailable; record could not be saved.";return;}
  document.documentElement.dataset.unsaved="true";
  el("elab-v574-msg").innerHTML='<span class="ok">✓ Record saved locally.</span>';
  render();
}
function exportRecords(){
  var payload={version:"5.74",student:el("elab-v574-student").value,records:records,exportedAt:new Date().toISOString()};
  var blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  var url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="NilSparkLab_Lab_Records.json";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  el("elab-v574-msg").innerHTML='<span class="ok">✓ Lab records exported.</span>';
}
function clearCurrent(){
  records[experiments[idx]]={status:"not_started",score:0,observation:"",conclusion:"",updatedAt:null};
  save();render();el("elab-v574-msg").textContent="Record cleared.";
}
function open(){var p=el("elab-v574-records");p.classList.add("open");p.setAttribute("aria-hidden","false");render();}
function close(){var p=el("elab-v574-records");p.classList.remove("open");p.setAttribute("aria-hidden","true");}
window.NilSparkLabLabRecords={open:open,close:close,refresh:render};
document.addEventListener("click",function(e){
  if(e.target.id==="elab-v574-close")close();
  var b=e.target.closest("[data-v574-exp]");if(b){idx=Number(b.dataset.v574Exp)||0;render();}
  if(e.target.id==="elab-v574-save")saveCurrent(false);
  if(e.target.id==="elab-v574-mark")saveCurrent(true);
  if(e.target.id==="elab-v574-clear")clearCurrent();
  if(e.target.id==="elab-v574-export")exportRecords();
});
})();
