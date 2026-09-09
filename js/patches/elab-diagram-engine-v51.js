
(function(){
"use strict";
var D = window.NilSparkLabDiagrams;
if(!D) return;

var PART_POOL = ["battery","resistor","led","capacitor","diode","switch","motor","fuse","inductor","potentiometer","bjt_npn","lamp","buzzer","ac_source","relay"];

function norm(s){ return String(s||"").toLowerCase(); }

/** Parse query → suggested parts for confirm UI */
function suggestParts(q){
  var n=norm(q), found=[];
  var map=[[/batter|cell|source/, "battery"],[/ac\b|mains/, "ac_source"],[/resistor|ohm/, "resistor"],
    [/led/, "led"],[/cap/, "capacitor"],[/diode/, "diode"],[/switch|button/, "switch"],
    [/motor/, "motor"],[/fuse/, "fuse"],[/induct|coil/, "inductor"],[/pot/, "potentiometer"],
    [/transistor|npn|bjt/, "bjt_npn"],[/lamp|bulb/, "lamp"],[/buzz/, "buzzer"],[/relay/, "relay"]];
  map.forEach(function(p){ if(p[0].test(n) && found.indexOf(p[1])<0) found.push(p[1]); });
  if(!found.length) found=["battery","resistor","led"];
  return found;
}

function needsConfirm(q){
  var n=norm(q);
  // Library / canvas skip confirm
  if(/current circuit|mere circuit|my circuit|canvas/.test(n)) return false;
  if(D.find && false) return false;
  // Sketch-like free text
  return /draw|sketch|diagram|banao|dikha|schematic/.test(n) && !/led series|ohm law|dol starter|star delta|bridge rectifier|voltage divider/.test(n);
}

function buildFromParts(parts, title){
  parts = (parts||[]).filter(Boolean);
  if(!parts.length) parts=["battery","resistor","led"];
  // Use public draw if chain available via answer path
  var fakeQ = "draw " + parts.join(" ") + " series circuit diagram";
  var res = D.draw ? D.draw(fakeQ) : null;
  if(res){
    res.trust = "sketch";
    res.title = title || ("Sketch: " + parts.join(" → "));
    res.netlist = "Confirmed parts: " + parts.join(", ");
    res.id = res.id || "confirmed_sketch";
  }
  return res;
}

function confirmHtml(parts){
  var chips = PART_POOL.map(function(p){
    var on = parts.indexOf(p)>=0 ? " on" : "";
    return '<button type="button" class="cdc-chip'+on+'" data-cdc-part="'+p+'">'+p.replace(/_/g," ")+'</button>';
  }).join("");
  return '<div class="sa-diagram-confirm" id="elab-diagram-confirm">'
    +'<div class="cdc-title">Confirm parts, then Draw</div>'
    +'<div class="cdc-chips">'+chips+'</div>'
    +'<div class="cdc-actions">'
    +'<button type="button" data-cdc-draw="1">Draw schematic</button>'
    +'<button type="button" data-cdc-reset="1">Reset</button>'
    +'</div></div>';
}

/** Wrap answer: for ambiguous sketch, attach confirm panel metadata */
var origAnswer = D.answer;
D.answer = function(q){
  var r = origAnswer(q);
  if(!r) return r;
  // If sketch and free-form, attach confirm
  if(r.diagram && (r.diagram.trust==="sketch") && needsConfirm(q)){
    var parts = suggestParts(q);
    r.diagram.confirmParts = parts.slice();
    r.diagram.confirmQuery = q;
    r.text = (r.text||"") + "\n\nYou can tweak parts below, then Draw.";
  }
  return r;
};

/** PNG export via canvas rasterize */
function exportPng(){
  var d = window.__elabLastDiagram;
  if(!d || typeof d.svg !== "function") return false;
  var svg = d.svg();
  var blob = new Blob([svg], {type:"image/svg+xml;charset=utf-8"});
  var url = URL.createObjectURL(blob);
  var img = new Image();
  img.onload = function(){
    try{
      var c = document.createElement("canvas");
      var w = Math.max(320, img.width||380);
      var h = Math.max(180, img.height||240);
      c.width = w*2; c.height = h*2;
      var ctx = c.getContext("2d");
      ctx.fillStyle = "#020617";
      ctx.fillRect(0,0,c.width,c.height);
      ctx.drawImage(img,0,0,c.width,c.height);
      c.toBlob(function(png){
        if(!png) return;
        var u = URL.createObjectURL(png);
        var a = document.createElement("a");
        a.href = u; a.download = "nilsparklab-"+(d.id||"diagram")+".png";
        document.body.appendChild(a); a.click();
        setTimeout(function(){ try{ URL.revokeObjectURL(u); a.remove(); }catch(e){} }, 600);
      }, "image/png");
    }catch(e){}
    URL.revokeObjectURL(url);
  };
  img.onerror = function(){ URL.revokeObjectURL(url); };
  img.src = url;
  return true;
}

D.exportPng = exportPng;
D.suggestParts = suggestParts;
D.buildFromParts = buildFromParts;
D.version = "5.1-confirm-png";

// Event delegation for confirm + png
document.addEventListener("click", function(e){
  var t = e.target;
  if(!t || !t.closest) return;

  // toggle part chip
  var chip = t.closest("[data-cdc-part]");
  if(chip){
    chip.classList.toggle("on");
    return;
  }
  var drawBtn = t.closest("[data-cdc-draw]");
  if(drawBtn){
    var host = document.getElementById("elab-diagram-confirm");
    if(!host) return;
    var parts = [];
    host.querySelectorAll(".cdc-chip.on").forEach(function(ch){
      parts.push(ch.getAttribute("data-cdc-part"));
    });
    var diag = buildFromParts(parts, "Confirmed: "+parts.join(" → "));
    if(diag){
      window.__elabLastDiagram = diag;
      // re-render assistant answer if possible
      if(window.NilSparkLabSmartAssistant && typeof NilSparkLabSmartAssistant.ask==="function"){
        // direct panel update
        var content = document.getElementById("elab-smart-content");
        if(content && window.__elabRenderDiagramCard){
          window.__elabRenderDiagramCard("📐 Diagram — "+diag.title+"\n\n✎ Confirmed sketch", diag);
        } else if(typeof window.renderTips==="function"){
          // can't call renderTips if not global - trigger via open
          try{
            var svg = diag.svg();
            var html = '<div class="sa-diagram-badge sketch">✎ Confirmed sketch</div><div class="sa-diagram-wrap">'+svg
              +'<div class="sa-diagram-caption">'+(diag.title||"")+'</div>'
              +'<div class="sa-diagram-actions">'
              +'<button type="button" data-sa-section="builder">Builder</button>'
              +'<button type="button" data-sa-export-diagram="1">Export SVG</button>'
              +'<button type="button" data-sa-export-png="1">Export PNG</button></div>'
              +(diag.netlist?'<div class="sa-diagram-netlist">'+String(diag.netlist).replace(/</g,"&lt;")+'</div>':'')
              +'</div>';
            var tipHost = document.getElementById("elab-smart-content");
            if(tipHost){
              tipHost.innerHTML = '<div class="sa-answer"><div class="sc-label" style="color:#67e8f9">DIAGRAM</div><b>Circuit diagram</b><br>'+html+'</div>' + tipHost.innerHTML;
            }
          }catch(err){}
        }
      }
    }
    return;
  }
  var resetBtn = t.closest("[data-cdc-reset]");
  if(resetBtn){
    var host2 = document.getElementById("elab-diagram-confirm");
    if(!host2) return;
    host2.querySelectorAll(".cdc-chip").forEach(function(ch){ ch.classList.remove("on"); });
    ["battery","resistor","led"].forEach(function(p){
      var el = host2.querySelector('[data-cdc-part="'+p+'"]');
      if(el) el.classList.add("on");
    });
    return;
  }
  var png = t.closest("[data-sa-export-png]");
  if(png){
    var ok = exportPng();
    if(window.elabV575Toast) elabV575Toast(ok ? "PNG export started" : "No diagram to export");
    return;
  }
}, true);

// Hook render path: inject confirm panel + PNG button when diagram shown
var _lastObs = null;
var _enhanceDiagramDomRunning = false; // v10.35 fix: re-entrancy guard
function enhanceDiagramDom(){
  if(_enhanceDiagramDomRunning) return; // v10.35 fix: prevent observer feedback loop
  var wrap = document.querySelector("#elab-smart-content .sa-diagram-wrap");
  if(!wrap) return;
  var d = window.__elabLastDiagram;
  var willMutate = (wrap && !wrap.querySelector("[data-sa-export-png]") && wrap.querySelector(".sa-diagram-actions"))
    || (d && d.confirmParts && !document.getElementById("elab-diagram-confirm") && wrap.parentElement);
  if(!willMutate) return; // v10.35 fix: nothing to change, skip touching the observer entirely
  _enhanceDiagramDomRunning = true;
  try{
    // v10.35 fix: stop observing while we mutate the very subtree we watch,
    // so our own PNG button / confirm panel insertion cannot re-trigger this observer.
    if(typeof mo!=="undefined" && mo) mo.disconnect();
    // PNG button
    if(wrap && !wrap.querySelector("[data-sa-export-png]")){
      var actions = wrap.querySelector(".sa-diagram-actions");
      if(actions){
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("data-sa-export-png","1");
        b.textContent = "Export PNG";
        actions.appendChild(b);
      }
    }
    // Confirm panel
    if(d && d.confirmParts && !document.getElementById("elab-diagram-confirm")){
      var card = wrap.parentElement;
      if(card){
        var div = document.createElement("div");
        div.innerHTML = confirmHtml(d.confirmParts);
        card.appendChild(div.firstChild);
      }
    }
  } finally {
    var hostReattach = document.getElementById("elab-smart-content");
    if(hostReattach && typeof mo!=="undefined" && mo) mo.observe(hostReattach, {childList:true, subtree:true});
    _enhanceDiagramDomRunning = false;
  }
}

var mo = new MutationObserver(function(){ enhanceDiagramDom(); });
document.addEventListener("DOMContentLoaded", function(){
  var host = document.getElementById("elab-smart-content");
  if(host) mo.observe(host, {childList:true, subtree:true});
  setTimeout(enhanceDiagramDom, 500);
});
if(document.readyState!=="loading"){
  var host = document.getElementById("elab-smart-content");
  if(host) mo.observe(host, {childList:true, subtree:true});
}

console.info("NilSparkLab Diagrams 5.1 confirm+PNG ready");
})();
