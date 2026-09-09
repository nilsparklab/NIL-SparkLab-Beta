
(function(){
"use strict";
function norm(s){return String(s||"").toLowerCase().replace(/[^a-z0-9\u0900-\u097f\s.+\-\/]/gi," ").replace(/\s+/g," ").trim();}
function has(n,a){return a.some(function(x){return n.indexOf(x)>=0;});}

/* v6.29 Universal Symbol Library */
var symbols={
 resistor:{family:"passive",terminals:["1","2"]}, capacitor:{family:"passive",terminals:["1","2"]},
 inductor:{family:"passive",terminals:["1","2"]}, diode:{family:"semiconductor",terminals:["A","K"]},
 led:{family:"semiconductor",terminals:["A","K"]}, bjt_npn:{family:"transistor",terminals:["B","C","E"]},
 mosfet_n:{family:"transistor",terminals:["G","D","S"]}, opamp:{family:"analog",terminals:["+","-","OUT","V+","V-"]},
 transformer:{family:"magnetic",terminals:["P1","P2","S1","S2"]}, relay:{family:"switching",terminals:["COIL1","COIL2","COM","NO","NC"]},
 motor:{family:"load",terminals:["1","2"]}, battery:{family:"source",terminals:["+","-"]},
 ac_source:{family:"source",terminals:["L","N"]}, switch:{family:"switching",terminals:["1","2"]},
 fuse:{family:"protection",terminals:["1","2"]}, ground:{family:"reference",terminals:["GND"]}
};

/* v6.30 Natural-language intent/compiler */
function compile(q){
 var n=norm(q), c=[], intent="generic circuit", warnings=[];
 function add(type,role){if(!c.some(function(x){return x.type===type;}))c.push({type:type,role:role});}
 if(has(n,["battery","बैटरी","cell","सेल"]))add("battery","source");
 if(has(n,["ac source","ac supply","mains","एसी","alternating"]))add("ac_source","source");
 if(has(n,["resistor","resistance","ohm","प्रतिरोध"]))add("resistor","resistance");
 if(has(n,["capacitor","cap","कैपेसिटर"]))add("capacitor","filter/timing");
 if(has(n,["inductor","coil","इंडक्टर","कॉइल"]))add("inductor","filter");
 if(has(n,["led","एलईडी"]))add("led","indicator");
 if(has(n,["diode","डायोड","rectifier","रेक्टिफायर"]))add("diode","rectification/protection");
 if(has(n,["relay","रिले"]))add("relay","switching");
 if(has(n,["motor","मोटर"]))add("motor","load");
 if(has(n,["mosfet","nmos","मॉसफेट"]))add("mosfet_n","switch");
 if(has(n,["bjt","npn","transistor","ट्रांजिस्टर"]))add("bjt_npn","switch/amplifier");
 if(has(n,["opamp","op amp","operational amplifier","ऑप एम्प"]))add("opamp","amplifier");
 if(has(n,["transformer","transfarmer","transformar","ट्रांसफॉर्मर","ट्रांसफार्मर"]))add("transformer","conversion/isolation");
 if(has(n,["switch","स्विच"]))add("switch","control");
 if(has(n,["fuse","फ्यूज"]))add("fuse","protection");
 if(has(n,["ground","gnd","earth","ग्राउंड","अर्थ"]))add("ground","reference");
 if(has(n,["led","एलईडी"])&&!has(n,["resistor","ohm","प्रतिरोध"]))warnings.push("LED current-limiting resistor is not explicitly specified.");
 if((has(n,["motor","मोटर","relay","रिले"]))&&has(n,["mosfet","nmos","मॉसफेट"])&&!has(n,["diode","flyback","डायोड"]))warnings.push("Inductive-load protection is not explicitly specified.");
 if(has(n,["230v","240v","mains","मेन"]))warnings.push("Mains-voltage wording detected; use a safety-rated model.");
 if(has(n,["full wave","bridge rectifier","ब्रिज रेक्टिफायर"]))intent="full-wave bridge rectifier";
 else if(has(n,["half wave","हाफ वेव"]))intent="half-wave rectifier";
 else if(has(n,["wheatstone","व्हीटस्टोन"]))intent="wheatstone bridge";
 else if(has(n,["555","timer","टाइमर"]))intent="555 timer";
 else if(has(n,["h bridge","h-bridge","एच ब्रिज"]))intent="H-bridge";
 else if(has(n,["star delta","star-delta","स्टार डेल्टा"]))intent="star-delta";
 else if(has(n,["common emitter","common-emitter","कॉमन एमिटर"]))intent="common-emitter amplifier";
 else if(has(n,["zener","जेनर"]))intent="zener regulator";
 else if(has(n,["buck","बक"]))intent="buck converter";
 else if(has(n,["boost","बूस्ट"]))intent="boost converter";
 else if(has(n,["low pass","low-pass","लो पास"]))intent="low-pass filter";
 else if(has(n,["high pass","high-pass","हाई पास"]))intent="high-pass filter";
 else if(has(n,["transformer","transfarmer","ट्रांसफॉर्मर"]))intent="transformer circuit";
 return {version:"6.30",intent:intent,components:c,warnings:warnings,needsClarification:c.length<2};
}

/* v6.31 Electrical rules */
function validate(c){
 var issues=[],warnings=[],types=(c&&c.components||[]).map(function(x){return x.type;});
 function hasT(t){return types.indexOf(t)>=0;}
 if(!c||!c.components||!c.components.length)return {status:"invalid",issues:["No components compiled."],warnings:[]};
 if(hasT("led")&&!hasT("resistor"))issues.push("LED current-limiting resistor is missing/unspecified.");
 if(hasT("motor")&&hasT("mosfet_n")&&!hasT("diode"))warnings.push("Flyback protection is not explicitly specified.");
 if(hasT("relay")&&!hasT("diode"))warnings.push("Relay coil flyback protection is not explicitly specified.");
 if(hasT("transformer")&&hasT("battery")&&!hasT("ac_source"))warnings.push("Transformer source compatibility requires review.");
 if(!hasT("ground"))warnings.push("No explicit reference node detected.");
 return {version:"6.31",status:issues.length?"invalid":warnings.length?"needs-review":"validated",issues:issues,warnings:warnings};
}

/* v6.32 Schematic renderer */
function render(c){
 if(!c||!c.components)return {ok:false,error:"No circuit to render."};
 return {version:"6.32",ok:true,format:"schematic-layout",
   items:c.components.map(function(x,i){return {ref:x.ref||("X"+(i+1)),type:x.type,x:100+i*170,y:120,orientation:"horizontal"};}),
   nets:c.nets||[],status:"generated"};
}

/* v6.33 orchestration */
function prepare(c){
 return {version:"6.33",pipeline:["compile","validate","render","builder","simulate","explain"],
   circuit:c,builderReady:!!window.NilSparkLabBuilderBridge,simulationReady:!!window.NilSparkLabSimulation};
}

/* v9.11 universal circuit knowledge */
var patterns=[
 ["full wave","Full-wave bridge rectifier"],["half wave","Half-wave rectifier"],["wheatstone","Wheatstone bridge"],
 ["555","555 timer circuit"],["h bridge","H-bridge motor driver"],["star delta","Star-delta starter"],
 ["common emitter","Common-emitter amplifier"],["zener","Zener regulator"],["buck","Buck converter"],
 ["boost","Boost converter"],["rlc","Series RLC circuit"],["relay motor","Relay motor control"],
 ["mosfet motor","MOSFET motor control"],["transformer","Transformer circuit"]
];
function identify(q){var n=norm(q),m=[];patterns.forEach(function(p){if(n.indexOf(p[0])>=0)m.push(p[1]);});
 return {version:"9.11",matches:m,confidence:m.length?"known-pattern":"best-effort"};}

window.NilSparkLabUniversalCircuitEngine={
 version:"9.11",
 symbols:symbols,
 compile:compile,
 validate:validate,
 render:render,
 prepare:prepare,
 identify:identify,
 generate:function(q){
   var c=compile(q),v=validate(c),r=render(c),k=identify(q);
   return {request:q,intent:c.intent,components:c.components,warnings:c.warnings,validation:v,layout:r,knownPatterns:k};
 }
};
})();
