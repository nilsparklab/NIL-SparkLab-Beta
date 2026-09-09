
(function(){
  "use strict";
  var KEY="NilSparkLab_v5_70_projects";
  var autosave=true, timer=null, lastHash="";
  var root=document.getElementById("elab-v570-projects");
  var grid=document.getElementById("elab-v570-grid");
  var nameInput=document.getElementById("elab-v570-name");
  var status=document.getElementById("elab-v570-status");

  function read(){
    try{
      var raw=localStorage.getItem(KEY);
      var x=raw?JSON.parse(raw):[];
      return Array.isArray(x)?x:[];
    }catch(e){return[];}
  }
  function write(list){
    try{localStorage.setItem(KEY,JSON.stringify(list));return true;}
    catch(e){setStatus("Storage unavailable. Project exists only for this session.","warn");return false;}
  }
  function setStatus(t,kind){
    if(status)status.className="pm-status "+(kind||"");
    if(status)status.textContent=t;
  }
  function api(){
    return window.NilSparkLabProjectCore||null;
  }
  function current(){
    var a=api();
    if(!a||typeof a.collect!=="function")return null;
    try{return a.collect();}catch(e){return null;}
  }
  function hash(x){
    try{return JSON.stringify({name:x.name,circuit:x.circuit,simulation:x.simulation});}
    catch(e){return String(Date.now());}
  }
  function saveCurrent(name){
    var data=current();
    if(!data){setStatus("Project engine is not ready.","warn");return false;}
    data.name=(name||data.name||"Untitled Circuit").trim()||"Untitled Circuit";
    data.managerVersion="5.70";
    data.savedAt=new Date().toISOString();
    var list=read();
    var existing=list.findIndex(function(p){return p.id===data.id;});
    if(existing<0){
      data.id="p_"+Date.now()+"_"+Math.floor(Math.random()*10000);
      list.unshift(data);
    }else{
      data.id=list[existing].id;
      list[existing]=data;
    }
    // Keep the dashboard bounded.
    if(list.length>25)list=list.slice(0,25);
    if(!write(list))return false;
    nameInput.value=data.name;
    document.documentElement.dataset.unsaved="false";
    lastHash=hash(data);
    render();
    setStatus("✓ Saved: "+data.name,"ok");
    return true;
  }
  function loadProject(id){
    var p=read().find(function(x){return x.id===id;});
    if(!p){setStatus("Project not found.","warn");return;}
    var a=api();
    if(!a||typeof a.load!=="function"){setStatus("Project engine is not ready.","warn");return;}
    function proceed(){
      try{
        a.load(p);
        nameInput.value=p.name||"Untitled Circuit";
        lastHash=hash(p);
        setStatus("✓ Loaded: "+(p.name||"Untitled Circuit"),"ok");
        render();
      }catch(e){setStatus("Could not load project.","danger");}
    }
    if(document.documentElement.dataset.unsaved==="true")
      NilSparkLabDialog.confirm("Current project has unsaved changes. Load this project anyway?", {title:"Load Project?", okText:"LOAD", danger:true}).then(function(ok){if(ok)proceed();});
    else proceed();
  }
  function duplicateProject(id){
    var p=read().find(function(x){return x.id===id;});
    if(!p)return;
    var copy=JSON.parse(JSON.stringify(p));
    copy.id="p_"+Date.now()+"_"+Math.floor(Math.random()*10000);
    copy.name=(p.name||"Untitled Circuit")+" Copy";
    copy.savedAt=new Date().toISOString();
    var list=read();list.unshift(copy);if(list.length>25)list=list.slice(0,25);
    write(list);render();setStatus("✓ Project duplicated.","ok");
  }
  function deleteProject(id){
    var p=read().find(function(x){return x.id===id;});
    if(!p)return;
    NilSparkLabDialog.confirm('Delete "'+(p.name||"Untitled Circuit")+'"?', {title:"Delete Project?", okText:"DELETE", danger:true}).then(function(ok){
      if(!ok)return;
      write(read().filter(function(x){return x.id!==id;}));
      render();setStatus("Project deleted.","ok");
    });
  }
  function renameProject(id){
    var p=read().find(function(x){return x.id===id;});
    if(!p)return;
    NilSparkLabDialog.prompt("New project name:", p.name||"Untitled Circuit", {title:"Rename Project", okText:"SAVE", inputLabel:"Project name"}).then(function(n){
      if(n===null)return;
      n=String(n).trim();if(!n)return;
      p.name=n;p.savedAt=new Date().toISOString();
      var list=read().map(function(x){return x.id===id?p:x;});
      write(list);render();setStatus("✓ Project renamed.","ok");
    });
  }
  function exportProject(id){
    var p=id?read().find(function(x){return x.id===id;}):current();
    if(!p){setStatus("Nothing to export.","warn");return;}
    var filename=(p.name||"NilSparkLab-Circuit").replace(/[^\w\-]+/g,"_")+".nilsparklab.json";
    var blob=new Blob([JSON.stringify(p,null,2)],{type:"application/json"});
    var url=URL.createObjectURL(blob), a=document.createElement("a");
    a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
    setStatus("✓ Exported: "+filename,"ok");
  }
  function importProject(file){
    if(!file)return;
    var reader=new FileReader();
    reader.onload=function(){
      try{
        var p=JSON.parse(reader.result);
        var validator=window.NilSparkLabSecurity && window.NilSparkLabSecurity.validateProject;
        if(typeof validator!=="function") throw new Error("Canonical project validator unavailable");
        var checked=validator(p);
        if(!checked || !checked.ok) throw new Error(checked && checked.error || "Invalid project");
        p=checked.value;
        p.id="p_"+Date.now()+"_"+Math.floor(Math.random()*10000);
        p.name=String(p.name||"Imported Circuit");
        p.managerVersion="5.70";
        p.savedAt=new Date().toISOString();
        var list=read();list.unshift(p);if(list.length>25)list=list.slice(0,25);
        write(list);render();setStatus("✓ Imported: "+p.name,"ok");
      }catch(e){setStatus("Invalid NIL SparkLab project file.","danger");}
    };
    reader.readAsText(file);
  }
  function render(){
    if(!grid)return;
    var list=read();
    if(!list.length){
      grid.innerHTML='<div class="empty">No saved projects yet.<br>Build a circuit and press <b>Save</b>.</div>';
      return;
    }
    grid.innerHTML="";
    var currentName=nameInput.value.trim();
    list.forEach(function(p){
      var d=document.createElement("div");
      d.className="pm-card"+(p.name===currentName?" current":"");
      var count=p.circuit&&Array.isArray(p.circuit.components)?p.circuit.components.length:0;
      var wires=p.circuit&&Array.isArray(p.circuit.wires)?p.circuit.wires.length:0;
      var when=p.savedAt?new Date(p.savedAt).toLocaleString():"Unknown";
      d.innerHTML=
        '<div class="pm-name">'+escapeHtml(p.name||"Untitled Circuit")+'</div>'+
        '<div class="pm-meta">Components: '+count+' · Wires: '+wires+'<br>Modified: '+escapeHtml(when)+'</div>'+
        '<div class="pm-actions">'+
        '<button data-load="'+p.id+'">▶ Open</button>'+
        '<button data-rename="'+p.id+'">✎ Rename</button>'+
        '<button data-duplicate="'+p.id+'">⧉ Duplicate</button>'+
        '<button data-export="'+p.id+'">⬇ Export</button>'+
        '<button data-delete="'+p.id+'">🗑 Delete</button></div>';
      grid.appendChild(d);
    });
  }
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});
  }
  function open(){
    root.classList.add("open");root.setAttribute("aria-hidden","false");render();
  }
  function close(){root.classList.remove("open");root.setAttribute("aria-hidden","true");}
  function autosaveTick(){
    if(!autosave||document.documentElement.dataset.unsaved!=="true")return;
    var d=current();if(!d)return;
    var h=hash(d);
    if(h!==lastHash){
      saveCurrent(nameInput.value||d.name);
      lastHash=h;
    }
  }

  window.NilSparkLabProjectManager2={open:open,close:close,save:saveCurrent,refresh:render};

  document.addEventListener("click",function(e){
    if(e.target.id==="elab-v570-close")close();
    if(e.target.id==="elab-v570-save")saveCurrent(nameInput.value);
    if(e.target.id==="elab-v570-new"){
      var a=api();
      function startNew(){if(a&&a.newProject){a.newProject();nameInput.value="Untitled Circuit";lastHash="";setStatus("New project ready.","ok");render();}}
      if(a&&document.documentElement.dataset.unsaved==="true")
        NilSparkLabDialog.confirm("Current project has unsaved changes. Start a new project?", {title:"Start New Project?", okText:"START NEW", danger:true}).then(function(ok){if(ok)startNew();});
      else startNew();
    }
    if(e.target.id==="elab-v570-refresh")render();
    if(e.target.id==="elab-v570-export-current")exportProject();
    if(e.target.id==="elab-v570-import")document.getElementById("elab-v570-file").click();
    if(e.target.id==="elab-v570-autosave"){
      autosave=!autosave;
      e.target.textContent="⚙ Auto-save: "+(autosave?"ON":"OFF");
      setStatus("Auto-save "+(autosave?"enabled.":"disabled."),"ok");
    }
    var b=e.target.closest("[data-load]");if(b)loadProject(b.dataset.load);
    b=e.target.closest("[data-rename]");if(b)renameProject(b.dataset.rename);
    b=e.target.closest("[data-duplicate]");if(b)duplicateProject(b.dataset.duplicate);
    b=e.target.closest("[data-export]");if(b)exportProject(b.dataset.export);
    b=e.target.closest("[data-delete]");if(b)deleteProject(b.dataset.delete);
  });
  document.getElementById("elab-v570-file")?.addEventListener("change",function(e){
    if(e.target.files[0])importProject(e.target.files[0]);
    e.target.value="";
  });
  document.addEventListener("DOMContentLoaded",function(){
    render();
    timer=setInterval(autosaveTick,15000);
  });
})();
