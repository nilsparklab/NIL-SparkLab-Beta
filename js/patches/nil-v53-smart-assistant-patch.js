
(function(){'use strict';
  function norm(v){return String(v||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();}
  function state(){try{return window.NILSparkLabCircuitStateBridge&&window.NILSparkLabCircuitStateBridge.getState?window.NILSparkLabCircuitStateBridge.getState():{components:[],wires:[],types:[],counts:{}};}catch(_){return {components:[],wires:[],types:[],counts:{}}}}
  function vivaQuestion(st){
    var c=st.counts||{}, t=st.types||[];
    if((c.led||0)>0 && !((c.resistor||0)||(c.potentiometer||0))) return {q:'LED current ko safely limit karne ke liye kaunsa component/path verify karna chahiye?',keys:['resistor','current limiting resistor','series resistor','current limit']};
    if((c.led||0)>0) return {q:'Is LED circuit mein series resistor ka primary purpose kya hai?',keys:['limit current','current limiting','current limit','overcurrent protection']};
    if(t.some(function(x){return ['battery','source','dc_source','ac_source','generator'].indexOf(x)>=0})) return {q:'Current circuit mein source ka primary role kya hai?',keys:['provide voltage','supply voltage','voltage supply','power supply','electrical energy']};
    if((st.components||[]).length>1 && (st.wires||[]).length===0) return {q:'Circuit simulate karne se pehle components ke beech kya verify karna zaroori hai?',keys:['connections','wiring','connect','wire']};
    return {q:'Circuit analysis start karne se pehle sabse useful next step kya hai?',keys:['check connections','verify connections','simulate','run simulation']};
  }
  function acceptable(answer,keys){var a=norm(answer); if(!a) return false; return keys.some(function(k){k=norm(k); return a===k || a.indexOf(k)>=0;});}
  function renderViva(){
    var st=state(),q=vivaQuestion(st),host=document.getElementById('elab-smart-content'); if(!host)return;
    host.innerHTML='<div class="sa-v48-card"><h4>🗣️ Circuit-Aware Viva Mode</h4><div>'+q.q+'</div><input id="nil-v53-viva-answer" class="sa-v48-answer" placeholder="Type your answer..."><div class="sa-v48-row"><button type="button" id="nil-v53-viva-check">Check Answer</button><button type="button" id="nil-v53-viva-next">New Question</button></div><div id="nil-v53-viva-result" style="margin-top:7px"></div></div>';
    host.dataset.nilV53Keys=JSON.stringify(q.keys);
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-nil-v48="viva"]'); if(b){e.preventDefault();e.stopImmediatePropagation();renderViva();return;}
    if(e.target&&e.target.id==='nil-v53-viva-check'){
      var host=document.getElementById('elab-smart-content'),x=document.getElementById('nil-v53-viva-answer'),r=document.getElementById('nil-v53-viva-result'),keys=[];
      try{keys=JSON.parse(host&&host.dataset.nilV53Keys||'[]')}catch(_){keys=[]}
      if(host&&host.dataset.nilV53Graded==='1')return;
      var ok=acceptable(x&&x.value,keys);
      if(host)host.dataset.nilV53Graded='1';
      if(e.target) e.target.disabled=true;
      if(r)r.innerHTML=ok?'✅ Answer accepted. Explanation: current circuit context ke primary electrical function ko correctly identify kiya.':'🟡 Review needed. Hint: question mein poochhe gaye component/function ka primary electrical purpose identify karo.';
      try{window.dispatchEvent(new CustomEvent('nilsparklab:assistant-viva-graded',{detail:{correct:!!ok}}));}catch(_){}
    }
    if(e.target&&e.target.id==='nil-v53-viva-next'){renderViva();}
  },true);
  window.NILSparkLabAssistantAccuracy={version:'v53',normalize:norm,acceptable:acceptable,vivaQuestion:vivaQuestion};
})();
