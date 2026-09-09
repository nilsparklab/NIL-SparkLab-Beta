
(function(){
  "use strict";
  function comps(){ try{ return Array.isArray(window.builderCanvasComps)?window.builderCanvasComps:[]; }catch(e){ return []; } }
  function wires(){ try{ return Array.isArray(window.builderWires)?window.builderWires:[]; }catch(e){ return []; } }
  function typeOf(c){ return String(c&&(c.type||c.kind||c.componentType)||"").toLowerCase().replace(/[\s-]+/g,"_"); }
  function hasType(list){ return comps().some(function(c){ return list.indexOf(typeOf(c))>=0; }); }

  function loadEmptyPreset(id){
    try{
      if(typeof window.showSection==="function") window.showSection("builder");
      if(typeof window.loadCircuitPreset==="function") window.loadCircuitPreset(id);
      var sel=document.getElementById("builder-preset-select");
      if(sel) sel.value=id;
    }catch(e){ console.warn(e); }
  }
  function refreshEmptyState(){
    var empty=document.getElementById("canvas-empty-text");
    if(!empty) return;
    empty.classList.toggle("hidden", comps().length>0);
  }
  ["nilsparklab:project-loaded","nilsparklab:circuit-restored","nilsparklab:new-project"].forEach(function(ev){
    window.addEventListener(ev, function(){ setTimeout(refreshEmptyState,50); });
  });
  document.addEventListener("DOMContentLoaded", function(){
    setTimeout(refreshEmptyState,200);
    setInterval(refreshEmptyState,1500);
  });
  document.addEventListener("click", function(e){
    var b=e.target.closest("[data-empty-preset]");
    if(b){ e.preventDefault(); loadEmptyPreset(b.getAttribute("data-empty-preset")); }
  });

  function tourOpen(){
    if(window.NilSparkLabMiniTour&&NilSparkLabMiniTour.open){ NilSparkLabMiniTour.open(); return; }
    var root=document.getElementById("elab-mini-tour");
    if(root){ root.classList.add("open"); root.setAttribute("aria-hidden","false"); }
  }

  function analyzeContext(){
    var c=comps(), w=wires(), tips=[];
    var hasSrc=hasType(["battery","source","dc_source","ac_source","generator"]);
    var hasLed=hasType(["led"]);
    var hasR=hasType(["resistor","potentiometer"]);
    var hasMotor=hasType(["motor"]);
    var hasSwitch=hasType(["switch","push_button"]);
    if(!c.length){
      tips.push({t:"Canvas empty", d:"Quick start se circuit banao — pehla experiment LED Series best hai.", action:{label:"Load LED Series", preset:"led_series"}, kind:"coach"});
      return tips;
    }
    if(!hasSrc) tips.push({t:"Source missing", d:"Bina battery/DC source ke current nahi chalega. Pehle power add karo.", kind:"coach"});
    if(hasLed && hasSrc && !hasR) tips.push({t:"LED protection", d:"LED ke saath series 220–470Ω resistor lagao — overcurrent se LED bachao.", kind:"coach"});
    if(c.length>1 && w.length < Math.max(1, c.length-1)) tips.push({t:"Connections incomplete", d:"Wires kam hain. Do green terminals pe tap = wire. Wire pe click = delete.", kind:"coach"});
    if(hasMotor && hasSrc && !hasSwitch) tips.push({t:"Motor tip", d:"Motor ke saath switch lagao taaki ON/OFF control practice ho.", action:{label:"Motor + Switch", preset:"motor_switch"}, kind:"coach"});
    if(hasSrc && hasR && w.length>=Math.max(0,c.length-1) && hasLed) tips.push({t:"Ready to simulate", d:"Structure theek lag raha hai. Green Simulate dabao aur Health Score dekho.", kind:"coach"});
    if(!tips.length) tips.push({t:"Looking good", d:"Components maujood hain. Simulate karke values verify karo.", kind:"coach"});
    return tips;
  }

  function learningPath(){
    var badges={};
    try{ badges=JSON.parse(localStorage.getItem("elab_v593_badges")||"{}")||{}; }catch(e){}
    if(!badges.first_circuit) return [{t:"Next goal", d:"Pehla circuit banao → First Circuit badge.", action:{label:"LED Series", preset:"led_series"}, kind:"path"}];
    if(!badges.first_sim) return [{t:"Next goal", d:"Simulate dabao → First Simulate badge + Health Score.", kind:"path"}];
    if(!badges.five_sims) return [{t:"Next goal", d:"5 baar simulate karke Power User badge unlock karo.", kind:"path"}];
    if(!badges.industrial) return [{t:"Next goal", d:"Industrial Lab mein DOL starter try karo.", action:{label:"Open Industrial", section:"industrial"}, kind:"path"}];
    if(!badges.quiz_80) return [{t:"Next goal", d:"Quiz mein 80%+ score karke Quiz Ace bano.", action:{label:"Open Quiz", section:"quiz"}, kind:"path"}];
    return [{t:"Path complete", d:"Basic badges almost done! Share link aur Star-Delta try karo.", kind:"path"}];
  }

  var KB=[
    {keys:["led nahi","led kyun","led not","led off","led jal","led glow","led light","led nahi jal","led nahi jalta","led band","led problem","led issue"], a:"LED ke liye check karo: (1) Battery polarity sahi ho (2) Series mein 220–470Ω resistor ho (3) LED ka anode (+) source ki taraf (4) Wires closed loop mein hon. Simulate ke baad Health Score bhi dekho."},
    {keys:["wire","wiring","connect","terminal","kaise wire","wire kaise","wire banana","wire nahi","connection","jodna","jod","terminals"], a:"Wire banane ke liye do green terminals pe ek-ek karke tap karo. Galat wire hatani ho to us wire pe click/tap karo. Color picker se wire ka color badal sakte ho. Jaldi ke liye right side 🔗 Auto-Wire bhi use kar sakte ho."},
    {keys:["simulate","simulation","run circuit","kaise chal","sim karo","circuit chala","run karo","simulate kaise"], a:"Circuit complete karke green Simulate button dabao. Health Score panel tips dega. Multimeter probes se measure bhi kar sakte ho. Pehli baar Simulate pe Assistant coach bhi open ho sakta hai."},
    {keys:["series","parallel","series vs","series parallel","series mein","parallel mein"], a:"Series: current same rehta hai, voltage divide hota hai. Parallel: voltage same, current divide. Builder mein series = ek line; parallel = alag branches."},
    {keys:["ohm","ohm's","v=ir","resistance","ohm law","ohm ka niyam","current formula"], a:"Ohm's Law: V = I × R. Matlab current I = V/R. Practical Lab / Experiments mein Ohm's Law verify kar sakte ho. Guided mode (🎓) se step-by-step bhi try karo."},
    {keys:["resistor","470","ballast","resistance kitna","kaunsa resistor"], a:"Resistor current limit karta hai. LED ke saath usually 220Ω–1kΩ. Properties panel se value change kar sakte ho."},
    {keys:["dol","star delta","starter","contactor","industrial","motor starter"], a:"DOL sequence: START → coil → AUX seal-in → motor. STOP/OLR se trip. Industrial Lab mein practice karo. Star-Delta reduced starting current ke liye use hota hai."},
    {keys:["short","short circuit","overload","short ho","zyada current"], a:"Short = bahut low resistance path → current bahut badh jata hai. Fuse/protection lagao. Health Score incomplete wires aur missing resistor pe warn karta hai."},
    {keys:["battery","source","voltage","9v","power nahi","battery kaise"], a:"Battery/DC source circuit ki energy deta hai. Properties se voltage badlo. Polarity sahi rakho — LED aur diode polarity sensitive hote hain."},
    {keys:["quiz","exam","test","paper","sawal"], a:"Quiz section scored questions deta hai. Pehle Components + ek practical complete karke quiz do — score better aata hai."},
    {keys:["share","link","bhejo","qr","share karo","bhejna"], a:"Simulate ke baad Health panel se Copy Share Link, ya right side ▣ se QR banao. Link WhatsApp/classroom pe bhej sakte ho."},
    {keys:["hello","hi","namaste","help","madad","hello bhai","hey","kaise ho","assistant"], a:"Namaste! Main tumhara NIL SparkLab coach hoon — Hinglish mein bhi pooch sakte ho. Example: \"led nahi jal raha\", \"wire kaise banaye\", \"ohm ka niyam\". Neeche chips bhi try karo."},
    {keys:["motor","dc motor","motor nahi"], a:"DC motor load hai. Battery + switch + motor se basic drive banao. Preset: Motor + Switch. Guided 🎓 se bhi steps milenge."},
    {keys:["capacitor","rc","charging","capacitor kya"], a:"Capacitor energy store karta hai. RC charging mein time constant τ = R×C. Practical Lab mein experiment try karo."},
    {keys:["multimeter","measure","voltage measure","current measure","meter"], a:"Learning Lab → Multimeter. Probes canvas pe drag karke V / mA / continuity mode select karo."},
    {keys:["kya karu","ab kya","next","shuru","start kaise","kaise shuru","begin"], a:"Best start: Circuit Builder → LED Series preset, phir Simulate. Ya 🎓 Guided Experiment se Ohm's Law / LED steps follow karo. Empty canvas pe quick buttons bhi hain."},
    {keys:["thanks","thank","dhanyavad","shukriya","ok thanks"], a:"Badiya! Aur doubt ho to poochte raho — wire, LED, simulate, industrial, sab cover hai."},
    {keys:["error","bug","kaam nahi","not working","problem hai","issue hai"], a:"Pehle Health Score (Simulate ke baad) dekho. Common fixes: source add karo, wires complete karo, LED ke saath resistor lagao. Page hard refresh bhi try kar sakte ho."},
    {keys:["badge","streak","points","reward"], a:"Bottom-left 🏅 pe badges dikhte hain. Circuit banao, simulate karo, industrial try karo — badges unlock hote hain. Daily open karne se streak badhti hai."},
    {keys:["guide","guided","experiment","practical","lab manual"], a:"Right side 🎓 Guided Experiment dabao. Ohm's Law, LED series, Motor+Switch — step-by-step coach milta hai."},
    {keys:["health","health score","circuit health","circuit healthy","health check","score kitna","circuit score"], a:'Circuit Health dekhna ho to bolo: "health check". Main current circuit ke source, load, wiring aur LED protection ko check karke score/tips bataunga.'},
    {keys:["report","pdf","print","lab report","file"], a:"Right side 📄 se Lab Report banta hai — components, wires, health score. Print/PDF ya copy kar sakte ho submission ke liye."},
    {keys:["hindi","hinglish","english","bhasha","language"], a:"Main Hinglish samajh sakta hoon — Roman Hindi + English mix chalega. Upar language toggle se UI bhi EN/हिंदी switch hoti hai."}
  ];

  function normalizeHinglish(q){
    q = String(q||"").toLowerCase().trim();
    // common transliteration / typos
    var reps = [
      [/nahin|nhi|nai|nahe/g, "nahi"],
      [/kyaa|kya h/g, "kya"],
      [/kaisee|kese|kaisey/g, "kaise"],
      [/karoo|karro/g, "karo"],
      [/loging|loggin|logginng/g, "login"],
      [/banao+|banaao/g, "banao"],
      [/jalt[aai]|jalrh[ae]|jal rha/g, "jal"],
      [/please|pls|plz/g, ""],
      [/bhai+|yaar+/g, ""],
      [/\s+/g, " "]
    ];
    reps.forEach(function(r){ q = q.replace(r[0], r[1]); });
    return q.trim();
  }

  /* ===== NIL Smart Assistant Step 1 — Intent Detection =====
     Detect intent before routing to existing answer/tool engines. External
     providers are NOT called automatically: explicit search buttons/chips
     remain the user-consent boundary. */
  function detectIntent(question){
    var q=normalizeHinglish(question);
    var rules=[
      {id:"search",score:0,rx:[/\b(search|find|lookup|source|reference|research|paper|article)\b/,/ढूंढ|खोज|सर्च|रिसर्च|पेपर|स्रोत/]},
      {id:"troubleshoot",score:0,rx:[/\b(not working|problem|issue|error|fault|trouble|why|fix|repair)\b/,/nahi chal|kaam nahi|problem|issue|error|fault|kharab|kyun nahi/]},
      {id:"calculate",score:0,rx:[/\b(calculate|calculation|numerical|solve|value|find current|find voltage|find resistance)\b/,/calculation|numerical|solve karo|ganana|hisab|kitna current|kitna voltage|kitna resistance|मूल्य|गणना|न्यूमेरिकल/]},
      {id:"component",score:0,rx:[/\b(component|resistor|capacitor|diode|led|mosfet|transistor|contactor|relay|mcb|rccb|motor|transformer)\b/,/component|resistor|capacitor|diode|led|mosfet|transistor|contactor|relay|motor|transformer/]},
      {id:"circuit",score:0,rx:[/\b(circuit|wire|wiring|schematic|diagram|connection|simulate|simulation|builder)\b/,/circuit|wire|wiring|diagram|schematic|connection|simulate|simulation|builder|जोड़|सर्किट|वायर/]},
      {id:"practical",score:0,rx:[/\b(practical|experiment|lab|procedure|observation|report)\b/,/practical|experiment|lab|procedure|observation|report|प्रयोग|प्रैक्टिकल/]},
      {id:"quiz",score:0,rx:[/\b(quiz|viva|mcq|question|test|exam)\b/,/quiz|viva|mcq|question|test|exam|क्विज|वाइवा|परीक्षा/]},
      {id:"concept",score:0,rx:[/\b(explain|what is|meaning|principle|working|how does|difference|why)\b/,/samjha|samjhao|kya hai|principle|working|kaise kaam|difference|kyun|समझा|क्या है|सिद्धांत|कार्य/]}
    ];
    rules.forEach(function(r){r.rx.forEach(function(rx){if(rx.test(q))r.score+=1;});});
    var best={id:"general",confidence:0.25,query:q};
    rules.forEach(function(r){
      if(r.score>0){
        var confidence=Math.min(0.98,0.45+r.score*0.18);
        if(confidence>best.confidence) best={id:r.id,confidence:confidence,query:q};
      }
    });
    /* Tie-breakers keep electrical context deterministic. */
    if(best.id==="search" && /\bpaper|article|research\b/.test(q)) best.confidence=Math.max(best.confidence,0.88);
    if(/\b(numerical|calculate|solve)\b/.test(q)||/न्यूमेरिकल|गणना/.test(q)) best={id:"calculate",confidence:0.94,query:q};
    if(/\b(not working|fault|troubleshoot|problem)\b/.test(q)||/nahi chal|fault|problem/.test(q)) best={id:"troubleshoot",confidence:0.92,query:q};
    return Object.freeze(best);
  }
  window.NILAssistantIntent=Object.freeze({detect:detectIntent});

  function askAI(q){
    q = normalizeHinglish(q);
    if(!q) return "Kuch type karo — jaise “led nahi jal raha” ya “wire kaise banaye”.";
    var intent=detectIntent(q);
    window.__nilLastAssistantIntent=intent;
    /* NIL SparkLab v85 — Circuit-Aware Assistant. Use the live Builder state
       for circuit/troubleshooting questions before generic knowledge matching.
       This is read-only and never calls an external provider. */
    try{
      if(window.NILCircuitAwareAssistant && window.NILCircuitAwareAssistant.shouldHandle(intent.id,q)){
        return window.NILCircuitAwareAssistant.answer(q);
      }
    }catch(_){ }
    /* v10.36 FIX: Numerical routing bug.
       ROOT CAUSE: NilSparkLabDiagrams.answer() (called just below) uses broad
       substring keyword matching in findLibrary() — the "ohm" keyword on the
       verified "Ohm's Law" diagram entry matches ANY query containing the
       substring "ohm", including the Numerical chip's query "ohm law
       numerical". That caused the Diagram engine to answer first and return
       "📐 Diagram — Ohm's Law" before the Study KB (which already has correct
       numerical handling, see NilSparkLabStudyKB.answer()) ever saw the query.
       FIX: when the query expresses numerical intent AND the existing Study
       KB engine actually has a matching answer for it, use that answer
       directly and skip the Diagram engine entirely. If the Study KB has no
       match, fall through unchanged to the existing logic below — nothing
       else about Diagram/Ohm's Law/Quiz/Simulate is touched. */
    try{
      var qNum = String(q).toLowerCase();
      if(/numerical|न्यूमेरिकल/.test(qNum) && window.NilSparkLabStudyKB){
        if(/^numerical$|numerical topics|numerical practice|topics numerical|^न्यूमेरिकल$/.test(qNum.trim()) && typeof NilSparkLabStudyKB.numericalMenu==="function"){
          return NilSparkLabStudyKB.numericalMenu();
        }
        if(typeof NilSparkLabStudyKB.answer==="function"){
          var numAnswer = NilSparkLabStudyKB.answer(q);
          if(numAnswer) return numAnswer;
        }
      }
    }catch(_){}
    /* Intent-aware routing: troubleshooting should inspect the actual canvas
       before generic diagram/study matching. No external network call here. */
    if(intent.id==="troubleshoot" && typeof analyzeContext==="function"){
      var ctx=analyzeContext();
      if(ctx && ctx.length && !/^samajh/i.test(String(ctx[0].d||""))){
        return "🛠️ Troubleshooting mode\n\n"+ctx[0].d;
      }
    }
    /* Universal in-app schematic (library + canvas + text→draw) */
    try{
      window.__elabLastDiagram = null;
      if(window.NilSparkLabDiagrams && typeof NilSparkLabDiagrams.answer==="function"){
        var qn = String(q).toLowerCase();
        var forceDraw = /diagram|schematic|draw|dikha|डायग्राम|figure|sketch|banao circuit|circuit bana|ka diagram|show circuit/.test(qn);
        var diag = NilSparkLabDiagrams.answer(forceDraw ? (qn.indexOf("diagram")>=0 || qn.indexOf("draw")>=0 || qn.indexOf("डायग्राम")>=0 ? q : (q+" diagram")) : q);
        if(diag && (diag.diagram || diag.text)){
          window.__elabLastDiagram = diag.diagram || null;
          return typeof diag === "string" ? diag : (diag.text || "📐 Diagram ready.");
        }
        // If user clearly wants a drawing, always universal-draw
        if(forceDraw && typeof NilSparkLabDiagrams.draw==="function"){
          var d2 = NilSparkLabDiagrams.draw(q);
          if(d2){
            window.__elabLastDiagram = d2;
            return "📐 Diagram — drawn from your description.\n\nBest-effort schematic (verify in Builder).";
          }
        }
      }
    }catch(_){ window.__elabLastDiagram = null; }
    /* v6.13 study router */
    try{
      if(window.NilSparkLabStudyKB && typeof window.NilSparkLabStudyKB.answer==="function"){
        var studyAnswer = window.NilSparkLabStudyKB.answer(q);
        if(studyAnswer) return studyAnswer;
      }
    }catch(_){}
    var best=null, bestScore=0;
    KB.forEach(function(item){
      var s=0;
      item.keys.forEach(function(k){
        if(q.indexOf(k)>=0) s += (k.length * 2);
        // token overlap for Hinglish phrases
        var parts=k.split(/\s+/);
        parts.forEach(function(p){ if(p.length>2 && q.indexOf(p)>=0) s+=p.length; });
      });
      if(s>bestScore){ bestScore=s; best=item; }
    });
    if(best && bestScore>0) return best.a;
    // context fallback (Hinglish)
    if(typeof analyzeContext==="function"){
      var ctx=analyzeContext();
      if(ctx.length) return "Exact match nahi mila, lekin abhi ke circuit ke hisaab se: "+ctx[0].d;
    }
    return "Samajh gaya sawal, lekin is topic pe ready answer limited hai. Try karo: “ohm law”, “transformer principle”, “quiz start”, “led nahi jal raha”, “wire kaise” — ya study topic name type karo.";
  }


  function sec(){
    var ids=["home","components","symbols","builder","industrial","projects","faults","calculators","quiz","safety"];
    for(var i=0;i<ids.length;i++){
      var el=document.getElementById("sec-"+ids[i]);
      if(el&&!el.classList.contains("hidden")) return ids[i];
    }
    return "default";
  }
  var sectionTips={
    home:[{t:"Live demo", d:"Home pe live DC circuit se polarity samjho."}],
    components:[{t:"3-View", d:"Click → Symbol + Real + Wiring."}],
    builder:[{t:"Builder", d:"Add → wire → Simulate → Health."}],
    industrial:[{t:"Industrial", d:"DOL sequence + fault practice."}],
    quiz:[{t:"Quiz", d:"Pehle practical, phir quiz."}],
    default:[{t:"Explore", d:"Nav se section change karo."}]
  };
  var CHIPS=[
    {label:"📚 Topics", hi:"📚 टॉपिक्स", q:"topics list"},
    {label:"📐 Diagram", hi:"📐 डायग्राम", q:"led series diagram"},
    {label:"My circuit", hi:"मेरा सर्किट", q:"current circuit diagram"},
    {label:"Star-Delta", hi:"स्टार-डेल्टा", q:"star delta diagram"},
    {label:"Ohm's Law", hi:"ओम लॉ", q:"ohm law"},
    {label:"DOL / Star-Delta", hi:"DOL / स्टार-डेल्टा", q:"DOL starter"},
    {label:"Study Material", hi:"स्टडी मटेरियल", q:"basic electricity"},
    {label:"LED problem", hi:"LED समस्या", q:"led nahi jal raha"},
    {label:"Quiz start", hi:"क्विज़ शुरू", q:"ohm law quiz start"},
    {label:"Numerical", hi:"न्यूमेरिकल", q:"numerical topics"},
    {label:"Simulate", hi:"सिमुलेट", q:"simulate kaise"},
    {label:"🔍 Analyze My Circuit", hi:"🔍 मेरा सर्किट चेक", q:"__circuit_analysis__"},
    {label:"🌐 Web Search", hi:"🌐 वेब सर्च", q:"__wiki_search__"},
    {label:"📚 Research Search", hi:"📚 रिसर्च सर्च", q:"__research_search__"},
    {label:"📖 Literature Search", hi:"📖 लिटरेचर सर्च", q:"__literature_search__"},
    {label:"📚 Book Search", hi:"📚 बुक सर्च", q:"__book_search__"},
    {label:"🧪 Practical + Viva", hi:"🧪 प्रैक्टिकल + विवा", q:"__practical_viva__"},
    {label:"🛠 Fault Finder", hi:"🛠 फॉल्ट फाइंडर", q:"__fault_copilot__"},
    {label:"🧠 Task Mode", hi:"🧠 टास्क मोड", q:"__agentic_task__"}
  ];
  // v10.32 — UI-only quick-action cleanup.
  // Keep the full CHIPS registry so the underlying Assistant actions remain
  // available to the existing logic; only the selected actions are rendered visibly.
  var VISIBLE_QUICK_ACTIONS=new Set([
    "led series diagram",
    "ohm law",
    "ohm law quiz start",
    "numerical topics",
    "simulate kaise",
    "__circuit_analysis__",
    "__practical_viva__"
  ]);
  function renderChips(){
    var host=document.getElementById("elab-sa-chips");
    if(!host) return;
    var visible=CHIPS.filter(function(c){return VISIBLE_QUICK_ACTIONS.has(String(c.q||"").trim().toLowerCase());});
    host.innerHTML=visible.map(function(c){
      var lab=(typeof currentLang!=="undefined"&&currentLang==="hi"&&c.hi)?c.hi:c.label;
      return '<button type="button" class="sa-chip" data-sa-q="'+c.q+'">'+lab+'</button>';
    }).join("");
  }
  function cardHtml(x){
    var cls=x.kind==="coach"?"sa-coach":x.kind==="path"?"sa-path":x.kind==="answer"?"sa-answer":"sa-tip";
    var label=x.kind==="coach"?'<div class="sc-label">COACH</div>':x.kind==="path"?'<div class="sc-label" style="color:#fbbf24">LEARNING PATH</div>':x.kind==="diagram"?'<div class="sc-label" style="color:#67e8f9">DIAGRAM</div>':"";
    var act="";
    if(x.action){
      if(x.action.preset) act='<button type="button" class="sa-action" data-sa-preset="'+x.action.preset+'">'+x.action.label+'</button>';
      else if(x.action.section) act='<button type="button" class="sa-action" data-sa-section="'+x.action.section+'">'+x.action.label+'</button>';
      else if(x.action.tour) act='<button type="button" class="sa-action" data-sa-tour="1">'+x.action.label+'</button>';
    }
    var body = x.html || String(x.d||"").replace(/\n/g,"<br>");
    return '<div class="'+cls+'">'+label+'<b>'+x.t+'</b><br>'+body+act+'</div>';
  }
  function escapeHtml(value){
    return String(value==null?"":value).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});
  }
  function escapeAttr(value){
    return String(value==null?"":value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];});
  }
  function normalizeWikiResults(results){
    var seen=Object.create(null);
    var out=[];
    (Array.isArray(results)?results:[]).forEach(function(r){
      if(!r || typeof r!=="object") return;
      var title=String(r.title||"").trim();
      var url=(typeof r.url==="string"&&/^https:\/\/(en|hi)\.wikipedia\.org\/wiki\//.test(r.url))?r.url:"";
      var key=String(r.key||"").trim();
      var dedupeKey=(url||key||title).toLowerCase();
      if(!dedupeKey || seen[dedupeKey]) return;
      seen[dedupeKey]=true;
      out.push({title:title||"Untitled",description:String(r.description||"").trim(),excerpt:String(r.excerpt||"").trim(),url:url});
    });
    return out.slice(0,5);
  }
  var wikiSearchSeq=0;
  function setWikiBusy(busy){
    var web=document.getElementById("elab-sa-web");
    if(web){
      web.disabled=!!busy;
      web.setAttribute("aria-busy",busy?"true":"false");
    }
  }
  function renderWikiResults(data, query){
    var content=document.getElementById("elab-smart-content");
    if(!content) return;
    var hi=(typeof currentLang!=="undefined"&&currentLang==="hi");
    if(!data || data.ok!==true || !Array.isArray(data.results)){
      var msg=hi?"वेब सर्च अभी उपलब्ध नहीं है। Local Assistant से सवाल पूछ सकते हो।":"Web search is not available right now. You can still use the local Assistant.";
      content.innerHTML=cardHtml({t:hi?"Web Search":"Web Search",d:msg,kind:"answer"});
      return;
    }
    var results=normalizeWikiResults(data.results);
    var html='<div class="sa-answer"><b>'+(hi?"Wikipedia Search (Hindi)":"Wikipedia Search (English)")+'</b><br><span class="sa-web-note">'+escapeHtml(query||"")+' • '+results.length+' '+(hi?"results":"results")+'</span></div>';
    if(!results.length){
      html+='<div class="sa-tip">'+(hi?"कोई matching result नहीं मिला। दूसरा keyword try करो।":"No matching results found. Try a different keyword.")+'</div>';
    }else{
      html+='<div class="sa-web-results">'+results.map(function(r){
        var title=escapeHtml(r.title);
        var desc=escapeHtml(r.description||r.excerpt||"");
        var url=r.url;
        if(!url) return '<div class="sa-web-item"><div class="title">'+title+'</div>'+(desc?'<div class="desc">'+desc+'</div>':'')+'</div>';
        return '<a class="sa-web-item" href="'+escapeAttr(url)+'" target="_blank" rel="noopener noreferrer"><div class="title">'+title+'</div>'+(desc?'<div class="desc">'+desc+'</div>':'')+'<div class="open">'+(hi?"Open Wikipedia ↗":"Open Wikipedia ↗")+'</div></a>';
      }).join("")+'</div>';
    }
    html+='<div class="sa-web-note">'+(hi?"Source: Wikimedia / Wikipedia • server-side gateway • कोई API key frontend में नहीं।":"Source: Wikimedia / Wikipedia • server-side gateway • no API key in the frontend.")+'</div>';
    content.innerHTML=html;
  }

  async function runWikiSearch(query){
    var q=String(query||"").trim();
    var content=document.getElementById("elab-smart-content");
    var hi=(typeof currentLang!=="undefined"&&currentLang==="hi");
    var requestSeq=++wikiSearchSeq;
    if(!q){
      if(input) input.focus();
      if(content) content.innerHTML=cardHtml({t:hi?"Web Search":"Web Search",d:hi?"Pehle search box mein topic likho.":"Enter a topic in the search box first.",kind:"answer"});
      return;
    }
    if(!window.NIL_API || typeof window.NIL_API.wikiSearch!=="function"){
      if(content) content.innerHTML=cardHtml({t:hi?"Web Search":"Web Search",d:hi?"Gateway client load nahi hua.":"Gateway client is not loaded.",kind:"answer"});
      return;
    }
    setWikiBusy(true);
    if(content) content.innerHTML=cardHtml({t:hi?"Web Search":"Web Search",d:hi?"Wikipedia से results ला रहा हूँ…":"Fetching Wikipedia results…",kind:"answer"});
    try{
      var lang=(typeof currentLang!=="undefined"&&currentLang==="hi")?"hi":"en";
      var data=await window.NIL_API.wikiSearch(q,5,lang);
      if(requestSeq!==wikiSearchSeq) return;
      renderWikiResults(data,q);
    }catch(err){
      if(requestSeq!==wikiSearchSeq) return;
      var msg=hi?"Web search fail hui. Gateway/Worker URL aur network check karo.":"Web search failed. Check the gateway/Worker URL and network.";
      if(err&&err.code==="API_NOT_CONFIGURED") msg=hi?"API gateway configure nahi hai. Public Worker URL ko NIL_SPARKLAB_API_BASE mein set karo.":"API gateway is not configured. Set the public Worker URL in NIL_SPARKLAB_API_BASE.";
      else if(err&&err.code==="TIMEOUT") msg=hi?"Wikipedia response में ज्यादा समय लग गया। फिर से try करो।":"Wikipedia took too long to respond. Please try again.";
      else if(err&&err.code==="NETWORK_ERROR") msg=hi?"Network connection नहीं मिल पाया। Internet/Gateway check करो।":"The network connection failed. Check your internet connection and gateway.";
      if(content) content.innerHTML=cardHtml({t:hi?"Web Search":"Web Search",d:msg,kind:"answer"});
    }finally{
      if(requestSeq===wikiSearchSeq) setWikiBusy(false);
    }
  }

  function setResearchBusy(busy){
    var research=document.getElementById("elab-sa-research");
    if(research){
      research.disabled=!!busy;
      research.setAttribute("aria-busy",busy?"true":"false");
    }
  }
  var literatureSearchSeq=0;
  function setLiteratureBusy(busy){var b=document.getElementById("elab-sa-literature");if(b){b.disabled=!!busy;b.setAttribute("aria-busy",busy?"true":"false");}}
  function normalizeLiteratureResults(results){var seen=Object.create(null),out=[];(Array.isArray(results)?results:[]).forEach(function(r){if(!r||typeof r!=="object")return;var title=String(r.title||"").trim(),pmid=String(r.pmid||"").trim(),doi=String(r.doi||"").trim(),url=(typeof r.url==="string"&&/^https:\/\/europepmc\.org\/article\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(r.url))?r.url:"",key=(pmid||doi||url||title).toLowerCase();if(!key||seen[key])return;seen[key]=true;var authors=Array.isArray(r.authors)?r.authors.map(function(a){return String(a||"").trim();}).filter(Boolean).slice(0,5):[];out.push({title:title||"Untitled literature record",authors:authors,year:Number.isInteger(r.year)?r.year:null,journal:String(r.journal||"").trim(),doi:doi,pmid:pmid,url:url});});return out.slice(0,5);}
  function renderLiteratureResults(data,query){var content=document.getElementById("elab-smart-content");if(!content)return;var hi=(typeof currentLang!=="undefined"&&currentLang==="hi");if(!data||data.ok!==true||!Array.isArray(data.results)){content.innerHTML=cardHtml({t:hi?"Literature Search":"Literature Search",d:hi?"Literature search अभी उपलब्ध नहीं है। Local Assistant से सवाल पूछ सकते हो।":"Literature search is not available right now. You can still use the local Assistant.",kind:"answer"});return;}var results=normalizeLiteratureResults(data.results);var html='<div class="sa-answer"><b>Europe PMC Literature Search</b><br><span class="sa-web-note">'+escapeHtml(query||"")+' • '+results.length+' '+(hi?"results":"results")+'</span></div>';if(!results.length)html+='<div class="sa-tip">'+(hi?"कोई literature result नहीं मिला। दूसरा keyword try करो।":"No literature results found. Try a different keyword.")+'</div>';else html+='<div class="sa-web-results">'+results.map(function(r){var meta=[];if(r.year)meta.push(String(r.year));if(r.journal)meta.push(escapeHtml(r.journal));if(r.authors.length)meta.push(escapeHtml(r.authors.join(", ")));if(r.pmid)meta.push("PMID "+escapeHtml(r.pmid));var metaHtml=meta.length?'<div class="desc">'+meta.join(" • ")+"</div>":"";var title=escapeHtml(r.title);if(!r.url)return '<div class="sa-web-item"><div class="title">'+title+'</div>'+metaHtml+'</div>';return '<a class="sa-web-item" href="'+escapeAttr(r.url)+'" target="_blank" rel="noopener noreferrer"><div class="title">'+title+'</div>'+metaHtml+'<div class="open">Open Europe PMC ↗</div></a>';}).join("")+'</div>';html+='<div class="sa-web-note">'+(hi?"Source: Europe PMC • public REST API • server-side gateway • कोई API key frontend में नहीं।":"Source: Europe PMC • public REST API • server-side gateway • no API key in the frontend.")+'</div>';content.innerHTML=html;}
  async function runLiteratureSearch(query){var q=String(query||"").trim(),content=document.getElementById("elab-smart-content"),hi=(typeof currentLang!=="undefined"&&currentLang==="hi"),requestSeq=++literatureSearchSeq;if(!q){if(input)input.focus();if(content)content.innerHTML=cardHtml({t:hi?"Literature Search":"Literature Search",d:hi?"Pehle literature topic likho.":"Enter a literature topic first.",kind:"answer"});return;}if(!window.NIL_API||typeof window.NIL_API.literatureSearch!=="function"){if(content)content.innerHTML=cardHtml({t:hi?"Literature Search":"Literature Search",d:hi?"Gateway client mein Literature Search available नहीं है।":"Literature Search is not available in the gateway client.",kind:"answer"});return;}setLiteratureBusy(true);if(content)content.innerHTML=cardHtml({t:hi?"Literature Search":"Literature Search",d:hi?"Europe PMC से literature results ला रहा हूँ…":"Fetching literature results from Europe PMC…",kind:"answer"});try{var data=await window.NIL_API.literatureSearch(q,5);if(requestSeq!==literatureSearchSeq)return;renderLiteratureResults(data,q);}catch(err){if(requestSeq!==literatureSearchSeq)return;var msg=hi?"Literature search fail hui. Gateway/Worker URL aur network check karo.":"Literature search failed. Check the gateway/Worker URL and network.";if(err&&err.code==="API_NOT_CONFIGURED")msg=hi?"API gateway configure nahi hai.":"API gateway is not configured.";else if(err&&err.code==="TIMEOUT")msg=hi?"Europe PMC response में ज्यादा समय लग गया। फिर से try करो।":"Europe PMC took too long to respond. Please try again.";else if(err&&err.code==="NETWORK_ERROR")msg=hi?"Network connection नहीं मिल पाया।":"The network connection failed.";if(content)content.innerHTML=cardHtml({t:hi?"Literature Search":"Literature Search",d:msg,kind:"answer"});}finally{if(requestSeq===literatureSearchSeq)setLiteratureBusy(false);}}
  var bookSearchSeq=0;
  function setBookBusy(busy){var b=document.getElementById("elab-sa-books");if(b){b.disabled=!!busy;b.setAttribute("aria-busy",busy?"true":"false");}}
  function normalizeBookResults(results){var seen=Object.create(null),out=[];(Array.isArray(results)?results:[]).forEach(function(r){if(!r||typeof r!=="object")return;var title=String(r.title||"").trim(),key=String(r.key||"").trim(),url=(typeof r.url==="string"&&/^https:\/\/openlibrary\.org\/works\/OL[0-9]+W$/.test(r.url))?r.url:"",dedupe=(key||url||title).toLowerCase();if(!dedupe||seen[dedupe])return;seen[dedupe]=true;out.push({title:title||"Untitled book",authors:Array.isArray(r.authors)?r.authors.map(function(a){return String(a||"").trim();}).filter(Boolean).slice(0,5):[],year:Number.isInteger(r.year)?r.year:null,publisher:Array.isArray(r.publisher)?r.publisher.map(function(a){return String(a||"").trim();}).filter(Boolean).slice(0,3):[],url:url});});return out.slice(0,5);}
  function renderBookResults(data,query){var content=document.getElementById("elab-smart-content");if(!content)return;var hi=(typeof currentLang!=="undefined"&&currentLang==="hi");if(!data||data.ok!==true||!Array.isArray(data.results)){content.innerHTML=cardHtml({t:hi?"Book Search":"Book Search",d:hi?"Book search अभी उपलब्ध नहीं है। Local Assistant से सवाल पूछ सकते हो।":"Book search is not available right now. You can still use the local Assistant.",kind:"answer"});return;}var results=normalizeBookResults(data.results);var html='<div class="sa-answer"><b>Open Library Book Search</b><br><span class="sa-web-note">'+escapeHtml(query||"")+' • '+results.length+' '+(hi?"results":"results")+'</span></div>';if(!results.length)html+='<div class="sa-tip">'+(hi?"कोई book result नहीं मिला। दूसरा keyword try करो।":"No book results found. Try a different keyword.")+'</div>';else html+='<div class="sa-web-results">'+results.map(function(r){var meta=[];if(r.year)meta.push(String(r.year));if(r.authors.length)meta.push(escapeHtml(r.authors.join(", ")));if(r.publisher.length)meta.push(escapeHtml(r.publisher.join(", ")));var metaHtml=meta.length?'<div class="desc">'+meta.join(" • ")+"</div>":"",title=escapeHtml(r.title);if(!r.url)return '<div class="sa-web-item"><div class="title">'+title+'</div>'+metaHtml+'</div>';return '<a class="sa-web-item" href="'+escapeAttr(r.url)+'" target="_blank" rel="noopener noreferrer"><div class="title">'+title+'</div>'+metaHtml+'<div class="open">Open Open Library ↗</div></a>';}).join("")+'</div>';html+='<div class="sa-web-note">'+(hi?"Source: Open Library • public search API • server-side gateway • कोई API key frontend में नहीं।":"Source: Open Library • public search API • server-side gateway • no API key in the frontend.")+'</div>';content.innerHTML=html;}
  async function runBookSearch(query){var q=String(query||"").trim(),content=document.getElementById("elab-smart-content"),hi=(typeof currentLang!=="undefined"&&currentLang==="hi"),requestSeq=++bookSearchSeq;if(!q){if(input)input.focus();if(content)content.innerHTML=cardHtml({t:hi?"Book Search":"Book Search",d:hi?"Pehle book topic likho.":"Enter a book topic first.",kind:"answer"});return;}if(!window.NIL_API||typeof window.NIL_API.bookSearch!=="function"){if(content)content.innerHTML=cardHtml({t:hi?"Book Search":"Book Search",d:hi?"Gateway client mein Book Search available नहीं है।":"Book Search is not available in the gateway client.",kind:"answer"});return;}setBookBusy(true);if(content)content.innerHTML=cardHtml({t:hi?"Book Search":"Book Search",d:hi?"Open Library से books खोज रहा हूँ…":"Searching books from Open Library…",kind:"answer"});try{var lang=(typeof currentLang!=="undefined"&&currentLang==="hi")?"hi":"en";var data=await window.NIL_API.bookSearch(q,5,lang);if(requestSeq!==bookSearchSeq)return;renderBookResults(data,q);}catch(err){if(requestSeq!==bookSearchSeq)return;var msg=hi?"Book search fail hui. Gateway/Worker URL aur network check karo.":"Book search failed. Check the gateway/Worker URL and network.";if(err&&err.code==="API_NOT_CONFIGURED")msg=hi?"API gateway configure nahi hai.":"API gateway is not configured.";else if(err&&err.code==="TIMEOUT")msg=hi?"Open Library response में ज्यादा समय लग गया। फिर से try करो।":"Open Library took too long to respond. Please try again.";else if(err&&err.code==="NETWORK_ERROR")msg=hi?"Network connection नहीं मिल पाया।":"The network connection failed.";if(content)content.innerHTML=cardHtml({t:hi?"Book Search":"Book Search",d:msg,kind:"answer"});}finally{if(requestSeq===bookSearchSeq)setBookBusy(false);}}
  var researchSearchSeq=0;
  function normalizeResearchResults(results){
    var seen=Object.create(null), out=[];
    (Array.isArray(results)?results:[]).forEach(function(r){
      if(!r || typeof r!=="object") return;
      var title=String(r.title||"").trim();
      var doi=String(r.doi||"").trim();
      var url=(typeof r.url==="string"&&/^https:\/\/(doi\.org|dx\.doi\.org)\//i.test(r.url))?r.url:"";
      var dedupe=(doi||url||title).toLowerCase();
      if(!dedupe || seen[dedupe]) return;
      seen[dedupe]=true;
      var authors=Array.isArray(r.authors)?r.authors.map(function(a){return String(a||"").trim();}).filter(Boolean).slice(0,5):[];
      out.push({title:title||"Untitled research work",doi:doi,authors:authors,year:Number.isInteger(r.year)?r.year:null,journal:String(r.journal||"").trim(),publisher:String(r.publisher||"").trim(),url:url});
    });
    return out.slice(0,5);
  }
  function renderResearchResults(data, query){
    var content=document.getElementById("elab-smart-content");
    if(!content) return;
    var hi=(typeof currentLang!=="undefined"&&currentLang==="hi");
    if(!data || data.ok!==true || !Array.isArray(data.results)){
      content.innerHTML=cardHtml({t:hi?"Research Search":"Research Search",d:hi?"Research search अभी उपलब्ध नहीं है। Local Assistant से सवाल पूछ सकते हो।":"Research search is not available right now. You can still use the local Assistant.",kind:"answer"});
      return;
    }
    var results=normalizeResearchResults(data.results);
    var html='<div class="sa-answer"><b>'+(hi?"Crossref Research Search":"Crossref Research Search")+'</b><br><span class="sa-web-note">'+escapeHtml(query||"")+' • '+results.length+' '+(hi?"results":"results")+'</span></div>';
    if(!results.length){
      html+='<div class="sa-tip">'+(hi?"कोई research result नहीं मिला। दूसरा keyword try करो।":"No research results found. Try a different keyword.")+'</div>';
    }else{
      html+='<div class="sa-web-results">'+results.map(function(r){
        var title=escapeHtml(r.title), meta=[];
        if(r.year) meta.push(String(r.year));
        if(r.journal) meta.push(escapeHtml(r.journal));
        if(r.authors.length) meta.push(escapeHtml(r.authors.join(", ")));
        var metaHtml=meta.length?'<div class="desc">'+meta.join(" • ")+'</div>':'';
        if(!r.url) return '<div class="sa-web-item"><div class="title">'+title+'</div>'+metaHtml+'</div>';
        return '<a class="sa-web-item" href="'+escapeAttr(r.url)+'" target="_blank" rel="noopener noreferrer"><div class="title">'+title+'</div>'+metaHtml+'<div class="open">Open DOI ↗</div></a>';
      }).join("")+'</div>';
    }
    html+='<div class="sa-web-note">'+(hi?"Source: Crossref metadata • public REST API • server-side gateway • कोई API key frontend में नहीं।":"Source: Crossref metadata • public REST API • server-side gateway • no API key in the frontend.")+'</div>';
    content.innerHTML=html;
  }
  async function runResearchSearch(query){
    var q=String(query||"").trim();
    var content=document.getElementById("elab-smart-content");
    var hi=(typeof currentLang!=="undefined"&&currentLang==="hi");
    var requestSeq=++researchSearchSeq;
    if(!q){
      if(input) input.focus();
      if(content) content.innerHTML=cardHtml({t:hi?"Research Search":"Research Search",d:hi?"Pehle research topic likho.":"Enter a research topic first.",kind:"answer"});
      return;
    }
    if(!window.NIL_API || typeof window.NIL_API.researchSearch!=="function"){
      if(content) content.innerHTML=cardHtml({t:hi?"Research Search":"Research Search",d:hi?"Gateway client mein Research Search available नहीं है।":"Research Search is not available in the gateway client.",kind:"answer"});
      return;
    }
    setResearchBusy(true);
    if(content) content.innerHTML=cardHtml({t:hi?"Research Search":"Research Search",d:hi?"Crossref से research results ला रहा हूँ…":"Fetching research results from Crossref…",kind:"answer"});
    try{
      var data=await window.NIL_API.researchSearch(q,5);
      if(requestSeq!==researchSearchSeq) return;
      renderResearchResults(data,q);
    }catch(err){
      if(requestSeq!==researchSearchSeq) return;
      var msg=hi?"Research search fail hui. Gateway/Worker URL aur network check karo.":"Research search failed. Check the gateway/Worker URL and network.";
      if(err&&err.code==="API_NOT_CONFIGURED") msg=hi?"API gateway configure nahi hai.":"API gateway is not configured.";
      else if(err&&err.code==="TIMEOUT") msg=hi?"Crossref response में ज्यादा समय लग गया। फिर से try करो।":"Crossref took too long to respond. Please try again.";
      else if(err&&err.code==="NETWORK_ERROR") msg=hi?"Network connection नहीं मिल पाया।":"The network connection failed.";
      if(content) content.innerHTML=cardHtml({t:hi?"Research Search":"Research Search",d:msg,kind:"answer"});
    }finally{
      if(requestSeq===researchSearchSeq) setResearchBusy(false);
    }
  }

  function renderTips(answerText){
    var content=document.getElementById("elab-smart-content");
    if(!content) return;
    var html="";
    var li=window.__nilLastAssistantIntent;
    if(answerText && li && li.id){
      var labels={general:"General",search:"Search",troubleshoot:"Troubleshooting",calculate:"Calculation",component:"Component",circuit:"Circuit",practical:"Practical",quiz:"Quiz / Viva",concept:"Concept"};
      html+='<div class="sa-intent-badge">Intent: <b>'+escapeHtml(labels[li.id]||"General")+'</b> · '+Math.round((Number(li.confidence)||0)*100)+'%</div>';
    }
    if(answerText){
      var d = window.__elabLastDiagram;
      if(d && typeof d.svg==="function"){
        var svg = d.svg();
        var trust = d.trust || "sketch";
        var badgeCls = trust==="verified"?"verified":(trust==="canvas"?"canvas":"sketch");
        var badgeTxt = trust==="verified"?"✓ Verified library":(trust==="canvas"?"◎ Canvas wire-aware":"✎ Sketch best-effort");
        var openBtn = '<div class="sa-diagram-actions">'
          +(d.preset?'<button type="button" data-sa-preset="'+d.preset+'">Open in Builder</button>':'')
          +'<button type="button" data-sa-section="builder">Builder</button>'
          +'<button type="button" data-sa-section="industrial">Industrial</button>'+'<button type="button" data-sa-export-diagram="1">Export SVG</button>'
          +'</div>';
        var net = d.netlist ? '<div class="sa-diagram-netlist">'+String(d.netlist).replace(/</g,"&lt;")+'</div>' : '';
        var block = '<div class="sa-diagram-badge '+badgeCls+'">'+badgeTxt+'</div><div class="sa-diagram-wrap">'+svg+'<div class="sa-diagram-caption">'+(d.title||"")+'</div>'+openBtn+net+'</div>';
        html+=cardHtml({t:"Circuit diagram", html: String(answerText).replace(/\n/g,"<br>")+block, kind:"diagram"});
      } else {
        html+=cardHtml({t:"Answer", d:answerText, kind:"answer"});
      }
    }
    var s=sec();
    if(s==="builder"||s==="home") analyzeContext().forEach(function(t){ html+=cardHtml(t); });
    learningPath().forEach(function(t){ html+=cardHtml(t); });
    (sectionTips[s]||sectionTips.default).forEach(function(t){ html+=cardHtml(t); });
    html+=cardHtml({t:"Tour", d:"Steps dobara dekhna ho to tour chalao.", action:{label:"Replay Tour", tour:true}});
    content.innerHTML=html;
  }

  var btn=document.getElementById("elab-smart-assistant-btn");
  var panel=document.getElementById("elab-smart-panel");
  var close=document.getElementById("elab-smart-close");
  var input=document.getElementById("elab-sa-input");
  var askBtn=document.getElementById("elab-sa-ask");
  // v101: reset the Assistant's Tools menu and Suggestions accordion (plus
  // their toggle buttons' active/expanded state) every time the panel opens
  // or closes, so the user never lands on a stale expanded/collapsed view.
  // v102 fix: Suggestions was being force-opened on every reset instead of
  // collapsing, so it never actually reset when exiting the Assistant.
  // Both panels now close together, consistently, on open and on close.
  function resetAssistantPanels(){
    var toolsMenu=document.getElementById("elab-sa-tools");
    var toolsToggle=document.getElementById("elab-sa-tools-toggle");
    var sugWrap=document.getElementById("elab-sa-suggestions");
    var sugToggle=document.getElementById("elab-sa-suggestions-toggle");

    if(toolsMenu){ toolsMenu.classList.remove("open"); toolsMenu.setAttribute("aria-hidden","true"); }
    if(toolsToggle){ toolsToggle.setAttribute("aria-expanded","false"); toolsToggle.classList.remove("active"); }

    if(sugWrap){ sugWrap.classList.remove("open"); }
    if(sugToggle){ sugToggle.setAttribute("aria-expanded","false"); sugToggle.classList.remove("active"); }
  }
  function openPanel(withAnswer){
    if(!panel) return;
    resetAssistantPanels(); // ensure fresh clean view har baar
    panel.classList.add("open"); panel.setAttribute("aria-hidden","false");
    renderChips();
    // v5.96: opening the Assistant is not the same as asking it.
    // Keep the panel quiet until the user submits a question or taps a chip.
    if(withAnswer){
      renderTips(withAnswer);
    }else{
      var content=document.getElementById("elab-smart-content");
      if(content) content.innerHTML=(typeof currentLang!=="undefined"&&currentLang==="hi") ? '<div class="sa-tip sa-welcome"><div class="sa-welcome-head"><span class="sa-welcome-icon">💡</span><b>अपने सर्किट या Electrical Engineering से संबंधित प्रश्न पूछें।</b></div><div class="sa-welcome-tags"><span>Concept</span><span>Formula</span><span>Numerical</span><span>Practical</span><span>Quiz</span><span>Viva</span><span>Wiring</span><span>Troubleshooting</span></div></div>' : '<div class="sa-tip sa-welcome"><div class="sa-welcome-head"><span class="sa-welcome-icon">💡</span><b>Ask about your circuit or Electrical Engineering.</b></div><div class="sa-welcome-tags"><span>Concepts</span><span>Formulas</span><span>Numericals</span><span>Practicals</span><span>Quizzes</span><span>Viva</span><span>Wiring</span><span>Troubleshooting</span></div></div>';
    }
  }
  function closePanel(){
    if(!panel) return;
    panel.classList.remove("open"); panel.setAttribute("aria-hidden","true");
    resetAssistantPanels();
  }
  if(btn) btn.addEventListener("click", function(){ panel.classList.contains("open")?closePanel():openPanel(); });
  if(close) close.addEventListener("click", closePanel);
  async function doAsk(){
    var question=input?String(input.value||"").trim():"";
    if(!question){
      renderTips((typeof currentLang!=="undefined"&&currentLang==="hi")?"Kuch type karo — jaise 'led nahi jal raha' ya 'transformer ka working samjhao'.":"Type a question — for example, 'why is the LED not glowing?' or 'explain transformer working'.");
      return;
    }
    var cloud=window.NIL_API&&typeof window.NIL_API.aiChat==='function'&&window.NIL_API_CONFIG&&window.NIL_API_CONFIG.aiEnabled!==false;
    if(!cloud){
      var localAnswer=askAI(question);
      renderTips(localAnswer);
      if(window.elabSFX) try{ elabSFX.click(); }catch(e){}
      return localAnswer;
    }
    var content=document.getElementById('elab-smart-content');
    if(content) content.innerHTML=cardHtml({t:(typeof currentLang!=="undefined"&&currentLang==="hi")?"NIL Assistant":"NIL Assistant",d:(typeof currentLang!=="undefined"&&currentLang==="hi")?"Soch raha hoon…":"Thinking…",kind:"answer"});
    try{
      var history=[];
      try{history=JSON.parse(localStorage.getItem('nil_sparklab_ai_history')||'[]');}catch(_){history=[];}
      if(!Array.isArray(history)) history=[];
      history=history.filter(function(x){return x&&typeof x.role==='string'&&typeof x.text==='string'}).slice(-10);
      var context="";
      try{
        if(window.NILCircuitAwareAssistant&&typeof window.NILCircuitAwareAssistant.analyze==='function'){
          var circuit=window.NILCircuitAwareAssistant.analyze();
          if(circuit&&!circuit.empty) context="\n\nCurrent circuit context (read-only): "+JSON.stringify({componentCount:circuit.componentCount,wireCount:circuit.wireCount,issues:circuit.issues,warnings:circuit.warnings,components:circuit.components,simulation:circuit.simulation});
        }
      }catch(_){ }
      var lang=(typeof currentLang!=="undefined"&&currentLang==="hi")?"Hindi/Hinglish":"English/Hinglish";
      var payloadQuestion="Respond in "+lang+". User question: "+question+context;
      var data=await window.NIL_API.aiChat(payloadQuestion,history);
      if(data&&data.ok&&typeof data.answer==='string'){
        history.push({role:'user',text:question});
        history.push({role:'model',text:data.answer});
        try{localStorage.setItem('nil_sparklab_ai_history',JSON.stringify(history.slice(-12)));}catch(_){ }
        renderTips(data.answer);
        if(window.elabSFX) try{ elabSFX.click(); }catch(e){}
        return data.answer;
      }
      throw Object.assign(new Error((data&&data.message)||'AI provider returned no answer.'),{code:data&&data.error});
    }catch(err){
      console.warn('NIL remote assistant unavailable; using local fallback.',err);
      var fallback=askAI(question);
      var note=(typeof currentLang!=="undefined"&&currentLang==="hi")?"\n\n_(Online AI abhi available nahi tha; local Assistant response dikhaya gaya hai.)_":"\n\n_(Online AI was unavailable, so the local Assistant response is shown.)_";
      renderTips(String(fallback||"")+note);
      if(window.elabSFX) try{ elabSFX.click(); }catch(e){}
      return fallback;
    }
  }
  var toolsToggle=document.getElementById("elab-sa-tools-toggle");
  var toolsMenu=document.getElementById("elab-sa-tools");
  function setToolsOpen(open){
    open=!!open;
    if(toolsToggle){toolsToggle.setAttribute("aria-expanded",open?"true":"false");}
    if(toolsMenu){toolsMenu.classList.toggle("open",open);toolsMenu.setAttribute("aria-hidden",open?"false":"true");}
    if(open){
      var sugWrap=document.getElementById("elab-sa-suggestions");
      var sugToggle=document.getElementById("elab-sa-suggestions-toggle");
      if(sugWrap) sugWrap.classList.remove("open");
      if(sugToggle) sugToggle.setAttribute("aria-expanded","false");
    }
  }
  function setAssistantActiveMode(id){
    var all=document.querySelectorAll("#elab-smart-panel #elab-sa-ask, #elab-smart-panel #elab-sa-tools button");
    all.forEach(function(b){b.classList.toggle("sa-mode-active", b.id===id); b.setAttribute("aria-pressed", b.id===id ? "true" : "false");});
  }
  setAssistantActiveMode("elab-sa-ask");
  if(toolsToggle) toolsToggle.addEventListener("click", function(){setToolsOpen(!toolsMenu || !toolsMenu.classList.contains("open"));});
  if(askBtn) askBtn.addEventListener("click", function(){setAssistantActiveMode("elab-sa-ask"); doAsk();});
  var webBtn=document.getElementById("elab-sa-web");
  if(webBtn) webBtn.addEventListener("click", function(){setAssistantActiveMode("elab-sa-web"); runWikiSearch(input?input.value:""); });
  var researchBtn=document.getElementById("elab-sa-research");
  if(researchBtn) researchBtn.addEventListener("click", function(){setAssistantActiveMode("elab-sa-research"); runResearchSearch(input?input.value:""); });
  var literatureBtn=document.getElementById("elab-sa-literature");
  if(literatureBtn) literatureBtn.addEventListener("click", function(){setAssistantActiveMode("elab-sa-literature"); runLiteratureSearch(input?input.value:""); });
  var bookBtn=document.getElementById("elab-sa-books");
  if(bookBtn) bookBtn.addEventListener("click", function(){setAssistantActiveMode("elab-sa-books"); runBookSearch(input?input.value:""); });

  // v99 — wire the previously-orphaned Assistant power tools (their panels
  // and open-functions already existed; only a UI entry point was missing
  // after the legacy FAB tool-grid was retired in v96.6).
  var waveBtn=document.getElementById("elab-sa-wave");
  if(waveBtn) waveBtn.addEventListener("click", function(){ if(window.NilSparkLabWave && typeof window.NilSparkLabWave.open==="function") window.NilSparkLabWave.open(); });
  var classBtn=document.getElementById("elab-sa-class");
  if(classBtn) classBtn.addEventListener("click", function(){ var p=document.getElementById("elab-class-panel"); if(p) p.classList.add("open"); });
  var camBtn=document.getElementById("elab-sa-cam");
  if(camBtn) camBtn.addEventListener("click", function(){ var p=document.getElementById("elab-cam-panel"); if(p) p.classList.add("open"); });
  var adaptBtn=document.getElementById("elab-sa-adapt");
  if(adaptBtn) adaptBtn.addEventListener("click", function(){ if(window.NilSparkLabAdaptive && typeof window.NilSparkLabAdaptive.open==="function") window.NilSparkLabAdaptive.open(); });
  var twinBtn=document.getElementById("elab-sa-twin");
  if(twinBtn) twinBtn.addEventListener("click", function(){ if(typeof window.elabOpenTwin==="function") window.elabOpenTwin("led"); });
  var toolButtons=document.querySelectorAll("#elab-sa-tools button");
  toolButtons.forEach(function(b){b.addEventListener("click", function(){setToolsOpen(false);});});
  if(input) input.addEventListener("keydown", function(e){ if(e.key==="Enter") doAsk(); });

  document.addEventListener("click", function(e){
    /* v10.23: the Diagram/Assistant chip router is authoritative.
       It must run before legacy chip handlers so the old single-diagram modal
       cannot intercept the click and stop propagation. */
    var chip=e.target && e.target.closest ? e.target.closest("#elab-sa-chips [data-sa-q]") : null;
    if(chip && window.NilSparkLabInteractionRepairV1022 && typeof window.NilSparkLabInteractionRepairV1022.runChip==="function"){
      e.preventDefault();
      if(typeof e.stopImmediatePropagation==="function") e.stopImmediatePropagation();
      e.stopPropagation();
      window.NilSparkLabInteractionRepairV1022.runChip(chip);
      return;
    }
    var q=e.target.closest("[data-sa-q]");
    if(q){
      var query=q.getAttribute("data-sa-q");
      if(query==="__circuit_analysis__"){ if(input) input.focus(); renderTips(window.NILCircuitAwareAssistant ? window.NILCircuitAwareAssistant.answer(input?input.value:"") : "Circuit-aware analysis unavailable."); return; }
      if(query==="__wiki_search__"){ if(input) input.focus(); runWikiSearch(input?input.value:""); return; }
      if(query==="__research_search__"){ if(input) input.focus(); runResearchSearch(input?input.value:""); return; }
      if(query==="__literature_search__"){ if(input) input.focus(); runLiteratureSearch(input?input.value:""); return; }
      if(query==="__book_search__"){ if(input) input.focus(); runBookSearch(input?input.value:""); return; }
      if(query==="__practical_viva__"){
        if(input) input.focus();
        var pv=window.NIL_PRACTICAL_VIVA;
        var practicalQuery=input?String(input.value||"").trim():"";
        if(pv && typeof pv.render==="function"){
          var id=pv.detectExperiment(practicalQuery,"") || "ohms_law";
          pv.render(id);
        } else if(content){
          content.innerHTML=cardHtml({t:"Practical + Viva",d:"Practical Assistant is still loading. Please try again.",kind:"answer"});
        }
        return;
      }
      if(input) input.value=query; doAsk(); return;
    }
    var ex=e.target.closest("[data-sa-export-diagram]");
    if(ex){
      if(window.NilSparkLabDiagrams && NilSparkLabDiagrams.exportLast){
        var ok=NilSparkLabDiagrams.exportLast();
        if(!ok && window.elabV575Toast) elabV575Toast("No diagram to export");
        else if(window.elabV575Toast) elabV575Toast("SVG downloaded");
      }
      return;
    }
    var p=e.target.closest("[data-sa-preset]");
    if(p){ loadEmptyPreset(p.getAttribute("data-sa-preset")); closePanel(); return; }
    var secBtn=e.target.closest("[data-sa-section]");
    if(secBtn){ if(typeof window.showSection==="function") window.showSection(secBtn.getAttribute("data-sa-section")); closePanel(); return; }
    if(e.target.closest("[data-sa-tour]")){ tourOpen(); closePanel(); }
  });

  // v5.96 behavior: Smart Assistant must stay silent during simulation.
  // It opens only when the user taps the Assistant button or asks a question.
  // Do NOT monkey-patch runBuilderSim here; simulation must never auto-open the assistant.

  var origShow=window.showSection;
  if(typeof origShow==="function"){
    window.showSection=function(){
      var args=arguments;
      origShow.apply(this,args);
      if(panel&&panel.classList.contains("open")) renderTips();
      setTimeout(refreshEmptyState,80);
    };
  }
  /* v10.34 — authoritative synchronous Assistant response path.
     Quick actions that are meant to render learning content must not route
     through the public open()/ask() pair, because that pair can re-enter the
     panel lifecycle and makes content actions depend on unrelated UI state.
     This method uses the existing answer engine + existing renderer exactly
     once, with a visible error instead of a swallowed exception. */
  function respond(question){
    try{
      var answer=askAI(question);
      renderTips(answer);
      return answer;
    }catch(err){
      console.error('NilSparkLab Smart Assistant response:',err);
      renderTips((typeof currentLang!=="undefined"&&currentLang==="hi")
        ? 'इस मॉड्यूल को खोलने में समस्या हुई। कृपया दोबारा कोशिश करें।'
        : 'Sorry, this module could not be opened. Please try again.');
      return null;
    }
  }
  window.NilSparkLabSmartAssistant={ open:openPanel, close:closePanel, ask:askAI, respond:respond, analyze:analyzeContext };
})();
