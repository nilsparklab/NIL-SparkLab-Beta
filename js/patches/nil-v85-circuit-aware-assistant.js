
(function(){
  'use strict';
  const MAX_COMPONENTS=200, MAX_WIRES=400, MAX_TEXT=120;
  const TERMINALS={
    battery:['+','-'], source:['+','-'], dc_source:['+','-'], ac_source:['L','N'], generator:['+','-'],
    resistor:['T1','T2'], potentiometer:['Pin1','Wiper','Pin3'], capacitor:['1','2'], electrolytic_cap:['+','-'],
    inductor:['T1','T2'], ldr:['1','2'], thermistor:['1','2'], thermistor_ptc:['1','2'], led:['A','K'],
    diode:['A','K'], diode_1n4007:['A','K'], zener_diode:['A','K'], schottky_diode:['A','K'],
    motor:['1','2'], lamp:['L','N'], push_button:['NO1','NO2'], switch:['1','2'], two_way_switch:['COM','L1','L2'],
    bjt_npn:['C','B','E'], bjt_pnp:['C','B','E'], mosfet_n:['G','D','S'], p_mosfet:['G','D','S'],
    scr:['A','K','G'], triac:['MT1','MT2','Gate'], diac:['T1','T2'], reg_7805:['IN','GND','OUT'],
    hall_sensor:['VCC','GND','OUT'], ir_sensor:['VCC','GND','OUT'], schmitt_trigger:['VCC','GND','IN','OUT'],
    ic_741:['V+','V-','IN+','IN-','OUT'], thermocouple:['T+','T-'],
    relay:['COIL1','COIL2','COM','NO','NC'], fuse:['1','2']
  };
  const SOURCE=new Set(['battery','source','dc_source','ac_source','generator']);
  const LOAD=new Set(['led','lamp','motor','resistor','heater','buzzer','relay','solenoid']);
  const INDUCTIVE=new Set(['motor','relay','solenoid']);
  const ADVANCED=new Set(['bjt_npn','bjt_pnp','mosfet_n','p_mosfet','scr','triac','diac','ic_741','reg_7805','schmitt_trigger','ir_sensor','thermocouple']);
  function arr(v,max){return Array.isArray(v)?v.slice(0,max):[]}
  function text(v,max=MAX_TEXT){return typeof v==='string'?v.trim().slice(0,max):''}
  function typeOf(c){return text(c&&(c.type||c.kind||c.componentType),80).toLowerCase().replace(/[\s-]+/g,'_')||'unknown'}
  function num(v){var n=Number(v);return Number.isFinite(n)?n:null}
  function valueOf(c,keys){for(var i=0;i<keys.length;i++){var raw=c&&c[keys[i]];if(raw===undefined&&c&&c.properties)raw=c.properties[keys[i]];var n=num(raw);if(n!==null)return n}return null}
  function terminalsFor(c){
    var t=typeOf(c), custom=c&&(c.terminals||c.pins||c.ports);
    if(Array.isArray(custom)) return custom.map(function(x){return text(x&&x.term||x&&x.name||x,40)}).filter(Boolean).slice(0,12);
    if(typeof custom==='string'){
      var parsed=custom.split(/[,•|]/).map(function(x){return x.trim()}).filter(Boolean).slice(0,12);
      if(parsed.length)return parsed;
    }
    return (TERMINALS[t]||['1','2']).slice();
  }
  function builderState(){
    try{
      if(window.NilSparkLabBuilderState && typeof window.NilSparkLabBuilderState==='object') return window.NilSparkLabBuilderState;
    }catch(_){}
    return null;
  }
  function components(){
    try{
      var state=builderState();
      if(state && Array.isArray(state.components)) return arr(state.components,MAX_COMPONENTS);
      return arr(window.builderCanvasComps,MAX_COMPONENTS);
    }catch(_){return[]}
  }
  function wires(){
    try{
      var state=builderState();
      if(state && Array.isArray(state.wires)) return arr(state.wires,MAX_WIRES);
      return arr(window.builderWires,MAX_WIRES);
    }catch(_){return[]}
  }
  function key(p){return p&&p.compId!=null&&p.term!=null?String(p.compId)+':'+String(p.term):''}
  function analyze(){
    var cs=components(), ws=wires(), byId=new Map(), counts=Object.create(null), connected=new Set(), invalid=[], undirected=new Map();
    cs.forEach(function(c){if(!c||c.id==null)return;var id=String(c.id);if(byId.has(id))invalid.push('Duplicate component ID: '+text(id,80));byId.set(id,c);var t=typeOf(c);counts[t]=(counts[t]||0)+1;undirected.set(id,new Set())});
    var dangling=[];
    function join(a,b){if(!undirected.has(a))undirected.set(a,new Set());if(!undirected.has(b))undirected.set(b,new Set());undirected.get(a).add(b);undirected.get(b).add(a)}
    ws.forEach(function(w,i){var a=key(w&&w.from),b=key(w&&w.to);if(!a||!b){invalid.push('Wire '+(i+1)+' has an invalid endpoint.');return}connected.add(a);connected.add(b);var ac=a.split(':')[0],bc=b.split(':')[0];if(!byId.has(ac)||!byId.has(bc)){dangling.push('Wire '+(i+1)+' references a missing component.');return}if(ac===bc)invalid.push('Wire '+(i+1)+' connects a component to itself.');else join(ac,bc)});
    var sources=cs.filter(function(c){return SOURCE.has(typeOf(c))});
    var loads=cs.filter(function(c){return LOAD.has(typeOf(c))});
    var issues=invalid.slice(0,6), warnings=[], tips=[];
    if(dangling.length) issues=issues.concat(dangling.slice(0,3));
    if(!cs.length) return {ok:true,empty:true,componentCount:0,wireCount:0,issues:['Canvas is empty.'],warnings:[],tips:['Add a source and a load, then ask me to analyze the circuit.'],sources:[],loads:[],advanced:[],floating:[],simulation:null};
    if(!sources.length){issues.push('No power source detected.');tips.push('Add a battery/DC or AC source before expecting current flow.');}
    if(!loads.length){warnings.push('No obvious load detected.');tips.push('Add a load such as an LED, lamp, resistor, or motor for a meaningful operating check.');}
    var resistors=cs.filter(function(c){return ['resistor','potentiometer'].indexOf(typeOf(c))>=0});
    var leds=cs.filter(function(c){return typeOf(c)==='led'});
    if(leds.length&&!resistors.length){issues.push('LED protection resistor is not detected.');tips.push('For the educational LED model, add a series current-limiting resistor (commonly 220–470 Ω).');}
    cs.forEach(function(c){
      var t=typeOf(c),v=valueOf(c,['voltage','v','value','volts']);
      if(SOURCE.has(t)&&v!==null&&v>60) warnings.push('High source voltage setting detected: '+v+' V. Verify ratings before practical use.');
      if(t==='resistor'){var r=valueOf(c,['resistance','r','ohms','value']);if(r!==null&&r<=0)issues.push('Resistor '+text(c.id,60)+' has a non-positive resistance value.');}
    });
    var advanced=cs.filter(function(c){return ADVANCED.has(typeOf(c))}).map(function(c){return {id:text(c.id,60),type:typeOf(c),name:text(c.name||'',80)}});
    if(advanced.length) warnings.push(advanced.length+' component(s) use dedicated/limited models; topology analysis alone does not prove correct operation.');
    var floating=[];
    cs.forEach(function(c){var id=String(c.id), terms=terminalsFor(c);terms.forEach(function(t){if(!connected.has(id+':'+t))floating.push({id:id,type:typeOf(c),term:t})})});
    if(floating.length && ws.length) warnings.push(floating.length+' expected terminal(s) are not connected according to the component terminal map.');
    function reachable(start){var seen=new Set([start]),q=[start];while(q.length){var x=q.shift();(undirected.get(x)||[]).forEach(function(y){if(!seen.has(y)){seen.add(y);q.push(y)}})}return seen}
    var disconnectedLoads=[];
    if(sources.length){var reach=reachable(String(sources[0].id));loads.forEach(function(c){if(!reach.has(String(c.id)))disconnectedLoads.push(text(c.name||c.id,80))});}
    if(disconnectedLoads.length) issues.push('Load path is disconnected from the first detected source: '+disconnectedLoads.slice(0,4).join(', ')+'.');
    if(!issues.length && !warnings.length) tips.push('No obvious structural issue detected. Run the full simulation to verify numerical behavior.');
    var sim=null;try{
      var s=window.NILSparkLabLastSimulation;
      if(!s && window.NilSparkLabSimulationState && typeof window.NilSparkLabSimulationState==='object') s=window.NilSparkLabSimulationState;
      if(s&&typeof s==='object')sim={voltage:num(s.voltage),current:num(s.current),power:num(s.power),health:text(s.health,40),note:text(s.note,240),timestamp:num(s.timestamp)};
    }catch(_){sim=null}
    var names=cs.slice(0,12).map(function(c){return text(c.name||typeOf(c),70)});
    return {ok:true,empty:false,componentCount:cs.length,wireCount:ws.length,issues:Array.from(new Set(issues)).slice(0,8),warnings:Array.from(new Set(warnings)).slice(0,8),tips:Array.from(new Set(tips)).slice(0,6),sources:sources.map(function(c){return text(c.name||typeOf(c),70)}),loads:loads.map(function(c){return text(c.name||typeOf(c),70)}),advanced:advanced,floating:floating.slice(0,12),disconnectedLoads:disconnectedLoads.slice(0,8),components:names,counts:counts,simulation:sim};
  }
  function answer(question){
    var a=analyze(), q=text(question,300).toLowerCase();
    var hi=/\b(hindi|हिंदी|hinglish)\b/.test(q);
    var lines=[];
    if(a.empty) return hi?'🔗 Circuit-aware check: canvas खाली है। पहले circuit बनाओ, फिर “मेरा circuit check करो” पूछो।':'🔗 Circuit-aware check: the canvas is empty. Build a circuit first, then ask me to check it.';
    lines.push('🔗 Circuit-aware analysis');
    lines.push(a.componentCount+' components · '+a.wireCount+' wire connections');
    if(a.components.length) lines.push('Detected: '+a.components.join(', ')+(a.componentCount>a.components.length?' …':''));
    if(a.sources.length) lines.push('Source: '+a.sources.join(', '));
    if(a.loads.length) lines.push('Load: '+a.loads.join(', '));
    if(a.simulation) lines.push('Last simulation: '+(a.simulation.voltage!==null?a.simulation.voltage+' V':'—')+' · '+(a.simulation.current!==null?a.simulation.current+' A':'—')+' · '+(a.simulation.power!==null?a.simulation.power+' W':'—')+(a.simulation.health?' · '+a.simulation.health:''));
    if(a.issues.length){lines.push('⚠ Issues:');a.issues.slice(0,5).forEach(function(x){lines.push('• '+x)})}
    if(a.warnings.length){lines.push('ℹ Checks:');a.warnings.slice(0,4).forEach(function(x){lines.push('• '+x)})}
    if(a.tips.length){lines.push('Next:');a.tips.slice(0,3).forEach(function(x){lines.push('• '+x)})}
    return lines.join('\n');
  }
  function shouldHandle(intent,q){
    var textq=text(q,300).toLowerCase();
    return !!window.NILAssistantIntent && (intent==='circuit'||intent==='troubleshoot') && (/\b(my|current|this|actual)\b/.test(textq)||/मेरा|मेरे|अभी|current circuit|circuit check|circuit analyze|circuit analysis|circuit status|wire|wiring|connection|not working|fault|issue|problem/.test(textq));
  }
  window.NILCircuitAwareAssistant=Object.freeze({version:'v85',analyze:analyze,answer:answer,shouldHandle:shouldHandle});
  document.addEventListener('DOMContentLoaded',function(){
    try{
      if(window.NIL_ASSISTANT_CONTEXT){
        window.NIL_ASSISTANT_CONTEXT.setCircuit({componentCount:components().length,connectionCount:wires().length,summary:components().length?'Live Builder circuit':'Canvas empty'});
      }
    }catch(_){ }
  });
})();
