
(function(){
document.addEventListener("DOMContentLoaded",function(){
  if(!window.NilSparkLabLabRecords||document.getElementById("elab-v574-launch"))return;
  var anchor=document.getElementById("elab-v573-launch")||document.getElementById("elab-v572-launch")||document.querySelector("[id*='launch']");
  if(!anchor)return;
  var b=document.createElement("button");
  b.id="elab-v574-launch";b.type="button";b.textContent="🎓 Records";
  b.style.cssText="margin-left:6px;padding:8px 12px;border-radius:9px;border:1px solid rgba(34,211,238,.3);background:#0f172a;color:#67e8f9;font-size:12px;";
  b.onclick=function(){window.NilSparkLabLabRecords.open();};
  anchor.parentElement.appendChild(b);
});
})();
