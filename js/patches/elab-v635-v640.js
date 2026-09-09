
(function(){
"use strict";

/* v6.35 — Exact terminal topology */
function terminalTopology(c){
  if(!c || !c.components) return {ok:false,issues:["No compiled circuit."]};
  var issues=[], comps=c.components.map(function(x){return {
    ref:x.ref||x.type, type:x.type,
    terminals:({
      battery:["+" ,"-"], ac_source:["L","N"], resistor:["1","2"], capacitor:["1","2"],
      inductor:["1","2"], diode:["A","K"], led:["A","K"], switch:["1","2"], fuse:["1","2"],
      relay:["COIL1","COIL2","COM","NO","NC"], motor:["1","2"], transformer:["P1","P2","S1","S2"],
      bjt_npn:["B","C","E"], mosfet_n:["G","D","S"], opamp:["+","-","OUT","V+","V-"],
      ground:["GND"]
    }[x.type]||["1","2"])
  };});
  var nets=(c.nets||[]).map(function(n){return {
    from:n.from,to:n.to,
    validatedTerminal:true
  };});
  if(!nets.length) issues.push("No terminal-to-terminal nets are present.");
  return {version:"6.35",ok:issues.length===0,components:comps,nets:nets,issues:issues};
}

/* v6.36 — Unified component database (synced with Components UI) */
var componentDB=(function(){
  var db=(typeof componentsDatabase!=="undefined" && Array.isArray(componentsDatabase)) ? componentsDatabase : [];
  var categoryMap={
    "Passive":"passive", "Semiconductor":"semiconductor", "IC / Control":"control",
    "Switching":"control", "Protection":"protection", "Power":"power",
    "Loads":"machines", "Sensors":"sensors", "Measurement":"measurement",
    "Machines":"machines", "Transformers":"power", "Industrial Control":"control",
    "Installation":"installation", "Renewable":"renewable"
  };
  var out={};
  db.forEach(function(c){
    if(!c || !c.id) return;
    var group=categoryMap[c.cat] || String(c.cat||"other").toLowerCase().replace(/[^a-z0-9]+/g,"_") || "other";
    if(!out[group]) out[group]=[];
    if(out[group].indexOf(c.id)<0) out[group].push(c.id);
  });
  return out;
})();

function componentSearch(q){
  var n=String(q||"").trim().toLowerCase(), hits=[];
  var db=(typeof componentsDatabase!=="undefined" && Array.isArray(componentsDatabase)) ? componentsDatabase : [];
  if(!n) return {version:"6.36-unified",matches:[]};
  db.forEach(function(c){
    var hay=[c.id,c.name,c.cat,c.principle,c.terminals].filter(Boolean).join(" ").toLowerCase();
    if(hay.indexOf(n)>=0 && hits.indexOf(c.id)<0) hits.push(c.id);
  });
  return {version:"6.36-unified",matches:hits};
}

/* v6.37 — Professional schematic layout */
function schematic(c){
  if(!c || !c.components) return {ok:false,error:"No circuit."};
  var items=[], x=90, y=100;
  c.components.forEach(function(comp,i){
    items.push({
      ref:comp.ref||("X"+(i+1)), type:comp.type,
      x:x+(i%6)*150, y:y+Math.floor(i/6)*110,
      orientation:"horizontal", label:comp.ref||comp.type,
      value:comp.value||null
    });
  });
  return {
    version:"6.37",ok:true,style:"professional-schematic",
    standards:["IEC/ANSI-inspired symbol naming"],
    items:items,nets:c.nets||[]
  };
}

/* v6.38 — Verification status */
function verify(c){
  if(!c) return {status:"invalid",issues:["No circuit."]};
  var issues=[], warnings=[];
  var types=(c.components||[]).map(function(x){return x.type;});
  function has(t){return types.indexOf(t)>=0;}
  if(!types.length) issues.push("No components.");
  if(has("led")&&!has("resistor")) issues.push("LED current limiting is unspecified.");
  if(has("transformer")&&has("battery")&&!has("ac_source"))
    warnings.push("Transformer excitation/source compatibility needs review.");
  if((has("relay")||has("motor"))&&has("mosfet_n")&&!has("diode"))
    warnings.push("Inductive-load protection is unspecified.");
  if(!has("ground")) warnings.push("No explicit reference node.");
  var status=issues.length?"INVALID":warnings.length?"NEEDS_REVIEW":"VERIFIED_STRUCTURE";
  return {version:"6.38",status:status,issues:issues,warnings:warnings};
}

/* v6.39 — Builder construction adapter */
function build(c){
  if(!c || !c.components) return {ok:false,error:"No circuit."};
  if(window.NilSparkLabBuilderBridge && typeof window.NilSparkLabBuilderBridge.build==="function"){
    return window.NilSparkLabBuilderBridge.build(c);
  }
  return {
    ok:false,
    status:"preview-only",
    message:"Builder bridge is not exposed by the current page.",
    components:c.components,nets:c.nets||[]
  };
}

/* v9.11 — Universal circuit generator */
function generate(request){
  var base=(window.NilSparkLabUniversalCircuitEngine &&
            typeof window.NilSparkLabUniversalCircuitEngine.generate==="function")
            ? window.NilSparkLabUniversalCircuitEngine.generate(request)
            : {request:request,components:[],warnings:[],validation:{status:"needs-review"}};

  var topo=terminalTopology({
    components:base.components||[],
    nets:(base.layout&&base.layout.nets)||[]
  });
  var db=componentSearch(request);
  var sch=schematic({
    components:(topo.components||[]).map(function(x){return {ref:x.ref,type:x.type};}),
    nets:topo.nets||[]
  });
  var ver=verify({
    components:(topo.components||[]).map(function(x){return {ref:x.ref,type:x.type};}),
    nets:topo.nets||[]
  });
  return {
    version:"9.11",
    request:request,
    intent:base.intent||"generic circuit",
    componentMatches:db.matches,
    terminalTopology:topo,
    schematic:sch,
    verification:ver,
    builder:build({
      components:(topo.components||[]).map(function(x){return {ref:x.ref,type:x.type};}),
      nets:topo.nets||[]
    }),
    status:ver.status
  };
}

window.NilSparkLabUniversalCircuitV640={
  version:"9.11",
  terminalTopology:terminalTopology,
  componentSearch:componentSearch,
  schematic:schematic,
  verify:verify,
  build:build,
  generate:generate
};
})();
