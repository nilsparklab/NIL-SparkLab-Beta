
(function(){
  document.addEventListener("DOMContentLoaded",function(){
    var root=document.getElementById("builder-canvas");
    if(!root)return;
    var obs=new MutationObserver(function(){
      root.querySelectorAll(".canvas-comp-card").forEach(function(card){
        if(card.querySelector("[data-v571-edit]"))return;
        var id=card.id;
        if(!id)return;
        var b=document.createElement("button");
        b.type="button";b.textContent="⚙";
        b.title="Edit component properties";
        b.setAttribute("data-v571-edit",id);
        b.style.cssText="position:absolute;right:4px;top:4px;z-index:40;width:24px;height:24px;border-radius:7px;border:1px solid rgba(34,211,238,.35);background:#0f172a;color:#67e8f9;font-size:12px;cursor:pointer;";
        b.addEventListener("mousedown",function(e){e.stopPropagation();});
        b.addEventListener("pointerdown",function(e){e.stopPropagation();});
        card.appendChild(b);
      });
    });
    obs.observe(root,{childList:true,subtree:true});
  });
})();
