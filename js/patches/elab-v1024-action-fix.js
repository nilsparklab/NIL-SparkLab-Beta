
(function(){
  "use strict";
  var lastTap=0;
  function esc(s){return String(s||"").replace(/[&<>\"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]||c;});}
  function toast(m){try{if(typeof window.elabV575Toast==='function')return window.elabV575Toast(m);}catch(_){}try{if(typeof window.toast==='function')return window.toast(m);}catch(_){}console.info("NilSparkLab:",m);}
  function closeView(){var m=document.getElementById('elab-v1022-diagram-view');if(m)m.remove();}
  function showSectionSafe(id){
    try{if(typeof window.showSection==='function'){window.showSection(id);return true;}}catch(e){console.warn('showSection failed',e);}
    var sections=['home','components','symbols','builder','industrial','projects','faults','calculators','quiz','safety'];
    sections.forEach(function(x){var el=document.getElementById('sec-'+x);if(el)el.classList.add('hidden');});
    var target=document.getElementById('sec-'+id);
    if(target){target.classList.remove('hidden');window.scrollTo(0,0);return true;}
    return false;
  }
  var presetMap={
    'LED Series Circuit':'led_series','LED Parallel / Ballast':'led_parallel','Series Circuit':'series_parallel',
    'Parallel Circuit':'series_parallel','Ohm\'s Law Circuit':'ohms','Voltage Divider':'voltage_divider',
    'Half-wave Rectifier':'half_wave_rectifier','Full-wave Bridge Rectifier':'bridge_rectifier','Center-tap Rectifier':'bridge_rectifier',
    'Transformer + DC Supply':'bridge_rectifier','Buck Converter':'buck_converter','Boost Converter':'boost_converter',
    'Zener Regulator':'zener_regulator','7805 Regulator':'7805','RC Low-pass Filter':'rc_lowpass',
    'RC High-pass Filter':'rc_highpass','RL Filter':'rl_filter','Inverting Op-Amp':'opamp_inverting',
    'Non-inverting Op-Amp':'opamp_noninverting','MOSFET Low-side Switch':'mosfet_switch','Relay Driver':'relay_driver',
    'H-Bridge Motor Driver':'motor_switch','Motor Forward / Reverse':'motor_switch','DOL Starter':'dol','Star-Delta Starter':'star_delta',
    'NAND Gate':'logic_and','NOR Gate':'logic_and','XOR Gate':'logic_and'
  };
  function titleFromView(){var x=document.querySelector('#elab-v1022-diagram-view .viewtitle');return x?x.textContent.trim():'';}
  function build(){
    var view=document.getElementById('elab-v1022-diagram-view');
    var title=titleFromView();
    var fromAssistant=!!(view&&view.dataset&&view.dataset.assistantBuildSource==='1');
    window.__elabAssistantDiagramBuildPending=fromAssistant;
    closeView();
    if(!title){ window.__elabAssistantDiagramBuildPending=false; toast("Diagram title could not be resolved."); return; }
    try{
      if(typeof window.buildDiagramInBuilder==="function"){
        var started = window.buildDiagramInBuilder(title);
        if(started && fromAssistant){
          /* Authoritative close path: the diagram Build action has already
             captured the title and started the real Builder transaction.
             Use the exact same close API as the Assistant's × button.
             Do not wait for a custom event or timeout; the Builder build
             continues independently in the existing Builder state. */
          try{
            if(window.NilSparkLabSmartAssistant && typeof window.NilSparkLabSmartAssistant.close==='function'){
              window.NilSparkLabSmartAssistant.close();
            }
          }catch(closeErr){
            console.warn('NilSparkLab Assistant auto-close:',closeErr);
          }
          window.__elabAssistantDiagramBuildPending=false;
        }
      }else{
        window.__elabAssistantDiagramBuildPending=false;
        toast("Automatic Builder pipeline is unavailable.");
      }
    }catch(e){
      window.__elabAssistantDiagramBuildPending=false;
      console.error("NilSparkLab Diagram Builder:",e);
      toast("Failed to start automatic Builder build.");
    }
  }

  /* v10.30: no secondary Assistant-close event handler. The authoritative
     Diagram Build handler above closes the existing Assistant state directly
     after the real Builder transaction has successfully started. */
  function simulate(){
    var title=titleFromView();
    closeView();
    if(!title){toast("Diagram title could not be resolved.");return;}
    var ok=showSectionSafe('builder');
    if(!ok){toast('Builder section could not be opened.');return;}
    function start(){
      try{
        var comps=(window.NilSparkLabBuilderState&&window.NilSparkLabBuilderState.components)||[];
        if(!comps.length){
          if(typeof window.buildDiagramInBuilder==="function"){
            window.buildDiagramInBuilder(title);
            setTimeout(start,120);
            return;
          }
          toast("No Builder circuit is available.");
          return;
        }
        if(typeof window.runBuilderSim==="function"){
          window.runBuilderSim();
          toast('Simulation started for '+title+'.');
        }else{
          toast('Builder simulator is unavailable.');
        }
      }catch(e){
        console.warn("NilSparkLab Diagram simulation:",e);
        toast('Simulation could not start.');
      }
    }
    requestAnimationFrame(start);
  }
  function explain(){
    var title=titleFromView();closeView();
    setTimeout(function(){
      var q='explain '+title+' circuit step by step';
      try{
        var a=window.NilSparkLabSmartAssistant;
        var r=a&&typeof a.ask==='function'?a.ask(q):null;
        if(a&&typeof a.open==='function')a.open(r||q);
        else toast('Assistant is not available right now.');
      }catch(e){console.warn(e);toast('Assistant could not open.');}
    },80);
  }
  function exportSvg(){
    var holder=document.querySelector('#elab-v1022-diagram-view .diagramholder');
    var svg=holder?holder.querySelector('svg'):null;
    if(!svg){toast('SVG export unavailable.');return;}
    try{
      var clone=svg.cloneNode(true);clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
      var source='<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(clone);
      var blob=new Blob([source],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download=(titleFromView()||'nilsparklab-diagram').replace(/[^a-z0-9]+/gi,'_').replace(/^_|_$/g,'').toLowerCase()+'.svg';
      document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);toast('SVG exported.');
    }catch(e){console.warn(e);toast('SVG export failed.');}
  }
  function actionCapture(e){
    var b=e.target&&e.target.closest?e.target.closest('#elab-v1022-diagram-view .actionrow button'):null;
    if(!b)return;
    var now=Date.now();if(now-lastTap<250){e.preventDefault();e.stopImmediatePropagation();return;}lastTap=now;
    var label=(b.textContent||'').toLowerCase().trim();
    e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
    if(label.indexOf('build')>=0)build();
    else if(label.indexOf('simulate')>=0)simulate();
    else if(label.indexOf('explain')>=0)explain();
    else if(label.indexOf('export')>=0)exportSvg();
  }
  document.addEventListener('click',actionCapture,true);
  document.addEventListener('touchend',actionCapture,true);
  window.NilSparkLabDiagramActionFixV1025=Object.freeze({version:'10.25',build:build,simulate:simulate,explain:explain,exportSvg:exportSvg});
})();
