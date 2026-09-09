
(function(){
  "use strict";
  var live=true,timer=null;

  function comps(){try{return Array.isArray(window.builderCanvasComps)?window.builderCanvasComps:[];}catch(e){return[];}}
  function wires(){try{return Array.isArray(window.builderWires)?window.builderWires:[];}catch(e){return[];}}
  function typeOf(c){return String(c&&(c.type||c.kind||c.componentType)||"").toLowerCase().replace(/[\s-]+/g,"_");}
  function num(c,keys,d){
    for(var i=0;i<keys.length;i++){
      var k=keys[i],v=c&&c.properties&&c.properties[k]!=null?c.properties[k]:c&&c[k];
      v=Number(v);if(Number.isFinite(v))return v;
    }
    return d;
  }
  function findTypes(list){
    return comps().filter(function(c){return list.indexOf(typeOf(c))>=0;});
  }
  function set(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}

  function resistorValue(c){return Math.max(0.000001,num(c,["r","resistance"],1000));}
  function solve(){
    var cs=comps();
    var sources=findTypes(["battery","source","dc_source","generator"]);
    var resistors=findTypes(["resistor"]);
    var leds=findTypes(["led"]);
    var motors=findTypes(["motor"]);
    var capacitors=findTypes(["capacitor"]);
    var inductors=findTypes(["inductor"]);
    var voltage=sources.length?num(sources[0],["v","voltage"],12):0;

    var result=document.getElementById("elab-v572-result");
    if(!cs.length){
      set("elab-v572-v","—");set("elab-v572-i","—");set("elab-v572-p","—");set("elab-v572-r","—");
      result.className="result warn";result.textContent="No components placed.";
      document.getElementById("elab-v572-nodes").innerHTML="";
      return;
    }

    var reqWires=cs.length>1?cs.length-1:0;
    var actualWires=wires().length;
    var disconnected=actualWires<reqWires && cs.length>1;

    if(!sources.length){
      set("elab-v572-v","0 V");set("elab-v572-i","0 A");set("elab-v572-p","0 W");set("elab-v572-r","—");
      result.className="result warn";result.innerHTML="⚠ No voltage source detected. Add a battery/DC source before solving.";
      return;
    }

    var totalR=0;
    resistors.forEach(function(c){totalR+=resistorValue(c);});
    if(!resistors.length && (leds.length||motors.length)){
      totalR=leds.length?Math.max(100,voltage/0.02):Math.max(1,voltage/0.5);
    }
    if(!totalR) totalR=1e9;

    var current=voltage/totalR;
    var power=voltage*current;

    set("elab-v572-v",voltage.toFixed(2)+" V");
    set("elab-v572-i",current.toFixed(5)+" A");
    set("elab-v572-p",power.toFixed(3)+" W");
    set("elab-v572-r",totalR>=1e8?"OL":totalR.toFixed(2)+" Ω");

    result.className="result "+(disconnected?"warn":"ok");
    result.innerHTML=(disconnected?"⚠ Basic topology looks incomplete. ":"✓ Educational DC operating estimate. ")+
      "Values are calculated from detected source/load parameters; run the full circuit simulation for final verification.";

    var nodes=document.getElementById("elab-v572-nodes");
    var lines=[];
    resistors.forEach(function(c,i){
      var r=resistorValue(c),iA=voltage/Math.max(r,1e-9);
      lines.push('<div class="node">R'+(i+1)+': '+r.toFixed(2)+' Ω · I ≈ '+iA.toFixed(5)+' A · P ≈ '+(iA*iA*r).toFixed(3)+' W</div>');
    });
    leds.forEach(function(c,i){lines.push('<div class="node">LED '+(i+1)+': forward-current behavior estimated; verify polarity and series resistance.</div>');});
    motors.forEach(function(c,i){lines.push('<div class="node">Motor '+(i+1)+': load detected; current depends on motor model/load.</div>');});
    capacitors.forEach(function(c,i){lines.push('<div class="node">C'+(i+1)+': transient component detected; steady-state DC current tends toward 0 A after charging.</div>');});
    inductors.forEach(function(c,i){lines.push('<div class="node">L'+(i+1)+': transient component detected; steady-state DC behaves approximately as a short in the ideal model.</div>');});
    nodes.innerHTML=lines.join("");
  }

  function open(){
    var p=document.getElementById("elab-v572-solver");
    if(p){p.classList.add("open");p.setAttribute("aria-hidden","false");solve();}
    if(!timer)timer=setInterval(function(){if(live&&document.getElementById("elab-v572-solver").classList.contains("open"))solve();},1000);
  }
  function close(){
    var p=document.getElementById("elab-v572-solver");
    if(p){p.classList.remove("open");p.setAttribute("aria-hidden","true");}
  }
  window.NilSparkLabRealtimeSolver={open:open,close:close,solve:solve};

  document.addEventListener("click",function(e){
    if(e.target.id==="elab-v572-close")close();
    if(e.target.id==="elab-v572-analyze")solve();
    if(e.target.id==="elab-v572-live"){
      live=!live;e.target.textContent="⏱ Live: "+(live?"ON":"OFF");
      if(live)solve();
    }
  });
  window.addEventListener("nilsparklab:project-loaded",solve);
  window.addEventListener("nilsparklab:circuit-restored",solve);
})();
