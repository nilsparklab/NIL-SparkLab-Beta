
(function(){
  'use strict';
  const defs=[
    ['battery','Battery','power','9V DC source'],['resistor','Resistor','passive','470Ω default'],['potentiometer','Potentiometer','passive','10kΩ variable'],['ldr','LDR Sensor','passive','Light-dependent resistor'],['capacitor','Capacitor','passive','100µF default'],['inductor','Inductor','passive','10mH default'],
    ['led','LED','semiconductor','Red LED'],['diode','Diode','semiconductor','1N4007'],['bjt_npn','NPN Transistor','semiconductor','BJT switch/amplifier'],
    ['switch','Switch','control','SPST'],['relay','Relay','control','Relay coil'],['gate_and','AND Gate','control','2-input logic'],['gate_or','OR Gate','control','2-input logic'],['gate_not','NOT Gate','control','Inverter'],['gate_nand','NAND Gate','control','2-input logic'],['gate_nor','NOR Gate','control','2-input logic'],['gate_xor','XOR Gate','control','2-input logic'],['logic_in','Logic Switch','control','0 / 1 input'],
    ['motor','DC Motor','load','DC motor load'],['buzzer','Buzzer','load','Audio load'],['fuse','Fuse','protection','1A default'],
    ['zener_diode','Zener Diode','semiconductor','5.1V reference'],['schottky_diode','Schottky Diode','semiconductor','Fast low-Vf diode'],['p_mosfet','P-MOSFET','semiconductor','High-side switch'],['scr','SCR / Thyristor','semiconductor','Latching power switch'],['triac','TRIAC','semiconductor','AC power control'],['diac','DIAC','semiconductor','Bidirectional trigger'],
    ['ic_741','µA741 Op-Amp','control','Classic analog op-amp'],['reg_7805','7805 Regulator','control','Regulated +5V'],['schmitt_trigger','Schmitt Trigger','control','Hysteresis comparator'],['thermistor_ptc','PTC Thermistor','sensor','Positive temperature coefficient'],['ir_sensor','IR Sensor','sensor','Proximity detection'],['thermocouple','Thermocouple','sensor','Temperature sensor'],['pt100','PT100 RTD','sensor','Precision RTD'],['push_button','Push Button','control','Momentary switch'],['dpdt_switch','DPDT Switch','control','Two-pole selector'],['reed_switch','Reed Switch','control','Magnetic switch'],['ac_source','AC Source','power','230V AC 50Hz'],['bridge_rectifier','Bridge Rectifier','power','4-diode full-wave rectifier'],['lamp','Indicator Lamp','load','10W lamp']
  ];
  window.NilSparkLabBuilderDefinitions = defs.slice();
  const root=document.getElementById('builder-component-grid'), search=document.getElementById('builder-component-search'), empty=document.getElementById('builder-component-empty'), recentWrap=document.getElementById('builder-recent-wrap'), recentList=document.getElementById('builder-recent-list'), searchClear=document.getElementById('builder-search-clear');
  if(!root||!search)return;
  // Mobile-first: Basic category default on small screens
  var category = (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) ? 'basic' : 'basic';
  var BASIC_IDS = new Set(['battery','resistor','potentiometer','led','diode','switch','push_button','capacitor','motor','buzzer','fuse','lamp','ac_source']);
  function getRecent(){try{const x=JSON.parse(localStorage.getItem('elab.builderRecent')||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}}
  function saveRecent(id){const r=getRecent().filter(x=>x!==id);r.unshift(id);try{localStorage.setItem('elab.builderRecent',JSON.stringify(r.slice(0,6)))}catch(e){}}
  function add(id){if(typeof window.addBuilderComp!=='function'){console.warn('NilSparkLab: Builder not ready');return;}window.addBuilderComp(id);saveRecent(id);renderRecent();}
  function renderRecent(){if(!recentWrap||!recentList)return;const r=getRecent();recentList.innerHTML='';if(!r.length){recentWrap.classList.add('hidden');return;}recentWrap.classList.remove('hidden');r.forEach(id=>{const d=defs.find(x=>x[0]===id);if(!d)return;const b=document.createElement('button');b.type='button';b.className='px-2 py-1 rounded-md bg-slate-950 border border-slate-800 hover:border-cyan-500 text-[10px] text-slate-300';b.textContent='+ '+d[1];b.addEventListener('click',()=>add(id));recentList.appendChild(b);});}
  function matchesCat(d){
    if(category==='all') return true;
    if(category==='basic') return BASIC_IDS.has(d[0]);
    return d[2]===category;
  }
  function chipClass(active){
    return active
      ? 'builder-cat is-active'
      : 'builder-cat';
  }
  function render(){
    const q=(search.value||'').trim().toLowerCase();
    root.innerHTML='';
    const list=defs.filter(d=>matchesCat(d)&&(!q||(d[0]+' '+d[1]+' '+d[3]).toLowerCase().includes(q)));
    list.forEach(d=>{
      const b=document.createElement('button');
      b.type='button';
      b.className='elab-comp-row p-2.5 bg-slate-950 border border-slate-800 hover:border-cyan-500 rounded text-left transition';
      b.innerHTML='<span class="block text-slate-200 text-xs font-semibold">'+d[1]+'</span><span class="elab-comp-meta block text-[9px] text-slate-500 mt-0.5">'+d[3]+'</span><span class="elab-comp-add" aria-hidden="true">+</span>';
      b.addEventListener('click',()=>add(d[0]));
      root.appendChild(b);
    });
    if(empty) empty.classList.toggle('hidden', list.length!==0);
    var countEl=document.getElementById('builder-component-count');
    if(countEl) countEl.textContent = list.length + ' / ' + defs.length;
    var resultsEl=document.getElementById('builder-library-results');
    if(resultsEl){
      var label=(category==='all'?'All components':(category==='basic'?'Basic components':category.charAt(0).toUpperCase()+category.slice(1)));
      resultsEl.textContent='Showing '+list.length+' of '+defs.length+' supported · '+label;
    }
  }
  function setCategory(cat, btn){
    category = cat || 'basic';
    document.querySelectorAll('.builder-cat').forEach(function(x){
      var on = (x.dataset.builderCat===category);
      x.className = chipClass(on);
      x.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if(btn){ btn.className = chipClass(true); btn.setAttribute('aria-selected','true'); }
    render();
  }
  document.querySelectorAll('.builder-cat').forEach(function(btn){
    btn.addEventListener('click', function(){ setCategory(btn.dataset.builderCat||'basic', btn); });
  });
  // initial active chip
  setCategory(category, document.querySelector('.builder-cat[data-builder-cat="'+category+'"]'));
  search.addEventListener('input',function(){
    if(searchClear) searchClear.classList.toggle('hidden', !(search.value||'').length);
    render();
  });
  if(searchClear) searchClear.addEventListener('click',function(){search.value='';searchClear.classList.add('hidden');search.focus();render();});
  renderRecent();
  window.NilSparkLabBuilderChips = { setCategory: setCategory, getCategory: function(){ return category; } };
})();
