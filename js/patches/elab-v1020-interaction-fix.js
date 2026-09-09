
(function(){
  "use strict";

  var ADVANCE_RE=/^\s*(?:advance|advanced)(?:\s+canvas)?\s*$/i;
  var busy=false;
  var micBooted=false;

  function getInput(){
    return document.getElementById("elab-sa-input") ||
      document.querySelector("#elab-smart-panel input,#elab-smart-panel textarea");
  }
  function notify(msg){
    try{
      if(typeof window.elabV575Toast==="function") return window.elabV575Toast(msg);
      if(typeof window.toast==="function") return window.toast(msg);
    }catch(_){ }
    try{ console.info("NilSparkLab:",msg); }catch(_){ }
  }
  function isAdvanced(v){
    var s=String(v||"").trim();
    return ADVANCE_RE.test(s) || /^एडवांस(?:्ड)?(?:\s+कैनवास)?$/i.test(s);
  }

  /* ---- ADVANCE: one authoritative route for Enter + Ask + programmatic calls ---- */
  function openAdvanced(){
    try{
      var api=window.NilSparkLabAdvancedCanvasV1017;
      if(api && typeof api.handle==="function") return !!api.handle("advance");
    }catch(e){ try{console.error("NilSparkLab Advanced Canvas:",e); }catch(_){ } }
    notify("Advanced Canvas module unavailable.");
    return false;
  }
  function captureAdvancedKey(e){
    var el=e.target;
    if(!el || !("value" in el) || !isAdvanced(el.value)) return;
    if(e.key!=="Enter" || e.shiftKey) return;
    e.preventDefault();
    if(typeof e.stopImmediatePropagation==="function") e.stopImmediatePropagation();
    e.stopPropagation();
    el.value="";
    openAdvanced();
  }
  function captureAdvancedAsk(e){
    var b=e.target && e.target.closest ? e.target.closest("#elab-sa-ask") : null;
    if(!b) return;
    var el=getInput();
    if(!el || !isAdvanced(el.value)) return;
    e.preventDefault();
    if(typeof e.stopImmediatePropagation==="function") e.stopImmediatePropagation();
    e.stopPropagation();
    el.value="";
    openAdvanced();
  }
  document.addEventListener("keydown",captureAdvancedKey,true);
  document.addEventListener("click",captureAdvancedAsk,true);

  /* ---- DIAGRAM: chip clicks open the actual rendered diagram, not just an answer card ---- */
  function getDiagramResult(q){
    var r=null;
    try{
      if(window.NilSparkLabDiagrams && typeof window.NilSparkLabDiagrams.answer==="function"){
        r=window.NilSparkLabDiagrams.answer(q);
        if(r && r.diagram) window.__elabLastDiagram=r.diagram;
      }
    }catch(e){ try{console.error("NilSparkLab Diagram answer:",e); }catch(_){ } }
    return r;
  }
  function fallbackLedSvg(){
    return '<svg viewBox="0 0 820 420" xmlns="http://www.w3.org/2000/svg" aria-label="LED series circuit">'
      +'<rect width="820" height="420" fill="#fff"/>'
      +'<g stroke="#0f172a" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'
      +'<path d="M110 90H250 M330 90H590 M590 90V300 M590 300H110 M110 300V90"/>'
      +'<rect x="250" y="68" width="80" height="44" rx="5"/>'
      +'<rect x="560" y="150" width="60" height="90" rx="8"/>'
      +'<path d="M575 175L605 215 M605 175L575 215 M585 165l-10-10 M605 165l-10-10"/>'
      +'<path d="M145 120v150 M165 120v150"/>'
      +'</g>'
      +'<text x="40" y="55" font-family="Arial" font-size="24" font-weight="700" fill="#0f172a">LED Series Circuit</text>'
      +'<text x="258" y="95" font-family="Arial" font-size="14" fill="#0f172a">470 Ω</text>'
      +'<text x="555" y="265" font-family="Arial" font-size="14" fill="#0f172a">LED (Red)</text>'
      +'<text x="118" y="285" font-family="Arial" font-size="14" fill="#0f172a">9 V DC</text>'
      +'<text x="40" y="365" font-family="Arial" font-size="14" fill="#475569">Educational schematic • Verify values and wiring in Builder.</text>'
      +'</svg>';
  }
  function renderDiagramModal(q,r){
    var old=document.getElementById("elab-v1020-diagram-modal");
    if(old) old.remove();
    var d=(r&&r.diagram)||window.__elabLastDiagram||null;
    var svg="",title="Circuit Diagram";
    try{
      if(d && typeof d.svg==="function"){svg=d.svg();title=d.title||title;}
    }catch(_){ }
    if(!svg){
      try{
        if(window.NilSparkLabDiagrams && typeof window.NilSparkLabDiagrams.draw==="function"){
          var x=window.NilSparkLabDiagrams.draw(q);
          if(x && typeof x.svg==="function"){svg=x.svg();title=x.title||title;window.__elabLastDiagram=x;}
        }
      }catch(_){ }
    }
    if(!svg && /led|series/i.test(q)) svg=fallbackLedSvg();
    if(!svg) return false;

    var modal=document.createElement("div");
    modal.id="elab-v1020-diagram-modal";
    modal.style.display="flex";
    modal.setAttribute("role","dialog");
    modal.setAttribute("aria-modal","true");
    var box=document.createElement("div");box.className="box";
    var h=document.createElement("h2");h.textContent=title;h.style.margin="0 0 10px";
    var info=document.createElement("div");
    info.style.cssText="font-size:13px;line-height:1.5;color:#475569;margin-bottom:10px";
    info.textContent="Diagram ready. Use Builder for editing and simulation.";
    var holder=document.createElement("div");holder.className="svg-holder";holder.innerHTML=svg;
    var actions=document.createElement("div");actions.className="actions";
    var builder=document.createElement("button");builder.type="button";builder.textContent="Open Builder";
    builder.onclick=function(){modal.remove();try{if(typeof window.showSection==="function")window.showSection("builder");}catch(_){ }};
    var close=document.createElement("button");close.type="button";close.textContent="Close";close.onclick=function(){modal.remove();};
    actions.appendChild(builder);actions.appendChild(close);
    box.appendChild(h);box.appendChild(info);box.appendChild(holder);box.appendChild(actions);
    modal.appendChild(box);document.body.appendChild(modal);
    modal.addEventListener("click",function(e){if(e.target===modal)modal.remove();});
    return true;
  }
  function isDiagramChip(chip){
    if(!chip) return false;
    var q=String(chip.getAttribute("data-sa-q")||"");
    var label=String(chip.textContent||"");
    return /diagram|schematic|circuit/i.test(q+" "+label);
  }
  function captureDiagramChip(e){
    var chip=e.target && e.target.closest ? e.target.closest("#elab-sa-chips [data-sa-q]") : null;
    if(!chip || !isDiagramChip(chip)) return;
    /* v10.23: delegate to the full Diagram Library when available. */
    if(window.NilSparkLabInteractionRepairV1022 && typeof window.NilSparkLabInteractionRepairV1022.openDiagramLibrary==="function"){
      e.preventDefault();
      if(typeof e.stopImmediatePropagation==="function") e.stopImmediatePropagation();
      e.stopPropagation();
      window.NilSparkLabInteractionRepairV1022.openDiagramLibrary(true);
      return;
    }
    e.preventDefault();
    if(typeof e.stopImmediatePropagation==="function") e.stopImmediatePropagation();
    e.stopPropagation();
    if(busy) return;
    busy=true;
    try{
      var q=String(chip.getAttribute("data-sa-q")||"led series diagram");
      var el=getInput();if(el){el.value=q;el.dispatchEvent(new Event("input",{bubbles:true}));}
      var r=getDiagramResult(q);
      if(!renderDiagramModal(q,r)){
        try{if(window.NilSparkLabSmartAssistant&&typeof window.NilSparkLabSmartAssistant.open==="function")window.NilSparkLabSmartAssistant.open(r&&r.text?r.text:"Diagram could not be generated. Try again.");}catch(_){ }
        notify("Diagram engine did not return a drawing.");
      }
    }finally{setTimeout(function(){busy=false;},250);}
  }
  document.addEventListener("click",captureDiagramChip,true);

  /* ---- ASK: if typed text is a diagram request, render it directly ---- */
  function captureDiagramAsk(e){
    var b=e.target && e.target.closest ? e.target.closest("#elab-sa-ask") : null;
    if(!b) return;
    var el=getInput();if(!el)return;
    var q=String(el.value||"").trim();
    if(!q || isAdvanced(q) || !/diagram|schematic|circuit\s+diagram|draw|dikha|diagram\s+banao|डायग्राम|दिखा/i.test(q)) return;
    e.preventDefault();
    if(typeof e.stopImmediatePropagation==="function") e.stopImmediatePropagation();
    e.stopPropagation();
    if(busy)return;
    busy=true;
    try{
      var r=getDiagramResult(q);
      if(!renderDiagramModal(q,r)){
        /* Fall back to the mature assistant pipeline if a renderer is unavailable. */
        try{if(window.NilSparkLabSmartAssistant&&typeof window.NilSparkLabSmartAssistant.open==="function")window.NilSparkLabSmartAssistant.open(r&&r.text?r.text:"Diagram could not be generated. Try again.");}catch(_){ }
      }
      el.value="";
    }finally{setTimeout(function(){busy=false;},250);}
  }
  document.addEventListener("click",captureDiagramAsk,true);

  /* ---- MIC: exactly one handler; honest capability detection on local/content pages ---- */
  function bootMic(){
    if(micBooted)return true;
    var mic=document.getElementById("elab-assistant-mic");
    var panel=document.getElementById("elab-smart-panel");
    var el=getInput();
    if(!mic||!panel||!el)return false;
    micBooted=true;
    mic.type="button";mic.disabled=false;mic.style.display="grid";
    mic.setAttribute("aria-label","Voice input");mic.title="Tap to speak";

    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    var isContent=/^content:$/i.test(location.protocol);
    var isFile=/^file:$/i.test(location.protocol);
    var secure=!!window.isSecureContext || location.hostname==="localhost" || location.hostname==="127.0.0.1";

    if(!SR){
      mic.title="Voice input unavailable";
      mic.onclick=function(){notify("Voice input is not supported here. Use Chrome/Chromium on the HTTPS NIL SparkLab site.");};
      return true;
    }
    if((isContent||isFile) && !secure){
      mic.title="Open NIL SparkLab over HTTPS for voice input";
      mic.onclick=function(){notify("Mic cannot reliably use Speech Recognition from this local content:// file. Open the NIL SparkLab HTTPS site and allow microphone access.");};
      return true;
    }

    var rec=null,listening=false;
    try{rec=new SR();}catch(_){mic.onclick=function(){notify("Voice input could not be initialized.");};return true;}
    rec.lang=(typeof window.currentLang!=="undefined"&&window.currentLang==="hi")?"hi-IN":"en-IN";
    rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=1;

    function reset(){
      listening=false;mic.disabled=false;mic.textContent="🎙️";mic.classList.remove("is-listening");mic.removeAttribute("aria-busy");mic.title="Tap to speak";
    }
    rec.onstart=function(){listening=true;mic.textContent="⏺";mic.classList.add("is-listening");mic.setAttribute("aria-busy","true");mic.title="Listening…";};
    rec.onresult=function(ev){
      var text="";
      try{for(var i=0;i<ev.results.length;i++){if(ev.results[i]&&ev.results[i][0])text+=String(ev.results[i][0].transcript||"");}}catch(_){ }
      text=text.trim();
      if(text){el.value=text;el.dispatchEvent(new Event("input",{bubbles:true}));el.focus();}
    };
    rec.onerror=function(ev){
      var code=ev&&ev.error||"unknown";
      var msg={
        "not-allowed":"Microphone permission denied. Browser settings mein microphone Allow karo.",
        "service-not-allowed":"Speech service allowed nahi hai.",
        "no-speech":"Speech detect nahi hui. Dobara try karo.",
        "network":"Speech service/network unavailable. Internet check karo.",
        "audio-capture":"Microphone capture unavailable. Device mic check karo."
      }[code]||("Mic error: "+code);
      notify(msg);reset();
    };
    rec.onend=reset;
    mic.onclick=function(){
      if(listening)return;
      try{rec.start();}catch(_){reset();notify("Mic busy hai. 1 second baad dobara try karo.");}
    };
    return true;
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){setTimeout(bootMic,120);},{once:true});
  else setTimeout(bootMic,120);

  window.NilSparkLabInteractionRepairV1020=Object.freeze({
    version:"10.20",
    isAdvanced:isAdvanced,
    openAdvanced:openAdvanced,
    openDiagram:function(q){var s=String(q||"led series diagram");return renderDiagramModal(s,getDiagramResult(s));},
    micAvailable:function(){return !!(window.SpeechRecognition||window.webkitSpeechRecognition);},
    context:{protocol:location.protocol,secure:!!window.isSecureContext}
  });
})();
