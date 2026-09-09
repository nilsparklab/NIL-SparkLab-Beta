
(function(){
  "use strict";

  function comps(){ try{ return Array.isArray(window.builderCanvasComps)?window.builderCanvasComps:[]; }catch(e){ return []; } }
  function wires(){ try{ return Array.isArray(window.builderWires)?window.builderWires:[]; }catch(e){ return []; } }
  function typeOf(c){ return String(c&&(c.type||c.kind||"")).toLowerCase().replace(/[\s-]+/g,"_"); }
  function isHi(){
    try{
      if(typeof currentLang!=="undefined" && currentLang==="hi") return true;
      var t=document.getElementById("lang-btn-text");
      if(t && /EN/.test(t.textContent) && t.textContent.indexOf("EN")===0) return false;
      // button shows "EN | हिंदी" when English active typically; if starts with हिंदी
      if(t && t.textContent.trim().indexOf("हिंदी")===0) return true;
    }catch(e){}
    try{ return localStorage.getItem("elab_lang")==="hi"; }catch(e){}
    return false;
  }
  function T(en, hi){ return isHi()?hi:en; }

  /* ===== 6. Add component to builder from directory ===== */
  window.elabAddComponentToBuilder = function(dbId){
    try{
      var map = window.builderAddMap || {};
      // fallback common map
      var fallback = {battery:"battery", resistor:"resistor", led:"led", diode_1n4007:"diode", switch_spst:"switch", dc_motor:"motor", capacitor:"capacitor", potentiometer:"potentiometer", buzzer:"buzzer", fuse:"fuse"};
      var type = map[dbId] || fallback[dbId];
      if(!type){
        if(window.elabV575Toast) elabV575Toast(T("Not placeable in builder","Builder mein place nahi ho sakta"));
        return;
      }
      if(typeof window.showSection==="function") window.showSection("builder");
      if(typeof window.addBuilderComp==="function") window.addBuilderComp(type);
      if(window.elabSFX) elabSFX.click();
      if(window.elabV575Toast) elabV575Toast(T("Added to Circuit Builder","Circuit Builder mein add ho gaya"));
    }catch(e){ console.warn(e); }
  };

  /* ===== 3. Smart Auto-Wire ===== */
  function autoWire(){
    var cs = comps().slice();
    if(cs.length<2){
      if(window.elabV575Toast) elabV575Toast(T("Add at least 2 components","Kam se kam 2 components add karo"));
      return;
    }
    if(typeof window.saveStateForUndo==="function") try{ saveStateForUndo(); }catch(e){}
    var w = wires();
    var existing = {};
    w.forEach(function(x){
      if(x&&x.from&&x.to){
        existing[x.from.compId+":"+x.from.term+"->"+x.to.compId+":"+x.to.term]=1;
      }
    });
    var added=0;
    // chain: each component terminal A to next component terminal B (simple educational chain)
    for(var i=0;i<cs.length-1;i++){
      var a=cs[i], b=cs[i+1];
      var fromTerm = (a.terminals && a.terminals[1]) ? a.terminals[1] : "B";
      var toTerm = (b.terminals && b.terminals[0]) ? b.terminals[0] : "A";
      // normalize term names
      if(typeof fromTerm==="object") fromTerm = fromTerm.id||fromTerm.name||"B";
      if(typeof toTerm==="object") toTerm = toTerm.id||toTerm.name||"A";
      var key = a.id+":"+fromTerm+"->"+b.id+":"+toTerm;
      if(existing[key]) continue;
      var wire = {
        id: "w_auto_"+Date.now()+"_"+i,
        color: "#22d3ee",
        from: {compId:a.id, term: String(fromTerm)},
        to: {compId:b.id, term: String(toTerm)}
      };
      try{
        if(window.NilSparkLabBuilderState && typeof window.NilSparkLabBuilderState.addWires === "function") window.NilSparkLabBuilderState.addWires([wire]);
        added++;
      }catch(e){}
    }
    if(typeof window.renderBuilderCanvas==="function") window.renderBuilderCanvas();
    if(window.elabSFX) elabSFX.connect();
    if(window.elabV575Toast) elabV575Toast(T("Auto-wired "+added+" links","Auto-wire: "+added+" connections"));
    if(typeof window.runSmartDiagnostics==="function") try{ runSmartDiagnostics(); }catch(e){}
    if(window.isSimRunning && typeof window.runBuilderSim==="function") window.runBuilderSim();
    else if(typeof window.markCircuitVerificationStale==="function") try{ markCircuitVerificationStale(); }catch(e){}
  }
  document.getElementById("elab-fab-autowire")?.addEventListener("click", function(){
    if(typeof window.showSection==="function") window.showSection("builder");
    setTimeout(autoWire, 100);
  });

  /* ===== 1. Guided Experiment Mode ===== */
  var EXPERIMENTS = [
    {
      id:"ohm",
      nameEn:"Ohm's Law", nameHi:"ओम का नियम",
      steps:[
        {en:"Open Circuit Builder (empty canvas is fine).", hi:"Circuit Builder kholo.", action:function(){ if(window.showSection) showSection("builder"); }},
        {en:"Add a Battery (9V).", hi:"Battery (9V) add karo.", action:function(){ if(window.addBuilderComp) addBuilderComp("battery"); }},
        {en:"Add a Resistor (470Ω).", hi:"Resistor (470Ω) add karo.", action:function(){ if(window.addBuilderComp) addBuilderComp("resistor"); }},
        {en:"Connect wires (or tap 🔗 Auto-Wire).", hi:"Wires connect karo (ya 🔗 Auto-Wire).", action:function(){ autoWire(); }},
        {en:"Press Simulate and check Health Score / current.", hi:"Simulate dabao, Health Score dekho.", action:function(){ if(window.runBuilderSim) runBuilderSim(); }}
      ]
    },
    {
      id:"led",
      nameEn:"LED + Series Resistor", nameHi:"LED + सीरीज रेजिस्टर",
      steps:[
        {en:"Go to Builder and clear or start fresh.", hi:"Builder mein jao.", action:function(){ if(window.showSection) showSection("builder"); }},
        {en:"Load LED Series preset (safe starting point).", hi:"LED Series preset load karo.", action:function(){ if(window.loadCircuitPreset) loadCircuitPreset("led_series"); }},
        {en:"Inspect polarity: LED anode toward +.", hi:"LED polarity check karo.", action:function(){}},
        {en:"Simulate — LED should light; Health should be good.", hi:"Simulate karo — LED jalna chahiye.", action:function(){ if(window.runBuilderSim) runBuilderSim(); }}
      ]
    },
    {
      id:"motor",
      nameEn:"Motor + Switch", nameHi:"मोटर + स्विच",
      steps:[
        {en:"Open Builder.", hi:"Builder kholo.", action:function(){ if(window.showSection) showSection("builder"); }},
        {en:"Load Motor + Switch preset.", hi:"Motor + Switch preset load karo.", action:function(){ if(window.loadCircuitPreset) loadCircuitPreset("motor_switch"); }},
        {en:"Toggle switch property / simulate motor path.", hi:"Switch aur simulate try karo.", action:function(){ if(window.runBuilderSim) runBuilderSim(); }}
      ]
    }
  ];
  var gIdx=0, gStep=0;
  var gRoot=document.getElementById("elab-guided");
  var gSel=document.getElementById("elab-guided-select");
  function fillGuidedSelect(){
    gSel.innerHTML = EXPERIMENTS.map(function(ex,i){
      return '<option value="'+i+'">'+(isHi()?ex.nameHi:ex.nameEn)+'</option>';
    }).join("");
  }
  function renderGuided(){
    var ex=EXPERIMENTS[gIdx];
    if(!ex) return;
    var st=ex.steps[gStep];
    document.getElementById("elab-g-step").textContent = T("STEP","चरण")+" "+(gStep+1)+" / "+ex.steps.length;
    document.getElementById("elab-g-desc").textContent = st ? (isHi()?st.hi:st.en) : "";
    document.getElementById("elab-g-next").textContent = gStep>=ex.steps.length-1 ? T("Finish","समाप्त") : (gStep===0 && document.getElementById("elab-g-next").dataset.started!=="1" ? T("Start","शुरू") : T("Next →","आगे →"));
  }
  function openGuided(){
    fillGuidedSelect();
    gIdx=Number(gSel.value)||0; gStep=0;
    document.getElementById("elab-g-next").dataset.started="";
    gRoot.classList.add("open"); gRoot.setAttribute("aria-hidden","false");
    renderGuided();
  }
  document.getElementById("elab-fab-guide")?.addEventListener("click", openGuided);
  document.getElementById("elab-g-close")?.addEventListener("click", function(){
    gRoot.classList.remove("open"); gRoot.setAttribute("aria-hidden","true");
  });
  gSel.addEventListener("change", function(){ gIdx=Number(gSel.value)||0; gStep=0; renderGuided(); });
  document.getElementById("elab-g-back")?.addEventListener("click", function(){
    if(gStep>0){ gStep--; renderGuided(); }
  });
  document.getElementById("elab-g-next")?.addEventListener("click", function(){
    var ex=EXPERIMENTS[gIdx]; if(!ex) return;
    var st=ex.steps[gStep];
    document.getElementById("elab-g-next").dataset.started="1";
    if(st && typeof st.action==="function"){ try{ st.action(); }catch(e){ console.warn(e);} }
    if(gStep >= ex.steps.length-1){
      if(window.elabV575Toast) elabV575Toast(T("Experiment complete!","Experiment complete!"));
      if(window.NilSparkLabBadges && NilSparkLabBadges.unlock) try{ NilSparkLabBadges.unlock("first_circuit"); }catch(e){}
      gRoot.classList.remove("open");
      return;
    }
    gStep++;
    renderGuided();
  });

  /* ===== 2. Lab Report ===== */
  function buildReport(){
    var cs=comps(), ws=wires();
    var lines=[];
    lines.push("NIL SparkLab Lab Report");
    lines.push("Version: "+((window.NilSparkLabConfig&&NilSparkLabConfig.version)||"5.95 Pro"));
    lines.push("Date: "+new Date().toLocaleString());
    lines.push("");
    lines.push("Components ("+cs.length+"):");
    cs.forEach(function(c,i){
      lines.push("  "+(i+1)+". "+(c.name||c.type)+" ["+typeOf(c)+"] x="+Math.round(c.x||0)+" y="+Math.round(c.y||0));
    });
    lines.push("");
    lines.push("Wires: "+ws.length);
    lines.push("");
    if(window.NilSparkLabHealth && NilSparkLabHealth.analyze){
      var h=NilSparkLabHealth.analyze();
      lines.push("Health Score: "+h.score+"/100 ("+h.status+")");
      (h.tips||[]).forEach(function(t){ lines.push("  - "+t); });
    }
    lines.push("");
    lines.push("Observation:");
    lines.push("________________________________");
    lines.push("Conclusion:");
    lines.push("________________________________");
    return lines.join("\n");
  }
  function openReport(){
    document.getElementById("elab-report-body").textContent = buildReport();
    var m=document.getElementById("elab-report-modal");
    m.classList.add("open"); m.setAttribute("aria-hidden","false");
  }
  document.getElementById("elab-fab-report")?.addEventListener("click", openReport);
  document.getElementById("elab-report-close")?.addEventListener("click", function(){
    var m=document.getElementById("elab-report-modal");
    m.classList.remove("open"); m.setAttribute("aria-hidden","true");
  });
  document.getElementById("elab-report-copy")?.addEventListener("click", function(){
    var t=document.getElementById("elab-report-body").textContent;
    if(navigator.clipboard) navigator.clipboard.writeText(t);
    if(window.elabV575Toast) elabV575Toast(T("Report copied","Report copy ho gaya"));
  });
  document.getElementById("elab-report-print")?.addEventListener("click", function(){
    var w=window.open("", "_blank");
    if(!w) return;
    var body=document.getElementById("elab-report-body").textContent;
    var safeBody = body.replace(/[&<>"\']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","\'":"&#39;"}[c];});
    w.document.write("<!doctype html><html><head><meta charset='utf-8'><title>NIL SparkLab Report</title><style>body{font-family:monospace;white-space:pre-wrap;padding:24px}</style></head><body>" + safeBody + "</body></html>");
    w.document.close();
  });
})();
