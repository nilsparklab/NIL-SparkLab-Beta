
(function(){
"use strict";
var node=document.getElementById("elab-v612-study-kb-data"), DATA={topics:[]};
try{DATA=JSON.parse(node && node.textContent || "{}");}catch(e){console.warn("StudyKB JSON parse failed", e);}

/* Hindi concept packs (full answers when UI lang = HI) */
var HI = {
  transformers:{concept:"ट्रांसफॉर्मर आपसी प्रेरण (mutual induction) से AC ऊर्जा स्थानांतरित करता है। आदर्श मॉडल में वोल्टेज अनुपात टर्न रेशियो के बराबर होता है और इनपुट/आउटपुट पावर लगभग समान रहती है।",example:"अगर Np/Ns = 10 और प्राथमिक 230 V AC है, तो आदर्श द्वितीयक ≈ 23 V।",lab:"केवल लो-वोल्टेज सिमुलेटेड मॉडल उपयोग करें; सिमुलेशन को असली मेन्स सुरक्षा न मानें।"},
  basic_electricity:{concept:"विद्युत धारा आवेश का प्रवाह है। वोल्टेज ऊर्जा-अंतर है, धारा प्रवाह की दर, प्रतिरोध विरोध। ओम का नियम इन तीनों को जोड़ता है।",example:"9 V बैटरी और 3 Ω प्रतिरोध पर I = V/R = 3 A।",lab:"Circuit Builder में बैटरी + प्रतिरोध जोड़कर Simulate से धारा देखें।"},
  ohms_law:{concept:"ओम का नियम: किसी धातु चालक पर स्थिर तापमान पर V ∝ I। सूत्र: V = I × R, I = V/R, R = V/I।",example:"V=12 V, R=4 Ω → I=3 A। अगर R=6 Ω हो तो I=2 A। पावर P=V×I=24 W।",lab:"Ohm’s Law guided experiment या resistor+source सर्किट से V/I मापकर R चेक करें।"},
  kcl_kvl:{concept:"KCL: किसी नोड पर आने वाली धाराओं का योग = जाने वाली धाराओं का योग। KVL: किसी बंद लूप में वोल्टेजों का बीजगणितीय योग शून्य होता है।",example:"दो समानांतर शाखाएँ 2 A और 3 A → कुल स्रोत धारा 5 A (KCL)।",lab:"Series-parallel नेटवर्क बनाकर नोड/लूप जाँचें।"},
  series_parallel:{concept:"सीरीज में धारा समान, वोल्टेज जुड़ते हैं। पैरेलल में वोल्टेज समान, धाराएँ जुड़ती हैं।",example:"10 Ω + 10 Ω सीरीज = 20 Ω। समान दो पैरेलल = 5 Ω।",lab:"Builder में series/parallel resistor नेटवर्क बनाकर Simulate करें।"},
  ac_fundamentals:{concept:"AC में वोल्टेज/धारा समय के साथ दिशा बदलते हैं। RMS हीटिंग प्रभाव का माप है; पीक = √2 × RMS साइन वेव के लिए।",example:"230 V RMS का पीक ≈ 325 V।",lab:"AC Source रखकर Engineering Tools / scope से तरंग समझें।"},
  rlc:{concept:"R ऊर्जा dissipate करता है, L और C ऊर्जा store/exchange करते हैं। श्रेणी RLC में Z = √(R²+(XL−XC)²)।",example:"R=30 Ω, XL=40 Ω, XC=0 → Z=50 Ω।",lab:"RLC analyzer (v6.7 tools) से Z और phase देखें।"},
  diodes_led:{concept:"डायोड एक दिशा में धारा आसानी से बहने देता है। LED को सही पोलैरिटी और सीरीज रेजिस्टर चाहिए।",example:"5 V से LED (Vf≈2 V): R ≈ (5−2)/0.01 = 300 Ω (लगभग)।",lab:"LED Series preset चलाएँ; बिना R के चेतावनी Health Score में देखें।"},
  transistors:{concept:"BJT धारा से नियंत्रित स्विच/एम्प्लिफायर है; MOSFET वोल्टेज (गेट) से नियंत्रित स्विच है।",example:"NPN: छोटा बेस करंट बड़ा कलेक्टर करंट नियंत्रित करता है (β ≈ Ic/Ib)।",lab:"Supported transistor मॉडल से स्विचिंग व्यवहार देखें।"},
  opamp:{concept:"ऑप-एम्प उच्च गेन वाला डिफरेंशियल एम्प्लिफायर है। लीनियर उपयोग में फीडबैक से गेन तय होता है।",example:"आदर्श इनवर्टिंग गेन ≈ −Rf/Rin।",lab:"Op-amp को documentation/lab मॉडल के रूप में समझें।"},
  measurements:{concept:"वोल्टमीटर पैरेलल, एमीटर सीरीज में लगता है। गलत कनेक्शन उपकरण/सर्किट खराब कर सकता है।",example:"आपूर्ति के across एमीटर लगाना शॉर्ट के बराबर खतरनाक है।",lab:"Multimeter probes से V/mA मोड practice करें।"},
  troubleshooting:{concept:"लक्षण → सुरक्षित जाँच → सप्लाई → माप → फॉल्ट अलग → सुधार सत्यापन।",example:"LED न जलें: पोलैरिटी, सप्लाई, तार, धारा पथ क्रम से जाँचें।",lab:"जानबूझकर fault डालकर workflow follow करें।"},
  grounding_earthing:{concept:"अर्थिंग धातु भागों को पृथ्वी से जोड़कर फॉल्ट धारा का सुरक्षित पथ देती है ताकि प्रोटेक्शन ट्रिप हो।",example:"फॉल्ट पर कम अर्थ रेजिस्टेंस से ब्रेकर जल्दी ट्रिप, टच वोल्टेज कम।",lab:"सिम डायग्राम पर earth कंडक्टर पहचानें; लाइव मेन्स टेस्ट न करें।"},
  wiring_standards:{concept:"कंडक्टर साइज लोड के अनुसार, प्रोटेक्शन रेटिंग सही, रंग कोड लगातार।",example:"13 A लोड के लिए अंडरसाइज तार ओवरहीट जोखिम।",lab:"L/N/E पहचान और ब्रेकर रेटिंग मिलाएँ।"},
  motors_generators:{concept:"मोटर विद्युत→यांत्रिक, जनरेटर यांत्रिक→विद्युत। गति बढ़ने पर बैक-EMF सप्लाई का विरोध करता है।",example:"स्टार्टिंग करंट रनिंग से ऊँचा क्योंकि शुरू में बैक-EMF कम।",lab:"Motor + Switch preset चलाएँ।"},
  digital_logic_gates:{concept:"AND: सब 1 तब आउट 1। OR: कोई 1 तो 1। NOT: उलटा। NAND/NOR उनके पूरक।",example:"AND(1,0)=0; OR(1,0)=1; XOR(1,0)=1।",lab:"Logic switches + gates से truth table बनाएँ।"},
  power_electronics:{concept:"सेमीकंडक्टर स्विच से पावर कन्वर्ट/कंट्रोल—रेक्टिफायर, DC-DC, इन्वर्टर।",example:"रेक्टिफायर AC→DC; इन्वर्टर DC→AC।",lab:"केवल समर्थित लो-वोल्टेज मॉडल।"},
  sensors_instrumentation:{concept:"सेंसर भौतिक राशि को विद्युत सिग्नल में बदलता है; इंस्ट्रूमेंटेशन उसे मापता/पढ़ता है।",example:"LDR प्रकाश बढ़ने पर प्रतिरोध बदलता है।",lab:"Supported sensor reading रिकॉर्ड करें।"},
  control_systems:{concept:"क्लोज्ड-लूप फीडबैक से error = reference − measured कम करता है। PID: P+I+D।",example:"थर्मोस्टैट: सेटपॉइंट से कम तापमान पर हीटर ON।",lab:"Open vs closed loop व्यवहार तुलना (यदि मॉडल हो)।"},
  power_systems:{concept:"जनरेशन → ट्रांसमिशन → डिस्ट्रीब्यूशन → लोड। सबस्टेशन वोल्टेज स्तर और सुरक्षा संभालते हैं।",example:"ऊँचा ट्रांसमिशन वोल्टेज से धारा/हानि कम।",lab:"केवल कॉन्सेप्टुअल/लो-वोल्टेज मॉडल।"},
  protection_switchgear:{concept:"फ्यूज/MCB/ब्रेकर असामान्य धारा पर सर्किट काटते हैं। रेटिंग कंडक्टर क्षमता से मेल खानी चाहिए।",example:"तार की क्षमता से बड़ा ब्रेकर → तार पहले गर्म हो सकती है।",lab:"Supported protection मॉडल; असली मेन्स पर प्रयोग न करें।"},
  dol_star_delta:{concept:"DOL: फुल वोल्टेज डायरेक्ट स्टार्ट—सिंपल, ऊँचा इनरश। Star-Delta: पहले स्टार (कम वोल्टेज/धारा), फिर डेल्टा रन।",example:"Star में फेज वोल्टेज 1/√3, स्टार्टिंग करंट लगभग 1/3 (आदर्श)।",lab:"Industrial Lab में DOL sequence: START → coil → AUX → motor; Star-Delta demo जहाँ उपलब्ध हो।"}
};

var EXTRA_NUM = {
  ohms_law:"Numerical: V=24 V, R=8 Ω → I=V/R=3 A; P=VI=72 W; also P=I²R=72 W.",
  series_parallel:"Numerical: R1=4 Ω, R2=6 Ω series Req=10 Ω. Parallel Req=(4×6)/(4+6)=2.4 Ω. With 12 V on parallel, Itotal=12/2.4=5 A.",
  transformers:"Numerical: Np:Ns=20:1, Vp=240 V → Vs=12 V ideal. If Is=2 A then Ip≈0.1 A (ideal power balance).",
  rlc:"Numerical: f=50 Hz, L=0.1 H → XL=2πfL≈31.4 Ω. C=100 µF → XC=1/(2πfC)≈31.8 Ω.",
  diodes_led:"Numerical: Vs=9 V, Vf=2 V, I=10 mA → R=(9−2)/0.01=700 Ω (choose 680–820 Ω)."
};

var quizState=null;
var SCORE_KEY="elab_study_quiz_scores";
var STOP={the:1,and:1,for:1,with:1,what:1,why:1,how:1,this:1,that:1,hai:1,h:1,kya:1,ka:1,ke:1,ko:1,me:1,mein:1,se:1,do:1,dena:1,please:1,pe:1,par:1,from:1,into:1,about:1,nahi:1,not:1};
function norm(s){return String(s||"").toLowerCase().replace(/[\u2018\u2019\u201c\u201d]/g,"").replace(/[^a-z0-9\u0900-\u097f\s]/gi," ").replace(/\s+/g," ").trim();}
function canonical(w){var m={transfarmer:"transformer",transfarmar:"transformer",transformar:"transformer",transformers:"transformer",kirchoff:"kirchhoff",ohms:"ohm",ohm:"ohm",mosfet:"mosfet",opamp:"opamp",series:"series",parallel:"parallel",dol:"dol",stardelta:"star-delta","star-delta":"star-delta"};return m[w]||w;}
function words(s){return norm(s).split(" ").filter(function(x){return x.length>1&&!STOP[x];}).map(canonical);}
function hay(t){return norm([t.id,t.title].concat(t.keywords||[]).concat(t.concept||[]).join(" "));}
function score(q,t){
  var qn=norm(q), h=hay(t), s=0;
  if(qn.indexOf(norm(t.title))>=0) s+=120;
  (t.keywords||[]).forEach(function(k){var nk=norm(k); if(!nk)return; if(qn===nk)s+=80; else if(qn.indexOf(nk)>=0)s+=50;});
  words(q).forEach(function(w){ if(w.length>2&&h.indexOf(w)>=0) s+=Math.min(14,w.length+3); });
  return s;
}
function find(q){
  var best=null,bs=0,second=0;
  (DATA.topics||[]).forEach(function(t){
    var s=score(q,t);
    if(s>bs){second=bs;bs=s;best=t;} else if(s>second) second=s;
  });
  if(bs<18) return null;
  if(best&&second>0&&bs-second<6&&bs<40) return null;
  return best;
}
function hi(){
  try{ if(typeof currentLang!=="undefined"&&currentLang==="hi") return true; }catch(e){}
  try{ return /हिंदी/.test((document.getElementById("lang-btn-text")||{}).textContent||""); }catch(e){ return false; }
}
function has(q,a){var n=norm(q); return a.some(function(x){return n.indexOf(norm(x))>=0;});}
function qItems(t){return (t.quiz||[]).map(function(x){return typeof x==="string"?{q:x,keys:[]}:x;});}
function pickConcept(t){ var h=HI[t.id]; if(hi()&&h&&h.concept) return h.concept; return t.concept||""; }
function pickExample(t){ var h=HI[t.id]; if(hi()&&h&&h.example) return h.example; return t.example||""; }
function pickLab(t){ var h=HI[t.id]; if(hi()&&h&&h.lab) return h.lab; return t.lab||""; }
function pickNumerical(t){
  var extra=EXTRA_NUM[t.id];
  var base=pickExample(t);
  if(extra) return base ? (base+"\n\n"+extra) : extra;
  return base;
}

function isLabIntent(q){
  return has(q,["nahi jal","not working","wire kaise","kaise wire","simulate","canvas","builder","add component","preset","auto wire","share link","health score","terminal","led nahi","motor nahi","connection incomplete"]);
}
function isCancelQuiz(q){ return has(q,["cancel quiz","stop quiz","end quiz","quiz band","quiz cancel","quit quiz","exit quiz","क्विज़ बंद","क्विज बंद"]); }
function isStartQuiz(q){
  return has(q,["start quiz","quiz start","give quiz","mcq","क्विज़ शुरू","क्विज शुरू","quiz do","take quiz"]) ||
    (has(q,["quiz","क्विज़","क्विज"]) && has(q,["start","shuru","do","dena","begin","take"]));
}
function isTopicsList(q){ return has(q,["topic list","topics list","all topics","list topics","टॉपिक लिस्ट","सभी टॉपिक","topics dikhao","topic dikhao","study topics"]); }

function readScores(){ try{ return JSON.parse(localStorage.getItem(SCORE_KEY)||"{}")||{}; }catch(e){ return {}; } }
function writeScores(s){ try{ localStorage.setItem(SCORE_KEY, JSON.stringify(s)); }catch(e){} }
function saveQuizResult(topicId, score, total){
  var s=readScores();
  var prev=s[topicId]||{attempts:0,best:0,last:0,total:total};
  prev.attempts=(prev.attempts||0)+1;
  prev.last=score;
  prev.total=total;
  prev.best=Math.max(prev.best||0, score);
  prev.at=new Date().toISOString();
  s[topicId]=prev;
  writeScores(s);
  // Bridge for main quiz / progress UI if present
  try{
    window.dispatchEvent(new CustomEvent("nilsparklab:study-quiz-complete",{detail:{topicId:topicId,score:score,total:total,best:prev.best}}));
  }catch(e){}
  try{
    if(window.NilSparkLabProgress && typeof NilSparkLabProgress.note==="function") NilSparkLabProgress.note("study_quiz", score/Math.max(1,total));
  }catch(e){}
  try{
    var badgeKey="elab_v593_badges";
    if(score/Math.max(1,total) >= 0.8){
      var b=JSON.parse(localStorage.getItem(badgeKey)||"{}");
      if(!b.quiz_80){ b.quiz_80={at:new Date().toISOString(),source:"study"}; localStorage.setItem(badgeKey, JSON.stringify(b)); }
    }
  }catch(e){}
}

function checkQuizAnswer(q){
  if(!quizState) return null;
  if(isCancelQuiz(q)){ quizState=null; return hi()?"🛑 क्विज़ रद्द।":"🛑 Quiz cancelled."; }
  var item=quizState.items[quizState.index], n=norm(q), good=false;
  if(item.keys&&item.keys.length){
    good=item.keys.some(function(k){ var nk=norm(k); return nk.length>=2 && (n===nk || n.indexOf(nk)>=0); });
  } else {
    var expected=norm(item.answer||""); good=expected&&n===expected;
  }
  var h=hi(), result;
  if(good){ quizState.score++; result=h?"✅ सही उत्तर!":"✅ Correct!"; }
  else result=h?"❌ सही नहीं। मुख्य idea keywords में लिखो।":"❌ Not quite. Use the key idea in your words.";
  var next=quizState.index+1;
  if(next>=quizState.items.length){
    var total=quizState.items.length, sc=quizState.score, id=quizState.topic.id;
    saveQuizResult(id, sc, total);
    quizState=null;
    var scores=readScores()[id];
    return result+"\n\n"+(h?"🏁 क्विज़ पूरा। स्कोर: ":"🏁 Quiz complete. Score: ")+sc+"/"+total+
      (scores? (h?" | सर्वश्रेष्ठ: ":" | Best: ")+scores.best+"/"+total:"")+
      (h?"\n\n(प्रगति सेव हो गई) फिर: quiz start | बंद: quiz cancel":"\n\n(Progress saved) Again: quiz start | Stop: quiz cancel");
  }
  quizState.index=next;
  return result+"\n\n"+(h?"अगला:\n":"Next:\n")+quizState.items[next].q;
}
function startQuiz(t){
  var items=qItems(t).filter(function(x){return x&&x.q;});
  if(!items.length) return hi()?"क्विज़ उपलब्ध नहीं।":"No quiz for this topic.";
  quizState={topic:t,items:items,index:0,score:0};
  return "📝 "+t.title+(hi()?" — क्विज़\n\n":" — Quiz\n\n")+items[0].q+"\n\n"+(hi()?"उत्तर भेजो। बंद: quiz cancel":"Send answer. Stop: quiz cancel");
}
function listTopics(){
  var titles=(DATA.topics||[]).map(function(t,i){ return (i+1)+". "+t.title; });
  var h=hi();
  return (h?"📚 उपलब्ध स्टडी टॉपिक्स:\n":"📚 Study topics:\n")+titles.join("\n")+
    (h?"\n\nकोई टॉपिक नाम लिखो, जैसे “ohm law” या “DOL starter”。":"\n\nType a topic name, e.g. “ohm law” or “DOL starter”.");
}
/* v10.36: Numerical topic menu — reuses existing EXTRA_NUM data and DATA.topics
   titles only; no new numerical content/engine is created. */
function numericalMenu(){
  var ids=["ohms_law","series_parallel","transformers","rlc","diodes_led"];
  var titles={};
  (DATA.topics||[]).forEach(function(t){ titles[t.id]=t.title; });
  var h=hi();
  var lines=ids.filter(function(id){ return !!EXTRA_NUM[id]; }).map(function(id,i){
    return (i+1)+". "+(titles[id]||id);
  });
  return (h?"🔢 न्यूमेरिकल प्रैक्टिस\n\n":"🔢 NUMERICAL PRACTICE\n\n")+
    (h?"टॉपिक चुनो:\n":"Choose a topic:\n")+lines.join("\n")+
    "\n\n"+(h?"टॉपिक नाम + “numerical” टाइप करो, जैसे “ohm law numerical” या “series numerical”।":
      "Type a topic name + “numerical”, e.g. “ohm law numerical” or “series numerical”.");
}
function answer(q){
  if(!q||!String(q).trim()) return null;
  var checked=checkQuizAnswer(q); if(checked) return checked;
  if(isTopicsList(q)) return listTopics();
  if(isLabIntent(q) && !has(q,["principle","theory","formula","concept","सिद्धांत","फॉर्मूला"])) return null;
  var t=find(q); if(!t) return null;
  var h=hi(), out="📚 "+t.title+"\n\n";
  if(isStartQuiz(q)||has(q,["mcq"])) return startQuiz(t);
  if(has(q,["viva","oral","वाइवा","मौखिक"]))
    return out+(h?"🎤 वाइवा\n":"🎤 Viva\n")+(t.viva||[]).map(function(x,i){return (i+1)+". "+x;}).join("\n");
  if(has(q,["formula","formulae","equation","फॉर्मूला","सूत्र"]))
    return out+(h?"🧮 सूत्र\n":"🧮 Formula\n")+((t.formulas&&t.formulas.length)?t.formulas.map(function(x){return "• "+x;}).join("\n"):(h?"सूत्र सूची खाली।":"No formulas stored."));
  if(has(q,["practical","experiment","lab","प्रैक्टिकल","प्रयोग"]))
    return out+(h?"🧪 प्रैक्टिकल\n":"🧪 Practical\n")+pickLab(t);
  if(has(q,["numerical","calculate","calculation","example","solve","न्यूमेरिकल","गणना","उदाहरण","हल"]))
    return out+(h?"🔢 उदाहरण / न्यूमेरिकल\n":"🔢 Example / Numerical\n")+pickNumerical(t);
  return out+(h?"📖 अवधारणा\n":"📖 Concept\n")+pickConcept(t)+
    ((t.formulas&&t.formulas.length)?"\n\n"+(h?"🧮 सूत्र\n":"🧮 Formula\n")+t.formulas.map(function(x){return "• "+x;}).join("\n"):"")+
    (pickNumerical(t)?"\n\n"+(h?"🔢 उदाहरण\n":"🔢 Example\n")+pickNumerical(t):"")+
    (pickLab(t)?"\n\n"+(h?"🧪 प्रैक्टिकल\n":"🧪 Practical\n")+pickLab(t):"")+
    "\n\n"+(h?"और कमांड: formula | numerical | quiz start | viva | topics list":"Also: formula | numerical | quiz start | viva | topics list");
}

window.NilSparkLabStudyKB={
  version:"1.7",
  answer:answer,
  topics:function(){ return (DATA.topics||[]).map(function(t){return t.title;}); },
  resetQuiz:function(){ quizState=null; },
  find:find,
  getScores:readScores,
  listTopics:listTopics,
  numericalMenu:numericalMenu,
  dataVersion:(DATA&&DATA.version)||null
};
})();
