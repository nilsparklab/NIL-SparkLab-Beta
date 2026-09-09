
(function(){
"use strict";
/**
 * NilSparkLab Diagram Engine v5
 * - Verified library (expanded)
 * - Canvas geometric layout (x,y + wire paths)
 * - Sketch drawer
 * - SVG export helper
 */

function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function norm(s){ return String(s||"").toLowerCase().replace(/[^a-z0-9\u0900-\u097f\s+./-]/gi," ").replace(/\s+/g," ").trim(); }

function svgRoot(w,h,title,body,foot){
  w=Math.max(320, w||380); h=Math.max(180, h||240);
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" role="img" aria-label="'+esc(title)+'">'
    +'<rect width="'+w+'" height="'+h+'" rx="10" fill="#020617"/>'
    +'<text x="12" y="18" fill="#67e8f9" font-size="11" font-family="ui-monospace,monospace">'+esc(title).slice(0,56)+'</text>'
    + body
    +(foot?'<text x="12" y="'+(h-8)+'" fill="#64748b" font-size="8">'+esc(foot).slice(0,80)+'</text>':'')
    +'</svg>';
}
function L(x1,y1,x2,y2,c,sw){ return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(c||'#22d3ee')+'" stroke-width="'+(sw||2)+'" stroke-linecap="round"/>'; }
function T(x,y,t,c,s){ return '<text x="'+x+'" y="'+y+'" fill="'+(c||'#94a3b8')+'" font-size="'+(s||9)+'">'+esc(t)+'</text>'; }
function Box(x,y,w,h,t,c){
  return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="5" fill="#0f172a" stroke="'+(c||'#22d3ee')+'" stroke-width="2"/>'
    +T(x+5,y+h/2+3,String(t).slice(0,10),c||'#e2e8f0',9);
}
function Path(d,c,sw){ return '<path d="'+d+'" fill="none" stroke="'+(c||'#22d3ee')+'" stroke-width="'+(sw||2)+'" stroke-linecap="round" stroke-linejoin="round"/>'; }

var SYM = {
  battery: function(x,y){ return {w:24,h:36, svg: L(x,y-14,x,y+14,'#94a3b8')+L(x-6,y-8,x+6,y-8,'#e2e8f0')+L(x-4,y,x+4,y)+L(x-6,y+8,x+6,y+8,'#e2e8f0')+T(x-10,y-10,'+','#fbbf24',8)}; },
  source: function(x,y){ return SYM.battery(x,y); },
  ac_source: function(x,y){ return {w:28,h:28, svg:'<circle cx="'+x+'" cy="'+y+'" r="12" fill="none" stroke="#fbbf24" stroke-width="2"/>'+T(x-5,y+3,'~','#fbbf24',11)}; },
  resistor: function(x,y){ return {w:44,h:20, svg: Path('M'+(x-18)+' '+y+' h3 l4-7 8 14 8-14 8 14 4-7 h3','#f472b6')}; },
  potentiometer: function(x,y){ var r=SYM.resistor(x,y); return {w:r.w,h:r.h, svg:r.svg+L(x,y-10,x,y-2,'#86efac')}; },
  capacitor: function(x,y){ return {w:22,h:24, svg:L(x-8,y-10,x-8,y+10,'#67e8f9')+L(x-2,y-10,x-2,y+10,'#67e8f9')+L(x-14,y,x-8,y)+L(x-2,y,x+6,y)}; },
  inductor: function(x,y){ return {w:40,h:20, svg: Path('M'+(x-16)+' '+y+' a6 6 0 0 1 12 0 a6 6 0 0 1 12 0 a6 6 0 0 1 12 0','#a78bfa')}; },
  diode: function(x,y){ return {w:26,h:20, svg: Path('M'+(x-8)+' '+(y-8)+' L'+(x+6)+' '+y+' L'+(x-8)+' '+(y+8)+' Z','#f87171')+L(x+6,y-8,x+6,y+8,'#f87171')}; },
  led: function(x,y){ var d=SYM.diode(x,y); return {w:30,h:24, svg:d.svg+L(x+8,y-12,x+14,y-18,'#fbbf24')+L(x+12,y-10,x+18,y-16,'#fbbf24')}; },
  switch: function(x,y){ return {w:32,h:20, svg:L(x-12,y,x-4,y)+L(x-4,y,x+10,y-10,'#86efac')+L(x+10,y,x+14,y)}; },
  push_button: function(x,y){ return SYM.switch(x,y); },
  motor: function(x,y){ return {w:28,h:28, svg:'<circle cx="'+x+'" cy="'+y+'" r="12" fill="none" stroke="#c4b5fd" stroke-width="2"/>'+T(x-5,y+3,'M','#c4b5fd',9)}; },
  lamp: function(x,y){ return {w:26,h:26, svg:'<circle cx="'+x+'" cy="'+y+'" r="11" fill="none" stroke="#fde68a" stroke-width="2"/>'}; },
  buzzer: function(x,y){ return {w:30,h:22, svg:Box(x-14,y-10,28,20,'BZ','#f472b6')}; },
  fuse: function(x,y){ return {w:30,h:16, svg:'<rect x="'+(x-12)+'" y="'+(y-5)+'" width="24" height="10" rx="5" fill="none" stroke="#fb923c" stroke-width="2"/>'}; },
  bjt_npn: function(x,y){ return {w:34,h:28, svg:L(x-12,y,x-4,y)+L(x-2,y-12,x-2,y+12,'#22d3ee')+L(x-2,y-6,x+12,y-14)+L(x-2,y+6,x+12,y+14)}; },
  mosfet_n: function(x,y){ return SYM.bjt_npn(x,y); },
  p_mosfet: function(x,y){ return SYM.bjt_npn(x,y); },
  bridge_rectifier: function(x,y){ return {w:32,h:32, svg: Path('M'+x+' '+y+' l12 -12 l12 12 l-12 12 Z','#22d3ee')}; },
  transformer: function(x,y){ return {w:36,h:28, svg: Path('M'+(x-10)+' '+y+' a6 6 0 0 1 12 0 a6 6 0 0 1 12 0','#67e8f9')}; },
  relay: function(x,y){ return {w:36,h:24, svg:Box(x-16,y-10,32,20,'RLY','#a78bfa')}; },
  buzzer: function(x,y){ return {w:30,h:22, svg:Box(x-14,y-10,28,20,'BZ','#f472b6')}; },
  unknown: function(x,y){ return {w:36,h:24, svg:Box(x-16,y-10,32,20,'?','#64748b')}; }
};

function mapType(t){
  t=String(t||"").toLowerCase();
  if(SYM[t]) return t;
  if(/battery|source/.test(t) && !/ac/.test(t)) return "battery";
  if(/ac/.test(t)) return "ac_source";
  if(/pot/.test(t)) return "potentiometer";
  if(/resistor/.test(t)) return "resistor";
  if(/cap/.test(t)) return "capacitor";
  if(/induct|coil/.test(t)) return "inductor";
  if(/led/.test(t)) return "led";
  if(/diode/.test(t)) return "diode";
  if(/motor/.test(t)) return "motor";
  if(/push|button/.test(t)) return "push_button";
  if(/switch/.test(t)) return "switch";
  if(/fuse/.test(t)) return "fuse";
  if(/relay/.test(t)) return "relay";
  if(/buzz/.test(t)) return "buzzer";
  if(/lamp|bulb/.test(t)) return "lamp";
  if(/bridge/.test(t)) return "bridge_rectifier";
  if(/mosfet|bjt|npn|transistor/.test(t)) return "bjt_npn";
  if(/transform/.test(t)) return "transformer";
  return "unknown";
}

function drawChain(types, title, foot){
  if(!types.length) types=["battery","resistor","led"];
  if(!types.some(function(t){return t==="battery"||t==="ac_source"||t==="source";}))
    types=["battery"].concat(types);
  var x=24,y=100,parts=[],i,g,gap=8;
  for(i=0;i<Math.min(types.length,12);i++){
    g=(SYM[types[i]]||SYM.unknown)(x,y);
    parts.push(g.svg);
    parts.push(T(x-10,y+28,String(types[i]).replace(/_/g," ").slice(0,9),"#64748b",7));
    var nx=x+(g.w||30)+gap;
    if(i<types.length-1 && i<11) parts.push(L(x+(g.w||30)/2, y, nx-(g.w||30)/2, y));
    x=nx;
  }
  var end=x;
  parts.push(L(end-gap,y,end+4,y)+L(end+4,y,end+4,y+44)+L(end+4,y+44,24,y+44)+L(24,y+44,24,y));
  return svgRoot(Math.max(360,end+24), 210, title, parts.join(""), foot||"");
}
function drawDivider(title){
  var p=[SYM.battery(30,60).svg,L(42,48,90,48),SYM.resistor(110,48).svg,T(100,34,"R1","#f9a8d4",9),
    L(140,48,140,88),T(146,70,"Vout","#86efac",9),SYM.resistor(110,88).svg,T(100,114,"R2","#f9a8d4",9),
    L(140,88,90,88),L(90,100,90,125),L(30,125,90,125),L(30,60,30,125)];
  return svgRoot(300,170,title,p.join(""),"Vout = Vin × R2/(R1+R2)");
}
function drawBridge(title){
  return svgRoot(320,160,title,
    T(20,70,"~","#fbbf24",14)+Path("M50 78 L108 40 L166 78 L108 116 Z","#22d3ee")+T(95,82,"D×4","#f87171",9)
    +L(166,78,215,78)+Box(215,62,48,32,"Load","#a78bfa")+L(263,78,295,78)+L(295,78,295,125)+L(295,125,50,125)+L(50,125,50,78),
    "Full-wave concept");
}
function drawRelayDriver(title){
  return drawChain(["battery","resistor","bjt_npn","relay"], title, "Verified concept · freewheel diode not shown");
}
function draw555Astable(title){
  return svgRoot(360,190,title,
    Box(40,50,70,50,"555","#22d3ee")+T(50,120,"astable","#94a3b8",9)
    +L(110,75,150,75)+SYM.resistor(170,75).svg+T(155,60,"Ra","#f9a8d4",8)
    +L(200,75,240,75)+SYM.resistor(260,75).svg+T(245,60,"Rb","#f9a8d4",8)
    +L(290,75,290,120)+SYM.capacitor(290,130).svg+T(300,130,"C","#67e8f9",8)
    +T(40,170,"Teaching block · pin-accurate wiring in datasheet","#64748b",8),
    "Verified teaching block");
}

/* ===== Canvas geometric diagram ===== */
function getComps(){ try{ return Array.isArray(window.builderCanvasComps)?window.builderCanvasComps.slice():[]; }catch(e){ return []; } }
function getWires(){ try{ return Array.isArray(window.builderWires)?window.builderWires.slice():[]; }catch(e){ return []; } }

function buildNetlist(comps, wires){
  var lines=["NETLIST (Builder)","Components: "+comps.length+" · Wires: "+wires.length];
  comps.forEach(function(c,i){
    lines.push((i+1)+". "+(c.id||"?")+" · "+(c.type||"?")+" @ ("+Math.round(c.x||0)+","+Math.round(c.y||0)+")"+(c.r!=null?" R="+c.r:"")+(c.v!=null?" V="+c.v:""));
  });
  if(wires.length){
    lines.push("Wires:");
    wires.slice(0,50).forEach(function(w,i){
      var a=w.from||w.a||{}, b=w.to||w.b||{};
      lines.push("  "+(i+1)+". "+(a.compId||a.id||"?")+"."+(a.term||a.terminal||"*")+" ↔ "+(b.compId||b.id||"?")+"."+(b.term||b.terminal||"*"));
    });
    if(wires.length>50) lines.push("  … +"+(wires.length-50)+" more");
  } else lines.push("Wires: none");
  return lines.join("\n");
}

function autoFromCanvas(){
  var comps=getComps(), wires=getWires(), netlist=buildNetlist(comps,wires);
  if(!comps.length){
    return {id:"canvas_empty", title:"Current circuit", trust:"canvas", preset:null, netlist:netlist,
      svg:function(){ return svgRoot(340,150,"Canvas empty", T(40,80,"Add components in Builder","#94a3b8",11), ""); }};
  }

  // Bounds from x,y
  var minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  comps.forEach(function(c){
    var x=Number(c.x)||0, y=Number(c.y)||0;
    if(x<minX)minX=x; if(y<minY)minY=y; if(x>maxX)maxX=x; if(y>maxY)maxY=y;
  });
  if(!isFinite(minX)){ minX=0;minY=0;maxX=200;maxY=120; }
  var pad=40, marginTop=36, marginBot=28;
  var bw=Math.max(120, maxX-minX), bh=Math.max(80, maxY-minY);
  var scale=Math.min(1.2, 300/Math.max(bw,1), 140/Math.max(bh,1));
  var W=Math.max(360, Math.round(bw*scale)+pad*2+40);
  var H=Math.max(220, Math.round(bh*scale)+marginTop+marginBot+50);

  function tx(x){ return pad + (x-minX)*scale + 20; }
  function ty(y){ return marginTop + (y-minY)*scale + 20; }

  var byId={}; comps.forEach(function(c){ if(c&&c.id) byId[c.id]=c; });

  function svg(){
    var parts=[], anchors={};
    // wires first (under)
    wires.forEach(function(w){
      var a=w.from||w.a||{}, b=w.to||w.b||{};
      var ca=byId[a.compId||a.id], cb=byId[b.compId||b.id];
      if(!ca||!cb) return;
      var x1=tx(Number(ca.x)||0), y1=ty(Number(ca.y)||0);
      var x2=tx(Number(cb.x)||0), y2=ty(Number(cb.y)||0);
      // orthogonal-ish route
      var mx=(x1+x2)/2;
      parts.push(Path("M"+x1+" "+y1+" H"+mx+" V"+y2+" H"+x2, "#22d3ee", 1.8));
      parts.push('<circle cx="'+x1+'" cy="'+y1+'" r="2.5" fill="#67e8f9"/>');
      parts.push('<circle cx="'+x2+'" cy="'+y2+'" r="2.5" fill="#67e8f9"/>');
    });
    // components
    comps.slice(0,40).forEach(function(c){
      var x=tx(Number(c.x)||0), y=ty(Number(c.y)||0);
      var t=mapType(c.type);
      var g=(SYM[t]||SYM.unknown)(x,y);
      parts.push(g.svg);
      parts.push(T(x-14,y+22, String(c.type||t).slice(0,9),"#64748b",7));
      anchors[c.id]={x:x,y:y};
    });
    parts.push(T(12,32, comps.length+" parts · "+wires.length+" wires · scale "+scale.toFixed(2),"#7dd3fc",8));
    if(comps.length>40) parts.push(T(12,H-20,"Showing 40/"+comps.length+" components","#64748b",8));
    return svgRoot(W, H, "Canvas geometry", parts.join(""), "Positions from Builder x,y · wires routed orthogonally");
  }

  return {id:"canvas_geo", title:"Canvas · "+comps.length+"p · "+wires.length+"w", trust:"canvas", preset:null, netlist:netlist, svg:svg};
}

/* Expanded verified library */
var LIB = {
  led_series:{id:"led_series",title:"LED Series + Resistor",preset:"led_series",trust:"verified",keywords:["led series","led circuit","led diagram","ballast"],
    svg:function(){return drawChain(["battery","resistor","led"],this.title,"Verified teaching diagram");}},
  ohms_series:{id:"ohms_series",title:"Ohm's Law",preset:"led_series",trust:"verified",keywords:["ohm","ohms law","ohm diagram","v=ir"],
    svg:function(){return drawChain(["battery","resistor"],this.title,"Verified teaching diagram");}},
  voltage_divider:{id:"voltage_divider",title:"Voltage Divider",preset:null,trust:"verified",keywords:["voltage divider","potential divider","divider"],
    svg:function(){return drawDivider(this.title);}},
  current_divider:{id:"current_divider",title:"Parallel current paths",preset:null,trust:"verified",keywords:["current divider","parallel current"],
    svg:function(){return drawChain(["battery","resistor"],this.title+" (use parallel in Builder)","Verified concept");}},
  half_wave:{id:"half_wave",title:"Half-wave rectifier",preset:null,trust:"verified",keywords:["half wave","halfwave"],
    svg:function(){return drawChain(["ac_source","diode","resistor"],this.title,"Verified teaching diagram");}},
  bridge:{id:"bridge",title:"Bridge rectifier",preset:null,trust:"verified",keywords:["bridge rectifier","full wave","fullwave"],
    svg:function(){return drawBridge(this.title);}},
  rc_series:{id:"rc_series",title:"Series RC",preset:null,trust:"verified",keywords:["rc circuit","series rc"],
    svg:function(){return drawChain(["battery","resistor","capacitor"],this.title,"τ = RC");}},
  rl_series:{id:"rl_series",title:"Series RL",preset:null,trust:"verified",keywords:["rl circuit","series rl"],
    svg:function(){return drawChain(["battery","resistor","inductor"],this.title,"τ = L/R");}},
  rlc_series:{id:"rlc_series",title:"Series RLC",preset:null,trust:"verified",keywords:["rlc","series rlc"],
    svg:function(){return drawChain(["ac_source","resistor","inductor","capacitor"],this.title,"Verified teaching diagram");}},
  motor_switch:{id:"motor_switch",title:"Motor + Switch",preset:"motor_switch",trust:"verified",keywords:["motor switch","dc motor diagram"],
    svg:function(){return drawChain(["battery","switch","motor"],this.title,"Verified teaching diagram");}},
  transistor_switch:{id:"transistor_switch",title:"NPN lamp switch",preset:null,trust:"verified",keywords:["transistor switch","npn switch","bjt switch"],
    svg:function(){return drawChain(["battery","lamp","bjt_npn"],this.title,"Verified teaching diagram");}},
  relay_driver:{id:"relay_driver",title:"Transistor + Relay",preset:null,trust:"verified",keywords:["relay driver","transistor relay"],
    svg:function(){return drawRelayDriver(this.title);}},
  pot_dimmer:{id:"pot_dimmer",title:"Potentiometer dimmer",preset:null,trust:"verified",keywords:["pot dimmer","potentiometer led","dimmer"],
    svg:function(){return drawChain(["battery","potentiometer","led"],this.title,"Verified teaching diagram");}},
  dol:{id:"dol",title:"DOL starter (concept)",preset:null,trust:"verified",keywords:["dol","dol starter","direct on line"],
    svg:function(){return svgRoot(340,170,"DOL concept",
      Box(16,48,50,28,"START","#86efac")+L(66,62,96,62)+Box(96,48,44,28,"STOP","#fbbf24")+L(140,62,170,62)+Box(170,44,78,36,"Coil+OLR","#22d3ee")+Box(96,110,100,30,"Motor","#f472b6"),
      "Verified concept · Industrial Lab");}},
  star_delta:{id:"star_delta",title:"Star-Delta (concept)",preset:null,trust:"verified",keywords:["star delta","star-delta","stardelta"],
    svg:function(){return svgRoot(320,150,"Star-Delta",T(40,80,"Y start → Δ run","#67e8f9",13),"Verified concept");}},
  not_gate:{id:"not_gate",title:"NOT gate",preset:null,trust:"verified",keywords:["not gate","inverter logic"],
    svg:function(){return svgRoot(300,140,"NOT gate",L(40,70,90,70)+Path("M90 50 L140 70 L90 90 Z","#22d3ee")+'<circle cx="148" cy="70" r="5" fill="none" stroke="#22d3ee" stroke-width="2"/>'+L(153,70,220,70)+T(50,60,"A") +T(230,60,"Y"),"Verified logic symbol");}},
  and_gate:{id:"and_gate",title:"AND gate",preset:null,trust:"verified",keywords:["and gate","logic and"],
    svg:function(){return svgRoot(300,150,"AND gate",L(40,55,90,55)+L(40,95,90,95)+Path("M90 45 H130 Q170 70 130 95 H90 Z","#22d3ee")+L(170,70,230,70),"Verified logic symbol");}},
  timer_555:{id:"timer_555",title:"555 astable (block)",preset:null,trust:"verified",keywords:["555","timer 555","astable"],
    svg:function(){return draw555Astable(this.title);}},
  zener_reg:{id:"zener_reg",title:"Zener shunt idea",preset:null,trust:"verified",keywords:["zener","zener regulator"],
    svg:function(){return drawChain(["battery","resistor","diode"],this.title,"Teaching idea · polarity matters");}},
  fuse_protect:{id:"fuse_protect",title:"Fuse + load",preset:null,trust:"verified",keywords:["fuse protection","fuse circuit"],
    svg:function(){return drawChain(["battery","fuse","lamp"],this.title,"Verified teaching diagram");}}
};


  /* ===== v9.11 Topology / Intent Engine ===== */
  function detectTopology(q){
    var n=norm(q), nodes=[], edges=[], warnings=[], intent="generic";
    function has(re){return re.test(n);}
    if(has(/led/)) intent="led";
    else if(has(/relay/)) intent="relay";
    else if(has(/motor/)) intent="motor";
    else if(has(/op.?amp|amplifier/)) intent="amplifier";
    else if(has(/rectifier|ac to dc|dc to ac/)) intent="power_conversion";
    else if(has(/filter|low.?pass|high.?pass/)) intent="filter";
    else if(has(/logic|and gate|or gate|nand|nor|xor|not gate/)) intent="logic";
    if(has(/12\s*v|12v/)) nodes.push({role:"source",value:"12V"});
    else if(has(/9\s*v|9v/)) nodes.push({role:"source",value:"9V"});
    else if(has(/5\s*v|5v/)) nodes.push({role:"source",value:"5V"});
    if(has(/230\s*v|mains|ac supply/)) nodes.push({role:"source",value:"230VAC"});
    if(has(/battery|cell|dc source/)) nodes.push({role:"source",type:"battery"});
    if(has(/resistor|ohm/)) nodes.push({role:"passive",type:"resistor"});
    if(has(/capacitor|cap/)) nodes.push({role:"passive",type:"capacitor"});
    if(has(/inductor|coil/)) nodes.push({role:"passive",type:"inductor"});
    if(has(/diode/)) nodes.push({role:"semiconductor",type:"diode"});
    if(has(/mosfet|nmos/)) nodes.push({role:"switch",type:"mosfet_n"});
    if(has(/transistor|bjt|npn/)) nodes.push({role:"switch",type:"bjt_npn"});
    if(has(/relay/)) nodes.push({role:"control",type:"relay"});
    if(has(/motor/)) nodes.push({role:"load",type:"motor"});
    if(has(/led/)) nodes.push({role:"load",type:"led"});
    if(has(/lamp|bulb/)) nodes.push({role:"load",type:"lamp"});
    if(has(/switch|button/)) nodes.push({role:"control",type:"switch"});
    if(intent==="led" && has(/battery|9\s*v|12\s*v|5\s*v/) && !has(/resistor|current limit/))
      warnings.push("LED protection resistor is not specified; add an appropriate series resistor.");
    if(has(/relay|motor|bjt|mosfet/) && !has(/diode|flyback|freewheel/))
      warnings.push("Inductive-load protection is not specified; consider a flyback/freewheel diode where applicable.");
    if(has(/mains|230\s*v/)) warnings.push("Mains voltage detected: use appropriate isolation, ratings and safety procedures.");
    return {intent:intent,nodes:nodes,edges:edges,warnings:warnings};
  }
  function topologyNetlist(t){
    var lines=["TOPOLOGY ANALYSIS","Intent: "+t.intent,"Nodes: "+t.nodes.length];
    t.nodes.forEach(function(x,i){ lines.push((i+1)+". "+x.role+" · "+(x.type||x.value||"?")); });
    if(t.warnings.length){ lines.push("Warnings:"); t.warnings.forEach(function(w){lines.push("- "+w);}); }
    return lines.join("\n");
  }
  function buildTopologyDiagram(q){
    var t=detectTopology(q), types=t.nodes.map(function(x){return x.type;}).filter(Boolean);
    if(t.intent==="motor" && /h.?bridge|reverse|forward reverse/.test(norm(q))) return {id:"top_hbridge",title:"Topology: Motor H-Bridge",trust:"topology",netlist:topologyNetlist(t),warnings:t.warnings,svg:function(){return drawHBridge("Motor H-Bridge · topology");}};
    if(t.intent==="amplifier" && /inverting/.test(norm(q))) return {id:"top_invamp",title:"Topology: Inverting Op-Amp",trust:"topology",netlist:topologyNetlist(t),warnings:t.warnings,svg:function(){return drawOpAmp("Inverting Op-Amp · topology",false);}};
    if(t.intent==="amplifier" && /non.?inverting/.test(norm(q))) return {id:"top_noninvamp",title:"Topology: Non-inverting Op-Amp",trust:"topology",netlist:topologyNetlist(t),warnings:t.warnings,svg:function(){return drawOpAmp("Non-inverting Op-Amp · topology",true);}};
    return {id:"topology_sketch",title:"Topology: "+String(q||"").slice(0,38),trust:"topology",netlist:topologyNetlist(t),warnings:t.warnings,svg:function(){return drawChain(types.length?types:["battery","resistor","led"],"Topology sketch","Parsed intent · verify component terminals");}};
  }
  var __oldAnswer=answer;
  answer=function(q){
    var r=__oldAnswer(q);
    if(r) return r;
    if(/how to|kaise|banao|bana do|design|build|connect|jodo|wiring|circuit/.test(norm(q))){
      var d=buildTopologyDiagram(q);
      return buildAnswer(d);
    }
    return null;
  };
  window.NilSparkLabTopology={version:"9.11",analyze:detectTopology,netlist:topologyNetlist,diagram:buildTopologyDiagram};

  /* ===== v6.23 Universal Circuit Library Expansion ===== */
  function drawOpAmp(title, nonInv){
    var body = L(25,82,85,82)+L(25,118,85,118)+Box(85,55,70,90,"OP-AMP","#22d3ee")
      +T(94,82,"+","#86efac",11)+T(94,122,"-","#fda4af",11)
      +L(155,100,225,100)+L(225,100,225,60)+SYM.resistor(190,60).svg
      +L(155,100,225,100)+T(160,94,"OUT","#67e8f9",8)
      +L(225,60,260,60)+L(260,60,260,100)+L(260,100,225,100)
      +(nonInv ? T(34,150,"Vin → + input","#94a3b8",8) : T(30,150,"Vin → Rin → - input","#94a3b8",8));
    return svgRoot(310,185,title,body,nonInv?"Concept: Av = 1 + Rf/Rin":"Concept: Av = -Rf/Rin");
  }
  function drawWheatstone(title){
    var b=Path("M150 55 L260 105 L150 155 L40 105 Z","#22d3ee",2)
      +SYM.resistor(105,80).svg+SYM.resistor(195,80).svg
      +SYM.resistor(105,130).svg+SYM.resistor(195,130).svg
      +L(40,105,25,105)+L(260,105,285,105)+T(8,101,"Vs","#fbbf24",9)+T(286,101,"Vout","#86efac",9)
      +T(132,40,"R1","#f9a8d4",8)+T(202,40,"R2","#f9a8d4",8)+T(132,174,"R3","#f9a8d4",8)+T(202,174,"R4","#f9a8d4",8);
    return svgRoot(320,205,title,b,"Concept bridge · balance when ratios match");
  }
  function drawHBridge(title){
    var b=Box(55,35,60,35,"S1","#86efac")+Box(205,35,60,35,"S2","#86efac")
      +Box(55,125,60,35,"S3","#fda4af")+Box(205,125,60,35,"S4","#fda4af")
      +Box(125,75,70,45,"M","#c4b5fd")
      +L(85,70,125,87)+L(235,70,195,87)+L(85,125,125,108)+L(235,125,195,108)
      +L(85,20,85,35)+L(235,20,235,35)+T(72,16,"+V","#fbbf24",8)+T(222,16,"+V","#fbbf24",8)
      +T(118,178,"H-bridge concept · diagonal switches reverse motor polarity","#64748b",8);
    return svgRoot(320,195,title,b,"Concept diagram");
  }
  function drawGate(title, gate){
    var shape=gate==="NOT"?Path("M105 55 L105 105 L160 80 Z","#22d3ee",2)+"<circle cx=168"+" cy=80 r=5 fill=\"none\" stroke=\"#22d3ee\" stroke-width=\"2\"/>"
      :Box(105,50,75,60,gate,"#22d3ee");
    return svgRoot(300,150,title,L(30,65,105,65)+L(30,95,105,95)+shape+L(180,80,250,80)+T(32,55,"A","#86efac",8)+T(32,102,"B","#86efac",8)+T(255,75,"Y","#86efac",8),"Logic concept");
  }
  function drawBuck(title){
    return svgRoot(360,170,title,Box(20,62,55,36,"DC","#fbbf24")+L(75,80,110,80)+Box(110,62,55,36,"SW","#86efac")+L(165,80,205,80)+SYM.inductor(220,80).svg+L(240,80,275,80)+Box(275,62,55,36,"LOAD","#a78bfa")+L(205,80,205,125)+SYM.diode(205,140).svg+L(205,155,75,155)+L(75,155,75,98),"Concept · switching regulator");
  }
  function addUniversalTemplates(){
    var extra={
      transformer_rectifier:{id:"transformer_rectifier",title:"Transformer + Bridge Rectifier + Filter",trust:"verified",keywords:["transformer rectifier","transformer bridge rectifier","ac to dc power supply","transformer power supply","ac dc power supply"],svg:function(){return drawChain(["ac_source","transformer","bridge_rectifier","capacitor","resistor"],this.title,"Teaching block · verify ratings and polarity");}},
      full_wave_center_tap:{id:"full_wave_center_tap",title:"Full-wave Center-tap Rectifier",trust:"verified",keywords:["center tap rectifier","centre tap rectifier","full wave center tap"],svg:function(){return drawChain(["ac_source","transformer","diode","diode","capacitor","resistor"],this.title,"Teaching concept");}},
      rc_lowpass:{id:"rc_lowpass",title:"RC Low-pass Filter",trust:"verified",keywords:["rc low pass","rc lowpass","low pass filter","lowpass filter"],svg:function(){return drawChain(["ac_source","resistor","capacitor"],this.title,"Vout taken across capacitor");}},
      rc_highpass:{id:"rc_highpass",title:"RC High-pass Filter",trust:"verified",keywords:["rc high pass","rc highpass","high pass filter","highpass filter"],svg:function(){return drawChain(["ac_source","capacitor","resistor"],this.title,"Vout taken across resistor");}},
      rl_filter:{id:"rl_filter",title:"RL Filter",trust:"verified",keywords:["rl filter","rl low pass","rl high pass"],svg:function(){return drawChain(["ac_source","resistor","inductor"],this.title,"Frequency-dependent filter concept");}},
      wheatstone:{id:"wheatstone",title:"Wheatstone Bridge",trust:"verified",keywords:["wheatstone bridge","wheatstone","resistance bridge"],svg:function(){return drawWheatstone(this.title);}},
      opamp_inverting:{id:"opamp_inverting",title:"Inverting Op-Amp",trust:"verified",keywords:["inverting op amp","inverting amplifier","opamp inverting","op amp inverting"],svg:function(){return drawOpAmp(this.title,false);}},
      opamp_noninverting:{id:"opamp_noninverting",title:"Non-inverting Op-Amp",trust:"verified",keywords:["non inverting op amp","non-inverting amplifier","opamp noninverting","op amp non inverting"],svg:function(){return drawOpAmp(this.title,true);}},
      mosfet_switch:{id:"mosfet_switch",title:"MOSFET Low-side Switch",trust:"verified",keywords:["mosfet switch","mosfet low side","nmos switch","n mos switch"],svg:function(){return drawChain(["battery","resistor","mosfet_n","motor"],this.title,"Concept · gate drive and load path");}},
      h_bridge:{id:"h_bridge",title:"H-Bridge Motor Driver",trust:"verified",keywords:["h bridge","h-bridge","motor driver h bridge"],svg:function(){return drawHBridge(this.title);}},
      nand_gate:{id:"nand_gate",title:"NAND Gate",trust:"verified",keywords:["nand gate","nand"],svg:function(){return drawGate(this.title,"NAND");}},
      nor_gate:{id:"nor_gate",title:"NOR Gate",trust:"verified",keywords:["nor gate","nor"],svg:function(){return drawGate(this.title,"NOR");}},
      xor_gate:{id:"xor_gate",title:"XOR Gate",trust:"verified",keywords:["xor gate","xor"],svg:function(){return drawGate(this.title,"XOR");}},
      buck_converter:{id:"buck_converter",title:"Buck Converter",trust:"verified",keywords:["buck converter","step down dc dc","dc dc buck"],svg:function(){return drawBuck(this.title);}},
      boost_converter:{id:"boost_converter",title:"Boost Converter",trust:"verified",keywords:["boost converter","step up dc dc","dc dc boost"],svg:function(){return drawChain(["battery","inductor","switch","diode","capacitor","resistor"],this.title,"Concept · switching regulator");}},
      zener_regulator:{id:"zener_regulator",title:"Zener Shunt Regulator",trust:"verified",keywords:["zener regulator","zener voltage regulator","zener shunt"],svg:function(){return drawChain(["battery","resistor","diode","resistor"],this.title,"Teaching concept · zener polarity matters");}},
      relay_control:{id:"relay_control",title:"Relay Control Circuit",trust:"verified",keywords:["relay control","relay circuit","relay driver circuit"],svg:function(){return drawRelayDriver(this.title);}},
      common_emitter:{id:"common_emitter",title:"Common-emitter Amplifier",trust:"verified",keywords:["common emitter","ce amplifier","common emitter amplifier"],svg:function(){return drawChain(["battery","resistor","bjt_npn","resistor"],this.title,"Concept block · bias network omitted");}},
      motor_reverse:{id:"motor_reverse",title:"Motor Reversing / H-Bridge Concept",trust:"verified",keywords:["motor reverse","motor reversing","forward reverse motor"],svg:function(){return drawHBridge(this.title);}}
    };
    Object.keys(extra).forEach(function(k){LIB[k]=extra[k];});
  }
  addUniversalTemplates();
var ALIAS=[[/batter|cell|dc source|बैटरी|सेल/,"battery"],[/ac source|mains/,"ac_source"],[/resistor|resistance/,"resistor"],
  [/capacitor/,"capacitor"],[/\bled\b/,"led"],[/diode/,"diode"],[/motor|मोटर/,"motor"],[/switch|button/,"switch"],
  [/fuse/,"fuse"],[/transistor|npn|bjt/,"bjt_npn"],[/transformer|transfarmer|transfarmar|ट्रांसफॉर्मर|ट्रांसफार्मर/,"transformer"],[/bridge|rectifier|ब्रिज|रेक्टिफायर/,"bridge_rectifier"],
  [/relay/,"relay"],[/inductor|coil/,"inductor"],[/potentiometer|pot\b/,"potentiometer"]];

function detectTypes(q){
  var n=norm(q),t=[];
  ALIAS.forEach(function(p){ if(p[0].test(n)&&t.indexOf(p[1])<0) t.push(p[1]); });
  return t;
}
function universalDraw(q){
  var types=detectTypes(q), title="Sketch: "+String(q||"").slice(0,42);
  if(/divider/.test(norm(q))) return {id:"sk_div",title:title,trust:"sketch",preset:null,netlist:"Sketch",svg:function(){return drawDivider(title);}};
  if(/bridge|full.?wave/.test(norm(q))) return {id:"sk_br",title:title,trust:"sketch",preset:null,netlist:"Sketch",svg:function(){return drawBridge(title);}};
  if(!types.length) types=["battery","resistor","led"];
  return {id:"sk",title:title,trust:"sketch",preset:null,netlist:"Sketch parts: "+types.join(", "),
    svg:function(){return drawChain(types,title,"Sketch · best-effort · not certified");}};
}

function wantsDiagram(q){ return /diagram|schematic|draw|dikha|डायग्राम|figure|sketch|circuit dikhao|ka diagram|show circuit|banao/.test(norm(q)); }
function wantsCurrent(q){ return /current circuit|is circuit|mere circuit|my circuit|canvas|jo banaya|abhi wala|builder circuit|auto diagram|geometry/.test(norm(q)); }
function findLibrary(q){
  var n=norm(q),best=null,bs=0;
  Object.keys(LIB).forEach(function(id){
    var d=LIB[id],s=0;
    (d.keywords||[]).forEach(function(k){ if(n.indexOf(norm(k))>=0) s+=k.length+8; });
    if(s>bs){bs=s;best=d;}
  });
  return bs>=6?best:null;
}
function buildAnswer(d){
  var h=false; try{h=typeof currentLang!=="undefined"&&currentLang==="hi";}catch(e){}
  var trust=d.trust||"sketch";
  var badge=trust==="verified"?"✓ Verified library":trust==="canvas"?"◎ Canvas geometry":"✎ Sketch best-effort";
  var tip=trust==="verified"?(h?"Library verified teaching diagram.":"Verified teaching diagram.")
    :trust==="canvas"?(h?"Builder x,y + wire paths se.":"From Builder positions + routed wires.")
    :(h?"यह best-effort schematic है; वास्तविक wiring/ratings Builder में verify करें।":"Best-effort schematic; verify wiring and ratings in Builder.");
  return { text:(h?"📐 डायग्राम — ":"📐 Diagram — ")+d.title+"\n\n"+badge+"\n"+tip, diagram:d };
}
function answer(q){
  q=String(q||"");
  if(wantsCurrent(q)) return buildAnswer(autoFromCanvas());
  var lib=findLibrary(q); if(lib) return buildAnswer(lib);
  if(wantsDiagram(q)||detectTypes(q).length>0||/circuit|schematic|starter|rectifier|transformer|transfarmer|wheatstone|op.?amp|amplifier|filter|converter|bridge|gate|h.?bridge|regulator|motor|inverter/.test(norm(q)))
    return buildAnswer(universalDraw(q));
  return null;
}

/** Export last diagram SVG as downloadable file */
function exportSvg(svgText, filename){
  try{
    var blob=new Blob([svgText],{type:"image/svg+xml;charset=utf-8"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");
    a.href=url; a.download=filename||"nilsparklab-diagram.svg";
    document.body.appendChild(a); a.click();
    setTimeout(function(){ try{URL.revokeObjectURL(url); a.remove();}catch(e){} }, 500);
    return true;
  }catch(e){ return false; }
}
function exportLast(){
  var d=window.__elabLastDiagram;
  if(!d||typeof d.svg!=="function") return false;
  return exportSvg(d.svg(), "nilsparklab-"+(d.id||"diagram")+".svg");
}

window.NilSparkLabDiagrams = {
  version: "9.11-topology",
  lib: LIB,
  answer: answer,
  draw: universalDraw,
  fromCanvas: autoFromCanvas,
  netlist: function(){ return buildNetlist(getComps(), getWires()); },
  exportSvg: exportSvg,
  exportLast: exportLast,
  list: function(){ return Object.keys(LIB).map(function(k){ return LIB[k].title; }); },
  countVerified: function(){ return Object.keys(LIB).length; }
};
})();
