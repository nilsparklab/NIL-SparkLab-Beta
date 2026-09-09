
(function(){
"use strict";

var TYPES = [
  "battery","ac_source","resistor","capacitor","inductor","diode","led",
  "switch","fuse","relay","motor","lamp","buzzer","transformer",
  "bjt_npn","mosfet_n","potentiometer","opamp","ground"
];

function norm(s){
  return String(s||"").toLowerCase()
    .replace(/[\u2018\u2019\u201c\u201d]/g,"")
    .replace(/[^a-z0-9\u0900-\u097f\s.+\-\/]/gi," ")
    .replace(/\s+/g," ").trim();
}
function has(n, arr){ return arr.some(function(x){ return n.indexOf(x)>=0; }); }

function extract(q){
  var n=norm(q), parts=[], values=[], warnings=[];
  function add(t){ if(parts.indexOf(t)<0) parts.push(t); }

  if(has(n,["battery","cell","dc source","बैटरी","सेल","dc supply"])) add("battery");
  if(has(n,["ac source","ac supply","mains","alternating","एसी","ac"])) add("ac_source");
  if(has(n,["transformer","transfarmer","transformar","ट्रांसफॉर्मर","ट्रांसफार्मर"])) add("transformer");
  if(has(n,["resistor","resistance","ohm","प्रतिरोध"])) add("resistor");
  if(has(n,["capacitor","capacit","कैपेसिटर"])) add("capacitor");
  if(has(n,["inductor","coil","इंडक्टर","कॉइल"])) add("inductor");
  if(has(n,["led","एलईडी"])) add("led");
  if(has(n,["diode","डायोड","rectifier","रेक्टिफायर"])) add("diode");
  if(has(n,["switch","स्विच"])) add("switch");
  if(has(n,["fuse","फ्यूज"])) add("fuse");
  if(has(n,["relay","रिले"])) add("relay");
  if(has(n,["motor","मोटर"])) add("motor");
  if(has(n,["lamp","bulb","लैंप","बल्ब"])) add("lamp");
  if(has(n,["buzzer","बजर"])) add("buzzer");
  if(has(n,["mosfet","n mos","nmos","मॉसफेट"])) add("mosfet_n");
  if(has(n,["bjt","npn","transistor","ट्रांजिस्टर"])) add("bjt_npn");
  if(has(n,["potentiometer","pot","पोटेंशियोमीटर"])) add("potentiometer");
  if(has(n,["op amp","opamp","operational amplifier","ऑप एम्प"])) add("opamp");
  if(has(n,["ground","gnd","ग्राउंड","अर्थ"])) add("ground");

  var nums=n.match(/\b\d+(?:\.\d+)?\s*(?:v|a|ma|mv|ohm|k|kohm|mohm|uf|µf|nf|pf|mh|hz|khz)\b/gi)||[];
  nums.forEach(function(x){ values.push(x); });

  if(has(n,["230v","240v","mains","ac mains","घर की supply","मेन सप्लाई"]))
    warnings.push("Mains-voltage detected: use an isolated/low-voltage teaching model and follow electrical safety procedures.");

  if(parts.indexOf("led")>=0 && parts.indexOf("resistor")<0)
    warnings.push("LED current limiting resistor is not explicitly specified.");
  if((parts.indexOf("motor")>=0 || parts.indexOf("relay")>=0) &&
     parts.indexOf("diode")<0 && parts.indexOf("mosfet_n")>=0)
    warnings.push("Inductive-load flyback protection is not explicitly specified.");

  return {parts:parts, values:values, warnings:warnings};
}

function topology(parts){
  var nets=[], components=[], i;
  function addComp(type,ref){ components.push({ref:ref,type:type}); }
  function connect(a,b){ nets.push({from:a,to:b}); }

  var refCount={};
  function ref(type){
    refCount[type]=(refCount[type]||0)+1;
    var p={battery:"BAT",ac_source:"AC",resistor:"R",capacitor:"C",inductor:"L",
      diode:"D",led:"LED",switch:"SW",fuse:"F",relay:"K",motor:"M",lamp:"LAMP",
      buzzer:"BZ",transformer:"T",bjt_npn:"Q",mosfet_n:"Q",potentiometer:"RV",
      opamp:"U",ground:"GND"}[type]||"X";
    return p+refCount[type];
  }

  parts.forEach(function(p){ addComp(p,ref(p)); });

  for(i=0;i<components.length-1;i++)
    connect(components[i].ref+".1",components[i+1].ref+".1");
  if(components.length>1)
    connect(components[components.length-1].ref+".2",components[0].ref+".2");

  return {components:components,nets:nets};
}

function compile(q){
  var e=extract(q);
  if(!e.parts.length) return {ok:false,reason:"No recognizable circuit components or circuit intent found."};

  var top=topology(e.parts);
  var confidence = e.parts.length>=2 ? "topology-generated" : "insufficient";
  return {
    ok:true, version:"9.11",
    intent:String(q||"").trim(),
    confidence:confidence,
    components:top.components,
    nets:top.nets,
    values:e.values,
    warnings:e.warnings,
    status:e.warnings.length ? "needs-review" : "generated"
  };
}

function netlist(c){
  if(!c||!c.components) return "";
  var a=["CIRCUIT COMPILER v9.11","Intent: "+c.intent,"Status: "+c.status,"Confidence: "+c.confidence,"","Components:"];
  c.components.forEach(function(x){a.push("  "+x.ref+" = "+x.type);});
  a.push("","Nets:");
  c.nets.forEach(function(x){a.push("  "+x.from+" ↔ "+x.to);});
  if(c.values.length){a.push("","Values detected: "+c.values.join(", "));}
  if(c.warnings.length){a.push("","Warnings:");c.warnings.forEach(function(w){a.push("  - "+w);});}
  return a.join("\n");
}

window.NilSparkLabCircuitCompiler={
  version:"9.11",
  compile:compile,
  netlist:netlist,
  extract:extract
};
})();
