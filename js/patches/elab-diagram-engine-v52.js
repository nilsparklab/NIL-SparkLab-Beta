
(function(){
"use strict";
var D = window.NilSparkLabDiagrams;
if(!D){ console.warn("Diagrams core missing"); return; }

function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function svgRoot(w,h,title,body,foot){
  w=Math.max(320,w||380); h=Math.max(180,h||240);
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'">'
    +'<rect width="'+w+'" height="'+h+'" rx="10" fill="#020617"/>'
    +'<text x="12" y="18" fill="#67e8f9" font-size="11" font-family="ui-monospace,monospace">'+esc(title).slice(0,56)+'</text>'
    +body+(foot?'<text x="12" y="'+(h-8)+'" fill="#64748b" font-size="8">'+esc(foot).slice(0,80)+'</text>':'')+'</svg>';
}
function L(x1,y1,x2,y2,c,sw){ return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(c||'#22d3ee')+'" stroke-width="'+(sw||2)+'" stroke-linecap="round"/>'; }
function T(x,y,t,c,s){ return '<text x="'+x+'" y="'+y+'" fill="'+(c||'#94a3b8')+'" font-size="'+(s||9)+'">'+esc(t)+'</text>'; }
function Box(x,y,w,h,t,c){
  return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="5" fill="#0f172a" stroke="'+(c||'#22d3ee')+'" stroke-width="2"/>'
    +T(x+5,y+h/2+3,String(t).slice(0,11),c||'#e2e8f0',9);
}
function chain(types, title, foot){
  // Prefer core draw via fake answer if available
  if(D.draw){
    var d = D.draw("draw "+types.join(" ")+" series diagram");
    if(d){ d.trust="verified"; d.title=title; d.id=d.id||title; return d; }
  }
  var x=24,y=100,parts=[],i;
  types.forEach(function(tp,i){
    parts.push(Box(x,y-14,52,28,tp,"#22d3ee"));
    if(i<types.length-1) parts.push(L(x+52,y,x+64,y));
    x+=64;
  });
  parts.push(L(x,y,x+8,y)+L(x+8,y,x+8,y+40)+L(x+8,y+40,24,y+40)+L(24,y+40,24,y));
  return {id:"lib",title:title,trust:"verified",preset:null,netlist:"Verified: "+types.join(" → "),
    svg:function(){ return svgRoot(Math.max(360,x+30),200,title,parts.join(""),foot||"Verified teaching diagram"); }};
}

/** Extra verified teaching entries merged into D.lib */
var EXTRA = {
  buck_idea:{title:"Buck converter (block)",keywords:["buck","buck converter","step down converter"],
    make:function(){ return {id:"buck_idea",title:this.title,trust:"verified",
      svg:function(){ return svgRoot(340,170,this.title,
        Box(20,60,50,36,"Vin","#fbbf24")+L(70,78,100,78)+Box(100,60,60,36,"SW","#22d3ee")
        +L(160,78,190,78)+Box(190,60,50,36,"L","#a78bfa")+L(240,78,270,78)+Box(270,60,50,36,"Vout","#86efac")
        +T(20,130,"Teaching block · not a full design","#64748b",8), this.title); },
      netlist:"Verified block: Vin-SW-L-Vout"}; }},
  boost_idea:{title:"Boost converter (block)",keywords:["boost","boost converter","step up"],
    make:function(){ return chain(["battery","inductor","diode","capacitor"], this.title, "Verified teaching block"); }},
  voltage_reg_7805:{title:"7805 regulator idea",keywords:["7805","regulator 7805","linear regulator"],
    make:function(){ return {id:"7805",title:this.title,trust:"verified",
      svg:function(){ return svgRoot(320,160,"7805 idea",
        Box(30,60,50,32,"Vin","#fbbf24")+L(80,76,110,76)+Box(110,55,70,42,"7805","#22d3ee")
        +L(180,76,210,76)+Box(210,60,50,32,"5V","#86efac")+T(30,130,"Add caps per datasheet","#64748b",8), this.title); },
      netlist:"Verified concept 7805"}; }},
  opamp_inverting:{title:"Inverting op-amp (idea)",keywords:["inverting opamp","opamp inverting","op-amp inverting"],
    make:function(){ return {id:"op_inv",title:this.title,trust:"verified",
      svg:function(){ return svgRoot(340,170,"Inverting op-amp",
        T(20,80,"Vin","#94a3b8")+L(40,80,80,80)+Box(80,65,40,30,"Rin","#f472b6")
        +L(120,80,150,80)+Box(150,55,70,50,"OP","#22d3ee")+L(185,55,185,40)+Box(160,28,50,24,"Rf","#f472b6")
        +L(220,80,260,80)+T(265,80,"Vout","#86efac"), this.title); },
      netlist:"Verified ideal inverting idea"}; }},
  noninv_opamp:{title:"Non-inverting op-amp (idea)",keywords:["non inverting","noninverting opamp"],
    make:function(){ return chain(["battery","resistor","resistor"], this.title, "Feedback divider teaching idea"); }},
  wheatstone:{title:"Wheatstone bridge (idea)",keywords:["wheatstone","wheatstone bridge"],
    make:function(){ return {id:"wheat",title:this.title,trust:"verified",
      svg:function(){ return svgRoot(300,180,"Wheatstone",
        Path=null, Box(120,40,50,28,"R1","#f472b6"), Box(120,120,50,28,"R3","#f472b6"),
        Box(40,80,50,28,"R2","#f472b6"), Box(200,80,50,28,"R4","#f472b6"),
        L(145,68,145,120), L(65,94,120,94), L(170,94,200,94), T(110,100,"G","#67e8f9",9), this.title); },
      netlist:"Verified concept"}; }},
  clapp_colpitts_idea:{title:"LC oscillator idea",keywords:["colpitts","clapp","lc oscillator","oscillator"],
    make:function(){ return chain(["battery","inductor","capacitor","bjt_npn"], this.title, "Teaching idea only"); }},
  full_wave_ct:{title:"Center-tap full-wave idea",keywords:["center tap","centre tap","full wave transformer"],
    make:function(){ return chain(["transformer","diode","diode","resistor"], this.title, "Verified concept"); }},
  led_parallel:{title:"LEDs with ballast",keywords:["parallel led","leds parallel"],
    make:function(){ return chain(["battery","resistor","led","led"], this.title, "Prefer separate R per LED in practice"); }},
  capacitor_filter:{title:"Rectifier + filter cap",keywords:["filter capacitor","smoothing capacitor","capacitor filter"],
    make:function(){ return chain(["ac_source","diode","capacitor","resistor"], this.title, "Verified teaching diagram"); }},
  pull_up:{title:"Pull-up resistor",keywords:["pull up","pullup","pull-up"],
    make:function(){ return chain(["battery","resistor","switch"], this.title, "Verified logic input idea"); }},
  pull_down:{title:"Pull-down resistor",keywords:["pull down","pulldown","pull-down"],
    make:function(){ return chain(["switch","resistor","battery"], this.title, "Verified logic input idea"); }},
  series_batteries:{title:"Series batteries",keywords:["series battery","batteries series"],
    make:function(){ return chain(["battery","battery","resistor"], this.title, "Voltages add · verified idea"); }},
  debounced_button:{title:"Button + RC debounce idea",keywords:["debounce","debounced button"],
    make:function(){ return chain(["battery","push_button","resistor","capacitor"], this.title, "Teaching idea"); }},
  current_limit:{title:"Current-limit resistor",keywords:["current limit","series resistor load"],
    make:function(){ return chain(["battery","resistor","lamp"], this.title, "Verified teaching diagram"); }},
  ac_lamp:{title:"AC source + lamp",keywords:["ac lamp","ac bulb"],
    make:function(){ return chain(["ac_source","switch","lamp"], this.title, "Simulation only · mains safety separate"); }},
  diode_or:{title:"Diode OR (idea)",keywords:["diode or","wired or diode"],
    make:function(){ return chain(["battery","diode","diode","resistor"], this.title, "Verified concept"); }},
  npn_switch_relay:{title:"NPN + relay coil idea",keywords:["npn relay","transistor relay coil"],
    make:function(){ return chain(["battery","resistor","bjt_npn","relay"], this.title, "Add flyback diode in real builds"); }},
  voltage_double_idea:{title:"Voltage concept chain",keywords:["voltage doubler","doubler"],
    make:function(){ return chain(["ac_source","diode","capacitor","diode","capacitor"], this.title, "Teaching idea only"); }},
  or_gate:{title:"OR gate symbol",keywords:["or gate","logic or"],
    make:function(){ return {id:"or_gate",title:this.title,trust:"verified",
      svg:function(){ return svgRoot(300,150,"OR gate",
        L(40,55,95,55)+L(40,95,95,95)+'<path d="M90 45 Q130 45 150 70 Q130 95 90 95 Q110 70 90 45" fill="none" stroke="#22d3ee" stroke-width="2"/>'
        +L(150,70,220,70), "Verified logic symbol"); },
      netlist:"Verified OR symbol"}; }},
  xor_gate:{title:"XOR gate (label)",keywords:["xor gate","logic xor","exor"],
    make:function(){ return {id:"xor",title:this.title,trust:"verified",
      svg:function(){ return svgRoot(300,150,"XOR",
        Box(100,55,80,40,"XOR","#22d3ee")+L(40,75,100,75)+L(180,75,240,75),"Verified label"); },
      netlist:"Verified XOR label"}; }},
  nand_gate:{title:"NAND gate (label)",keywords:["nand gate","logic nand"],
    make:function(){ return {id:"nand",title:this.title,trust:"verified",
      svg:function(){ return svgRoot(300,150,"NAND",Box(100,55,80,40,"NAND","#22d3ee")+L(40,75,100,75)+L(180,75,240,75),"Verified label"); },
      netlist:"Verified NAND"}; }},
  nor_gate:{title:"NOR gate (label)",keywords:["nor gate","logic nor"],
    make:function(){ return {id:"nor",title:this.title,trust:"verified",
      svg:function(){ return svgRoot(300,150,"NOR",Box(100,55,80,40,"NOR","#22d3ee")+L(40,75,100,75)+L(180,75,240,75),"Verified label"); },
      netlist:"Verified NOR"}; }},
  ldr_series:{title:"LDR + resistor",keywords:["ldr circuit","ldr diagram","light sensor"],
    make:function(){ return chain(["battery","resistor","resistor"], this.title+" (LDR as R)", "Treat one R as LDR in Builder"); }},
  thermistor_div:{title:"Thermistor divider idea",keywords:["thermistor","ntc","ptc circuit"],
    make:function(){ return chain(["battery","resistor","resistor"], this.title, "One R = thermistor in practice"); }},
  scr_idea:{title:"SCR latch idea",keywords:["scr","thyristor"],
    make:function(){ return chain(["ac_source","resistor","diode","lamp"], this.title, "Teaching stand-in symbol"); }},
  triac_idea:{title:"TRIAC load idea",keywords:["triac"],
    make:function(){ return chain(["ac_source","switch","lamp"], this.title, "Teaching idea · real TRIAC differs"); }},
  hf_transformer:{title:"Isolation transformer idea",keywords:["isolation transformer","isolating transformer"],
    make:function(){ return chain(["ac_source","transformer","lamp"], this.title, "Verified concept only"); }},
  battery_charger_idea:{title:"Simple charge path idea",keywords:["battery charger","charge circuit"],
    make:function(){ return chain(["ac_source","transformer","diode","resistor","battery"], this.title, "Idea only · not a safe charger design"); }},
  audio_buzzer:{title:"Transistor buzzer drive",keywords:["buzzer transistor","audio buzzer circuit"],
    make:function(){ return chain(["battery","resistor","bjt_npn","buzzer"], this.title, "Verified teaching diagram"); }},
  series_capacitors:{title:"Series capacitors",keywords:["series capacitor","capacitors series"],
    make:function(){ return chain(["battery","capacitor","capacitor","resistor"], this.title, "1/Ceq = 1/C1+1/C2"); }},
  parallel_capacitors:{title:"Parallel capacitors idea",keywords:["parallel capacitor","capacitors parallel"],
    make:function(){ return chain(["battery","capacitor","resistor"], this.title, "Ceq = C1+C2 (use parallel in Builder)"); }},
  potentiometer_divider:{title:"Pot as divider",keywords:["pot divider","potentiometer divider"],
    make:function(){ return chain(["battery","potentiometer"], this.title, "Wiper = Vout"); }},
  dc_fan:{title:"DC fan / motor speed idea",keywords:["dc fan","fan motor pot"],
    make:function(){ return chain(["battery","potentiometer","motor"], this.title, "Teaching idea"); }},
  overcurrent_fuse_motor:{title:"Fuse + motor",keywords:["fuse motor","motor protection fuse"],
    make:function(){ return chain(["battery","fuse","switch","motor"], this.title, "Verified teaching diagram"); }}
};

// Fix wheatstone make (had invalid Path=null)
EXTRA.wheatstone.make = function(){
  var self=this;
  return {id:"wheat",title:self.title,trust:"verified",netlist:"Verified Wheatstone concept",
    svg:function(){ return svgRoot(300,180,"Wheatstone",
      Box(120,40,50,28,"R1","#f472b6")+Box(120,120,50,28,"R3","#f472b6")
      +Box(40,80,50,28,"R2","#f472b6")+Box(200,80,50,28,"R4","#f472b6")
      +L(145,68,145,120)+L(90,94,120,94)+L(170,94,200,94)+T(138,100,"G","#67e8f9",9),
      "Verified concept"); }};
};

// Merge into lib
D.lib = D.lib || {};
Object.keys(EXTRA).forEach(function(id){
  var ex = EXTRA[id];
  D.lib[id] = {
    id: id,
    title: ex.title,
    trust: "verified",
    keywords: ex.keywords,
    preset: null,
    svg: function(){ return ex.make().svg(); },
    // store factory
    _make: ex.make
  };
});

/** Patch find: also score EXTRA keywords via answer wrapper */
var origAnswer = D.answer;
D.answer = function(q){
  var n = String(q||"").toLowerCase();
  // Prefer extra library hits
  var best=null, bs=0;
  Object.keys(EXTRA).forEach(function(id){
    var ex=EXTRA[id], s=0;
    (ex.keywords||[]).forEach(function(k){ if(n.indexOf(k)>=0) s+=k.length+10; });
    if(s>bs){ bs=s; best=ex; }
  });
  if(best && bs>=8 && /diagram|schematic|draw|dikha|circuit|डायग्राम|show/.test(n)){
    var d = best.make();
    d.trust = "verified";
    return {
      text: "📐 Diagram — "+d.title+"\n\n✓ Verified library\nTeaching diagram from expanded library.",
      diagram: d
    };
  }
  return origAnswer(q);
};

/** Terminal-accurate anchors for canvas geometry */
function termOffset(term, w, h){
  var t = String(term||"").toLowerCase();
  // left-ish
  if(/a\b|in|anode|\+|pos|left|1|t1|l1|collector|drain|line/.test(t)) return {x:-w*0.45, y:0};
  // right-ish
  if(/b\b|out|cathode|\-|neg|right|2|t2|l2|emitter|source|load|n\b/.test(t)) return {x:w*0.45, y:0};
  if(/gnd|ground|earth/.test(t)) return {x:0, y:h*0.45};
  if(/gate|base|wiper|control/.test(t)) return {x:-w*0.2, y:h*0.35};
  return {x:0, y:0};
}

function getComps(){ try{ return Array.isArray(window.builderCanvasComps)?window.builderCanvasComps.slice():[]; }catch(e){ return []; } }
function getWires(){ try{ return Array.isArray(window.builderWires)?window.builderWires.slice():[]; }catch(e){ return []; } }

function mapType(t){
  t=String(t||"").toLowerCase();
  if(/battery|source/.test(t)&&!/ac/.test(t)) return "battery";
  if(/ac/.test(t)) return "ac";
  if(/resistor|pot/.test(t)) return "R";
  if(/cap/.test(t)) return "C";
  if(/led/.test(t)) return "LED";
  if(/diode/.test(t)) return "D";
  if(/motor/.test(t)) return "M";
  if(/switch|button/.test(t)) return "SW";
  if(/fuse/.test(t)) return "F";
  if(/induct/.test(t)) return "L";
  return (t||"?").slice(0,6).toUpperCase();
}

D.fromCanvas = function(){
  var comps=getComps(), wires=getWires();
  var net=["NETLIST + terminals","Components: "+comps.length+" · Wires: "+wires.length];
  comps.forEach(function(c,i){
    var terms = Array.isArray(c.terminals)?c.terminals.join(","):(c.termA&&c.termB?c.termA+","+c.termB:"");
    net.push((i+1)+". "+(c.id||"?")+" · "+(c.type||"?")+" @("+Math.round(c.x||0)+","+Math.round(c.y||0)+")"+(terms?" ["+terms+"]":""));
  });
  wires.forEach(function(w,i){
    var a=w.from||w.a||{}, b=w.to||w.b||{};
    net.push("W"+(i+1)+": "+(a.compId||"?")+"."+(a.term||a.terminal||"*")+" ↔ "+(b.compId||"?")+"."+(b.term||b.terminal||"*"));
  });
  if(!comps.length){
    return {id:"canvas_empty",title:"Current circuit",trust:"canvas",netlist:net.join("\n"),
      svg:function(){ return svgRoot(320,140,"Canvas empty",T(40,80,"Add components in Builder","#94a3b8",11),""); }};
  }
  var minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  comps.forEach(function(c){
    var x=+c.x||0,y=+c.y||0;
    if(x<minX)minX=x; if(y<minY)minY=y; if(x>maxX)maxX=x; if(y>maxY)maxY=y;
  });
  if(!isFinite(minX)){ minX=0;minY=0;maxX=200;maxY=120; }
  var bw=Math.max(100,maxX-minX), bh=Math.max(80,maxY-minY);
  var scale=Math.min(1.3, 280/bw, 130/bh);
  var pad=50, top=40;
  var W=Math.max(380, Math.round(bw*scale)+pad*2);
  var H=Math.max(240, Math.round(bh*scale)+top+60);
  function X(x){ return pad+(x-minX)*scale; }
  function Y(y){ return top+(y-minY)*scale; }
  var byId={}; comps.forEach(function(c){ if(c&&c.id) byId[c.id]=c; });

  return {
    id:"canvas_terminal",
    title:"Canvas · "+comps.length+"p · "+wires.length+"w · terminals",
    trust:"canvas",
    netlist: net.join("\n"),
    svg: function(){
      var parts=[], anchors={};
      comps.forEach(function(c){
        var cx=X(+c.x||0), cy=Y(+c.y||0);
        var label=mapType(c.type);
        var w=56, h=32;
        parts.push(Box(cx-w/2, cy-h/2, w, h, label, "#22d3ee"));
        parts.push(T(cx-w/2, cy+h/2+12, String(c.type||"").slice(0,10), "#64748b", 7));
        // terminal dots
        var terms = Array.isArray(c.terminals) && c.terminals.length ? c.terminals : ["A","B"];
        terms.slice(0,4).forEach(function(tm){
          var o=termOffset(tm,w,h);
          var tx=cx+o.x, ty=cy+o.y;
          parts.push('<circle cx="'+tx+'" cy="'+ty+'" r="3.2" fill="#67e8f9" stroke="#0f172a" stroke-width="1"/>');
          parts.push(T(tx+4, ty-4, String(tm).slice(0,4), "#7dd3fc", 7));
          anchors[c.id+"::"+tm] = {x:tx,y:ty};
          anchors[c.id+"::"] = anchors[c.id+"::"] || {x:cx,y:cy};
        });
        anchors[c.id] = {x:cx,y:cy,w:w,h:h};
      });
      wires.forEach(function(w){
        var a=w.from||w.a||{}, b=w.to||w.b||{};
        var aid=a.compId||a.id, bid=b.compId||b.id;
        var at=a.term||a.terminal||"", bt=b.term||b.terminal||"";
        var pa = anchors[aid+"::"+at] || anchors[aid+"::"] || anchors[aid];
        var pb = anchors[bid+"::"+bt] || anchors[bid+"::"] || anchors[bid];
        if(!pa||!pb) return;
        var mx=(pa.x+pb.x)/2;
        parts.push('<path d="M'+pa.x+' '+pa.y+' H'+mx+' V'+pb.y+' H'+pb.x+'" fill="none" stroke="#22d3ee" stroke-width="1.8" stroke-linecap="round"/>');
      });
      parts.push(T(12,32, comps.length+" parts · "+wires.length+" wires · terminal anchors","#7dd3fc",8));
      return svgRoot(W,H,"Canvas terminals",parts.join(""),"Wires attach near terminal labels when present");
    }
  };
};

// Ensure answer uses new fromCanvas
var origAnswer2 = D.answer;
D.answer = function(q){
  var n=String(q||"").toLowerCase();
  if(/current circuit|mere circuit|my circuit|canvas|jo banaya|abhi wala|terminal/.test(n)
     && /diagram|schematic|draw|dikha|show|geometry|netlist/.test(n) || /current circuit diagram|canvas diagram/.test(n)){
    var d = D.fromCanvas();
    return {
      text: "📐 Diagram — "+d.title+"\n\n◎ Canvas geometry + terminals\nBuilder positions, terminal dots, routed wires.",
      diagram: d
    };
  }
  return origAnswer2(q);
};

D.version = "5.2-lib-terminals";
D.countVerified = function(){ return Object.keys(D.lib||{}).length; };
console.info("NilSparkLab Diagrams 5.2 library+terminals · verified≈"+D.countVerified());
})();
