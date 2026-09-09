
(function(){
"use strict";
var groups={
passive:["resistor","capacitor","inductor","potentiometer","transformer"],
semiconductor:["diode","led","bjt_npn","mosfet_n"],
switching:["switch","relay","fuse"],
source:["battery","ac_source"],
load:["motor","lamp","buzzer"],
analog:["opamp"],
reference:["ground"]
};
var aliases={
resistor:["resistor","resistance","r","प्रतिरोध"],
capacitor:["capacitor","cap","c","कैपेसिटर"],
inductor:["inductor","coil","l","इंडक्टर","कॉइल"],
diode:["diode","rectifier","डायोड","रेक्टिफायर"],
led:["led","एलईडी"],
bjt_npn:["bjt","npn","transistor","ट्रांजिस्टर"],
mosfet_n:["mosfet","nmos","n-channel","मॉसफेट"],
opamp:["op amp","opamp","operational amplifier","ऑप amp"],
transformer:["transformer","transfarmer","transfarmer","ट्रांसफॉर्मर","ट्रांसफार्मर"],
relay:["relay","रिले"],
motor:["motor","मोटर"],
switch:["switch","स्विच"],
fuse:["fuse","फ्यूज"],
battery:["battery","cell","बैटरी","सेल"],
ac_source:["ac source","ac supply","mains","एसी","ac source"],
ground:["ground","gnd","earth","ग्राउंड","अर्थ"]
};
function find(q){
 var n=String(q||"").toLowerCase(), hits=[];
 Object.keys(aliases).forEach(function(id){
   aliases[id].forEach(function(a){if(n.indexOf(a.toLowerCase())>=0 && hits.indexOf(id)<0) hits.push(id);});
 });
 return hits;
}
window.NilSparkLabComponentRegistry={
 version:"6.27", groups:groups, aliases:aliases, find:find,
 list:function(){return Object.keys(aliases);}
};
})();
