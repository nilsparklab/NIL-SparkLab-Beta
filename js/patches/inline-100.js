
(function(){
"use strict";
function openProject(){
 var e=document.getElementById("elab-v528-projects");
 if(!e)return;
 e.style.display="flex";e.classList.add("open");e.setAttribute("aria-hidden","false");
}
function closeProject(){
 var e=document.getElementById("elab-v528-projects");
 if(!e)return;
 e.classList.remove("open");e.style.display="none";e.setAttribute("aria-hidden","true");
}
window.elabOpenProjectSystem=openProject;
window.elabProjectMenuOpen=function(action){
 try{
  var st=document.getElementById("elab-v528-project-status");
  var core=window.NilSparkLabProjectCore;
  var pm=window.NilSparkLabProjectManager2;
  if(action==="manage"){if(pm&&pm.open){pm.open();return}}
  if(action==="save"){if(core&&core.save){core.save();if(st)st.textContent="Project saved locally.";return}}
  if(action==="load"){if(core&&core.load){st&&(st.textContent=core.load()?"Project loaded.":"No saved project found.");return}}
  if(action==="new" && core&&core.newProject){
    function startNew(){core.newProject();if(st)st.textContent="New project ready.";}
    if(document.documentElement.dataset.unsaved==="true")
      NilSparkLabDialog.confirm("You have unsaved changes. Start a new project?", {title:"Start New Project?", okText:"START NEW", danger:true}).then(function(ok){if(ok)startNew();});
    else startNew();
    return;
  }
  if(action==="export"){if(core&&core.exportProject){core.exportProject();if(st)st.textContent="Project exported.";return}}
  if(action==="import"){
    var file=document.getElementById("elab-v528-file");
    if(file){file.value="";file.click();if(st)st.textContent="Choose a NIL SparkLab project file.";return}
  }
  if(st)st.textContent="Project engine is not ready yet.";
 }catch(e){console.warn("Project menu error:",e)}
}
document.addEventListener("change",function(e){
 if(e.target&&e.target.id==="elab-v528-file"&&e.target.files&&e.target.files[0]){
  if(window.NilSparkLabProjectCore&&window.NilSparkLabProjectCore.importProject)
    window.NilSparkLabProjectCore.importProject(e.target.files[0]);
 }
});
document.addEventListener("DOMContentLoaded",function(){
 var c=document.getElementById("elab-v528-close");
 if(c)c.addEventListener("click",closeProject);
 var root=document.getElementById("elab-v528-projects");
 if(root)root.addEventListener("click",function(e){if(e.target===root)closeProject()});
 document.addEventListener("keydown",function(e){if(e.key==="Escape")closeProject()});
});
})();
