
(function(){
document.addEventListener("DOMContentLoaded",function(){
  if(!window.NilSparkLabWaveformAnalysis||document.getElementById("elab-v573-launch"))return;
  var anchor=document.getElementById("elab-v572-launch")||document.getElementById("elab-v571-launch")||document.querySelector("[id*='launch']");
  if(!anchor)return;
  var b=document.createElement("button");
  b.id="elab-v573-launch";b.type="button";b.textContent="📈 Waveform";
  b.style.cssText="margin-left:6px;padding:8px 12px;border-radius:9px;border:1px solid rgba(34,211,238,.3);background:#0f172a;color:#67e8f9;font-size:12px;";
  b.onclick=function(){window.NilSparkLabWaveformAnalysis.open();};
  anchor.parentElement.appendChild(b);
});
})();
