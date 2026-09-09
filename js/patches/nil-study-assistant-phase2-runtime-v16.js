
(function(){
  'use strict';
  var PROGRESS_KEY='nil_sparklab_study_progress_v1';
  var CONTEXT_KEY='nil_sparklab_study_context_v2';
  function safeJSON(v,f){try{return JSON.parse(v);}catch(e){return f;}}
  function topics(){try{return window.NILStudyMode&&typeof window.NILStudyMode.topics==='function'?window.NILStudyMode.topics():[];}catch(e){return [];}}
  function progress(){return safeJSON(localStorage.getItem(PROGRESS_KEY)||'{}',{});}
  function saveContext(c){try{localStorage.setItem(CONTEXT_KEY,JSON.stringify(c));}catch(e){}}
  function getContext(){return safeJSON(localStorage.getItem(CONTEXT_KEY)||'{}',{});}
  function findTopic(idOrTitle){var q=String(idOrTitle||'').toLowerCase();return topics().find(function(t){return String(t.id).toLowerCase()===q||String(t.title).toLowerCase()===q;})||null;}
  function assistantPrompt(topic,mode,lang){var title=topic?topic.title:'this electrical topic';var m={simple:'Explain '+title+' in very simple '+(lang==='hi'?'Hindi/Hinglish':'English')+'. Use a small analogy, then key points, formula, one example, and one safety note.',exam:'Teach '+title+' for exam preparation. Give definition, principle, formulas, common mistakes, viva questions, and a short revision summary.',practical:'Explain the practical/lab side of '+title+'. Give safe low-voltage steps, expected observations, common mistakes, and what to record.',normal:'Explain '+title+' step by step with concept, formula, example, application and safety.'};return m[mode]||m.normal;}
  function askAssistant(topic,mode,lang){saveContext({topic:topic&&topic.id||'',title:topic&&topic.title||'',mode:mode||'normal',lang:lang||'en',at:Date.now()});var q=assistantPrompt(topic,mode,lang);if(window.NilSparkLabSmartAssistant&&typeof window.NilSparkLabSmartAssistant.open==='function'){window.NilSparkLabSmartAssistant.open();setTimeout(function(){try{window.NilSparkLabSmartAssistant.respond(q);}catch(e){console.warn('Assistant response unavailable',e);}},50);}}
  function recommendation(){var list=topics(),p=progress();return list.filter(function(t){return !(p[t.id]&&p[t.id].completed);})[0]||list[0]||null;}
  function escapeHTML(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function currentLang(){return (window.currentLang||(localStorage.getItem('nilsparklab_lang')||localStorage.getItem('electrolab_lang'))||document.documentElement.lang||'en')==='hi'?'hi':'en';}
  function injectTools(){var host=document.getElementById('nil-study-detail');if(!host||host.classList.contains('hidden')||host.querySelector('.nil-study-phase2-tools'))return;var title=(host.querySelector('h3')||{}).textContent||'';var t=findTopic(title);if(!t)return;var box=document.createElement('div');box.className='nil-study-phase2-tools';var hi=currentLang()==='hi';box.innerHTML='<button data-p2-ask="simple">'+(hi?'सरल समझाएँ':'Explain Simpler')+'</button><button data-p2-ask="exam">'+(hi?'परीक्षा मोड':'Exam Mode')+'</button><button data-p2-ask="practical">'+(hi?'प्रैक्टिकल सहायता':'Practical Help')+'</button><button data-p2-ask="hi">हिंदी/Hinglish</button><button data-p2-quiz="'+escapeHTML(t.id)+'">'+(hi?'टॉपिक क्विज़':'Topic Quiz')+'</button>';host.appendChild(box);var ctx=document.createElement('div');ctx.className='nil-study-assistant-context';ctx.textContent=(currentLang()==='hi'?'असिस्टेंट संदर्भ: ':'Assistant context: ')+t.title+(currentLang()==='hi'?' · लोकल अध्ययन संदर्भ':' · local-first study context');host.appendChild(ctx);}
  function showQuiz(id){
    var t=findTopic(id),host=document.getElementById('nil-study-detail');
    if(!t||!host)return;
    var old=host.querySelector('.nil-study-quiz-panel');if(old)old.remove();
    var qs=Array.isArray(t.quiz)?t.quiz:[];if(!qs.length)return;
    var idx=0,score=0,panel=document.createElement('div');panel.className='nil-study-quiz-panel';
    function renderQ(){var q=qs[idx];panel.innerHTML='<h4>Quick Quiz · '+(idx+1)+'/'+qs.length+'</h4><p class="text-sm text-slate-300">'+escapeHTML(q.q||'Question')+'</p><input class="nil-study-quiz-answer" placeholder="Type your answer" style="width:100%;margin-top:10px;padding:9px;border-radius:8px;background:#0f172a;border:1px solid #334155;color:#e2e8f0"><button class="nil-study-quiz-option" data-p2-check>Check Answer</button><div class="nil-study-quiz-result"></div>';}
    panel.addEventListener('click',function(e){
      var check=e.target.closest('[data-p2-check]');if(!check)return;
      var ans=(panel.querySelector('.nil-study-quiz-answer').value||'').toLowerCase();
      var keys=(qs[idx].keys||[]).map(function(x){return String(x).toLowerCase();});
      var ok=keys.some(function(k){return ans.indexOf(k)>=0||(ans.length>2&&k.indexOf(ans)>=0);});
      var result=panel.querySelector('.nil-study-quiz-result');
      result.textContent=ok?'✓ Correct!':'Try again. Key idea: '+(keys[0]||'review the lesson');
      if(ok)score++;
      var next=document.createElement('button');next.className='nil-study-quiz-option';next.textContent=idx<qs.length-1?'Next Question':'Finish Quiz';
      next.onclick=function(){if(idx<qs.length-1){idx++;renderQ();}else{panel.innerHTML='<h4>Quiz Complete</h4><div class="nil-study-quiz-result">Score: '+score+'/'+qs.length+'</div><div class="nil-study-recommendation">'+(score===qs.length?'Excellent. Try the viva questions next.':'Recommendation: review the concept, then ask the Assistant for a simpler explanation.')+'</div>';try{window.dispatchEvent(new CustomEvent('nilsparklab:study-quiz-complete',{detail:{topic:t.id,score:score,total:qs.length}}));}catch(_){}};};
      result.after(next);check.remove();
    });
    host.appendChild(panel);renderQ();panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  window.addEventListener('nilsparklab:study-open-quiz',function(e){try{var id=e&&e.detail&&e.detail.topic;if(id)showQuiz(id);}catch(_){}});
  document.addEventListener('click',function(e){var open=e.target.closest('[data-study-open]');if(open){var t=findTopic(open.getAttribute('data-study-open'));if(t)saveContext({topic:t.id,title:t.title,mode:'normal',lang:currentLang(),at:Date.now()});setTimeout(injectTools,0);return;}var ask=e.target.closest('[data-p2-ask]');if(ask){var host=document.getElementById('nil-study-detail'),title=(host&&host.querySelector('h3')||{}).textContent||'';var t=findTopic(title),mode=ask.getAttribute('data-p2-ask');askAssistant(t,mode==='hi'?'simple':mode,mode==='hi'?'hi':'en');return;}var quiz=e.target.closest('[data-p2-quiz]');if(quiz){showQuiz(quiz.getAttribute('data-p2-quiz'));return;}var rec=e.target.closest('[data-p2-recommend]');if(rec){var rt=recommendation();if(rt&&window.NILStudyMode)window.NILStudyMode.open(rt.id);setTimeout(injectTools,0);}});
  document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){var c=getContext();if(c&&c.topic)saveContext(c);},350);});
  window.NILStudyAssistant={context:getContext,recommend:recommendation,ask:function(mode){var c=getContext(),t=findTopic(c.topic||c.title);askAssistant(t,mode||'normal',c.lang||'en');}};
})();
