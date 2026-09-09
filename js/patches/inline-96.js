
(function(){
document.addEventListener("DOMContentLoaded",function(){
  if(document.getElementById("elab-v575-launch"))return;
  var anchor=document.getElementById("elab-v574-launch")||
    document.getElementById("elab-v573-launch")||
    document.querySelector("[id*='launch']");
  if(!anchor)return;
  var b=document.createElement("button");
  b.id="elab-v575-launch";b.type="button";b.textContent="✓ Final Audit";
  b.style.cssText="margin-left:6px;padding:8px 12px;border-radius:9px;border:1px solid rgba(34,211,238,.3);background:#0f172a;color:#67e8f9;font-size:12px;";
  b.onclick=function(){
    var a=window.NilSparkLabFinalAudit&&window.NilSparkLabFinalAudit.run();
    if(a){
      var missing=[];
      Object.keys(a.checks).forEach(function(k){if(!a.checks[k])missing.push(k);});
      if(window.elabV575Toast){
        window.elabV575Toast("Final audit: "+a.passed+"/"+a.total+" modules"+(missing.length?" · Missing: "+missing.join(", "):" · All modules ready"));
      }else{
        console.log("NilSparkLab Final Audit",a);
      }
    }
  };
  anchor.parentElement.appendChild(b);
});
})();
