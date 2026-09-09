
(function(){
  "use strict";
  var exps=[
    {id:"ohm",name:"Ohm's Law",obj:"Verify V = I × R using a DC source and resistor.",
     req:[["battery",1],["resistor",1]],required:"Battery • Resistor • Wires • Multimeter",
     steps:["Place a DC source.","Add a resistor.","Complete the circuit.","Measure voltage and current.","Verify R ≈ V/I."]},
    {id:"series",name:"Series Circuit",obj:"Observe current continuity and voltage division in a series network.",
     req:[["battery",1],["resistor",2]],required:"Battery • 2 Resistors • Wires • Multimeter",
     steps:["Place a source and two resistors.","Connect one series path.","Run the simulation.","Measure each voltage drop.","Compare the readings."]},
    {id:"parallel",name:"Parallel Circuit",obj:"Observe common branch voltage and current division.",
     req:[["battery",1],["resistor",2]],required:"Battery • 2 Resistors • Wires • Multimeter",
     steps:["Place a source and two resistors.","Create two branches.","Run the simulation.","Measure branch current.","Compare the branch values."]},
    {id:"led",name:"LED Current-Limited Circuit",obj:"Build a safe LED circuit using a series current-limiting resistor.",
     req:[["battery",1],["resistor",1],["led",1]],required:"Battery • Resistor • LED • Wires",
     steps:["Place a DC source.","Add a series resistor.","Connect the LED with correct polarity.","Run the circuit.","Check the estimated LED current."]},
    {id:"diode",name:"Diode Test",obj:"Observe educational forward-voltage behavior of a diode.",
     req:[["battery",1],["resistor",1],["diode",1]],required:"Battery • Resistor • Diode • Wires • Multimeter",
     steps:["Place a diode and series resistor.","Connect the source with correct polarity.","Run the circuit.","Select diode mode.","Record the forward voltage."]},
    {id:"rc",name:"RC Charging",obj:"Study capacitor charging through a resistor.",
     req:[["battery",1],["resistor",1],["capacitor",1]],required:"Battery • Resistor • Capacitor • Switch",
     steps:["Place source, resistor and capacitor.","Complete the charging path.","Run the circuit.","Observe capacitor voltage.","Discuss time-constant behavior."]},
    {id:"motor",name:"DC Motor Drive",obj:"Explore basic voltage/current behavior of a DC motor load.",
     req:[["battery",1],["motor",1]],required:"Battery • DC Motor • Wires",
     steps:["Place a DC source and motor.","Connect a closed path.","Run the simulation.","Observe current.","Check load status."]}
  ];
  var idx=0;

  function comps(){try{return Array.isArray(window.builderCanvasComps)?window.builderCanvasComps:[];}catch(e){return[];}}
  function typeOf(c){return String(c&&(c.type||c.kind||c.componentType)||"").toLowerCase().replace(/[\s-]+/g,"_");}
  function listTypes(){return comps().map(typeOf);}
  function countType(t){return listTypes().filter(function(x){return x===t;}).length;}
  function val(c,k,d){var v=c&&c.properties&&c.properties[k]!=null?c.properties[k]:c&&c[k]!=null?c[k]:d;v=Number(v);return Number.isFinite(v)?v:d;}
  function find(t){return comps().find(function(c){return typeOf(c)===t;});}

  function renderList(){
    var host=document.getElementById("elab-v568-list");if(!host)return;
    host.innerHTML=exps.map(function(x,i){
      return '<button class="exp '+(i===idx?"active":"")+'" data-v568-exp="'+i+'">'+x.name+'</button>';
    }).join("");
  }
  function render(){
    var x=exps[idx];
    document.getElementById("elab-v568-name").textContent=x.name;
    document.getElementById("elab-v568-objective").textContent=x.obj;
    document.getElementById("elab-v568-required").textContent=x.required;
    document.getElementById("elab-v568-steps").innerHTML=x.steps.map(function(s){return "<li>"+s+"</li>";}).join("");
    ["v","i","r","p"].forEach(function(k){document.getElementById("elab-v568-"+k).textContent="—";});
    document.getElementById("elab-v568-result").textContent="Build the circuit in Circuit Builder, run the simulation, then verify the practical here.";
    renderList();
  }
  function measure(){
    var b=find("battery"), r=find("resistor");
    var v=b?val(b,"voltage",12):0, rv=r?val(r,"resistance",1000):0;
    var i=rv>0?v/rv:0, p=v*i;
    document.getElementById("elab-v568-v").textContent=b?v.toFixed(2)+" V":"—";
    document.getElementById("elab-v568-i").textContent=r?i.toFixed(4)+" A":"—";
    document.getElementById("elab-v568-r").textContent=r?rv.toFixed(2)+" Ω":"—";
    document.getElementById("elab-v568-p").textContent=r?p.toFixed(3)+" W":"—";
  }
  function verify(){
    var x=exps[idx], ok=true, missing=[];
    x.req.forEach(function(pair){
      var t=pair[0], needed=pair[1];
      if(countType(t)<needed){
        ok=false;
        missing.push((needed>1?t+" × "+needed:t));
      }
    });
    measure();
    var detail=ok
      ? '<div class="ok" style="font-weight:900">✓ PRACTICAL REQUIREMENTS PASSED</div><div style="margin-top:5px;color:#cbd5e1">Required component types are present. Verify the measured values in the available measurement tools and record your observation.</div>'
      : '<div class="warn" style="font-weight:900">⚠ PRACTICAL INCOMPLETE</div><div style="margin-top:5px;color:#cbd5e1">Missing: '+missing.join(", ")+'. Add the required components and check again.</div>';
    document.getElementById("elab-v568-result").innerHTML=detail;
  }
  function quickChallenge(){
    var x=exps[idx], passed=0, total=x.req.length;
    x.req.forEach(function(pair){
      if(countType(pair[0])>=pair[1]) passed++;
    });
    document.getElementById("elab-v568-result").innerHTML=
      '<div style="font-weight:900;color:'+(passed===total?"#86efac":"#fcd34d")+'">'+
      (passed===total?"🏆 QUICK CHALLENGE PASSED":"🎯 QUICK CHALLENGE: "+passed+"/"+total+" checks")+
      '</div><div style="margin-top:5px;color:#cbd5e1">Use Circuit Builder and wiring diagnostics for the final electrical verification.</div>';
    measure();
  }
  function open(){var p=document.getElementById("elab-v568-practical");if(p){p.classList.add("open");p.setAttribute("aria-hidden","false");render();}}
  function close(){var p=document.getElementById("elab-v568-practical");if(p){p.classList.remove("open");p.setAttribute("aria-hidden","true");}}
  window.NilSparkLabPracticalLab={open:open,close:close,verify:verify,measure:measure};
  document.addEventListener("click",function(e){
    var b=e.target.closest("[data-v568-exp]");
    if(b){idx=Number(b.getAttribute("data-v568-exp"))||0;render();}
    if(e.target.id==="elab-v568-close")close();
    if(e.target.id==="elab-v568-check")verify();
    if(e.target.id==="elab-v568-reset")render();
    if(e.target.id==="elab-v568-challenge")quickChallenge();
  });
})();
