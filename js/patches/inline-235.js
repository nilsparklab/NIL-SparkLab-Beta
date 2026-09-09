
/* NIL SparkLab Smart Assistant Advanced Capabilities v56 */
(function(){'use strict';
  var STORE='nil_sparklab_assistant_progress_v56';
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function num(v){v=Number(v);return Number.isFinite(v)?v:null;}
  function state(){try{return window.NILSparkLabCircuitStateBridge&&window.NILSparkLabCircuitStateBridge.getState?window.NILSparkLabCircuitStateBridge.getState():{components:[],wires:[],types:[],counts:{}};}catch(_){return {components:[],wires:[],types:[],counts:{}};}}
  function telemetry(){try{return window.NILSparkLabSimulationBridge&&window.NILSparkLabSimulationBridge.getLatest?window.NILSparkLabSimulationBridge.getLatest():null;}catch(_){return null;}}
  function load(){try{return Object.assign({diagnoses:0,safetyReviews:0,vivaAnswered:0,vivaCorrect:0,whatIfRuns:0,lastAction:null},JSON.parse(localStorage.getItem(STORE)||'{}'));}catch(_){return {diagnoses:0,safetyReviews:0,vivaAnswered:0,vivaCorrect:0,whatIfRuns:0,lastAction:null};}}
  function save(p){try{localStorage.setItem(STORE,JSON.stringify(p));}catch(_){}}
  function record(key){var p=load();p[key]=(Number(p[key])||0)+1;p.lastAction=new Date().toISOString();save(p);return p;}
  function typeOf(c){return String(c&&(c.type||c.kind||c.componentType||c.id)||'').toLowerCase();}
  function componentRating(c){
    var candidates=['powerRating','ratedPower','maxPower','wattage','ratingW'];
    for(var i=0;i<candidates.length;i++){var n=num(c&&c[candidates[i]]);if(n!==null&&n>0)return {kind:'power',value:n};}
    var v=num(c&&(c.maxVoltage||c.ratedVoltage)); if(v!==null&&v>0)return {kind:'voltage',value:v};
    var a=num(c&&(c.maxCurrent||c.ratedCurrent)); if(a!==null&&a>0)return {kind:'current',value:a};
    return null;
  }
  function multiFault(){
    var st=state(), cs=Array.isArray(st.components)?st.components:[], wires=Array.isArray(st.wires)?st.wires:[], counts=st.counts||{}, types=st.types||[];
    var out=[];
    if(!cs.length)out.push({level:'high',title:'Empty circuit',detail:'No component data is available, so circuit-specific diagnosis cannot run.'});
    if(cs.length>1&&wires.length===0)out.push({level:'medium',title:'Connectivity not confirmed',detail:'Multiple components are present but no builder wire records were found.'});
    var led=(counts.led||0)>0||types.indexOf('led')>=0;
    var limiter=(counts.resistor||0)>0||(counts.potentiometer||0)>0;
    if(led&&!limiter)out.push({level:'high',title:'LED current limiting not confirmed',detail:'An LED is present but available state data does not confirm a current-limiting component. Verify the actual series path.'});
    var source=['battery','source','dc_source','ac_source','generator','voltage_source'].some(function(x){return (counts[x]||0)>0||types.indexOf(x)>=0;});
    if(cs.length&&!source)out.push({level:'low',title:'Source type not recognized',detail:'No common source type was detected. External or instrument sources may make this a false positive.'});
    cs.forEach(function(c,i){var t=typeOf(c);if(t.indexOf('resistor')>=0){var r=num(c.resistance);if(r===null)r=num(c.value);if(r===null)r=num(c.ohms);if(r!==null&&r<=0)out.push({level:'high',title:'Invalid resistor value',detail:'Resistor #'+(i+1)+' has non-positive resistance ('+r+' Ω).'});}});
    var tm=telemetry(); if(tm){var status=String(tm.health||tm.status||'').toLowerCase();if(/fail|error|invalid/.test(status))out.push({level:'high',title:'Simulation status needs attention',detail:'Latest simulation reports '+esc(tm.health||tm.status)+'. Fix this before trusting numerical conclusions.'});}
    var seen={},clean=[];out.forEach(function(x){var k=x.level+'|'+x.title;if(!seen[k]){seen[k]=1;clean.push(x);}});
    return clean;
  }
  function componentTelemetry(tm,c,idx){
    var maps=[tm&&tm.components,tm&&tm.componentTelemetry,tm&&tm.byComponent,tm&&tm.perComponent];
    var keys=[c&&c.id,c&&c.instanceId,c&&c.ref,c&&c.name,c&&c.label,String(idx)].filter(Boolean).map(String);
    for(var m=0;m<maps.length;m++){var map=maps[m];if(!map)continue;
      if(Array.isArray(map)){for(var a=0;a<map.length;a++){var x=map[a]||{};var k=String(x.id||x.instanceId||x.ref||x.name||x.label||a);if(keys.indexOf(k)>=0)return x;}}
      else if(typeof map==='object'){for(var q=0;q<keys.length;q++){if(map[keys[q]])return map[keys[q]];}}
    }
    return null;
  }
  function ratingReview(){
    var st=state(),cs=Array.isArray(st.components)?st.components:[],tm=telemetry(),findings=[];
    if(!tm){record('safetyReviews');return [{level:'info',title:'Simulation required',detail:'No latest simulation telemetry is available. Rating analysis will not invent V/I/P values.'}];}
    cs.forEach(function(c,idx){var r=componentRating(c);if(!r)return;var name=c.name||c.label||typeOf(c)||('Component '+(idx+1)),ct=componentTelemetry(tm,c,idx);
      if(!ct){findings.push({level:'info',title:name+' rating needs component-specific telemetry',detail:'A configured '+r.kind+' rating exists, but only circuit-level telemetry is available. It is not valid to compare whole-circuit V/I/P directly with this component rating.'});return;}
      var value=r.kind==='power'?num(ct.power):r.kind==='voltage'?num(ct.voltage):num(ct.current);
      if(value===null){findings.push({level:'info',title:name+' rating needs matching telemetry',detail:'Component-specific '+r.kind+' telemetry is unavailable, so no numerical pass/fail claim is made.'});return;}
      var actual=Math.abs(value),unit=r.kind==='power'?'W':r.kind==='voltage'?'V':'A';
      findings.push({level:actual>r.value?'high':'ok',title:name+' '+r.kind+' rating',detail:'Component-specific simulation '+r.kind+' '+actual.toFixed(3)+' '+unit+' vs configured rating '+r.value+' '+unit+'.'});
    });
    if(!findings.length)findings.push({level:'info',title:'No component ratings available',detail:'The current component metadata does not expose usable ratings for a component-specific comparison.'});
    record('safetyReviews');return findings;
  }
  function advancedWhatIf(mult){mult=num(mult);if(mult===null||mult<=0)mult=2;var tm=telemetry();if(!tm){return {ok:false,message:'Run Simulation first. Advanced What-If starts from real latest telemetry.'};}
    var v=num(tm.voltage),i=num(tm.current),p=num(tm.power);if(v===null&&i===null&&p===null)return {ok:false,message:'Latest simulation has no usable V/I/P values, so no numerical projection is generated.'};
    var out={ok:true,mult:mult,base:{v:v,i:i,p:p},projected:{v:v===null?null:v*mult,i:i===null?null:i*mult,p:p===null?null:p*mult*mult},note:'Projection uses ideal resistive scaling. LEDs, diodes, motors, regulators, AC/reactive circuits and nonlinear loads must be re-simulated for accurate results.'};record('whatIfRuns');return out;
  }
  function progress(){var p=load(),total=p.vivaAnswered||0,correct=p.vivaCorrect||0;var accuracy=total?Math.round(correct*100/total):null;var activity=Math.min(100,Math.round(((p.diagnoses||0)+(p.safetyReviews||0)+(p.whatIfRuns||0)+total)*5));return {raw:p,accuracy:accuracy,activity:activity};}
  function card(title,body){var h=document.getElementById('elab-smart-content');if(!h)return;h.innerHTML='<div class="nil-v56-card"><h4>'+esc(title)+'</h4>'+body+'</div>';}
  function renderDashboard(){var f=multiFault(),pr=progress(),high=f.filter(function(x){return x.level==='high';}).length,med=f.filter(function(x){return x.level==='medium';}).length;
    var body='<div class="nil-v56-grid"><div><b>Multi-fault findings</b><br>'+f.length+' total · '+high+' high · '+med+' medium</div><div><b>Learning activity</b><br>'+pr.activity+'%</div><div><b>Viva accuracy</b><br>'+(pr.accuracy===null?'No answers yet':pr.accuracy+'%')+'</div></div><div class="nil-v56-bar"><span style="width:'+pr.activity+'%"></span></div><div class="nil-v56-actions"><button data-nil-v56-action="faults">🔍 Multi-Fault Scan</button><button data-nil-v56-action="ratings">📊 Rating Analysis</button><button data-nil-v56-action="whatif">🔮 Advanced What-If</button><button data-nil-v56-action="progress">📈 Learning Progress</button></div><p class="nil-v56-note">Advanced results remain evidence-aware: missing topology or telemetry is reported as uncertainty, not as invented facts.</p>';
    card('🚀 Advanced Smart Assistant',body);
  }
  function renderFindings(title,items){var body='<div class="nil-v56-list">'+items.map(function(x){return '<div class="nil-v56-item '+esc(x.level||'info')+'"><b>'+esc(x.title)+'</b><br><span>'+esc(x.detail)+'</span></div>';}).join('')+'</div><div class="nil-v56-actions"><button data-nil-v56-action="home">← Dashboard</button></div>';card(title,body);}
  function renderWhatIf(){var x=advancedWhatIf(2);if(!x.ok){card('🔮 Advanced What-If','<p>'+esc(x.message)+'</p><button data-nil-v56-action="home">← Dashboard</button>');return;}function f(n,u){return n===null?'Not available':n.toFixed(3)+' '+u;}
    card('🔮 Advanced What-If','<div class="nil-v56-grid"><div><b>Voltage</b><br>'+f(x.base.v,'V')+' → '+f(x.projected.v,'V')+'</div><div><b>Current</b><br>'+f(x.base.i,'A')+' → '+f(x.projected.i,'A')+'</div><div><b>Power</b><br>'+f(x.base.p,'W')+' → '+f(x.projected.p,'W')+'</div></div><p class="nil-v56-note">'+esc(x.note)+'</p><button data-nil-v56-action="home">← Dashboard</button>');}
  function renderProgress(){var x=progress(),p=x.raw;card('📈 Learning Progress','<div class="nil-v56-grid"><div><b>Diagnosis runs</b><br>'+p.diagnoses+'</div><div><b>Safety reviews</b><br>'+p.safetyReviews+'</div><div><b>What-If runs</b><br>'+p.whatIfRuns+'</div><div><b>Viva answers</b><br>'+p.vivaAnswered+'</div></div><p><b>Viva accuracy:</b> '+(x.accuracy===null?'No graded answers yet':x.accuracy+'%')+'</p><div class="nil-v56-bar"><span style="width:'+x.activity+'%"></span></div><p class="nil-v56-note">Progress is stored locally on this device. It measures activity, not professional electrical competency or safety certification.</p><button data-nil-v56-action="home">← Dashboard</button>');}
  function install(){var chips=document.getElementById('elab-sa-chips');if(!chips||document.getElementById('nil-v56-tools'))return;var d=document.createElement('div');d.id='nil-v56-tools';d.innerHTML='<button class="sa-v56-tool" data-nil-v56="advanced" type="button">🚀 Advanced Assistant</button>';chips.parentNode.insertBefore(d,chips.nextSibling);}
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-nil-v56]');if(b){e.preventDefault();e.stopImmediatePropagation();renderDashboard();return;}var a=e.target.closest&&e.target.closest('[data-nil-v56-action]');if(!a)return;e.preventDefault();var k=a.getAttribute('data-nil-v56-action');if(k==='home')renderDashboard();else if(k==='faults'){record('diagnoses');renderFindings('🔍 Multi-Fault Scan',multiFault());}else if(k==='ratings')renderFindings('📊 Advanced Rating Analysis',ratingReview());else if(k==='whatif')renderWhatIf();else if(k==='progress')renderProgress();},true);
  document.addEventListener('DOMContentLoaded',function(){setTimeout(install,350);});document.addEventListener('click',function(){setTimeout(install,0);},true);
  window.addEventListener('nilsparklab:assistant-viva-graded',function(e){try{var ok=!!(e&&e.detail&&e.detail.correct);var p=record('vivaAnswered');if(ok){p.vivaCorrect=(Number(p.vivaCorrect)||0)+1;save(p);}}catch(_){}});
  window.NILSparkLabAdvancedAssistantV57=Object.freeze({version:'v57',multiFault:multiFault,ratingReview:ratingReview,advancedWhatIf:advancedWhatIf,progress:progress,recordViva:function(correct){var p=record('vivaAnswered');if(correct){p.vivaCorrect=(Number(p.vivaCorrect)||0)+1;save(p);}return progress();}});
})();
