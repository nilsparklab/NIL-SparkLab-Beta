
(function(){
"use strict";
/**
 * P1–P5: Netlist-first · API netlist · Verified pack · Validation · Vision hook
 */
function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function norm(s){ return String(s||"").toLowerCase().replace(/[^a-z0-9\u0900-\u097f\s+./-]/gi," ").replace(/\s+/g," ").trim(); }

var VERIFIED = {items:[]};
try{
  var node=document.getElementById("elab-verified-netlists");
  VERIFIED = JSON.parse(node && node.textContent || "{}");
}catch(e){ console.warn("verified netlists parse", e); }

function svgRoot(w,h,title,body,foot){
  w=Math.max(340,w||400); h=Math.max(200,h||240);
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'">'
    +'<rect width="'+w+'" height="'+h+'" rx="10" fill="#020617"/>'
    +'<text x="12" y="18" fill="#67e8f9" font-size="11" font-family="ui-monospace,monospace">'+esc(title).slice(0,56)+'</text>'
    +body+(foot?'<text x="12" y="'+(h-8)+'" fill="#64748b" font-size="8">'+esc(foot).slice(0,84)+'</text>':'')+'</svg>';
}
function Box(x,y,w,h,t,c){
  return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="5" fill="#0f172a" stroke="'+(c||'#22d3ee')+'" stroke-width="2"/>'
    +'<text x="'+(x+5)+'" y="'+(y+h/2+3)+'" fill="#e2e8f0" font-size="9">'+esc(String(t).slice(0,10))+'</text>';
}
function wire(x1,y1,x2,y2){
  var mx=(x1+x2)/2;
  return '<path d="M'+x1+' '+y1+' H'+mx+' V'+y2+' H'+x2+'" fill="none" stroke="#22d3ee" stroke-width="1.8" stroke-linecap="round"/>';
}

/** P1: netlist → SVG layout */
function netlistToSvg(nl, title){
  var parts = (nl && nl.parts) || [];
  var wires = (nl && nl.wires) || [];
  var cols = Math.min(4, Math.max(1, parts.length));
  var positions = {}, body=[], i, p, col, row, x, y;
  for(i=0;i<parts.length;i++){
    p=parts[i]; col=i%cols; row=Math.floor(i/cols);
    x=30+col*90; y=55+row*70;
    positions[p.id]={x:x+28,y:y+16,w:56,h:32};
    body.push(Box(x,y,56,32, p.type||p.id, "#22d3ee"));
    body.push('<text x="'+x+'" y="'+(y+44)+'" fill="#64748b" font-size="7">'+esc(p.id)+'</text>');
  }
  wires.forEach(function(w){
    var a=(w.from||"").split(".")[0], b=(w.to||"").split(".")[0];
    var pa=positions[a], pb=positions[b];
    if(pa&&pb) body.push(wire(pa.x, pa.y, pb.x, pb.y));
    else if(pa && /vout|gnd|load/i.test(w.to||"")){
      body.push(wire(pa.x, pa.y, pa.x+40, pa.y-20));
    }
  });
  body.push('<text x="12" y="34" fill="#7dd3fc" font-size="8">'+parts.length+' parts · '+wires.length+' wires · netlist-first</text>');
  var rows=Math.ceil(parts.length/cols)||1;
  return svgRoot(Math.max(360, cols*90+40), Math.max(200, rows*70+80), title||nl.title||"Netlist schematic", body.join(""), nl.notes||"From netlist");
}

function netlistText(nl){
  var lines=["NETLIST: "+(nl.title||nl.id||""),"Parts:"];
  (nl.parts||[]).forEach(function(p,i){ lines.push("  "+(i+1)+". "+p.id+" · "+p.type+(p.value?" = "+p.value:"")); });
  lines.push("Wires:");
  (nl.wires||[]).forEach(function(w,i){ lines.push("  "+(i+1)+". "+w.from+" → "+w.to); });
  if(nl.notes) lines.push("Notes: "+nl.notes);
  return lines.join("\n");
}

/** P4: validation rules */
function validateNetlist(nl){
  var issues=[], parts=nl.parts||[], wires=nl.wires||[];
  var ids={}; parts.forEach(function(p){ ids[p.id]=p; });
  if(!parts.length) issues.push({level:"err", msg:"No parts in netlist"});
  var hasSource = parts.some(function(p){ return /battery|source|ac|vcc|vin/i.test(p.type||""); });
  if(parts.length && !hasSource) issues.push({level:"warn", msg:"No obvious power source"});
  var hasLed = parts.some(function(p){ return /led/i.test(p.type||""); });
  var hasR = parts.some(function(p){ return /resistor|pot/i.test(p.type||""); });
  if(hasLed && !hasR) issues.push({level:"err", msg:"LED without series resistor (risk)"});
  // connectivity
  var connected={};
  wires.forEach(function(w){
    var a=(w.from||"").split(".")[0], b=(w.to||"").split(".")[0];
    connected[a]=1; connected[b]=1;
  });
  parts.forEach(function(p){
    if(!connected[p.id] && parts.length>1)
      issues.push({level:"warn", msg:"Part may be unconnected: "+p.id});
  });
  if(!wires.length && parts.length>1)
    issues.push({level:"warn", msg:"No wires defined"});
  // unknown refs
  wires.forEach(function(w){
    ["from","to"].forEach(function(k){
      var id=(w[k]||"").split(".")[0];
      if(id && !ids[id] && !/^(GND|VOUT|VCC|LOAD)$/i.test(id))
        issues.push({level:"warn", msg:"Wire ref not in parts: "+w[k]});
    });
  });
  var err=issues.filter(function(x){return x.level==="err";}).length;
  var warn=issues.filter(function(x){return x.level==="warn";}).length;
  return {
    ok: err===0,
    issues: issues,
    trust: err? "review" : (warn? "review" : "verified")
  };
}

function validationHtml(v){
  if(!v||!v.issues||!v.issues.length)
    return '<ul class="sa-diagram-validate"><li class="ok">Validation passed</li></ul>';
  return '<ul class="sa-diagram-validate">'+v.issues.map(function(i){
    return '<li class="'+i.level+'">'+esc(i.msg)+'</li>';
  }).join("")+'</ul>';
}

/** P3: match verified pack */
function findVerified(q){
  var n=norm(q), best=null, bs=0;
  (VERIFIED.items||[]).forEach(function(it){
    var s=0;
    (it.keywords||[]).forEach(function(k){ if(n.indexOf(norm(k))>=0) s+=norm(k).length+8; });
    if(n.indexOf(norm(it.title))>=0) s+=20;
    if(n.indexOf(norm(it.id))>=0) s+=15;
    if(s>bs){ bs=s; best=it; }
  });
  return bs>=8 ? best : null;
}

/** Local text → netlist (heuristic) */
function textToNetlist(q){
  var n=norm(q), parts=[], wires=[], idc={};
  function add(type){
    var base=type.slice(0,3).toUpperCase(), i=(idc[base]=(idc[base]||0)+1);
    var id=base+i;
    parts.push({id:id, type:type});
    return id;
  }
  var types=[];
  [[/batter|cell|dc source/,"battery"],[/ac source|mains/,"ac_source"],[/resistor|ohm/,"resistor"],
   [/led/,"led"],[/capacitor|cap\b/,"capacitor"],[/diode/,"diode"],[/motor|मोटर/,"motor"],
   [/switch|button/,"switch"],[/fuse/,"fuse"],[/induct|coil/,"inductor"],[/pot/,"potentiometer"],
   [/transistor|npn/,"bjt_npn"],[/lamp|bulb/,"lamp"],[/relay/,"relay"]].forEach(function(p){
    if(p[0].test(n)) types.push(p[1]);
  });
  if(!types.length) types=["battery","resistor","led"];
  if(!types.some(function(t){return /battery|ac|source/.test(t);})) types=["battery"].concat(types);
  var ids=types.map(add);
  for(var i=0;i<ids.length-1;i++){
    wires.push({from:ids[i]+".out", to:ids[i+1]+".in"});
  }
  if(ids.length) wires.push({from:ids[ids.length-1]+".out", to:ids[0]+".ret"});
  return {
    id:"nl_local", title:"From text", parts:parts, wires:wires,
    notes:"Heuristic netlist · validate before real use"
  };
}

/** P2: optional API text → netlist */
function apiNetlist(q){
  return new Promise(function(resolve){
    try{
      var cfg=window.NilSparkLabDiagramAPI;
      if(!cfg||!cfg.endpoint){ resolve(null); return; }
      var ctrl=typeof AbortController!=="undefined"?new AbortController():null;
      var t=ctrl?setTimeout(function(){try{ctrl.abort();}catch(e){}},10000):null;
      fetch(cfg.endpoint,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mode:"netlist", prompt:String(q).slice(0,800)}),
        signal:ctrl?ctrl.signal:undefined
      }).then(function(r){return r.json();}).then(function(data){
        if(t) clearTimeout(t);
        if(data&&data.parts&&data.wires){
          resolve({id:"nl_api", title:data.title||"API netlist", parts:data.parts, wires:data.wires, notes:data.notes||"From NilSparkLabDiagramAPI", source:"api"});
        } else resolve(null);
      }).catch(function(){ if(t) clearTimeout(t); resolve(null); });
    }catch(e){ resolve(null); }
  });
}

function packDiagram(nl, trustOverride){
  var v=validateNetlist(nl);
  var trust=trustOverride|| (nl.source==="api"?"ai": (v.err?"review": v.trust));
  // fix trust if errors
  if(v.issues.some(function(i){return i.level==="err";})) trust="review";
  if(nl.source==="api" && trust!=="review") trust="ai";
  if(trustOverride==="verified" && trust==="review") trust="review";
  if(trustOverride==="verified" && !v.issues.some(function(i){return i.level==="err";})) trust="verified";

  var title=nl.title||"Schematic";
  return {
    id: nl.id||"netlist",
    title: title,
    trust: trust,
    netlist: netlistText(nl),
    validation: v,
    _nl: nl,
    svg: function(){ return netlistToSvg(nl, title); }
  };
}

function badgeLabel(trust){
  if(trust==="verified") return "✓ Verified netlist";
  if(trust==="canvas") return "◎ Canvas";
  if(trust==="ai") return "☁ AI netlist";
  if(trust==="review") return "⚠ Needs review";
  return "✎ Sketch netlist";
}

function buildAnswer(diag){
  var h=false; try{h=typeof currentLang!=="undefined"&&currentLang==="hi";}catch(e){}
  var tip = diag.trust==="verified" ? "Library verified netlist → SVG."
    : diag.trust==="ai" ? "API netlist → SVG (review recommended)."
    : diag.trust==="review" ? "Validation found issues — fix before real use."
    : "Netlist-first schematic.";
  return {
    text: (h?"📐 डायग्राम — ":"📐 Diagram — ")+diag.title+"\n\n"+badgeLabel(diag.trust)+"\n"+tip,
    diagram: diag
  };
}

function answerSync(q){
  q=String(q||"");
  var n=norm(q);
  var wants=/diagram|schematic|draw|dikha|डायग्राम|netlist|circuit dikhao|show circuit|banao/.test(n)
    || /circuit|rectifier|divider|starter|ohm|led series/.test(n);

  // Canvas still delegated to core if present
  if(/current circuit|mere circuit|my circuit|canvas diagram/.test(n)){
    if(window.NilSparkLabDiagrams && NilSparkLabDiagrams.fromCanvas){
      var c=NilSparkLabDiagrams.fromCanvas();
      // ensure netlist field
      if(c && !c._nl){
        return { text:"📐 Diagram — "+c.title+"\n\n◎ Canvas\nGeometry + terminals.", diagram:c };
      }
    }
  }

  var ver=findVerified(q);
  if(ver && wants){
    return buildAnswer(packDiagram(ver, "verified"));
  }
  if(wants){
    var nl=textToNetlist(q);
    return buildAnswer(packDiagram(nl, "sketch"));
  }
  return null;
}

function answerAsync(q){
  return apiNetlist(q).then(function(apiNl){
    if(apiNl) return buildAnswer(packDiagram(apiNl, "ai"));
    return answerSync(q);
  });
}

/** P5: Vision upload hook */
function visionToNetlist(file){
  return new Promise(function(resolve){
    var cfg=window.NilSparkLabDiagramAPI;
    if(!cfg||!cfg.visionEndpoint){
      resolve({error:"No visionEndpoint. Set NilSparkLabDiagramAPI.visionEndpoint"});
      return;
    }
    var reader=new FileReader();
    reader.onload=function(){
      var b64=String(reader.result||"").split(",")[1]||"";
      fetch(cfg.visionEndpoint,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mode:"vision_netlist", imageBase64:b64.slice(0,2e6), mime:file.type})
      }).then(function(r){return r.json();}).then(function(data){
        if(data&&data.parts) resolve(data);
        else resolve({error:"Vision API returned no netlist"});
      }).catch(function(e){ resolve({error:String(e&&e.message||e)}); });
    };
    reader.onerror=function(){ resolve({error:"File read failed"}); };
    reader.readAsDataURL(file);
  });
}

function visionBoxHtml(){
  return '<div class="sa-vision-box" id="elab-vision-box">'
    +'<div style="font-size:10px;font-weight:800;color:#c4b5fd;margin-bottom:4px">📷 Circuit photo → netlist</div>'
    +'<input type="file" accept="image/*" capture="environment" id="elab-vision-file"/>'
    +'<div class="sv-hint">Optional API: window.NilSparkLabDiagramAPI.visionEndpoint</div>'
    +'</div>';
}

// Wire into NilSparkLabDiagrams
var D=window.NilSparkLabDiagrams || {};
var prevAnswer=D.answer;
D.answer=function(q){
  /* v10.32 FIX: Diagram Library "wrong preview" bug.
     ROOT CAUSE: this pipeline's answerSync() was called FIRST, before the
     purpose-built diagram engines it wraps (elab-circuit-diagram-engine and
     its v51/v52 extensions). answerSync() matches against a 60-item
     VERIFIED-netlist list where most entries (buck_block, boost_block,
     transformer_load, etc.) are generic battery→resistor→lamp/led
     placeholders, and falls back further to textToNetlist(), which silently
     defaults to battery+resistor+led whenever it can't recognize a keyword
     in the query. Because this wrapper ran first, a known diagram with a
     correct, specific definition further down the chain (Buck Converter,
     Boost Converter, Transformer + DC Supply, Center-tap Rectifier,
     H-Bridge, Common-emitter Amplifier, DOL/Star-Delta Starter, etc.) could
     be silently replaced by the wrong generic preview.
     FIX: try the existing purpose-built chain first; only fall back to this
     pipeline's generic/heuristic netlist matching when that chain has no
     definition at all. No diagram data changes — this only restores the
     intended "known diagram -> its own definition, unknown -> fallback"
     priority described by the Diagram Library's own design. */
  if(typeof prevAnswer==="function"){
    var rich=prevAnswer(q);
    if(rich) return rich;
  }
  return answerSync(q);
};
D.answerAsync=answerAsync;
D.netlistToSvg=netlistToSvg;
D.validateNetlist=validateNetlist;
D.textToNetlist=textToNetlist;
D.findVerified=findVerified;
D.visionToNetlist=visionToNetlist;
D.verifiedCount=function(){ return (VERIFIED.items||[]).length; };
D.version=(D.version||"")+"+p15";
window.NilSparkLabDiagrams=D;

// Enhance DOM: validation list + vision box + badges
var _enhanceRunning = false; // v10.35 fix: re-entrancy guard
function enhance(){
  if(_enhanceRunning) return; // v10.35 fix: prevent observer feedback loop
  var wrap=document.querySelector("#elab-smart-content .sa-diagram-wrap");
  if(!wrap) return;
  var d=window.__elabLastDiagram;
  _enhanceRunning = true;
  try{
    // v10.35 fix: stop observing while we mutate the very subtree we watch,
    // so our own inserted nodes / class changes cannot re-trigger this observer
    // (which was ping-ponging forever against the sibling enhanceDiagramDom() observer).
    if(typeof mo!=="undefined" && mo) mo.disconnect();
    if(d&&d.validation&&!wrap.querySelector(".sa-diagram-validate")){
      var div=document.createElement("div");
      div.innerHTML=validationHtml(d.validation);
      wrap.appendChild(div.firstChild);
    }
    // badge class fix for review/ai
    var badge=document.querySelector("#elab-smart-content .sa-diagram-badge");
    if(badge&&d&&d.trust){
      badge.classList.remove("verified","canvas","sketch","review","ai");
      badge.classList.add(d.trust==="verified"?"verified":d.trust==="canvas"?"canvas":d.trust==="ai"?"ai":d.trust==="review"?"review":"sketch");
      badge.textContent=badgeLabel(d.trust);
    }
    if(!document.getElementById("elab-vision-box")){
      var card=wrap.parentElement;
      if(card){
        var vb=document.createElement("div");
        vb.innerHTML=visionBoxHtml();
        card.appendChild(vb.firstChild);
      }
    }
  } finally {
    var hostReattach=document.getElementById("elab-smart-content");
    if(hostReattach && typeof mo!=="undefined" && mo) mo.observe(hostReattach,{childList:true,subtree:true});
    _enhanceRunning = false;
  }
}
document.addEventListener("change", function(e){
  var f=e.target && e.target.id==="elab-vision-file" && e.target.files && e.target.files[0];
  if(!f) return;
  var tip=document.querySelector("#elab-vision-box .sv-hint");
  if(tip) tip.textContent="Processing…";
  visionToNetlist(f).then(function(data){
    if(data&&data.error){
      if(tip) tip.textContent=data.error;
      // fallback: show empty netlist message
      return;
    }
    if(data&&data.parts){
      var nl=Object.assign({id:"vision", title:data.title||"From photo", notes:"Vision API netlist"}, data);
      var diag=packDiagram(nl, "ai");
      window.__elabLastDiagram=diag;
      var host=document.getElementById("elab-smart-content");
      if(host){
        host.innerHTML='<div class="sa-answer"><b>Circuit diagram</b><br>'
          +'<div class="sa-diagram-badge ai">☁ AI netlist (vision)</div>'
          +'<div class="sa-diagram-wrap">'+diag.svg()
          +'<div class="sa-diagram-actions">'
          +'<button type="button" data-sa-export-diagram="1">Export SVG</button>'
          +'<button type="button" data-sa-export-png="1">Export PNG</button></div>'
          +'<div class="sa-diagram-netlist">'+esc(diag.netlist)+'</div>'
          +validationHtml(diag.validation)
          +'</div></div>'+host.innerHTML;
      }
      if(tip) tip.textContent="Done — review netlist carefully.";
    }
  });
});

var mo=new MutationObserver(function(){ enhance(); });
function boot(){
  var host=document.getElementById("elab-smart-content");
  if(host) mo.observe(host,{childList:true,subtree:true});
  console.info("NilSparkLab P1–P5 pipeline · verified netlists:", D.verifiedCount());
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
})();
