
(function(){
  "use strict";

  /* ========== 4. Sound + Haptic ========== */
  var audioCtx = null;
  function ensureAudio(){
    try{
      if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state === "suspended") audioCtx.resume();
    }catch(_){}
  }
  function beep(freq, dur, type, vol){
    try{
      ensureAudio();
      if(!audioCtx) return;
      var o = audioCtx.createOscillator();
      var g = audioCtx.createGain();
      o.type = type || "sine";
      o.frequency.value = freq || 520;
      g.gain.value = vol || 0.04;
      o.connect(g); g.connect(audioCtx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (dur||0.08));
      o.stop(audioCtx.currentTime + (dur||0.08) + 0.02);
    }catch(_){}
  }
  function haptic(ms){
    try{ if(navigator.vibrate) navigator.vibrate(ms||12); }catch(_){}
  }
  window.elabSFX = {
    click: function(){ beep(640, 0.04, "triangle", 0.03); haptic(8); },
    connect: function(){ beep(880, 0.06, "sine", 0.045); haptic(15); },
    success: function(){ beep(523, 0.07, "sine", 0.04); setTimeout(function(){ beep(784, 0.1, "sine", 0.04); }, 70); haptic(20); },
    warn: function(){ beep(220, 0.12, "square", 0.035); haptic([20,40,20]); },
    badge: function(){ beep(660, 0.08, "sine", 0.05); setTimeout(function(){ beep(990, 0.12, "sine", 0.05); }, 90); haptic(25); }
  };
  document.addEventListener("pointerdown", function(){ ensureAudio(); }, {once:true, passive:true});

  /* ========== 3. Badges & Streak ========== */
  var BADGE_KEY = "elab_v593_badges";
  var STREAK_KEY = "elab_v593_streak";
  var BADGE_DEFS = [
    {id:"first_circuit", icon:"🔌", name:"First Circuit", desc:"Build your first circuit"},
    {id:"first_sim", icon:"▶", name:"First Simulate", desc:"Run simulation once"},
    {id:"five_sims", icon:"⚡", name:"Power User", desc:"Simulate 5 times"},
    {id:"wire_master", icon:"🔗", name:"Wire Master", desc:"Connect 10 wires"},
    {id:"quiz_80", icon:"🎯", name:"Quiz Ace", desc:"Score 80%+ in a quiz"},
    {id:"industrial", icon:"🏭", name:"Industrial Rookie", desc:"Try Industrial Lab"},
    {id:"share", icon:"📤", name:"Sharer", desc:"Copy a share link"},
    {id:"streak_3", icon:"🔥", name:"3-Day Streak", desc:"Learn 3 days in a row"}
  ];

  function readBadges(){
    try{ var x = JSON.parse(localStorage.getItem(BADGE_KEY)||"{}"); return x && typeof x==="object"?x:{}; }catch(_){ return {}; }
  }
  function writeBadges(b){ try{ localStorage.setItem(BADGE_KEY, JSON.stringify(b)); }catch(_){} }
  function readStreak(){
    try{ return JSON.parse(localStorage.getItem(STREAK_KEY)||"{}")||{}; }catch(_){ return {}; }
  }
  function touchStreak(){
    var s = readStreak();
    var today = new Date().toISOString().slice(0,10);
    if(s.last === today) return s.count||0;
    var y = new Date(); y.setDate(y.getDate()-1);
    var yest = y.toISOString().slice(0,10);
    s.count = (s.last === yest) ? (s.count||0)+1 : 1;
    s.last = today;
    try{ localStorage.setItem(STREAK_KEY, JSON.stringify(s)); }catch(_){}
    if(s.count >= 3) unlockBadge("streak_3");
    return s.count;
  }
  function unlockBadge(id){
    var b = readBadges();
    if(b[id]) return false;
    b[id] = {at: new Date().toISOString()};
    writeBadges(b);
    var def = BADGE_DEFS.find(function(d){ return d.id===id; });
    showBadgeToast(def||{icon:"🏅", name:id, desc:""});
    refreshBadgePill();
    if(window.elabSFX) elabSFX.badge();
    return true;
  }
  function showBadgeToast(def){
    var t = document.getElementById("elab-badge-toast");
    if(!t) return;
    document.getElementById("elab-bt-icon").textContent = def.icon||"🏅";
    document.getElementById("elab-bt-title").textContent = "Badge: "+(def.name||"");
    document.getElementById("elab-bt-sub").textContent = def.desc||"";
    t.classList.add("show");
    setTimeout(function(){ t.classList.remove("show"); }, 2800);
  }
  function refreshBadgePill(){
    var b = readBadges();
    var n = Object.keys(b).length;
    var el = document.getElementById("elab-bp-count");
    if(el) el.textContent = String(n);
  }
  function openBadgesModal(){
    var grid = document.getElementById("elab-bm-grid");
    var earned = readBadges();
    var streak = readStreak();
    document.getElementById("elab-bm-streak").textContent = String(streak.count||0);
    grid.innerHTML = BADGE_DEFS.map(function(d){
      var on = !!earned[d.id];
      return '<div class="bm-item '+(on?"earned":"")+'"><div class="ic">'+d.icon+'</div><div class="nm">'+d.name+'</div><div class="ds">'+d.desc+'</div></div>';
    }).join("");
    var m = document.getElementById("elab-badges-modal"); if(m){ m.classList.add("open"); m.setAttribute("aria-hidden","false"); }
  }
  document.getElementById("elab-badges-pill")?.addEventListener("click", openBadgesModal);
  document.getElementById("elab-bm-close")?.addEventListener("click", function(){
    var m = document.getElementById("elab-badges-modal"); if(m){ m.classList.remove("open"); m.setAttribute("aria-hidden","true"); }
  });
  document.addEventListener("DOMContentLoaded", function(){
    touchStreak();
    refreshBadgePill();
  });

  /* ========== 1. Circuit Health Score ========== */
  function analyzeCircuit(){
    var comps = [];
    var wires = [];
    try{ comps = Array.isArray(window.builderCanvasComps)?window.builderCanvasComps:[]; }catch(_){}
    try{ wires = Array.isArray(window.builderWires)?window.builderWires:[]; }catch(_){}
    var tips = [];
    var score = 100;
    var typeOf = function(c){ return String(c&&(c.type||c.kind||"")).toLowerCase().replace(/[\s-]+/g,"_"); };

    if(!comps.length){
      return {score:0, status:"Empty", level:"bad", tips:["Canvas empty hai. Component add karke circuit banao."]};
    }

    var sources = comps.filter(function(c){ return ["battery","source","dc_source","ac_source","generator"].indexOf(typeOf(c))>=0; });
    var loads = comps.filter(function(c){ return ["resistor","led","motor","lamp","buzzer","diode"].indexOf(typeOf(c))>=0; });
    var leds = comps.filter(function(c){ return typeOf(c)==="led"; });
    var resistors = comps.filter(function(c){ return typeOf(c)==="resistor"; });

    if(!sources.length){ score -= 35; tips.push("⚠ Voltage source (battery/DC) missing hai."); }
    if(!loads.length){ score -= 20; tips.push("⚠ Koi load (resistor/LED/motor) nahi mila."); }
    if(comps.length > 1 && wires.length < comps.length-1){
      score -= 25; tips.push("⚠ Wires incomplete lagti hain — terminals connect karo.");
    }
    if(leds.length && !resistors.length && sources.length){
      score -= 20; tips.push("⚠ LED ke saath series resistor recommend hai (overcurrent se bacho).");
    }
    if(wires.length >= 10) unlockBadge("wire_master");
    if(comps.length >= 1) unlockBadge("first_circuit");

    score = Math.max(0, Math.min(100, score));
    var level = score >= 80 ? "ok" : score >= 50 ? "warn" : "bad";
    var status = level==="ok" ? "Healthy" : level==="warn" ? "Needs attention" : "Critical issues";
    if(!tips.length) tips.push("✓ Circuit structure looks good. Simulate karke values verify karo.");
    return {score:score, status:status, level:level, tips:tips};
  }

  function showHealthPanel(result){
    var panel = document.getElementById("elab-health-panel");
    var scoreEl = document.getElementById("elab-hp-score");
    var statusEl = document.getElementById("elab-hp-status");
    var tipsEl = document.getElementById("elab-hp-tips");
    if(!panel) return;
    scoreEl.textContent = result.score + " / 100";
    scoreEl.className = "hp-score " + result.level;
    statusEl.textContent = result.status;
    statusEl.style.color = result.level==="ok" ? "#86efac" : result.level==="warn" ? "#fcd34d" : "#fca5a5";
    tipsEl.innerHTML = result.tips.map(function(t){ return '<div class="hp-tip">'+t+'</div>'; }).join("");
    panel.classList.add("show");
    panel.setAttribute("aria-hidden","false");
    if(result.level==="ok" && window.elabSFX) elabSFX.success();
    else if(result.level!=="ok" && window.elabSFX) elabSFX.warn();
  }
  document.getElementById("elab-hp-close")?.addEventListener("click", function(){
    var panel = document.getElementById("elab-health-panel");
    panel.classList.remove("show");
    panel.setAttribute("aria-hidden","true");
  });

  // Hook simulate
  var _simCount = 0;
  try{ _simCount = Number(localStorage.getItem("elab_v593_sim_count")||0)||0; }catch(_){}
  var origSim = window.runBuilderSim;
  window.runBuilderSim = function(){
    if(typeof origSim === "function"){
      try{ origSim.apply(this, arguments); }catch(e){ console.warn(e); }
    }
    _simCount++;
    try{ localStorage.setItem("elab_v593_sim_count", String(_simCount)); }catch(_){}
    unlockBadge("first_sim");
    if(_simCount >= 5) unlockBadge("five_sims");
    // v5.96: health is available on explicit request only; never auto-open after Run.
  };

  // Industrial visit
  var origShow = window.showSection;
  if(typeof origShow === "function"){
    window.showSection = function(){
      var args = arguments;
      origShow.apply(this, args);
      if(args[0] === "industrial") unlockBadge("industrial");
      if(args[0] === "builder") setTimeout(function(){
        try{
          if(Array.isArray(window.builderCanvasComps) && window.builderCanvasComps.length) unlockBadge("first_circuit");
        }catch(_){}
      }, 300);
    };
  }

  /* ========== 2. Shareable Circuit Link ========== */
  function collectSharePayload(){
    var comps = [], wires = [];
    try{ comps = Array.isArray(window.builderCanvasComps)?window.builderCanvasComps:[]; }catch(_){}
    try{ wires = Array.isArray(window.builderWires)?window.builderWires:[]; }catch(_){}
    // compact: type, x, y, key props, terminals simplified
    var c = comps.map(function(x){
      return {
        id: x.id, type: x.type||x.kind, name: x.name,
        x: Math.round(x.x||0), y: Math.round(x.y||0),
        v: x.v!=null?x.v:x.voltage, r: x.r!=null?x.r:x.resistance,
        rotation: x.rotation||0
      };
    });
    var w = wires.map(function(x){
      return { from: x.from, to: x.to, color: x.color };
    });
    return {v:1, c:c, w:w};
  }
  function encodeShare(payload){
    try{
      var json = JSON.stringify(payload);
      var b64 = btoa(unescape(encodeURIComponent(json)));
      return b64.replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
    }catch(e){ return null; }
  }
  function decodeShare(str){
    try{
      str = str.replace(/-/g,"+").replace(/_/g,"/");
      while(str.length % 4) str += "=";
      var json = decodeURIComponent(escape(atob(str)));
      return JSON.parse(json);
    }catch(e){ return null; }
  }
  function buildShareUrl(){
    var payload = collectSharePayload();
    if(!payload.c.length) return null;
    var code = encodeShare(payload);
    if(!code) return null;
    var base = location.href.split("#")[0].split("?")[0];
    return base + "#elab=" + code;
  }
  async function copyShareLink(){
    var url = buildShareUrl();
    if(!url){
      if(window.elabV575Toast) elabV575Toast("Pehle circuit banao");
      else await NilSparkLabDialog.alert("Build a circuit first.", {title:"Nothing to Share"});
      return;
    }
    async function ok(){
      unlockBadge("share");
      if(window.elabSFX) elabSFX.click();
      if(window.elabV575Toast) elabV575Toast("Share link copied");
      else await NilSparkLabDialog.alert("Link copied.", {title:"Share Link"});
    }
    if(navigator.clipboard && navigator.clipboard.writeText){
      try{ await navigator.clipboard.writeText(url); await ok(); }
      catch(e){ var value=await NilSparkLabDialog.prompt("Copy this link:", url, {title:"Copy Share Link", okText:"DONE", inputLabel:"Share URL"}); if(value!==null) await ok(); }
    } else {
      var value=await NilSparkLabDialog.prompt("Copy this link:", url, {title:"Copy Share Link", okText:"DONE", inputLabel:"Share URL"}); if(value!==null) await ok();
    }
  }
  function nativeShare(){
    var url = buildShareUrl();
    if(!url){ if(window.elabV575Toast) elabV575Toast("Pehle circuit banao"); return; }
    if(navigator.share){
      navigator.share({title:"NIL SparkLab Circuit", text:"Mera circuit dekho", url:url})
        .then(function(){ unlockBadge("share"); })
        .catch(function(){ copyShareLink(); });
    } else copyShareLink();
  }
  document.getElementById("elab-share-copy")?.addEventListener("click", copyShareLink);
  document.getElementById("elab-share-native")?.addEventListener("click", nativeShare);

  // Load from hash
  function tryLoadShared(){
    var hash = location.hash || "";
    var m = hash.match(/elab=([A-Za-z0-9_-]+)/);
    if(!m) return;
    var data = decodeShare(m[1]);
    if(!data || !Array.isArray(data.c)) return;
    try{
      if(typeof window.showSection === "function") window.showSection("builder");
      var validator=window.NilSparkLabSecurity&&window.NilSparkLabSecurity.validateProject;
      if(typeof validator!=="function") return false;
      var normalized={version:"5.62",name:"Shared Circuit",circuit:{components:Array.isArray(data.c)?data.c:[],wires:Array.isArray(data.w)?data.w:[]},simulation:{}};
      var checked=validator(normalized);
      if(!checked||!checked.ok){ console.warn("Shared circuit rejected:",checked&&checked.error); return false; }
      window.NilSparkLabBuilderState.replace(checked.value.circuit.components,checked.value.circuit.wires);
      if(typeof window.renderBuilderCanvas === "function") window.renderBuilderCanvas();
      var ban = document.getElementById("elab-shared-banner");
      if(ban) ban.classList.add("show");
      if(window.elabV575Toast) elabV575Toast("Shared circuit loaded");
      unlockBadge("first_circuit");
    }catch(e){ console.warn("Share load:", e); }
  }
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(tryLoadShared, 500); });

  // Wire-connect sound: monkey-patch subtle via MutationObserver on wire count is heavy;
  // instead listen clicks on terminals
  document.addEventListener("click", function(e){
    if(e.target.closest && e.target.closest(".el-integrated-terminal")){
      if(window.elabSFX) setTimeout(function(){ elabSFX.connect(); }, 30);
    }
    if(e.target.closest && e.target.closest("button")){
      // light click for primary UI buttons only
    }
  }, true);

  // Expose health for manual check
  window.NilSparkLabHealth = { analyze: analyzeCircuit, show: function(){ showHealthPanel(analyzeCircuit()); } };
  window.NilSparkLabShare = { copy: copyShareLink, url: buildShareUrl };
  window.NilSparkLabBadges = { unlock: unlockBadge, open: openBadgesModal };
})();
