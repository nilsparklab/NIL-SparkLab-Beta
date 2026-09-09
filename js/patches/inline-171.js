
(function(){
  'use strict';

  var SEC = {
    version: '5.99',
    maxImportBytes: 2 * 1024 * 1024,
    maxComponents: 200,
    maxWires: 400,
    maxNameLength: 80,
    maxStringLength: 240,
    maxArrayLength: 500
  };

  var ALLOWED_TYPES = new Set([
    'source','resistor','potentiometer','ldr','capacitor','inductor','led','diode',
    'bjt_npn','bjt_pnp','switch','relay','logic_gate','logic_input','motor','buzzer',
    'fuse','p_mosfet','mosfet_n','scr','triac','diac','ic_741','reg_7805',
    'schmitt_trigger','thermistor_ptc','ir_sensor','thermocouple','pt100','push_button',
    'dpdt_switch','reed_switch','ac_source','bridge_rectifier','lamp','thermistor',
    'hall_sensor','op_amp','timer_555','microcontroller','contactor','mcb','olr',
    'mov_varistor','transformer'
  ]);

  var ENUMS = {
    simulationStatus: new Set(['normal','warning','fault','overcurrent','short','safe']),
    currentDirection: new Set(['forward','reverse','clockwise','counterclockwise']),
    homeFlowMode: new Set(['conventional','electron'])
  };

  function finiteNumber(v){ return typeof v === 'number' && Number.isFinite(v); }
  function safeString(v, max){ return typeof v === 'string' && v.length <= (max || SEC.maxStringLength) && !/[\u0000-\u0008\u000B\u000C\u000E-\u001F<>\"'`]/.test(v); }
  function safeId(v){ return typeof v === 'string' && /^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(v); }
  function clonePrimitive(v){
    if (typeof v === 'string') return v.slice(0, SEC.maxStringLength);
    if (typeof v === 'number') return finiteNumber(v) ? v : null;
    if (typeof v === 'boolean') return v;
    if (v === null) return null;
    if (Array.isArray(v) && v.length <= SEC.maxArrayLength) {
      var a=[]; for(var i=0;i<v.length;i++){ var x=clonePrimitive(v[i]); if(x===undefined) return undefined; a.push(x); }
      return a;
    }
    return undefined;
  }

  function componentTerminals(type, comp){
    try {
      var db = (typeof componentsDatabase !== 'undefined' && Array.isArray(componentsDatabase)) ? componentsDatabase : [];
      for(var i=0;i<db.length;i++){
        var item=db[i];
        if(item && item.type===type && Array.isArray(item.terminals)) return item.terminals.slice();
      }
    } catch(e){}
    var fallback={
      source:['+ (Pos)','- (Gnd)'], resistor:['T1','T2'], led:['Anode (+)','Cathode (-)'],
      diode:['Anode (+)','Cathode (-)'], switch:['In','Out'], motor:['M+','M-'],
      ac_source:['L','N'], capacitor:['+','-'], inductor:['L1','L2'], buzzer:['+','-']
    };
    return fallback[type] || null;
  }

  function validateComponent(input, index){
    if(!input || typeof input!=='object' || Array.isArray(input)) return {ok:false,error:'component['+index+'] is not an object'};
    if(!safeId(input.id)) return {ok:false,error:'component['+index+'] has an invalid id'};
    if(!ALLOWED_TYPES.has(input.type)) return {ok:false,error:'component['+index+'] type is not allowed'};
    if(!finiteNumber(input.x) || !finiteNumber(input.y) || input.x < -5000 || input.x > 5000 || input.y < -5000 || input.y > 5000) return {ok:false,error:'component['+index+'] has invalid coordinates'};
    if(input.rotation!==undefined && (!finiteNumber(input.rotation) || Math.abs(input.rotation)>360000)) return {ok:false,error:'component['+index+'] has invalid rotation'};
    if(input.name!==undefined && !safeString(input.name, SEC.maxStringLength)) return {ok:false,error:'component['+index+'] has invalid name'};

    var out=Object.create(null), keys=Object.keys(input);
    for(var k=0;k<keys.length;k++){
      var key=keys[k];
      if(!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(key)) return {ok:false,error:'component['+index+'] contains an unsafe field name'};
      var val=clonePrimitive(input[key]);
      if(val===undefined) return {ok:false,error:'component['+index+'].'+key+' contains an unsupported value'};
      out[key]=val;
    }
    out.id=input.id; out.type=input.type; out.x=input.x; out.y=input.y;
    var terms=componentTerminals(input.type,input);
    if(Array.isArray(input.terminals) && terms){
      for(var t=0;t<input.terminals.length;t++) if(!safeString(input.terminals[t],80)) return {ok:false,error:'component['+index+'] has invalid terminal data'};
    }
    return {ok:true,value:out};
  }

  function validateProject(raw){
    if(!raw || typeof raw!=='object' || Array.isArray(raw)) return {ok:false,error:'Project must be a JSON object'};
    // Legacy exports may contain a visual `html` snapshot. It is never trusted or restored;
    // structured circuit data below is the only state accepted by the validator.
    if(raw.name!==undefined && !safeString(raw.name,SEC.maxNameLength)) return {ok:false,error:'Invalid project name'};
    if(!raw.circuit || typeof raw.circuit!=='object' || Array.isArray(raw.circuit)) return {ok:false,error:'Missing circuit object'};
    var comps=raw.circuit.components, wires=raw.circuit.wires;
    if(!Array.isArray(comps) || !Array.isArray(wires)) return {ok:false,error:'Circuit components/wires must be arrays'};
    if(comps.length>SEC.maxComponents) return {ok:false,error:'Too many components'};
    if(wires.length>SEC.maxWires) return {ok:false,error:'Too many wires'};

    var ids=new Set(), safeComps=[];
    for(var i=0;i<comps.length;i++){
      var c=validateComponent(comps[i],i); if(!c.ok) return c;
      if(ids.has(c.value.id)) return {ok:false,error:'Duplicate component id: '+c.value.id};
      ids.add(c.value.id); safeComps.push(c.value);
    }

    var safeWires=[];
    for(var w=0;w<wires.length;w++){
      var wire=wires[w];
      if(!wire || typeof wire!=='object' || Array.isArray(wire)) return {ok:false,error:'wire['+w+'] is invalid'};
      if(wire.id!==undefined && !safeId(wire.id)) return {ok:false,error:'wire['+w+'] has invalid id'};
      if(!wire.from || !wire.to || !safeId(wire.from.compId) || !safeId(wire.to.compId) || !safeString(wire.from.term,80) || !safeString(wire.to.term,80)) return {ok:false,error:'wire['+w+'] endpoint is invalid'};
      if(!ids.has(wire.from.compId) || !ids.has(wire.to.compId)) return {ok:false,error:'wire['+w+'] references a missing component'};
      var fromC=null,toC=null;
      for(var ci=0;ci<safeComps.length;ci++){ if(safeComps[ci].id===wire.from.compId) fromC=safeComps[ci]; if(safeComps[ci].id===wire.to.compId) toC=safeComps[ci]; }
      function hasTerm(comp,term){
        if(Array.isArray(comp.terminals)) return comp.terminals.indexOf(term)!==-1;
        var ts=componentTerminals(comp.type,comp); return Array.isArray(ts)?ts.indexOf(term)!==-1:true;
      }
      if(!hasTerm(fromC,wire.from.term) || !hasTerm(toC,wire.to.term)) return {ok:false,error:'wire['+w+'] references an invalid terminal'};
      if(wire.from.compId===wire.to.compId && wire.from.term===wire.to.term) return {ok:false,error:'wire['+w+'] cannot connect a terminal to itself'};
      var wc={id:wire.id||('w_'+w),from:{compId:wire.from.compId,term:wire.from.term},to:{compId:wire.to.compId,term:wire.to.term}};
      if(wire.color!==undefined){ if(!safeString(wire.color,40)) return {ok:false,error:'wire['+w+'] color is invalid'}; wc.color=wire.color; }
      safeWires.push(wc);
    }

    var sim=raw.simulation||{};
    if(typeof sim!=='object' || Array.isArray(sim)) return {ok:false,error:'Invalid simulation object'};
    var safeSim={
      status: ENUMS.simulationStatus.has(sim.status)?sim.status:'normal',
      overcurrent: sim.overcurrent==='true'||sim.overcurrent===true?'true':'false',
      currentDirection: ENUMS.currentDirection.has(sim.currentDirection)?sim.currentDirection:'forward',
      homePolarity: sim.homePolarity===-1?-1:1,
      homeFlowMode: ENUMS.homeFlowMode.has(sim.homeFlowMode)?sim.homeFlowMode:'conventional'
    };

    var safeUcdm = undefined;
    if(raw.ucdm !== undefined){
      try {
        var ucdmText = typeof raw.ucdm === 'string' ? raw.ucdm : JSON.stringify(raw.ucdm);
        if(typeof ucdmText !== 'string' || ucdmText.length > 1024*1024) return {ok:false,error:'UCDM payload exceeds size limit'};
        JSON.parse(ucdmText);
        safeUcdm = ucdmText;
      } catch(e) { return {ok:false,error:'Invalid UCDM payload'}; }
    }
    return {ok:true,value:{
      version:safeString(raw.version,40)?raw.version:SEC.version,
      name:safeString(raw.name,SEC.maxNameLength)?raw.name:'Untitled Circuit',
      circuit:{components:safeComps,wires:safeWires},simulation:safeSim,savedAt:raw.savedAt&&safeString(raw.savedAt,80)?raw.savedAt:new Date().toISOString(),
      ...(safeUcdm !== undefined ? {ucdm:safeUcdm} : {})
    }};
  }

  function notify(msg, level){
    try{
      var el=document.getElementById('elab-v599-security-badge'); if(!el) return;
      el.style.display='block'; el.textContent='Security '+SEC.version+' · '+msg;
      if(level==='error') el.style.borderColor='rgba(248,113,113,.45)';
      else el.style.borderColor='rgba(34,211,238,.22)';
      setTimeout(function(){el.style.display='none';},4200);
    }catch(e){}
  }

  function sanitizeText(v,max){
    if(v===null || v===undefined) return '';
    return String(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').slice(0,max||SEC.maxStringLength);
  }

  function safeImport(file){
    if(!file) return false;
    if(file.size>SEC.maxImportBytes){ notify('Import blocked: file exceeds 2 MB','error'); return false; }
    if(file.type && file.type!=='application/json' && !/\.(nilsparklab|electrolab)\.json$/i.test(file.name||'')){
      notify('Import blocked: JSON project file required','error'); return false;
    }
    var reader=new FileReader();
    reader.onload=function(){
      try{
        var raw=JSON.parse(reader.result);
        var result=validateProject(raw);
        if(!result.ok) throw new Error(result.error);
        if(window.NilSparkLabProjectCore && typeof window.NilSparkLabProjectCore.load==='function'){
          if(!window.NilSparkLabProjectCore.load(result.value)) throw new Error('Project load failed');
          if(typeof window.NilSparkLabProjectCore.save==='function') window.NilSparkLabProjectCore.save(result.value.name);
          notify('Secure project imported');
        }
      }catch(err){
        console.warn('NilSparkLab secure import rejected:',err.message);
        notify('Import blocked: invalid or unsafe project','error');
      }
    };
    reader.onerror=function(){ notify('Import failed: file could not be read','error'); };
    reader.readAsText(file);
    return true;
  }

  function audit(){
    var issues=[], warnings=[];
    var scripts=document.scripts||[];
    for(var i=0;i<scripts.length;i++){
      var src=scripts[i].src||'';
      if(src && /cdn\.tailwindcss\.com/.test(src)) warnings.push('Tailwind Play CDN is development-oriented');
      if(src && /unpkg\.com\/lucide@/.test(src) && /@latest/.test(src)) warnings.push('Lucide uses a floating version');
    }
    var inlineHandlers=document.querySelectorAll('[onclick],[oninput],[onchange],[onpointerdown],[onpointerup],[onload],[onerror]').length;
    if(inlineHandlers) warnings.push(inlineHandlers+' inline event handler(s) remain');
    var unsafeScripts=document.querySelectorAll('script[src^="javascript:"]').length;
    if(unsafeScripts) issues.push('javascript: script source detected');
    var stored=SafeStore.get('NilSparkLab_v5_61_project',null);
    if(stored){ try { var parsed=JSON.parse(stored); var vr=validateProject(parsed); if(!vr.ok) warnings.push('Stored project requires validation'); } catch(e){ warnings.push('Stored project JSON is invalid'); } }
    return {version:SEC.version,ok:issues.length===0,issues:issues,warnings:warnings,limits:{maxImportBytes:SEC.maxImportBytes,maxComponents:SEC.maxComponents,maxWires:SEC.maxWires}};
  }

  window.NilSparkLabSecurity={
    version:SEC.version,
    validateProject:validateProject,
    validateImportText:function(text){
      if(typeof text!=="string") return {ok:false,reason:"Not text"};
      if(text.length>SEC.maxImportBytes) return {ok:false,reason:"Project exceeds 2 MB limit"};
      try{
        var parsed=JSON.parse(text);
        var result=validateProject(parsed);
        return result&&result.ok?{ok:true,project:result.value}:{ok:false,reason:(result&&result.error)||"Invalid project"};
      }catch(e){return {ok:false,reason:"Invalid project JSON"};}
    },
    sanitizeText:sanitizeText,
    safeImport:safeImport,
    audit:audit,
    limits:Object.freeze({maxImportBytes:SEC.maxImportBytes,maxComponents:SEC.maxComponents,maxWires:SEC.maxWires,maxNameLength:SEC.maxNameLength})
  };

  // Replace the public import entry point so every file import passes through validation.
  try{
    if(window.NilSparkLabProjectCore){
      window.NilSparkLabProjectCore.importProject=safeImport;
    }
  }catch(e){ console.warn('NilSparkLab security bridge:',e); }


  document.addEventListener('DOMContentLoaded',function(){
    var report=audit();
    window.NilSparkLabSecurityReport=report;
    if(report.issues.length) console.warn('NilSparkLab Security issues:',report.issues);
    if(report.warnings.length) console.info('NilSparkLab Security warnings:',report.warnings);
  });
})();
