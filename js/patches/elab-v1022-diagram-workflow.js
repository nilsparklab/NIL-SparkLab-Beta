
(function(){
  "use strict";
  var opening=false, custom=[];
  var builtins=[
    ["LED Series Circuit","led series diagram","Basic DC"],["LED Parallel / Ballast","parallel led diagram","Basic DC"],["Series Circuit","series circuit diagram","Basic DC"],["Parallel Circuit","parallel circuit diagram","Basic DC"],["Ohm's Law Circuit","ohm law circuit diagram","Basic DC"],["Voltage Divider","voltage divider diagram","Basic DC"],["Wheatstone Bridge","wheatstone bridge diagram","Measurement"],
    ["Half-wave Rectifier","half wave rectifier diagram","Power Electronics"],["Full-wave Bridge Rectifier","full wave bridge rectifier diagram","Power Electronics"],["Center-tap Rectifier","center tap rectifier diagram","Power Electronics"],["Transformer + DC Supply","transformer bridge rectifier power supply diagram","Power Electronics"],["Buck Converter","buck converter diagram","Power Electronics"],["Boost Converter","boost converter diagram","Power Electronics"],["Zener Regulator","zener regulator diagram","Regulators"],["7805 Regulator","7805 regulator diagram","Regulators"],
    ["RC Low-pass Filter","rc low pass filter diagram","Filters"],["RC High-pass Filter","rc high pass filter diagram","Filters"],["RL Filter","rl filter diagram","Filters"],["Inverting Op-Amp","inverting op amp diagram","Analog"],["Non-inverting Op-Amp","non inverting op amp diagram","Analog"],["Common-emitter Amplifier","common emitter amplifier diagram","Analog"],
    ["MOSFET Low-side Switch","mosfet low side switch diagram","Switching"],["Relay Driver","relay control circuit diagram","Switching"],["H-Bridge Motor Driver","h bridge motor driver diagram","Motor Control"],["Motor Forward / Reverse","motor reversing diagram","Motor Control"],["DOL Starter","DOL starter diagram","Industrial"],["Star-Delta Starter","star delta diagram","Industrial"],["NAND Gate","nand gate diagram","Digital"],["NOR Gate","nor gate diagram","Digital"],["XOR Gate","xor gate diagram","Digital"]
  ];
  var meta={
    "LED Series Circuit":["Current flows from source through the series resistor and LED and returns to the source.",["DC source","Current-limiting resistor","LED"],"Check LED polarity and use an appropriate series resistor."],
    "LED Parallel / Ballast":["Parallel branches share the supply voltage. In practice, each LED branch should have suitable current limiting.",["DC source","LEDs","Ballast resistors"],"Prefer a separate resistor for each LED branch."],
    "Series Circuit":["The same current path passes through each series element.",["Source","Resistive/load elements"],"A single open component breaks the loop."],
    "Parallel Circuit":["Parallel branches share the same two electrical nodes and therefore the same branch voltage.",["Source","Parallel branches"],"Branch currents depend on each branch impedance."],
    "Ohm's Law Circuit":["Voltage, current and resistance are related by V = I × R.",["Source","Resistor"],"Use consistent units before calculating."],
    "Voltage Divider":["Series resistors divide the source voltage according to their resistance values.",["Source","R1","R2","Vout node"],"The unloaded divider relation changes when the output is loaded."],
    "Wheatstone Bridge":["Two resistor ratios are compared to determine the bridge balance condition.",["R1","R2","R3","R4","Supply","Vout"],"Balance occurs when the two side ratios match."],
    "Half-wave Rectifier":["A diode conducts mainly during one half-cycle, producing a pulsating DC output.",["AC source","Diode","Load"],"Diode orientation and ratings matter."],
    "Full-wave Bridge Rectifier":["A four-diode bridge routes both AC half-cycles through the load in the same output polarity.",["AC source","Bridge rectifier","Load"],"Add filtering when a smoother DC output is required."],
    "Center-tap Rectifier":["A center-tapped transformer and diodes use alternate half-cycles to create full-wave rectification.",["Center-tapped transformer","Diodes","Load"],"Observe transformer and diode ratings/polarity."],
    "Transformer + DC Supply":["AC is transformed, rectified and then filtered before reaching the DC load.",["AC source","Transformer","Bridge rectifier","Filter capacitor","Load"],"This is a teaching block; verify real-world ratings separately."],
    "RC Low-pass Filter":["The resistor-capacitor network attenuates higher-frequency components more strongly than lower-frequency components.",["Source","Resistor","Capacitor"],"Vout is commonly observed across the capacitor."],
    "RC High-pass Filter":["The capacitor-resistor network passes changing/high-frequency components while attenuating low-frequency/DC content.",["Source","Capacitor","Resistor"],"Vout is commonly observed across the resistor."],
    "RL Filter":["An inductor's frequency-dependent impedance makes the network respond differently to changing frequency.",["Source","Resistor","Inductor"],"Inductor current cannot change instantaneously in the ideal model."],
    "Inverting Op-Amp":["The input reaches the inverting input through Rin while feedback through Rf sets the ideal closed-loop gain.",["Op-amp","Rin","Rf","Supply rails"],"Ideal relation: Av ≈ −Rf/Rin within the valid operating range."],
    "Non-inverting Op-Amp":["The input is applied to the non-inverting input and feedback sets the ideal closed-loop gain.",["Op-amp","Rin","Rf","Supply rails"],"Ideal relation: Av ≈ 1 + Rf/Rin within the valid operating range."],
    "Common-emitter Amplifier":["A BJT common-emitter stage can provide voltage gain with biasing and a collector load.",["BJT NPN","Bias resistors","Collector load","Supply"],"The shown diagram is a teaching concept; bias network details may be omitted."],
    "Zener Regulator":["A series resistor limits current while the Zener provides a shunt voltage reference/regulation concept.",["Source","Series resistor","Zener diode","Load"],"Zener polarity and power rating are important."],
    "7805 Regulator":["The 7805 provides a regulated nominal 5 V output in its intended operating range.",["Input source","7805","Input/output capacitors","Load"],"Use the regulator datasheet for required capacitors, dissipation and input limits."],
    "MOSFET Low-side Switch":["An NMOS controls the load current on the low side when its gate is driven appropriately.",["DC source","NMOS","Load","Gate drive"],"For inductive loads, provide appropriate flyback/freewheel protection."],
    "Relay Driver":["A transistor can switch relay-coil current while a protection diode handles coil flyback where applicable.",["Source","Driver transistor","Relay coil","Flyback diode","Load"],"Do not omit coil protection in practical DC relay drivers."],
    "H-Bridge Motor Driver":["Four controlled switches can reverse motor polarity by selecting opposite diagonal paths.",["Four switches","DC motor","Supply","Control"],"Never enable conflicting high/low-side paths; real bridges need proper dead-time/drive protection."],
    "Motor Forward / Reverse":["Reversing the motor's applied polarity reverses its rotation direction for a suitable DC motor.",["Motor","Reversing switches/contactors","Supply"],"Use electrical/mechanical interlocking in practical contactor circuits."],
    "DOL Starter":["A DOL starter applies the motor supply directly through a contactor, with control and overload protection.",["3-phase supply","STOP","START","Contactor","Overload relay","Motor"],"The included industrial lab provides a practice sequence; mains work requires proper safety procedures."],
    "Star-Delta Starter":["The motor starts in star and transitions to delta after the programmed delay, reducing starting stress compared with direct starting.",["3-phase supply","KM1 main","KM2 star","KM3 delta","Timer","Overload","Motor"],"Star and delta contactors must be interlocked so they cannot be on together."],
    "NAND Gate":["NAND is the inverted AND function: the output is LOW only when all inputs are HIGH.",["Logic inputs A/B","NAND gate","Output Y"],"Truth-table behavior depends on the logic convention used."],
    "NOR Gate":["NOR is the inverted OR function: the output is HIGH only when all inputs are LOW.",["Logic inputs A/B","NOR gate","Output Y"],"Truth-table behavior depends on the logic convention used."],
    "XOR Gate":["XOR outputs HIGH when the two inputs are different.",["Logic inputs A/B","XOR gate","Output Y"],"For more than two inputs, XOR is an odd-parity function."],
    "Buck Converter":["A switching stage reduces DC voltage by controlling energy transfer through the switch and inductor.",["DC source","Switch","Inductor","Diode/synchronous path","Capacitor","Load"],"The displayed diagram is a teaching concept, not a production converter design."],
    "Boost Converter":["A switching stage raises DC voltage by storing energy in an inductor and transferring it to the output.",["DC source","Inductor","Switch","Diode","Capacitor","Load"],"The displayed diagram is a teaching concept, not a production converter design."]
  };

  function toast(m){try{if(typeof window.elabV575Toast==='function')return window.elabV575Toast(m);}catch(_){ }try{if(typeof window.toast==='function')return window.toast(m);}catch(_){ }console.info("NilSparkLab:",m);}
  function escapeHtml(s){return String(s||"").replace(/[&<>\"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\\"":"&quot;"}[c]||c;});}
  function close(id){var x=document.getElementById(id);if(x)x.remove();}
  function getInput(){return document.getElementById("elab-sa-input");}
  function runAssistant(q){
    try{
      var api=window.NilSparkLabSmartAssistant;
      if(api&&typeof api.respond==='function'){
        var panel=document.getElementById('elab-smart-panel');
        if(panel&&!panel.classList.contains('open')&&typeof api.open==='function') api.open();
        return api.respond(q);
      }
      if(api&&typeof api.ask==='function'){
        var a=api.ask(q);
        if(typeof api.open==='function') api.open(a||"No response returned.");
        return a;
      }
      throw new Error('Smart Assistant API unavailable');
    }catch(err){
      console.error('NilSparkLab Quick Action response:',err);
      try{
        var c=document.getElementById('elab-smart-content');
        if(c)c.innerHTML='<div class="sa-answer"><b>Assistant error</b><br>Sorry, this module could not be opened. Please try again.</div>';
      }catch(_){ }
      return null;
    }
  }
  function goBuilder(){try{if(typeof window.showSection==='function')window.showSection('builder');}catch(_){ } }
  function goIndustrial(){try{if(typeof window.showSection==='function')window.showSection('industrial');}catch(_){ } }
  function goSimulate(){goBuilder();setTimeout(function(){var ids=['elab-v545-simulate','elab-v544-simulate-wrap','simulate','simulator'];var t=null;for(var i=0;i<ids.length;i++){t=document.getElementById(ids[i]);if(t)break;}if(t&&t.scrollIntoView)t.scrollIntoView({behavior:'smooth',block:'center'});else toast('Builder opened. Use Simulate there.');},180);}
  function renderDiagram(q,forcedTitle,fromAssistant){
    var result=null,d=null,svg="",title=forcedTitle||"Circuit Diagram";
    try{if(window.NilSparkLabDiagrams&&typeof window.NilSparkLabDiagrams.answer==='function'){result=window.NilSparkLabDiagrams.answer(q);d=result&&result.diagram?result.diagram:null;if(d)window.__elabLastDiagram=d;}}catch(e){}
    try{if(!d&&window.NilSparkLabDiagrams&&typeof window.NilSparkLabDiagrams.draw==='function'){d=window.NilSparkLabDiagrams.draw(q);if(d)window.__elabLastDiagram=d;}}catch(e){}
    try{if(d&&typeof d.svg==='function'){svg=d.svg();title=forcedTitle||d.title||title;}}catch(_){ }
    if(!svg){toast('Is diagram ka renderer available nahi hai. Try another diagram.');return false;}
    close('elab-v1022-diagram-view');
    var modal=document.createElement('div');modal.id='elab-v1022-diagram-view';
    modal.dataset.assistantBuildSource=fromAssistant?'1':'0';
    if(!fromAssistant) window.__elabAssistantDiagramBuildPending=false;
    var box=document.createElement('div');box.className='viewbox';
    var head=document.createElement('div');head.className='viewhead';
    var tw=document.createElement('div');tw.innerHTML='<div class="viewtitle">'+escapeHtml(title)+'</div><div class="viewbadge">'+(d&&d.trust==='verified'?'✓ Verified teaching diagram':'Teaching / generated diagram')+'</div>';
    var closeBtn=document.createElement('button');closeBtn.type='button';closeBtn.textContent='Close';closeBtn.className='secondary';closeBtn.style.padding='7px 11px';closeBtn.onclick=function(){modal.remove();};head.appendChild(tw);head.appendChild(closeBtn);
    var holder=document.createElement('div');holder.className='diagramholder';holder.innerHTML=svg;
    var m=meta[forcedTitle||title]||meta[String(title).replace(/\s+·.*$/,'')];
    var explain=(m&&m[0])||'This diagram is intended as a visual learning reference. Inspect the connection path and component roles before building it.';
    var comps=(m&&m[1])||[];
    var caution=(m&&m[2])||'Verify component ratings and terminal connections before running a practical circuit.';
    var grid=document.createElement('div');grid.className='workflowgrid';
    var info=document.createElement('div');info.className='infocard';info.innerHTML='<h3>💡 HOW IT WORKS</h3><p>'+escapeHtml(explain)+'</p><h3 style="margin-top:9px">🧩 COMPONENTS</h3><ul>'+comps.map(function(x){return '<li>'+escapeHtml(x)+'</li>';}).join('')+'</ul>';
    var learn=document.createElement('div');learn.className='infocard';learn.innerHTML='<h3>⚠ PRACTICE NOTE</h3><p>'+escapeHtml(caution)+'</p><h3 style="margin-top:9px">NEXT STEP</h3><p>Open the Builder to recreate the circuit, then run the simulation and inspect the result.</p>';
    grid.appendChild(info);grid.appendChild(learn);
    var actions=document.createElement('div');actions.className='actionrow';
    var bld=document.createElement('button');bld.type='button';bld.className='primary';bld.textContent='🧰 Build this circuit';bld.onclick=function(){
      modal.remove();
      if(window.NilSparkLabDiagramBuilderV1029 && typeof window.NilSparkLabDiagramBuilderV1029.handoff==='function'){
        window.NilSparkLabDiagramBuilderV1029.handoff(title);
      }else{
        goBuilder();
        toast('Builder handoff is not ready.');
      }
    };
    var sim=document.createElement('button');sim.type='button';sim.className='simulate';sim.textContent='▶ Simulate';sim.onclick=function(){modal.remove();goSimulate();};
    var ask=document.createElement('button');ask.type='button';ask.className='secondary';ask.textContent='🤖 Explain with Assistant';ask.onclick=function(){modal.remove();runAssistant('explain '+title+' circuit step by step');};
    var exp=document.createElement('button');exp.type='button';exp.className='secondary';exp.textContent='Export SVG';exp.onclick=function(){try{if(window.NilSparkLabDiagrams&&typeof window.NilSparkLabDiagrams.exportLast==='function'&&window.NilSparkLabDiagrams.exportLast())toast('SVG exported');else toast('Export unavailable');}catch(_){toast('Export unavailable');}};
    actions.appendChild(bld);actions.appendChild(sim);actions.appendChild(ask);actions.appendChild(exp);
    box.appendChild(head);box.appendChild(holder);box.appendChild(grid);box.appendChild(actions);modal.appendChild(box);document.body.appendChild(modal);
    modal.addEventListener('click',function(e){if(e.target===modal)modal.remove();});
    return true;
  }
  function openGallery(fromAssistant){
    close('elab-v1021-diagram-library');
    var old=document.getElementById('elab-v1022-diagram-library');if(old){old.remove();return;}
    var modal=document.createElement('div');modal.id='elab-v1022-diagram-library';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
    var box=document.createElement('div');box.className='libbox';
    var head=document.createElement('div');head.className='libhead';
    var title=document.createElement('div');title.innerHTML='<h2>📐 Diagram Library</h2><div class="libsub">Learn → inspect components → build → simulate</div>';
    var closeBtn=document.createElement('button');closeBtn.type='button';closeBtn.className='libclose';closeBtn.textContent='Close';closeBtn.onclick=function(){modal.remove();};head.appendChild(title);head.appendChild(closeBtn);box.appendChild(head);
    var search=document.createElement('input');search.className='libsearch';search.type='search';search.placeholder='Search diagram: rectifier, motor, op-amp, LED...';box.appendChild(search);
    var section=document.createElement('div');section.className='libsection';section.textContent='Built-in diagrams';box.appendChild(section);
    var grid=document.createElement('div');grid.className='libgrid';box.appendChild(grid);
    var up=document.createElement('div');up.className='libsection';up.textContent='Custom reference diagrams';box.appendChild(up);
    var upload=document.createElement('div');upload.className='libupload';
    var label=document.createElement('label');label.textContent='＋ Upload PNG / JPG / WebP';var file=document.createElement('input');file.type='file';file.accept='image/png,image/jpeg,image/webp';label.appendChild(file);
    var clear=document.createElement('button');clear.type='button';clear.textContent='Clear uploads';var status=document.createElement('span');status.className='libstatus';
    upload.appendChild(label);upload.appendChild(clear);upload.appendChild(status);box.appendChild(upload);
    var customGrid=document.createElement('div');customGrid.className='libgrid';box.appendChild(customGrid);
    var note=document.createElement('div');note.className='libnote';note.textContent='Raster images only: PNG/JPG/WebP. SVG upload is intentionally blocked for safety. Custom references are view-only; built-in diagrams support the full Learn → Build → Simulate workflow.';box.appendChild(note);
    modal.appendChild(box);document.body.appendChild(modal);
    function renderBuiltins(filter){grid.innerHTML='';var f=String(filter||'').toLowerCase().trim();var shown=0;builtins.forEach(function(item){if(f&&item[0].toLowerCase().indexOf(f)<0&&item[2].toLowerCase().indexOf(f)<0&&item[1].toLowerCase().indexOf(f)<0)return;shown++;var c=document.createElement('button');c.type='button';c.className='libcard';c.innerHTML='<b>'+escapeHtml(item[0])+'</b><span>'+escapeHtml(item[2])+'</span>';c.onclick=function(){modal.remove();renderDiagram(item[1],item[0],!!fromAssistant);};grid.appendChild(c);});if(!shown){grid.innerHTML='<div style="grid-column:1/-1;font:11px Arial;color:#64748b;padding:10px">No matching diagram. Try a simpler keyword.</div>';}}
    function renderCustom(){customGrid.innerHTML='';if(!custom.length){customGrid.style.display='none';return;}customGrid.style.display='grid';custom.forEach(function(x){var c=document.createElement('button');c.type='button';c.className='libcard';c.innerHTML='<b>'+escapeHtml(x.name)+'</b><span>Custom reference • view only</span>';c.onclick=function(){var v=document.createElement('div');v.id='elab-v1022-custom-view';v.style.display='block';v.innerHTML='';var im=document.createElement('img');im.src=x.url;im.alt=x.name;v.appendChild(im);box.appendChild(v);v.scrollIntoView({behavior:'smooth',block:'center'});};customGrid.appendChild(c);});}
    search.addEventListener('input',function(){renderBuiltins(search.value);});
    clear.onclick=function(){custom=[];renderCustom();status.textContent='Uploads cleared for this session.';};
    file.addEventListener('change',function(){Array.prototype.forEach.call(file.files||[],function(f){if(!/^image\/(png|jpeg|webp)$/i.test(f.type)){status.textContent='Only PNG/JPG/WebP allowed.';return;}if(f.size>2*1024*1024){status.textContent='Max 2 MB per image.';return;}var r=new FileReader();r.onload=function(){custom.push({name:f.name,url:String(r.result)});renderCustom();status.textContent=custom.length+' custom diagram(s) loaded.';};r.readAsDataURL(f);});file.value='';});
    renderBuiltins('');renderCustom();modal.addEventListener('click',function(e){if(e.target===modal)modal.remove();});
  }
  function runChip(chip){
    if(opening)return;
    opening=true;
    try{
      var q=String(chip.getAttribute('data-sa-q')||'').trim();
      var label=String(chip.textContent||'').trim().toLowerCase();

      if(q === "__wiki_search__") {
        var webButton=document.getElementById("elab-sa-web");
        if(webButton){ webButton.click(); }
        else { var webInput=document.getElementById("elab-sa-input"); if(webInput) webInput.focus(); }
        return;
      }

      if(q === "__research_search__") {
        var researchButton=document.getElementById("elab-sa-research");
        if(researchButton){ researchButton.click(); }
        else { var researchInput=document.getElementById("elab-sa-input"); if(researchInput) researchInput.focus(); }
        return;
      }

      if(q === "__book_search__") {
        var bookButton=document.getElementById("elab-sa-books");
        if(bookButton){ bookButton.click(); }
        else { var bookInput=document.getElementById("elab-sa-input"); if(bookInput) bookInput.focus(); }
        return;
      }

      if(q === "__literature_search__") {
        var literatureButton=document.getElementById("elab-sa-literature");
        if(literatureButton){ literatureButton.click(); }
        else { var literatureInput=document.getElementById("elab-sa-input"); if(literatureInput) literatureInput.focus(); }
        return;
      }

      /* One authoritative quick-action router. The selected visible actions are
         routed directly to the existing NilSparkLab feature engines; no
         second click listener or duplicate feature implementation is used. */
      if(label.indexOf('diagram')>=0){
        openGallery(true);
        return;
      }

      if(label.indexOf("ohm's law")>=0 || /^ohm\s*law$/i.test(q)){
        runAssistant('ohm law');
        return;
      }

      if(label.indexOf('quiz')>=0 || /quiz\s*start/i.test(q)){
        /* Use the existing full Quiz UI/engine, not the text-only Assistant
           quiz state. Reset only the existing quiz session and render its
           first question. */
        try{
          if(typeof window.showSection==='function') window.showSection('quiz');
          if(typeof window.currentQuizIndex!=='undefined') window.currentQuizIndex=0;
          if(typeof window.quizScore!=='undefined') window.quizScore=0;
          if(typeof window.renderQuizQuestion==='function') window.renderQuizQuestion();
          else if(typeof window.startQuiz==='function') window.startQuiz();
          else throw new Error('Quiz engine is unavailable');
        }catch(err){
          console.error('NilSparkLab Quick Action — Quiz:',err);
          runAssistant('quiz start');
        }
        return;
      }

      if(label.indexOf('numerical')>=0 || /numerical/i.test(q)){
        runAssistant('ohm law numerical');
        return;
      }

      if(label.indexOf('simulate')>=0 || /simulate/i.test(q)){
        try{
          if(typeof window.showSection==='function') window.showSection('builder');
          var state=window.NilSparkLabBuilderState;
          var hasCircuit=!!(state && Array.isArray(state.components) && state.components.length);
          if(typeof window.runBuilderSim==='function' && hasCircuit){
            window.runBuilderSim();
          }else if(hasCircuit && typeof window.runBuilderSimulation==='function'){
            window.runBuilderSimulation();
          }else{
            runAssistant('simulate circuit');
          }
        }catch(err){
          console.error('NilSparkLab Quick Action — Simulate:',err);
          runAssistant('simulate circuit');
        }
        return;
      }

      /* Defensive fallback for a future visible action. */
      runAssistant(q);
    }catch(err){
      console.error('NilSparkLab Quick Action:',err);
      runAssistant('help');
    }finally{
      opening=false;
    }
  }
  /* Replace the v10.21 delegated router so this version remains the single click authority. */
  function capture(e){var chip=e.target&&e.target.closest?e.target.closest('#elab-sa-chips [data-sa-q]'):null;if(!chip)return;if(e.defaultPrevented)return;e.preventDefault();if(e.stopImmediatePropagation)e.stopImmediatePropagation();e.stopPropagation();runChip(chip);}
  document.addEventListener('click',capture,true);
  window.NilSparkLabInteractionRepairV1022=Object.freeze({version:'10.23',openDiagramLibrary:openGallery,openDiagram:renderDiagram,runChip:runChip});
})();
