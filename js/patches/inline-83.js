
(function(){
  document.addEventListener("DOMContentLoaded",function(){
    if(!window.NilSparkLabAdvancedProperties || document.getElementById("elab-v571-launch"))return;
    var anchor=document.getElementById("elab-v570-launch")||
      document.getElementById("elab-v568-launch")||
      document.querySelector("[id*='launch']");
    if(!anchor)return;
    var b=document.createElement("button");
    b.id="elab-v571-launch";b.type="button";b.textContent="⚙ Properties";
    b.style.cssText="margin-left:6px;padding:8px 12px;border-radius:9px;border:1px solid rgba(34,211,238,.3);background:#0f172a;color:#67e8f9;font-size:12px;";
    b.onclick=function(){
      var cs=window.builderCanvasComps;
      if(Array.isArray(cs)&&cs.length) window.NilSparkLabAdvancedProperties.open(cs[0].id);
      else if(window.elabV575Toast) elabV575Toast("Add a component first, then open Properties."); else NilSparkLabDialog.alert("Add a component first, then open Properties.",{title:"No Component"});
    };
    anchor.parentElement.appendChild(b);
  });
})();
