
(function(){
  "use strict";

  function toast(m){ if(window.elabV575Toast) elabV575Toast(m); else try{ console.log(m);}catch(e){} }
  function goBuilder(){ if(typeof window.showSection==="function") window.showSection("builder"); }

  /* ========== 1. Natural Language Circuit Builder ========== */
  function parseNL(text){
    var q = String(text||"").toLowerCase();
    var items = [];
    // voltage battery
    var vm = q.match(/(\d+(?:\.\d+)?)\s*v/);
    var volts = vm ? parseFloat(vm[1]) : 9;
    if(/batter|source|power|cell|supply/.test(q) || /battery|9v|12v/.test(q)){
      items.push({type:"battery", props:{v:volts}});
    }
    var rm = q.match(/(\d+(?:\.\d+)?)\s*(ohm|Ω|r\b)/);
    if(/resist|ohm|470|220|1k|10k/.test(q)){
      var r = rm ? parseFloat(rm[1]) : (/1k|1000/.test(q)?1000:/10k/.test(q)?10000:/220/.test(q)?220:470);
      if(/1k/.test(q) && !rm) r=1000;
      items.push({type:"resistor", props:{r:r}});
    }
    if(/potentiometer|pot\b|dimmer|preset/.test(q)) items.push({type:"potentiometer", props:{r:2500}});
    if(/\bled\b|light emitting/.test(q)) items.push({type:"led", props:{}});
    if(/motor/.test(q)) items.push({type:"motor", props:{}});
    if(/switch|button/.test(q)) items.push({type:"switch", props:{closed:true}});
    if(/capacitor|cap\b/.test(q)) items.push({type:"capacitor", props:{}});
    if(/diode/.test(q)) items.push({type:"diode", props:{}});
    if(/buzzer|beep/.test(q)) items.push({type:"buzzer", props:{}});
    // presets shortcuts
    if(/led series|series led/.test(q)) return {preset:"led_series"};
    if(/motor.*switch|switch.*motor/.test(q)) return {preset:"motor_switch"};
    if(/pot.*dimmer|dimmer/.test(q)) return {preset:"pot_dimmer"};
    if(!items.length && /series/.test(q)){
      items = [{type:"battery",props:{v:9}},{type:"resistor",props:{r:470}},{type:"led",props:{}}];
    }
    return {items:items, series:/series|ek line|siiries/.test(q)};
  }

  function buildFromNL(text){
    var parsed = parseNL(text);
    goBuilder();
    if(parsed.preset && typeof window.loadCircuitPreset==="function"){
      window.loadCircuitPreset(parsed.preset);
      toast("Preset loaded: "+parsed.preset);
      speak("Preset load ho gaya");
      return true;
    }
    var items = parsed.items||[];
    if(!items.length){
      toast("Samajh nahi aya — example: 9V battery, 470 ohm, LED series");
      speak("Please clear components bolo");
      return false;
    }
    if(typeof window.resetBuilder==="function"){
      try{ window.resetBuilder(); }catch(e){}
    } else if(Array.isArray(window.builderCanvasComps)){
      window.builderCanvasComps.length=0;
      if(Array.isArray(window.builderWires)) window.builderWires.length=0;
    }
    items.forEach(function(it, i){
      if(typeof window.addBuilderComp==="function"){
        try{
          window.addBuilderComp(it.type, Object.assign({x:40+i*70, y:80+(i%2)*60}, it.props||{}));
        }catch(e){
          try{ window.addBuilderComp(it.type); }catch(e2){}
        }
      }
    });
    setTimeout(function(){
      if(window.NilSparkLabAutoWire && NilSparkLabAutoWire.run) NilSparkLabAutoWire.run();
      else if(typeof window.renderBuilderCanvas==="function") window.renderBuilderCanvas();
      toast("NL build: "+items.length+" parts");
      speak("Circuit ready. Simulate try karo");
    }, 200);
    return true;
  }

  document.getElementById("elab-nl-go")?.addEventListener("click", function(){
    buildFromNL(document.getElementById("elab-nl-input").value);
  });
  document.getElementById("elab-nl-input")?.addEventListener("keydown", function(e){
    if(e.key==="Enter") buildFromNL(e.target.value);
  });

  /* ========== 4. Voice Coach ========== */
  function speak(text){
    try{
      if(!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      u.rate = 1.05; u.pitch = 1;
      // prefer Hindi voice if available
      var voices = window.speechSynthesis.getVoices()||[];
      var hi = voices.find(function(v){ return /hi-IN|Hindi/i.test(v.lang+" "+v.name); });
      if(hi) u.voice = hi;
      window.speechSynthesis.speak(u);
    }catch(e){}
  }
  function startVoice(){
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){ toast("Voice is browser-limited (Chrome best)"); return; }
    var rec = new SR();
    rec.lang = "en-IN"; // works well for Hinglish
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = function(ev){
      var said = ev.results[0][0].transcript;
      document.getElementById("elab-nl-input").value = said;
      // if question-like, ask assistant; else build
      if(/kya|kyun|kaise|help|nahi|what|why|how|\?/.test(said.toLowerCase())){
        if(window.NilSparkLabSmartAssistant && NilSparkLabSmartAssistant.ask){
          var ans = NilSparkLabSmartAssistant.ask(said);
          if(NilSparkLabSmartAssistant.open) NilSparkLabSmartAssistant.open(ans);
          speak(ans.slice(0,160));
        }
      } else {
        buildFromNL(said);
      }
    };
    rec.onerror = function(){ toast("Mic error / permission"); };
    try{ rec.start(); toast("Listening…"); }catch(e){ toast("Mic busy"); }
  }
  document.getElementById("elab-voice-btn")?.addEventListener("click", startVoice);
  window.elabSpeak = speak;

  /* ========== 3. Waveform scrubber ========== */
  var waveData = {v:[], i:[], n:100};
  function synthWave(){
    var n=100; waveData.v=[]; waveData.i=[]; waveData.n=n;
    var hasLed = false, hasMotor=false;
    try{
      (window.builderCanvasComps||[]).forEach(function(c){
        var t=String(c.type||"").toLowerCase();
        if(t.indexOf("led")>=0) hasLed=true;
        if(t.indexOf("motor")>=0) hasMotor=true;
      });
    }catch(e){}
    for(var t=0;t<n;t++){
      var x=t/n;
      var v = 5 + 4*Math.sin(x*Math.PI*2*2) * (hasMotor?0.6:1);
      if(hasLed) v = Math.max(0, v);
      var i = v/470 * 1000; // mA-ish
      waveData.v.push(v); waveData.i.push(i);
    }
  }
  function drawWave(idx){
    var c=document.getElementById("elab-wave-canvas");
    if(!c) return;
    var ctx=c.getContext("2d");
    var w=c.width, h=c.height;
    ctx.fillStyle="#020617"; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle="#334155"; ctx.beginPath();
    ctx.moveTo(0,h/2); ctx.lineTo(w,h/2); ctx.stroke();
    function plot(arr, color){
      ctx.strokeStyle=color; ctx.beginPath();
      for(var i=0;i<arr.length;i++){
        var x=i/(arr.length-1)*w;
        var y=h/2 - (arr[i]/12)* (h*0.4);
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
    plot(waveData.v, "#22d3ee");
    plot(waveData.i.map(function(x){return x/10;}), "#86efac");
    // scrub line
    var x = (idx/100)*w;
    ctx.strokeStyle="#fbbf24"; ctx.beginPath();
    ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
    var vi = Math.min(waveData.n-1, Math.floor(idx/100*(waveData.n-1)));
    document.getElementById("elab-wave-readout").textContent =
      "t = "+(idx*2)+" ms · V≈"+(waveData.v[vi]||0).toFixed(2)+" V · I≈"+(waveData.i[vi]||0).toFixed(2)+" mA";
  }
  function openWave(){
    synthWave();
    document.getElementById("elab-wave-panel").classList.add("open");
    drawWave(Number(document.getElementById("elab-wave-slider").value)||0);
  }
  document.getElementById("elab-wave-slider")?.addEventListener("input", function(){
    drawWave(Number(this.value)||0);
  });
  document.getElementById("elab-wave-close")?.addEventListener("click", function(){
    document.getElementById("elab-wave-panel").classList.remove("open");
  });
  // v5.96: waveform scrubber is user-opened only (Learning Lab → Waveform).
  // Simulation must not automatically open or cover the circuit.

  /* ========== 2. Live Classroom ========== */
  var classChan = null;
  var classRoom = "";
  function classKey(){ return "elab_class_"+classRoom; }
  function snapshot(){
    var c=[], w=[];
    try{ c = JSON.parse(JSON.stringify(window.builderCanvasComps||[])); }catch(e){}
    try{ w = JSON.parse(JSON.stringify(window.builderWires||[])); }catch(e){}
    return {v:1, c:c, w:w, at:Date.now()};
  }
  function applySnap(data){
    if(!data||!Array.isArray(data.c)) return;
    goBuilder();
    try{
      var validator=window.NilSparkLabSecurity&&window.NilSparkLabSecurity.validateProject;
      if(typeof validator!=="function") return;
      var checked=validator({version:"5.62",name:"Classroom Snapshot",circuit:{components:data.c,wires:Array.isArray(data.w)?data.w:[]},simulation:{}});
      if(!checked||!checked.ok){ console.warn("NilSparkLab classroom snapshot rejected:",checked&&checked.error); return; }
      var v=checked.value;
      window.NilSparkLabBuilderState.replace(v.circuit.components,v.circuit.wires);
      if(typeof window.renderBuilderCanvas==="function") window.renderBuilderCanvas();
    }catch(e){ console.warn(e); }
  }
  function ensureChan(){
    if(!classRoom) return null;
    try{
      if(classChan) try{ classChan.close(); }catch(e){}
      classChan = new BroadcastChannel("elab_"+classRoom);
      classChan.onmessage = function(ev){
        if(ev.data && ev.data.type==="circuit"){
          applySnap(ev.data.payload);
          document.getElementById("elab-class-status").textContent = "Pulled live @ "+new Date().toLocaleTimeString();
        }
      };
    }catch(e){ classChan=null; }
    return classChan;
  }
  document.getElementById("elab-class-create")?.addEventListener("click", function(){
    classRoom = (document.getElementById("elab-class-code").value||"LAB").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,12)||"LAB";
    document.getElementById("elab-class-code").value = classRoom;
    ensureChan();
    document.getElementById("elab-class-status").textContent = "Room "+classRoom+" active (multi-tab live)";
    toast("Room "+classRoom);
  });
  document.getElementById("elab-class-push")?.addEventListener("click", function(){
    if(!classRoom) document.getElementById("elab-class-create").click();
    var payload = snapshot();
    try{ localStorage.setItem(classKey(), JSON.stringify(payload)); }catch(e){}
    ensureChan();
    if(classChan) classChan.postMessage({type:"circuit", payload:payload});
    // also student link via share encoder if present
    if(window.NilSparkLabShare && NilSparkLabShare.copy){
      try{ NilSparkLabShare.copy(); }catch(e){}
    }
    document.getElementById("elab-class-status").textContent = "Pushed circuit to room "+classRoom;
    toast("Circuit pushed");
  });
  document.getElementById("elab-class-pull")?.addEventListener("click", function(){
    if(!classRoom) document.getElementById("elab-class-create").click();
    try{
      var raw = localStorage.getItem(classKey());
      if(raw){ applySnap(JSON.parse(raw)); document.getElementById("elab-class-status").textContent="Pulled from storage"; return; }
    }catch(e){}
    toast("Nothing to pull yet — teacher must Push");
  });
  document.getElementById("elab-class-close")?.addEventListener("click", function(){
    document.getElementById("elab-class-panel").classList.remove("open");
  });

  /* ========== 5. Camera → describe → build ========== */
  document.getElementById("elab-cam-file")?.addEventListener("change", function(e){
    var f=e.target.files && e.target.files[0];
    var prev=document.getElementById("elab-cam-preview");
    prev.innerHTML="";
    if(!f) return;
    var url=URL.createObjectURL(f);
    prev.innerHTML='<img src="'+url+'" alt="Preview of the uploaded circuit photo" style="max-width:100%;max-height:180px;border-radius:10px"/>';
    if(!document.getElementById("elab-cam-desc").value){
      document.getElementById("elab-cam-desc").value = "battery, resistor 470, LED series";
    }
  });
  document.getElementById("elab-cam-build")?.addEventListener("click", function(){
    buildFromNL(document.getElementById("elab-cam-desc").value);
    document.getElementById("elab-cam-panel").classList.remove("open");
  });
  document.getElementById("elab-cam-close")?.addEventListener("click", function(){
    document.getElementById("elab-cam-panel").classList.remove("open");
  });

  /* ========== 6. Digital twin ========== */
  var TWIN = {
    resistor:{ic:"電阻", name:"Resistor", why:"Limits current (Ohm's law). LED ke saath series protection.", fail:"Overheat if undersized power rating; open = circuit break."},
    led:{ic:"💡", name:"LED", why:"Efficient indicator / light. Needs series resistor + correct polarity.", fail:"Overcurrent burns; reverse voltage can damage."},
    battery:{ic:"🔋", name:"Battery", why:"DC energy source for the circuit.", fail:"Polarity reverse can damage polarized parts."},
    motor:{ic:"⚙️", name:"DC Motor", why:"Converts electrical energy to motion; inductive load.", fail:"Stall current high — need proper drive/protection."},
    capacitor:{ic:"⚡", name:"Capacitor", why:"Stores charge; filtering & timing (τ=RC).", fail:"Wrong polarity on electrolytic = failure."}
  };
  var twinType = "resistor";
  function openTwin(type){
    twinType = type||"resistor";
    var d = TWIN[twinType]||TWIN.resistor;
    document.getElementById("elab-twin-ic").textContent = d.ic;
    document.getElementById("elab-twin-name").textContent = d.name;
    document.getElementById("elab-twin-why").textContent = "Why: "+d.why;
    document.getElementById("elab-twin-fail").textContent = "Failure modes: "+d.fail;
    document.getElementById("elab-twin-panel").classList.add("open");
  }
  document.getElementById("elab-twin-add")?.addEventListener("click", function(){
    goBuilder();
    if(typeof window.addBuilderComp==="function") window.addBuilderComp(twinType==="battery"?"battery":twinType);
    document.getElementById("elab-twin-panel").classList.remove("open");
  });
  document.getElementById("elab-twin-close")?.addEventListener("click", function(){
    document.getElementById("elab-twin-panel").classList.remove("open");
  });
  window.elabOpenTwin = openTwin;

  /* ========== 7. Adaptive learning ========== */
  function adaptState(){
    var s={weak:[], score:{}};
    try{ s = JSON.parse(localStorage.getItem("elab_v595_adapt")||"{}")||s; }catch(e){}
    if(!s.score) s.score={};
    return s;
  }
  function adaptSave(s){ try{ localStorage.setItem("elab_v595_adapt", JSON.stringify(s)); }catch(e){} }
  function adaptNote(topic, delta){
    var s=adaptState();
    s.score[topic] = (s.score[topic]||0) + (delta||1);
    adaptSave(s);
  }
  function openAdapt(){
    var s=adaptState();
    // derive weak from health habits + low scores
    var weak=[];
    try{
      if(window.NilSparkLabHealth){
        var h=NilSparkLabHealth.analyze();
        if(h.score<70) weak.push("Circuit completeness / wiring");
        (h.tips||[]).forEach(function(t){ if(/LED|resistor|source|wire/i.test(t)) weak.push(t.slice(0,60)); });
      }
    }catch(e){}
    if((s.score.ohm||0)<2) weak.push("Ohm's Law practice");
    if((s.score.polarity||0)<1) weak.push("LED polarity");
    if((s.score.industrial||0)<1) weak.push("DOL starter sequence");
    if(!weak.length) weak.push("Try a new Guided Experiment to stay sharp");
    // unique
    weak = weak.filter(function(x,i,a){ return a.indexOf(x)===i; }).slice(0,5);
    document.getElementById("elab-adapt-summary").textContent = "Aapke signals ke hisaab se focus areas:";
    document.getElementById("elab-adapt-list").innerHTML = weak.map(function(w){ return "<li>"+w+"</li>"; }).join("");
    document.getElementById("elab-adapt-panel").classList.add("open");
  }
  document.getElementById("elab-adapt-start")?.addEventListener("click", function(){
    adaptNote("ohm",1);
    document.getElementById("elab-adapt-panel").classList.remove("open");
    if(window.NilSparkLabGuided && NilSparkLabGuided.open) NilSparkLabGuided.open();
    else if(typeof window.loadCircuitPreset==="function"){ goBuilder(); loadCircuitPreset("led_series"); }
    toast("Drill started");
    speak("Drill start. Steps follow karo");
  });
  document.getElementById("elab-adapt-close")?.addEventListener("click", function(){
    document.getElementById("elab-adapt-panel").classList.remove("open");
  });

  /* FAB extensions */
  function addFab(id, label, title, fn){
    var host=document.getElementById("elab-sa-tools-grid");
    if(!host || document.getElementById(id)) return;
    var b=document.createElement("button");
    b.type="button"; b.id=id; b.title=title; b.className="ng";
    b.innerHTML='<span class="tool-icon">'+label+'</span><span class="tool-label">'+title+'</span>';
    b.addEventListener("click", fn);
    host.appendChild(b);
  }
  function moveBaseToolsIntoAssistant(){
    var grid=document.getElementById("elab-sa-tools-grid");
    var host=document.getElementById("elab-fab-tools");
    if(!grid || !host) return;
    [
      ["elab-fab-guide","🎓","Guided"],
      ["elab-fab-autowire","🔗","Auto-Wire"],
    ].forEach(function(item){
      var old=document.getElementById(item[0]);
      if(!old) return;
      old.innerHTML='<span class="tool-icon">'+item[1]+'</span><span class="tool-label">'+item[2]+'</span>';
      old.title=item[2];
      old.className='ng';
      grid.appendChild(old);
    });
  }
  function initAssistantTools(){
    moveBaseToolsIntoAssistant();
    addFab("elab-fab-wave","📈","Waveform", openWave);
    addFab("elab-fab-class","🏫","Classroom", function(){ document.getElementById("elab-class-panel").classList.add("open"); });
    addFab("elab-fab-cam","📷","Camera build", function(){ document.getElementById("elab-cam-panel").classList.add("open"); });
    addFab("elab-fab-adapt","🧠","Adaptive", openAdapt);
    addFab("elab-fab-twin","🧬","Digital twin", function(){ openTwin("led"); });
  }
  // if DOM already ready
  if(document.readyState!=="loading"){
    setTimeout(function(){
      initAssistantTools();
    }, 0);
  }

  /* Legacy tool-toggle shim removed in v96.6.
     The current Assistant owns #elab-sa-tools-toggle / #elab-sa-tools directly. */
  document.addEventListener("DOMContentLoaded", function(){
    setTimeout(function(){ initAssistantTools(); }, 0);
  });
  if(document.readyState!=="loading") setTimeout(function(){ initAssistantTools(); }, 0);

  window.NilSparkLabNL = { build: buildFromNL, parse: parseNL };
  window.NilSparkLabVoice = { listen: startVoice, speak: speak };
  window.NilSparkLabWave = { open: openWave };
  window.NilSparkLabClassroom = { push: function(){ document.getElementById("elab-class-push").click(); } };
  window.NilSparkLabAdaptive = { open: openAdapt, note: adaptNote };


  /* ===== 4. Share QR + stronger restore ===== */
  function getShareUrl(){
    if(window.NilSparkLabShare && NilSparkLabShare.url) return NilSparkLabShare.url();
    return null;
  }
  function openQR(){
    var url=getShareUrl();
    if(!url){
      if(window.elabV575Toast) elabV575Toast(T("Build a circuit first","Pehle circuit banao"));
      return;
    }
    var img=document.getElementById("elab-qr-img");
    img.src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data="+encodeURIComponent(url);
    document.getElementById("elab-qr-hint").textContent = url.slice(0,64)+(url.length>64?"…":"");
    var m=document.getElementById("elab-qr-modal");
    m.classList.add("open"); m.setAttribute("aria-hidden","false");
  }
  document.getElementById("elab-fab-qr")?.addEventListener("click", openQR);
  document.getElementById("elab-qr-close")?.addEventListener("click", function(){
    var m=document.getElementById("elab-qr-modal");
    m.classList.remove("open"); m.setAttribute("aria-hidden","true");
  });
  document.getElementById("elab-qr-copy")?.addEventListener("click", function(){
    if(window.NilSparkLabShare && NilSparkLabShare.copy) NilSparkLabShare.copy();
  });

  // Improved hash load: also support ?elab= and delayed builder ready
  function decodeShare(str){
    try{
      str=str.replace(/-/g,"+").replace(/_/g,"/");
      while(str.length%4) str+="=";
      return JSON.parse(decodeURIComponent(escape(atob(str))));
    }catch(e){ return null; }
  }
  function restoreShared(data){
    if(!data||!Array.isArray(data.c)) return false;
    try{
      if(typeof window.showSection==="function") window.showSection("builder");
      var validator=window.NilSparkLabSecurity&&window.NilSparkLabSecurity.validateProject;
      if(typeof validator!=="function") return false;
      var normalized={version:"5.62",name:"Shared Circuit",circuit:{components:Array.isArray(data.c)?data.c:[],wires:Array.isArray(data.w)?data.w:[]},simulation:{}};
      var checked=validator(normalized);
      if(!checked||!checked.ok){ console.warn("Shared circuit rejected:",checked&&checked.error); return false; }
      window.NilSparkLabBuilderState.replace(checked.value.circuit.components,checked.value.circuit.wires);
      if(typeof window.renderBuilderCanvas==="function") window.renderBuilderCanvas();
      var ban=document.getElementById("elab-shared-banner");
      if(ban) ban.classList.add("show");
      return true;
    }catch(e){ console.warn(e); return false; }
  }
  function tryLoadSharedV594(){
    var hash=location.hash||"";
    var search=location.search||"";
    var m=hash.match(/elab=([A-Za-z0-9_-]+)/) || search.match(/[?&]elab=([A-Za-z0-9_-]+)/);
    if(!m) return;
    var data=decodeShare(m[1]);
    if(!data) return;
    var tries=0;
    var timer=setInterval(function(){
      tries++;
      if(typeof window.addBuilderComp==="function" || Array.isArray(window.builderCanvasComps)){
        clearInterval(timer);
        if(restoreShared(data) && window.elabV575Toast) elabV575Toast(T("Shared circuit loaded","Shared circuit load ho gaya"));
      }
      if(tries>25) clearInterval(timer);
    }, 200);
  }
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(tryLoadSharedV594, 400); });

  /* ===== 5. Hindi/EN for Assistant answers ===== */
  // Wrap ask if present
  function enhanceAssistantI18n(){
    var api=window.NilSparkLabSmartAssistant;
    if(!api||typeof api.ask!=="function") return;
    var orig=api.ask.bind(api);
    api.ask=function(q){
      var a=orig(q);
      if(!isHi()) return a;
      // light Hindi framing for common answers when user is in HI mode
      var map=[
        ["LED ke liye", "LED ke liye"],
        ["Wire banane", "Wire banane ke liye"],
        ["Ohm's Law", "Ohm ka niyam"],
        ["Simulate", "Simulate"],
        ["Main lab coach", "Main tumhara lab coach hoon"]
      ];
      // Already mixed Hinglish in KB — ensure prefix
      if(a && a.indexOf("👉")<0) return "👉 "+a;
      return a;
    };
  }
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(enhanceAssistantI18n, 800); });

  // Expose
  window.NilSparkLabGuided={ open: openGuided };
  window.NilSparkLabReport={ open: openReport, build: buildReport };
  window.NilSparkLabAutoWire={ run: autoWire };
})();
