
(function(){
  "use strict";
  var root=document.getElementById("elab-v571-props");
  var fields=document.getElementById("elab-v571-fields");
  var selected=document.getElementById("elab-v571-selected");
  var status=document.getElementById("elab-v571-status");
  var activeId=null, snapshot=null;

  function comps(){
    try{return Array.isArray(window.builderCanvasComps)?window.builderCanvasComps:[];}
    catch(e){return[];}
  }
  function find(id){return comps().find(function(c){return c.id===id;})||null;}
  function setStatus(t,k){status.className="cp-status "+(k||"");status.textContent=t;}
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}

  function schema(c){
    var t=c.type||"component";
    var base=[
      ["name","Name","text",c.name||t],
      ["rotation","Rotation (°)","number",Number(c.rotation)||0]
    ];
    if(["source","battery"].indexOf(t)>=0)
      base.push(["v","Voltage (V)","number",c.v==null?5:c.v]);
    if(["resistor","rheostat","potentiometer"].indexOf(t)>=0){
      base.push(["r","Resistance (Ω)","number",c.r==null?100:c.r]);
      if(c.maxR!=null)base.push(["maxR","Maximum Resistance (Ω)","number",c.maxR]);
    }
    if(["capacitor"].indexOf(t)>=0)
      base.push(["capacitance","Capacitance (µF)","number",c.capacitance==null?10:c.capacitance]);
    if(["inductor"].indexOf(t)>=0)
      base.push(["inductance","Inductance (mH)","number",c.inductance==null?10:c.inductance]);
    if(["led","diode","zener_diode"].indexOf(t)>=0)
      base.push(["vf","Forward Voltage (V)","number",c.vf==null?2:c.vf]);
    if(["motor","lamp"].indexOf(t)>=0)
      base.push(["power","Rated Power (W)","number",c.power==null?10:c.power]);
    if(t==="switch")
      base.push(["closed","Switch State","select",c.closed?"1":"0"]);
    if(t==="logic_input")
      base.push(["state","Logic State","select",c.state?"1":"0"]);
    if(c.color!=null)base.push(["color","Wire / Display Color","text",c.color]);
    return base;
  }

  function render(){
    var c=find(activeId);
    fields.innerHTML="";
    if(!c){
      selected.textContent="Select a component to edit its properties.";
      setStatus("No component selected.","warn");
      return;
    }
    selected.textContent=(c.name||c.type||"Component")+" · "+c.type;
    schema(c).forEach(function(f){
      var wrap=document.createElement("div");
      wrap.className="cp-field";
      var label=document.createElement("label");label.textContent=f[1];
      var input;
      if(f[2]==="select"){
        input=document.createElement("select");
        input.innerHTML='<option value="0">OFF / Open</option><option value="1">ON / Closed</option>';
        input.value=String(f[3]);
      }else{
        input=document.createElement("input");
        input.type=f[2];input.value=f[3];
        if(f[2]==="number")input.step="any";
      }
      input.dataset.key=f[0];input.dataset.type=f[2];
      wrap.appendChild(label);wrap.appendChild(input);
      if(f[0]==="name")wrap.className+=" cp-wide";
      fields.appendChild(wrap);
    });
    setStatus("Edit values, then press Apply.","ok");
  }

  function open(id){
    var c=find(id);
    if(!c)return;
    activeId=id;
    snapshot=JSON.parse(JSON.stringify(c));
    root.classList.add("open");root.setAttribute("aria-hidden","false");render();
  }
  function close(){root.classList.remove("open");root.setAttribute("aria-hidden","true");activeId=null;}
  function apply(){
    var c=find(activeId);if(!c)return;
    if(typeof window.saveStateForUndo==="function")window.saveStateForUndo();
    fields.querySelectorAll("[data-key]").forEach(function(el){
      var key=el.dataset.key, v=el.value;
      if(el.dataset.type==="number"){
        var n=Number(v);if(!Number.isFinite(n))return;
        if(key==="rotation")n=((n%360)+360)%360;
        if(key==="r"||key==="maxR"||key==="capacitance"||key==="inductance"||key==="power")n=Math.max(0,n);
        c[key]=n;
      }else if(el.tagName==="SELECT"){
        c[key]=v==="1";
      }else c[key]=v;
    });
    if(c.type==="potentiometer" && c.maxR!=null)c.r=Math.min(c.maxR,Math.max(0.01,c.r||0.01));
    if(typeof window.renderBuilderCanvas==="function")window.renderBuilderCanvas();
    if(typeof window.runBuilderSim==="function" && window.isSimRunning)window.runBuilderSim();
    document.documentElement.dataset.unsaved="true";
    setStatus("✓ Properties applied.","ok");
  }
  function reset(){
    var c=find(activeId);if(!c||!snapshot)return;
    if(typeof window.saveStateForUndo==="function")window.saveStateForUndo();
    var keepId=c.id;
    Object.keys(c).forEach(function(k){delete c[k];});
    Object.assign(c,JSON.parse(JSON.stringify(snapshot)));c.id=keepId;
    if(typeof window.renderBuilderCanvas==="function")window.renderBuilderCanvas();
    setStatus("↺ Properties restored to previous values.","ok");
  }

  window.NilSparkLabAdvancedProperties={open:open,close:close,apply:apply,refresh:render};

  document.addEventListener("click",function(e){
    if(e.target.id==="elab-v571-close")close();
    if(e.target.id==="elab-v571-apply")apply();
    if(e.target.id==="elab-v571-reset")reset();
    if(e.target.id==="elab-v571-open-project" && window.NilSparkLabProjectManager2)
      window.NilSparkLabProjectManager2.open();
    var edit=e.target.closest("[data-v571-edit]");
    if(edit)open(edit.getAttribute("data-v571-edit"));
  });
})();
